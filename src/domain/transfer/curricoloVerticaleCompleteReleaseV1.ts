import {
  createCurricoloVerticaleReleaseV1,
  validateCurricoloVerticaleReleaseV1,
  type CreateCurricoloVerticaleReleaseV1Input,
  type CurricoloVerticaleReleaseV1,
} from './curricoloVerticaleReleaseV1';
import { computeStructuralFootprint } from './signatures';
import type { StructuralFootprint } from './types';

export interface CurricoloVerticaleCanonicalSourceMasterV1 {
  masterId: string;
  driveFileId: string;
  masterVersion: string;
  revisionId: string;
  materializationState: 'COMPLETE';
  humanProfessionalValidation: 'OPEN' | 'CLOSED';
  curriculumInForce: boolean;
  authority: 'INSTITUTE_CANONICAL_WORKING_BASELINE' | 'INSTITUTE_APPROVED_CURRICULUM';
}

export interface CurricoloVerticaleCanonicalSourceSnapshotV1 {
  format: 'text/plain';
  content: string;
  contentFootprint: StructuralFootprint;
}

export interface CreateCurricoloVerticaleCompleteReleaseV1Input
  extends CreateCurricoloVerticaleReleaseV1Input {
  sourceMaster: CurricoloVerticaleCanonicalSourceMasterV1;
  sourceSnapshot: Omit<CurricoloVerticaleCanonicalSourceSnapshotV1, 'contentFootprint'>;
}

export interface CurricoloVerticaleCompleteReleaseV1
  extends Omit<CurricoloVerticaleReleaseV1, 'structuralFootprint'> {
  sourceMaster: CurricoloVerticaleCanonicalSourceMasterV1;
  sourceSnapshot: CurricoloVerticaleCanonicalSourceSnapshotV1;
  structuralFootprint: StructuralFootprint;
}

function validateSource(input: CreateCurricoloVerticaleCompleteReleaseV1Input): string[] {
  const errors: string[] = [];
  const source = input.sourceMaster;
  const snapshot = input.sourceSnapshot;

  if (!source?.masterId?.trim()) errors.push('sourceMaster.masterId is required');
  if (!source?.driveFileId?.trim()) errors.push('sourceMaster.driveFileId is required');
  if (!source?.masterVersion?.trim()) errors.push('sourceMaster.masterVersion is required');
  if (!source?.revisionId?.trim()) errors.push('sourceMaster.revisionId is required');
  if (source?.materializationState !== 'COMPLETE') {
    errors.push('sourceMaster.materializationState must be COMPLETE');
  }
  if (!snapshot || snapshot.format !== 'text/plain' || !snapshot.content?.trim()) {
    errors.push('sourceSnapshot with complete text/plain content is required');
  }

  if (input.authority.state === 'PROVISIONAL_COMPLETE') {
    if (source?.curriculumInForce !== false) {
      errors.push('sourceMaster.curriculumInForce must be false for PROVISIONAL_COMPLETE authority');
    }
    if (source?.authority !== 'INSTITUTE_CANONICAL_WORKING_BASELINE') {
      errors.push('PROVISIONAL_COMPLETE authority requires the canonical working baseline source');
    }
  }

  if (input.authority.state === 'APPROVED') {
    if (source?.curriculumInForce !== true) {
      errors.push('sourceMaster.curriculumInForce must be true for APPROVED authority');
    }
    if (source?.authority !== 'INSTITUTE_APPROVED_CURRICULUM') {
      errors.push('APPROVED authority requires an approved curriculum source');
    }
  }

  return errors;
}

function fullStructuralMaterial(
  release: Omit<CurricoloVerticaleCompleteReleaseV1, 'structuralFootprint'>,
): Record<string, unknown> {
  const { issuedAt: _issuedAt, ...stable } = release;
  return stable as unknown as Record<string, unknown>;
}

export function createCurricoloVerticaleCompleteReleaseV1(
  input: CreateCurricoloVerticaleCompleteReleaseV1Input,
): CurricoloVerticaleCompleteReleaseV1 {
  const errors = validateSource(input);
  if (errors.length > 0) throw new Error(errors.join('; '));

  const base = createCurricoloVerticaleReleaseV1(input);
  const sourceSnapshot: CurricoloVerticaleCanonicalSourceSnapshotV1 = {
    format: 'text/plain',
    content: input.sourceSnapshot.content,
    contentFootprint: computeStructuralFootprint({
      format: 'text/plain',
      content: input.sourceSnapshot.content,
    }),
  };
  const completeBase: Omit<CurricoloVerticaleCompleteReleaseV1, 'structuralFootprint'> = {
    ...base,
    sourceMaster: { ...input.sourceMaster },
    sourceSnapshot,
  };
  const { structuralFootprint: _baseFootprint, ...withoutBaseFootprint } = completeBase as CurricoloVerticaleReleaseV1 & {
    sourceMaster: CurricoloVerticaleCanonicalSourceMasterV1;
    sourceSnapshot: CurricoloVerticaleCanonicalSourceSnapshotV1;
  };

  return {
    ...withoutBaseFootprint,
    structuralFootprint: computeStructuralFootprint(fullStructuralMaterial(withoutBaseFootprint)),
  };
}

export function validateCurricoloVerticaleCompleteReleaseV1(
  input: unknown,
): { valid: boolean; errors: string[] } {
  const base = validateCurricoloVerticaleReleaseV1(input);
  const errors = [...base.errors];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors };
  }

  const release = input as CurricoloVerticaleCompleteReleaseV1;
  if (!release.sourceMaster || !release.sourceSnapshot) {
    errors.push('sourceMaster and sourceSnapshot are required');
    return { valid: false, errors };
  }

  if (release.sourceSnapshot.format !== 'text/plain' || !release.sourceSnapshot.content?.trim()) {
    errors.push('sourceSnapshot content is required');
  } else {
    const expected = computeStructuralFootprint({
      format: release.sourceSnapshot.format,
      content: release.sourceSnapshot.content,
    });
    if (expected.hash !== release.sourceSnapshot.contentFootprint?.hash) {
      errors.push('sourceSnapshot contentFootprint mismatch');
    }
  }

  if (release.authority.state === 'PROVISIONAL_COMPLETE') {
    if (release.sourceMaster.curriculumInForce !== false) {
      errors.push('sourceMaster.curriculumInForce is incompatible with provisional authority');
    }
    if (release.sourceMaster.authority !== 'INSTITUTE_CANONICAL_WORKING_BASELINE') {
      errors.push('sourceMaster authority is incompatible with provisional authority');
    }
  }
  if (release.authority.state === 'APPROVED') {
    if (release.sourceMaster.curriculumInForce !== true) {
      errors.push('sourceMaster.curriculumInForce is incompatible with approved authority');
    }
    if (release.sourceMaster.authority !== 'INSTITUTE_APPROVED_CURRICULUM') {
      errors.push('sourceMaster authority is incompatible with approved authority');
    }
  }

  return { valid: errors.length === 0, errors };
}
