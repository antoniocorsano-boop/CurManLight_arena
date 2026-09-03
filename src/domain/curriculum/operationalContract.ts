import type { SchoolOrder } from '../../types/curriculum';
import type { ContentOrigin } from './identity/types';
import type { CurriculumLinkType, CurriculumNodeType } from './model/vocabularies';
import {
  DM221_FIRST_CYCLE_DISCIPLINES,
  DM221_INFANZIA_FIELDS,
  DM221_SPECIAL_SEGMENTS,
  type FirstCycleDisciplineId,
  type FirstCycleSchoolOrder,
  type InfanziaFieldId,
} from './national/canonicalStructure';
import {
  assessElementBinding,
  type NationalCurriculumElementBinding,
} from './national/elementBindings';

export const OPERATIONAL_CURRICULUM_SCHEMA_VERSION = 'arena-operational-curriculum-v1' as const;
export const OPERATIONAL_CURRICULUM_KIND = 'OPERATIONAL_INSTITUTE_CURRICULUM' as const;

export type OperationalCurriculumSourcePlane =
  | 'CML_633C_CANONICAL_DOMAIN'
  | 'LEGACY_CURRICULUM_MAP_PROJECTION';

export type OperationalCurriculumAuthorityState =
  | 'NON_AUTHORITATIVE'
  | 'PREPARED'
  | 'ACTIVE'
  | 'SUPERSEDED';

export type OperationalCurriculumSemanticStatus =
  | 'UNASSESSED'
  | 'STRUCTURAL_ONLY'
  | 'ELEMENT_BOUND'
  | 'SEMANTICALLY_VALIDATED';

export type OperationalRequirementAuthority =
  | 'NATIONAL_PRESCRIPTIVE'
  | 'INSTITUTIONAL_REQUIRED'
  | 'TRANSITION_REQUIRED'
  | 'RECOMMENDED'
  | 'LOCAL_WORKING';

export type OperationalNodeLifecycle =
  | 'ACTIVE'
  | 'PROPOSED'
  | 'SUPERSEDED'
  | 'UNVERIFIED'
  | 'LEGACY';

export interface OperationalCurriculumAuthority {
  state: OperationalCurriculumAuthorityState;
  authorityRef?: string;
  decisionReceiptRef?: string;
  materializationRef?: string;
  materializationFingerprint?: string;
}

export interface OperationalDisciplineTarget {
  kind: 'DISCIPLINE';
  schoolOrder: FirstCycleSchoolOrder;
  disciplineId: FirstCycleDisciplineId;
}

export interface OperationalInfanziaFieldTarget {
  kind: 'FIELD_OF_EXPERIENCE';
  schoolOrder: 'infanzia';
  fieldId: InfanziaFieldId;
}

export interface OperationalSpecialSegmentTarget {
  kind: 'SPECIAL_SEGMENT';
  schoolOrder: SchoolOrder;
  nationalSegmentId: string;
}

export type OperationalCurriculumTarget =
  | OperationalDisciplineTarget
  | OperationalInfanziaFieldTarget
  | OperationalSpecialSegmentTarget;

export interface OperationalNationalElementEvidence {
  binding: NationalCurriculumElementBinding;
  /** SHA-256 (hex) del testo nazionale verificato cui il nodo dichiara corrispondenza. */
  verifiedTextFingerprint?: string;
}

export interface OperationalCurriculumSegment {
  segmentRef: string;
  curriculumVersionRef: string;
  target: OperationalCurriculumTarget;
  scopeRef: string;
  nodeRefs: readonly string[];
  sourceRefs: readonly string[];
}

export interface OperationalCurriculumNode {
  nodeRef: string;
  curriculumVersionRef: string;
  segmentRef: string;
  nodeType: CurriculumNodeType;
  text: string;
  /** SHA-256 (hex) del testo del nodo nella materializzazione operativa. */
  textFingerprint: string;
  origin: ContentOrigin;
  lifecycle: OperationalNodeLifecycle;
  authorityLevel: OperationalRequirementAuthority;
  sourceRefs: readonly string[];
  nationalElementEvidence: readonly OperationalNationalElementEvidence[];
}

