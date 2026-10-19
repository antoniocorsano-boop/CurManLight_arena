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
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<StableFootprintV1>;
  return candidate.algorithm === 'fnv1a'
    && candidate.version === 1
    && typeof candidate.hash === 'string'
    && candidate.hash.trim().length > 0;
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['artifact must be an object'] };
  }

  const artifact = input as CurricoloVerticaleArtifactV1;
  if (artifact.schemaVersion !== ARENA_CANONICAL_CURRICOLO_ARTIFACT_V1) {
    errors.push('invalid artifact schemaVersion');
  }
  if (!artifact.institutionId?.trim()) errors.push('institutionId is required');
  if (!artifact.schoolYearRef?.trim()) errors.push('schoolYearRef is required');

  if (!artifact.source || typeof artifact.source !== 'object') {
    errors.push('source is required');
  } else {
    if (artifact.source.masterId !== 'CAN-CURR-MASTER-00') errors.push('invalid canonical master id');
    if (artifact.source.masterVersion !== '1.3') errors.push('canonical master version must be 1.3');
    if (!artifact.source.driveFileId?.trim()) errors.push('canonical driveFileId is required');
    if (!artifact.source.revisionId?.trim()) errors.push('canonical revisionId is required');
    if (artifact.source.authority !== 'INSTITUTE_CANONICAL_WORKING_BASELINE') {
      errors.push('canonical authority mismatch');
    }
    if (artifact.source.humanProfessionalValidation !== 'OPEN') {
      errors.push('human professional validation must remain OPEN');
    }
    if (artifact.source.curricoloVigente !== false) errors.push('curricolo must remain non-vigente');
    if (!hasStableFootprint(artifact.source.sourceContentFootprint)) {
      errors.push('sourceContentFootprint is invalid');
    }
  }

  const materialization = artifact.materialization;
  if (!materialization || typeof materialization !== 'object') {
    errors.push('materialization is required');
  } else {
    if (!materialization.version) {
      errors.push('materialized version is required');
    } else {
      if (materialization.version.versionNumber !== '1.3') errors.push('materialized version must be 1.3');
      if (materialization.version.status !== 'under-review') errors.push('materialized version must remain under-review');
      if (materialization.version.approvedAt !== undefined) errors.push('materialized version cannot claim approval');
    }

    if (!Array.isArray(materialization.segments) || materialization.segments.length !== 113) {
      errors.push('artifact must contain exactly 113 segments');
    } else if (!materialization.segments.every(item => item.workStatus === 'under-review')) {
      errors.push('all segments must remain under-review');
    }

    if (!materialization.perimeter || !Array.isArray(materialization.perimeter.expected)
      || materialization.perimeter.expected.length !== 113) {
      errors.push('artifact perimeter must contain exactly 113 expected scopes');
    }

    if (!Array.isArray(materialization.nodes)) {
      errors.push('materialized nodes are required');
    } else if (!materialization.nodes.every(item => item.workStatus === 'proposed')) {
      errors.push('all nodes must remain proposed');
    }

    if (!Array.isArray(materialization.verticalLinks)) {
      errors.push('materialized verticalLinks are required');
    } else if (!materialization.verticalLinks.every(item => item.status === 'proposed')) {
      errors.push('all vertical links must remain proposed');
    }
  }

  if (!hasStableFootprint(artifact.artifactFootprint)) {
    errors.push('artifactFootprint is invalid');
  } else {
    try {
      const { artifactFootprint: _artifactFootprint, ...base } = artifact;
      const recomputed = stableFootprint(artifactMaterial(base));
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
