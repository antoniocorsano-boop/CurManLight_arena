import type {
  CurricoloNode,
  CurricoloSegment,
  InstituteCurricoloVersion,
  VerticalCurricoloLink,
} from '../../types/curricolo';
import type { CurricoloVerticalePerimeterV1 } from './curricoloVerticaleReleaseV1';
import {
  materializeCurricoloVerticaleMasterV1,
  type MaterializeCurricoloVerticaleMasterV1Input,
} from './curricoloVerticaleMasterMaterializationV1';
import { canonicalSerialize, computeStructuralFootprint } from './signatures';

export const ARENA_CANONICAL_CURRICOLO_ARTIFACT_V1 = 'ARENA_CANONICAL_CURRICOLO_ARTIFACT_V1' as const;

export interface StableFootprintV1 {
  algorithm: 'fnv1a';
  version: 1;
  hash: string;
}

export interface CurricoloVerticaleArtifactV1 {
  schemaVersion: typeof ARENA_CANONICAL_CURRICOLO_ARTIFACT_V1;
  institutionId: string;
  schoolYearRef: string;
  source: {
    masterId: 'CAN-CURR-MASTER-00';
    driveFileId: string;
    masterVersion: string;
    revisionId: string;
    sourceContentFootprint: StableFootprintV1;
    authority: 'INSTITUTE_CANONICAL_WORKING_BASELINE';
    humanProfessionalValidation: 'OPEN';
    curricoloVigente: false;
  };
  materialization: {
    version: InstituteCurricoloVersion;
    segments: CurricoloSegment[];
    nodes: CurricoloNode[];
    verticalLinks: VerticalCurricoloLink[];
    perimeter: CurricoloVerticalePerimeterV1;
  };
  artifactFootprint: StableFootprintV1;
}

export type CreateCurricoloVerticaleArtifactV1Input = MaterializeCurricoloVerticaleMasterV1Input;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function stableFootprint(payload: Record<string, unknown>): StableFootprintV1 {
  const footprint = computeStructuralFootprint(payload);
  return {
    algorithm: footprint.algorithm,
    version: footprint.version,
    hash: footprint.hash,
  };
}

function artifactMaterial(
  artifact: Omit<CurricoloVerticaleArtifactV1, 'artifactFootprint'>,
): Record<string, unknown> {
  return artifact as unknown as Record<string, unknown>;
}

function hasStableFootprint(value: unknown): value is StableFootprintV1 {
  if (!isRecord(value)) return false;
  return value.algorithm === 'fnv1a'
    && value.version === 1
    && nonEmptyString(value.hash);
}

function normalizeScope(value: unknown): UnknownRecord | null {
  if (!isRecord(value) || !nonEmptyString(value.type)) return null;
  if (value.type === 'school-level') return { type: 'school-level' };
  if (value.type === 'grade') {
    return nonEmptyString(value.grade) ? { type: 'grade', grade: value.grade } : null;
  }
  if (value.type === 'grade-range') {
    if (!Array.isArray(value.grades) || value.grades.length === 0
      || !value.grades.every(nonEmptyString)) return null;
    return {
      type: 'grade-range',
      grades: [...value.grades].sort((left, right) => {
        const numeric = Number(left) - Number(right);
        return Number.isFinite(numeric) && numeric !== 0 ? numeric : left.localeCompare(right);
      }),
    };
  }
  return null;
}

function governedScopeKey(
  schoolOrder: unknown,
  domainId: unknown,
  scope: unknown,
): string | null {
  if (!nonEmptyString(schoolOrder) || !nonEmptyString(domainId)) return null;
  const normalizedScope = normalizeScope(scope);
  if (!normalizedScope) return null;
  return canonicalSerialize({ schoolOrder, domainId, scope: normalizedScope });
}

function assertArtifactSource(input: CreateCurricoloVerticaleArtifactV1Input): void {
  const source = input.sourceMaster;
  if (source.masterId !== 'CAN-CURR-MASTER-00') throw new Error('unsupported canonical master id');
  if (source.masterVersion !== '1.3') throw new Error('canonical artifact requires master version 1.3');
  if (!source.revisionId.trim()) throw new Error('canonical artifact requires revisionId');
  if (source.authority !== 'INSTITUTE_CANONICAL_WORKING_BASELINE') {
    throw new Error('canonical artifact requires working-baseline authority');
  }
  if (source.humanProfessionalValidation !== 'OPEN') {
    throw new Error('canonical artifact requires open human professional validation');
  }
  if (source.curricoloVigente !== false) throw new Error('canonical artifact requires non-vigente source');
}

