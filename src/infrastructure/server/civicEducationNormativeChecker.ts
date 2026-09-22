/**
 * EC-01/Arena-F4 — trusted normative checker core.
 *
 * This module is runtime-neutral and intended for a trusted server worker.
 * It does not contain credentials and never trusts browser-provided source
 * fingerprints. Baselines are loaded from the server-only database plane.
 */

export type CivicNormativeAuthority = 'MIM' | 'NORMATTIVA' | 'GAZZETTA_UFFICIALE';
export type CivicNormativeConfirmationRole = 'referente' | 'collegio';

export const CIVIC_NORMATIVE_NORMALIZATION_VERSION = 'RAW_RESPONSE_BYTES_V1' as const;
export const CIVIC_NORMATIVE_MAX_SOURCE_BYTES = 20 * 1024 * 1024;

export interface CivicNormativeSourceBaseline {
  sourceKey: string;
  authority: CivicNormativeAuthority;
  title: string;
  url: string;
  normalizationVersion: typeof CIVIC_NORMATIVE_NORMALIZATION_VERSION;
  expectedSha256: string;
}

export interface CivicNormativeSourceObservation {
  sourceKey: string;
  authority: CivicNormativeAuthority;
  url: string;
  normalizationVersion: typeof CIVIC_NORMATIVE_NORMALIZATION_VERSION;
  sha256: string;
  byteLength: number;
}

export interface CivicNormativeVerificationSource {
  id: string;
  authority: CivicNormativeAuthority;
  title: string;
  url: string;
  checkedAt: string;
  outcome: 'unchanged';
}

export interface CivicNormativeVerificationSnapshot {
  automaticCheck: true;
  checkedAt: string;
  verifiedFrameworkVersion: string;
  sources: CivicNormativeVerificationSource[];
  result: 'no-relevant-change';
  humanConfirmedAt: string;
  humanConfirmedByRole: CivicNormativeConfirmationRole;
}

export interface CivicNormativeCheckScope {
  workspaceId: string;
  requestedByUserId: string;
  requestedByRole: CivicNormativeConfirmationRole;
  institutionId: string;
  frameworkId: string;
  frameworkVersionLabel: string;
}

export interface CivicNormativeBaselineLoader {
  loadActiveBaselines(): Promise<CivicNormativeSourceBaseline[]>;
}

export interface CivicNormativeReceiptRecorder {
  record(input: {
    scope: CivicNormativeCheckScope;
    verification: CivicNormativeVerificationSnapshot;
    observations: CivicNormativeSourceObservation[];
  }): Promise<{ id: string; normativeFingerprint: string }>;
}

export interface CivicNormativeFetchResponse {
  ok: boolean;
  status: number;
  url: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export type CivicNormativeFetcher = (
  url: string,
  init: { method: 'GET'; redirect: 'follow'; headers: Record<string, string> },
) => Promise<CivicNormativeFetchResponse>;

export type CivicNormativeCheckBlockedReason =
  | 'BASELINE_NOT_CONFIGURED'
  | 'BASELINE_INCOMPLETE'
  | 'BASELINE_INVALID'
  | 'FETCH_FAILED'
  | 'SOURCE_TOO_LARGE'
  | 'SOURCE_REDIRECTED_OFFICIAL_BOUNDARY'
  | 'SOURCE_DRIFT';

export type CivicNormativePreviewResult =
  | {
      status: 'verified';
      checkedAt: string;
      sources: CivicNormativeVerificationSource[];
      observations: CivicNormativeSourceObservation[];
    }
  | {
      status: 'blocked';
      reason: CivicNormativeCheckBlockedReason;
      sourceKey?: string;
      message: string;
    };

export type CivicNormativeConfirmationResult =
  | {
      status: 'recorded';
      verification: CivicNormativeVerificationSnapshot;
      observations: CivicNormativeSourceObservation[];
      receipt: { id: string; normativeFingerprint: string };
    }
  | {
      status: 'blocked';
      reason: CivicNormativeCheckBlockedReason;
      sourceKey?: string;
      message: string;
    };

const SHA256_HEX = /^[a-f0-9]{64}$/;

function officialAuthorityForUrl(url: string): CivicNormativeAuthority | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:') return null;

  const hostname = parsed.hostname.toLowerCase();
  const matches = (domain: string) => hostname === domain || hostname.endsWith(`.${domain}`);
  if (matches('mim.gov.it')) return 'MIM';
  if (matches('normattiva.it')) return 'NORMATTIVA';
  if (matches('gazzettaufficiale.it')) return 'GAZZETTA_UFFICIALE';
  return null;
}

export function isOfficialCivicNormativeSource(
  authority: CivicNormativeAuthority,
  url: string,
): boolean {
  return officialAuthorityForUrl(url) === authority;
}

function validateBaselines(
  baselines: CivicNormativeSourceBaseline[],
): { valid: true } | { valid: false; reason: CivicNormativeCheckBlockedReason; message: string } {
  if (baselines.length === 0) {
    return {
      valid: false,
      reason: 'BASELINE_NOT_CONFIGURED',
      message: 'Nessuna baseline normativa server-side è configurata.',
    };
  }

  const keys = new Set<string>();
  let hasMim = false;
  let hasLegal = false;

  for (const baseline of baselines) {
    if (
      !baseline.sourceKey.trim()
      || baseline.sourceKey !== baseline.sourceKey.trim()
      || !baseline.title.trim()
      || baseline.url !== baseline.url.trim()
      || baseline.normalizationVersion !== CIVIC_NORMATIVE_NORMALIZATION_VERSION
      || !SHA256_HEX.test(baseline.expectedSha256)
      || !isOfficialCivicNormativeSource(baseline.authority, baseline.url)
      || keys.has(baseline.sourceKey)
    ) {
      return {
        valid: false,
        reason: 'BASELINE_INVALID',
        message: `Baseline normativa non valida: ${baseline.sourceKey || '(senza chiave)'}.`,
      };
    }
    keys.add(baseline.sourceKey);
    if (baseline.authority === 'MIM') hasMim = true;
    if (baseline.authority === 'NORMATTIVA' || baseline.authority === 'GAZZETTA_UFFICIALE') {
      hasLegal = true;
    }
  }

  if (!hasMim || !hasLegal) {
    return {
      valid: false,
      reason: 'BASELINE_INCOMPLETE',
      message: 'La baseline deve includere almeno una fonte MIM e una fonte legislativa ufficiale.',
    };
  }

  return { valid: true };
}

