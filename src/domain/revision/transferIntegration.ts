/**
 * A02→A03→A04→A07 transfer contracts for the revision domain.
 *
 * Uses CML-633E contracts for cross-area transfers.
 * All operations are immutable: they return new archives.
 * No double-write to legacy fields.
 */

import type {
  RevisionArchive,
  RevisionProposal,
  Decision,
  EntityReference,
  RevisionError,
  RevisionWarning,
} from './types';
import { cloneRevisionArchive } from './constructors';
import { addProposal } from './repository';
import { createEntityReference } from '../curriculum/identity';
import type { EntityId, EntityType } from '../curriculum/identity/types';

// ─── A02→A03 Payload ───────────────────────────────────────────────────────

export interface A02ToA03Payload {
  readonly curriculumNodeRef: { readonly entityId: string; readonly entityType: string; readonly label?: string };
  readonly curriculumVersionRef: { readonly entityId: string; readonly entityType: string; readonly label?: string };
  readonly textSnapshot: string;
  readonly sources: ReadonlyArray<string>;
  readonly evidences: ReadonlyArray<string>;
  readonly contentOrigin: string;
  readonly institutionalContext?: {
    readonly instituteRef?: string;
    readonly academicYearRef?: string;
    readonly siteRef?: string;
  };
  readonly warnings: ReadonlyArray<string>;
  readonly contractVersion: number;
  readonly structuralFootprint: string;
}

export interface A02ToA03ProposalResult {
  success: boolean;
  proposal?: RevisionProposal;
  archive: RevisionArchive;
  errors: RevisionError[];
  warnings: RevisionWarning[];
}

/**
 * Execute A02→A03 transfer: creates a draft RevisionProposal from a curriculum consultation payload.
 *
 * Creates:
 * - Draft RevisionProposal targeting the curriculum node
 * - Version 1 with text snapshot from source
 * - Sources and evidences preserved
 * - Content origin preserved
 * - Warnings preserved
 *
 * Does NOT:
 * - Create decisions
 * - Set approval
 * - Modify curriculum
 * - Delete legacy data
 */
export function executeA02ToA03ProposalTransfer(
  payload: A02ToA03Payload,
  archive: RevisionArchive,
): A02ToA03ProposalResult {
  const warnings: RevisionWarning[] = [];

  // Validate payload
  if (payload.contractVersion < 1) {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'INVALID_CONTRACT_VERSION', message: `Unsupported contract version: ${payload.contractVersion}` }],
      warnings: [],
    };
  }

  if (!payload.curriculumNodeRef || !payload.curriculumNodeRef.entityId) {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'MISSING_CURRICULUM_NODE', message: 'curriculumNodeRef is required' }],
      warnings: [],
    };
  }

  if (!payload.textSnapshot) {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'MISSING_TEXT_SNAPSHOT', message: 'textSnapshot is required' }],
      warnings: [],
    };
  }

  // Preserve incoming warnings
  for (const w of payload.warnings) {
    warnings.push({ code: 'A02_WARNING', message: w });
  }

  // Build entity references
  const targetNodeRef = createEntityReference(
    payload.curriculumNodeRef.entityId as EntityId,
    payload.curriculumNodeRef.entityType as EntityType,
    payload.curriculumNodeRef.label,
  );

  const curriculumVersionRef = createEntityReference(
    payload.curriculumVersionRef.entityId as EntityId,
    payload.curriculumVersionRef.entityType as EntityType,
    payload.curriculumVersionRef.label,
  );

  const sourceRefs = payload.sources.map(s =>
    createEntityReference(s as EntityId, 'source' as EntityType),
  );

  // A02 evidence identifiers refer to curriculum nodes whose domain nodeType is
  // `evidence`; `evidence` itself is not a canonical EntityType. Preserve the
  // semantic identity as a canonical curriculum-node reference.
  const evidenceRefs = payload.evidences.map(e =>
    createEntityReference(e as EntityId, 'curriculum-node'),
  );

  // Create the proposal via repository
  const result = addProposal(archive, {
    targetNodeRef,
    curriculumVersionRef,
    currentTextSnapshot: payload.textSnapshot,
    proposedText: payload.textSnapshot,
    rationale: '',
    sourceRefs,
    evidenceRefs,
    origin: payload.contentOrigin as never,
    institutionalContext: payload.institutionalContext ? {
      instituteRef: payload.institutionalContext.instituteRef
        ? createEntityReference(payload.institutionalContext.instituteRef as EntityId, 'institute' as EntityType)
        : undefined,
      academicYearRef: payload.institutionalContext.academicYearRef
        ? createEntityReference(payload.institutionalContext.academicYearRef as EntityId, 'academic-year' as EntityType)
        : undefined,
      siteRef: payload.institutionalContext.siteRef
        ? createEntityReference(payload.institutionalContext.siteRef as EntityId, 'site' as EntityType)
        : undefined,
    } : undefined,
  });

  if (!result.success) {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: result.errors,
      warnings,
    };
  }

  // Append warnings to result
  warnings.push({ code: 'A02_TO_A03_DRAFT_CREATED', message: 'Draft proposal created from consultation. No decision, no curriculum modification.' });

  return {
    success: true,
    proposal: result.proposal,
    archive: result.archive,
    errors: [],
    warnings,
  };
}

