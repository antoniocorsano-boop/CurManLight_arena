import type { Proposal, DecisionStatus as LegacyDecisionStatus, SchoolOrder } from '../../types/curriculum';
import {
  createEntityReference,
  createMetadata,
  generateDeterministicId,
  type EntityId,
} from '../curriculum/identity';
import { createRevisionEvent } from './constructors';
import type {
  Decision,
  RevisionArchive,
  RevisionProposal,
  RevisionProposalVersion,
} from './types';

export type RevisionPresentationChoice =
  | 'confirm-proposal'
  | 'propose-change'
  | 'keep-previous';

export interface RevisionPresentationContext {
  discipline: string;
  order: SchoolOrder;
  academicYear: string;
  scopeKey?: string;
}

export interface RevisionPresentationState {
  choice: RevisionPresentationChoice | null;
  customText: string;
  prepared: boolean;
  source: 'none' | 'legacy' | 'canonical';
  decisionId?: string;
}

export interface LegacyRevisionPresentationSnapshot {
  decisions: Record<string, LegacyDecisionStatus>;
  customTexts: Record<string, string>;
}

const normalizeText = (value: string | null | undefined): string =>
  value?.trim().replace(/\s+/g, ' ') ?? '';

const contextSeed = (context: RevisionPresentationContext): string => [
  context.scopeKey ?? 'general',
  context.discipline,
  context.order,
  context.academicYear || 'unspecified-year',
].join('|');

export function revisionPresentationProposalId(
  context: RevisionPresentationContext,
  proposalId: string,
): EntityId {
  return generateDeterministicId(`revision-presentation-proposal|${contextSeed(context)}|${proposalId}`);
}

function revisionPresentationVersionId(
  context: RevisionPresentationContext,
  proposalId: string,
): EntityId {
  return generateDeterministicId(`revision-presentation-version-v1|${contextSeed(context)}|${proposalId}`);
}

function revisionPresentationTargetId(
  context: RevisionPresentationContext,
  proposalId: string,
): EntityId {
  return generateDeterministicId(`revision-presentation-target|${contextSeed(context)}|${proposalId}`);
}

function revisionPresentationCurriculumVersionId(
  context: RevisionPresentationContext,
): EntityId {
  return generateDeterministicId(`revision-presentation-curriculum|${contextSeed(context)}`);
}

function cloneArchive(archive: RevisionArchive): RevisionArchive {
  return JSON.parse(JSON.stringify(archive));
}

function ensurePresentationProposal(
  archive: RevisionArchive,
  proposal: Proposal,
  context: RevisionPresentationContext,
  now: string,
): RevisionArchive {
  const id = revisionPresentationProposalId(context, proposal.id);
  if (archive.proposals.some((item) => item.id === id)) return archive;

  const updated = cloneArchive(archive);
  const versionId = revisionPresentationVersionId(context, proposal.id);
  const sourceRefs = (proposal.sourceRefs ?? []).map((sourceRef) =>
    createEntityReference(
      generateDeterministicId(`revision-presentation-source|${sourceRef}`),
      'source',
      sourceRef,
    ),
  );

  const canonicalProposal: RevisionProposal = {
    id,
    metadata: createMetadata('legacy', undefined, now),
    targetNodeRef: createEntityReference(
      revisionPresentationTargetId(context, proposal.id),
      'curriculum-node',
      proposal.focus,
    ),
    curriculumVersionRef: createEntityReference(
      revisionPresentationCurriculumVersionId(context),
      'curriculum-version',
      `${context.discipline}/${context.order} ${context.academicYear || ''}`.trim(),
    ),
    currentTextSnapshot: proposal.oldText,
    proposedText: proposal.newText,
    rationale: proposal.notes || '',
    evidenceRefs: [],
    sourceRefs,
    author: undefined,
    institutionalContext: undefined,
    status: 'legacy',
    currentVersionRef: versionId,
    decisionRefs: [],
  };

  const version: RevisionProposalVersion = {
    id: versionId,
    proposalRef: id,
    versionNumber: 1,
    currentTextSnapshot: proposal.oldText,
    proposedText: proposal.newText,
    rationale: proposal.notes || '',
    sourceRefs,
    evidenceRefs: [],
    author: undefined,
    createdAt: now,
    structuralFootprint: '',
    previousVersionRef: undefined,
    changeNote: 'Adattamento di presentazione da proposta legacy',
    frozen: true,
  };

  updated.proposals.push(canonicalProposal);
  updated.versions.push(version);
  updated.events.push(createRevisionEvent({
    entityRef: createEntityReference(id, 'revision-proposal', proposal.focus),
    eventType: 'proposal-created',
    role: 'system',
    newStatus: 'legacy',
    rationale: 'Adattamento compatibile della proposta nella presentazione di revisione',
  }));
  updated.updatedAt = now;
  return updated;
}

