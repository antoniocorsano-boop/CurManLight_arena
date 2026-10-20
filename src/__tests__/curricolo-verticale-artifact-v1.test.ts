import { describe, expect, it } from 'vitest';
import {
  ARENA_CANONICAL_CURRICOLO_ARTIFACT_V1,
  createCurricoloVerticaleArtifactV1,
  serializeCurricoloVerticaleArtifactV1,
  validateCurricoloVerticaleArtifactV1,
} from '../domain/transfer/curricoloVerticaleArtifactV1';
import { computeStructuralFootprint } from '../domain/transfer/signatures';
import {
  buildMasterFixture,
  sourceMaster,
} from './fixtures/curricoloVerticaleMasterFixture';

function createArtifact(revisionId = 'drive-revision-fixture') {
  return createCurricoloVerticaleArtifactV1({
    institutionId: 'ics-lorenzo-milani',
    schoolYearRef: '2026/2027',
    sourceMaster: sourceMaster({ revisionId }),
    sourceSnapshot: {
      format: 'text/plain',
      content: buildMasterFixture(),
    },
  });
}

function refreshArtifactFootprint(artifact: ReturnType<typeof createArtifact>) {
  const { artifactFootprint: _artifactFootprint, ...material } = artifact;
  const footprint = computeStructuralFootprint(material as unknown as Record<string, unknown>);
  artifact.artifactFootprint = {
    algorithm: 'fnv1a',
    version: 1,
    hash: footprint.hash,
  };
}

describe('CAN-CURR-MASTER-00 repository artifact v1', () => {
  it('creates a stable non-authoritative artifact for all 113 scopes', () => {
    const artifact = createArtifact();

    expect(artifact.schemaVersion).toBe(ARENA_CANONICAL_CURRICOLO_ARTIFACT_V1);
    expect(artifact.source.masterId).toBe('CAN-CURR-MASTER-00');
    expect(artifact.source.masterVersion).toBe('1.3');
    expect(artifact.source.revisionId).toBe('drive-revision-fixture');
    expect(artifact.source.authority).toBe('INSTITUTE_CANONICAL_WORKING_BASELINE');
    expect(artifact.source.humanProfessionalValidation).toBe('OPEN');
    expect(artifact.source.curricoloVigente).toBe(false);
    expect(artifact.materialization.version.status).toBe('under-review');
    expect(artifact.materialization.version.approvedAt).toBeUndefined();
    expect(artifact.materialization.segments).toHaveLength(113);
    expect(artifact.materialization.perimeter.expected).toHaveLength(113);
    expect(artifact.materialization.segments.every(item => item.workStatus === 'under-review')).toBe(true);
    expect(artifact.materialization.nodes.every(item => item.workStatus === 'proposed')).toBe(true);
    expect(artifact.materialization.verticalLinks.every(item => item.status === 'proposed')).toBe(true);
    expect(validateCurricoloVerticaleArtifactV1(artifact)).toEqual({ valid: true, errors: [] });
  });

  it('serializes byte-identically for the same snapshot and metadata', () => {
    const left = serializeCurricoloVerticaleArtifactV1(createArtifact());
    const right = serializeCurricoloVerticaleArtifactV1(createArtifact());

    expect(left).toBe(right);
  });

  it('changes artifact footprint when revisionId changes', () => {
    const first = createArtifact('27');
    const second = createArtifact('28');

    expect(first.source.sourceContentFootprint).toEqual(second.source.sourceContentFootprint);
    expect(first.artifactFootprint.hash).not.toBe(second.artifactFootprint.hash);
  });

  it('rejects tampered coverage or approved/effective authority drift', () => {
    const artifact = createArtifact();

    const incomplete = structuredClone(artifact);
    incomplete.materialization.segments.pop();
    expect(validateCurricoloVerticaleArtifactV1(incomplete).valid).toBe(false);

    const approved = structuredClone(artifact);
    approved.materialization.version.status = 'approved';
    expect(validateCurricoloVerticaleArtifactV1(approved).valid).toBe(false);

    const effective = structuredClone(artifact);
    effective.materialization.segments[0].workStatus = 'effective';
    expect(validateCurricoloVerticaleArtifactV1(effective).valid).toBe(false);
  });

  it('returns validation errors instead of throwing for malformed scalar or nested values', () => {
    const scalar = structuredClone(createArtifact());
    scalar.institutionId = 42 as never;
    expect(() => validateCurricoloVerticaleArtifactV1(scalar)).not.toThrow();
    expect(validateCurricoloVerticaleArtifactV1(scalar).valid).toBe(false);

    const nested = structuredClone(createArtifact());
    nested.materialization.segments[0] = null as never;
    refreshArtifactFootprint(nested);
    expect(() => validateCurricoloVerticaleArtifactV1(nested)).not.toThrow();
    expect(validateCurricoloVerticaleArtifactV1(nested).valid).toBe(false);
  });

  it('rejects duplicate governed scopes and dangling graph references even with a recomputed footprint', () => {
    const duplicate = structuredClone(createArtifact());
    duplicate.materialization.segments[112] = structuredClone(duplicate.materialization.segments[0]);
    refreshArtifactFootprint(duplicate);
    const duplicateValidation = validateCurricoloVerticaleArtifactV1(duplicate);
    expect(duplicateValidation.valid).toBe(false);
    expect(duplicateValidation.errors.join(' ')).toMatch(/duplicate|scope|perimeter/i);

    const dangling = structuredClone(createArtifact());
    dangling.materialization.nodes[0].segmentId = 'missing-segment';
    refreshArtifactFootprint(dangling);
    const danglingValidation = validateCurricoloVerticaleArtifactV1(dangling);
    expect(danglingValidation.valid).toBe(false);
    expect(danglingValidation.errors.join(' ')).toMatch(/reference|segment/i);
  });

  it('persists no computedAt field in stable footprints', () => {
    const serialized = serializeCurricoloVerticaleArtifactV1(createArtifact());
    const parsed = JSON.parse(serialized) as Record<string, unknown>;

    expect(serialized).not.toContain('computedAt');
    expect(JSON.stringify(parsed)).not.toContain('computedAt');
  });
});
