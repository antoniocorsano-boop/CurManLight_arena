import { describe, it, expect } from 'vitest';
import { executeA03ToA04Transfer } from '../domain/design/transferA03';
import { createEmptyDesignStore } from '../domain/design/archive';
import { createEmptyRevisionStore, addProposal, recordDecision, transitionProposalStatus } from '../domain/revision/repository';
import type { EntityReference, EntityId } from '../domain/curriculum/identity/types';
import type { RevisionArchive, Decision } from '../domain/revision/types';

function makeRef(id: string, entityType = 'curriculum-node'): EntityReference {
  return { id: id as EntityId, entityType: entityType as never };
}

function makeAuthority(role: Decision['authority']['declaredRole'] = 'docente') {
  return { declaredRole: role };
}

function setupProposal(status: string, revisionArchive?: RevisionArchive): { archive: RevisionArchive; proposalId: string; versionId: string } {
  let ra = revisionArchive ?? createEmptyRevisionStore();
  const r = addProposal(ra, {
    targetNodeRef: makeRef('node-1'),
    curriculumVersionRef: makeRef('cv-1'),
    currentTextSnapshot: 'old',
    proposedText: 'new',
    rationale: 'test rationale',
  });
  if (!r.success) throw new Error('fail');
  ra = r.archive;
  const proposalId = r.proposal.id;
  const versionId = r.version.id;

  // Transition to desired status
  if (status !== 'draft') {
    const tr1 = transitionProposalStatus(ra, proposalId, 'ready-for-review' as never, undefined, 'test');
    if (tr1.success) ra = tr1.archive;
    if (status === 'submitted' || status === 'under-review' || status === 'accepted-for-decision' || status === 'changes-requested' || status === 'rejected') {
      const tr2 = transitionProposalStatus(ra, proposalId, 'submitted' as never, undefined, 'test');
      if (tr2.success) ra = tr2.archive;
    }
    if (status === 'under-review' || status === 'changes-requested' || status === 'accepted-for-decision' || status === 'rejected') {
      const tr3 = transitionProposalStatus(ra, proposalId, 'under-review' as never, undefined, 'test');
      if (tr3.success) ra = tr3.archive;
    }
    if (status === 'changes-requested') {
      const tr4 = transitionProposalStatus(ra, proposalId, 'changes-requested' as never, undefined, 'test');
      if (tr4.success) ra = tr4.archive;
    }
    if (status === 'accepted-for-decision') {
      const tr4 = transitionProposalStatus(ra, proposalId, 'accepted-for-decision' as never, undefined, 'test');
      if (tr4.success) ra = tr4.archive;
    }
    if (status === 'rejected') {
      const tr4 = transitionProposalStatus(ra, proposalId, 'rejected' as never, undefined, 'test');
      if (tr4.success) ra = tr4.archive;
    }
    if (status === 'withdrawn') {
      const tr4 = transitionProposalStatus(ra, proposalId, 'withdrawn' as never, undefined, 'test');
      if (tr4.success) ra = tr4.archive;
    }
  }

  return { archive: ra, proposalId, versionId };
}