export interface OperationalCurriculumLink {
  linkRef: string;
  curriculumVersionRef: string;
  fromNodeRef: string;
  toNodeRef: string;
  linkType: CurriculumLinkType;
  sourceRefs: readonly string[];
}

/**
 * Snapshot serializzabile del curricolo destinato ai futuri flussi produttivi.
 * Compone CML-633C, binding nazionali e autorità R7; non introduce un nuovo repository.
 */
export interface OperationalCurriculumAggregateV1 {
  schemaVersion: typeof OPERATIONAL_CURRICULUM_SCHEMA_VERSION;
  kind: typeof OPERATIONAL_CURRICULUM_KIND;
  institutionId: string;
  curriculumVersionRef: string;
  sourcePlane: OperationalCurriculumSourcePlane;
  authority: OperationalCurriculumAuthority;
  semanticStatus: OperationalCurriculumSemanticStatus;
  semanticValidationRef?: string;
  segments: readonly OperationalCurriculumSegment[];
  nodes: readonly OperationalCurriculumNode[];
  links: readonly OperationalCurriculumLink[];
  createdAt: string;
}

export interface OperationalCurriculumValidationIssue {
  code: string;
  path: string;
  message: string;
}

export interface OperationalCurriculumValidationResult {
  valid: boolean;
  errors: readonly OperationalCurriculumValidationIssue[];
}

const SHA256_HEX = /^[a-f0-9]{64}$/;
const normalized = (value: string): string => value.replace(/\s+/g, ' ').trim();
const hasText = (value: string | undefined): value is string => Boolean(value && normalized(value));

export function buildOperationalCurriculumTargetRef(target: OperationalCurriculumTarget): string {
  if (target.kind === 'DISCIPLINE') return `dm221:${target.disciplineId}:${target.schoolOrder}`;
  if (target.kind === 'FIELD_OF_EXPERIENCE') return `dm221:FIELD:${target.fieldId}:infanzia`;
  return `dm221:SPECIAL:${target.nationalSegmentId}:${target.schoolOrder}`;
}

function canonicalNationalSegmentIdForTarget(target: OperationalCurriculumTarget): string | undefined {
  if (target.kind === 'DISCIPLINE') return DM221_FIRST_CYCLE_DISCIPLINES[target.disciplineId]?.id;
  if (target.kind === 'FIELD_OF_EXPERIENCE') return DM221_INFANZIA_FIELDS[target.fieldId]?.id;
  return DM221_SPECIAL_SEGMENTS.find(candidate => candidate.id === target.nationalSegmentId)?.id;
}

function validateTarget(
  target: OperationalCurriculumTarget,
  path: string,
  errors: OperationalCurriculumValidationIssue[],
): void {
  if (target.kind === 'DISCIPLINE') {
    if ((target as { schoolOrder: string }).schoolOrder === 'infanzia') {
      errors.push({
        code: 'INFANZIA_DISCIPLINE_PROJECTION_FORBIDDEN',
        path,
        message: 'L’infanzia deve usare un campo di esperienza canonico, non una disciplina del primo ciclo.',
      });
      return;
    }
    const segment = DM221_FIRST_CYCLE_DISCIPLINES[target.disciplineId];
    if (!segment || !segment.schoolOrders.includes(target.schoolOrder)) {
      errors.push({
        code: 'DISCIPLINE_TARGET_NOT_CANONICAL',
        path,
        message: 'Disciplina e ordine non formano un target canonico D.M. 221/2025.',
      });
    }
    return;
  }

  if (target.kind === 'FIELD_OF_EXPERIENCE') {
    if ((target as { schoolOrder: string }).schoolOrder !== 'infanzia' || !DM221_INFANZIA_FIELDS[target.fieldId]) {
      errors.push({
        code: 'INFANZIA_FIELD_TARGET_NOT_CANONICAL',
        path,
        message: 'Il campo di esperienza deve appartenere all’infanzia e al registro canonico D.M. 221/2025.',
      });
    }
    return;
  }

  const segment = DM221_SPECIAL_SEGMENTS.find(candidate => candidate.id === target.nationalSegmentId);
  if (!segment || !segment.schoolOrders.includes(target.schoolOrder)) {
    errors.push({
      code: 'SPECIAL_TARGET_NOT_CANONICAL',
      path,
      message: 'Il segmento speciale non appartiene al registro canonico per l’ordine indicato.',
    });
  }
}

