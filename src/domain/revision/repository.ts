import type { ActorReference, EntityId } from '../curriculum/identity';
import { generateEntityId, createEntityReference } from '../curriculum/identity';
import type {
  RevisionArchive,
  RevisionProposal,
  RevisionProposalVersion,
  Decision,
  RevisionProposalCreationResult,
  RevisionDecisionCreationResult,
  RevisionTransitionResult,
} from './types';
import { createEmptyRevisionArchive, createProposal, createInitialProposalVersion, createDecision, createRevisionEvent } from './constructors';
import { validateProposal, validateProposalVersion, validateDecision, validateInternalArchiveReferences, validateArchiveIntegrity, validateProposalMandatoryRationale, validateProposalTransition } from './validators';

export function createEmptyRevisionStore(now = new Date().toISOString()): RevisionArchive {
  return createEmptyRevisionArchive(now);
}

export function cloneRevisionArchiveStore(archive: RevisionArchive): RevisionArchive {
  return JSON.parse(JSON.stringify(archive));
}

export function addProposal(
  archive: RevisionArchive,
  proposalInput: Parameters<typeof createProposal>[0],
  now = new Date().toISOString(),
): RevisionProposalCreationResult {
  const proposal = createProposal(proposalInput, now);
  const version = createInitialProposalVersion(proposal, proposalInput, now);
  proposal.currentVersionRef = version.id;

  const pv = validateProposal(proposal);
  if (!pv.valid) return { success: false, errors: pv.errors };

  const vv = validateProposalVersion(version);
  if (!vv.valid) return { success: false, errors: vv.errors };

  const updated = cloneRevisionArchiveStore(archive);
  updated.proposals.push(proposal);
  updated.versions.push(version);

  const event = createRevisionEvent({
    entityRef: createEntityReference(proposal.id, 'revision-proposal'),
    eventType: 'proposal-created',
    actor: proposalInput.author,
    rationale: proposalInput.rationale,
    newStatus: proposal.status,
  });
  updated.events.push(event);
  updated.updatedAt = now;

  return { success: true, proposal, version, archive: updated };
}

export function addProposalVersion(
  archive: RevisionArchive,
  proposalId: EntityId,
  versionInput: { currentTextSnapshot: string; proposedText: string; rationale?: string; author?: ActorReference; changeNote?: string },
  now = new Date().toISOString(),
): RevisionProposalCreationResult {
  const proposal = archive.proposals.find(p => p.id === proposalId);
  if (!proposal) return { success: false, errors: [{ code: 'PROPOSAL_NOT_FOUND', message: `Proposal ${proposalId} not found` }] };

  const currentVersion = archive.versions.find(v => v.id === proposal.currentVersionRef);
  if (!currentVersion) return { success: false, errors: [{ code: 'VERSION_NOT_FOUND', message: `Current version for proposal ${proposalId} not found` }] };

  const newVersionId = generateEntityId();
  const newVersion: RevisionProposalVersion = {
    id: newVersionId,
    proposalRef: proposalId,
    versionNumber: currentVersion.versionNumber + 1,
    currentTextSnapshot: versionInput.currentTextSnapshot,
    proposedText: versionInput.proposedText,
    rationale: versionInput.rationale ?? currentVersion.rationale,
    sourceRefs: [...currentVersion.sourceRefs],
    evidenceRefs: [...currentVersion.evidenceRefs],
    author: versionInput.author,
    createdAt: now,
    structuralFootprint: currentVersion.structuralFootprint,
    previousVersionRef: currentVersion.id,
    changeNote: versionInput.changeNote,
    frozen: true,
  };

  const vv = validateProposalVersion(newVersion);
  if (!vv.valid) return { success: false, errors: vv.errors };

  const updated = cloneRevisionArchiveStore(archive);
  const updatedProposal = updated.proposals.find(p => p.id === proposalId);
  if (updatedProposal) updatedProposal.currentVersionRef = newVersionId;
  updated.versions.push(newVersion);

  const event = createRevisionEvent({
    entityRef: createEntityReference(proposalId, 'revision-proposal'),
    eventType: 'version-created',
    actor: versionInput.author,
    rationale: versionInput.changeNote,
    newStatus: proposal.status,
  });
  updated.events.push(event);
  updated.updatedAt = now;

  return { success: true, proposal, version: newVersion, archive: updated };
}

