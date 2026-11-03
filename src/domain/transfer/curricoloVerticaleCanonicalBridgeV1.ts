import {
  validateCurricoloVerticaleArtifactV1,
  type CurricoloVerticaleArtifactV1,
} from './curricoloVerticaleArtifactV1';
import {
  createCurricoloVerticaleCompleteReleaseV1,
  validateCurricoloVerticaleCompleteReleaseV1,
  type CurricoloVerticaleCompleteReleaseV1,
} from './curricoloVerticaleCompleteReleaseV1';
import { computeStructuralFootprint } from './signatures';

/**
 * Transfer-only projection. Arena retains authority; this does not approve
 * the canonical master or write to a recipient's data store.
 */
export interface CreateCompleteVerticalReleaseFromCanonicalArtifactV1Input {
  artifact: unknown;
  sourceSnapshot: { format: 'text/plain'; content: string };
  expectedTargetInstitutionId: string;
  expectedRevisionId: string;
  issuedAt?: string;
}

export function createCompleteVerticalReleaseFromCanonicalArtifactV1(
  input: CreateCompleteVerticalReleaseFromCanonicalArtifactV1Input,
): CurricoloVerticaleCompleteReleaseV1 {
  const artifactResult = validateCurricoloVerticaleArtifactV1(input.artifact);
  if (!artifactResult.valid) {
    throw new Error(`canonical artifact rejected: ${artifactResult.errors.join('; ')}`);
  }

  const artifact = input.artifact as CurricoloVerticaleArtifactV1;
  if (typeof input.expectedTargetInstitutionId !== 'string' || !input.expectedTargetInstitutionId.trim()
    || artifact.institutionId !== input.expectedTargetInstitutionId) {
    throw new Error('canonical artifact institution does not match explicit target institution identity');
  }
  if (typeof input.expectedRevisionId !== 'string' || !input.expectedRevisionId.trim()
    || artifact.source.revisionId !== input.expectedRevisionId) {
    throw new Error('canonical artifact revision does not match the expected source revision');
  }
  if (artifact.materialization.version.institutionId !== artifact.institutionId) {
    throw new Error('canonical artifact version institution does not match artifact institution');
  }
  if (input.sourceSnapshot?.format !== 'text/plain'
    || typeof input.sourceSnapshot.content !== 'string'
    || !input.sourceSnapshot.content.trim()) {
    throw new Error('canonical sourceSnapshot must provide non-empty text/plain content');
  }

  const sourceFootprint = computeStructuralFootprint({
    format: input.sourceSnapshot.format,
    content: input.sourceSnapshot.content,
  });
  if (artifact.source.sourceContentFootprint.algorithm !== sourceFootprint.algorithm
    || artifact.source.sourceContentFootprint.version !== sourceFootprint.version
    || artifact.source.sourceContentFootprint.hash !== sourceFootprint.hash) {
    throw new Error('canonical sourceSnapshot content footprint does not match artifact source');
  }

  const release = createCurricoloVerticaleCompleteReleaseV1({
    institutionId: artifact.institutionId,
    schoolYearRef: artifact.schoolYearRef,
    version: artifact.materialization.version,
    segments: artifact.materialization.segments,
    nodes: artifact.materialization.nodes,
    verticalLinks: artifact.materialization.verticalLinks,
    perimeter: artifact.materialization.perimeter,
    authority: {
      state: 'PROVISIONAL_COMPLETE',
      requiresRevalidationOnApproval: true,
    },
    sourceMaster: {
      masterId: artifact.source.masterId,
      driveFileId: artifact.source.driveFileId,
      masterVersion: artifact.source.masterVersion,
      revisionId: artifact.source.revisionId,
      materializationState: 'COMPLETE',
      humanProfessionalValidation: artifact.source.humanProfessionalValidation,
      curricoloVigente: false,
      authority: artifact.source.authority,
    },
    sourceSnapshot: input.sourceSnapshot,
    issuedAt: input.issuedAt,
  });

  const received = validateCurricoloVerticaleCompleteReleaseV1(release);
  if (!received.valid) {
    throw new Error(`complete vertical release rejected: ${received.errors.join('; ')}`);
  }
  if (release.segments.length !== 113 || release.manifest.expected.length !== 113
    || release.manifest.coverageStatus !== 'SATISFIED') {
    throw new Error('canonical release must preserve all 113 governed scopes');
  }

  for (const grade of ['1', '2', '3'] as const) {
    const expectedFramework = grade === '1' ? 'IN2025' : 'IN2012';
    const matching = release.segments.filter(segment =>
      segment.schoolLevel === 'secondaria'
      && segment.subjectOrFieldId === 'tecnologia'
      && segment.scope.type === 'grade'
      && segment.scope.grade === grade
    );
    if (matching.length !== 1
      || matching[0].frameworkApplicability?.framework !== expectedFramework
      || !release.nodes.some(node => node.segmentId === matching[0].id)) {
      throw new Error(`canonical release Tecnologia grade ${grade} is absent, ambiguous, or has unresolved framework/nodes`);
    }
  }

  return release;
}