export function createCurricoloVerticaleArtifactV1(
  input: CreateCurricoloVerticaleArtifactV1Input,
): CurricoloVerticaleArtifactV1 {
  assertArtifactSource(input);
  const materialized = materializeCurricoloVerticaleMasterV1(input);
  const sourceContentFootprint = stableFootprint({
    format: input.sourceSnapshot.format,
    content: input.sourceSnapshot.content,
  });

  const base: Omit<CurricoloVerticaleArtifactV1, 'artifactFootprint'> = {
    schemaVersion: ARENA_CANONICAL_CURRICOLO_ARTIFACT_V1,
    institutionId: input.institutionId,
    schoolYearRef: input.schoolYearRef,
    source: {
      masterId: 'CAN-CURR-MASTER-00',
      driveFileId: input.sourceMaster.driveFileId,
      masterVersion: input.sourceMaster.masterVersion,
      revisionId: input.sourceMaster.revisionId,
      sourceContentFootprint,
      authority: 'INSTITUTE_CANONICAL_WORKING_BASELINE',
      humanProfessionalValidation: 'OPEN',
      curricoloVigente: false,
    },
    materialization: {
      version: materialized.version,
      segments: materialized.segments,
      nodes: materialized.nodes,
      verticalLinks: materialized.verticalLinks,
      perimeter: materialized.perimeter,
    },
  };

  return {
    ...base,
    artifactFootprint: stableFootprint(artifactMaterial(base)),
  };
}