export function recordDecision(
  archive: RevisionArchive,
  decisionInput: Parameters<typeof createDecision>[0],
  now = new Date().toISOString(),
): RevisionDecisionCreationResult {
  const decision = createDecision(decisionInput, now);

  const proposal = archive.proposals.find(p => p.id === decisionInput.proposalRef.id);
  if (!proposal) return { success: false, errors: [{ code: 'PROPOSAL_NOT_FOUND', message: `Proposal ${decisionInput.proposalRef.id} not found` }] };

  const dv = validateDecision(decision);
  if (!dv.valid) return { success: false, errors: dv.errors };

  const updated = cloneRevisionArchiveStore(archive);
  updated.decisions.push(decision);
  const updatedProposal = updated.proposals.find(p => p.id === proposal.id);
  if (updatedProposal) updatedProposal.decisionRefs.push(createEntityReference(decision.id, 'decision'));

  const event = createRevisionEvent({
    entityRef: createEntityReference(decision.id, 'decision'),
    eventType: 'decision-recorded',
    actor: decisionInput.decidedBy,
    rationale: decisionInput.rationale,
    newStatus: decision.status,
  });
  updated.events.push(event);
  updated.updatedAt = now;

  return { success: true, decision, archive: updated };
}

export function transitionProposalStatus(
  archive: RevisionArchive,
  proposalId: EntityId,
  newStatus: RevisionProposal['status'],
  actor?: ActorReference,
  rationale?: string,
  now = new Date().toISOString(),
): RevisionTransitionResult {
  const proposal = archive.proposals.find(p => p.id === proposalId);
  if (!proposal) {
    return { success: false, errors: [{ code: 'PROPOSAL_NOT_FOUND', message: `Proposal ${proposalId} not found` }] };
  }

  const tv = validateProposalTransition(proposal, newStatus);
  if (!tv.valid) return { success: false, errors: tv.errors };

  if (newStatus === 'submitted' || newStatus === 'ready-for-review') {
    const rv = validateProposalMandatoryRationale(proposal);
    if (!rv.valid) return { success: false, errors: rv.errors };
  }

  const updated = cloneRevisionArchiveStore(archive);
  const updatedProposal = updated.proposals.find(p => p.id === proposalId);
  if (!updatedProposal) return { success: false, errors: [{ code: 'PROPOSAL_NOT_FOUND', message: `Proposal ${proposalId} not found` }] };

  const prevStatus = updatedProposal.status;
  updatedProposal.status = newStatus;

  const event = createRevisionEvent({
    entityRef: createEntityReference(proposalId, 'revision-proposal'),
    eventType: 'proposal-modified',
    actor,
    rationale,
    previousStatus: prevStatus,
    newStatus,
  });
  updated.events.push(event);
  updated.updatedAt = now;

  return { success: true, archive: updated, event };
}

export function transitionDecisionStatus(
  archive: RevisionArchive,
  decisionId: EntityId,
  newStatus: Decision['status'],
  actor?: ActorReference,
  rationale?: string,
  now = new Date().toISOString(),
): RevisionTransitionResult {
  const decision = archive.decisions.find(d => d.id === decisionId);
  if (!decision) {
    return { success: false, errors: [{ code: 'DECISION_NOT_FOUND', message: `Decision ${decisionId} not found` }] };
  }

  const updated = cloneRevisionArchiveStore(archive);
  const updatedDecision = updated.decisions.find(d => d.id === decisionId);
  if (!updatedDecision) return { success: false, errors: [{ code: 'DECISION_NOT_FOUND', message: `Decision ${decisionId} not found` }] };

  const prevStatus = updatedDecision.status;
  updatedDecision.status = newStatus;

  const eventType = newStatus === 'superseded' ? 'decision-superseded' as const
    : newStatus === 'revoked' ? 'decision-revoked' as const
    : newStatus === 'archived' ? 'proposal-archived' as const
    : 'proposal-modified' as const;

  const event = createRevisionEvent({
    entityRef: createEntityReference(decisionId, 'decision'),
    eventType,
    actor,
    rationale,
    previousStatus: prevStatus,
    newStatus,
  });
  updated.events.push(event);
  updated.updatedAt = now;

  return { success: true, archive: updated, event };
}

export function verifyArchiveIntegrity(archive: RevisionArchive): boolean {
  const av = validateArchiveIntegrity(archive);
  if (!av.valid) return false;
  const rv = validateInternalArchiveReferences(archive);
  return rv.valid;
}