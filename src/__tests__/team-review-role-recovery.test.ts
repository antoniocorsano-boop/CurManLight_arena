import { describe, expect, it } from 'vitest';

const revisionModules = import.meta.glob('../features/beta/RevisionWorkspace.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const publisherModules = import.meta.glob('../features/beta/TeamContributionPublisher.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const teamRepositoryModules = import.meta.glob('../infrastructure/supabase/sharedTeamReviewRepository.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const caseRepositoryModules = import.meta.glob('../infrastructure/supabase/sharedCurriculumReviewCaseRepository.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const revisionSource = Object.values(revisionModules)[0] ?? '';
const publisherSource = Object.values(publisherModules)[0] ?? '';
const teamRepositorySource = Object.values(teamRepositoryModules)[0] ?? '';
const caseRepositorySource = Object.values(caseRepositoryModules)[0] ?? '';

describe('G5 mobile contribution role recovery', () => {
  it('uses human-readable labels for non-contributor institutional roles', () => {
    expect(revisionSource).toContain("if (role === 'collegio') return 'Collegio'");
    expect(revisionSource).toContain("if (role === 'dirigente') return 'Dirigente scolastico'");
    expect(revisionSource).toContain("if (role === 'amministratore') return 'Amministratore'");
  });

  it('keeps contribution authority fail-closed while explaining recovery', () => {
    expect(publisherSource).toContain('data-team-contribution-role-blocked');
    expect(publisherSource).toContain('Questo ruolo non può pubblicare contributi disciplinari');
    expect(publisherSource).toContain('Il parere personale resta salvato');
    expect(publisherSource).toContain('Docente, Dipartimento o Referente');
    expect(publisherSource).toContain('disabled={busy || !canContribute');
  });

  it('does not expose TEAM_REVIEW_CONTRIBUTE_REQUIRED from the local contribution guard', () => {
    expect(teamRepositorySource).not.toContain("throw new Error('TEAM_REVIEW_CONTRIBUTE_REQUIRED')");
    expect(teamRepositorySource).toContain("message.includes('TEAM_REVIEW_CONTRIBUTE_REQUIRED')");
    expect(teamRepositorySource).toContain('Il ruolo corrente non può pubblicare contributi disciplinari nel gruppo');
    expect(caseRepositorySource).toContain("message.includes('TEAM_REVIEW_CONTRIBUTE_REQUIRED')");
    expect(caseRepositorySource).toContain('Il ruolo corrente non può contribuire a questo riesame condiviso');
  });

  it('makes the completed review message role-aware', () => {
    expect(revisionSource).toContain('canSharePersonalContribution');
    expect(revisionSource).toContain('Il parere personale è completo, ma il ruolo corrente non può pubblicarlo nel gruppo.');
  });
});
