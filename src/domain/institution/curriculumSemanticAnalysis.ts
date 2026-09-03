import {
  assessElementBinding,
  type NationalCurriculumElementBinding,
} from '../curriculum/national/elementBindings';
import type {
  OperationalCurriculumAggregateV1,
  OperationalCurriculumNode,
} from '../curriculum/operationalContract';

export const CURRICULUM_SEMANTIC_ANALYSIS_VERSION = 'arena-p3-v2-semantic-v1' as const;
export const CURRICULUM_SEMANTIC_REVIEW_SCHEMA_VERSION = 'arena-p3-v2-semantic-review-v1' as const;

export type CurriculumSemanticFindingKind =
  | 'SOURCE_UNVERIFIED'
  | 'REVIEW_REQUIRED'
  | 'COVERAGE'
  | 'GAP'
  | 'DISCONTINUITY'
  | 'OVERLAP'
  | 'CONFLICT';

export type CurriculumSemanticReviewConclusion =
  | 'COVERAGE'
  | 'GAP'
  | 'DISCONTINUITY'
  | 'OVERLAP'
  | 'CONFLICT';

export interface CurriculumSemanticNodeBinding {
  nodeRef: string;
  textFingerprint: string;
}

export interface CurriculumSemanticReviewReceipt {
  schemaVersion: typeof CURRICULUM_SEMANTIC_REVIEW_SCHEMA_VERSION;
  reviewRef: string;
  curriculumVersionRef: string;
  nationalElementId: string;
  nationalNodeRef: string;
  nationalTextFingerprint: string;
  instituteNodeBindings: readonly CurriculumSemanticNodeBinding[];
  conclusion: CurriculumSemanticReviewConclusion;
  reviewerRef: string;
  reviewerAttestation: true;
  reviewedAt: string;
  rationale: string;
}

export interface CurriculumSemanticFinding {
  findingRef: string;
  nationalElementId: string;
  segmentId: string;
  elementKind: NationalCurriculumElementBinding['elementKind'];
  schoolOrder: NationalCurriculumElementBinding['schoolOrder'];
  kind: CurriculumSemanticFindingKind;
  statement: string;
  nationalNodeRef?: string;
  instituteNodeRefs: readonly string[];
  reviewRef?: string;
  reviewRequired: boolean;
  authorityEffect: 'NONE';
}

export interface CurriculumSemanticAnalysisSummary {
  totalElements: number;
  sourceUnverified: number;
  reviewRequired: number;
  coverage: number;
  gaps: number;
  discontinuities: number;
  overlaps: number;
  conflicts: number;
}

export interface CurriculumSemanticAnalysisResult {
  analysisVersion: typeof CURRICULUM_SEMANTIC_ANALYSIS_VERSION;
  curriculumVersionRef: string;
  findings: readonly CurriculumSemanticFinding[];
  summary: CurriculumSemanticAnalysisSummary;
  reviewComplete: boolean;
  fullyCovered: boolean;
  requiresInstitutionalAction: boolean;
  authorityEffect: 'NONE';
}

export interface CurriculumSemanticReviewValidation {
  valid: boolean;
  reason?: string;
}

const SHA256_HEX = /^[a-f0-9]{64}$/;
const normalized = (value: string): string => value.replace(/\s+/g, ' ').trim();
const hasText = (value: string | undefined): value is string => Boolean(value && normalized(value));

function nationalElementIdForNode(node: OperationalCurriculumNode): readonly string[] {
  return node.nationalElementEvidence
    .filter(evidence => assessElementBinding(evidence.binding).canUseAsCanonicalSourceText)
    .map(evidence => evidence.binding.elementId);
}

