/**
 * CML-630E — Productive Curriculum Domain
 *
 * Tipi condivisi per il dominio curricolare produttivo.
 * Modello C ibrido: relazioni strutturali nei segmenti, relazioni pedagogiche in VerticalCurriculumLink.
 */

import type { SchoolOrder } from '../../types/curriculumTransition';

// ─── Shared Types ───────────────────────────────────────────────────────────────

export type { SchoolOrder };

export type NationalFramework = 'IN2012' | 'IN2025';

export type SchoolLevel = SchoolOrder;

export type InstitutionalRole =
  | 'docente'
  | 'dipartimento'
  | 'referente'
  | 'collegio'
  | 'dirigente'
  | 'amministratore';

export type SegmentScope =
  | { type: 'grade'; grade: string }
  | { type: 'grade-range'; grades: string[] }
  | { type: 'school-level' };

export interface FrameworkApplicabilityReference {
  framework: NationalFramework | null;
  resolutionStatus: 'resolved' | 'requires-context-confirmation';
  resolutionReason: string;
  cohortEntryYear?: number;
}

// ─── Version Status ─────────────────────────────────────────────────────────────

export type InstituteCurriculumStatus =
  | 'draft'
  | 'under-review'
  | 'proposed-to-collegio'
  | 'approved'
  | 'superseded';

// ─── Segment Work Status ────────────────────────────────────────────────────────

export type CurriculumSegmentWorkStatus =
  | 'not-started'
  | 'draft'
  | 'open-for-contributions'
  | 'under-review'
  | 'ready-for-consolidation'
  | 'included-in-proposal'
  | 'effective'
  | 'legacy-imported';

// ─── Node Types ─────────────────────────────────────────────────────────────────

export type CurriculumNodeType =
  | 'competence'
  | 'milestone'
  | 'objective'
  | 'evidence'
  | 'knowledge'
  | 'skill'
  | 'core-theme';

export type CurriculumNodeWorkStatus =
  | 'draft'
  | 'proposed'
  | 'validated'
  | 'approved'
  | 'rejected';

// ─── Link Types ─────────────────────────────────────────────────────────────────

export type VerticalCurriculumRelationType =
  | 'prerequisite'
  | 'continuity'
  | 'development'
  | 'deepening'
  | 'integration'
  | 'discontinuity';

export type VerticalCurriculumLinkStatus =
  | 'draft'
  | 'proposed'
  | 'validated'
  | 'rejected';

// ─── Validation ─────────────────────────────────────────────────────────────────

export type DomainValidationSeverity = 'error' | 'warning';

export interface DomainValidationIssue {
  code: string;
  severity: DomainValidationSeverity;
  entityType: string;
  entityId?: string;
  message: string;
}

// ─── Valid Status Sets ──────────────────────────────────────────────────────────

export const VALID_VERSION_STATUSES: readonly InstituteCurriculumStatus[] = [
  'draft',
  'under-review',
  'proposed-to-collegio',
  'approved',
  'superseded',
] as const;

export const VALID_SEGMENT_WORK_STATUSES: readonly CurriculumSegmentWorkStatus[] = [
  'not-started',
  'draft',
  'open-for-contributions',
  'under-review',
  'ready-for-consolidation',
  'included-in-proposal',
  'effective',
  'legacy-imported',
] as const;

export const VALID_NODE_TYPES: readonly CurriculumNodeType[] = [
  'competence',
  'milestone',
  'objective',
  'evidence',
  'knowledge',
  'skill',
  'core-theme',
] as const;

export const VALID_NODE_WORK_STATUSES: readonly CurriculumNodeWorkStatus[] = [
  'draft',
  'proposed',
  'validated',
  'approved',
  'rejected',
] as const;

export const VALID_LINK_RELATION_TYPES: readonly VerticalCurriculumRelationType[] = [
  'prerequisite',
  'continuity',
  'development',
  'deepening',
  'integration',
  'discontinuity',
] as const;

export const VALID_LINK_STATUSES: readonly VerticalCurriculumLinkStatus[] = [
  'draft',
  'proposed',
  'validated',
  'rejected',
] as const;

// ─── Status Transitions ────────────────────────────────────────────────────────

export const VERSION_STATUS_TRANSITIONS: ReadonlyMap<InstituteCurriculumStatus, readonly InstituteCurriculumStatus[]> = new Map([
  ['draft', ['under-review']],
  ['under-review', ['proposed-to-collegio', 'draft']],
  ['proposed-to-collegio', ['approved', 'under-review']],
  ['approved', ['superseded']],
  ['superseded', []],
]);

export const SEGMENT_WORK_STATUS_TRANSITIONS: ReadonlyMap<CurriculumSegmentWorkStatus, readonly CurriculumSegmentWorkStatus[]> = new Map([
  ['not-started', ['draft']],
  ['draft', ['open-for-contributions', 'under-review']],
  ['open-for-contributions', ['under-review']],
  ['under-review', ['ready-for-consolidation', 'draft']],
  ['ready-for-consolidation', ['included-in-proposal']],
  ['included-in-proposal', ['effective', 'under-review']],
  ['effective', []],
  ['legacy-imported', []],
]);

export const LINK_STATUS_TRANSITIONS: ReadonlyMap<VerticalCurriculumLinkStatus, readonly VerticalCurriculumLinkStatus[]> = new Map([
  ['draft', ['proposed']],
  ['proposed', ['validated', 'rejected']],
  ['validated', []],
  ['rejected', ['draft']],
]);
