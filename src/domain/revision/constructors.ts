import type { ActorReference, ContentOrigin, EntityReference } from '../curriculum/identity';
import { generateEntityId, createMetadata } from '../curriculum/identity';
import type {
  RevisionProposal,
  RevisionProposalVersion,
  Decision,
  DecisionOutcome,
  DecisionAuthority,
  DecisionAuthorityRole,
  DecisionEffectRecord,
  DecisionEffectType,
  DecisionEffectStatus,
  RevisionEvent,
  RevisionEventType,
  RevisionArchive,
  InstitutionalContext,
} from './types';
import { REVISION_ARCHIVE_SCHEMA_VERSION } from './vocabularies';

export function createEmptyRevisionArchive(now = new Date().toISOString()): RevisionArchive {
  return {
    schemaVersion: REVISION_ARCHIVE_SCHEMA_VERSION,
    updatedAt: now,
    proposals: [],
    versions: [],
    decisions: [],
    effects: [],
    events: [],
  };
}

export function cloneRevisionArchive(archive: RevisionArchive): RevisionArchive {
  return JSON.parse(JSON.stringify(archive));
}

export interface CreateProposalInput {
  targetNodeRef: EntityReference;
  curriculumVersionRef: EntityReference;
  currentTextSnapshot: string;
  proposedText: string;
  rationale?: string;
  evidenceRefs?: EntityReference[];
  sourceRefs?: EntityReference[];
  author?: ActorReference;
  institutionalContext?: InstitutionalContext;
  origin?: ContentOrigin;
}

export function createProposal(input: CreateProposalInput, now = new Date().toISOString()): RevisionProposal {
  const id = generateEntityId();
  return {
    id,
    metadata: createMetadata(input.origin ?? 'teacher', input.author, now),
    targetNodeRef: { ...input.targetNodeRef },
    curriculumVersionRef: { ...input.curriculumVersionRef },
    currentTextSnapshot: input.currentTextSnapshot,
    proposedText: input.proposedText,
    rationale: input.rationale ?? '',
    evidenceRefs: input.evidenceRefs ? input.evidenceRefs.map(r => ({ ...r })) : [],
    sourceRefs: input.sourceRefs ? input.sourceRefs.map(r => ({ ...r })) : [],
    author: input.author,
    institutionalContext: input.institutionalContext ? { ...input.institutionalContext } : undefined,
    status: 'draft',
    currentVersionRef: id,
    decisionRefs: [],
  };
}

export interface CreateProposalVersionInput {
  currentTextSnapshot: string;
  proposedText: string;
  rationale?: string;
  sourceRefs?: EntityReference[];
  evidenceRefs?: EntityReference[];
  author?: ActorReference;
  changeNote?: string;
  structuralFootprint?: string;
}

export function createInitialProposalVersion(
  proposal: RevisionProposal,
  input: CreateProposalVersionInput,
  now = new Date().toISOString(),
): RevisionProposalVersion {
  return {
    id: generateEntityId(),
    proposalRef: proposal.id,
    versionNumber: 1,
    currentTextSnapshot: input.currentTextSnapshot,
    proposedText: input.proposedText,
    rationale: input.rationale ?? proposal.rationale,
    sourceRefs: input.sourceRefs ? input.sourceRefs.map(r => ({ ...r })) : proposal.sourceRefs.map(r => ({ ...r })),
    evidenceRefs: input.evidenceRefs ? input.evidenceRefs.map(r => ({ ...r })) : proposal.evidenceRefs.map(r => ({ ...r })),
    author: input.author ?? proposal.author,
    createdAt: now,
    structuralFootprint: input.structuralFootprint ?? '',
    previousVersionRef: undefined,
    changeNote: input.changeNote,
    frozen: true,
  };
}

export function createNextProposalVersion(
  proposal: RevisionProposal,
  previousVersion: RevisionProposalVersion,
  input: CreateProposalVersionInput,
  now = new Date().toISOString(),
): RevisionProposalVersion {
  return {
    id: generateEntityId(),
    proposalRef: proposal.id,
    versionNumber: previousVersion.versionNumber + 1,
    currentTextSnapshot: input.currentTextSnapshot,
    proposedText: input.proposedText,
    rationale: input.rationale ?? previousVersion.rationale,
    sourceRefs: input.sourceRefs ? input.sourceRefs.map(r => ({ ...r })) : previousVersion.sourceRefs.map(r => ({ ...r })),
    evidenceRefs: input.evidenceRefs ? input.evidenceRefs.map(r => ({ ...r })) : previousVersion.evidenceRefs.map(r => ({ ...r })),
    author: input.author,
    createdAt: now,
    structuralFootprint: input.structuralFootprint ?? '',
    previousVersionRef: previousVersion.id,
    changeNote: input.changeNote,
    frozen: true,
  };
}