function findNationalNode(
  aggregate: OperationalCurriculumAggregateV1,
  elementId: string,
): OperationalCurriculumNode | undefined {
  const matches = aggregate.nodes.filter(node =>
    node.authorityLevel === 'NATIONAL_PRESCRIPTIVE'
    && nationalElementIdForNode(node).includes(elementId));

  if (matches.length > 1) {
    throw new Error(`CURRICULUM_SEMANTIC_DUPLICATE_NATIONAL_NODE:${elementId}`);
  }
  return matches[0];
}

function verifiedFingerprintForElement(
  node: OperationalCurriculumNode,
  elementId: string,
): string | undefined {
  return node.nationalElementEvidence.find(evidence =>
    evidence.binding.elementId === elementId
    && assessElementBinding(evidence.binding).canUseAsCanonicalSourceText
    && Boolean(evidence.verifiedTextFingerprint && SHA256_HEX.test(evidence.verifiedTextFingerprint)))
    ?.verifiedTextFingerprint;
}

export function validateCurriculumSemanticReviewReceipt(
  aggregate: OperationalCurriculumAggregateV1,
  receipt: CurriculumSemanticReviewReceipt,
): CurriculumSemanticReviewValidation {
  if (receipt.schemaVersion !== CURRICULUM_SEMANTIC_REVIEW_SCHEMA_VERSION) {
    return { valid: false, reason: 'Schema di revisione semantica non riconosciuto.' };
  }
  if (!hasText(receipt.reviewRef) || !hasText(receipt.reviewerRef) || !hasText(receipt.rationale)) {
    return { valid: false, reason: 'reviewRef, reviewerRef e rationale sono obbligatori.' };
  }
  if (receipt.reviewerAttestation !== true) {
    return { valid: false, reason: 'Manca l’attestazione esplicita del revisore umano.' };
  }
  if (!receipt.reviewedAt || Number.isNaN(Date.parse(receipt.reviewedAt))) {
    return { valid: false, reason: 'La data della revisione semantica non è valida.' };
  }
  if (receipt.curriculumVersionRef !== aggregate.curriculumVersionRef) {
    return { valid: false, reason: 'La revisione appartiene a una versione curricolare diversa.' };
  }

  const nationalNode = findNationalNode(aggregate, receipt.nationalElementId);
  if (!nationalNode) {
    return { valid: false, reason: 'L’elemento nazionale non dispone di testo sorgente verificato nell’aggregato.' };
  }
  const verifiedFingerprint = verifiedFingerprintForElement(nationalNode, receipt.nationalElementId);
  if (!verifiedFingerprint) {
    return { valid: false, reason: 'Manca il fingerprint verificato del testo nazionale.' };
  }
  if (receipt.nationalNodeRef !== nationalNode.nodeRef || receipt.nationalTextFingerprint !== verifiedFingerprint) {
    return { valid: false, reason: 'La revisione non è vincolata alla versione corrente del testo nazionale verificato.' };
  }

  const nodeByRef = new Map(aggregate.nodes.map(node => [node.nodeRef, node] as const));
  const seen = new Set<string>();
  for (const binding of receipt.instituteNodeBindings) {
    if (seen.has(binding.nodeRef)) {
      return { valid: false, reason: `Nodo d’istituto duplicato nella revisione: ${binding.nodeRef}.` };
    }
    seen.add(binding.nodeRef);
    const node = nodeByRef.get(binding.nodeRef);
    if (!node) {
      return { valid: false, reason: `Nodo d’istituto non trovato: ${binding.nodeRef}.` };
    }
    if (node.curriculumVersionRef !== aggregate.curriculumVersionRef) {
      return { valid: false, reason: `Nodo d’istituto appartenente a una versione diversa: ${binding.nodeRef}.` };
    }
    if (node.authorityLevel === 'NATIONAL_PRESCRIPTIVE' || node.origin === 'normative-source') {
      return { valid: false, reason: `Un nodo nazionale non può essere usato come copertura d’istituto: ${binding.nodeRef}.` };
    }
    if (!SHA256_HEX.test(binding.textFingerprint) || binding.textFingerprint !== node.textFingerprint) {
      return { valid: false, reason: `Fingerprint non corrente per il nodo d’istituto: ${binding.nodeRef}.` };
    }
  }

  const bindingCount = receipt.instituteNodeBindings.length;
  if (receipt.conclusion === 'GAP' && bindingCount !== 0) {
    return { valid: false, reason: 'Una lacuna semantica deve dichiarare zero nodi d’istituto coprenti.' };
  }
  if (receipt.conclusion !== 'GAP' && bindingCount === 0) {
    return { valid: false, reason: `${receipt.conclusion} richiede almeno un nodo d’istituto esplicitamente esaminato.` };
  }
  if (receipt.conclusion === 'OVERLAP' && bindingCount < 2) {
    return { valid: false, reason: 'Una sovrapposizione richiede almeno due nodi d’istituto esplicitamente coinvolti.' };
  }

  return { valid: true };
}

