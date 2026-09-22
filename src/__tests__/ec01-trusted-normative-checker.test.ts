import { describe, expect, it, vi } from 'vitest';
import migration from '../../supabase/migrations/20260922170000_ec01_trusted_normative_checker.sql?raw';
import edgeFunction from '../../supabase/functions/ec01-normative-check/index.ts?raw';
import productCiWorkflow from '../../.github/workflows/product-ci.yml?raw';
import {
  CIVIC_NORMATIVE_MAX_SOURCE_BYTES,
  CIVIC_NORMATIVE_NORMALIZATION_VERSION,
  confirmTrustedCivicNormativeCheck,
  isOfficialCivicNormativeSource,
  previewTrustedCivicNormativeCheck,
  readCivicNormativeResponseBytes,
  type CivicNormativeBaselineLoader,
  type CivicNormativeFetcher,
  type CivicNormativeReceiptRecorder,
  type CivicNormativeSourceBaseline,
} from '../infrastructure/server/civicEducationNormativeChecker';

const mimUrl = 'https://www.mim.gov.it/documents/example/dm183.pdf';
const normattivaUrl = 'https://www.normattiva.it/eli/stato/LEGGE/2019/08/20/92/CONSOLIDATED';

async function sha256Hex(text: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(digest)]
    .map(value => value.toString(16).padStart(2, '0'))
    .join('');
}

async function baselines(): Promise<CivicNormativeSourceBaseline[]> {
  return [
    {
      sourceKey: 'mim-dm183-2024',
      authority: 'MIM',
      title: 'D.M. 183/2024 e Linee guida Educazione civica',
      url: mimUrl,
      normalizationVersion: CIVIC_NORMATIVE_NORMALIZATION_VERSION,
      expectedSha256: await sha256Hex('mim-current'),
    },
    {
      sourceKey: 'normattiva-l92-2019',
      authority: 'NORMATTIVA',
      title: 'Legge 20 agosto 2019, n. 92',
      url: normattivaUrl,
      normalizationVersion: CIVIC_NORMATIVE_NORMALIZATION_VERSION,
      expectedSha256: await sha256Hex('law-current'),
    },
  ];
}

function loader(values: CivicNormativeSourceBaseline[]): CivicNormativeBaselineLoader {
  return { loadActiveBaselines: vi.fn().mockResolvedValue(values) };
}

function fetcher(
  bodies: Record<string, string>,
  options: { redirectedUrl?: Record<string, string>; fail?: string } = {},
): CivicNormativeFetcher {
  return vi.fn(async (url: string) => {
    if (options.fail === url) throw new Error('network');
    const text = bodies[url];
    return {
      ok: text !== undefined,
      status: text === undefined ? 404 : 200,
      url: options.redirectedUrl?.[url] ?? url,
      arrayBuffer: async () => new TextEncoder().encode(text ?? '').buffer,
    };
  });
}

const scope = {
  workspaceId: '11111111-1111-1111-1111-111111111111',
  requestedByUserId: '22222222-2222-2222-2222-222222222222',
  requestedByRole: 'referente' as const,
  institutionId: 'istituto-1',
  frameworkId: 'ec-secondaria-2026-v1',
  frameworkVersionLabel: '2026-27-v1',
  clientRequestId: 'confirm-ec-2026-27-v1-001',
};