// ─── A03→A04 Transfer ──────────────────────────────────────────────────────

export interface A03ToA04TransferResult {
  success: boolean;
  transferableProposals: Array<{
    proposalRef: EntityReference;
    status: string;
    proposedText: string;
    currentTextSnapshot: string;
    transferType: 'proposed-content' | 'planned-institute-content' | 'legacy-with-warning';
    decisionRef?: EntityReference;
    decisionOutcome?: string;
    warnings: RevisionWarning[];
  }>;
  nonTransferableProposals: Array<{
    proposalRef: EntityReference;
    status: string;
    reason: string;
  }>;
  errors: RevisionError[];
  warnings: RevisionWarning[];
}

/**
 * A03→A04 transfer matrix:
 *
 * | Status/Outcome                        | Behavior                             |
 * |---------------------------------------|--------------------------------------|
 * | draft                                 | non transferable                     |
 * | ready-for-review                      | non transferable                     |
 * | submitted                             | proposed content                     |
 * | under-review                          | proposed content                     |
 * | changes-requested                     | non transferable                     |
 * | accepted-for-decision                 | proposed content                     |
 * | rejected                              | non transferable                     |
 * | decision approve + recorded-local     | planned institute content            |
 * | approve-with-changes                  | only version referenced by decision  |
 * | reject (decision)                     | non transferable                     |
 * | defer                                 | non transferable                     |
 * | record-only                           | no curricular effect                 |
 * | legacy                                | transferable with warning only       |
 */