function statementFor(
  kind: CurriculumSemanticFindingKind,
  elementId: string,
  instituteNodeRefs: readonly string[],
): string {
  if (kind === 'SOURCE_UNVERIFIED') {
    return `L’elemento ${elementId} non dispone ancora di testo nazionale verificato da persona; nessuna conclusione di copertura è ammessa.`;
  }
  if (kind === 'REVIEW_REQUIRED') {
    return `L’elemento ${elementId} è verificato nella fonte nazionale ma richiede una revisione semantica umana rispetto al curricolo d’istituto.`;
  }
  if (kind === 'GAP') return `La revisione umana ha classificato ${elementId} come lacuna nel curricolo d’istituto.`;
  if (kind === 'COVERAGE') return `La revisione umana ha confermato la copertura di ${elementId} tramite ${instituteNodeRefs.length} nodo/i d’istituto.`;
  if (kind === 'DISCONTINUITY') return `La revisione umana ha rilevato una discontinuità rispetto a ${elementId}.`;
  if (kind === 'OVERLAP') return `La revisione umana ha rilevato una sovrapposizione tra ${instituteNodeRefs.length} nodi d’istituto rispetto a ${elementId}.`;
  return `La revisione umana ha rilevato un conflitto semantico rispetto a ${elementId}.`;
}

export function summarizeCurriculumSemanticFindings(
  findings: readonly Pick<CurriculumSemanticFinding, 'kind'>[],
): CurriculumSemanticAnalysisSummary {
  const count = (kind: CurriculumSemanticFindingKind) => findings.filter(finding => finding.kind === kind).length;
  return {
    totalElements: findings.length,
    sourceUnverified: count('SOURCE_UNVERIFIED'),
    reviewRequired: count('REVIEW_REQUIRED'),
    coverage: count('COVERAGE'),
    gaps: count('GAP'),
    discontinuities: count('DISCONTINUITY'),
    overlaps: count('OVERLAP'),
    conflicts: count('CONFLICT'),
  };
}

