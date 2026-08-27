import { describe, expect, it } from 'vitest';
import { createEntityReference } from '../domain/curriculum/identity';
import { addProposal, createEmptyRevisionStore, verifyArchiveIntegrity } from '../domain/revision/repository';

describe('revision proposal initial-version invariant', () => {
  it('binds currentVersionRef to the concrete frozen version created by addProposal', () => {
    const result = addProposal(createEmptyRevisionStore(), {
      targetNodeRef: createEntityReference('node-test' as never, 'curriculum-node' as never, 'Nodo test'),
      curriculumVersionRef: createEntityReference('baseline-test' as never, 'curriculum-version' as never),
      currentTextSnapshot: 'Testo vigente',
      proposedText: 'Testo proposto',
      rationale: 'Motivazione verificabile',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.proposal.currentVersionRef).toBe(result.version.id);
    expect(result.archive.versions.some((version) => version.id === result.proposal.currentVersionRef)).toBe(true);
    expect(verifyArchiveIntegrity(result.archive)).toBe(true);
  });
});
