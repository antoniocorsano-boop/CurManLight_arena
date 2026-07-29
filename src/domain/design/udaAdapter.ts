/**
 * CML-633H — UDA Adapter
 *
 * Enriches existing UdaModel records with canonical DesignCurriculumSelection data.
 * No mutation of the source UDA. No migration. No double-write.
 * Legacy selections preserved with proper classification.
 */

import type { DesignCurriculumSelection, DesignQualification } from './types';
import { DESIGN_QUALIFICATION_LABELS } from './types';

// ─── Enriched types ─────────────────────────────────────────────────────

export interface EnrichedCurriculumReference {
  /** Source area: A02 or A03 */
  sourceArea: 'A02' | 'A03';
  /** Qualification of the content */
  qualification: DesignQualification;
  /** Human-readable qualification label */
  qualificationLabel: string;
  /** Frozen text snapshot */
  textSnapshot: string;
  /** Curriculum node reference ID */
  nodeId?: string;
  /** Version reference ID */
  versionId?: string;
  /** Source references */
  sourceRefs: string[];
  /** Evidence references */
  evidenceRefs: string[];
  /** Transfer timestamp */
  transferredAt: string;
  /** Warnings carried from transfer */
  warnings: string[];
  /** Comparison state with source */
  comparisonState?: string;
  /** Whether this is legacy content */
  isLegacy: boolean;
}

export interface UdaDesignReadModel {
  udaId: string;
  /** Fallback text from the original UDA traguardi/obiettivi */
  fallbackText: string;
  /** Canonical curriculum references enriched from selections */
  curriculumReferences: EnrichedCurriculumReference[];
}

// ─── Enrichment ─────────────────────────────────────────────────────────

/**
 * Enrich a UDA with canonical curriculum selections.
 * Does not modify the original UDA.
 * Returns a read model with canonical references alongside fallback text.
 */
export function enrichUdaWithSelections(
  uda: { id: string; traguardi?: unknown[]; obiettivi?: unknown[]; evidenze?: unknown[] },
  selections: readonly DesignCurriculumSelection[],
): UdaDesignReadModel {
  const fallbackTexts: string[] = [];
  if (Array.isArray(uda.traguardi)) {
    for (const t of uda.traguardi) {
      if (typeof t === 'string') fallbackTexts.push(t);
    }
  }
  if (Array.isArray(uda.obiettivi)) {
    for (const o of uda.obiettivi) {
      if (typeof o === 'string') fallbackTexts.push(o);
    }
  }

  const references: EnrichedCurriculumReference[] = selections.map(s => ({
    sourceArea: s.sourceArea,
    qualification: s.qualification,
    qualificationLabel: DESIGN_QUALIFICATION_LABELS[s.qualification],
    textSnapshot: s.selectedTextSnapshot,
    nodeId: s.curriculumNodeRef?.id ? String(s.curriculumNodeRef.id) : undefined,
    versionId: s.sourceVersionRef?.id ? String(s.sourceVersionRef.id) : undefined,
    sourceRefs: s.sourceRefs.map(r => String(r.snapshotLabel || r.id)),
    evidenceRefs: s.evidenceRefs.map(r => String(r.snapshotLabel || r.id)),
    transferredAt: s.transferredAt,
    warnings: s.warnings.map(w => w.message),
    comparisonState: s.comparisonState,
    isLegacy: s.qualification === 'legacy-content',
  }));

  return {
    udaId: uda.id,
    fallbackText: fallbackTexts.join('; '),
    curriculumReferences: references,
  };
}

/**
 * Extract selections from a UDA for backward compatibility.
 * Existing UDAs without canonical selections get classified as legacy-content.
 * Returns empty array — no invention of data.
 */
export function extractSelectionsFromUda(
  _uda: unknown,
): DesignCurriculumSelection[] {
  // No canonical selections exist in legacy UDA model.
  // This adapter reads selections from DesignArchive, not from UDA itself.
  return [];
}

/**
 * Classify a legacy UDA text item for migration purposes.
 * Pure classification — does not modify data.
 */
export function classifyLegacyUdaContent(
  hasNode: boolean,
  hasVersion: boolean,
  hasSource: boolean,
  hasEvidence: boolean,
): { qualification: DesignQualification; warnings: string[] } {
  const warnings: string[] = [];
  if (!hasNode) warnings.push('Curriculum node reference missing');
  if (!hasVersion) warnings.push('Curriculum version reference missing');
  if (!hasSource) warnings.push('Source reference missing');
  if (!hasEvidence) warnings.push('Evidence references missing');
  return {
    qualification: 'legacy-content',
    warnings,
  };
}