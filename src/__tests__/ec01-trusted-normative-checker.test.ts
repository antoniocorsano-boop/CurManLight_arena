import { describe, expect, it, vi } from 'vitest';
import migration from '../../supabase/migrations/20260922170000_ec01_trusted_normative_checker.sql?raw';
import {
  CIVIC_NORMATIVE_NORMALIZATION_VERSION,
  confirmTrustedCivicNormativeCheck,
  isOfficialCivicNormativeSource,
  previewTrustedCivicNormativeCheck,
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
    );
    expect(failed).toMatchObject({ status: 'blocked', reason: 'FETCH_FAILED' });

    const redirected = await previewTrustedCivicNormativeCheck(
      loader(values),
      fetcher(
        { [mimUrl]: 'mim-current', [normattivaUrl]: 'law-current' },
        { redirectedUrl: { [mimUrl]: 'https://example.com/copied.pdf' } },
      ),
    );
    expect(redirected).toMatchObject({
      status: 'blocked',
      reason: 'SOURCE_REDIRECTED_OFFICIAL_BOUNDARY',
    });
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
      () => new Date('2026-09-22T14:00:00Z'),
    );
    expect(preview.status).toBe('verified');

    const record = vi.fn().mockResolvedValue({
      id: 'receipt-1',
      normativeFingerprint: 'a'.repeat(64),
    });
    const recorder: CivicNormativeReceiptRecorder = { record };
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

    const preview = await previewTrustedCivicNormativeCheck(loader(values), get);
    expect(preview.status).toBe('verified');

    const record = vi.fn();
    const confirmed = await confirmTrustedCivicNormativeCheck(
      scope,
      loader(values),
      { record },
      get,
    );

    expect(confirmed).toMatchObject({ status: 'blocked', reason: 'SOURCE_DRIFT' });
    expect(record).not.toHaveBeenCalled();
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
    expect(migration).toContain("coalesce(auth.role(), '') <> 'service_role'");
    expect(migration).toContain("v_role not in ('referente','collegio')");
    expect(migration).toContain('from public.workspace_memberships membership');
    expect(migration).toContain(
      'grant execute on function public.record_civic_education_normative_check_v1',
    );
    expect(migration).toContain('to service_role;');
    expect(migration).toContain(
      ') from public, anon, authenticated;',
    );
  });

  it('fails closed on missing baselines, set mismatch or source drift', () => {
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_BASELINE_NOT_CONFIGURED'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SOURCE_SET_MISMATCH'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SOURCE_BASELINE_MISSING'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SOURCE_DRIFT'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_BASELINE_INCOMPLETE'");
  });

  it('requires confirmation to follow the automatic check and records idempotently', () => {
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_CONFIRMATION_PRECEDES_CHECK'");
    expect(migration).toContain('v_existing.verification_snapshot <> p_verification_snapshot');
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_RECEIPT_IDEMPOTENCY_MISMATCH'");
    expect(migration).toContain('insert into public.civic_education_normative_check_receipts');
  });
});