function presentationDecisions(
  archive: RevisionArchive,
  proposalId: string,
): Decision[] {
  const active = archive.decisions.filter((decision) =>
    decision.proposalRef.id === proposalId
    && decision.authority.declaredRole === 'docente'
    && !['superseded', 'revoked', 'archived'].includes(decision.status),
  );
  return active.sort((a, b) => {
    const canonicalRank = (value: Decision) => value.status === 'legacy' ? 0 : 1;
    const rankDiff = canonicalRank(b) - canonicalRank(a);
    if (rankDiff !== 0) return rankDiff;
    return b.metadata.createdAt.localeCompare(a.metadata.createdAt);
  });
}

function stateFromDecision(decision: Decision | undefined): RevisionPresentationState {
  if (!decision) return { choice: null, customText: '', prepared: false, source: 'none' };

  if (decision.outcome === 'approve') {
    return {
      choice: 'confirm-proposal',
      customText: '',
      prepared: true,
      source: decision.status === 'legacy' ? 'legacy' : 'canonical',
      decisionId: decision.id,
    };
  }
  if (decision.outcome === 'reject') {
    return {
      choice: 'keep-previous',
      customText: '',
      prepared: true,
      source: decision.status === 'legacy' ? 'legacy' : 'canonical',
      decisionId: decision.id,
    };
  }
  if (decision.outcome === 'approve-with-changes') {
    const customText = normalizeText(decision.rationale);
    return {
      choice: 'propose-change',
      customText,
      prepared: Boolean(customText),
      source: decision.status === 'legacy' ? 'legacy' : 'canonical',
      decisionId: decision.id,
    };
  }
  return {
    choice: null,
    customText: '',
    prepared: false,
    source: decision.status === 'legacy' ? 'legacy' : 'canonical',
    decisionId: decision.id,
  };
}

export function getRevisionPresentationState(
  archive: RevisionArchive,
  proposal: Proposal,
  context: RevisionPresentationContext,
): RevisionPresentationState {
  const proposalId = revisionPresentationProposalId(context, proposal.id);
  return stateFromDecision(presentationDecisions(archive, proposalId)[0]);
}

function outcomeForChoice(choice: RevisionPresentationChoice): Decision['outcome'] {
  if (choice === 'confirm-proposal') return 'approve';
  if (choice === 'keep-previous') return 'reject';
  return 'approve-with-changes';
}

function rationaleForChoice(
  choice: RevisionPresentationChoice,
  customText: string,
): string {
  if (choice === 'confirm-proposal') return 'Conferma professionale della proposta';
  if (choice === 'keep-previous') return 'Mantenimento professionale del testo precedente';
  return normalizeText(customText);
}

