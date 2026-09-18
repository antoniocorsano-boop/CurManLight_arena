import { describe, expect, it } from 'vitest';
import authorityMigration from '../../supabase/migrations/20260910153000_beta_development_pilot_dirigente_authority.sql?raw';
import adoptionMigration from '../../supabase/migrations/20260910160000_h4_bound_canonical_adoption_receipt.sql?raw';
import panel from '../features/beta/H4BoundCanonicalAdoptionPanel.tsx?raw';


describe('H4-bound canonical adoption', () => {
  it('extends Beta pilot authority without overwriting the workspace role', () => {
    expect(authorityMigration).toContain("authority_role in ('collegio','dirigente')");
    expect(authorityMigration).toContain('unique (workspace_id, user_id, scope, authority_role)');
    expect(authorityMigration).not.toMatch(/update\s+public\.workspace_memberships/i);
  });

  it('creates one immutable adoption receipt distinct from materialization and vigency', () => {
    expect(adoptionMigration).toContain('create table if not exists public.h4_bound_canonical_adoption_receipts');
    expect(adoptionMigration).toContain("status text not null default 'ADOPTED_PENDING_MATERIALIZATION'");
    expect(adoptionMigration).toContain('H4_BOUND_ADOPTION_IMMUTABLE');
    expect(adoptionMigration).toContain('materialization_created boolean not null default false');
    expect(adoptionMigration).toContain('curriculum_in_force_changed boolean not null default false');
    expect(adoptionMigration).toContain('automatic_master_promotion boolean not null default false');
  });

  it('requires dirigente authority, including explicit Beta pilot authority', () => {
    expect(adoptionMigration).toContain("assignment.authority_role = 'dirigente'");
    expect(adoptionMigration).toContain("assignment.scope = 'BETA_DEVELOPMENT_PILOT'");
    expect(adoptionMigration).toContain("v_authority_context := 'DEVELOPMENT_PILOT'");
    expect(adoptionMigration).toContain("v_membership_role is distinct from 'dirigente'");
    expect(adoptionMigration).toContain('CURRICULUM_ADOPT_REQUIRED');
  });

  it('revalidates H4, H3 and H2 before recording adoption', () => {
    expect(adoptionMigration).toContain('record_h4_bound_canonical_adoption_v1');
    expect(adoptionMigration).toContain('H4_BOUND_ADOPTION_SNAPSHOT_MISMATCH');
    expect(adoptionMigration).toContain('ADOPTION_CURRENT_FINAL_H4_REQUIRED');
    expect(adoptionMigration).toContain('ADOPTION_STALE_H2_SOURCE');
    expect(adoptionMigration).toContain('ADOPTION_H2_CONTINUATION_OPEN');
    expect(adoptionMigration).toContain('ADOPTION_STALE_H3');
  });

  it('freezes and fingerprints the exact adoption subject', () => {
    expect(adoptionMigration).toContain("'H4_BOUND_ADOPTION_SUBJECT'");
    expect(adoptionMigration).toContain('sourceTeamOutcomes');
    expect(adoptionMigration).toContain('verticalReview');
    expect(adoptionMigration).toContain('institutionalDecision');
    expect(adoptionMigration).toContain('CML_ARENA_H4_BOUND_ADOPTION_V1');
    expect(adoptionMigration).toContain('extensions.digest');
  });

  it('does not materialize, publish, activate or mutate upstream receipts', () => {
    expect(adoptionMigration).not.toMatch(/insert\s+into\s+public\.shared_canonical_materializations/i);
    expect(adoptionMigration).not.toMatch(/insert\s+into\s+public\.shared_canonical_curriculum_heads/i);
    expect(adoptionMigration).not.toMatch(/update\s+public\.shared_canonical_curriculum_heads/i);
    expect(adoptionMigration).not.toMatch(/update\s+public\.institutional_revision_decisions/i);
    expect(adoptionMigration).not.toMatch(/update\s+public\.vertical_review_outcomes/i);
    expect(adoptionMigration).not.toMatch(/update\s+public\.h4_canonical_adoption_handoffs/i);
  });

  it('requires preview and explicit human confirmation in the UI', () => {
    expect(panel).toContain('Rivedi prima di adottare');
    expect(panel).toContain('Registra l’adozione');
    expect(panel).toContain('data-human-next-action="preview-h4-bound-adoption"');
    expect(panel).toContain('data-human-next-action="record-h4-bound-adoption"');
    expect(panel).toContain('Materializzazione, pubblicazione e vigenza restano separate');
  });
});
