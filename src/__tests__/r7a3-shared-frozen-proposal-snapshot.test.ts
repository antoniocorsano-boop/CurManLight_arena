import { describe, expect, it } from 'vitest';
import sql from '../../supabase/migrations/20260901100000_r7a3_shared_frozen_proposal_snapshot.sql?raw';

describe('R7A3 shared frozen proposal snapshot invariants', () => {
  it('forbids direct authenticated mutation of frozen snapshots', () => {
    expect(sql).toContain('revoke insert, update, delete on public.institutional_revision_proposal_snapshots from authenticated');
    expect(sql).toContain('security definer');
    expect(sql).toContain("v_role is distinct from 'collegio'");
    expect(sql).toContain('REVISION_DECIDE_REQUIRED');
  });

  it('allows snapshot reads only for active membership in an active workspace', () => {
    expect(sql).toContain('join public.workspaces workspace on workspace.id = membership.workspace_id');
    expect(sql).toContain("membership.status = 'active'");
    expect(sql).toContain("workspace.status = 'active'");
  });

  it('requires the complete canonical fingerprint payload shape before freezing', () => {
    expect(sql).toContain("'currentTextSnapshot','proposedText','rationale'");
    expect(sql).toContain("'sourceRefs','evidenceRefs','createdAt','structuralFootprint'");
    expect(sql).toContain('v_json ?& v_required_keys');
    expect(sql).toContain('jsonb_object_keys(v_json)');
    expect(sql).toContain("jsonb_typeof(v_json->'sourceRefs') <> 'array'");
    expect(sql).toContain("jsonb_typeof(v_json->'evidenceRefs') <> 'array'");
    expect(sql).toContain("jsonb_typeof(v_ref->'id') <> 'string'");
    expect(sql).toContain("jsonb_typeof(v_ref->'entityType') <> 'string'");
    expect(sql).toContain('FROZEN_PROPOSAL_SNAPSHOT_CANONICAL_SHAPE_REQUIRED');
  });

  it('keeps structuralFootprint required and typed while allowing the domain-supported empty string', () => {
    expect(sql).toContain("'sourceRefs','evidenceRefs','createdAt','structuralFootprint','frozen'");
    expect(sql).toContain("jsonb_typeof(v_json->'structuralFootprint') <> 'string'");
    expect(sql).not.toContain("nullif(trim(v_json->>'structuralFootprint'), '') is null");
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

  it('preserves deployed R7A2 v2 clients while versioning the R7A3 decision path', () => {
    expect(sql).toContain('proposal_snapshot_version smallint');
    expect(sql).toContain('record_institutional_revision_decision_v3');
    expect(sql).toContain('v_existing.proposal_snapshot_version is distinct from 1');
    expect(sql).toContain('1, 2, trim(p_target_node_ref)');
    expect(sql).toContain('R7A2 v2 RPC remains available for rollout compatibility');
    expect(sql).not.toContain('before insert on public.institutional_revision_decisions');
  });

  it('requires a matching frozen snapshot inside the versioned v3 decision RPC', () => {
    expect(sql).toContain('FROZEN_PROPOSAL_SNAPSHOT_REQUIRED');
    expect(sql).toContain('snapshot.proposal_version_fingerprint = lower(p_proposal_version_fingerprint)');
    expect(sql).toContain('snapshot.proposal_version_ref = trim(p_proposal_version_ref)');
  });

  it('does not assign canonical adoption authority or mutate the canonical curriculum', () => {
    expect(sql).not.toContain('CURRICULUM_ADOPT');
    expect(sql).not.toContain('canonical_curriculum');
  });
});