export function executeA03ToA04ProposalTransfer(
  proposalRefs: EntityReference[],
  archive: RevisionArchive,
): A03ToA04TransferResult {
  const errors: RevisionError[] = [];
  const warnings: RevisionWarning[] = [];
  const transferableProposals: A03ToA04TransferResult['transferableProposals'] = [];
  const nonTransferableProposals: A03ToA04TransferResult['nonTransferableProposals'] = [];

  for (const ref of proposalRefs) {
    const proposal = archive.proposals.find(p => p.id === ref.id);
    if (!proposal) {
      nonTransferableProposals.push({
        proposalRef: ref,
        status: 'unknown',
        reason: 'Proposal not found in archive',
      });
      continue;
    }

    const latestDecision = archive.decisions
      .filter(d => d.proposalRef.id === proposal.id)
      .reduce<Decision | undefined>((latest, d) =>
        !latest || d.metadata.createdAt > latest.metadata.createdAt ? d : latest, undefined);

    const s = proposal.status;

    // Transferability matrix
    if (s === 'draft') {
      nonTransferableProposals.push({ proposalRef: ref, status: s, reason: 'Draft proposals are not transferable' });
      continue;
    }

    if (s === 'ready-for-review') {
      nonTransferableProposals.push({ proposalRef: ref, status: s, reason: 'Proposals not yet submitted are not transferable' });
      continue;
    }

    if (s === 'changes-requested') {
      nonTransferableProposals.push({ proposalRef: ref, status: s, reason: 'Proposals requiring changes are not transferable' });
      continue;
    }

    if (s === 'rejected') {
      nonTransferableProposals.push({ proposalRef: ref, status: s, reason: 'Rejected proposals are not transferable' });
      continue;
    }

    if (s === 'legacy') {
      const decision = latestDecision;
      if (decision && decision.outcome === 'reject') {
        nonTransferableProposals.push({ proposalRef: ref, status: s, reason: 'Legacy rejected proposal not transferable' });
        continue;
      }
      transferableProposals.push({
        proposalRef: ref,
        status: s,
        proposedText: proposal.proposedText,
        currentTextSnapshot: proposal.currentTextSnapshot,
        transferType: 'legacy-with-warning',
        decisionRef: decision ? { id: decision.id, entityType: 'decision' } : undefined,
        decisionOutcome: decision?.outcome,
        warnings: [{ code: 'LEGACY_TRANSFER', message: 'Legacy content transferred with warning. Not verified.' }],
      });
      continue;
    }

    // submitted, under-review, accepted-for-decision → proposed content
    if (s === 'submitted' || s === 'under-review' || s === 'accepted-for-decision') {
      transferableProposals.push({
        proposalRef: ref,
        status: s,
        proposedText: proposal.proposedText,
        currentTextSnapshot: proposal.currentTextSnapshot,
        transferType: 'proposed-content',
        warnings: [],
      });
      continue;
    }

    // withdrawn, archived — not transferable
    if (s === 'withdrawn' || s === 'archived') {
      nonTransferableProposals.push({ proposalRef: ref, status: s, reason: `${s} proposals are not transferable` });
      continue;
    }

    // Has an approved decision?
    if (latestDecision && latestDecision.status === 'recorded-local') {
      if (latestDecision.outcome === 'approve') {
        transferableProposals.push({
          proposalRef: ref,
          status: s,
          proposedText: proposal.proposedText,
          currentTextSnapshot: proposal.currentTextSnapshot,
          transferType: 'planned-institute-content',
          decisionRef: { id: latestDecision.id, entityType: 'decision' },
          decisionOutcome: latestDecision.outcome,
          warnings: [],
        });
        continue;
      }

      if (latestDecision.outcome === 'approve-with-changes') {
        const version = archive.versions.find(v => v.id === latestDecision.proposalVersionRef.id);
        transferableProposals.push({
          proposalRef: ref,
          status: s,
          proposedText: version?.proposedText ?? proposal.proposedText,
          currentTextSnapshot: version?.currentTextSnapshot ?? proposal.currentTextSnapshot,
          transferType: 'planned-institute-content',
          decisionRef: { id: latestDecision.id, entityType: 'decision' },
          decisionOutcome: latestDecision.outcome,
          warnings: [{ code: 'APPROVE_WITH_CHANGES', message: 'Version accepted with changes. Only the referenced version is transferred.' }],
        });
        continue;
      }

      if (latestDecision.outcome === 'reject') {
        nonTransferableProposals.push({ proposalRef: ref, status: s, reason: 'Rejected by decision' });
        continue;
      }

      if (latestDecision.outcome === 'defer') {
        nonTransferableProposals.push({ proposalRef: ref, status: s, reason: 'Deferred decision — not transferable' });
        continue;
      }

      if (latestDecision.outcome === 'record-only') {
        warnings.push({ code: 'RECORD_ONLY', message: `Proposal ${proposal.id} has record-only decision — no curricular effect` });
        nonTransferableProposals.push({ proposalRef: ref, status: s, reason: 'Record-only decision — no curricular effect' });
        continue;
      }
    }
  }

  return {
    success: transferableProposals.length > 0,
    transferableProposals,
    nonTransferableProposals,
    errors,
    warnings,
  };
}
