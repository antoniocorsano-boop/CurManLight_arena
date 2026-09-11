import { describe, expect, it } from 'vitest';
import {
  CURRICULUM_SEMANTIC_REVIEW_SCHEMA_VERSION,
  analyzeCurriculumSemanticCoverage,
  validateCurriculumSemanticReviewReceipt,
  type CurriculumSemanticReviewConclusion,
  type CurriculumSemanticReviewReceipt,
} from '../domain/institution/curriculumSemanticAnalysis';
import {
  buildTechnologySourceReviewQueue,
  promoteTechnologyElementFromHumanReceipt,
  type TechnologySourceVerificationReceipt,
  type VerifiedTechnologyElement,
} from '../domain/curriculum/national/technologyHumanVerification';
import { buildTechnologyOperationalPilot } from '../domain/curriculum/technology/technologyOperationalPilot';
import {
  DM221_LOWER_SECONDARY_TECHNOLOGY_ELEMENT_INVENTORY,
  analyzeTechnologySemanticCoverage,
} from '../domain/curriculum/technology/technologySemanticAnalysis';

const CREATED_AT = '2026-09-03T15:30:00+02:00';
const CURRICULUM_VERSION_REF = 'technology:2026-2027:draft-v1';

function verifiedTechnologyElement(sourceText = 'Testo nazionale di Tecnologia verificato sulla fonte ufficiale.'): VerifiedTechnologyElement {
  const task = buildTechnologySourceReviewQueue().find(candidate => candidate.schoolOrder === 'secondaria');
  if (!task) throw new Error('Missing lower-secondary Technology review task');
  const receipt: TechnologySourceVerificationReceipt = {
    schemaVersion: 'dm221-tech-source-review-v1',
    elementId: task.elementId,
    sourceId: task.sourceId,
    page: task.page,
    section: task.section,
    ordinal: task.ordinal,
    decision: 'VERIFIED',
    verifiedSourceText: sourceText,
    reviewerAttestation: true,
    reviewedAt: CREATED_AT,
  };
  return promoteTechnologyElementFromHumanReceipt(receipt);
}

async function pilotWith(element?: VerifiedTechnologyElement) {
  return buildTechnologyOperationalPilot({
    institutionId: 'istituto-pilota',
    curriculumVersionRef: CURRICULUM_VERSION_REF,
    createdAt: CREATED_AT,
    verifiedNationalElements: element ? [element] : [],
  });
}

function reviewFor(
  pilot: Awaited<ReturnType<typeof pilotWith>>,
  element: VerifiedTechnologyElement,
  conclusion: CurriculumSemanticReviewConclusion,
  instituteNodeCount = conclusion === 'GAP' ? 0 : 1,
): CurriculumSemanticReviewReceipt {
  const nationalNode = pilot.aggregate.nodes.find(node =>
    node.nationalElementEvidence.some(evidence => evidence.binding.elementId === element.elementId));
  if (!nationalNode) throw new Error('Missing verified national node');
  const nationalEvidence = nationalNode.nationalElementEvidence.find(evidence => evidence.binding.elementId === element.elementId);
  if (!nationalEvidence?.verifiedTextFingerprint) throw new Error('Missing verified national fingerprint');

  const instituteNodes = pilot.aggregate.nodes
    .filter(node => node.authorityLevel === 'LOCAL_WORKING')
    .slice(0, instituteNodeCount);

  return {
    schemaVersion: CURRICULUM_SEMANTIC_REVIEW_SCHEMA_VERSION,
    reviewRef: `semantic-review:${element.elementId}:${conclusion.toLowerCase()}`,
    curriculumVersionRef: CURRICULUM_VERSION_REF,
    nationalElementId: element.elementId,
    nationalNodeRef: nationalNode.nodeRef,
    nationalTextFingerprint: nationalEvidence.verifiedTextFingerprint,
    instituteNodeBindings: instituteNodes.map(node => ({
      nodeRef: node.nodeRef,
      textFingerprint: node.textFingerprint,
    })),
    conclusion,
    reviewerRef: 'human-reviewer:technology',
    reviewerAttestation: true,
    reviewedAt: CREATED_AT,
    rationale: `Giudizio umano esplicito: ${conclusion}.`,
  };
}

