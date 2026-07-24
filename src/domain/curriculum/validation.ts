/**
 * CML-630E — Domain Validation Functions
 *
 * Funzioni pure e testabili per la validazione del dominio curricolare produttivo.
 * Ogni funzione restituisce DomainValidationIssue[] per fornire feedback strutturato.
 */

import type {
  DomainValidationIssue,
  InstituteCurriculumStatus,
  CurriculumSegmentWorkStatus,
  VerticalCurriculumLinkStatus,
} from './types';
import {
  VERSION_STATUS_TRANSITIONS,
  SEGMENT_WORK_STATUS_TRANSITIONS,
  LINK_STATUS_TRANSITIONS,
} from './types';
import type { InstituteCurriculumVersion } from './version';
import type { CurriculumSegment } from './segment';
import type { CurriculumNode } from './node';
import type { VerticalCurriculumLink } from './verticalLink';

// ─── Version Validation ────────────────────────────────────────────────────────

export function validateInstituteCurriculumVersion(
  version: InstituteCurriculumVersion,
  allVersions: InstituteCurriculumVersion[] = []
): DomainValidationIssue[] {
  const issues: DomainValidationIssue[] = [];

  if (!version.id) {
    issues.push({
      code: 'VERSION_MISSING_ID',
      severity: 'error',
      entityType: 'InstituteCurriculumVersion',
      message: 'Version must have an id',
    });
  }

  if (!version.title?.trim()) {
    issues.push({
      code: 'VERSION_MISSING_TITLE',
      severity: 'error',
      entityType: 'InstituteCurriculumVersion',
      entityId: version.id,
      message: 'Version must have a non-empty title',
    });
  }

  if (!version.versionNumber?.trim()) {
    issues.push({
      code: 'VERSION_MISSING_VERSION_NUMBER',
      severity: 'error',
      entityType: 'InstituteCurriculumVersion',
      entityId: version.id,
      message: 'Version must have a version number',
    });
  }

  if (!version.createdAt) {
    issues.push({
      code: 'VERSION_MISSING_CREATED_AT',
      severity: 'error',
      entityType: 'InstituteCurriculumVersion',
      entityId: version.id,
      message: 'Version must have a createdAt timestamp',
    });
  }

  if (!version.updatedAt) {
    issues.push({
      code: 'VERSION_MISSING_UPDATED_AT',
      severity: 'error',
      entityType: 'InstituteCurriculumVersion',
      entityId: version.id,
      message: 'Version must have an updatedAt timestamp',
    });
  }

  // Invariant: approved version must have approvedAt
  if (version.status === 'approved' && !version.approvedAt) {
    issues.push({
      code: 'VERSION_APPROVED_WITHOUT_APPROVED_AT',
      severity: 'error',
      entityType: 'InstituteCurriculumVersion',
      entityId: version.id,
      message: 'An approved version must have an approvedAt timestamp',
    });
  }

  // Invariant: superseded version must have been previously approved
  if (version.status === 'superseded' && !version.approvedAt) {
    issues.push({
      code: 'VERSION_SUPERSEDED_WITHOUT_APPROVED_AT',
      severity: 'error',
      entityType: 'InstituteCurriculumVersion',
      entityId: version.id,
      message: 'A superseded version must have been previously approved (approvedAt required)',
    });
  }

  // Invariant: previousVersionId cannot be the same as id
  if (version.previousVersionId && version.previousVersionId === version.id) {
    issues.push({
      code: 'VERSION_SELF_REFERENCING_PREVIOUS',
      severity: 'error',
      entityType: 'InstituteCurriculumVersion',
      entityId: version.id,
      message: 'previousVersionId cannot be the same as id',
    });
  }

  // Invariant: effective period coherence
  if (version.effectiveFrom && version.effectiveTo) {
    if (new Date(version.effectiveFrom) >= new Date(version.effectiveTo)) {
      issues.push({
        code: 'VERSION_INVALID_EFFECTIVE_PERIOD',
        severity: 'error',
        entityType: 'InstituteCurriculumVersion',
        entityId: version.id,
        message: 'effectiveFrom must be before effectiveTo',
      });
    }
  }

  // Invariant: previousVersionId must reference an existing version
  if (version.previousVersionId) {
    const previousVersion = allVersions.find(v => v.id === version.previousVersionId);
    if (!previousVersion) {
      issues.push({
        code: 'VERSION_PREVIOUS_NOT_FOUND',
        severity: 'error',
        entityType: 'InstituteCurriculumVersion',
        entityId: version.id,
        message: `previousVersionId '${version.previousVersionId}' references a non-existent version`,
      });
    }
  }

  return issues;
}