export function analyzeCurriculumSemanticCoverage(input: {
  aggregate: OperationalCurriculumAggregateV1;
  nationalInventory: readonly NationalCurriculumElementBinding[];
  reviews: readonly CurriculumSemanticReviewReceipt[];
}): CurriculumSemanticAnalysisResult {
  const inventoryIds = new Set<string>();
  for (const element of input.nationalInventory) {
    if (inventoryIds.has(element.elementId)) {
      throw new Error(`CURRICULUM_SEMANTIC_DUPLICATE_INVENTORY_ELEMENT:${element.elementId}`);
    }
    inventoryIds.add(element.elementId);
  }

  const reviewByElementId = new Map<string, CurriculumSemanticReviewReceipt>();
  const reviewRefs = new Set<string>();
  for (const review of input.reviews) {
    if (!inventoryIds.has(review.nationalElementId)) {
      throw new Error(`CURRICULUM_SEMANTIC_REVIEW_OUT_OF_SCOPE:${review.nationalElementId}`);
    }
    if (reviewByElementId.has(review.nationalElementId)) {
      throw new Error(`CURRICULUM_SEMANTIC_DUPLICATE_REVIEW_FOR_ELEMENT:${review.nationalElementId}`);
    }
    if (reviewRefs.has(review.reviewRef)) {
      throw new Error(`CURRICULUM_SEMANTIC_DUPLICATE_REVIEW_REF:${review.reviewRef}`);
    }
    reviewRefs.add(review.reviewRef);
    reviewByElementId.set(review.nationalElementId, review);
  }

  const findings = input.nationalInventory.map((element) => {
    const nationalNode = findNationalNode(input.aggregate, element.elementId);
    const nationalFingerprint = nationalNode
      ? verifiedFingerprintForElement(nationalNode, element.elementId)
      : undefined;

    if (!nationalNode || !nationalFingerprint) {
      const kind = 'SOURCE_UNVERIFIED' as const;
      return {
        findingRef: `p3v2:${element.elementId}:${kind.toLowerCase()}`,
        nationalElementId: element.elementId,
        segmentId: element.segmentId,
        elementKind: element.elementKind,
        schoolOrder: element.schoolOrder,
        kind,
        statement: statementFor(kind, element.elementId, []),
        instituteNodeRefs: [],
        reviewRequired: true,
        authorityEffect: 'NONE' as const,
      } satisfies CurriculumSemanticFinding;
    }

    const review = reviewByElementId.get(element.elementId);
    if (!review) {
      const kind = 'REVIEW_REQUIRED' as const;
      return {
        findingRef: `p3v2:${element.elementId}:${kind.toLowerCase()}`,
        nationalElementId: element.elementId,
        segmentId: element.segmentId,
        elementKind: element.elementKind,
        schoolOrder: element.schoolOrder,
        kind,
        statement: statementFor(kind, element.elementId, []),
        nationalNodeRef: nationalNode.nodeRef,
        instituteNodeRefs: [],
        reviewRequired: true,
        authorityEffect: 'NONE' as const,
      } satisfies CurriculumSemanticFinding;
    }

    const validation = validateCurriculumSemanticReviewReceipt(input.aggregate, review);
    if (!validation.valid) {
      throw new Error(`CURRICULUM_SEMANTIC_INVALID_REVIEW:${review.reviewRef}:${validation.reason ?? 'UNKNOWN'}`);
    }

    const instituteNodeRefs = review.instituteNodeBindings.map(binding => binding.nodeRef);
    return {
      findingRef: `p3v2:${element.elementId}:${review.conclusion.toLowerCase()}`,
      nationalElementId: element.elementId,
      segmentId: element.segmentId,
      elementKind: element.elementKind,
      schoolOrder: element.schoolOrder,
      kind: review.conclusion,
      statement: statementFor(review.conclusion, element.elementId, instituteNodeRefs),
      nationalNodeRef: nationalNode.nodeRef,
      instituteNodeRefs,
      reviewRef: review.reviewRef,
      reviewRequired: false,
      authorityEffect: 'NONE' as const,
    } satisfies CurriculumSemanticFinding;
  });

  const summary = summarizeCurriculumSemanticFindings(findings);
  const reviewComplete = summary.sourceUnverified === 0 && summary.reviewRequired === 0;
  const fullyCovered = reviewComplete && summary.coverage === summary.totalElements;
  const requiresInstitutionalAction =
    summary.gaps > 0
    || summary.discontinuities > 0
    || summary.overlaps > 0
    || summary.conflicts > 0;

  return {
    analysisVersion: CURRICULUM_SEMANTIC_ANALYSIS_VERSION,
    curriculumVersionRef: input.aggregate.curriculumVersionRef,
    findings,
    summary,
    reviewComplete,
    fullyCovered,
    requiresInstitutionalAction,
    authorityEffect: 'NONE',
  };
}
