/**
 * CML-633H — Design Curriculum Selection domain types.
 *
 * Stores curriculum selections transferred from A02/A03 into A04 (progettazione).
 * All selections are immutable snapshots — source text changes do not affect them.
 * Each selection carries explicit qualification and source references.
 */

import type {
  EntityId,
  EntityMetadata,
  EntityReference,
  ActorReference,
} from '../curriculum/identity/types';

// ─── Qualification ──────────────────────────────────────────────────────

/**
 * Qualification of content being used in teaching design.
 *
 * - `current-curriculum`: from A02, refers to a curriculum version node
 * - `proposed-content`: from A03, proposal still in review
 * - `planned-institute-content`: from A03, linked to a recorded-local decision
 * - `legacy-content`: pre-canonical data with missing fields
 * - `experimental-content`: explicitly marked as experimental
 */
export type DesignQualification =
  | 'current-curriculum'
  | 'proposed-content'
  | 'planned-institute-content'
  | 'legacy-content'
  | 'experimental-content';

export const VALID_DESIGN_QUALIFICATIONS: readonly DesignQualification[] = [
  'current-curriculum',
  'proposed-content',
  'planned-institute-content',
  'legacy-content',
  'experimental-content',
] as const;

export const DESIGN_QUALIFICATION_LABELS: Record<DesignQualification, string> = {
  'current-curriculum': 'Dal curricolo vigente',
  'proposed-content': 'Da proposta in revisione',
  'planned-institute-content': 'Da decisione locale pianificata',
  'legacy-content': 'Contenuto legacy',
  'experimental-content': 'Contenuto sperimentale',
};

// ─── Source Comparison State ───────────────────────────────────────────

export type SourceComparisonState =
  | 'source-current'
  | 'source-updated'
  | 'source-unavailable'
  | 'source-legacy';

// ─── Design Transfer Warning ────────────────────────────────────────────

export interface DesignTransferWarning {
  code: string;
  message: string;
  field?: string;
}

// ─── Design Transfer Error ──────────────────────────────────────────────

export interface DesignTransferError {
  code: string;
  message: string;
  field?: string;
}

// ─── DesignCurriculumSelection ──────────────────────────────────────────

export interface DesignCurriculumSelection {
  /** Stable entity identifier */
  id: EntityId;
  /** Standard metadata */
  metadata: EntityMetadata;

  /** Reference to the teaching design this selection belongs to */
  designRef: EntityReference;

  /** Origin area: "A02" (consultation) or "A03" (revision/decision) */
  sourceArea: 'A02' | 'A03';
  /** Reference to the source entity (curriculum node, proposal, decision) */
  sourceEntityRef: EntityReference;
  /** Version of the source at transfer time */
  sourceVersionRef?: EntityReference;

  /** Curriculum node reference (may be same as source or inferred) */
  curriculumNodeRef?: EntityReference;
  /** Curriculum version reference */
  curriculumVersionRef?: EntityReference;

  /** Frozen text from the source at transfer time */
  currentTextSnapshot: string;
  /** Selected/edited text placed into the design */
  selectedTextSnapshot: string;

  /** Explicit content qualification */
  qualification: DesignQualification;

  /** Source references carried from the origin */
  sourceRefs: EntityReference[];
  /** Evidence references carried from the origin */
  evidenceRefs: EntityReference[];

  /** Institutional context at transfer time */
  institutionalContextRef?: EntityReference;

  /** Transfer timestamp (ISO 8601) */
  transferredAt: string;
  /** Who performed the transfer (declared, not authenticated) */
  transferredBy?: ActorReference;

  /** Version of the transfer contract used */
  transferContractVersion: string;
  /** Structural footprint for integrity verification */
  structuralFootprint: string;

  /** Source comparison state */
  comparisonState?: SourceComparisonState;

  /** Warnings from the transfer process */
  warnings: DesignTransferWarning[];
}

// ─── Design Archive ─────────────────────────────────────────────────────

export interface DesignArchive {
  schemaVersion: number;
  updatedAt: string;
  selections: DesignCurriculumSelection[];
}

// ─── Discriminated Results ─────────────────────────────────────────────

export type DesignTransferResult =
  | {
      ok: true;
      selection: DesignCurriculumSelection;
      warnings: readonly DesignTransferWarning[];
    }
  | {
      ok: false;
      error: DesignTransferError;
      warnings: readonly DesignTransferWarning[];
    };

export type DesignArchiveOperationResult =
  | { success: true; archive: DesignArchive }
  | { success: false; errors: DesignTransferError[] };

export type DesignSelectionOperationResult =
  | { success: true; selection: DesignCurriculumSelection; archive: DesignArchive }
  | { success: false; errors: DesignTransferError[] };