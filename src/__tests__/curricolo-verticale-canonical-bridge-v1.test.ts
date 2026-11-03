import { describe, expect, it } from 'vitest';
import {
  createCurricoloVerticaleArtifactV1,
} from '../domain/transfer/curricoloVerticaleArtifactV1';
import {
  validateCurricoloVerticaleCompleteReleaseV1,
} from '../domain/transfer/curricoloVerticaleCompleteReleaseV1';
import {
  createCompleteVerticalReleaseFromCanonicalArtifactV1,
} from '../domain/transfer/curricoloVerticaleCanonicalBridgeV1';
import { buildMasterFixture, sourceMaster } from './fixtures/curricoloVerticaleMasterFixture';

const MASTER = buildMasterFixture();
const INSTITUTION_ID = 'ics-lorenzo-milani';

function artifact() {
  return createCurricoloVerticaleArtifactV1({
    institutionId: INSTITUTION_ID,
    schoolYearRef: '2026/2027',
    sourceMaster: sourceMaster({ revisionId: '27' }),
    sourceSnapshot: { format: 'text/plain', content: MASTER },
  });
}

function bridge(overrides: Record<string, unknown> = {}) {
  return {
    artifact: artifact(),
    sourceSnapshot: { format: 'text/plain' as const, content: MASTER },
    expectedTargetInstitutionId: INSTITUTION_ID,
    expectedRevisionId: '27',
    issuedAt: '2026-11-03T00:00:00.000Z',
    ...overrides,
  };
}

describe('Arena canonical artifact to vertical complete release bridge v1', () => {
  it('emits a complete, valid, non-vigente 113-scope release with three distinct Tecnologia class slices', () => {
    const release = createCompleteVerticalReleaseFromCanonicalArtifactV1(bridge());
    expect(validateCurricoloVerticaleCompleteReleaseV1(release)).toEqual({ valid: true, errors: [] });
    expect(release.contract).toBe('TRAMA_CURRICOLO_VERTICALE_RELEASE_V1');
    expect(release.institutionId).toBe(INSTITUTION_ID);
    expect(release.version.institutionId).toBe(INSTITUTION_ID);
    expect(release.sourceMaster.revisionId).toBe('27');
    expect(release.sourceMaster.curricoloVigente).toBe(false);
    expect(release.authority.state).toBe('PROVISIONAL_COMPLETE');
    expect(release.downstreamPolicy.automaticWriteAllowed).toBe(false);
    expect(release.manifest.coverageStatus).toBe('SATISFIED');
    expect(release.segments).toHaveLength(113);

    for (const grade of ['1', '2', '3']) {
      const matched = release.segments.filter(s =>
        s.schoolLevel === 'secondaria' && s.subjectOrFieldId === 'tecnologia'
        && s.scope.type === 'grade' && s.scope.grade === grade
      );
      expect(matched, `Tecnologia class ${grade}`).toHaveLength(1);
      const segment = matched[0];
      expect(segment.frameworkApplicability?.framework).toBe(grade === '1' ? 'IN2025' : 'IN2012');
      expect(release.nodes.some(node => node.segmentId === segment.id)).toBe(true);
      const scope = release.manifest.present.filter(item =>
        item.schoolOrder === 'secondaria' && item.domainId === 'tecnologia'
        && item.scope.type === 'grade' && item.scope.grade === grade
      );
      expect(scope).toHaveLength(1);
    }
  });

  it('fails closed on an institution alias not explicitly shared by source and target', () => {
    expect(() => createCompleteVerticalReleaseFromCanonicalArtifactV1(bridge({
      expectedTargetInstitutionId: 'ic-calvario-covotta-don-milani',
    }))).toThrow(/institution|identity|target/i);
  });

  it('rejects a snapshot not matching the artifact content footprint', () => {
    expect(() => createCompleteVerticalReleaseFromCanonicalArtifactV1(bridge({
      sourceSnapshot: { format: 'text/plain', content: `${MASTER}\nCHANGED` },
    }))).toThrow(/content|footprint|snapshot/i);
  });

  it('rejects revision drift, tampered artifact and unsupported authority', () => {
    expect(() => createCompleteVerticalReleaseFromCanonicalArtifactV1(bridge({
      expectedRevisionId: '28',
    }))).toThrow(/revision/i);
    const changed = artifact();
    changed.materialization.segments.pop();
    expect(() => createCompleteVerticalReleaseFromCanonicalArtifactV1(bridge({
      artifact: changed,
    }))).toThrow(/artifact|segment|scope|coverage/i);
    const approved = artifact();
    approved.source.curricoloVigente = true as never;
    expect(() => createCompleteVerticalReleaseFromCanonicalArtifactV1(bridge({
      artifact: approved,
    }))).toThrow(/artifact|authority|vigente/i);
  });
});