describe('EC-01/Arena-F4 — trusted normative checker core', () => {
  it('accepts only official HTTPS authority/domain pairs', () => {
    expect(isOfficialCivicNormativeSource('MIM', mimUrl)).toBe(true);
    expect(isOfficialCivicNormativeSource('NORMATTIVA', normattivaUrl)).toBe(true);
    expect(isOfficialCivicNormativeSource('MIM', 'https://example.com/dm183.pdf')).toBe(false);
    expect(isOfficialCivicNormativeSource('NORMATTIVA', 'http://www.normattiva.it/example')).toBe(false);
  });

  it('fails closed when no server baseline is configured', async () => {
    const result = await previewTrustedCivicNormativeCheck(
      loader([]),
      fetcher({}),
      '2026-27-v1',
      () => new Date('2026-09-22T14:00:00Z'),
    );

    expect(result).toMatchObject({
      status: 'blocked',
      reason: 'BASELINE_NOT_CONFIGURED',
    });
  });

  it('verifies official sources only when raw-byte fingerprints match', async () => {
    const values = await baselines();
    const get = fetcher({
      [mimUrl]: 'mim-current',
      [normattivaUrl]: 'law-current',
    });

    const result = await previewTrustedCivicNormativeCheck(
      loader(values),
      get,
      '2026-27-v1',
      () => new Date('2026-09-22T14:00:00Z'),
    );

    expect(result.status).toBe('verified');
    if (result.status !== 'verified') return;
    expect(result.sources).toHaveLength(2);
    expect(result.observations).toHaveLength(2);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('blocks source drift and does not reinterpret it as irrelevant', async () => {
    const values = await baselines();
    const result = await previewTrustedCivicNormativeCheck(
      loader(values),
      fetcher({
        [mimUrl]: 'mim-changed',
        [normattivaUrl]: 'law-current',
      }),
      '2026-27-v1',
    );

    expect(result).toMatchObject({
      status: 'blocked',
      reason: 'SOURCE_DRIFT',
      sourceKey: 'mim-dm183-2024',
    });
  });

  it('blocks failed fetches and redirects outside the official authority boundary', async () => {
    const values = await baselines();

    const failed = await previewTrustedCivicNormativeCheck(
      loader(values),
      fetcher(
        { [mimUrl]: 'mim-current', [normattivaUrl]: 'law-current' },
        { fail: mimUrl },
      ),
      '2026-27-v1',
    );
    expect(failed).toMatchObject({ status: 'blocked', reason: 'FETCH_FAILED' });

    const redirected = await previewTrustedCivicNormativeCheck(
      loader(values),
      fetcher(
        { [mimUrl]: 'mim-current', [normattivaUrl]: 'law-current' },
        { redirectedUrl: { [mimUrl]: 'https://example.com/copied.pdf' } },
      ),
      '2026-27-v1',
    );
    expect(redirected).toMatchObject({
      status: 'blocked',
      reason: 'SOURCE_REDIRECTED_OFFICIAL_BOUNDARY',
    });
  });

  it('loads only the baseline set bound to the requested framework version', async () => {
    const values = await baselines();
    const loadActiveBaselines = vi.fn().mockResolvedValue(values);
    const result = await previewTrustedCivicNormativeCheck(
      { loadActiveBaselines },
      fetcher({ [mimUrl]: 'mim-current', [normattivaUrl]: 'law-current' }),
      '2026-27-v1',
    );

    expect(result.status).toBe('verified');
    expect(loadActiveBaselines).toHaveBeenCalledWith('2026-27-v1');
  });

  it('enforces the response-size cap before buffering and while streaming', async () => {
    const arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(0));
    const declaredTooLarge = await readCivicNormativeResponseBytes(
      {
        ok: true,
        status: 200,
        url: mimUrl,
        headers: { get: name => name.toLowerCase() === 'content-length'
          ? String(CIVIC_NORMATIVE_MAX_SOURCE_BYTES + 1)
          : null },
        arrayBuffer,
      },
      8,
    );
    expect(declaredTooLarge).toBeNull();
    expect(arrayBuffer).not.toHaveBeenCalled();

    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.enqueue(new Uint8Array([4, 5, 6]));
        controller.close();
      },
    });
    const streamedTooLarge = await readCivicNormativeResponseBytes(
      {
        ok: true,
        status: 200,
        url: mimUrl,
        body,
        arrayBuffer: vi.fn(),
      },
      5,
    );
    expect(streamedTooLarge).toBeNull();
  });

  it('performs a second fetch at human confirmation and records only the fresh result', async () => {
    const values = await baselines();
    const get = fetcher({
      [mimUrl]: 'mim-current',
      [normattivaUrl]: 'law-current',
    });
    const load = loader(values);

    const preview = await previewTrustedCivicNormativeCheck(
      load,
      get,
      '2026-27-v1',
      () => new Date('2026-09-22T14:00:00Z'),
    );
    expect(preview.status).toBe('verified');

    const record = vi.fn(async (input: Parameters<CivicNormativeReceiptRecorder['record']>[0]) => ({
      id: 'receipt-1',
      normativeFingerprint: 'a'.repeat(64),
      verificationSnapshot: input.verification,
      observations: input.observations,
    }));
    const recorder: CivicNormativeReceiptRecorder = {
      findExisting: vi.fn().mockResolvedValue(null),
      record,
    };
    const dates = [
      new Date('2026-09-22T14:01:00Z'),
      new Date('2026-09-22T14:01:01Z'),
    ];

    const confirmed = await confirmTrustedCivicNormativeCheck(
      scope,
      load,
      recorder,
      get,
      () => dates.shift() ?? new Date('2026-09-22T14:01:01Z'),
    );

    expect(confirmed.status).toBe('recorded');
    expect(get).toHaveBeenCalledTimes(4);
    expect(record).toHaveBeenCalledTimes(1);
    if (confirmed.status !== 'recorded') return;
    expect(confirmed.verification).toMatchObject({
      automaticCheck: true,
      checkedAt: '2026-09-22T14:01:00.000Z',
      humanConfirmedAt: '2026-09-22T14:01:01.000Z',
      humanConfirmedByRole: 'referente',
      result: 'no-relevant-change',
    });
  });

  it('returns an already committed receipt before loading baselines or fetching sources', async () => {
    const loadActiveBaselines = vi.fn();
    const get = vi.fn();
    const record = vi.fn();
    const existingVerification = {
      automaticCheck: true as const,
      checkedAt: '2026-09-22T14:01:00.000Z',
      verifiedFrameworkVersion: scope.frameworkVersionLabel,
      sources: [],
      result: 'no-relevant-change' as const,
      humanConfirmedAt: '2026-09-22T14:01:01.000Z',
      humanConfirmedByRole: scope.requestedByRole,
    };
    const result = await confirmTrustedCivicNormativeCheck(
      scope,
      { loadActiveBaselines },
      {
        findExisting: vi.fn().mockResolvedValue({
          id: 'receipt-existing',
          normativeFingerprint: 'b'.repeat(64),
          verificationSnapshot: existingVerification,
          observations: [],
        }),
        record,
      },
      get as unknown as CivicNormativeFetcher,
    );

    expect(result).toMatchObject({
      status: 'recorded',
      receipt: {
        id: 'receipt-existing',
        normativeFingerprint: 'b'.repeat(64),
      },
    });
    expect(loadActiveBaselines).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });

  it('does not record when a source drifts between preview and confirmation', async () => {
    const values = await baselines();
    let round = 0;
    const get: CivicNormativeFetcher = vi.fn(async (url: string) => {
      const isMim = url === mimUrl;
      const text = round < 2
        ? (isMim ? 'mim-current' : 'law-current')
        : (isMim ? 'mim-changed' : 'law-current');
      round += 1;
      return {
        ok: true,
        status: 200,
        url,
        arrayBuffer: async () => new TextEncoder().encode(text).buffer,
      };
    });

    const preview = await previewTrustedCivicNormativeCheck(loader(values), get, '2026-27-v1');
    expect(preview.status).toBe('verified');

    const record = vi.fn();
    const confirmed = await confirmTrustedCivicNormativeCheck(
      scope,
      loader(values),
      { findExisting: vi.fn().mockResolvedValue(null), record },
      get,
    );

    expect(confirmed).toMatchObject({ status: 'blocked', reason: 'SOURCE_DRIFT' });
    expect(record).not.toHaveBeenCalled();
  });
});

