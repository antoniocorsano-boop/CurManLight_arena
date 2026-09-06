import { describe, expect, it } from 'vitest';
import { TECHNOLOGY_CLASS1_REVIEW_PROPOSALS } from '../domain/curriculum/validation/technologyClass1Review';
import { fingerprintTeamReviewProposal } from '../domain/revision/teamReview';
import preflightSource from '../../supabase/migrations/20260906094400_team_review_operational_scope_preflight.sql?raw';
import migrationSource from '../../supabase/migrations/20260906094500_team_review_operational_scope.sql?raw';
import provenanceCorrectionSource from '../../supabase/migrations/20260906101500_team_review_legacy_authority_provenance.sql?raw';

const scope = {
  academicYear: '2026/2027',
  order: 'secondaria' as const,
  groupCode: 'S-G02' as const,
  discipline: 'tecnologia',
};

const expectedScopedFingerprints: Record<string, string> = {
  'tec-sec1-2026-r2-n1': '48a7c6bb5f4d6aa6a541489de54e2ee3bae08117eb35518714291f9f33210e0e',
  'tec-sec1-2026-r2-n2': '1fa4ce024884329c32d78a16ffdc5f28573627683ad038b0cfb3bb793a22d8a9',
  'tec-sec1-2026-r2-n3': '0a4fc3fd15bc6a05299d660a9cf6f13d9fb38154b47053c8de6ca556d0b84a16',
  'tec-sec1-2026-r2-n4': '40edc8e1d3f7c0464db54545a5c12d74b7059e01a6c7489676398173d6ee204e',
  'tec-sec1-2026-r2-verticalita': '9c626a358ff3f718db84c1fb4d76170b69272a4b086382b2106124e0bc43543c',
};

const expectedLegacyFingerprints: Record<string, string> = {
  'tec-sec1-2026-r2-n1': '13440266d7439e96c56ad44bd723a3017e8bcbc222db5495c3965627de96d8cd',
  'tec-sec1-2026-r2-n2': 'f8c55c86063251b85ea4e6fdcca405d65b79f296d7306c5121337c2aa4403194',
  'tec-sec1-2026-r2-n3': '9916b4c92139d194ac480409c57f9fb2d0c1bd1c97699a4383069a79dad101e5',
  'tec-sec1-2026-r2-n4': '5a553d6ac03fa839a00b8470e398a01b437e22b72fc8cc2cb8f6f7296861ae0f',
  'tec-sec1-2026-r2-verticalita': 'a405b4a454748509c258e155230103f9c42e607ab588cac14092d416803e331b',
};

const legacyFingerprint = async (input: {
  proposalRef: string;
  focus: string;
  oldText: string;
  newText: string;
}): Promise<string> => {
  const canonical = JSON.stringify({
    proposalRef: input.proposalRef,
    focus: input.focus.trim(),
    oldText: input.oldText.trim(),
    newText: input.newText.trim(),
  });
  const bytes = new TextEncoder().encode(canonical);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const legacyContinuityBlock = (): string => {
  const start = migrationSource.indexOf('-- 4. Deterministic continuity of known pre-scope Beta evidence');
  const end = migrationSource.indexOf('-- 5. Scoped contribution API and privacy-minimal denominator');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return migrationSource.slice(start, end);
};

describe('Arena legacy team-review scope backfill', () => {
  it('proves that every stored legacy Technology fingerprint belongs to the unchanged R2 proposal text', async () => {
    for (const proposal of TECHNOLOGY_CLASS1_REVIEW_PROPOSALS) {
      const actual = await legacyFingerprint({
        proposalRef: proposal.id,
        focus: proposal.focus,
        oldText: proposal.oldText,
        newText: proposal.newText,
      });
      expect(actual).toBe(expectedLegacyFingerprints[proposal.id]);
      expect(preflightSource).toContain(actual);
      expect(migrationSource).toContain(actual);
      expect(provenanceCorrectionSource).toContain(actual);
    }
  });

  it('rekeys current contributions to the exact scoped fingerprint used by #201', async () => {
    for (const proposal of TECHNOLOGY_CLASS1_REVIEW_PROPOSALS) {
      const actual = await fingerprintTeamReviewProposal({
        ...scope,
        proposalRef: proposal.id,
        focus: proposal.focus,
        oldText: proposal.oldText,
        newText: proposal.newText,
      });
      expect(actual).toBe(expectedScopedFingerprints[proposal.id]);
      expect(preflightSource).toContain(actual);
      expect(migrationSource).toContain(actual);
    }
  });

  it('does not fabricate an operational membership or coordinator role for pre-scope outcomes', () => {
    const block = legacyContinuityBlock();
    expect(block).not.toContain('insert into public.team_operational_memberships');
    expect(provenanceCorrectionSource).toContain("authority_state = 'PRE_SCOPE_LEGACY'");
    expect(provenanceCorrectionSource).toContain('recorded_by_operational_role = null');
    expect(provenanceCorrectionSource).toContain('v_actor_operational_role');
    expect(provenanceCorrectionSource).toContain('operational.member_role = new.recorded_by_operational_role');
  });

  it('restores the original pre-scope outcome fingerprints so they cannot close the current #201 gate', () => {
    for (const fingerprint of Object.values(expectedLegacyFingerprints)) {
      expect(provenanceCorrectionSource).toContain(fingerprint);
    }
    expect(provenanceCorrectionSource).toContain('These five rows were recorded by a verified workspace Dipartimento role before');
  });

  it('scopes legacy Italian contributions without promoting their legacy fingerprint', () => {
    expect(migrationSource).toContain("where proposal_ref in ('it-sec-1','it-sec-2')");
    expect(migrationSource).toContain("group_code = 'S-G01'");
    expect(migrationSource).toContain("discipline = 'italiano'");
    expect(migrationSource).toContain('old fingerprint is deliberately NOT promoted');
  });

  it('fails closed on mismatched proposal-specific legacy evidence before the atomic mutation', () => {
    expect(preflightSource).toContain('LEGACY_TECHNOLOGY_CONTRIBUTION_FINGERPRINT_MISMATCH');
    expect(preflightSource).toContain('LEGACY_TECHNOLOGY_OUTCOME_FINGERPRINT_MISMATCH');
    expect(preflightSource).toContain('LEGACY_TECHNOLOGY_OUTCOME_AUTHORITY_MISMATCH');
    expect(preflightSource).toContain('join expected e on e.proposal_ref = c.proposal_ref');
    expect(preflightSource).toContain('join expected e on e.proposal_ref = o.proposal_ref');
    expect(migrationSource).toContain('LEGACY_TEAM_REVIEW_OUTCOME_SCOPE_BACKFILL_INCOMPLETE');
  });
});