// ─── Segment Validation ────────────────────────────────────────────────────────

export function validateCurriculumSegment(
  segment: CurriculumSegment,
  allSegments: CurriculumSegment[] = [],
  allVersions: InstituteCurriculumVersion[] = []
): DomainValidationIssue[] {
  const issues: DomainValidationIssue[] = [];

  if (!segment.id) {
    issues.push({
      code: 'SEGMENT_MISSING_ID',
      severity: 'error',
      entityType: 'CurriculumSegment',
      message: 'Segment must have an id',
    });
  }

  if (!segment.versionId) {
    issues.push({
      code: 'SEGMENT_MISSING_VERSION_ID',
      severity: 'error',
      entityType: 'CurriculumSegment',
      entityId: segment.id,
      message: 'Segment must have a versionId',
    });
  } else {
    // Invariant: version must exist
    const versionExists = allVersions.some(v => v.id === segment.versionId);
    if (allVersions.length > 0 && !versionExists) {
      issues.push({
        code: 'SEGMENT_VERSION_NOT_FOUND',
        severity: 'error',
        entityType: 'CurriculumSegment',
        entityId: segment.id,
        message: `Segment references non-existent version '${segment.versionId}'`,
      });
    }
  }

  if (!segment.schoolLevel) {
    issues.push({
      code: 'SEGMENT_MISSING_SCHOOL_LEVEL',
      severity: 'error',
      entityType: 'CurriculumSegment',
      entityId: segment.id,
      message: 'Segment must have a schoolLevel',
    });
  }

  if (!segment.subjectOrFieldId?.trim()) {
    issues.push({
      code: 'SEGMENT_MISSING_SUBJECT_OR_FIELD',
      severity: 'error',
      entityType: 'CurriculumSegment',
      entityId: segment.id,
      message: 'Segment must have a subjectOrFieldId',
    });
  }

  // Invariant: scope validation
  if (segment.scope) {
    if (segment.scope.type === 'grade-range') {
      const grades = segment.scope.grades;
      if (!grades || grades.length === 0) {
        issues.push({
          code: 'SEGMENT_EMPTY_GRADE_RANGE',
          severity: 'error',
          entityType: 'CurriculumSegment',
          entityId: segment.id,
          message: 'grade-range scope must have at least one grade',
        });
      } else {
        const uniqueGrades = new Set(grades);
        if (uniqueGrades.size !== grades.length) {
          issues.push({
            code: 'SEGMENT_DUPLICATE_GRADES',
            severity: 'warning',
            entityType: 'CurriculumSegment',
            entityId: segment.id,
            message: 'grade-range scope contains duplicate grades',
          });
        }
      }
    }
  }

  // Invariant: no self-referencing structural relations
  if (segment.sourceSegmentId === segment.id) {
    issues.push({
      code: 'SEGMENT_SELF_REFERENCING_SOURCE',
      severity: 'error',
      entityType: 'CurriculumSegment',
      entityId: segment.id,
      message: 'sourceSegmentId cannot reference the same segment',
    });
  }

  if (segment.replacesSegmentId === segment.id) {
    issues.push({
      code: 'SEGMENT_SELF_REFERENCING_REPLACES',
      severity: 'error',
      entityType: 'CurriculumSegment',
      entityId: segment.id,
      message: 'replacesSegmentId cannot reference the same segment',
    });
  }

  // Invariant: structural relations must reference existing segments
  if (segment.sourceSegmentId) {
    const sourceExists = allSegments.some(s => s.id === segment.sourceSegmentId);
    if (allSegments.length > 0 && !sourceExists) {
      issues.push({
        code: 'SEGMENT_SOURCE_NOT_FOUND',
        severity: 'error',
        entityType: 'CurriculumSegment',
        entityId: segment.id,
        message: `sourceSegmentId '${segment.sourceSegmentId}' references a non-existent segment`,
      });
    }
  }

  if (segment.replacesSegmentId) {
    const replacesExists = allSegments.some(s => s.id === segment.replacesSegmentId);
    if (allSegments.length > 0 && !replacesExists) {
      issues.push({
        code: 'SEGMENT_REPLACES_NOT_FOUND',
        severity: 'error',
        entityType: 'CurriculumSegment',
        entityId: segment.id,
        message: `replacesSegmentId '${segment.replacesSegmentId}' references a non-existent segment`,
      });
    }
  }

  // Invariant: workStatus must be valid
  if (segment.workStatus) {
    const validStatuses: CurriculumSegmentWorkStatus[] = [
      'not-started', 'draft', 'open-for-contributions', 'under-review',
      'ready-for-consolidation', 'included-in-proposal', 'effective', 'legacy-imported',
    ];
    if (!validStatuses.includes(segment.workStatus)) {
      issues.push({
        code: 'SEGMENT_INVALID_WORK_STATUS',
        severity: 'error',
        entityType: 'CurriculumSegment',
        entityId: segment.id,
        message: `Invalid workStatus '${segment.workStatus}'`,
      });
    }
  }

  return issues;
}