describe('EC-01/Arena-F4 — Edge CI contract', () => {
  it('runs a real Deno typecheck for the trusted Edge Function in Product CI', () => {
    expect(productCiWorkflow).toContain('uses: denoland/setup-deno@v2');
    expect(productCiWorkflow).toContain('deno-version: v2.x');
    expect(productCiWorkflow).toContain(
      'deno check --node-modules-dir=auto supabase/functions/ec01-normative-check/index.ts',
    );
  });
});

describe('EC-01/Arena-F4 — trusted server adapter contract', () => {
  it('keeps a complete request-validation shell in the Edge adapter', () => {
    expect(edgeFunction).toContain('function json(status: number, body: unknown): Response');
    expect(edgeFunction).toContain('function isRequestBody(value: unknown): value is RequestBody');
    expect(edgeFunction).toContain("body.mode === 'preview' || body.mode === 'confirm'");
    expect(edgeFunction).toContain("request.method !== 'POST'");
  });

  it('uses current Supabase server auth without reading privileged API keys manually', () => {
    expect(edgeFunction).toContain("withSupabase({ auth: 'user' }");
    expect(edgeFunction).toContain('ctx.userClaims?.id');
    expect(edgeFunction).toContain('ctx.supabaseAdmin');
    expect(edgeFunction).toContain(".eq('status', 'active')");
    expect(edgeFunction).toContain("role !== 'referente' && role !== 'collegio'");
    expect(edgeFunction).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(edgeFunction).not.toContain('SUPABASE_ANON_KEY');
    expect(edgeFunction).not.toContain('createClient(');
  });

  it('routes preview and confirmation through the trusted checker and server-only RPC', () => {
    expect(edgeFunction).toContain('previewTrustedCivicNormativeCheck(');
    expect(edgeFunction).toContain('body.frameworkVersionLabel');
    expect(edgeFunction).toContain('confirmTrustedCivicNormativeCheck(');
    expect(edgeFunction).toContain("'record_civic_education_normative_check_v1'");
    expect(edgeFunction).toContain("from('civic_education_normative_check_receipts')");
    expect(edgeFunction).toContain(".eq('client_request_id', scope.clientRequestId)");
    expect(edgeFunction).toContain('CIVIC_NORMATIVE_REQUEST_ID_REUSE_MISMATCH');
    expect(edgeFunction).toContain(".eq('framework_version_label', frameworkVersionLabel)");
    expect(edgeFunction).toContain('p_client_request_id: input.scope.clientRequestId');
    expect(edgeFunction).toContain('p_source_observations: input.observations');
    expect(edgeFunction).toContain('CIVIC_NORMATIVE_CLIENT_REQUEST_ID_REQUIRED');
    expect(edgeFunction).not.toContain('insert(');
  });
});

