/**
 * CML-633H — Design Transfer Conflict Handling
 *
 * Detects and resolves conflicts when transferring curriculum selections
 * into teaching designs. No automatic replacement, no silent overwrites.
 */

import type {
  DesignArchive,
  DesignCurriculumSelection,
  DesignTransferWarning,
  DesignTransferError,
} from './types';
import { cloneDesignArchive } from './constructors';
import {
  findSelectionBySource,
  addSelection,
} from './archive';

// ─── Conflict Types ─────────────────────────────────────────────────────

export type DesignConflictType =
  | 'duplicate-source'
  | 'source-version-mismatch'
  | 'multiple-snapshots-for-node'
  | 'proposal-superseded'
  | 'decision-revoked'
  | 'decision-superseded'
  | 'source-unavailable'
  | 'source-reference-unresolved'
  | 'legacy-incomplete'
  | 'experimental-confirmation-required'
  | 'future-schema';

export interface DesignConflict {
  type: DesignConflictType;
  existingSelection?: DesignCurriculumSelection;
  incomingSelection?: DesignCurriculumSelection;
  message: string;
  resolvable: boolean;
}

// ─── Conflict Detection ────────────────────────────────────────────────

/**
 * Detect conflicts between an incoming selection and the existing archive.
 * Does not modify the archive.
 */
export function detectConflicts(
  incoming: DesignCurriculumSelection,
  archive: DesignArchive,
): DesignConflict[] {
  const conflicts: DesignConflict[] = [];
  const existingBySource = findSelectionBySource(archive, incoming.sourceEntityRef.id);

  // Duplicate source — same source entity already selected
  if (existingBySource.length > 0) {
    conflicts.push({
      type: 'duplicate-source',
      existingSelection: existingBySource[0],
      incomingSelection: incoming,
      message: `Source entity ${incoming.sourceEntityRef.id} already has ${existingBySource.length} selection(s) in this design`,
      resolvable: true,
    });

    // Version mismatch
    for (const existing of existingBySource) {
      if (existing.sourceVersionRef?.id !== incoming.sourceVersionRef?.id) {
        conflicts.push({
          type: 'source-version-mismatch',
          existingSelection: existing,
          incomingSelection: incoming,
          message: `Version mismatch: existing=${existing.sourceVersionRef?.id}, incoming=${incoming.sourceVersionRef?.id}`,
          resolvable: true,
        });
      }
    }
  }

  // Multiple snapshots for same node
  const sameNode = archive.selections.filter(
    s => s.curriculumNodeRef?.id === incoming.curriculumNodeRef?.id,
  );
  if (sameNode.length > 1) {
    conflicts.push({
      type: 'multiple-snapshots-for-node',
      message: `${sameNode.length + 1} snapshots for curriculum node ${incoming.curriculumNodeRef?.id}`,
      resolvable: true,
    });
  }

  // Legacy content
  if (incoming.qualification === 'legacy-content') {
    conflicts.push({
      type: 'legacy-incomplete',
      incomingSelection: incoming,
      message: 'Legacy content may have missing sources, version, or metadata',
      resolvable: true,
    });
  }

  // Experimental content requires confirmation
  if (incoming.qualification === 'experimental-content') {
    conflicts.push({
      type: 'experimental-confirmation-required',
      incomingSelection: incoming,
      message: 'Experimental content requires explicit confirmation before transfer',
      resolvable: true,
    });
  }

  // Source reference not fully resolved
  if (!incoming.sourceEntityRef || typeof incoming.sourceEntityRef.id !== 'string') {
    conflicts.push({
      type: 'source-reference-unresolved',
      incomingSelection: incoming,
      message: 'Source entity reference is not fully resolved',
      resolvable: false,
    });
  }

  return conflicts;
}

// ─── Conflict Resolution ───────────────────────────────────────────────

export type ConflictResolutionStrategy =
  | 'keep-existing'
  | 'add-as-new-version'
  | 'replace-snapshot'
  | 'keep-both'
  | 'cancel';

export interface ConflictResolutionResult {
  success: boolean;
  archive: DesignArchive;
  selection?: DesignCurriculumSelection;
  errors: DesignTransferError[];
  warnings: DesignTransferWarning[];
}

/**
 * Add a selection with conflict checks.
 * If duplicates exist with 'keep-existing' strategy, returns existing.
 * With 'add-as-new-version', appends new selection.
 * With 'replace-snapshot', updates existing selection's snapshot.
 * With 'cancel', returns without changes.
 */
