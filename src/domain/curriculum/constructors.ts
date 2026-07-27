/**
 * CML-633C — Domain Constructors
 *
 * Funzioni condivise per la costruzione sicura delle entità di dominio.
 */

import type { EntityId, EntityReference, ContentOrigin } from './identity/types';
import { createMetadata, createEntityReference } from './identity/constructors';
import type { SchoolOrder } from '../../types/curriculum';
import type { DisciplineCode, CurriculumNodeType, CurriculumLinkType } from './model/vocabularies';
import type {
  Source,
  SourceType,
  SourceStatus,
  SourceScope,
  SourceLocator,
  SourceVersion,
} from './sources/types';
import type {
  CurriculumVersion,
  CurriculumVersionStatus,
  CurriculumSegment,
  CurriculumSegmentStatus,
  CurriculumNode,
  CurriculumNodeStatus,
  CurriculumProvenance,
  CurriculumLink,
  CurriculumLinkStatus,
  LegacyNodeInfo,
  CompletenessLevel,
} from './model/types';

// ─── Source Constructors ─────────────────────────────────────────────────────

/**
 * Crea una fonte canonica.
 */
export function createSource(
  title: string,
  sourceType: SourceType,
  scope: SourceScope,
  options?: {
    authority?: string;
    issuedAt?: string;
    versionLabel?: string;
    status?: SourceStatus;
    locator?: SourceLocator;
    notes?: string;
    origin?: ContentOrigin;
    now?: string;
  }
): Source {
  const origin = options?.origin || 'legacy';
  const metadata = createMetadata(origin, undefined, options?.now);

  return {
    id: metadata.id,
    metadata,
    title,
    sourceType,
    authority: options?.authority,
    issuedAt: options?.issuedAt,
    versionLabel: options?.versionLabel,
    status: options?.status || 'unverified',
    scope,
    locator: options?.locator,
    notes: options?.notes,
    usedByNodeRefs: [],
  };
}

/**
 * Crea una fonte legacy per dati esistenti.
 */
export function createLegacySource(
  title: string,
  sourceType: SourceType,
  scope: SourceScope,
  migrationDate: string
): Source {
  const metadata = createMetadata('legacy', undefined, migrationDate);

  return {
    id: metadata.id,
    metadata,
    title,
    sourceType,
    status: 'legacy',
    scope,
    usedByNodeRefs: [],
  };
}

/** Crea una versione immutabile di una fonte logica. */
export function createSourceVersion(
  sourceRef: EntityReference,
  versionNumber: number,
  options?: {
    label?: string;
    issuedAt?: string;
    status?: SourceStatus;
    changeNotes?: string;
    previousVersionRef?: EntityReference;
    origin?: ContentOrigin;
    now?: string;
  }
): SourceVersion {
  const metadata = createMetadata(options?.origin || 'legacy', undefined, options?.now);
  return {
    id: metadata.id,
    metadata,
    sourceRef,
    versionNumber,
    label: options?.label,
    issuedAt: options?.issuedAt,
    status: options?.status || 'unverified',
    changeNotes: options?.changeNotes,
    previousVersionRef: options?.previousVersionRef,
    usedByNodeRefs: [],
  };
}

// ─── Curriculum Version Constructors ─────────────────────────────────────────

/**
 * Crea una versione curricolare.
 */
export function createCurriculumVersion(
  title: string,
  schoolOrder: SchoolOrder,
  options?: {
    description?: string;
    disciplines?: DisciplineCode[];
    academicYear?: string;
    status?: CurriculumVersionStatus;
    mainSourceRefs?: EntityReference[];
    previousVersionRef?: EntityReference;
    migrationNotes?: string;
    origin?: ContentOrigin;
    now?: string;
  }
): CurriculumVersion {
  const origin = options?.origin || 'legacy';
  const metadata = createMetadata(origin, undefined, options?.now);

  return {
    id: metadata.id,
    metadata,
    title,
    description: options?.description,
    scope: {
      schoolOrder,
      disciplines: options?.disciplines || [],
    },
    academicYear: options?.academicYear,
    status: options?.status || 'draft',
    mainSourceRefs: options?.mainSourceRefs || [],
    previousVersionRef: options?.previousVersionRef,
    migrationNotes: options?.migrationNotes,
    segmentRefs: [],
    dataOrigin: origin,
  };
}

// ─── Curriculum Segment Constructors ─────────────────────────────────────────

/**
 * Crea un segmento curricolare.
 */
export function createCurriculumSegment(
  curriculumVersionRef: EntityReference,
  schoolOrder: SchoolOrder,
  disciplineCode: DisciplineCode,
  title: string,
  options?: {
    description?: string;
    nucleusId?: string;
    status?: CurriculumSegmentStatus;
    completeness?: CompletenessLevel;
    sourceRefs?: EntityReference[];
    origin?: ContentOrigin;
    now?: string;
  }
): CurriculumSegment {
  const origin = options?.origin || 'legacy';
  const metadata = createMetadata(origin, undefined, options?.now);

  return {
    id: metadata.id,
    metadata,
    curriculumVersionRef,
    schoolOrder,
    disciplineCode,
    nucleusId: options?.nucleusId,
    title,
    description: options?.description,
    status: options?.status || 'empty',
    completeness: options?.completeness || 'empty',
    sourceRefs: options?.sourceRefs || [],
    nodeRefs: [],
    dataOrigin: origin,
  };
}

