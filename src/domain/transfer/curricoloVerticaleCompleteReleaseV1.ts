import {
  createCurricoloVerticaleReleaseV1,
  validateCurricoloVerticaleReleaseV1,
  type CreateCurricoloVerticaleReleaseV1Input,
  type CurricoloVerticaleReleaseV1,
} from './curricoloVerticaleReleaseV1';
import { computeStructuralFootprint } from './signatures';
import type { StructuralFootprint } from './types';

export const CANONICAL_SOURCE_NOT_IN_FORCE_MARKER = ['CURRI', 'CULUM_IN_FORCE = NO'].join('');

export interface CurricoloVerticaleCanonicalSourceMasterV1 {
  masterId: string;
  driveFileId: string;
  masterVersion: string;
  revisionId: string;
  materializationState: 'COMPLETE';
  humanProfessionalValidation: 'OPEN' | 'CLOSED';
  curricoloVigente: boolean;
  authority: 'INSTITUTE_CANONICAL_WORKING_BASELINE' | 'INSTITUTE_APPROVED_CURRICOLO';
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

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
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
    if (source?.curricoloVigente !== false) {
      errors.push('sourceMaster.curricoloVigente must be false for PROVISIONAL_COMPLETE authority');
    }
    if (source?.authority !== 'INSTITUTE_CANONICAL_WORKING_BASELINE') {
      errors.push('PROVISIONAL_COMPLETE authority requires the canonical working baseline source');
    }
  }

  if (input.authority.state === 'APPROVED') {
    if (source?.curricoloVigente !== true) {
      errors.push('sourceMaster.curricoloVigente must be true for APPROVED authority');
    }
    if (source?.authority !== 'INSTITUTE_APPROVED_CURRICOLO') {
      errors.push('APPROVED authority requires an approved curricolo source');
    }
  }

  return errors;
}

function validateReceivedSource(release: UnknownRecord): string[] {
  const errors: string[] = [];
  const source = release.sourceMaster;
  const snapshot = release.sourceSnapshot;
  const authority = release.authority;

  if (!isRecord(source)) {
    errors.push('sourceMaster is required');
  } else {
    if (!nonEmptyString(source.masterId)) errors.push('sourceMaster.masterId is required');
    if (!nonEmptyString(source.driveFileId)) errors.push('sourceMaster.driveFileId is required');
    if (!nonEmptyString(source.masterVersion)) errors.push('sourceMaster.masterVersion is required');
    if (!nonEmptyString(source.revisionId)) errors.push('sourceMaster.revisionId is required');
    if (source.materializationState !== 'COMPLETE') {
      errors.push('sourceMaster.materializationState must be COMPLETE');
    }
  }

  if (!isRecord(snapshot) || snapshot.format !== 'text/plain' || !nonEmptyString(snapshot.content)) {
    errors.push('sourceSnapshot with complete text/plain content is required');
  }

  if (!isRecord(authority)) {
    errors.push('authority is required for source validation');
  } else if (isRecord(source)) {
    if (authority.state === 'PROVISIONAL_COMPLETE') {
      if (source.curricoloVigente !== false) {
        errors.push('sourceMaster.curricoloVigente must be false for PROVISIONAL_COMPLETE authority');
      }
      if (source.authority !== 'INSTITUTE_CANONICAL_WORKING_BASELINE') {
        errors.push('PROVISIONAL_COMPLETE authority requires the canonical working baseline source');
      }
    } else if (authority.state === 'APPROVED') {
      if (source.curricoloVigente !== true) {
        errors.push('sourceMaster.curricoloVigente must be true for APPROVED authority');
      }
      if (source.authority !== 'INSTITUTE_APPROVED_CURRICOLO') {
        errors.push('APPROVED authority requires an approved curricolo source');
      }
    }
  }

  return errors;
}

function projectionStructuralMaterial(
  release: Omit<CurricoloVerticaleReleaseV1, 'structuralFootprint'>,
): Record<string, unknown> {
  const { issuedAt: _issuedAt, ...stable } = release;
  return stable as unknown as Record<string, unknown>;
}