export function recordRevisionPresentationChoice(input: {
  archive: RevisionArchive;
  proposal: Proposal;
  context: RevisionPresentationContext;
  choice: RevisionPresentationChoice;
  customText?: string;
  now?: string;
}): RevisionArchive {
  const now = input.now ?? new Date().toISOString();
  const customText = normalizeText(input.customText);
  if (input.choice === 'propose-change' && !customText) return input.archive;

  let updated = ensurePresentationProposal(input.archive, input.proposal, input.context, now);
  updated = cloneArchive(updated);

  const proposalId = revisionPresentationProposalId(input.context, input.proposal.id);
  const canonicalProposal = updated.proposals.find((item) => item.id === proposalId);
  if (!canonicalProposal) return input.archive;

  for (const previous of updated.decisions) {
    if (
      previous.proposalRef.id === proposalId
      && previous.authority.declaredRole === 'docente'
      && previous.status === 'recorded-local'
    ) {
      previous.status = 'superseded';
      updated.events.push(createRevisionEvent({
        entityRef: createEntityReference(previous.id, 'decision', input.proposal.focus),
        eventType: 'decision-superseded',
        role: 'docente',
        previousStatus: 'recorded-local',
        newStatus: 'superseded',
        rationale: 'Sostituita da un nuovo orientamento personale',
      }));
    }
  }

  const decisionId = generateDeterministicId(
    `revision-presentation-decision|${contextSeed(input.context)}|${input.proposal.id}|${now}`,
  );
  const decision: Decision = {
    id: decisionId,
    metadata: createMetadata('teacher', undefined, now),
    proposalRef: createEntityReference(proposalId, 'revision-proposal', input.proposal.focus),
    proposalVersionRef: createEntityReference(
      canonicalProposal.currentVersionRef,
      'revision-proposal',
      'v1',
    ),
    outcome: outcomeForChoice(input.choice),
    rationale: rationaleForChoice(input.choice, customText),
    authority: { declaredRole: 'docente', note: 'Orientamento professionale personale' },
    decidedBy: undefined,
    institutionalContext: undefined,
    decidedAt: now,
    effectiveFrom: undefined,
    sourceRefs: [],
    documentRefs: [],
    status: 'recorded-local',
  };

  updated.decisions.push(decision);
  canonicalProposal.decisionRefs.push(createEntityReference(decisionId, 'decision', input.proposal.focus));
  updated.events.push(createRevisionEvent({
    entityRef: createEntityReference(decisionId, 'decision', input.proposal.focus),
    eventType: 'decision-recorded',
    role: 'docente',
    newStatus: 'recorded-local',
    rationale: decision.rationale,
  }));
  updated.updatedAt = now;
  return updated;
}

export function resetRevisionPresentationChoice(input: {
  archive: RevisionArchive;
  proposal: Proposal;
  context: RevisionPresentationContext;
  now?: string;
}): RevisionArchive {
  const now = input.now ?? new Date().toISOString();
  const proposalId = revisionPresentationProposalId(input.context, input.proposal.id);
  const existingProposal = input.archive.proposals.find((item) => item.id === proposalId);
  if (!existingProposal) return input.archive;

  const updated = cloneArchive(input.archive);
  const canonicalProposal = updated.proposals.find((item) => item.id === proposalId);
  if (!canonicalProposal) return input.archive;

  for (const decision of updated.decisions) {
    if (
      decision.proposalRef.id === proposalId
      && decision.authority.declaredRole === 'docente'
      && decision.status === 'recorded-local'
    ) {
      decision.status = 'superseded';
      updated.events.push(createRevisionEvent({
        entityRef: createEntityReference(decision.id, 'decision', input.proposal.focus),
        eventType: 'decision-superseded',
        role: 'docente',
        previousStatus: 'recorded-local',
        newStatus: 'superseded',
        rationale: 'Orientamento riaperto dal docente',
      }));
    }
  }

  const decisionId = generateDeterministicId(
    `revision-presentation-reopen|${contextSeed(input.context)}|${input.proposal.id}|${now}`,
  );
  const reopeningDecision: Decision = {
    id: decisionId,
    metadata: createMetadata('teacher', undefined, now),
    proposalRef: createEntityReference(proposalId, 'revision-proposal', input.proposal.focus),
    proposalVersionRef: createEntityReference(
      canonicalProposal.currentVersionRef,
      'revision-proposal',
      'v1',
    ),
    outcome: 'defer',
    rationale: 'Orientamento personale riaperto; nessuna scelta corrente',
    authority: { declaredRole: 'docente', note: 'Riapertura esplicita del parere personale' },
    decidedBy: undefined,
    institutionalContext: undefined,
    decidedAt: now,
    effectiveFrom: undefined,
    sourceRefs: [],
    documentRefs: [],
    status: 'recorded-local',
  };

  updated.decisions.push(reopeningDecision);
  canonicalProposal.decisionRefs.push(createEntityReference(decisionId, 'decision', input.proposal.focus));
  updated.events.push(createRevisionEvent({
    entityRef: createEntityReference(decisionId, 'decision', input.proposal.focus),
    eventType: 'decision-recorded',
    role: 'docente',
    newStatus: 'recorded-local',
    rationale: reopeningDecision.rationale,
  }));
  updated.updatedAt = now;
  return updated;
}