async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map(value => value.toString(16).padStart(2, '0'))
    .join('');
}

async function fetchAndVerify(
  baselines: CivicNormativeSourceBaseline[],
  fetcher: CivicNormativeFetcher,
  checkedAt: string,
): Promise<CivicNormativePreviewResult> {
  const baselineValidation = validateBaselines(baselines);
  if (!baselineValidation.valid) {
    return {
      status: 'blocked',
      reason: baselineValidation.reason,
      message: baselineValidation.message,
    };
  }

  const sources: CivicNormativeVerificationSource[] = [];
  const observations: CivicNormativeSourceObservation[] = [];

  for (const baseline of baselines) {
    let response: CivicNormativeFetchResponse;
    try {
      response = await fetcher(baseline.url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          accept: 'application/pdf,text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
          'user-agent': 'CurManLight-Arena-EC01-NormativeChecker/1',
        },
      });
    } catch {
      return {
        status: 'blocked',
        reason: 'FETCH_FAILED',
        sourceKey: baseline.sourceKey,
        message: `Fonte ufficiale non raggiungibile: ${baseline.sourceKey}.`,
      };
    }

    if (!response.ok) {
      return {
        status: 'blocked',
        reason: 'FETCH_FAILED',
        sourceKey: baseline.sourceKey,
        message: `Fonte ufficiale non disponibile (HTTP ${response.status}): ${baseline.sourceKey}.`,
      };
    }

    if (!isOfficialCivicNormativeSource(baseline.authority, response.url)) {
      return {
        status: 'blocked',
        reason: 'SOURCE_REDIRECTED_OFFICIAL_BOUNDARY',
        sourceKey: baseline.sourceKey,
        message: `La fonte ${baseline.sourceKey} ha lasciato il dominio ufficiale previsto.`,
      };
    }

    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > CIVIC_NORMATIVE_MAX_SOURCE_BYTES) {
      return {
        status: 'blocked',
        reason: 'SOURCE_TOO_LARGE',
        sourceKey: baseline.sourceKey,
        message: `La fonte ${baseline.sourceKey} supera il limite di verifica.`,
      };
    }

    const fingerprint = await sha256Hex(bytes);
    const observation: CivicNormativeSourceObservation = {
      sourceKey: baseline.sourceKey,
      authority: baseline.authority,
      url: baseline.url,
      normalizationVersion: CIVIC_NORMATIVE_NORMALIZATION_VERSION,
      sha256: fingerprint,
      byteLength: bytes.byteLength,
    };

    if (fingerprint !== baseline.expectedSha256) {
      return {
        status: 'blocked',
        reason: 'SOURCE_DRIFT',
        sourceKey: baseline.sourceKey,
        message: `La fonte ${baseline.sourceKey} è cambiata rispetto alla baseline verificata.`,
      };
    }

    observations.push(observation);
    sources.push({
      id: baseline.sourceKey,
      authority: baseline.authority,
      title: baseline.title,
      url: baseline.url,
      checkedAt,
      outcome: 'unchanged',
    });
  }

  return { status: 'verified', checkedAt, sources, observations };
}

export async function previewTrustedCivicNormativeCheck(
  loader: CivicNormativeBaselineLoader,
  fetcher: CivicNormativeFetcher,
  now: () => Date = () => new Date(),
): Promise<CivicNormativePreviewResult> {
  const baselines = await loader.loadActiveBaselines();
  return fetchAndVerify(baselines, fetcher, now().toISOString());
}

/**
 * Called only after the human explicitly confirms the preview.
 * It deliberately performs a second source fetch to eliminate a stale-preview
 * time-of-check/time-of-use gap before recording the approval-enabling receipt.
 */
export async function confirmTrustedCivicNormativeCheck(
  scope: CivicNormativeCheckScope,
  loader: CivicNormativeBaselineLoader,
  recorder: CivicNormativeReceiptRecorder,
  fetcher: CivicNormativeFetcher,
  now: () => Date = () => new Date(),
): Promise<CivicNormativeConfirmationResult> {
  if (!['referente', 'collegio'].includes(scope.requestedByRole)) {
    throw new Error('CIVIC_NORMATIVE_CONFIRMATION_ROLE_REQUIRED');
  }

  const checkedAt = now().toISOString();
  const baselines = await loader.loadActiveBaselines();
  const verified = await fetchAndVerify(baselines, fetcher, checkedAt);
  if (verified.status === 'blocked') return verified;

  const humanConfirmedAt = now().toISOString();
  const verification: CivicNormativeVerificationSnapshot = {
    automaticCheck: true,
    checkedAt: verified.checkedAt,
    verifiedFrameworkVersion: scope.frameworkVersionLabel,
    sources: verified.sources,
    result: 'no-relevant-change',
    humanConfirmedAt,
    humanConfirmedByRole: scope.requestedByRole,
  };

  const receipt = await recorder.record({
    scope,
    verification,
    observations: verified.observations,
  });

  return {
    status: 'recorded',
    verification,
    observations: verified.observations,
    receipt,
  };
}