// ─── Node Validation ───────────────────────────────────────────────────────────

export function validateCurriculumNode(
  node: CurriculumNode,
  allNodes: CurriculumNode[] = [],
  allSegments: CurriculumSegment[] = []
): DomainValidationIssue[] {
  const issues: DomainValidationIssue[] = [];

  if (!node.id) {
    issues.push({
      code: 'NODE_MISSING_ID',
      severity: 'error',
      entityType: 'CurriculumNode',
      message: 'Node must have an id',
    });
  }

  if (!node.versionId) {
    issues.push({
      code: 'NODE_MISSING_VERSION_ID',
      severity: 'error',
      entityType: 'CurriculumNode',
      entityId: node.id,
      message: 'Node must have a versionId',
    });
  }

  if (!node.segmentId) {
    issues.push({
      code: 'NODE_MISSING_SEGMENT_ID',
      severity: 'error',
      entityType: 'CurriculumNode',
      entityId: node.id,
      message: 'Node must have a segmentId',
    });
  } else {
    // Invariant: segment must exist
    const segment = allSegments.find(s => s.id === node.segmentId);
    if (allSegments.length > 0 && !segment) {
      issues.push({
        code: 'NODE_SEGMENT_NOT_FOUND',
        severity: 'error',
        entityType: 'CurriculumNode',
        entityId: node.id,
        message: `Node references non-existent segment '${node.segmentId}'`,
      });
    } else if (segment) {
      // Invariant: node's versionId must match segment's versionId
      if (node.versionId !== segment.versionId) {
        issues.push({
          code: 'NODE_VERSION_MISMATCH',
          severity: 'error',
          entityType: 'CurriculumNode',
          entityId: node.id,
          message: `Node versionId '${node.versionId}' does not match segment versionId '${segment.versionId}'`,
        });
      }
    }
  }

  if (!node.type) {
    issues.push({
      code: 'NODE_MISSING_TYPE',
      severity: 'error',
      entityType: 'CurriculumNode',
      entityId: node.id,
      message: 'Node must have a type',
    });
  }

  if (!node.title?.trim()) {
    issues.push({
      code: 'NODE_MISSING_TITLE',
      severity: 'error',
      entityType: 'CurriculumNode',
      entityId: node.id,
      message: 'Node must have a non-empty title',
    });
  }

  // Invariant: no self-referencing
  if (node.sourceNodeId === node.id) {
    issues.push({
      code: 'NODE_SELF_REFERENCING_SOURCE',
      severity: 'error',
      entityType: 'CurriculumNode',
      entityId: node.id,
      message: 'sourceNodeId cannot reference the same node',
    });
  }

  if (node.replacesNodeId === node.id) {
    issues.push({
      code: 'NODE_SELF_REFERENCING_REPLACES',
      severity: 'error',
      entityType: 'CurriculumNode',
      entityId: node.id,
      message: 'replacesNodeId cannot reference the same node',
    });
  }

  // Invariant: structural relations must reference existing nodes
  if (node.sourceNodeId) {
    const sourceExists = allNodes.some(n => n.id === node.sourceNodeId);
    if (allNodes.length > 0 && !sourceExists) {
      issues.push({
        code: 'NODE_SOURCE_NOT_FOUND',
        severity: 'error',
        entityType: 'CurriculumNode',
        entityId: node.id,
        message: `sourceNodeId '${node.sourceNodeId}' references a non-existent node`,
      });
    }
  }

  if (node.replacesNodeId) {
    const replacesExists = allNodes.some(n => n.id === node.replacesNodeId);
    if (allNodes.length > 0 && !replacesExists) {
      issues.push({
        code: 'NODE_REPLACES_NOT_FOUND',
        severity: 'error',
        entityType: 'CurriculumNode',
        entityId: node.id,
        message: `replacesNodeId '${node.replacesNodeId}' references a non-existent node`,
      });
    }
  }

  return issues;
}

