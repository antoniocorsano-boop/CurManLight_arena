import { generateEntityId, createMetadata, createEntityReference } from '../curriculum/identity';
import type { RevisionArchive, Decision, RevisionProposal, RevisionProposalVersion, RevisionError, RevisionValidationResult } from './types';
import { createEmptyRevisionArchive } from './constructors';
import { createRevisionEvent } from './constructors';
import { validateProposal, validateDecision, validateArchiveIntegrity } from './validators';
import type { LegacyDecisionStatus, LegacyProposal } from './legacyTypes';

export interface LegacyStateSnapshot {
  decisions: Record<string, LegacyDecisionStatus>;
  customTexts: Record<string, string>;
}

export interface ImportLegacyProposalsInput {
  proposals: LegacyProposal[];
  state: LegacyStateSnapshot;
  disciplineSnapshot: string;
  schoolOrderSnapshot: string;
  academicYearSnapshot: string;
}

export function importLegacyProposals(input: ImportLegacyProposalsInput, now = new Date().toISOString()): RevisionArchive {
  const archive = createEmptyRevisionArchive(now);

  for (const legacy of input.proposals) {
    const proposalId = generateEntityId();
    const targetNodeRef = createEntityReference(proposalId, 'curriculum-node', `${input.disciplineSnapshot}/${input.schoolOrderSnapshot}: ${legacy.focus}`);
    const curriculumVersionRef = createEntityReference(generateEntityId(), 'curriculum-version', `Curricolo ${input.academicYearSnapshot}`);

    const proposal: RevisionProposal = {
      id: proposalId,
      metadata: createMetadata('teacher', undefined, now),
      targetNodeRef,
      curriculumVersionRef,
      currentTextSnapshot: legacy.oldText,
      proposedText: legacy.newText,
      rationale: legacy.notes || '',
      evidenceRefs: [],
      sourceRefs: [],
      author: undefined,
      institutionalContext: undefined,
      status: 'legacy',
      currentVersionRef: proposalId,
      decisionRefs: [],
    };

    const version: RevisionProposalVersion = {
      id: proposalId,
      proposalRef: proposalId,
      versionNumber: 1,
      currentTextSnapshot: legacy.oldText,
      proposedText: legacy.newText,
      rationale: legacy.notes || '',
      sourceRefs: [],
      evidenceRefs: [],
      author: undefined,
      createdAt: now,
      structuralFootprint: '',
      previousVersionRef: undefined,
      changeNote: 'Importata da repository legacy A03',
      frozen: true,
    };

    archive.proposals.push(proposal);
    archive.versions.push(version);

    archive.events.push(createRevisionEvent({
      entityRef: { id: proposalId, entityType: 'revision-proposal', snapshotLabel: legacy.focus },
      eventType: 'proposal-created',
      role: 'system',
      previousStatus: undefined,
      newStatus: 'legacy',
      rationale: 'Importazione automatica da A03 legacy',
    }));

    const legacyStatus = input.state.decisions[legacy.id];
    if (legacyStatus) {
      const outcome = mapLegacyOutcome(legacyStatus);
      const customText = legacyStatus === 'custom' ? input.state.customTexts[legacy.id] || '' : '';

      const decisionId = generateEntityId();
      const decision: Decision = {
        id: decisionId,
        metadata: createMetadata('teacher', undefined, now),
        proposalRef: createEntityReference(proposalId, 'revision-proposal', legacy.focus),
        proposalVersionRef: createEntityReference(proposalId, 'revision-proposal', 'v1'),
        outcome,
        rationale: customText || 'Registrazione da eredità legacy A03',
        authority: { declaredRole: 'docente' },
        decidedBy: undefined,
        institutionalContext: undefined,
        decidedAt: now,
        effectiveFrom: now,
        sourceRefs: [],
        documentRefs: [],
        status: 'legacy',
      };

      proposal.decisionRefs.push(createEntityReference(decisionId, 'decision', legacy.focus));
      archive.decisions.push(decision);

      archive.events.push(createRevisionEvent({
        entityRef: { id: decisionId, entityType: 'decision', snapshotLabel: legacy.focus },
        eventType: 'decision-recorded',
        role: 'system',
        previousStatus: undefined,
        newStatus: 'legacy',
        rationale: `Decisione legacy importata: ${outcome}`,
      }));
    }
  }

  return archive;
}

export function exportLegacyState(archive: RevisionArchive): LegacyStateSnapshot {
  const decisions: Record<string, LegacyDecisionStatus> = {};
  const customTexts: Record<string, string> = {};

  for (const proposal of archive.proposals) {
    if (proposal.status !== 'legacy') continue;

    const decision = archive.decisions.find(d => d.proposalRef.id === proposal.id && d.status !== 'archived');
    if (!decision) continue;

    const legacyStatus = reverseMapOutcome(decision.outcome, decision.rationale);
    decisions[proposal.id] = legacyStatus;

    if (legacyStatus === 'custom') {
      customTexts[proposal.id] = decision.rationale;
    }
  }

  return { decisions, customTexts };
}

export function exportLegacyProposalShape(proposal: RevisionProposal, archive: RevisionArchive): LegacyProposal {
  const version = archive.versions.find(v => v.id === proposal.currentVersionRef);
  const focus = proposal.targetNodeRef.snapshotLabel || proposal.targetNodeRef.id;
  return {
    id: proposal.id,
    focus,
    oldText: version?.currentTextSnapshot ?? proposal.currentTextSnapshot,
    newText: version?.proposedText ?? proposal.proposedText,
    notes: version?.rationale ?? proposal.rationale,
  };
}

export function validateLegacyImport(archive: RevisionArchive): RevisionValidationResult {
  const errors: RevisionError[] = [];

  for (const p of archive.proposals) {
    if (p.status !== 'legacy') continue;
    const pe = validateProposal(p);
    errors.push(...pe.errors);
  }

  for (const d of archive.decisions) {
    if (d.status !== 'legacy') continue;
    const de = validateDecision(d);
    errors.push(...de.errors);
  }

  const ae = validateArchiveIntegrity(archive);
  errors.push(...ae.errors);

  return errors.length > 0 ? { valid: false, errors, warnings: [] } : { valid: true, errors, warnings: [] };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function mapLegacyOutcome(legacyStatus: LegacyDecisionStatus): Decision['outcome'] {
  switch (legacyStatus) {
    case 'approved': return 'approve';
    case 'rejected': return 'reject';
    case 'custom': return 'approve-with-changes';
  }
}

function reverseMapOutcome(outcome: Decision['outcome'], rationale: string): LegacyDecisionStatus {
  switch (outcome) {
    case 'approve': return 'approved';
    case 'reject': return 'rejected';
    case 'approve-with-changes': return 'custom';
    default: return rationale ? 'custom' : 'approved';
  }
}