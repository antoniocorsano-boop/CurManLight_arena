/**
 * CML-633C — Domain Validators
 *
 * Validatori puri per il dominio curricolare e delle fonti.
 */

import type { EntityId, EntityMetadata, EntityReference } from './identity/types';
import { isValidEntityId, isValidMetadata, isValidEntityReference } from './identity/validators';
import type {
  Source,
  SourceStatus,
  SourceValidationError,
  SourceValidationResult,
} from './sources/types';
import { VALID_SOURCE_TYPES, VALID_SOURCE_STATUSES } from './sources/types';
import type {
  CurriculumVersion,
  CurriculumSegment,
  CurriculumNode,
  CurriculumLink,
  CurriculumValidationError,
  CurriculumValidationResult,
} from './model/types';
import {
  VALID_CURRICULUM_VERSION_STATUSES,
  VALID_SEGMENT_STATUSES,
  VALID_NODE_STATUSES,
  VALID_LINK_STATUSES,
  VALID_PROVENANCES,
  VALID_COMPLETENESS_LEVELS,
} from './model/types';
import { SCHOOL_ORDERS } from './model/vocabularies';

// ─── Source Validators ───────────────────────────────────────────────────────

/**
 * Valida una fonte.
 */
export function validateSource(source: Source): SourceValidationResult {
  const errors: SourceValidationError[] = [];

  if (!isValidEntityId(source.id)) {
    errors.push({ code: 'SRC-001', message: 'ID fonte non valido', severity: 'error', path: 'id' });
  }

  if (!isValidMetadata(source.metadata)) {
    errors.push({ code: 'SRC-002', message: 'Metadati fonte non validi', severity: 'error', path: 'metadata' });
  }

  if (!source.title || source.title.trim().length === 0) {
    errors.push({ code: 'SRC-003', message: 'Titolo fonte obbligatorio', severity: 'error', path: 'title' });
  }

  if (!source.sourceType || !VALID_SOURCE_TYPES.includes(source.sourceType)) {
    errors.push({ code: 'SRC-004', message: 'Tipo fonte non valido', severity: 'error', path: 'sourceType' });
  }

  if (!source.status || !VALID_SOURCE_STATUSES.includes(source.status)) {
    errors.push({ code: 'SRC-005', message: 'Stato fonte non valido', severity: 'error', path: 'status' });
  }

  if (!source.scope) {
    errors.push({ code: 'SRC-006', message: 'Ambito fonte obbligatorio', severity: 'error', path: 'scope' });
  }

  if (source.usedByNodeRefs) {
    for (const ref of source.usedByNodeRefs) {
      if (!isValidEntityReference(ref)) {
        errors.push({ code: 'SRC-007', message: 'Riferimento nodo non valido', severity: 'warning', path: 'usedByNodeRefs' });
      }
    }
  }

  if (source.metadata.origin === 'legacy' && source.status === 'active') {
    errors.push({ code: 'SRC-008', message: 'Fonte legacy non dovrebbe essere attiva senza conferma', severity: 'warning', path: 'status' });
  }

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * Valida un SourceVersion.
 */
export function validateSourceVersion(version: {
  id: EntityId;
  metadata: EntityMetadata;
  sourceRef: EntityReference;
  versionNumber: number;
  status: SourceStatus;
}): SourceValidationResult {
  const errors: SourceValidationError[] = [];

  if (!isValidEntityId(version.id)) {
    errors.push({ code: 'SRCV-001', message: 'ID versione non valido', severity: 'error', path: 'id' });
  }

  if (!isValidMetadata(version.metadata)) {
    errors.push({ code: 'SRCV-002', message: 'Metadati versione non validi', severity: 'error', path: 'metadata' });
  }

  if (!isValidEntityReference(version.sourceRef)) {
    errors.push({ code: 'SRCV-003', message: 'Riferimento fonte non valido', severity: 'error', path: 'sourceRef' });
  }

  if (version.versionNumber < 1) {
    errors.push({ code: 'SRCV-004', message: 'Numero versione deve essere >= 1', severity: 'error', path: 'versionNumber' });
  }

  if (!VALID_SOURCE_STATUSES.includes(version.status)) {
    errors.push({ code: 'SRCV-005', message: 'Stato versione non valido', severity: 'error', path: 'status' });
  }

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

// ─── Curriculum Version Validators ───────────────────────────────────────────

/**
 * Valida una versione curricolare.
 */
export function validateCurriculumVersion(version: CurriculumVersion): CurriculumValidationResult {
  const errors: CurriculumValidationError[] = [];

  if (!isValidEntityId(version.id)) {
    errors.push({ code: 'CUR-001', message: 'ID versione non valido', severity: 'error', entityType: 'CurriculumVersion', path: 'id' });
  }

  if (!isValidMetadata(version.metadata)) {
    errors.push({ code: 'CUR-002', message: 'Metadati versione non validi', severity: 'error', entityType: 'CurriculumVersion', path: 'metadata' });
  }

  if (!version.title || version.title.trim().length === 0) {
    errors.push({ code: 'CUR-003', message: 'Titolo versione obbligatorio', severity: 'error', entityType: 'CurriculumVersion', path: 'title' });
  }

  if (!version.scope) {
    errors.push({ code: 'CUR-004', message: 'Ambito versione obbligatorio', severity: 'error', entityType: 'CurriculumVersion', path: 'scope' });
  }

  if (version.scope?.schoolOrder && !SCHOOL_ORDERS.includes(version.scope.schoolOrder)) {
    errors.push({ code: 'CUR-005', message: 'Ordine scolastico non valido', severity: 'error', entityType: 'CurriculumVersion', path: 'scope.schoolOrder' });
  }

  if (!version.status || !VALID_CURRICULUM_VERSION_STATUSES.includes(version.status)) {
    errors.push({ code: 'CUR-006', message: 'Stato versione non valido', severity: 'error', entityType: 'CurriculumVersion', path: 'status' });
  }

  if (version.metadata.origin === 'legacy' && version.status === 'active') {
    errors.push({ code: 'CUR-007', message: 'Versione legacy non dovrebbe essere attiva senza conferma', severity: 'warning', entityType: 'CurriculumVersion', path: 'status' });
  }

  if ((version.metadata.origin === 'demonstration' || version.metadata.origin === 'synthetic') && version.status === 'active') {
    errors.push({ code: 'CUR-008', message: 'Versione dimostrativa/sintetica non dovrebbe essere attiva', severity: 'warning', entityType: 'CurriculumVersion', path: 'status' });
  }

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

// ─── Curriculum Segment Validators ───────────────────────────────────────────

/**
 * Valida un segmento curricolare.
 */
export function validateCurriculumSegment(segment: CurriculumSegment): CurriculumValidationResult {
  const errors: CurriculumValidationError[] = [];

  if (!isValidEntityId(segment.id)) {
    errors.push({ code: 'SEG-001', message: 'ID segmento non valido', severity: 'error', entityType: 'CurriculumSegment', path: 'id' });
  }

  if (!isValidMetadata(segment.metadata)) {
    errors.push({ code: 'SEG-002', message: 'Metadati segmento non validi', severity: 'error', entityType: 'CurriculumSegment', path: 'metadata' });
  }

  if (!isValidEntityReference(segment.curriculumVersionRef)) {
    errors.push({ code: 'SEG-003', message: 'Riferimento versione non valido', severity: 'error', entityType: 'CurriculumSegment', path: 'curriculumVersionRef' });
  }

  if (!segment.schoolOrder || !SCHOOL_ORDERS.includes(segment.schoolOrder)) {
    errors.push({ code: 'SEG-004', message: 'Ordine scolastico non valido', severity: 'error', entityType: 'CurriculumSegment', path: 'schoolOrder' });
  }

  if (!segment.disciplineCode) {
    errors.push({ code: 'SEG-005', message: 'Disciplina obbligatoria', severity: 'error', entityType: 'CurriculumSegment', path: 'disciplineCode' });
  }

  if (!segment.title || segment.title.trim().length === 0) {
    errors.push({ code: 'SEG-006', message: 'Titolo segmento obbligatorio', severity: 'error', entityType: 'CurriculumSegment', path: 'title' });
  }

  if (!segment.status || !VALID_SEGMENT_STATUSES.includes(segment.status)) {
    errors.push({ code: 'SEG-007', message: 'Stato segmento non valido', severity: 'error', entityType: 'CurriculumSegment', path: 'status' });
  }

  if (!segment.completeness || !VALID_COMPLETENESS_LEVELS.includes(segment.completeness)) {
    errors.push({ code: 'SEG-008', message: 'Livello completezza non valido', severity: 'error', entityType: 'CurriculumSegment', path: 'completeness' });
  }

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

// ─── Curriculum Node Validators ──────────────────────────────────────────────

/**
 * Valida un nodo curricolare.
 */
export function validateCurriculumNode(node: CurriculumNode): CurriculumValidationResult {
  const errors: CurriculumValidationError[] = [];

  if (!isValidEntityId(node.id)) {
    errors.push({ code: 'NODE-001', message: 'ID nodo non valido', severity: 'error', entityType: 'CurriculumNode', path: 'id' });
  }

  if (!isValidMetadata(node.metadata)) {
    errors.push({ code: 'NODE-002', message: 'Metadati nodo non validi', severity: 'error', entityType: 'CurriculumNode', path: 'metadata' });
  }

  if (!isValidEntityReference(node.curriculumVersionRef)) {
    errors.push({ code: 'NODE-003', message: 'Riferimento versione non valido', severity: 'error', entityType: 'CurriculumNode', path: 'curriculumVersionRef' });
  }

  if (!isValidEntityReference(node.segmentRef)) {
    errors.push({ code: 'NODE-004', message: 'Riferimento segmento non valido', severity: 'error', entityType: 'CurriculumNode', path: 'segmentRef' });
  }

  if (!node.nodeType) {
    errors.push({ code: 'NODE-005', message: 'Tipo nodo obbligatorio', severity: 'error', entityType: 'CurriculumNode', path: 'nodeType' });
  }

  if (!node.text || node.text.trim().length === 0) {
    errors.push({ code: 'NODE-006', message: 'Testo nodo obbligatorio', severity: 'error', entityType: 'CurriculumNode', path: 'text' });
  }

  if (!node.status || !VALID_NODE_STATUSES.includes(node.status)) {
    errors.push({ code: 'NODE-007', message: 'Stato nodo non valido', severity: 'error', entityType: 'CurriculumNode', path: 'status' });
  }

  if (!node.provenance || !VALID_PROVENANCES.includes(node.provenance)) {
    errors.push({ code: 'NODE-008', message: 'Provenienza non valida', severity: 'error', entityType: 'CurriculumNode', path: 'provenance' });
  }

  if (!node.sourceRefs || node.sourceRefs.length === 0) {
    errors.push({ code: 'NODE-009', message: 'Nodo senza fonte associata', severity: 'warning', entityType: 'CurriculumNode', path: 'sourceRefs' });
  }

  if (node.provenance === 'legacy' && (!node.legacy || !node.legacy.isLegacy)) {
    errors.push({ code: 'NODE-010', message: 'Nodo legacy senza informazioni legacy', severity: 'warning', entityType: 'CurriculumNode', path: 'legacy' });
  }

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

// ─── Curriculum Link Validators ──────────────────────────────────────────────

/**
 * Valida un link curricolare.
 */
export function validateCurriculumLink(link: CurriculumLink): CurriculumValidationResult {
  const errors: CurriculumValidationError[] = [];

  if (!isValidEntityId(link.id)) {
    errors.push({ code: 'LINK-001', message: 'ID link non valido', severity: 'error', entityType: 'CurriculumLink', path: 'id' });
  }

  if (!isValidMetadata(link.metadata)) {
    errors.push({ code: 'LINK-002', message: 'Metadati link non validi', severity: 'error', entityType: 'CurriculumLink', path: 'metadata' });
  }

  if (!isValidEntityReference(link.fromNodeRef)) {
    errors.push({ code: 'LINK-003', message: 'Riferimento nodo origine non valido', severity: 'error', entityType: 'CurriculumLink', path: 'fromNodeRef' });
  }

  if (!isValidEntityReference(link.toNodeRef)) {
    errors.push({ code: 'LINK-004', message: 'Riferimento nodo destinazione non valido', severity: 'error', entityType: 'CurriculumLink', path: 'toNodeRef' });
  }

  if (!link.linkType) {
    errors.push({ code: 'LINK-005', message: 'Tipo relazione obbligatorio', severity: 'error', entityType: 'CurriculumLink', path: 'linkType' });
  }

  if (!link.status || !VALID_LINK_STATUSES.includes(link.status)) {
    errors.push({ code: 'LINK-006', message: 'Stato link non valido', severity: 'error', entityType: 'CurriculumLink', path: 'status' });
  }

  if (!link.origin) {
    errors.push({ code: 'LINK-007', message: 'Origine link obbligatoria', severity: 'error', entityType: 'CurriculumLink', path: 'origin' });
  }

  if (link.fromNodeRef.id === link.toNodeRef.id) {
    errors.push({ code: 'LINK-008', message: 'Autorelazione non permessa', severity: 'error', entityType: 'CurriculumLink', path: 'toNodeRef' });
  }

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

// ─── Referential Integrity ───────────────────────────────────────────────────

/**
 * Verifica l'integrità referenziale tra entità.
 */
export function checkReferentialIntegrity(
  nodes: CurriculumNode[],
  segments: CurriculumSegment[],
  links: CurriculumLink[]
): { broken: string[]; valid: string[] } {
  const broken: string[] = [];
  const valid: string[] = [];

  const nodeIds = new Set(nodes.map(n => n.id));
  const segmentIds = new Set(segments.map(s => s.id));

  for (const link of links) {
    if (!nodeIds.has(link.fromNodeRef.id)) {
      broken.push(`LINK ${link.id}: nodo origine ${link.fromNodeRef.id} non trovato`);
    } else if (!nodeIds.has(link.toNodeRef.id)) {
      broken.push(`LINK ${link.id}: nodo destinazione ${link.toNodeRef.id} non trovato`);
    } else {
      valid.push(`LINK ${link.id}`);
    }
  }

  for (const node of nodes) {
    if (!segmentIds.has(node.segmentRef.id)) {
      broken.push(`NODE ${node.id}: segmento ${node.segmentRef.id} non trovato`);
    } else {
      valid.push(`NODE ${node.id}`);
    }
  }

  return { broken, valid };
}

// ─── Duplicate Detection ─────────────────────────────────────────────────────

/**
 * Rileva nodi con testo duplicato.
 */
export function detectDuplicateNodes(nodes: CurriculumNode[]): { text: string; ids: EntityId[] }[] {
  const textMap = new Map<string, EntityId[]>();

  for (const node of nodes) {
    const normalizedText = node.text.trim().toLowerCase();
    const existing = textMap.get(normalizedText) || [];
    existing.push(node.id);
    textMap.set(normalizedText, existing);
  }

  const duplicates: { text: string; ids: EntityId[] }[] = [];
  for (const [text, ids] of textMap) {
    if (ids.length > 1) {
      duplicates.push({ text, ids });
    }
  }

  return duplicates;
}

/**
 * Rileva fonti duplicate.
 */
export function detectDuplicateSources(sources: Source[]): { title: string; ids: EntityId[] }[] {
  const titleMap = new Map<string, EntityId[]>();

  for (const source of sources) {
    const normalizedTitle = source.title.trim().toLowerCase();
    const existing = titleMap.get(normalizedTitle) || [];
    existing.push(source.id);
    titleMap.set(normalizedTitle, existing);
  }

  const duplicates: { title: string; ids: EntityId[] }[] = [];
  for (const [title, ids] of titleMap) {
    if (ids.length > 1) {
      duplicates.push({ title, ids });
    }
  }

  return duplicates;
}