// ─── VerticalCurriculumLink Validation ─────────────────────────────────────────

export function validateVerticalCurriculumLink(
  link: VerticalCurriculumLink,
  allLinks: VerticalCurriculumLink[] = [],
  allNodes: CurriculumNode[] = []
): DomainValidationIssue[] {
  const issues: DomainValidationIssue[] = [];

  if (!link.id) {
    issues.push({
      code: 'LINK_MISSING_ID',
      severity: 'error',
      entityType: 'VerticalCurriculumLink',
      message: 'Link must have an id',
    });
  }

  if (!link.versionId) {
    issues.push({
      code: 'LINK_MISSING_VERSION_ID',
      severity: 'error',
      entityType: 'VerticalCurriculumLink',
      entityId: link.id,
      message: 'Link must have a versionId',
    });
  }

  if (!link.sourceNodeId) {
    issues.push({
      code: 'LINK_MISSING_SOURCE',
      severity: 'error',
      entityType: 'VerticalCurriculumLink',
      entityId: link.id,
      message: 'Link must have a sourceNodeId',
    });
  } else {
    const sourceExists = allNodes.some(n => n.id === link.sourceNodeId);
    if (allNodes.length > 0 && !sourceExists) {
      issues.push({
        code: 'LINK_SOURCE_NOT_FOUND',
        severity: 'error',
        entityType: 'VerticalCurriculumLink',
        entityId: link.id,
        message: `sourceNodeId '${link.sourceNodeId}' references a non-existent node`,
      });
    } else if (allNodes.length === 0) {
      issues.push({
        code: 'LINK_SOURCE_NOT_FOUND',
        severity: 'error',
        entityType: 'VerticalCurriculumLink',
        entityId: link.id,
        message: `sourceNodeId '${link.sourceNodeId}' references a non-existent node`,
      });
    }
  }

  if (!link.targetNodeId) {
    issues.push({
      code: 'LINK_MISSING_TARGET',
      severity: 'error',
      entityType: 'VerticalCurriculumLink',
      entityId: link.id,
      message: 'Link must have a targetNodeId',
    });
  } else {
    const targetExists = allNodes.some(n => n.id === link.targetNodeId);
    if (allNodes.length > 0 && !targetExists) {
      issues.push({
        code: 'LINK_TARGET_NOT_FOUND',
        severity: 'error',
        entityType: 'VerticalCurriculumLink',
        entityId: link.id,
        message: `targetNodeId '${link.targetNodeId}' references a non-existent node`,
      });
    } else if (allNodes.length === 0) {
      issues.push({
        code: 'LINK_TARGET_NOT_FOUND',
        severity: 'error',
        entityType: 'VerticalCurriculumLink',
        entityId: link.id,
        message: `targetNodeId '${link.targetNodeId}' references a non-existent node`,
      });
    }
  }

  // Invariant: source and target must be different
  if (link.sourceNodeId && link.targetNodeId && link.sourceNodeId === link.targetNodeId) {
    issues.push({
      code: 'LINK_SELF_REFERENCING',
      severity: 'error',
      entityType: 'VerticalCurriculumLink',
      entityId: link.id,
      message: 'sourceNodeId and targetNodeId must be different',
    });
  }

  if (!link.relationType) {
    issues.push({
      code: 'LINK_MISSING_RELATION_TYPE',
      severity: 'error',
      entityType: 'VerticalCurriculumLink',
      entityId: link.id,
      message: 'Link must have a relationType',
    });
  }

  if (!link.rationale?.trim()) {
    issues.push({
      code: 'LINK_MISSING_RATIONALE',
      severity: 'error',
      entityType: 'VerticalCurriculumLink',
      entityId: link.id,
      message: 'Link must have a non-empty rationale',
    });
  }

  // Invariant: proposed or validated links must have rationale
  if ((link.status === 'proposed' || link.status === 'validated') && !link.rationale?.trim()) {
    issues.push({
      code: 'LINK_PROPOSED_VALIDATED_WITHOUT_RATIONALE',
      severity: 'error',
      entityType: 'VerticalCurriculumLink',
      entityId: link.id,
      message: 'Proposed or validated links must have a rationale',
    });
  }

  // Invariant: validated links must have validatedByRole and validatedAt
  if (link.status === 'validated') {
    if (!link.validatedByRole) {
      issues.push({
        code: 'LINK_VALIDATED_WITHOUT_VALIDATOR',
        severity: 'error',
        entityType: 'VerticalCurriculumLink',
        entityId: link.id,
        message: 'Validated links must have a validatedByRole',
      });
    }
    if (!link.validatedAt) {
      issues.push({
        code: 'LINK_VALIDATED_WITHOUT_DATE',
        severity: 'error',
        entityType: 'VerticalCurriculumLink',
        entityId: link.id,
        message: 'Validated links must have a validatedAt timestamp',
      });
    }
  }

  // Invariant: check for duplicate logical links
  if (allLinks.length > 0) {
    const duplicate = allLinks.find(
      existing =>
        existing.id !== link.id &&
        existing.sourceNodeId === link.sourceNodeId &&
        existing.targetNodeId === link.targetNodeId &&
        existing.relationType === link.relationType
    );
    if (duplicate) {
      issues.push({
        code: 'LINK_DUPLICATE_LOGICAL',
        severity: 'warning',
        entityType: 'VerticalCurriculumLink',
        entityId: link.id,
        message: `Duplicate logical link found: same source, target, and relationType as '${duplicate.id}'`,
      });
    }
  }

  return issues;
}

