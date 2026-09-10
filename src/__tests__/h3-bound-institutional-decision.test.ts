import { describe, expect, it } from 'vitest';
import { resolveCapabilityAccess } from '../domain/institution/capabilities';
import migration from '../../supabase/migrations/20260910130000_h3_bound_institutional_decision.sql?raw';
import performanceMigration from '../../supabase/migrations/20260910130500_h3_bound_institutional_decision_performance_hardening.sql?raw';

describe('H4 institutional decision bound to H3 handoff', () => {
  it('keeps REVISION_DECIDE exclusive to an authenticated Collegio actor', () => {
    expect(resolveCapabilityAccess('collegio', 'REVISION_DECIDE', 'authenticated-workspace').allowed).toBe(true);
    expect(resolveCapabilityAccess('collegio', 'REVISION_DECIDE', 'self-declared').allowed).toBe(false);
    expect(resolveCapabilityAccess('dipartimento', 'REVISION_DECIDE', 'authenticated-workspace').allowed).toBe(false);
    expect(resolveCapabilityAccess('referente', 'REVISION_DECIDE', 'authenticated-workspace').allowed).toBe(false);
    expect(resolveCapabilityAccess('dirigente', 'REVISION_DECIDE', 'authenticated-workspace').allowed).toBe(false);
  });

  it('extends the existing institutional receipt instead of opening a parallel H4 table', () => {
    expect(migration).toContain('alter table public.institutional_revision_decisions');
    expect(migration).toContain("decision_basis text not null default 'LEGACY_PROPOSAL'");
    expect(migration).toContain("decision_basis = 'VERTICAL_REVIEW_HANDOFF'");
    expect(migration).toContain('vertical_review_handoff_id uuid references public.vertical_review_institutional_handoffs');
    expect(migration).toContain('vertical_review_outcome_id uuid references public.vertical_review_outcomes');
    expect(migration).not.toContain('create table if not exists public.h4_');
  });

  it('requires the exact authenticated principal, current H3 snapshot, current H2 sources and current H3', () => {
    expect(migration).toContain('record_h3_bound_institutional_decision_v1');
    expect(migration).toContain('p_expected_context_user_id <> v_user');
    expect(migration).toContain("v_role is distinct from 'collegio'");
    expect(migration).toContain('H3_HANDOFF_SNAPSHOT_MISMATCH');
    expect(migration).toContain('H4_STALE_H2_SOURCE');
    expect(migration).toContain('H4_H2_CONTINUATION_OPEN');
    expect(migration).toContain('H4_STALE_H3');
    expect(migration).toContain('INSTITUTIONAL_DECISION_ALREADY_FINAL');
  });

  it('binds H4 cryptographically to the H3 handoff without inventing proposal references', () => {
    expect(migration).toContain('CML_ARENA_H3_H4_BINDING_V1');
    expect(migration).toContain('vertical_review_binding_version');
    expect(migration).toContain('vertical_review_binding_fingerprint');
    expect(migration).toMatch(/values \(\s*p_workspace_id,\s*null,\s*null,\s*null,\s*'VERTICAL_REVIEW_HANDOFF'/s);
  });

  it('revokes every proposal-only institutional write path for authenticated clients', () => {
    expect(migration).toContain("p.proname in (");
    expect(migration).toContain("'record_institutional_revision_decision'");
    expect(migration).toContain("'record_institutional_revision_decision_v2'");
    expect(migration).toContain("'record_institutional_revision_decision_v3'");
    expect(migration).toContain("'record_institutional_revision_decision_v4'");
    expect(migration).toContain("revoke execute on function %s from authenticated");
  });

  it('records H4 only: no adoption, vigency, master promotion or H3/handoff mutation is performed', () => {
    expect(migration).toContain('insert into public.institutional_revision_decisions');
    expect(migration).not.toMatch(/insert\s+into\s+public\.(?:canonical_)?adoption/i);
    expect(migration).not.toMatch(/update\s+public\.vertical_review_outcomes/i);
    expect(migration).not.toMatch(/update\s+public\.vertical_review_institutional_handoffs/i);
    expect(migration).not.toMatch(/update\s+public\.[a-z0-9_]*curriculum[a-z0-9_]*\s+/i);
    expect(migration).not.toMatch(/insert\s+into\s+public\.[a-z0-9_]*adoption[a-z0-9_]*/i);
  });

  it('covers every new foreign-key path introduced by the H4 slice', () => {
    expect(migration).toContain('institutional_revision_decisions_vertical_outcome_idx');
    expect(migration).toContain('institutional_revision_decisions_decided_by_idx');
    expect(performanceMigration).toContain('institutional_revision_decisions_vertical_handoff_fk_idx');
  });
});
