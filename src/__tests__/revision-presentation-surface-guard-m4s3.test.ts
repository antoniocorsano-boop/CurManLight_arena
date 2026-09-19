import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const canonicalReviewSurfaces = [
  'src/features/curriculum/components/RevisioneTab.tsx',
  'src/features/beta/RevisionWorkspace.tsx',
  'src/features/beta/TeamContributionPublisher.tsx',
  'src/features/curriculum/components/CurriculumTab.tsx',
] as const;

describe('M4-S3 canonical revision presentation guard', () => {
  it.each(canonicalReviewSurfaces)('%s does not consume legacy decisions/customTexts directly', (path) => {
    const source = readFileSync(resolve(process.cwd(), path), 'utf8');
    expect(source).not.toMatch(/\bdecisions\b/);
    expect(source).not.toMatch(/\bcustomTexts\b/);
    expect(source).not.toMatch(/\bsetDecision\b/);
    expect(source).not.toMatch(/\bsetCustomText\b/);
    expect(source).not.toMatch(/\bresetDecision\b/);
  });
});
