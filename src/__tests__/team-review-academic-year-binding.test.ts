import { describe, expect, it } from 'vitest';
import revisionWorkspace from '../features/beta/RevisionWorkspace.tsx?raw';
import contributionPublisher from '../features/beta/TeamContributionPublisher.tsx?raw';

describe('H2 authenticated academic-year binding', () => {
  it('derives the shared H2 year from the authenticated operational memberships', () => {
    expect(revisionWorkspace).toContain('team.operationalMemberships');
    expect(revisionWorkspace).toContain('membership.schoolOrder === props.order');
    expect(revisionWorkspace).toContain('membership.disciplines.includes(props.discipline)');
    expect(revisionWorkspace).toContain('authenticatedOperationalAcademicYear');
    expect(revisionWorkspace).toContain('sharedReviewAcademicYear');
    expect(revisionWorkspace).toContain('academicYear={sharedReviewAcademicYear}');
    expect(revisionWorkspace).not.toContain('academicYear={schoolYear}');
  });

  it('does not reinterpret a missing authenticated year as missing discipline competence', () => {
    expect(contributionPublisher).toContain("const academicYearReady = /^\\d{4}\\/\\d{4}$/.test(academicYear)");
    expect(contributionPublisher).toContain('data-team-academic-year-missing');
    expect(contributionPublisher).toContain('Anno scolastico operativo non verificato');
    expect(contributionPublisher).toContain('Il profilo disciplinare non viene modificato.');
    expect(contributionPublisher).toContain('academicYearReady && !operationalMembership');
  });
});