export function addSelectionWithConflictResolution(
  archive: DesignArchive,
  incoming: DesignCurriculumSelection,
  strategy: ConflictResolutionStrategy = 'keep-existing',
): ConflictResolutionResult {
  const conflicts = detectConflicts(incoming, archive);

  // Unresolvable conflicts block transfer
  const blockers = conflicts.filter(c => !c.resolvable);
  if (blockers.length > 0) {
    return {
      success: false,
      archive: cloneDesignArchive(archive),
      errors: blockers.map(b => ({
        code: 'UNRESOLVABLE_CONFLICT',
        message: b.message,
      })),
      warnings: [],
    };
  }

  const duplicateSource = conflicts.find(c => c.type === 'duplicate-source');

  switch (strategy) {
    case 'keep-existing': {
      if (duplicateSource?.existingSelection) {
        return {
          success: true,
          archive: cloneDesignArchive(archive),
          selection: duplicateSource.existingSelection,
          errors: [],
          warnings: [{
            code: 'DUPLICATE_KEPT',
            message: `Source ${incoming.sourceEntityRef.id} already selected — keeping existing.`,
          }],
        };
      }
      break;
    }

    case 'replace-snapshot': {
      if (duplicateSource?.existingSelection) {
        const existing = duplicateSource.existingSelection;
        const updated = cloneDesignArchive(archive);
        const target = updated.selections.find(s => s.id === existing.id);
        if (target) {
          target.selectedTextSnapshot = incoming.selectedTextSnapshot;
          target.currentTextSnapshot = incoming.currentTextSnapshot;
          target.sourceVersionRef = incoming.sourceVersionRef;
          target.metadata = { ...target.metadata, updatedAt: new Date().toISOString() };
          target.transferredAt = incoming.transferredAt;
          target.warnings = [...target.warnings, {
            code: 'SNAPSHOT_REPLACED',
            message: `Snapshot replaced from updated source.`,
          }];
        }
        updated.updatedAt = new Date().toISOString();
        return {
          success: true,
          archive: updated,
          selection: target,
          errors: [],
          warnings: [{ code: 'SNAPSHOT_REPLACED', message: `Selection ${existing.id} snapshot replaced.` }],
        };
      }
      break;
    }

    case 'add-as-new-version': {
      // Always add — duplicate is intentional
      break;
    }

    case 'cancel': {
      return {
        success: true,
        archive: cloneDesignArchive(archive),
        errors: [],
        warnings: [{ code: 'TRANSFER_CANCELLED', message: 'Transfer cancelled by user.' }],
      };
    }

    case 'keep-both': {
      // Fall through to add
      break;
    }
  }

  // Default: add the selection
  const result = addSelection(archive, incoming);
  if (!result.success) {
    return {
      success: false,
      archive: cloneDesignArchive(archive),
      errors: result.errors,
      warnings: [],
    };
  }

  const warnings: DesignTransferWarning[] = conflicts.map(c => ({
    code: `CONFLICT_${c.type.toUpperCase()}`,
    message: c.message,
  }));

  return {
    success: true,
    archive: result.archive,
    selection: result.selection,
    errors: [],
    warnings,
  };
}

/**
 * Mark an existing selection to indicate that its source has been revoked or superseded.
 * Does NOT delete the selection or modify the source.
 */
export function markSourceStatusChanged(
  archive: DesignArchive,
  selectionId: string,
  reason: 'decision-revoked' | 'decision-superseded' | 'proposal-superseded' | 'source-unavailable',
): ConflictResolutionResult {
  const sel = archive.selections.find(s => s.id === selectionId);
  if (!sel) {
    return {
      success: false,
      archive: cloneDesignArchive(archive),
      errors: [{ code: 'SELECTION_NOT_FOUND', message: `Selection ${selectionId} not found` }],
      warnings: [],
    };
  }

  const updated = cloneDesignArchive(archive);
  const target = updated.selections.find(s => s.id === selectionId);
  if (!target) {
    return {
      success: false,
      archive,
      errors: [{ code: 'SELECTION_NOT_FOUND', message: `Selection ${selectionId} not found` }],
      warnings: [],
    };
  }

  target.comparisonState = reason === 'source-unavailable' ? 'source-unavailable' : 'source-updated';
  target.warnings = [...target.warnings, {
    code: reason.toUpperCase().replace(/-/g, '_'),
    message: `Source status changed: ${reason}. Selection preserved as historical reference.`,
  }];

  return {
    success: true,
    archive: updated,
    selection: target,
    errors: [],
    warnings: [{
      code: `SOURCE_${reason.toUpperCase().replace(/-/g, '_')}`,
      message: `Source ${reason} for selection ${selectionId}. Content preserved.`,
    }],
  };
}