export function restoreProposalVersion(
  proposal: RevisionProposal,
  sourceVersion: RevisionProposalVersion,
  input: CreateProposalVersionInput,
  now = new Date().toISOString(),
): RevisionProposalVersion {
  return createNextProposalVersion(proposal, sourceVersion, {
    ...input,
    changeNote: input.changeNote ?? `Ripristino dalla versione ${sourceVersion.versionNumber}`,
  }, now);
}

export interface CreateDecisionInput {
  proposalRef: EntityReference;
  proposalVersionRef: EntityReference;
  outcome: DecisionOutcome;
  rationale?: string;
  authority: DecisionAuthority;
  decidedBy?: ActorReference;
  institutionalContext?: InstitutionalContext;
  decidedAt?: string;
  effectiveFrom?: string;
  sourceRefs?: EntityReference[];
  documentRefs?: EntityReference[];
  origin?: ContentOrigin;
}

export function createDecision(input: CreateDecisionInput, now = new Date().toISOString()): Decision {
  const id = generateEntityId();
  return {
    id,
    metadata: createMetadata(input.origin ?? 'teacher', input.decidedBy, now),
    proposalRef: { ...input.proposalRef },
    proposalVersionRef: { ...input.proposalVersionRef },
    outcome: input.outcome,
    rationale: input.rationale ?? '',
    authority: { ...input.authority },
    decidedBy: input.decidedBy,
    institutionalContext: input.institutionalContext ? { ...input.institutionalContext } : undefined,
    decidedAt: input.decidedAt,
    effectiveFrom: input.effectiveFrom,
    sourceRefs: input.sourceRefs ? input.sourceRefs.map(r => ({ ...r })) : [],
    documentRefs: input.documentRefs ? input.documentRefs.map(r => ({ ...r })) : [],
    status: 'draft',
  };
}

export interface CreateEffectInput {
  decisionRef: EntityReference;
  effectType: DecisionEffectType;
  targetRef?: EntityReference;
  description: string;
  status?: DecisionEffectStatus;
  appliedBy?: ActorReference;
}

export function createDecisionEffectRecord(input: CreateEffectInput, now = new Date().toISOString()): DecisionEffectRecord {
  const id = generateEntityId();
  return {
    id,
    metadata: createMetadata('teacher', input.appliedBy, now),
    decisionRef: { ...input.decisionRef },
    effectType: input.effectType,
    targetRef: input.targetRef ? { ...input.targetRef } : undefined,
    description: input.description,
    status: input.status ?? 'planned',
    appliedBy: input.appliedBy,
  };
}

export interface CreateEventInput {
  entityRef: EntityReference;
  eventType: RevisionEventType;
  actor?: ActorReference;
  role?: string;
  previousStatus?: string;
  newStatus?: string;
  rationale?: string;
  references?: EntityReference[];
  structuralFootprint?: string;
}

let eventCounter = 0;

export function createRevisionEvent(input: CreateEventInput): RevisionEvent {
  eventCounter++;
  return {
    id: `rev-evt-${eventCounter}-${Date.now()}`,
    entityRef: { ...input.entityRef },
    eventType: input.eventType,
    actor: input.actor,
    role: input.role,
    timestamp: new Date().toISOString(),
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    rationale: input.rationale,
    references: input.references ? input.references.map(r => ({ ...r })) : [],
    structuralFootprint: input.structuralFootprint ?? '',
  };
}

export function createDecisionAuthority(
  role: DecisionAuthorityRole,
  otherDescription?: string,
  note?: string,
): DecisionAuthority {
  return { declaredRole: role, otherDescription, note };
}

export function createInstitutionalContext(
  instituteRef?: EntityReference,
  academicYearRef?: EntityReference,
  siteRef?: EntityReference,
  declaredActor?: ActorReference,
): InstitutionalContext {
  return { instituteRef, academicYearRef, siteRef, declaredActor };
}