function validNationalEvidenceForNode(
  node: OperationalCurriculumNode,
  target: OperationalCurriculumTarget,
): boolean {
  const expectedNationalSegmentId = canonicalNationalSegmentIdForTarget(target);
  if (!expectedNationalSegmentId) return false;

  return node.nationalElementEvidence.some(evidence => {
    const assessment = assessElementBinding(evidence.binding);
    return assessment.canUseAsCanonicalSourceText
      && evidence.binding.schoolOrder === target.schoolOrder
      && evidence.binding.segmentId === expectedNationalSegmentId
      && Boolean(evidence.verifiedTextFingerprint && SHA256_HEX.test(evidence.verifiedTextFingerprint))
      && evidence.verifiedTextFingerprint === node.textFingerprint;
  });
}

export function canUseOperationalNodeAsNationalRequirement(
  node: OperationalCurriculumNode,
  target: OperationalCurriculumTarget,
): boolean {
  return node.authorityLevel === 'NATIONAL_PRESCRIPTIVE'
    && node.origin === 'normative-source'
    && SHA256_HEX.test(node.textFingerprint)
    && validNationalEvidenceForNode(node, target);
}

export function validateOperationalCurriculumAggregate(
  aggregate: OperationalCurriculumAggregateV1,
): OperationalCurriculumValidationResult {
  const errors: OperationalCurriculumValidationIssue[] = [];
  const push = (code: string, path: string, message: string) => errors.push({ code, path, message });

  if (aggregate.schemaVersion !== OPERATIONAL_CURRICULUM_SCHEMA_VERSION) {
    push('SCHEMA_VERSION_UNSUPPORTED', 'schemaVersion', 'Versione del contratto operativo non supportata.');
  }
  if (aggregate.kind !== OPERATIONAL_CURRICULUM_KIND) {
    push('KIND_INVALID', 'kind', 'Tipo di aggregato operativo non riconosciuto.');
  }
  if (!hasText(aggregate.institutionId)) push('INSTITUTION_ID_REQUIRED', 'institutionId', 'institutionId è obbligatorio.');
  if (!hasText(aggregate.curriculumVersionRef)) push('CURRICULUM_VERSION_REF_REQUIRED', 'curriculumVersionRef', 'curriculumVersionRef è obbligatorio.');
  if (!aggregate.createdAt || Number.isNaN(Date.parse(aggregate.createdAt))) {
    push('CREATED_AT_INVALID', 'createdAt', 'createdAt deve essere una data ISO compatibile.');
  }

  if (aggregate.sourcePlane === 'LEGACY_CURRICULUM_MAP_PROJECTION' && aggregate.authority.state !== 'NON_AUTHORITATIVE') {
    push(
      'LEGACY_PROJECTION_CANNOT_BE_AUTHORITATIVE',
      'authority.state',
      'Una proiezione diretta della CurriculumMap legacy non può diventare autorità canonica.',
    );
  }

  if (aggregate.authority.state !== 'NON_AUTHORITATIVE') {
    if (aggregate.sourcePlane !== 'CML_633C_CANONICAL_DOMAIN') {
      push('AUTHORITATIVE_SOURCE_PLANE_REQUIRED', 'sourcePlane', 'Uno stato autorevole richiede il piano canonico CML-633C.');
    }
    if (!hasText(aggregate.authority.authorityRef)) {
      push('AUTHORITY_REF_REQUIRED', 'authority.authorityRef', 'Lo stato autorevole richiede un riferimento R7 verificabile.');
    }
    if (!hasText(aggregate.authority.materializationRef)) {
      push('MATERIALIZATION_REF_REQUIRED', 'authority.materializationRef', 'Lo stato autorevole richiede una materializzazione identificabile.');
    }
    if (!aggregate.authority.materializationFingerprint || !SHA256_HEX.test(aggregate.authority.materializationFingerprint)) {
      push('MATERIALIZATION_FINGERPRINT_INVALID', 'authority.materializationFingerprint', 'La materializzazione richiede un fingerprint SHA-256 esadecimale.');
    }
    if (aggregate.authority.state === 'PREPARED' && !hasText(aggregate.authority.decisionReceiptRef)) {
      push('PREPARED_DECISION_RECEIPT_REQUIRED', 'authority.decisionReceiptRef', 'Una candidata PREPARED richiede la decisione istituzionale cui è vincolata.');
    }
  }

  if (aggregate.semanticStatus === 'SEMANTICALLY_VALIDATED' && !hasText(aggregate.semanticValidationRef)) {
    push(
      'SEMANTIC_VALIDATION_REF_REQUIRED',
      'semanticValidationRef',
      'La validazione semantica non può essere dichiarata senza un artefatto di verifica esplicito.',
    );
  }

  const segmentByRef = new Map<string, OperationalCurriculumSegment>();
  const targetScopeKeys = new Set<string>();
  aggregate.segments.forEach((segment, index) => {
    const path = `segments[${index}]`;
    if (!hasText(segment.segmentRef)) push('SEGMENT_REF_REQUIRED', `${path}.segmentRef`, 'segmentRef è obbligatorio.');
    if (segmentByRef.has(segment.segmentRef)) push('DUPLICATE_SEGMENT_REF', `${path}.segmentRef`, 'segmentRef duplicato.');
    segmentByRef.set(segment.segmentRef, segment);
    if (segment.curriculumVersionRef !== aggregate.curriculumVersionRef) {
      push('SEGMENT_VERSION_MISMATCH', `${path}.curriculumVersionRef`, 'Il segmento deve appartenere alla versione dell’aggregato.');
    }
    if (!hasText(segment.scopeRef)) push('SEGMENT_SCOPE_REF_REQUIRED', `${path}.scopeRef`, 'scopeRef è obbligatorio.');
    validateTarget(segment.target, `${path}.target`, errors);
    const targetScopeKey = `${buildOperationalCurriculumTargetRef(segment.target)}|${segment.scopeRef}`;
    if (targetScopeKeys.has(targetScopeKey)) {
      push('DUPLICATE_TARGET_SCOPE', path, 'Lo stesso target e scopeRef non possono identificare due segmenti operativi.');
    }
    targetScopeKeys.add(targetScopeKey);
  });

  const nodeByRef = new Map<string, OperationalCurriculumNode>();
  aggregate.nodes.forEach((node, index) => {
    const path = `nodes[${index}]`;
    if (!hasText(node.nodeRef)) push('NODE_REF_REQUIRED', `${path}.nodeRef`, 'nodeRef è obbligatorio.');
    if (nodeByRef.has(node.nodeRef)) push('DUPLICATE_NODE_REF', `${path}.nodeRef`, 'nodeRef duplicato.');
    nodeByRef.set(node.nodeRef, node);
    if (node.curriculumVersionRef !== aggregate.curriculumVersionRef) {
      push('NODE_VERSION_MISMATCH', `${path}.curriculumVersionRef`, 'Il nodo deve appartenere alla versione dell’aggregato.');
    }
    const segment = segmentByRef.get(node.segmentRef);
    if (!segment) {
      push('NODE_SEGMENT_NOT_FOUND', `${path}.segmentRef`, 'Il nodo deve riferirsi a un segmento presente nello stesso aggregato.');
    }
    if (!hasText(node.text)) push('NODE_TEXT_REQUIRED', `${path}.text`, 'Il testo del nodo non può essere vuoto.');
    if (!SHA256_HEX.test(node.textFingerprint)) {
      push('NODE_TEXT_FINGERPRINT_INVALID', `${path}.textFingerprint`, 'Il nodo richiede un fingerprint SHA-256 esadecimale.');
    }

    if (node.authorityLevel === 'NATIONAL_PRESCRIPTIVE') {
      if (node.origin !== 'normative-source') {
        push('NATIONAL_NODE_ORIGIN_INVALID', `${path}.origin`, 'Un requisito nazionale deve avere origine normativa.');
      }
      if (!segment || !canUseOperationalNodeAsNationalRequirement(node, segment.target)) {
        push(
          'NATIONAL_NODE_SOURCE_BINDING_REQUIRED',
          `${path}.nationalElementEvidence`,
          'Un requisito nazionale richiede un elemento sorgente verificato, dello stesso target e con lo stesso fingerprint del testo.',
        );
      }
    }

    if (aggregate.authority.state === 'ACTIVE' && (node.lifecycle !== 'ACTIVE' || node.authorityLevel === 'LOCAL_WORKING')) {
      push(
        'ACTIVE_CANONICAL_NODE_NOT_FINAL',
        path,
        'Una versione canonica ACTIVE non può contenere nodi locali di lavoro o con lifecycle non ACTIVE.',
      );
    }
    if (aggregate.authority.state === 'ACTIVE' && (node.origin === 'synthetic' || node.origin === 'demonstration')) {
      push('ACTIVE_CANONICAL_SYNTHETIC_NODE_FORBIDDEN', `${path}.origin`, 'Contenuti sintetici o dimostrativi non possono essere autorità canonica attiva.');
    }
  });

  aggregate.segments.forEach((segment, segmentIndex) => {
    const seen = new Set<string>();
    segment.nodeRefs.forEach((nodeRef, nodeIndex) => {
      const path = `segments[${segmentIndex}].nodeRefs[${nodeIndex}]`;
      if (seen.has(nodeRef)) push('DUPLICATE_SEGMENT_NODE_REF', path, 'Lo stesso nodo non può comparire due volte nel segmento.');
      seen.add(nodeRef);
      const node = nodeByRef.get(nodeRef);
      if (!node) {
        push('SEGMENT_NODE_NOT_FOUND', path, 'Il riferimento deve risolvere un nodo presente nello stesso aggregato.');
      } else if (node.segmentRef !== segment.segmentRef) {
        push('SEGMENT_NODE_BACKREF_MISMATCH', path, 'Il nodo referenziato dichiara un segmento diverso.');
      }
    });
  });

  const linkRefs = new Set<string>();
  aggregate.links.forEach((link, index) => {
    const path = `links[${index}]`;
    if (!hasText(link.linkRef)) push('LINK_REF_REQUIRED', `${path}.linkRef`, 'linkRef è obbligatorio.');
    if (linkRefs.has(link.linkRef)) push('DUPLICATE_LINK_REF', `${path}.linkRef`, 'linkRef duplicato.');
    linkRefs.add(link.linkRef);
    if (link.curriculumVersionRef !== aggregate.curriculumVersionRef) {
      push('LINK_VERSION_MISMATCH', `${path}.curriculumVersionRef`, 'Il link deve appartenere alla versione dell’aggregato.');
    }
    if (!nodeByRef.has(link.fromNodeRef)) push('LINK_SOURCE_NODE_NOT_FOUND', `${path}.fromNodeRef`, 'Nodo sorgente non presente.');
    if (!nodeByRef.has(link.toNodeRef)) push('LINK_TARGET_NODE_NOT_FOUND', `${path}.toNodeRef`, 'Nodo destinazione non presente.');
    if (link.fromNodeRef === link.toNodeRef) push('SELF_LINK_FORBIDDEN', path, 'Un link curricolare non può collegare un nodo a se stesso.');
  });

  return { valid: errors.length === 0, errors };
}

export function assertOperationalCurriculumAggregate(aggregate: OperationalCurriculumAggregateV1): void {
  const validation = validateOperationalCurriculumAggregate(aggregate);
  if (!validation.valid) {
    throw new Error(`OPERATIONAL_CURRICULUM_INVALID:${validation.errors.map(error => error.code).join(',')}`);
  }
}