// ─── Graph Validation ──────────────────────────────────────────────────────────

export function validateCurriculumDomainGraph(
  version: InstituteCurriculumVersion,
  segments: CurriculumSegment[],
  nodes: CurriculumNode[],
  links: VerticalCurriculumLink[]
): DomainValidationIssue[] {
  const issues: DomainValidationIssue[] = [];

  // Validate version
  issues.push(...validateInstituteCurriculumVersion(version));

  // Validate all segments
  for (const segment of segments) {
    issues.push(...validateCurriculumSegment(segment, segments, [version]));
  }

  // Validate all nodes
  for (const node of nodes) {
    issues.push(...validateCurriculumNode(node, nodes, segments));
  }

  // Validate all links
  for (const link of links) {
    issues.push(...validateVerticalCurriculumLink(link, links, nodes));
  }

  // Check for dangling segment references to this version
  const versionSegments = segments.filter(s => s.versionId === version.id);
  const danglingSegmentRefs = segments.filter(
    s => s.versionId !== version.id && versionSegments.some(vs => vs.id === s.sourceSegmentId || vs.id === s.replacesSegmentId)
  );
  for (const dangling of danglingSegmentRefs) {
    issues.push({
      code: 'GRAPH DANGLING_SEGMENT_REF',
      severity: 'error',
      entityType: 'CurriculumSegment',
      entityId: dangling.id,
      message: `Segment '${dangling.id}' references a segment from version '${version.id}' but belongs to a different version`,
    });
  }

  // Check for dangling link references to this version's nodes
  const versionNodeIds = new Set(versionSegments.flatMap(s => nodes.filter(n => n.segmentId === s.id).map(n => n.id)));
  const danglingLinkRefs = links.filter(
    l => l.versionId === version.id && (!versionNodeIds.has(l.sourceNodeId) || !versionNodeIds.has(l.targetNodeId))
  );
  for (const dangling of danglingLinkRefs) {
    issues.push({
      code: 'GRAPH DANGLING_LINK_REF',
      severity: 'error',
      entityType: 'VerticalCurriculumLink',
      entityId: dangling.id,
      message: `Link '${dangling.id}' references nodes not belonging to version '${version.id}'`,
    });
  }

  return issues;
}

// ─── Transition Functions ──────────────────────────────────────────────────────

export function canTransitionVersionStatus(
  currentStatus: InstituteCurriculumStatus,
  targetStatus: InstituteCurriculumStatus
): boolean {
  const allowed = VERSION_STATUS_TRANSITIONS.get(currentStatus);
  return allowed !== undefined && allowed.includes(targetStatus);
}

export function canTransitionSegmentStatus(
  currentStatus: CurriculumSegmentWorkStatus,
  targetStatus: CurriculumSegmentWorkStatus
): boolean {
  const allowed = SEGMENT_WORK_STATUS_TRANSITIONS.get(currentStatus);
  return allowed !== undefined && allowed.includes(targetStatus);
}