export function projectRevisionPresentationLegacyState(input: {
  archive: RevisionArchive;
  proposals: Proposal[];
  context: RevisionPresentationContext;
  legacy?: LegacyRevisionPresentationSnapshot;
}): LegacyRevisionPresentationSnapshot {
  const decisions: Record<string, LegacyDecisionStatus> = {};
  const customTexts: Record<string, string> = {};

  for (const proposal of input.proposals) {
    const state = getRevisionPresentationState(input.archive, proposal, input.context);

    if (state.source === 'none') {
      const legacyStatus = input.legacy?.decisions[proposal.id];
      if (!legacyStatus) continue;
      if (legacyStatus === 'custom') {
        const legacyText = normalizeText(input.legacy?.customTexts[proposal.id]);
        if (!legacyText) continue;
        decisions[proposal.id] = 'custom';
        customTexts[proposal.id] = legacyText;
        continue;
      }
      decisions[proposal.id] = legacyStatus;
      continue;
    }

    if (state.choice === 'confirm-proposal') {
      decisions[proposal.id] = 'approved';
    } else if (state.choice === 'keep-previous') {
      decisions[proposal.id] = 'rejected';
    } else if (state.choice === 'propose-change' && state.customText.trim()) {
      decisions[proposal.id] = 'custom';
      customTexts[proposal.id] = state.customText;
    }
  }

  return { decisions, customTexts };
}

function legacyChoice(status: LegacyDecisionStatus): RevisionPresentationChoice {
  if (status === 'approved') return 'confirm-proposal';
  if (status === 'rejected') return 'keep-previous';
  return 'propose-change';
}

export function migrateLegacyRevisionPresentation(input: {
  archive: RevisionArchive;
  proposals: Proposal[];
  legacy: LegacyRevisionPresentationSnapshot;
  context: RevisionPresentationContext;
  now?: string;
}): RevisionArchive {
  const now = input.now ?? new Date().toISOString();
  let updated = input.archive;

  for (const proposal of input.proposals) {
    const legacyStatus = input.legacy.decisions[proposal.id];
    if (!legacyStatus) continue;

    const current = getRevisionPresentationState(updated, proposal, input.context);
    if (current.source !== 'none') continue;

    updated = ensurePresentationProposal(updated, proposal, input.context, now);
    updated = cloneArchive(updated);

    const canonicalProposalId = revisionPresentationProposalId(input.context, proposal.id);
    const canonicalProposal = updated.proposals.find((item) => item.id === canonicalProposalId);
    if (!canonicalProposal) continue;

    const customText = legacyStatus === 'custom'
      ? normalizeText(input.legacy.customTexts[proposal.id])
      : '';
    if (legacyStatus === 'custom' && !customText) continue;

    const decisionId = generateDeterministicId(
      `revision-presentation-legacy-decision|${contextSeed(input.context)}|${proposal.id}`,
    );
    if (updated.decisions.some((decision) => decision.id === decisionId)) continue;

    const choice = legacyChoice(legacyStatus);
    const decision: Decision = {
      id: decisionId,
      metadata: createMetadata('legacy', undefined, now),
      proposalRef: createEntityReference(canonicalProposalId, 'revision-proposal', proposal.focus),
      proposalVersionRef: createEntityReference(
        canonicalProposal.currentVersionRef,
        'revision-proposal',
        'v1',
      ),
      outcome: outcomeForChoice(choice),
      rationale: choice === 'propose-change'
        ? customText
        : `Registrazione da compatibilità legacy: ${legacyStatus}`,
      authority: { declaredRole: 'docente', note: 'Scelta personale migrata senza promozione di autorità' },
      decidedBy: undefined,
      institutionalContext: undefined,
      decidedAt: undefined,
      effectiveFrom: undefined,
      sourceRefs: [],
      documentRefs: [],
      status: 'legacy',
    };

    updated.decisions.push(decision);
    canonicalProposal.decisionRefs.push(createEntityReference(decisionId, 'decision', proposal.focus));
    updated.events.push(createRevisionEvent({
      entityRef: createEntityReference(decisionId, 'decision', proposal.focus),
      eventType: 'decision-recorded',
      role: 'system',
      newStatus: 'legacy',
      rationale: `Migrazione di presentazione da scelta legacy: ${legacyStatus}`,
    }));
    updated.updatedAt = now;
  }

  return updated;
}
