import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sql = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260901090000_r7a2_adoption_binding_v2.sql'), 'utf8');

describe('R7A2 adoption binding migration invariants', () => {
  it('keeps the v2 decision write behind authenticated server authority', () => {
    expect(sql).toContain('security definer');
    expect(sql).toContain('auth.uid()');
    expect(sql).toContain("v_role is distinct from 'collegio'");
    expect(sql).toContain("raise exception 'REVISION_DECIDE_REQUIRED'");
    expect(sql).toContain('membership.status = \'active\'');
    expect(sql).toContain('workspace.status = \'active\'');
  });

  it('computes the adoption binding server-side from the complete v2 material', () => {
    expect(sql).toContain('CML_ARENA_ADOPTION_BINDING_V2');
    expect(sql).toContain('chr(31)');
    expect(sql).toContain('p_target_node_ref');
    expect(sql).toContain('p_base_curriculum_version_ref');
    expect(sql).toContain("digest(convert_to(v_binding_material, 'UTF8'), 'sha256')");
  });

  it('preserves idempotency and serialized final-decision semantics', () => {
    expect(sql).toContain('client_request_id = p_client_request_id');
    expect(sql).toContain('CLIENT_REQUEST_ID_REUSE_MISMATCH');
    expect(sql).toContain('pg_advisory_xact_lock');
    expect(sql).toContain('PROPOSAL_VERSION_FINGERPRINT_MISMATCH');
    expect(sql).toContain('ADOPTION_BINDING_MISMATCH');
    expect(sql).toContain('INSTITUTIONAL_DECISION_ALREADY_FINAL');
  });

  it('keeps direct authority at the RPC boundary', () => {
    expect(sql).toContain('revoke all on function public.record_institutional_revision_decision_v2');
    expect(sql).toContain('grant execute on function public.record_institutional_revision_decision_v2');
  });
});