function completeStructuralMaterial(
  release: Omit<CurricoloVerticaleCompleteReleaseV1, 'structuralFootprint'>,
): Record<string, unknown> {
  const { issuedAt: _issuedAt, ...stable } = release;
  const { computedAt: _snapshotComputedAt, ...snapshotFootprint } = stable.sourceSnapshot.contentFootprint;
  return {
    ...stable,
    sourceSnapshot: {
      ...stable.sourceSnapshot,
      contentFootprint: snapshotFootprint,
    },
  } as unknown as Record<string, unknown>;
}

function completeStructuralMaterialUnknown(release: UnknownRecord): Record<string, unknown> {
  const { structuralFootprint: _footprint, issuedAt: _issuedAt, ...stable } = release;
  if (!isRecord(stable.sourceSnapshot)) return stable;
  const snapshot = stable.sourceSnapshot;
  if (!isRecord(snapshot.contentFootprint)) return stable;
  const { computedAt: _computedAt, ...contentFootprint } = snapshot.contentFootprint;
  return {
    ...stable,
    sourceSnapshot: {
      ...snapshot,
      contentFootprint,
    },
  };
}

export function createCurricoloVerticaleCompleteReleaseV1(
  input: CreateCurricoloVerticaleCompleteReleaseV1Input,
): CurricoloVerticaleCompleteReleaseV1 {
  const errors = validateSource(input);
  if (errors.length > 0) throw new Error(errors.join('; '));

  const projection = createCurricoloVerticaleReleaseV1(input);
  const { structuralFootprint: _projectionFootprint, ...projectionBase } = projection;
  const sourceSnapshot: CurricoloVerticaleCanonicalSourceSnapshotV1 = {
    format: 'text/plain',
    content: input.sourceSnapshot.content,
    contentFootprint: computeStructuralFootprint({
      format: 'text/plain',
      content: input.sourceSnapshot.content,
    }),
  };
  const withoutFootprint: Omit<CurricoloVerticaleCompleteReleaseV1, 'structuralFootprint'> = {
    ...projectionBase,
    sourceMaster: { ...input.sourceMaster },
    sourceSnapshot,
  };

  return {
    ...withoutFootprint,
    structuralFootprint: computeStructuralFootprint(completeStructuralMaterial(withoutFootprint)),
  };
}

export function validateCurricoloVerticaleCompleteReleaseV1(
  input: unknown,
): { valid: boolean; errors: string[] } {
  if (!isRecord(input)) {
    return { valid: false, errors: ['release must be an object'] };
  }

  const release = input;
  const errors = validateReceivedSource(release);

  const {
    sourceMaster: _sourceMaster,
    sourceSnapshot: _sourceSnapshot,
    structuralFootprint: _completeFootprint,
    ...projectionBase
  } = release;

  try {
    const projection: UnknownRecord = {
      ...projectionBase,
      structuralFootprint: computeStructuralFootprint((() => {
        const { issuedAt: _issuedAt, ...stable } = projectionBase;
        return stable;
      })()),
    };
    errors.push(...validateCurricoloVerticaleReleaseV1(projection).errors);
  } catch {
    errors.push('projection material cannot be canonicalized');
  }

  const snapshot = release.sourceSnapshot;
  if (isRecord(snapshot) && snapshot.format === 'text/plain' && nonEmptyString(snapshot.content)) {
    const expectedSnapshot = computeStructuralFootprint({
      format: snapshot.format,
      content: snapshot.content,
    });
    if (!isRecord(snapshot.contentFootprint) || !nonEmptyString(snapshot.contentFootprint.hash)) {
      errors.push('sourceSnapshot contentFootprint is required');
    } else if (expectedSnapshot.hash !== snapshot.contentFootprint.hash) {
      errors.push('sourceSnapshot contentFootprint mismatch');
    }
  }

  if (!isRecord(release.structuralFootprint) || !nonEmptyString(release.structuralFootprint.hash)) {
    errors.push('structuralFootprint is required');
  } else {
    try {
      const expectedComplete = computeStructuralFootprint(completeStructuralMaterialUnknown(release));
      if (expectedComplete.hash !== release.structuralFootprint.hash) {
        errors.push('structuralFootprint does not match complete release material');
      }
    } catch {
      errors.push('complete release material cannot be canonicalized');
    }
  }

  return { valid: errors.length === 0, errors };
}
