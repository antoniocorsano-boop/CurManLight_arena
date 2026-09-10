import { describe, expect, it } from 'vitest';
import migration from '../../supabase/migrations/20260910133000_beta_development_pilot_authority.sql?raw';
import panel from '../features/beta/H3BoundInstitutionalDecisionPanel.tsx?raw';
import verticalReview from '../features/beta/VerticalReviewPanel.tsx?raw';
import repository from '../infrastructure/supabase/h3BoundInstitutionalDecisionRepository.ts?raw';

describe('H4 development/pilot authority boundary', () => {
  it('records explicit Beta authority provenance without assigning a user in schema migration', () => {
    expect(migration).toContain('create table if not exists public.development_pilot_authority_assignments');
    expect(migration).toContain("scope = 'BETA_DEVELOPMENT_PILOT'");
    expect(migration).toContain('previous_workspace_role');
    expect(migration).toContain('authority_context');
    expect(migration).toContain('authority_assignment_id');
    expect(migration).toContain("new.authority_context := 'DEVELOPMENT_PILOT'");
    expect(migration).not.toMatch(/insert\s+into\s+public\.development_pilot_authority_assignments/i);
    expect(migration).not.toMatch(/update\s+public\.workspace_memberships/i);
  });

  it('keeps development authority read-only for authenticated clients', () => {
    expect(migration).toContain('enable row level security');
    expect(migration).toContain('development_pilot_authority_assignments_select_own');
    expect(migration).toContain('user_id = (select auth.uid())');
    expect(migration).toContain('revoke insert, update, delete on table public.development_pilot_authority_assignments');
    expect(migration).toContain('grant select on table public.development_pilot_authority_assignments to authenticated');
  });

  it('uses only the H3-bound server writer and reads the development authority receipt', () => {
    expect(repository).toContain("from('development_pilot_authority_assignments')");
    expect(repository).toContain("rpc('record_h3_bound_institutional_decision_v1'");
    expect(repository).toContain('p_expected_context_user_id: context.membership.userId');
    expect(repository).toContain("eq('decision_basis', 'VERTICAL_REVIEW_HANDOFF')");
  });

  it('requires an explicit human H4 choice, preview and confirmation', () => {
    expect(panel).toContain("useState<OutcomeSelection>('')");
    expect(panel).toContain('Rivedi prima di registrare');
    expect(panel).toContain('Confermo di assumere esplicitamente questo esito');
    expect(panel).toContain('Registra la decisione H4');
    expect(panel).toContain('DEVELOPMENT_PILOT');
    expect(panel).toContain('non rappresenta una deliberazione istituzionale di produzione');
    expect(panel).toContain('non rende vigente il curricolo');
  });

  it('attaches H4 to an already prepared H3 handoff instead of the proposal-only surface', () => {
    expect(verticalReview).toContain('H3BoundInstitutionalDecisionPanel');
    expect(verticalReview).toContain('data-institutional-review-handoff-ready');
    expect(verticalReview).toContain('showH4Decision');
  });
});