// ─── Curriculum Node Constructors ────────────────────────────────────────────

/**
 * Crea un nodo curricolare.
 */
export function createCurriculumNode(
  curriculumVersionRef: EntityReference,
  segmentRef: EntityReference,
  nodeType: CurriculumNodeType,
  text: string,
  options?: {
    sourceRefs?: EntityReference[];
    status?: CurriculumNodeStatus;
    provenance?: CurriculumProvenance;
    legacy?: LegacyNodeInfo;
    grade?: string;
    period?: string;
    isCrossCurricular?: boolean;
    keywords?: string[];
    origin?: ContentOrigin;
    now?: string;
  }
): CurriculumNode {
  const origin = options?.origin || 'legacy';
  const metadata = createMetadata(origin, undefined, options?.now);

  return {
    id: metadata.id,
    metadata,
    curriculumVersionRef,
    segmentRef,
    nodeType,
    text,
    sourceRefs: options?.sourceRefs || [],
    status: options?.status || 'active',
    provenance: options?.provenance || 'legacy',
    legacy: options?.legacy,
    grade: options?.grade,
    period: options?.period,
    isCrossCurricular: options?.isCrossCurricular,
    keywords: options?.keywords || [],
  };
}

/**
 * Crea un nodo legacy da curriculumKB.
 */
export function createLegacyNode(
  curriculumVersionRef: EntityReference,
  segmentRef: EntityReference,
  nodeType: CurriculumNodeType,
  text: string,
  originalKey: string,
  migrationDate: string
): CurriculumNode {
  const metadata = createMetadata('legacy', undefined, migrationDate);

  return {
    id: metadata.id,
    metadata,
    curriculumVersionRef,
    segmentRef,
    nodeType,
    text,
    sourceRefs: [],
    status: 'legacy',
    provenance: 'legacy',
    legacy: {
      isLegacy: true,
      originalKey,
      originalText: text,
      migrationDate,
      migrationWarnings: [],
    },
    keywords: [],
  };
}

/**
 * Crea un nodo evidenza.
 */
export function createEvidenceNode(
  curriculumVersionRef: EntityReference,
  segmentRef: EntityReference,
  text: string,
  supportedNodeRef?: EntityReference,
  options?: {
    status?: CurriculumNodeStatus;
    provenance?: CurriculumProvenance;
    legacy?: LegacyNodeInfo;
    origin?: ContentOrigin;
    now?: string;
  }
): CurriculumNode {
  const origin = options?.origin || 'legacy';
  const metadata = createMetadata(origin, undefined, options?.now);

  return {
    id: metadata.id,
    metadata,
    curriculumVersionRef,
    segmentRef,
    nodeType: 'evidenza',
    text,
    sourceRefs: supportedNodeRef ? [supportedNodeRef] : [],
    status: options?.status || 'active',
    provenance: options?.provenance || 'legacy',
    legacy: options?.legacy,
    keywords: [],
  };
}

// ─── Curriculum Link Constructors ────────────────────────────────────────────

/**
 * Crea un link curricolare.
 */
export function createCurriculumLink(
  fromNodeRef: EntityReference,
  toNodeRef: EntityReference,
  linkType: CurriculumLinkType,
  options?: {
    description?: string;
    motivation?: string;
    sourceRefs?: EntityReference[];
    origin?: ContentOrigin;
    status?: CurriculumLinkStatus;
    isVertical?: boolean;
    fromOrder?: SchoolOrder;
    toOrder?: SchoolOrder;
    now?: string;
  }
): CurriculumLink {
  const origin = options?.origin || 'legacy';
  const metadata = createMetadata(origin, undefined, options?.now);

  return {
    id: metadata.id,
    metadata,
    fromNodeRef,
    toNodeRef,
    linkType,
    description: options?.description,
    motivation: options?.motivation,
    sourceRefs: options?.sourceRefs || [],
    origin,
    status: options?.status || 'active',
    isVertical: options?.isVertical || false,
    fromOrder: options?.fromOrder,
    toOrder: options?.toOrder,
  };
}

// ─── Entity Reference Helpers ────────────────────────────────────────────────

/**
 * Crea un riferimento a una fonte.
 */
export function createSourceReference(
  sourceId: EntityId,
  snapshotLabel?: string
): EntityReference {
  return createEntityReference(sourceId, 'source', snapshotLabel);
}

/**
 * Crea un riferimento a una versione curricolare.
 */
export function createCurriculumVersionReference(
  versionId: EntityId,
  snapshotLabel?: string
): EntityReference {
  return createEntityReference(versionId, 'curriculum-version', snapshotLabel);
}

/**
 * Crea un riferimento a un segmento.
 */
export function createSegmentReference(
  segmentId: EntityId,
  snapshotLabel?: string
): EntityReference {
  return createEntityReference(segmentId, 'curriculum-segment', snapshotLabel);
}

/**
 * Crea un riferimento a un nodo.
 */
export function createNodeReference(
  nodeId: EntityId,
  snapshotLabel?: string
): EntityReference {
  return createEntityReference(nodeId, 'curriculum-node', snapshotLabel);
}
