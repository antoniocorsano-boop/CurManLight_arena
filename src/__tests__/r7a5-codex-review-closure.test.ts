import { describe, expect, it } from 'vitest';
import sql from '../../supabase/migrations/20260902063000_r7a5_codex_review_closure.sql?raw';

describe('R7A5 Codex review closure', () => {
  it('rejects non-canonical JSON lexical serializations before fingerprinting', () => {
    expect(sql).toContain('canonical_shared_revision_proposal_payload_v1');
    expect(sql).toContain("p_canonical_payload <> v_canonical");
    expect(sql).toContain('NON_CANONICAL_PAYLOAD_SERIALIZATION');
    expect(sql.indexOf('NON_CANONICAL_PAYLOAD_SERIALIZATION')).toBeLessThan(sql.indexOf("v_digest := encode(digest(convert_to(p_canonical_payload,'UTF8'),'sha256'),'hex')"));
  });

  it('fails closed when fresh active membership is absent', () => {
    expect(sql.match(/if v_role is null then raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED'/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it('uses JavaScript-equivalent trim characters for authority strings', () => {
    expect(sql).toContain('is_shared_proposal_js_trimmed_v1');
    expect(sql).toContain('chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(32)||chr(160)||chr(5760)');
    expect(sql).toContain('chr(8232)||chr(8233)||chr(8239)');
    expect(sql).toContain('chr(12288)||chr(65279)');
  });

  it('distinguishes null expected head from non-null values in idempotency', () => {
    expect(sql).toContain("case when p_expected_current_proposal_version_ref is null then '<NULL>' else '<VALUE>'||p_expected_current_proposal_version_ref end");
    expect(sql).toContain('INVALID_EXPECTED_SHARED_PROPOSAL_HEAD');
  });

  it('binds mutations and reads to the WorkspaceActorContext principal', () => {
    expect(sql.match(/WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH/g)?.length).toBeGreaterThanOrEqual(4);
    expect(sql).toContain('get_current_shared_revision_proposal_version_v1');
    expect(sql).toContain('get_shared_revision_proposal_version_v1');
    expect(sql).toContain('p_expected_context_user_id uuid');
  });
});
