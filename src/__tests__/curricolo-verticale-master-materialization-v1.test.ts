import { describe, expect, it } from 'vitest';
import {
  MemoryCurricoloPersistenceBackend,
  createCurricoloRepositories,
} from '../types/curricolo';
import { materializeCurricoloVerticaleMasterV1 } from '../domain/transfer/curricoloVerticaleMasterMaterializationV1';
import {
  buildMasterFixture,
  materializeFixture,
  sourceMaster,
} from './fixtures/curricoloVerticaleMasterFixture';

describe('CAN-CURR-MASTER-00 productive materialization v1', () => {
  it('materializes the complete governed working baseline without inventing approval', () => {
    const result = materializeFixture();

    expect(result.version.versionNumber).toBe('1.3');
    expect(result.version.status).toBe('under-review');
    expect(result.version.approvedAt).toBeUndefined();
    expect(result.segments).toHaveLength(113);
    expect(result.perimeter.expected).toHaveLength(113);
    expect(result.segments.every(item => item.workStatus === 'under-review')).toBe(true);
    expect(result.nodes.every(item => item.workStatus === 'proposed')).toBe(true);
    expect(result.verticalLinks.every(item => item.status === 'proposed')).toBe(true);

    const infancy = result.segments.filter(item => item.schoolLevel === 'infanzia');
    expect(infancy.length).toBeGreaterThanOrEqual(5);
    expect(infancy.filter(item => item.subjectOrFieldId !== 'educazione-civica' && item.subjectOrFieldId !== 'ai-literacy')
      .every(item => item.scope.type === 'school-level')).toBe(true);

    const primaryTech1 = result.segments.find(item => item.id === 'can-curr-master-00-primaria-tecnologia-1');
    const primaryTech2 = result.segments.find(item => item.id === 'can-curr-master-00-primaria-tecnologia-2');
    const secondaryTech1 = result.segments.find(item => item.id === 'can-curr-master-00-secondaria-tecnologia-1');
    const secondaryTech2 = result.segments.find(item => item.id === 'can-curr-master-00-secondaria-tecnologia-2');

    expect(primaryTech1?.frameworkApplicability.framework).toBe('IN2025');
    expect(primaryTech2?.frameworkApplicability.framework).toBe('IN2012');
    expect(secondaryTech1?.frameworkApplicability.framework).toBe('IN2025');
    expect(secondaryTech2?.frameworkApplicability.framework).toBe('IN2012');
    expect(primaryTech1?.content.obiettivi).toEqual(['obiettivo I']);
    expect(primaryTech1?.sourceSegmentId).toBeUndefined();

    expect(JSON.stringify(result)).not.toContain('"status":"approved"');
    expect(JSON.stringify(result)).not.toContain('"workStatus":"effective"');
  });

  it('persists all native master segments without inventing segment ancestry', async () => {
    const result = materializeFixture();
    const backend = new MemoryCurricoloPersistenceBackend();
    const repositories = createCurricoloRepositories(backend);

    await repositories.versions.save(result.version);
    for (const segment of result.segments) {
      await repositories.segments.save(segment);
    }

    expect(await repositories.segments.listByVersion(result.version.id)).toHaveLength(113);
  });

  it('fails closed when a required ordinary section is absent', () => {
    const content = buildMasterFixture().replace(/7\.3\.12 INSEGNAMENTO DELLA RELIGIONE CATTOLICA[\s\S]*?Stato: MATERIALIZZATO — DA VALIDARE\.\n/, '');

    expect(() => materializeCurricoloVerticaleMasterV1({
      institutionId: 'ics-lorenzo-milani',
      schoolYearRef: '2026/2027',
      sourceMaster: sourceMaster(),
      sourceSnapshot: { format: 'text/plain' as const, content },
    })).toThrow(/7\.3\.12|secondaria/i);
  });

  it('rejects a source version that disagrees with the canonical header', () => {
    const source = sourceMaster();
    expect(() => materializeCurricoloVerticaleMasterV1({
      institutionId: 'ics-lorenzo-milani',
      schoolYearRef: '2026/2027',
      sourceMaster: { ...source, masterVersion: '1.2' },
      sourceSnapshot: { format: 'text/plain' as const, content: buildMasterFixture() },
    })).toThrow(/version/i);
  });
});
