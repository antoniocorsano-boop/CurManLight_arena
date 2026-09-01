import { describe, expect, it } from 'vitest';
import sql from '../../supabase/migrations/20260901100000_r7a3_shared_frozen_proposal_snapshot.sql?raw';

describe('R7A3 shared frozen proposal snapshot invariants', () => {
  it('forbids direct authenticated mutation of frozen snapshots', () => {
    expect(sql).toContain('revoke insert, update, delete on public.institutional_revision_proposal_snapshots from authenticated');
    expect(sql).toContain('security definer');
    expect(sql).toContain("v_role is distinct from 'collegio'");
    expect(sql).toContain('REVISION_DECIDE_REQUIRED');
  });

  it('recomputes SHA-256 server-side over the exact submitted UTF-8 payload', () => {
    expect(sql).toContain("digest(convert_to(p_snapshot_payload, 'UTF8'), 'sha256')");
    expect(sql).toContain('FROZEN_PROPOSAL_SNAPSHOT_FINGERPRINT_MISMATCH');
    expect(sql).toContain("v_json->>'id' is distinct from trim(p_proposal_version_ref)");
    expect(sql).toContain("v_json->>'proposalRef' is distinct from trim(p_proposal_ref)");
  });

  it('makes repeated freezing idempotent only for the identical immutable snapshot', () => {
    expect(sql).toContain('pg_advisory_xact_lock');
    expect(sql).toContain('v_existing.snapshot_payload <> p_snapshot_payload');
    expect(sql).toContain('FROZEN_PROPOSAL_SNAPSHOT_IMMUTABILITY_VIOLATION');
    expect(sql).toContain('unique (workspace_id, proposal_version_ref)');
  });

  it('blocks every new v2 decision that lacks a matching server snapshot', () => {
    expect(sql).toContain('institutional_revision_decisions_require_frozen_snapshot');
    expect(sql).toContain('before insert on public.institutional_revision_decisions');
    expect(sql).toContain('new.adoption_binding_version = 2');
    expect(sql).toContain('snapshot.proposal_version_fingerprint = new.proposal_version_fingerprint');
    expect(sql).toContain('FROZEN_PROPOSAL_SNAPSHOT_REQUIRED');
  });

  it('does not assign canonical adoption authority or mutate the canonical curriculum', () => {
    expect(sql).not.toContain('CURRICULUM_ADOPT');
    expect(sql).not.toContain('canonical_curriculum');
  });
});
