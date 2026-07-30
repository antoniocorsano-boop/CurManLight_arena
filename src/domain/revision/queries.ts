import type { RevisionProposal, RevisionProposalVersion, Decision, DecisionEffectRecord, RevisionArchive, RevisionProposalStatus, EntityReference } from './types';

export function findProposalsByStatus(archive: RevisionArchive, status: RevisionProposalStatus): RevisionProposal[] {
  return archive.proposals.filter(p => p.status === status);
}

export function findProposalsByTargetNode(archive: RevisionArchive, targetNodeId: string): RevisionProposal[] {
  return archive.proposals.filter(p => p.targetNodeRef.id === targetNodeId);
}

export function findProposalVersion(archive: RevisionArchive, versionId: string): RevisionProposalVersion | undefined {
  return archive.versions.find(v => v.id === versionId);
}

export function getLatestProposalVersion(archive: RevisionArchive, proposal: RevisionProposal): RevisionProposalVersion | undefined {
  return archive.versions.find(v => v.id === proposal.currentVersionRef);
}

export function getAllProposalVersions(archive: RevisionArchive, proposalId: string): RevisionProposalVersion[] {
  return archive.versions.filter(v => v.proposalRef === proposalId).sort((a, b) => b.versionNumber - a.versionNumber);
}

export function findDecisionsByProposal(archive: RevisionArchive, proposalId: string): Decision[] {
  return archive.decisions.filter(d => d.proposalRef.id === proposalId);
}

export function findDecisionsByProposalVersion(archive: RevisionArchive, versionId: string): Decision[] {
  return archive.decisions.filter(d => d.proposalVersionRef.id === versionId);
}

export function findActiveDecisions(archive: RevisionArchive): Decision[] {
  return archive.decisions.filter(d => d.status === 'draft' || d.status === 'recorded-local');
}

export function getLatestDecision(archive: RevisionArchive, proposalId: string): Decision | undefined {
  const decisions = findDecisionsByProposal(archive, proposalId);
  if (decisions.length === 0) return undefined;
  return decisions.reduce((latest, d) => d.metadata.createdAt > latest.metadata.createdAt ? d : latest);
}

export function findEffectsByDecision(archive: RevisionArchive, decisionId: string): DecisionEffectRecord[] {
  return archive.effects.filter(e => e.decisionRef.id === decisionId);
}

export function findEffectsByStatus(archive: RevisionArchive, status: DecisionEffectRecord['status']): DecisionEffectRecord[] {
  return archive.effects.filter(e => e.status === status);
}

export function findEffectsByTarget(archive: RevisionArchive, targetRef: EntityReference): DecisionEffectRecord[] {
  return archive.effects.filter(e => e.targetRef?.id === targetRef.id);
}

export function filterProposalsByContext(archive: RevisionArchive, context: { academicYearId?: string; instituteId?: string; siteId?: string }): RevisionProposal[] {
  return archive.proposals.filter(p => {
    const ctx = p.institutionalContext;
    if (!ctx) return false;
    if (context.academicYearId && ctx.academicYearRef?.id !== context.academicYearId) return false;
    if (context.instituteId && ctx.instituteRef?.id !== context.instituteId) return false;
    if (context.siteId && ctx.siteRef?.id !== context.siteId) return false;
    return true;
  });
}

export function getProposalsAwaitingDecision(archive: RevisionArchive): RevisionProposal[] {
  return archive.proposals.filter(p => p.status === 'accepted-for-decision');
}

export function getProposalsUnderReview(archive: RevisionArchive): RevisionProposal[] {
  return archive.proposals.filter(p => p.status === 'under-review');
}

import type { RevisionEvent } from './types';

export function getProposalStatusHistory(archive: RevisionArchive, proposalId: string): RevisionEvent[] {
  return archive.events.filter(e => e.entityRef.id === proposalId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}