import { describe, expect, it } from 'vitest';
import migration from '../../supabase/migrations/20260910150000_h4_canonical_adoption_handoff.sql?raw';
import performanceMigration from '../../supabase/migrations/20260910150500_h4_canonical_adoption_handoff_performance.sql?raw';
import panel from '../features/beta/H4CanonicalAdoptionHandoffPanel.tsx?raw';
import { isH4OutcomeEligibleForAdoptionHandoff } from '../domain/revision/h4CanonicalAdoptionHandoff';

describe('H4 to canonical adoption handoff', () => {
  it('admits only approving H4 outcomes to the adoption handoff', () => {
    expect(isH4OutcomeEligibleForAdoptionHandoff('approve')).toBe(true);
    expect(isH4OutcomeEligibleForAdoptionHandoff('approve-with-changes')).toBe(true);
    expect(isH4OutcomeEligibleForAdoptionHandoff('reject')).toBe(false);
    expect(isH4OutcomeEligibleForAdoptionHandoff('defer')).toBe(false);
    expect(isH4OutcomeEligibleForAdoptionHandoff('return-for-revision')).toBe(false);
  });

  it('creates an immutable H4-bound handoff, not a second adoption registry', () => {
    expect(migration).toContain('create table if not exists public.h4_canonical_adoption_handoffs');
    expect(migration).toContain('institutional_decision_id uuid not null references public.institutional_revision_decisions');
    expect(migration).toContain("adoption_state text not null default 'READY_FOR_ADOPTION_REVIEW'");
    expect(migration).toContain("required_adoption_role text not null default 'dirigente'");
    expect(migration).toContain('H4_ADOPTION_HANDOFF_IMMUTABLE');
    expect(migration).not.toContain('create table if not exists public.canonical_adoption_receipts');
  });

  it('revalidates the current H4, H3 and H2 chain before preparing adoption', () => {
    expect(migration).toContain('prepare_h4_canonical_adoption_handoff_v1');
    expect(migration).toContain("v_decision.decision_basis <> 'VERTICAL_REVIEW_HANDOFF'");
    expect(migration).toContain("v_decision.outcome not in ('approve','approve-with-changes')");
    expect(migration).toContain('CURRENT_FINAL_H4_DECISION_REQUIRED');
    expect(migration).toContain('H4_ADOPTION_HANDOFF_SNAPSHOT_MISMATCH');
    expect(migration).toContain('ADOPTION_HANDOFF_STALE_H2_SOURCE');
    expect(migration).toContain('ADOPTION_HANDOFF_H2_CONTINUATION_OPEN');
    expect(migration).toContain('ADOPTION_HANDOFF_STALE_H3');
  });

  it('binds the handoff cryptographically and preserves pilot provenance', () => {
    expect(migration).toContain('CML_ARENA_H4_ADOPTION_HANDOFF_V1');
    expect(migration).toContain('h4_binding_fingerprint');
    expect(migration).toContain('handoff_binding_fingerprint');
    expect(migration).toContain('h4_authority_context');
    expect(migration).toContain('h4_authority_assignment_id');
    expect(migration).toContain('extensions.digest');
  });

  it('does not adopt, activate, change vigency or promote the master', () => {
    expect(migration).not.toMatch(/insert\s+into\s+public\.canonical_adoption_receipts/i);
    expect(migration).not.toMatch(/insert\s+into\s+public\.shared_canonical_curriculum_heads/i);
    expect(migration).not.toMatch(/update\s+public\.shared_canonical_curriculum_heads/i);
    expect(migration).not.toMatch(/update\s+public\.institutional_revision_decisions/i);
    expect(migration).not.toMatch(/update\s+public\.vertical_review_outcomes/i);
    expect(migration).toContain('adoption_receipt_created boolean not null default false');
    expect(migration).toContain('curriculum_in_force_changed boolean not null default false');
    expect(migration).toContain('automatic_master_promotion boolean not null default false');
  });

  it('covers the decision foreign key and exposes one explicit human handoff gesture', () => {
    expect(performanceMigration).toContain('h4_canonical_adoption_handoffs_decision_idx');
    expect(panel).toContain('Prepara per l’adozione');
    expect(panel).toContain('Nessuna adozione, vigenza o promozione del master è stata generata.');
    expect(panel).toContain('data-human-next-action="prepare-h4-adoption-handoff"');
  });
});
