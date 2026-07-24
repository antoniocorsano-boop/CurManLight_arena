/**
 * CML-630C — Curriculum e-Twin Domain Validation Prototype
 *
 * Logica di dominio sperimentale per la validazione
 * del modello di curricolo verticale d'istituto.
 */

import type {
  InstituteCurriculumVersion,
  CurriculumSegment,
  CurriculumNode,
  VerticalCurriculumLink,
  CurriculumVersionWithSegments,
  SegmentWithNodes,
  LinkWithNodes,
  InstituteCurriculumStatus,
  SegmentWorkflowStatus,
  LinkStatus,
  InstitutionalRole,
  SchoolOrder,
} from './types';

export function createVersion(
  title: string,
  effectivePeriod: string,
  previousVersionId?: string
): InstituteCurriculumVersion {
  const now = new Date().toISOString();
  return {
    id: `version-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    versionNumber: 1,
    effectivePeriod,
    status: 'draft',
    previousVersionId,
    createdAt: now,
    updatedAt: now,
  };
}

export function createSegment(
  curriculumVersionId: string,
  schoolOrder: CurriculumSegment['schoolOrder'],
  scope: CurriculumSegment['scope'],
  disciplineOrField: string,
  applicableFramework: CurriculumSegment['applicableFramework']
): CurriculumSegment {
  return {
    id: `segment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    curriculumVersionId,
    schoolOrder,
    scope,
    disciplineOrField,
    applicableFramework,
    institutionalContentStatus: 'not-started',
    contentVersion: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function createNode(
  segmentId: string,
  type: CurriculumNode['type'],
  title: string,
  description?: string,
  framework?: CurriculumNode['framework']
): CurriculumNode {
  return {
    id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    segmentId,
    type,
    title,
    description,
    framework,
    contentStatus: 'draft',
  };
}

export function createLink(
  sourceNodeId: string,
  targetNodeId: string,
  relationType: VerticalCurriculumLink['relationType'],
  rationale?: string,
  createdByRole?: InstitutionalRole
): VerticalCurriculumLink {
  return {
    id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sourceNodeId,
    targetNodeId,
    relationType,
    rationale,
    status: 'draft',
    createdByRole,
  };
}

export function getVersionWithSegments(
  version: InstituteCurriculumVersion,
  segments: CurriculumSegment[]
): CurriculumVersionWithSegments {
  return {
    version,
    segments: segments.filter(s => s.curriculumVersionId === version.id),
  };
}

export function getSegmentWithNodes(
  segment: CurriculumSegment,
  nodes: CurriculumNode[]
): SegmentWithNodes {
  return {
    segment,
    nodes: nodes.filter(n => n.segmentId === segment.id),
  };
}

export function getLinkWithNodes(
  link: VerticalCurriculumLink,
  nodes: CurriculumNode[]
): LinkWithNodes | null {
  const sourceNode = nodes.find(n => n.id === link.sourceNodeId);
  const targetNode = nodes.find(n => n.id === link.targetNodeId);
  if (!sourceNode || !targetNode) return null;
  return { link, sourceNode, targetNode };
}

export function validateLink(
  link: VerticalCurriculumLink,
  nodes: CurriculumNode[]
): { valid: boolean; error?: string } {
  const source = nodes.find(n => n.id === link.sourceNodeId);
  const target = nodes.find(n => n.id === link.targetNodeId);

  if (!source) {
    return { valid: false, error: `Source node ${link.sourceNodeId} not found` };
  }
  if (!target) {
    return { valid: false, error: `Target node ${link.targetNodeId} not found` };
  }
  if (link.sourceNodeId === link.targetNodeId) {
    return { valid: false, error: 'Link cannot connect a node to itself' };
  }
  return { valid: true };
}

export function canTransitionVersion(
  currentStatus: InstituteCurriculumStatus,
  targetStatus: InstituteCurriculumStatus
): boolean {
  const transitions: Record<InstituteCurriculumStatus, InstituteCurriculumStatus[]> = {
    'draft': ['under-review'],
    'under-review': ['draft', 'proposed-to-collegio'],
    'proposed-to-collegio': ['under-review', 'approved'],
    'approved': ['superseded'],
    'superseded': [],
  };
  return transitions[currentStatus]?.includes(targetStatus) ?? false;
}

export function transitionVersion(
  version: InstituteCurriculumVersion,
  targetStatus: InstituteCurriculumStatus
): InstituteCurriculumVersion {
  if (!canTransitionVersion(version.status, targetStatus)) {
    throw new Error(`Cannot transition from ${version.status} to ${targetStatus}`);
  }
  const now = new Date().toISOString();
  const updated: InstituteCurriculumVersion = {
    ...version,
    status: targetStatus,
    updatedAt: now,
  };
  if (targetStatus === 'approved') {
    updated.approvedAt = now;
  }
  if (targetStatus === 'superseded') {
    updated.supersededAt = now;
  }
  return updated;
}

export function canTransitionSegment(
  currentStatus: SegmentWorkflowStatus,
  targetStatus: SegmentWorkflowStatus
): boolean {
  const transitions: Record<SegmentWorkflowStatus, SegmentWorkflowStatus[]> = {
    'not-started': ['draft'],
    'draft': ['open-for-contributions', 'under-review'],
    'open-for-contributions': ['under-review'],
    'under-review': ['ready-for-consolidation', 'draft'],
    'ready-for-consolidation': ['included-in-proposal'],
    'included-in-proposal': ['effective'],
    'effective': [],
    'legacy-imported': ['draft'],
  };
  return transitions[currentStatus]?.includes(targetStatus) ?? false;
}

export function transitionSegment(
  segment: CurriculumSegment,
  targetStatus: SegmentWorkflowStatus
): CurriculumSegment {
  if (!canTransitionSegment(segment.institutionalContentStatus, targetStatus)) {
    throw new Error(`Cannot transition segment from ${segment.institutionalContentStatus} to ${targetStatus}`);
  }
  return {
    ...segment,
    institutionalContentStatus: targetStatus,
    updatedAt: new Date().toISOString(),
  };
}

export function canTransitionLink(
  currentStatus: LinkStatus,
  targetStatus: LinkStatus
): boolean {
  const transitions: Record<LinkStatus, LinkStatus[]> = {
    'draft': ['proposed'],
    'proposed': ['validated', 'rejected'],
    'validated': [],
    'rejected': ['draft'],
  };
  return transitions[currentStatus]?.includes(targetStatus) ?? false;
}

export function transitionLink(
  link: VerticalCurriculumLink,
  targetStatus: LinkStatus,
  role?: InstitutionalRole
): VerticalCurriculumLink {
  if (!canTransitionLink(link.status, targetStatus)) {
    throw new Error(`Cannot transition link from ${link.status} to ${targetStatus}`);
  }
  const updated: VerticalCurriculumLink = { ...link, status: targetStatus };
  if (targetStatus === 'validated' && role) {
    updated.validatedByRole = role;
  }
  return updated;
}

export function getSegmentsByDiscipline(
  segments: CurriculumSegment[],
  discipline: string
): CurriculumSegment[] {
  return segments.filter(s => s.disciplineOrField === discipline);
}

export function getSegmentsByOrder(
  segments: CurriculumSegment[],
  order: SchoolOrder
): CurriculumSegment[] {
  return segments.filter(s => s.schoolOrder === order);
}

export function getLinksByNode(
  links: VerticalCurriculumLink[],
  nodeId: string
): VerticalCurriculumLink[] {
  return links.filter(l => l.sourceNodeId === nodeId || l.targetNodeId === nodeId);
}

export function getLinksByStatus(
  links: VerticalCurriculumLink[],
  status: LinkStatus
): VerticalCurriculumLink[] {
  return links.filter(l => l.status === status);
}

export function getNodesBySegment(
  nodes: CurriculumNode[],
  segmentId: string
): CurriculumNode[] {
  return nodes.filter(n => n.segmentId === segmentId);
}

export function getNodesByType(
  nodes: CurriculumNode[],
  type: CurriculumNode['type']
): CurriculumNode[] {
  return nodes.filter(n => n.type === type);
}
