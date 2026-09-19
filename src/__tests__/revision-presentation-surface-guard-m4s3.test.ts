import { describe, expect, it } from 'vitest';
import revisioneRaw from '../features/curriculum/components/RevisioneTab.tsx?raw';
import workspaceRaw from '../features/beta/RevisionWorkspace.tsx?raw';
import publisherRaw from '../features/beta/TeamContributionPublisher.tsx?raw';
import curriculumRaw from '../features/curriculum/components/CurriculumTab.tsx?raw';
import appRaw from '../App.tsx?raw';

const canonicalReviewSurfaces = [
  ['RevisioneTab', revisioneRaw],
  ['RevisionWorkspace', workspaceRaw],
  ['TeamContributionPublisher', publisherRaw],
  ['CurriculumTab', curriculumRaw],
] as const;

describe('M4-S3 canonical revision presentation guard', () => {
  it.each(canonicalReviewSurfaces)('%s does not consume legacy decisions/customTexts directly', (_name, source) => {
    expect(source).not.toMatch(/\bdecisions\b/);
    expect(source).not.toMatch(/\bcustomTexts\b/);
    expect(source).not.toMatch(/\bsetDecision\b/);
    expect(source).not.toMatch(/\bsetCustomText\b/);
    expect(source).not.toMatch(/\bresetDecision\b/);
  });
  it('uses one explicit personal-review context across overview, editor and team projection', () => {
    expect(workspaceRaw).toContain('academicYear: schoolYear');
    expect(workspaceRaw).toContain('revisionPresentationContext={reviewContext}');
    expect(publisherRaw).toContain('revisionPresentationContext');
    expect(revisioneRaw).toContain('revisionPresentationContext ??');
  });

  it('computes global review progress from the operational proposal set', () => {
    expect(appRaw).toContain('resolveOperationalReviewProposals');
    expect(appRaw).toContain('const proposals = resolveOperationalReviewProposals(disc, ord, fallbackProposals)');
  });
});
