import { describe, expect, it } from 'vitest';
import revisioneRaw from '../features/curriculum/components/RevisioneTab.tsx?raw';
import workspaceRaw from '../features/beta/RevisionWorkspace.tsx?raw';
import publisherRaw from '../features/beta/TeamContributionPublisher.tsx?raw';
import curriculumRaw from '../features/curriculum/components/CurriculumTab.tsx?raw';

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
});
