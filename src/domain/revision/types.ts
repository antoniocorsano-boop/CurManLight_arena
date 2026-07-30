import type {
  EntityId,
  EntityMetadata,
  EntityReference,
  ActorReference,
} from '../curriculum/identity';

export type { EntityReference, ActorReference };

export type RevisionProposalStatus =
  | 'draft'
  | 'ready-for-review'
  | 'submitted'
  | 'under-review'
  | 'changes-requested'
  | 'withdrawn'
  | 'accepted-for-decision'
  | 'rejected'
  | 'archived'
  | 'legacy';

export type DecisionOutcome =
  | 'approve'
  | 'approve-with-changes'
  | 'reject'
  | 'defer'
  | 'return-for-revision'
  | 'record-only';

export type DecisionStatus =
  | 'draft'
  | 'recorded-local'
  | 'superseded'
  | 'revoked'
  | 'archived'
  | 'legacy';

export type DecisionAuthorityRole =
  | 'docente'
  | 'dipartimento'
  | 'coordinatore'
  | 'referente-curricolo'
  | 'dirigente-scolastico'
  | 'collegio-docenti'
  | 'consiglio-istituto'
  | 'altro';

export interface DecisionAuthority {
  declaredRole: DecisionAuthorityRole;
  otherDescription?: string;
  note?: string;
}

export type DecisionEffectType =
  | 'none'
  | 'new-proposal'
  | 'planned-update'
  | 'new-institute-node'
  | 'node-replacement'
  | 'archive'
  | 'defer';

export type DecisionEffectStatus =
  | 'planned'
  | 'applied-local'
  | 'cancelled'
  | 'legacy';

export type RevisionEventType =
  | 'proposal-created'
  | 'proposal-modified'
  | 'version-created'
  | 'proposal-submitted'
  | 'proposal-taken-over'
  | 'changes-requested'
  | 'proposal-withdrawn'
  | 'decision-recorded'
  | 'decision-superseded'
  | 'decision-revoked'
  | 'proposal-archived'
  | 'document-generated'
  | 'curricular-effect-applied';

export interface InstitutionalContext {
  instituteRef?: EntityReference;
  academicYearRef?: EntityReference;
  siteRef?: EntityReference;
  declaredActor?: ActorReference;
}

export interface RevisionProposal {
  id: EntityId;
  metadata: EntityMetadata;
  targetNodeRef: EntityReference;
  curriculumVersionRef: EntityReference;
  currentTextSnapshot: string;
  proposedText: string;
  rationale: string;
  evidenceRefs: EntityReference[];
  sourceRefs: EntityReference[];
  author?: ActorReference;
  institutionalContext?: InstitutionalContext;
  status: RevisionProposalStatus;
  currentVersionRef: EntityId;
  decisionRefs: EntityReference[];
}

export interface RevisionProposalVersion {
  id: EntityId;
  proposalRef: EntityId;
  versionNumber: number;
  currentTextSnapshot: string;
  proposedText: string;
  rationale: string;
  sourceRefs: EntityReference[];
  evidenceRefs: EntityReference[];
  author?: ActorReference;
  createdAt: string;
  structuralFootprint: string;
  previousVersionRef?: EntityId;
  changeNote?: string;
  frozen: true;
}

export interface Decision {
  id: EntityId;
  metadata: EntityMetadata;
  proposalRef: EntityReference;
  proposalVersionRef: EntityReference;
  outcome: DecisionOutcome;
  rationale: string;
  authority: DecisionAuthority;
  decidedBy?: ActorReference;
  institutionalContext?: InstitutionalContext;
  decidedAt?: string;
  effectiveFrom?: string;
  sourceRefs: EntityReference[];
  documentRefs: EntityReference[];
  status: DecisionStatus;
}

export interface DecisionEffectRecord {
  id: EntityId;
  metadata: EntityMetadata;
  decisionRef: EntityReference;
  effectType: DecisionEffectType;
  targetRef?: EntityReference;
  description: string;
  status: DecisionEffectStatus;
  appliedAt?: string;
  appliedBy?: ActorReference;
}

export interface RevisionEvent {
  id: string;
  entityRef: EntityReference;
  eventType: RevisionEventType;
  actor?: ActorReference;
  role?: string;
  timestamp: string;
  previousStatus?: string;
  newStatus?: string;
  rationale?: string;
  references: EntityReference[];
  structuralFootprint: string;
}

export interface RevisionArchive {
  schemaVersion: number;
  updatedAt: string;
  proposals: RevisionProposal[];
  versions: RevisionProposalVersion[];
  decisions: Decision[];
  effects: DecisionEffectRecord[];
  events: RevisionEvent[];
}

export interface RevisionWarning {
  code: string;
  message: string;
  field?: string;
}

export interface RevisionError {
  code: string;
  message: string;
  field?: string;
}

export interface RevisionValidationResult {
  valid: boolean;
  errors: RevisionError[];
  warnings: RevisionWarning[];
}

export type RevisionArchiveOperationResult =
  | { success: true; archive: RevisionArchive }
  | { success: false; errors: RevisionError[] };

export type RevisionProposalCreationResult =
  | { success: true; proposal: RevisionProposal; version: RevisionProposalVersion; archive: RevisionArchive }
  | { success: false; errors: RevisionError[] };

export type RevisionDecisionCreationResult =
  | { success: true; decision: Decision; archive: RevisionArchive }
  | { success: false; errors: RevisionError[] };

export type RevisionTransitionResult =
  | { success: true; archive: RevisionArchive; event: RevisionEvent }
  | { success: false; errors: RevisionError[] };

export type RevisionLegacyAdaptationResult<T> =
  | { ok: true; value: T; warnings: RevisionWarning[] }
  | { ok: false; error: RevisionError; warnings: RevisionWarning[] };