describe('R7C3 P3-v2 semantic element-level analysis', () => {
  it('uses the 30 lower-secondary Technology national elements as the semantic scope', () => {
    expect(DM221_LOWER_SECONDARY_TECHNOLOGY_ELEMENT_INVENTORY).toHaveLength(30);
    expect(DM221_LOWER_SECONDARY_TECHNOLOGY_ELEMENT_INVENTORY.every(element => element.schoolOrder === 'secondaria')).toBe(true);
  });

  it('does not misclassify unverified national source text as a curriculum gap', async () => {
    const pilot = await pilotWith();
    const result = analyzeTechnologySemanticCoverage({ pilot });

    expect(result.analysis.summary).toMatchObject({
      totalElements: 30,
      sourceUnverified: 30,
      reviewRequired: 0,
      gaps: 0,
      coverage: 0,
    });
    expect(result.analysis.reviewComplete).toBe(false);
    expect(result.analysis.fullyCovered).toBe(false);
  });

  it('requires human semantic review after source verification and never auto-maps equal text', async () => {
    const probePilot = await pilotWith();
    const instituteNode = probePilot.aggregate.nodes.find(node => node.authorityLevel === 'LOCAL_WORKING');
    if (!instituteNode) throw new Error('Missing institute node');

    const element = verifiedTechnologyElement(instituteNode.text);
    const pilot = await pilotWith(element);
    const result = analyzeTechnologySemanticCoverage({ pilot });
    const finding = result.analysis.findings.find(candidate => candidate.nationalElementId === element.elementId);

    expect(finding?.kind).toBe('REVIEW_REQUIRED');
    expect(finding?.instituteNodeRefs).toEqual([]);
    expect(result.analysis.summary.reviewRequired).toBe(1);
    expect(result.analysis.summary.coverage).toBe(0);
  });

  it('accepts coverage only from an explicit current human semantic receipt', async () => {
    const element = verifiedTechnologyElement();
    const pilot = await pilotWith(element);
    const review = reviewFor(pilot, element, 'COVERAGE');

    expect(validateCurriculumSemanticReviewReceipt(pilot.aggregate, review)).toEqual({ valid: true });
    const result = analyzeTechnologySemanticCoverage({ pilot, reviews: [review] });
    const finding = result.analysis.findings.find(candidate => candidate.nationalElementId === element.elementId);

    expect(finding?.kind).toBe('COVERAGE');
    expect(finding?.reviewRequired).toBe(false);
    expect(finding?.reviewRef).toBe(review.reviewRef);
    expect(result.analysis.summary.coverage).toBe(1);
    expect(result.analysis.authorityEffect).toBe('NONE');
  });

  it('permits a GAP only as an explicit human conclusion with zero covering institute nodes', async () => {
    const element = verifiedTechnologyElement();
    const pilot = await pilotWith(element);
    const gap = reviewFor(pilot, element, 'GAP');
    expect(validateCurriculumSemanticReviewReceipt(pilot.aggregate, gap)).toEqual({ valid: true });

    const invalidGap = { ...gap, instituteNodeBindings: reviewFor(pilot, element, 'COVERAGE').instituteNodeBindings };
    expect(validateCurriculumSemanticReviewReceipt(pilot.aggregate, invalidGap)).toMatchObject({ valid: false });

    const result = analyzeTechnologySemanticCoverage({ pilot, reviews: [gap] });
    expect(result.analysis.summary.gaps).toBe(1);
    expect(result.analysis.requiresInstitutionalAction).toBe(true);
  });

  it('rejects stale semantic receipts when an institute node fingerprint no longer matches', async () => {
    const element = verifiedTechnologyElement();
    const pilot = await pilotWith(element);
    const review = reviewFor(pilot, element, 'COVERAGE');
    const stale = {
      ...review,
      instituteNodeBindings: review.instituteNodeBindings.map(binding => ({ ...binding, textFingerprint: '0'.repeat(64) })),
    };

    expect(validateCurriculumSemanticReviewReceipt(pilot.aggregate, stale)).toMatchObject({ valid: false });
    expect(() => analyzeCurriculumSemanticCoverage({
      aggregate: pilot.aggregate,
      nationalInventory: DM221_LOWER_SECONDARY_TECHNOLOGY_ELEMENT_INVENTORY,
      reviews: [stale],
    })).toThrow(/CURRICULUM_SEMANTIC_INVALID_REVIEW/);
  });

  it('requires at least two explicit institute nodes before an OVERLAP finding can be recorded', async () => {
    const element = verifiedTechnologyElement();
    const pilot = await pilotWith(element);
    const invalid = reviewFor(pilot, element, 'OVERLAP', 1);
    const valid = reviewFor(pilot, element, 'OVERLAP', 2);

    expect(validateCurriculumSemanticReviewReceipt(pilot.aggregate, invalid)).toMatchObject({ valid: false });
    expect(validateCurriculumSemanticReviewReceipt(pilot.aggregate, valid)).toEqual({ valid: true });

    const result = analyzeTechnologySemanticCoverage({ pilot, reviews: [valid] });
    expect(result.analysis.summary.overlaps).toBe(1);
    expect(result.analysis.requiresInstitutionalAction).toBe(true);
  });

  it('records DISCONTINUITY and CONFLICT only as explicit human findings', async () => {
    const element = verifiedTechnologyElement();
    const pilot = await pilotWith(element);

    const discontinuity = analyzeTechnologySemanticCoverage({
      pilot,
      reviews: [reviewFor(pilot, element, 'DISCONTINUITY')],
    });
    expect(discontinuity.analysis.summary.discontinuities).toBe(1);
    expect(discontinuity.analysis.requiresInstitutionalAction).toBe(true);

    const conflict = analyzeTechnologySemanticCoverage({
      pilot,
      reviews: [reviewFor(pilot, element, 'CONFLICT')],
    });
    expect(conflict.analysis.summary.conflicts).toBe(1);
    expect(conflict.analysis.requiresInstitutionalAction).toBe(true);
  });

  it('rejects semantic reviews when the national source text is not verified in the aggregate', async () => {
    const element = verifiedTechnologyElement();
    const verifiedPilot = await pilotWith(element);
    const review = reviewFor(verifiedPilot, element, 'COVERAGE');
    const unverifiedPilot = await pilotWith();

    expect(() => analyzeTechnologySemanticCoverage({
      pilot: unverifiedPilot,
      reviews: [review],
    })).toThrow(/CURRICULUM_SEMANTIC_REVIEW_WITHOUT_VERIFIED_SOURCE/);
  });

  it('does not declare the whole curriculum semantically reviewed while source or review work remains', async () => {
    const element = verifiedTechnologyElement();
    const pilot = await pilotWith(element);
    const review = reviewFor(pilot, element, 'COVERAGE');
    const result = analyzeTechnologySemanticCoverage({ pilot, reviews: [review] });

    expect(result.analysis.reviewComplete).toBe(false);
    expect(result.analysis.fullyCovered).toBe(false);
    expect(result.analysis.summary.sourceUnverified).toBe(29);
  });
});