export function validateCurricoloVerticaleArtifactV1(
  input: unknown,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(input)) {
    return { valid: false, errors: ['artifact must be an object'] };
  }

  const artifact = input;
  if (artifact.schemaVersion !== ARENA_CANONICAL_CURRICOLO_ARTIFACT_V1) {
    errors.push('invalid artifact schemaVersion');
  }
  if (!nonEmptyString(artifact.institutionId)) errors.push('institutionId is required');
  if (!nonEmptyString(artifact.schoolYearRef)) errors.push('schoolYearRef is required');

  const source = artifact.source;
  if (!isRecord(source)) {
    errors.push('source is required');
  } else {
    if (source.masterId !== 'CAN-CURR-MASTER-00') errors.push('invalid canonical master id');
    if (source.masterVersion !== '1.3') errors.push('canonical master version must be 1.3');
    if (!nonEmptyString(source.driveFileId)) errors.push('canonical driveFileId is required');
    if (!nonEmptyString(source.revisionId)) errors.push('canonical revisionId is required');
    if (source.authority !== 'INSTITUTE_CANONICAL_WORKING_BASELINE') {
      errors.push('canonical authority mismatch');
    }
    if (source.humanProfessionalValidation !== 'OPEN') {
      errors.push('human professional validation must remain OPEN');
    }
    if (source.curricoloVigente !== false) errors.push('curricolo must remain non-vigente');
    if (!hasStableFootprint(source.sourceContentFootprint)) {
      errors.push('sourceContentFootprint is invalid');
    }
  }

  const materialization = artifact.materialization;
  if (!isRecord(materialization)) {
    errors.push('materialization is required');
  } else {
    const version = materialization.version;
    const versionId = isRecord(version) && nonEmptyString(version.id) ? version.id : null;
    if (!isRecord(version)) {
      errors.push('materialized version is required');
    } else {
      if (!versionId) errors.push('materialized version id is required');
      if (version.versionNumber !== '1.3') errors.push('materialized version must be 1.3');
      if (version.status !== 'under-review') errors.push('materialized version must remain under-review');
      if (version.approvedAt !== undefined) errors.push('materialized version cannot claim approval');
    }

    const segments = materialization.segments;
    const segmentRecords = Array.isArray(segments) ? segments.filter(isRecord) : [];
    if (!Array.isArray(segments) || segments.length !== 113) {
      errors.push('artifact must contain exactly 113 segments');
    }
    if (Array.isArray(segments) && segmentRecords.length !== segments.length) {
      errors.push('all segments must be objects');
    }

    const segmentIds = new Set<string>();
    const segmentScopeKeys = new Set<string>();
    for (const segment of segmentRecords) {
      if (!nonEmptyString(segment.id)) {
        errors.push('segment id is required');
      } else if (segmentIds.has(segment.id)) {
        errors.push(`duplicate segment id '${segment.id}'`);
      } else {
        segmentIds.add(segment.id);
      }
      if (segment.workStatus !== 'under-review') errors.push('all segments must remain under-review');
      if (versionId && segment.versionId !== versionId) errors.push('segment version reference mismatch');
      const key = governedScopeKey(segment.schoolLevel, segment.subjectOrFieldId, segment.scope);
      if (!key) {
        errors.push('segment governed scope is invalid');
      } else if (segmentScopeKeys.has(key)) {
        errors.push('duplicate governed segment scope');
      } else {
        segmentScopeKeys.add(key);
      }
    }

    const perimeter = materialization.perimeter;
    const expected = isRecord(perimeter) ? perimeter.expected : undefined;
    const expectedRecords = Array.isArray(expected) ? expected.filter(isRecord) : [];
    if (!isRecord(perimeter) || !Array.isArray(expected) || expected.length !== 113) {
      errors.push('artifact perimeter must contain exactly 113 expected scopes');
    }
    if (Array.isArray(expected) && expectedRecords.length !== expected.length) {
      errors.push('all expected perimeter scopes must be objects');
    }

    const expectedScopeKeys = new Set<string>();
    for (const item of expectedRecords) {
      const key = governedScopeKey(item.schoolOrder, item.domainId, item.scope);
      if (!key) {
        errors.push('expected perimeter scope is invalid');
      } else if (expectedScopeKeys.has(key)) {
        errors.push('duplicate governed perimeter scope');
      } else {
        expectedScopeKeys.add(key);
      }
    }
    if (segmentScopeKeys.size === 113 && expectedScopeKeys.size === 113) {
      const missing = [...expectedScopeKeys].filter(key => !segmentScopeKeys.has(key));
      const unexpected = [...segmentScopeKeys].filter(key => !expectedScopeKeys.has(key));
      if (missing.length > 0 || unexpected.length > 0) {
        errors.push('segment scopes do not match governed perimeter');
      }
    }

    const nodes = materialization.nodes;
    const nodeRecords = Array.isArray(nodes) ? nodes.filter(isRecord) : [];
    if (!Array.isArray(nodes)) {
      errors.push('materialized nodes are required');
    } else if (nodeRecords.length !== nodes.length) {
      errors.push('all nodes must be objects');
    }
    const nodeIds = new Set<string>();
    for (const node of nodeRecords) {
      if (!nonEmptyString(node.id)) {
        errors.push('node id is required');
      } else if (nodeIds.has(node.id)) {
        errors.push(`duplicate node id '${node.id}'`);
      } else {
        nodeIds.add(node.id);
      }
      if (node.workStatus !== 'proposed') errors.push('all nodes must remain proposed');
      if (versionId && node.versionId !== versionId) errors.push('node version reference mismatch');
      if (!nonEmptyString(node.segmentId) || !segmentIds.has(node.segmentId)) {
        errors.push('node references an unknown segment');
      }
    }

    const links = materialization.verticalLinks;
    const linkRecords = Array.isArray(links) ? links.filter(isRecord) : [];
    if (!Array.isArray(links)) {
      errors.push('materialized verticalLinks are required');
    } else if (linkRecords.length !== links.length) {
      errors.push('all verticalLinks must be objects');
    }
    for (const link of linkRecords) {
      if (link.status !== 'proposed') errors.push('all vertical links must remain proposed');
      if (versionId && link.versionId !== versionId) errors.push('vertical link version reference mismatch');
      if (!nonEmptyString(link.sourceNodeId) || !nodeIds.has(link.sourceNodeId)
        || !nonEmptyString(link.targetNodeId) || !nodeIds.has(link.targetNodeId)) {
        errors.push('vertical link references an unknown node');
      }
    }
  }

  if (!hasStableFootprint(artifact.artifactFootprint)) {
    errors.push('artifactFootprint is invalid');
  } else {
    try {
      const { artifactFootprint: _artifactFootprint, ...base } = artifact;
      const recomputed = stableFootprint(base);
      if (recomputed.hash !== artifact.artifactFootprint.hash) {
        errors.push('artifactFootprint does not match artifact material');
      }
    } catch {
      errors.push('artifact material cannot be canonicalized');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function serializeCurricoloVerticaleArtifactV1(artifact: CurricoloVerticaleArtifactV1): string {
  const validation = validateCurricoloVerticaleArtifactV1(artifact);
  if (!validation.valid) throw new Error(validation.errors.join('; '));
  return canonicalSerialize(artifact);
}