describe('A03→A04 transfer matrix', () => {
  it('draft is not transferable', () => {
    const { archive: ra, proposalId } = setupProposal('draft');
    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: proposalId as EntityId, entityType: 'revision-proposal' as never }], da, ra, makeRef('design-1'));
    expect(result.ok).toBe(false);
  });

  it('ready-for-review is not transferable', () => {
    const { archive: ra, proposalId } = setupProposal('ready-for-review');
    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: proposalId as EntityId, entityType: 'revision-proposal' as never }], da, ra, makeRef('design-1'));
    expect(result.ok).toBe(false);
  });

  it('submitted transfers as proposed-content', () => {
    const { archive: ra, proposalId } = setupProposal('submitted');
    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: proposalId as EntityId, entityType: 'revision-proposal' as never }], da, ra, makeRef('design-1'));
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.selection.qualification).toBe('proposed-content');
  });

  it('under-review transfers as proposed-content', () => {
    const { archive: ra, proposalId } = setupProposal('under-review');
    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: proposalId as EntityId, entityType: 'revision-proposal' as never }], da, ra, makeRef('design-1'));
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.selection.qualification).toBe('proposed-content');
  });

  it('accepted-for-decision stays proposed-content', () => {
    const { archive: ra, proposalId } = setupProposal('accepted-for-decision');
    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: proposalId as EntityId, entityType: 'revision-proposal' as never }], da, ra, makeRef('design-1'));
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.selection.qualification).toBe('proposed-content');
  });

  it('changes-requested is not transferable', () => {
    const { archive: ra, proposalId } = setupProposal('changes-requested');
    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: proposalId as EntityId, entityType: 'revision-proposal' as never }], da, ra, makeRef('design-1'));
    expect(result.ok).toBe(false);
  });

  it('withdrawn is not transferable', () => {
    const { archive: ra, proposalId } = setupProposal('withdrawn');
    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: proposalId as EntityId, entityType: 'revision-proposal' as never }], da, ra, makeRef('design-1'));
    expect(result.ok).toBe(false);
  });

  it('rejected is not transferable', () => {
    const { archive: ra, proposalId } = setupProposal('rejected');
    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: proposalId as EntityId, entityType: 'revision-proposal' as never }], da, ra, makeRef('design-1'));
    expect(result.ok).toBe(false);
  });

  it('approve + recorded-local becomes planned-institute-content', () => {
    // For decision-based tests, proposal must NOT be in a blocked state.
    // Use 'submitted' which is transferable, then add a recorded-local decision.
    const { archive: ra, proposalId, versionId } = setupProposal('submitted');
    const dr = recordDecision(ra, {
      proposalRef: { id: proposalId as EntityId, entityType: 'revision-proposal' as never },
      proposalVersionRef: { id: versionId as EntityId, entityType: 'revision-proposal' as never },
      outcome: 'approve',
      rationale: 'approved locally',
      authority: makeAuthority('docente'),
    });
    if (!dr.success) throw new Error('fail');
    const updatedD = structuredClone(dr.archive.decisions[0]);
    updatedD.status = 'recorded-local';
    const finalRA: RevisionArchive = { ...dr.archive, decisions: [updatedD] };

    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: proposalId as EntityId, entityType: 'revision-proposal' as never }], da, finalRA, makeRef('design-1'));
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.selection.qualification).toBe('planned-institute-content');
  });

  it('reject decision is not transferable', () => {
    const { archive: ra, proposalId, versionId } = setupProposal('submitted');
    const dr = recordDecision(ra, {
      proposalRef: { id: proposalId as EntityId, entityType: 'revision-proposal' as never },
      proposalVersionRef: { id: versionId as EntityId, entityType: 'revision-proposal' as never },
      outcome: 'reject',
      rationale: 'rejected',
      authority: makeAuthority('docente'),
    });
    if (!dr.success) throw new Error('fail');
    const updatedD = structuredClone(dr.archive.decisions[0]);
    updatedD.status = 'recorded-local';
    const finalRA: RevisionArchive = { ...dr.archive, decisions: [updatedD] };

    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: proposalId as EntityId, entityType: 'revision-proposal' as never }], da, finalRA, makeRef('design-1'));
    expect(result.ok).toBe(false);
  });

  it('defer decision is not transferable', () => {
    const { archive: ra, proposalId, versionId } = setupProposal('submitted');
    const dr = recordDecision(ra, {
      proposalRef: { id: proposalId as EntityId, entityType: 'revision-proposal' as never },
      proposalVersionRef: { id: versionId as EntityId, entityType: 'revision-proposal' as never },
      outcome: 'defer',
      rationale: 'deferred',
      authority: makeAuthority('docente'),
    });
    if (!dr.success) throw new Error('fail');
    const updatedD = structuredClone(dr.archive.decisions[0]);
    updatedD.status = 'recorded-local';
    const finalRA: RevisionArchive = { ...dr.archive, decisions: [updatedD] };

    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: proposalId as EntityId, entityType: 'revision-proposal' as never }], da, finalRA, makeRef('design-1'));
    expect(result.ok).toBe(false);
  });

  it('record-only has no curricular effect', () => {
    const { archive: ra, proposalId, versionId } = setupProposal('submitted');
    const dr = recordDecision(ra, {
      proposalRef: { id: proposalId as EntityId, entityType: 'revision-proposal' as never },
      proposalVersionRef: { id: versionId as EntityId, entityType: 'revision-proposal' as never },
      outcome: 'record-only',
      rationale: 'record only',
      authority: makeAuthority('docente'),
    });
    if (!dr.success) throw new Error('fail');
    const updatedD = structuredClone(dr.archive.decisions[0]);
    updatedD.status = 'recorded-local';
    const finalRA: RevisionArchive = { ...dr.archive, decisions: [updatedD] };

    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: proposalId as EntityId, entityType: 'revision-proposal' as never }], da, finalRA, makeRef('design-1'));
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.selection.qualification).toBe('proposed-content');
  });

  it('legacy transfers with warnings', () => {
    const ra = createEmptyRevisionStore();
    const r = addProposal(ra, {
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
      rationale: 'legacy',
    });
    if (!r.success) throw new Error('fail');
    // Force legacy status
    const proposal = structuredClone(r.archive.proposals[0]);
    proposal.status = 'legacy' as never;
    const legacyRA: RevisionArchive = { ...r.archive, proposals: [proposal] };

    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: r.proposal.id as EntityId, entityType: 'revision-proposal' as never }], da, legacyRA, makeRef('design-1'));
    expect(result.ok).toBe(true);
    expect(result.ok).toBe(true); if (!result.ok) { throw new Error('Expected operation to succeed'); }
    expect(result.selection.qualification).toBe('legacy-content');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('rejects missing proposal refs', () => {
    const ra = createEmptyRevisionStore();
    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([], da, ra, makeRef('design-1'));
    expect(result.ok).toBe(false);
  });

  it('rejects unknown proposal', () => {
    const ra = createEmptyRevisionStore();
    const da = createEmptyDesignStore();
    const result = executeA03ToA04Transfer([{ id: 'unknown' as EntityId, entityType: 'revision-proposal' as never }], da, ra, makeRef('design-1'));
    expect(result.ok).toBe(false);
  });
});