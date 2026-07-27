import { describe, it, expect } from 'vitest';
import {
  validateInstituteCurriculumVersion,
  validateCurriculumSegment,
  validateCurriculumNode,
  validateVerticalCurriculumLink,
  validateCurriculumDomainGraph,
  canTransitionVersionStatus,
  canTransitionLinkStatus,
  isApprovedVersionImmutable,
  findDuplicateVerticalLinks,
  findDanglingNodeReferences,
  findDanglingSegmentReferences,
  detectInvalidStructuralCycles,
} from '../../domain/curriculum/validation-legacy';
import type { InstituteCurriculumVersion } from '../../domain/curriculum/version';
import type { CurriculumSegment, CurriculumSegmentContent } from '../../domain/curriculum/segment';
import type { CurriculumNode } from '../../domain/curriculum/node';
import type { VerticalCurriculumLink } from '../../domain/curriculum/verticalLink';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function makeVersion(overrides: Partial<InstituteCurriculumVersion> = {}): InstituteCurriculumVersion {
  return {
    id: 'v1',
    title: 'Curricolo 2026-2029',
    versionNumber: '1.0',
    status: 'draft',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

const emptyContent: CurriculumSegmentContent = {
  traguardi: [],
  obiettivi: [],
  evidenze: [],
  conoscenze: [],
  abilita: [],
  competenze: [],
  nucleiFondanti: [],
  proposals: [],
};

function makeSegment(overrides: Partial<CurriculumSegment> = {}): CurriculumSegment {
  return {
    id: 's1',
    versionId: 'v1',
    schoolLevel: 'primaria',
    subjectOrFieldId: 'matematica',
    scope: { type: 'school-level' },
    frameworkApplicability: { framework: 'IN2025', resolutionStatus: 'resolved', resolutionReason: 'ENTRY_COHORT_2026_OR_LATER' },
    workStatus: 'draft',
    content: emptyContent,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeNode(overrides: Partial<CurriculumNode> = {}): CurriculumNode {
  return {
    id: 'n1',
    versionId: 'v1',
    segmentId: 's1',
    type: 'competence',
    title: 'Competenza matematica',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeLink(overrides: Partial<VerticalCurriculumLink> = {}): VerticalCurriculumLink {
  return {
    id: 'l1',
    versionId: 'v1',
    sourceNodeId: 'n1',
    targetNodeId: 'n2',
    relationType: 'continuity',
    rationale: 'Continuità tra primaria e secondaria',
    status: 'draft',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// VERSION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CML-630E — Productive Curriculum Domain', () => {
  describe('InstituteCurriculumVersion', () => {
    // Test 1
    it('valid draft version', () => {
      const v = makeVersion({ status: 'draft' });
      const issues = validateInstituteCurriculumVersion(v);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    // Test 2
    it('approved version with approvedAt', () => {
      const v = makeVersion({ status: 'approved', approvedAt: '2026-06-01T00:00:00Z' });
      const issues = validateInstituteCurriculumVersion(v);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    // Test 3
    it('approved version without approvedAt is invalid', () => {
      const v = makeVersion({ status: 'approved' });
      const issues = validateInstituteCurriculumVersion(v);
      expect(issues.some(i => i.code === 'VERSION_APPROVED_WITHOUT_APPROVED_AT')).toBe(true);
    });

    // Test 4
    it('previousVersionId equal to id is invalid', () => {
      const v = makeVersion({ id: 'v1', previousVersionId: 'v1' });
      const issues = validateInstituteCurriculumVersion(v);
      expect(issues.some(i => i.code === 'VERSION_SELF_REFERENCING_PREVIOUS')).toBe(true);
    });

    // Test 5
    it('incoherent effective period is invalid', () => {
      const v = makeVersion({ effectiveFrom: '2027-01-01', effectiveTo: '2026-01-01' });
      const issues = validateInstituteCurriculumVersion(v);
      expect(issues.some(i => i.code === 'VERSION_INVALID_EFFECTIVE_PERIOD')).toBe(true);
    });

    // Test 6
    it('approved version is immutable', () => {
      const v = makeVersion({ status: 'approved', approvedAt: '2026-06-01T00:00:00Z' });
      expect(isApprovedVersionImmutable(v)).toBe(true);
    });

    // Test 7
    it('draft version is not immutable', () => {
      const v = makeVersion({ status: 'draft' });
      expect(isApprovedVersionImmutable(v)).toBe(false);
    });

    // Test 8
    it('version transition draft → under-review is allowed', () => {
      expect(canTransitionVersionStatus('draft', 'under-review')).toBe(true);
    });

    // Test 9
    it('version transition draft → approved is not allowed', () => {
      expect(canTransitionVersionStatus('draft', 'approved')).toBe(false);
    });

    // Test 10
    it('superseded version without approvedAt is invalid', () => {
      const v = makeVersion({ status: 'superseded' });
      const issues = validateInstituteCurriculumVersion(v);
      expect(issues.some(i => i.code === 'VERSION_SUPERSEDED_WITHOUT_APPROVED_AT')).toBe(true);
    });

    // Test 11
    it('previousVersionId referencing non-existent version', () => {
      const v = makeVersion({ previousVersionId: 'non-existent' });
      const issues = validateInstituteCurriculumVersion(v, []);
      expect(issues.some(i => i.code === 'VERSION_PREVIOUS_NOT_FOUND')).toBe(true);
    });

    // Test 12
    it('missing title is invalid', () => {
      const v = makeVersion({ title: '' });
      const issues = validateInstituteCurriculumVersion(v);
      expect(issues.some(i => i.code === 'VERSION_MISSING_TITLE')).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SEGMENT TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('CurriculumSegment', () => {
    // Test 13
    it('valid segment associated to existing version', () => {
      const v = makeVersion();
      const s = makeSegment();
      const issues = validateCurriculumSegment(s, [], [v]);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    // Test 14
    it('segment with non-existent version', () => {
      const s = makeSegment({ versionId: 'non-existent' });
      const issues = validateCurriculumSegment(s, [], [makeVersion()]);
      expect(issues.some(i => i.code === 'SEGMENT_VERSION_NOT_FOUND')).toBe(true);
    });

    // Test 15
    it('valid grade scope', () => {
      const s = makeSegment({ scope: { type: 'grade', grade: '3a' } });
      const issues = validateCurriculumSegment(s);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    // Test 16
    it('valid grade-range scope', () => {
      const s = makeSegment({ scope: { type: 'grade-range', grades: ['1a', '2a', '3a'] } });
      const issues = validateCurriculumSegment(s);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    // Test 17
    it('empty grade-range is invalid', () => {
      const s = makeSegment({ scope: { type: 'grade-range', grades: [] } });
      const issues = validateCurriculumSegment(s);
      expect(issues.some(i => i.code === 'SEGMENT_EMPTY_GRADE_RANGE')).toBe(true);
    });

    // Test 18
    it('duplicate grades in grade-range is a warning', () => {
      const s = makeSegment({ scope: { type: 'grade-range', grades: ['1a', '1a', '2a'] } });
      const issues = validateCurriculumSegment(s);
      expect(issues.some(i => i.code === 'SEGMENT_DUPLICATE_GRADES')).toBe(true);
    });

    // Test 19
    it('self-referencing sourceSegmentId is invalid', () => {
      const s = makeSegment({ id: 's1', sourceSegmentId: 's1' });
      const issues = validateCurriculumSegment(s);
      expect(issues.some(i => i.code === 'SEGMENT_SELF_REFERENCING_SOURCE')).toBe(true);
    });

    // Test 20
    it('self-referencing replacesSegmentId is invalid', () => {
      const s = makeSegment({ id: 's1', replacesSegmentId: 's1' });
      const issues = validateCurriculumSegment(s);
      expect(issues.some(i => i.code === 'SEGMENT_SELF_REFERENCING_REPLACES')).toBe(true);
    });

    // Test 21
    it('sourceSegmentId referencing non-existent segment', () => {
      const s = makeSegment({ sourceSegmentId: 'non-existent' });
      const existing = makeSegment({ id: 'existing' });
      const issues = validateCurriculumSegment(s, [s, existing], [makeVersion()]);
      expect(issues.some(i => i.code === 'SEGMENT_SOURCE_NOT_FOUND')).toBe(true);
    });

    // Test 22
    it('distinguishes framework from workStatus', () => {
      const s = makeSegment({
        frameworkApplicability: { framework: 'IN2012', resolutionStatus: 'resolved', resolutionReason: 'BEFORE_TRANSITION' },
        workStatus: 'effective',
      });
      const issues = validateCurriculumSegment(s);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // NODE TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('CurriculumNode', () => {
    // Test 23
    it('valid node in existing segment', () => {
      const s = makeSegment();
      const n = makeNode();
      const issues = validateCurriculumNode(n, [], [s]);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    // Test 24
    it('node with non-existent segment', () => {
      const n = makeNode({ segmentId: 'non-existent' });
      const issues = validateCurriculumNode(n, [], [makeSegment()]);
      expect(issues.some(i => i.code === 'NODE_SEGMENT_NOT_FOUND')).toBe(true);
    });

    // Test 25
    it('node with version mismatch', () => {
      const s = makeSegment({ versionId: 'v1' });
      const n = makeNode({ versionId: 'v2', segmentId: 's1' });
      const issues = validateCurriculumNode(n, [], [s]);
      expect(issues.some(i => i.code === 'NODE_VERSION_MISMATCH')).toBe(true);
    });

    // Test 26
    it('node replacing itself is invalid', () => {
      const n = makeNode({ id: 'n1', replacesNodeId: 'n1' });
      const issues = validateCurriculumNode(n);
      expect(issues.some(i => i.code === 'NODE_SELF_REFERENCING_REPLACES')).toBe(true);
    });

    // Test 27
    it('valid node type', () => {
      const n = makeNode({ type: 'competence' });
      const issues = validateCurriculumNode(n);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    // Test 28
    it('valid structural source reference', () => {
      const source = makeNode({ id: 'n-source' });
      const n = makeNode({ id: 'n-target', sourceNodeId: 'n-source' });
      const issues = validateCurriculumNode(n, [source, n], [makeSegment()]);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    // Test 29
    it('dangling source reference', () => {
      const n = makeNode({ sourceNodeId: 'non-existent' });
      const issues = validateCurriculumNode(n, [n], [makeSegment()]);
      expect(issues.some(i => i.code === 'NODE_SOURCE_NOT_FOUND')).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // VERTICAL CURRICULUM LINK TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('VerticalCurriculumLink', () => {
    // Test 30
    it('valid link between existing nodes', () => {
      const n1 = makeNode({ id: 'n1' });
      const n2 = makeNode({ id: 'n2' });
      const l = makeLink({ sourceNodeId: 'n1', targetNodeId: 'n2' });
      const issues = validateVerticalCurriculumLink(l, [], [n1, n2]);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    // Test 31
    it('link with non-existent source', () => {
      const n2 = makeNode({ id: 'n2' });
      const l = makeLink({ sourceNodeId: 'non-existent', targetNodeId: 'n2' });
      const issues = validateVerticalCurriculumLink(l, [], [n2]);
      expect(issues.some(i => i.code === 'LINK_SOURCE_NOT_FOUND')).toBe(true);
    });

    // Test 32
    it('link with non-existent target', () => {
      const n1 = makeNode({ id: 'n1' });
      const l = makeLink({ sourceNodeId: 'n1', targetNodeId: 'non-existent' });
      const issues = validateVerticalCurriculumLink(l, [], [n1]);
      expect(issues.some(i => i.code === 'LINK_TARGET_NOT_FOUND')).toBe(true);
    });

    // Test 33
    it('link with same source and target is invalid', () => {
      const n1 = makeNode({ id: 'n1' });
      const l = makeLink({ sourceNodeId: 'n1', targetNodeId: 'n1' });
      const issues = validateVerticalCurriculumLink(l, [], [n1]);
      expect(issues.some(i => i.code === 'LINK_SELF_REFERENCING')).toBe(true);
    });

    // Test 34
    it('valid interdisciplinary link', () => {
      const n1 = makeNode({ id: 'n1', segmentId: 's-math' });
      const n2 = makeNode({ id: 'n2', segmentId: 's-tech' });
      const l = makeLink({ sourceNodeId: 'n1', targetNodeId: 'n2', relationType: 'integration' });
      const issues = validateVerticalCurriculumLink(l, [], [n1, n2]);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    // Test 35
    it('valid cross-order link', () => {
      const n1 = makeNode({ id: 'n1', versionId: 'v1' });
      const n2 = makeNode({ id: 'n2', versionId: 'v1' });
      const l = makeLink({ sourceNodeId: 'n1', targetNodeId: 'n2', relationType: 'continuity' });
      const issues = validateVerticalCurriculumLink(l, [], [n1, n2]);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    // Test 36
    it('proposed link without rationale is invalid', () => {
      const n1 = makeNode({ id: 'n1' });
      const n2 = makeNode({ id: 'n2' });
      const l = makeLink({ sourceNodeId: 'n1', targetNodeId: 'n2', status: 'proposed', rationale: '' });
      const issues = validateVerticalCurriculumLink(l, [], [n1, n2]);
      expect(issues.some(i => i.code === 'LINK_PROPOSED_VALIDATED_WITHOUT_RATIONALE')).toBe(true);
    });

    // Test 37
    it('validated link without validator is invalid', () => {
      const n1 = makeNode({ id: 'n1' });
      const n2 = makeNode({ id: 'n2' });
      const l = makeLink({
        sourceNodeId: 'n1', targetNodeId: 'n2', status: 'validated',
        validatedAt: '2026-06-01T00:00:00Z',
      });
      const issues = validateVerticalCurriculumLink(l, [], [n1, n2]);
      expect(issues.some(i => i.code === 'LINK_VALIDATED_WITHOUT_VALIDATOR')).toBe(true);
    });

    // Test 38
    it('validated link without date is invalid', () => {
      const n1 = makeNode({ id: 'n1' });
      const n2 = makeNode({ id: 'n2' });
      const l = makeLink({
        sourceNodeId: 'n1', targetNodeId: 'n2', status: 'validated',
        validatedByRole: 'dipartimento',
      });
      const issues = validateVerticalCurriculumLink(l, [], [n1, n2]);
      expect(issues.some(i => i.code === 'LINK_VALIDATED_WITHOUT_DATE')).toBe(true);
    });

    // Test 39
    it('duplicate logical link is a warning', () => {
      const n1 = makeNode({ id: 'n1' });
      const n2 = makeNode({ id: 'n2' });
      const l1 = makeLink({ id: 'l1', sourceNodeId: 'n1', targetNodeId: 'n2', relationType: 'continuity' });
      const l2 = makeLink({ id: 'l2', sourceNodeId: 'n1', targetNodeId: 'n2', relationType: 'continuity' });
      const issues = validateVerticalCurriculumLink(l2, [l1, l2], [n1, n2]);
      expect(issues.some(i => i.code === 'LINK_DUPLICATE_LOGICAL')).toBe(true);
    });

    // Test 40
    it('link transition proposed → validated is allowed', () => {
      expect(canTransitionLinkStatus('proposed', 'validated')).toBe(true);
    });

    // Test 41
    it('link transition draft → validated is not allowed', () => {
      expect(canTransitionLinkStatus('draft', 'validated')).toBe(false);
    });

    // Test 42
    it('discontinuity relation is correctly represented', () => {
      const n1 = makeNode({ id: 'n1' });
      const n2 = makeNode({ id: 'n2' });
      const l = makeLink({
        sourceNodeId: 'n1', targetNodeId: 'n2',
        relationType: 'discontinuity',
        rationale: 'Gap identificato tra primaria e secondaria',
      });
      const issues = validateVerticalCurriculumLink(l, [], [n1, n2]);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
      expect(l.relationType).toBe('discontinuity');
    });

    // Test 43
    it('link between nodes in different segments is valid', () => {
      const n1 = makeNode({ id: 'n1', segmentId: 's-primary' });
      const n2 = makeNode({ id: 'n2', segmentId: 's-secondary' });
      const l = makeLink({ sourceNodeId: 'n1', targetNodeId: 'n2', relationType: 'prerequisite' });
      const issues = validateVerticalCurriculumLink(l, [], [n1, n2]);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // GRAPH TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Domain Graph', () => {
    // Test 44
    it('coherent graph with version, segments, nodes, and links', () => {
      const v = makeVersion();
      const s1 = makeSegment({ id: 's1', versionId: 'v1' });
      const s2 = makeSegment({ id: 's2', versionId: 'v1', schoolLevel: 'secondaria', subjectOrFieldId: 'matematica' });
      const n1 = makeNode({ id: 'n1', versionId: 'v1', segmentId: 's1' });
      const n2 = makeNode({ id: 'n2', versionId: 'v1', segmentId: 's2' });
      const l1 = makeLink({ id: 'l1', versionId: 'v1', sourceNodeId: 'n1', targetNodeId: 'n2' });
      const issues = validateCurriculumDomainGraph(v, [s1, s2], [n1, n2], [l1]);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    // Test 45
    it('multiple dangling references detected', () => {
      const v = makeVersion();
      const l1 = makeLink({ id: 'l1', versionId: 'v1', sourceNodeId: 'missing1', targetNodeId: 'missing2' });
      const issues = validateCurriculumDomainGraph(v, [], [], [l1]);
      expect(issues.filter(i => i.severity === 'error').length).toBeGreaterThan(0);
    });

    // Test 46
    it('incoherent version-link relationship', () => {
      const v = makeVersion({ id: 'v1' });
      const l = makeLink({ id: 'l1', versionId: 'v-wrong', sourceNodeId: 'n1', targetNodeId: 'n2' });
      const issues = validateCurriculumDomainGraph(v, [], [], [l]);
      expect(issues.some(i => i.code === 'LINK_SOURCE_NOT_FOUND' || i.code === 'LINK_MISSING_SOURCE')).toBe(true);
    });

    // Test 47
    it('incoherent version-link relationship', () => {
      const v = makeVersion({ id: 'v1' });
      const l = makeLink({ id: 'l1', versionId: 'v-wrong', sourceNodeId: 'n1', targetNodeId: 'n2' });
      const issues = validateCurriculumDomainGraph(v, [], [], [l]);
      expect(issues.some(i => i.code === 'LINK_SOURCE_NOT_FOUND' || i.code === 'LINK_TARGET_NOT_FOUND')).toBe(true);
    });

    // Test 48
    it('aggregated error detection', () => {
      const v = makeVersion({ title: '', status: 'approved' });
      const issues = validateCurriculumDomainGraph(v, [], [], []);
      expect(issues.filter(i => i.severity === 'error').length).toBeGreaterThanOrEqual(2);
    });

    // Test 49
    it('no false positives on a valid domain', () => {
      const v = makeVersion({ status: 'approved', approvedAt: '2026-06-01T00:00:00Z' });
      const s = makeSegment({ versionId: 'v1' });
      const n1 = makeNode({ id: 'n1', versionId: 'v1', segmentId: 's1' });
      const n2 = makeNode({ id: 'n2', versionId: 'v1', segmentId: 's1' });
      const l = makeLink({ id: 'l1', versionId: 'v1', sourceNodeId: 'n1', targetNodeId: 'n2', status: 'validated', validatedByRole: 'dipartimento', validatedAt: '2026-06-15T00:00:00Z' });
      const issues = validateCurriculumDomainGraph(v, [s], [n1, n2], [l]);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // DETECTION FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Detection Functions', () => {
    // Test 50
    it('findDuplicateVerticalLinks detects duplicates', () => {
      const l1 = makeLink({ id: 'l1', sourceNodeId: 'n1', targetNodeId: 'n2', relationType: 'continuity' });
      const l2 = makeLink({ id: 'l2', sourceNodeId: 'n1', targetNodeId: 'n2', relationType: 'continuity' });
      const result = findDuplicateVerticalLinks([l1, l2]);
      expect(result).toHaveLength(1);
      expect(result[0].link1.id).toBe('l1');
      expect(result[0].link2.id).toBe('l2');
    });

    // Test 51
    it('findDuplicateVerticalLinks returns empty for unique links', () => {
      const l1 = makeLink({ id: 'l1', sourceNodeId: 'n1', targetNodeId: 'n2', relationType: 'continuity' });
      const l2 = makeLink({ id: 'l2', sourceNodeId: 'n1', targetNodeId: 'n2', relationType: 'prerequisite' });
      const result = findDuplicateVerticalLinks([l1, l2]);
      expect(result).toHaveLength(0);
    });

    // Test 52
    it('findDanglingNodeReferences detects missing nodes', () => {
      const l1 = makeLink({ id: 'l1', sourceNodeId: 'missing', targetNodeId: 'n2' });
      const n2 = makeNode({ id: 'n2' });
      const result = findDanglingNodeReferences([n2], [l1]);
      expect(result).toHaveLength(1);
      expect(result[0].missingNodeId).toBe('missing');
    });

    // Test 53
    it('findDanglingSegmentReferences detects missing version', () => {
      const s = makeSegment({ versionId: 'missing' });
      const result = findDanglingSegmentReferences([s], []);
      expect(result).toHaveLength(1);
      expect(result[0].referenceType).toBe('versionId');
    });

    // Test 54
    it('detectInvalidStructuralCycles detects cycles', () => {
      const s1 = makeSegment({ id: 's1', sourceSegmentId: 's2' });
      const s2 = makeSegment({ id: 's2', sourceSegmentId: 's1' });
      const result = detectInvalidStructuralCycles([s1, s2]);
      expect(result.length).toBeGreaterThan(0);
    });

    // Test 55
    it('detectInvalidStructuralCycles returns empty for acyclic graph', () => {
      const s1 = makeSegment({ id: 's1' });
      const s2 = makeSegment({ id: 's2', sourceSegmentId: 's1' });
      const s3 = makeSegment({ id: 's3', sourceSegmentId: 's2' });
      const result = detectInvalidStructuralCycles([s1, s2, s3]);
      expect(result).toHaveLength(0);
    });
  });
});
