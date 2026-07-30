import type { RevisionProposalStatus, DecisionStatus, DecisionOutcome, DecisionAuthorityRole, RevisionEventType, DecisionEffectType, DecisionEffectStatus } from './types';

export const REVISION_ARCHIVE_SCHEMA_VERSION = 1;

export const VALID_PROPOSAL_STATUSES: readonly RevisionProposalStatus[] = [
  'draft', 'ready-for-review', 'submitted', 'under-review', 'changes-requested',
  'withdrawn', 'accepted-for-decision', 'rejected', 'archived', 'legacy',
] as const;

export const VALID_DECISION_STATUSES: readonly DecisionStatus[] = [
  'draft', 'recorded-local', 'superseded', 'revoked', 'archived', 'legacy',
] as const;

export const VALID_DECISION_OUTCOMES: readonly DecisionOutcome[] = [
  'approve', 'approve-with-changes', 'reject', 'defer', 'return-for-revision', 'record-only',
] as const;

export const VALID_AUTHORITY_ROLES: readonly DecisionAuthorityRole[] = [
  'docente', 'dipartimento', 'coordinatore', 'referente-curricolo',
  'dirigente-scolastico', 'collegio-docenti', 'consiglio-istituto', 'altro',
] as const;

export const VALID_EVENT_TYPES: readonly RevisionEventType[] = [
  'proposal-created', 'proposal-modified', 'version-created', 'proposal-submitted',
  'proposal-taken-over', 'changes-requested', 'proposal-withdrawn', 'decision-recorded',
  'decision-superseded', 'decision-revoked', 'proposal-archived', 'document-generated',
  'curricular-effect-applied',
] as const;

export const VALID_EFFECT_TYPES: readonly DecisionEffectType[] = [
  'none', 'new-proposal', 'planned-update', 'new-institute-node',
  'node-replacement', 'archive', 'defer',
] as const;

export const VALID_EFFECT_STATUSES: readonly DecisionEffectStatus[] = [
  'planned', 'applied-local', 'cancelled', 'legacy',
] as const;

// ─── Proposal State Machine ────────────────────────────────────────────────

export const PROPOSAL_STATUS_TRANSITIONS: Record<RevisionProposalStatus, readonly RevisionProposalStatus[]> = {
  'draft': ['ready-for-review'],
  'ready-for-review': ['submitted'],
  'submitted': ['under-review', 'withdrawn'],
  'under-review': ['changes-requested', 'accepted-for-decision', 'rejected'],
  'changes-requested': ['ready-for-review', 'withdrawn'],
  'withdrawn': ['archived'],
  'accepted-for-decision': ['archived'],
  'rejected': ['archived'],
  'archived': [],
  'legacy': ['draft', 'archived'],
};

export function canTransitionProposalStatus(
  current: RevisionProposalStatus,
  next: RevisionProposalStatus,
): boolean {
  if (current === next) return false;
  return PROPOSAL_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

// ─── Decision State Machine ────────────────────────────────────────────────

export const DECISION_STATUS_TRANSITIONS: Record<DecisionStatus, readonly DecisionStatus[]> = {
  'draft': ['recorded-local'],
  'recorded-local': ['superseded', 'revoked', 'archived'],
  'superseded': ['archived'],
  'revoked': ['archived'],
  'archived': [],
  'legacy': ['draft', 'archived'],
};

export function canTransitionDecisionStatus(
  current: DecisionStatus,
  next: DecisionStatus,
): boolean {
  if (current === next) return false;
  return DECISION_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

// ─── Labels ────────────────────────────────────────────────────────────────

export const PROPOSAL_STATUS_LABELS: Record<RevisionProposalStatus, string> = {
  'draft': 'Bozza',
  'ready-for-review': 'Pronta per revisione',
  'submitted': 'Inviata',
  'under-review': 'In esame',
  'changes-requested': 'Modifiche richieste',
  'withdrawn': 'Ritirata',
  'accepted-for-decision': 'Amessa alla decisione',
  'rejected': 'Respinta',
  'archived': 'Archiviata',
  'legacy': 'Legacy',
};

export const DECISION_OUTCOME_LABELS: Record<DecisionOutcome, string> = {
  'approve': 'Approvata',
  'approve-with-changes': 'Approvata con modifiche',
  'reject': 'Respinta',
  'defer': 'Rinviata',
  'return-for-revision': 'Restituita per revisione',
  'record-only': 'Solo registrazione',
};

export const DECISION_STATUS_LABELS: Record<DecisionStatus, string> = {
  'draft': 'Bozza',
  'recorded-local': 'Registrata localmente',
  'superseded': 'Sostituita',
  'revoked': 'Revocata',
  'archived': 'Archiviata',
  'legacy': 'Legacy',
};

export const AUTHORITY_ROLE_LABELS: Record<DecisionAuthorityRole, string> = {
  'docente': 'Docente',
  'dipartimento': 'Dipartimento',
  'coordinatore': 'Coordinatore di dipartimento',
  'referente-curricolo': 'Referente curricolo',
  'dirigente-scolastico': 'Dirigente scolastico',
  'collegio-docenti': 'Collegio dei docenti',
  'consiglio-istituto': 'Consiglio d\'istituto',
  'altro': 'Altro organo dichiarato',
};