describe('EC-01/Arena-F4 — trusted normative SQL boundary', () => {
  it('creates server-controlled immutable baselines without seeding real fingerprints', () => {
    expect(migration).toContain('create table if not exists public.civic_education_normative_source_baselines');
    expect(migration).toContain('create table if not exists public.civic_education_normative_source_heads');
    expect(migration).toContain('CIVIC_NORMATIVE_BASELINE_IMMUTABLE');
    expect(migration).not.toMatch(/insert\s+into\s+public\.civic_education_normative_source_baselines/i);
    expect(migration).not.toMatch(/insert\s+into\s+public\.civic_education_normative_source_heads/i);
  });

  it('keeps baseline mutation closed to browser roles and permits the trusted server role', () => {
    expect(migration).toContain(
      'revoke all on public.civic_education_normative_source_baselines from public, anon, authenticated',
    );
    expect(migration).toContain(
      'revoke all on public.civic_education_normative_source_heads from public, anon, authenticated',
    );
    expect(migration).toContain(
      'grant select, insert on public.civic_education_normative_source_baselines to service_role',
    );
    expect(migration).toContain(
      'grant select, insert, update on public.civic_education_normative_source_heads to service_role',
    );
  });

  it('enforces official domains at database level', () => {
    expect(migration).toContain("authority = 'MIM'");
    expect(migration).toContain("mim\\.gov\\.it");
    expect(migration).toContain("authority = 'NORMATTIVA'");
    expect(migration).toContain("normattiva\\.it");
    expect(migration).toContain("authority = 'GAZZETTA_UFFICIALE'");
    expect(migration).toContain("gazzettaufficiale\\.it");
  });

  it('exposes receipt recording only to service_role and revalidates the human actor', () => {
    expect(migration).toContain("v_role not in ('referente','collegio')");
    expect(migration).toContain('from public.workspace_memberships membership');
    expect(migration).toContain(
      'grant execute on function public.record_civic_education_normative_check_v1',
    );
    expect(migration).toContain('to service_role;');
    expect(migration).toContain(
      ') from public, anon, authenticated;',
    );
    expect(migration).not.toContain('auth.role()');
  });

  it('binds the active baseline head set to the framework version being certified', () => {
    expect(migration).toContain('framework_version_label text not null');
    expect(migration).toContain('primary key (framework_version_label, source_key)');
    expect(migration).toContain(
      'where head.framework_version_label = p_framework_version_label',
    );
  });

  it('persists the confirming person and a stable retry identity in the immutable receipt', () => {
    expect(migration).toContain('confirmed_by_user_id uuid references auth.users(id)');
    expect(migration).toContain("confirmed_by_role in ('referente','collegio')");
    expect(migration).toContain('client_request_id text');
    expect(migration).toContain('confirmed_at timestamptz');
    expect(migration).toContain('source_observations jsonb');
    expect(migration).toContain(
      'civic_education_normative_check_receipts_request_idx',
    );
    expect(migration).toContain('p_requested_by_user_id');
    expect(migration).toContain('p_client_request_id');
  });

  it('keeps the migration structurally complete after hardening', () => {
    expect(migration).toContain(
      "check (baseline_set_fingerprint is null or baseline_set_fingerprint ~ '^[a-f0-9]{64}$');",
    );
    expect(migration).toContain(
      'create or replace function public.enforce_current_civic_normative_receipt_v1()',
    );
    expect(migration).toMatch(
      /create or replace function public\.enforce_current_civic_normative_receipt_v1\(\)[\s\S]*?as \$\$[\s\S]*?end;\s*\$\$;/,
    );
    expect(migration).toContain(
      'create unique index if not exists civic_education_normative_check_receipts_request_idx',
    );
  });

  it('serializes retry identity before the idempotency lookup', () => {
    const lockNeedle = "p_workspace_id::text || ':EC01-NORMATIVE-REQUEST:' || p_client_request_id";
    const lookupNeedle = 'where receipt.workspace_id = p_workspace_id';

    expect(migration).toContain('pg_advisory_xact_lock(hashtextextended(');
    expect(migration.indexOf(lockNeedle)).toBeGreaterThanOrEqual(0);
    expect(migration.indexOf(lookupNeedle)).toBeGreaterThan(migration.indexOf(lockNeedle));
  });

  it('binds receipts to the exact baseline head set and enforces freshness at final approval insert', () => {
    expect(migration).toContain('baseline_set_fingerprint text');
    expect(migration).toContain("head.source_key || ':' || head.baseline_id::text");
    expect(migration).toContain('v_baseline_set_fingerprint');
    expect(migration).toContain('create or replace function public.enforce_current_civic_normative_receipt_v1()');
    expect(migration).toContain('before insert on public.civic_education_approved_frameworks');
    expect(migration).toContain('receipt.baseline_set_fingerprint = v_current_baseline_set_fingerprint');
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_CURRENT_RECEIPT_REQUIRED'");
  });

  it('serializes retry identity before the idempotent receipt lookup', () => {
    const lock = migration.indexOf("pg_advisory_xact_lock(hashtextextended(");
    const lookup = migration.indexOf(
      "where receipt.workspace_id = p_workspace_id\n    and receipt.client_request_id = p_client_request_id",
    );
    expect(lock).toBeGreaterThan(-1);
    expect(lookup).toBeGreaterThan(lock);
    expect(migration).toContain("':EC01-NORMATIVE-CHECK:' || p_client_request_id");
  });

  it('keeps the F4 migration syntactically complete around the freshness trigger', () => {
    expect(migration).toContain("baseline_set_fingerprint ~ '^[a-f0-9]{64}
    expect(migration).toContain(
      'lock table public.civic_education_normative_source_heads in share mode',
    );
  });

  it('fails closed on missing baselines, set mismatch or source drift', () => {
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_BASELINE_NOT_CONFIGURED'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SOURCE_SET_MISMATCH'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SOURCE_BASELINE_MISSING'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SOURCE_DRIFT'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_BASELINE_INCOMPLETE'");
  });

  it('requires confirmation to follow the automatic check and uses retry-stable idempotency', () => {
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_CONFIRMATION_PRECEDES_CHECK'");
    expect(migration).toContain('receipt.client_request_id = p_client_request_id');
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_REQUEST_ID_REUSE_MISMATCH'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_REQUEST_RETRY_BASELINE_MISMATCH'");
    expect(migration).toContain('insert into public.civic_education_normative_check_receipts');
  });
});
");
    expect(migration).toContain('as $\\ndeclare');
    expect(migration).toContain('end;\\n$;\\n\\ndrop trigger');
    expect(migration).not.toContain('end;\\n$;');
    expect(migration).not.toContain("expected_sha256 ~ '^[a-f0-9]{64} if not exists");
  });

  it('serializes the retry identity before the idempotent receipt lookup', () => {
    const lock = migration.indexOf('pg_advisory_xact_lock(hashtextextended(');
    const lookup = migration.indexOf('receipt.client_request_id = p_client_request_id');
    expect(lock).toBeGreaterThan(-1);
    expect(lookup).toBeGreaterThan(-1);
    expect(lock).toBeLessThan(lookup);
    expect(migration).toContain("':EC01-NORMATIVE-CHECK:' || p_client_request_id");
  });

  it('locks the baseline head set while the trusted receipt is validated', () => {
    expect(migration).toContain(
      'lock table public.civic_education_normative_source_heads in share mode',
    );
  });

  it('fails closed on missing baselines, set mismatch or source drift', () => {
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_BASELINE_NOT_CONFIGURED'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SOURCE_SET_MISMATCH'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SOURCE_BASELINE_MISSING'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SOURCE_DRIFT'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_BASELINE_INCOMPLETE'");
  });

  it('requires confirmation to follow the automatic check and uses retry-stable idempotency', () => {
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_CONFIRMATION_PRECEDES_CHECK'");
    expect(migration).toContain('receipt.client_request_id = p_client_request_id');
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_REQUEST_ID_REUSE_MISMATCH'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_REQUEST_RETRY_BASELINE_MISMATCH'");
    expect(migration).toContain('insert into public.civic_education_normative_check_receipts');
  });
});
