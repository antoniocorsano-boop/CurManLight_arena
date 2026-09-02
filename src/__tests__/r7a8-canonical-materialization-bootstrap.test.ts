import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.resolve(
  process.cwd(),
  'supabase/migrations/20260902090000_r7a8_canonical_materialization_bootstrap.sql',
);
const migration = fs.readFileSync(migrationPath, 'utf8');

describe('R7A8 canonical materialization + bootstrap authority', () => {
  it('creates an immutable server-side materialization authority', () => {
    expect(migration).toContain('create table if not exists public.shared_canonical_materializations');
    expect(migration).toContain("materialization_kind text not null check (materialization_kind in ('GENESIS','CANDIDATE'))");
    expect(migration).toContain('payload_text text not null');
    expect(migration).toContain("payload_fingerprint text not null check (payload_fingerprint ~ '^[a-f0-9]{64}$')");
    expect(migration).toContain('CANONICAL_MATERIALIZATION_IMMUTABLE');
    expect(migration).toContain('before update or delete on public.shared_canonical_materializations');
    expect(migration).toContain('revoke insert, update, delete on public.shared_canonical_materializations from authenticated');
  });

  it('keeps genesis bootstrap one-time and WORKSPACE_ADMIN-bound', () => {
    expect(migration).toContain('bootstrap_shared_canonical_curriculum_v1');
    expect(migration).toContain("v_role is distinct from 'amministratore'");
    expect(migration).toContain('WORKSPACE_ADMIN_REQUIRED');
    expect(migration).toContain('CANONICAL_HEAD_ALREADY_EXISTS');
    expect(migration).toContain('CANONICAL_BOOTSTRAP_REQUIRES_EMPTY_REGISTRY');
    expect(migration).toContain("'bootstrapAuthorityVersion', 1");
  });

  it('binds candidate preparation to current R7A6 decision and current canonical head', () => {
    expect(migration).toContain('prepare_shared_canonical_candidate_v1');
    expect(migration).toContain("v_role is distinct from 'dirigente'");
    expect(migration).toContain('CURRICULUM_ADOPT_REQUIRED');
    expect(migration).toContain('AUTHORITATIVE_CANONICAL_HEAD_REQUIRED');
    expect(migration).toContain('v_decision.shared_proposal_authority_version is distinct from 1');
    expect(migration).toContain("v_decision.outcome not in ('approve','approve-with-changes')");
    expect(migration).toContain('CURRENT_FINAL_DECISION_REQUIRED');
    expect(migration).toContain('v_decision.adoption_base_curriculum_version_ref is distinct from v_head.canonical_version_ref');
    expect(migration).toContain("'materializationAuthorityVersion', 1");
  });

  it('hashes exact UTF-8 payload bytes and rejects schema/binding drift', () => {
    expect(migration).toContain("digest(convert_to(p_materialization_payload_text, 'UTF8'), 'sha256')");
    expect(migration).toContain('CANONICAL_MATERIALIZATION_FINGERPRINT_MISMATCH');
    expect(migration).toContain('INVALID_CANONICAL_MATERIALIZATION_SCHEMA');
    expect(migration).toContain("v_payload->>'kind' <> 'GENESIS'");
    expect(migration).toContain("v_payload->>'kind' <> 'CANDIDATE'");
    expect(migration).toContain("v_payload->>'proposalVersionFingerprint' <> v_decision.proposal_version_fingerprint");
  });

  it('prepares but does not activate the candidate', () => {
    expect(migration).toContain("p_candidate_canonical_version_ref, 'PREPARED'");
    expect(migration).not.toContain("p_candidate_canonical_version_ref, 'ACTIVE'");
    expect(migration).not.toContain('insert into public.canonical_adoption_receipts');
  });
});