export function canTransitionLinkStatus(
  currentStatus: VerticalCurriculumLinkStatus,
  targetStatus: VerticalCurriculumLinkStatus
): boolean {
  const allowed = LINK_STATUS_TRANSITIONS.get(currentStatus);
  return allowed !== undefined && allowed.includes(targetStatus);
}

// ─── Immutability Check ────────────────────────────────────────────────────────

export function isApprovedVersionImmutable(version: InstituteCurriculumVersion): boolean {
  return version.status === 'approved' || version.status === 'superseded';
}

// ─── Duplicate Detection ───────────────────────────────────────────────────────

export function findDuplicateVerticalLinks(links: VerticalCurriculumLink[]): Array<{ link1: VerticalCurriculumLink; link2: VerticalCurriculumLink }> {
  const duplicates: Array<{ link1: VerticalCurriculumLink; link2: VerticalCurriculumLink }> = [];

  for (let i = 0; i < links.length; i++) {
    for (let j = i + 1; j < links.length; j++) {
      if (
        links[i].sourceNodeId === links[j].sourceNodeId &&
        links[i].targetNodeId === links[j].targetNodeId &&
        links[i].relationType === links[j].relationType
      ) {
        duplicates.push({ link1: links[i], link2: links[j] });
      }
    }
  }

  return duplicates;
}

// ─── Dangling Reference Detection ──────────────────────────────────────────────

export function findDanglingNodeReferences(
  nodes: CurriculumNode[],
  links: VerticalCurriculumLink[]
): Array<{ linkId: string; missingNodeId: string }> {
  const nodeIds = new Set(nodes.map(n => n.id));
  const dangling: Array<{ linkId: string; missingNodeId: string }> = [];

  for (const link of links) {
    if (!nodeIds.has(link.sourceNodeId)) {
      dangling.push({ linkId: link.id, missingNodeId: link.sourceNodeId });
    }
    if (!nodeIds.has(link.targetNodeId)) {
      dangling.push({ linkId: link.id, missingNodeId: link.targetNodeId });
    }
  }

  return dangling;
}

export function findDanglingSegmentReferences(
  segments: CurriculumSegment[],
  versions: InstituteCurriculumVersion[]
): Array<{ segmentId: string; referenceType: string; missingId: string }> {
  const versionIds = new Set(versions.map(v => v.id));
  const segmentIds = new Set(segments.map(s => s.id));
  const dangling: Array<{ segmentId: string; referenceType: string; missingId: string }> = [];

  for (const segment of segments) {
    if (!versionIds.has(segment.versionId)) {
      dangling.push({
        segmentId: segment.id,
        referenceType: 'versionId',
        missingId: segment.versionId,
      });
    }
    if (segment.sourceSegmentId && !segmentIds.has(segment.sourceSegmentId)) {
      dangling.push({
        segmentId: segment.id,
        referenceType: 'sourceSegmentId',
        missingId: segment.sourceSegmentId,
      });
    }
    if (segment.replacesSegmentId && !segmentIds.has(segment.replacesSegmentId)) {
      dangling.push({
        segmentId: segment.id,
        referenceType: 'replacesSegmentId',
        missingId: segment.replacesSegmentId,
      });
    }
  }

  return dangling;
}

// ─── Cycle Detection ───────────────────────────────────────────────────────────

export function detectInvalidStructuralCycles(
  segments: CurriculumSegment[]
): Array<{ cycle: string[] }> {
  const cycles: Array<{ cycle: string[] }> = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(segmentId: string, path: string[]): void {
    if (inStack.has(segmentId)) {
      const cycleStart = path.indexOf(segmentId);
      if (cycleStart !== -1) {
        cycles.push({ cycle: path.slice(cycleStart).concat(segmentId) });
      }
      return;
    }
    if (visited.has(segmentId)) return;

    visited.add(segmentId);
    inStack.add(segmentId);
    path.push(segmentId);

    const segment = segments.find(s => s.id === segmentId);
    if (segment) {
      if (segment.sourceSegmentId) {
        dfs(segment.sourceSegmentId, [...path]);
      }
      if (segment.replacesSegmentId) {
        dfs(segment.replacesSegmentId, [...path]);
      }
    }

    inStack.delete(segmentId);
    path.pop();
  }

  for (const segment of segments) {
    if (!visited.has(segment.id)) {
      dfs(segment.id, []);
    }
  }

  return cycles;
}
