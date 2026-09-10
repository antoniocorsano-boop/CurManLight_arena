import { describe, expect, it } from 'vitest';

const revisionModules = import.meta.glob('../features/beta/RevisionWorkspace.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;
const coordinationModules = import.meta.glob('../features/beta/TeamCoordinationWorkspace.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;

const revisionSource = Object.values(revisionModules)[0] ?? '';
const coordinationSource = Object.values(coordinationModules)[0] ?? '';

describe('CurriculumWorkSession team coordination convergence', () => {
  it('implements four real stages instead of a three-state flow with a decorative fourth step', () => {
    expect(revisionSource).toContain("'EXAMINE' | 'SHARE' | 'COMPARE' | 'RECORD_TEAM_OUTCOME'");
    expect(revisionSource).toContain('data-revision-stage="compare"');
    expect(revisionSource).toContain('data-revision-stage="team-outcome"');
    expect(revisionSource).toContain("setStage('RECORD_TEAM_OUTCOME')");
    expect(revisionSource).toContain('data-curriculum-work-session-complete');
  });

  it('keeps comparison and outcome recording as separate rendered tasks in the same session', () => {
    expect(revisionSource).toContain('mode="compare"');
    expect(revisionSource).toContain('mode="record"');
    expect(coordinationSource).toContain("export type TeamCoordinationMode = 'status' | 'compare' | 'record'");
    expect(coordinationSource).toContain("if (mode === 'record')");
    expect(coordinationSource).toContain('Porta questo punto all’esito');
    expect(coordinationSource).toContain('Registra l’esito del gruppo');
  });

  it('shows only status after share to a teacher without coordination responsibility', () => {
    expect(revisionSource).toContain('!isCoordinator && sharePersistence.complete');
    expect(revisionSource).toContain('mode="status"');
    expect(coordinationSource).toContain('data-team-coordination-mode="status"');
  });

  it('fails closed back to Share if the persisted contribution stops matching current work', () => {
    expect(revisionSource).toContain("(stage === 'COMPARE' || stage === 'RECORD_TEAM_OUTCOME') && !sharePersistence.complete");
    expect(revisionSource).toContain("setStage('SHARE')");
  });

  it('preserves authority and receipt boundaries for team outcomes', () => {
    expect(coordinationSource).toContain("['dipartimento', 'referente'].includes(team.selectedMembership.role)");
    expect(coordinationSource).toContain('hasDisciplineCompetence');
    expect(coordinationSource).toContain('repository.recordTeamOutcome');
    expect(coordinationSource).toContain('non approvazione istituzionale');
    expect(revisionSource).toContain('non approva il curricolo');
  });
});
