/**
 * CML-633H — A03→A04 Transfer
 *
 * Transfers revision proposal selections into teaching design.
 * Implements the CML-633G transfer matrix for qualification.
 * Creates immutable snapshots — source changes do not affect the design.
 */

import type { EntityReference, EntityType } from '../curriculum/identity/types';
import type {
  DesignArchive,
  DesignTransferResult,
  DesignTransferWarning,
  DesignQualification,
} from './types';
import type { RevisionArchive, RevisionProposal, Decision } from '../revision/types';
import { createDesignCurriculumSelection } from './constructors';
import { validateDesignCurriculumSelection } from './validators';
import { computeStructuralFootprint } from '../transfer/signatures';

// ─── A03→A04 Transfer ──────────────────────────────────────────────────

export function executeA03ToA04Transfer(
  proposalRefs: EntityReference[],
  _archive: DesignArchive,
  revisionArchive: RevisionArchive,
  designRef: EntityReference,
): DesignTransferResult {
  const warnings: DesignTransferWarning[] = [];

  if (!proposalRefs || proposalRefs.length === 0) {
    return {
      ok: false,
      error: { code: 'MISSING_PROPOSAL_REFS', message: 'No proposal references provided' },
      warnings: [],
    };
  }

  const firstRef = proposalRefs[0];
  const proposal = revisionArchive.proposals.find(p => p.id === firstRef.id);

  if (!proposal) {
    return {
      ok: false,
      error: { code: 'PROPOSAL_NOT_FOUND', message: `Proposal ${firstRef.id} not found in revision archive` },
      warnings: [],
    };
  }

  // Apply transfer matrix from CML-633G
  const matrixResult = evaluateTransferMatrix(proposal, revisionArchive);

  if (!matrixResult.transferable) {
    return {
      ok: false,
      error: { code: 'NOT_TRANSFERABLE', message: matrixResult.reason ?? 'Proposal not transferable' },
      warnings: matrixResult.warnings,
    };
  }

  // Preserve warnings from matrix evaluation
  for (const w of matrixResult.warnings) {
    warnings.push(w);
  }

  const version = revisionArchive.versions.find(v => v.id === proposal.currentVersionRef);

  const sourceEntityRef: EntityReference = {
    id: proposal.id,
    entityType: 'revision-proposal' as EntityType,
    snapshotLabel: proposal.targetNodeRef.snapshotLabel,
  };

  const structuralFootprint = String(computeStructuralFootprint({
    entityId: proposal.id,
    snapshot: proposal.proposedText,
    versionRef: String(proposal.currentVersionRef),
    status: proposal.status,
    qualification: matrixResult.qualification,
  }));

  const selection = createDesignCurriculumSelection({
    designRef: { ...designRef },
    sourceArea: 'A03',
    sourceEntityRef,
    sourceVersionRef: version
      ? { id: version.id, entityType: 'revision-proposal' as EntityType }
      : undefined,
    curriculumNodeRef: proposal.targetNodeRef ? { ...proposal.targetNodeRef } : undefined,
    curriculumVersionRef: proposal.curriculumVersionRef ? { ...proposal.curriculumVersionRef } : undefined,
    currentTextSnapshot: proposal.currentTextSnapshot,
    selectedTextSnapshot: version?.proposedText ?? proposal.proposedText,
    qualification: matrixResult.qualification,
    sourceRefs: [...proposal.sourceRefs],
    evidenceRefs: [...proposal.evidenceRefs],
    transferContractVersion: '1.0',
    structuralFootprint,
  });

  const validation = validateDesignCurriculumSelection(selection);
  if (!validation.valid) {
    return {
      ok: false,
      error: validation.errors[0],
      warnings,
    };
  }

  return {
    ok: true,
    selection,
    warnings,
  };
}

// ─── Transfer Matrix ────────────────────────────────────────────────────

interface MatrixResult {
  transferable: boolean;
  qualification: DesignQualification;
  reason?: string;
  decision?: Decision;
  warnings: DesignTransferWarning[];
}

function evaluateTransferMatrix(
  proposal: RevisionProposal,
  archive: RevisionArchive,
): MatrixResult {
  const s = proposal.status;
  const warnings: DesignTransferWarning[] = [];

  const decisions = archive.decisions
    .filter(d => d.proposalRef.id === proposal.id)
    .sort((a, b) => b.metadata.createdAt.localeCompare(a.metadata.createdAt));
  const latestDecision = decisions.length > 0 ? decisions[0] : undefined;

  // ─── Non-transferable states ────────────────────────────────────

  if (s === 'draft') {
    return { transferable: false, qualification: 'proposed-content', reason: 'Draft proposals are not transferable', warnings: [] };
  }
  if (s === 'ready-for-review') {
    return { transferable: false, qualification: 'proposed-content', reason: 'Proposals not yet submitted are not transferable', warnings: [] };
  }
  if (s === 'changes-requested') {
    return { transferable: false, qualification: 'proposed-content', reason: 'Proposals requiring changes are not transferable', warnings: [] };
  }
  if (s === 'rejected') {
    return { transferable: false, qualification: 'proposed-content', reason: 'Rejected proposals are not transferable', warnings: [] };
  }
  if (s === 'withdrawn') {
    return { transferable: false, qualification: 'proposed-content', reason: 'Withdrawn proposals are not transferable', warnings: [] };
  }
  if (s === 'archived') {
    return { transferable: false, qualification: 'proposed-content', reason: 'Archived proposals are not transferable', warnings: [] };
  }

  // ─── Legacy ─────────────────────────────────────────────────────

  if (s === 'legacy') {
    if (latestDecision && latestDecision.outcome === 'reject') {
      return { transferable: false, qualification: 'legacy-content', reason: 'Legacy rejected proposal not transferable', warnings: [] };
    }
    warnings.push({ code: 'LEGACY_TRANSFER', message: 'Legacy content transferred with warning. Sources and metadata may be incomplete.' });
    return {
      transferable: true,
      qualification: 'legacy-content',
      decision: latestDecision,
      warnings,
    };
  }

  // ─── Decision-based (checked before proposed content) ─────────

  if (latestDecision && latestDecision.status === 'recorded-local') {
    switch (latestDecision.outcome) {
      case 'approve':
        return {
          transferable: true,
          qualification: 'planned-institute-content',
          decision: latestDecision,
          warnings: [{ code: 'PLANNED_INSTITUTE', message: 'Decision recorded locally. Planned institute content — not officially adopted.' }],
        };

      case 'approve-with-changes':
        return {
          transferable: true,
          qualification: 'planned-institute-content',
          decision: latestDecision,
          warnings: [{ code: 'APPROVE_WITH_CHANGES', message: 'Version accepted with changes. Only the referenced version is transferred.' }],
        };

      case 'reject':
        return { transferable: false, qualification: 'planned-institute-content', reason: 'Rejected by decision', warnings: [] };

      case 'defer':
        return { transferable: false, qualification: 'planned-institute-content', reason: 'Deferred decision — not transferable', warnings: [] };

      case 'record-only':
        warnings.push({ code: 'RECORD_ONLY', message: 'Record-only decision — no curricular effect. Content shown as proposed.' });
        return {
          transferable: true,
          qualification: 'proposed-content',
          warnings,
        };
    }
  }

  // Fallback: treat as proposed content
  return {
    transferable: true,
    qualification: 'proposed-content',
    warnings: [{ code: 'FALLBACK', message: 'No decision found, treating as proposed content.' }],
  };
}