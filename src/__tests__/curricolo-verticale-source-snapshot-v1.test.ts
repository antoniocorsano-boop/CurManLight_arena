import { describe, expect, it } from 'vitest';
import {
  createCurricoloVerticaleCompleteReleaseV1,
  validateCurricoloVerticaleCompleteReleaseV1,
} from '../domain/transfer/curricoloVerticaleCompleteReleaseV1';

const NOW = '2026-10-19T12:00:00.000Z';
const MASTER_TEXT = `CAN-CURR-MASTER-00 — CURRICOLO VERTICALE INTEGRALE UNIFICATO 3–14\nSTATO: BASELINE CURRICOLARE CANONICA INTEGRALE — MATERIALIZZATA — DA VALIDARE PROFESSIONALMENTE — NON VIGENTE\n17.11 Esito documentale del gate\nOSA_DOCUMENTARY_COVERAGE_COMPLETE = TRUE`;

function input() {
  const version = {
    id: 'can-curr-master-00-v1-3',
    institutionId: 'ics-lorenzo-milani',
    title: 'CAN-CURR-MASTER-00',
    versionNumber: '1.3',
    status: 'under-review' as const,
    createdAt: NOW,
    updatedAt: NOW,
  };
  const segment = {
    id: 'seg-secondaria-tecnologia-3',
    versionId: version.id,
    schoolLevel: 'secondaria' as const,
    subjectOrFieldId: 'tecnologia',
    scope: { type: 'grade' as const, grade: '3' },
    frameworkApplicability: {
      framework: 'IN2012' as const,
      resolutionStatus: 'resolved' as const,
      resolutionReason: 'regime transitorio 2026/27',
    },
    workStatus: 'under-review' as const,
    content: {
      traguardi: [],
      obiettivi: ['Valutare e progettare responsabilmente'],
      evidenze: ['Progetto documentato'],
      conoscenze: ['Energia, sistemi produttivi, dati e sostenibilità'],
      abilita: [],
      competenze: ['Integrare rappresentazione, progetto e valutazione'],
      nucleiFondanti: [],
      proposals: [],
    },
    createdAt: NOW,
    updatedAt: NOW,
  };
  return {
    institutionId: 'ics-lorenzo-milani',
    schoolYearRef: '2026/2027',
    version,
    segments: [segment],
    nodes: [],
    verticalLinks: [],
    perimeter: {
      expected: [{
        schoolOrder: 'secondaria' as const,
        scope: { type: 'grade' as const, grade: '3' },
        domainId: 'tecnologia',
        domainKind: 'DISCIPLINA' as const,
      }],
      intentionallyNotApplicable: [],
    },
    authority: {
      state: 'PROVISIONAL_COMPLETE' as const,
      requiresRevalidationOnApproval: true,
    },
    sourceMaster: {
      masterId: 'CAN-CURR-MASTER-00',
      driveFileId: '12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4',
      masterVersion: '1.3',
      revisionId: 'drive-revision-fixture',
      materializationState: 'COMPLETE' as const,
      humanProfessionalValidation: 'OPEN' as const,
      curricoloVigente: false,
      authority: 'INSTITUTE_CANONICAL_WORKING_BASELINE' as const,
    },
    sourceSnapshot: {
      format: 'text/plain' as const,
      content: MASTER_TEXT,
    },
    issuedAt: NOW,
  };
}

describe('canonical master snapshot in vertical release', () => {
  it('carries the complete canonical source snapshot together with the operational projection', () => {
    const release = createCurricoloVerticaleCompleteReleaseV1(input());

    expect(release.sourceMaster.masterId).toBe('CAN-CURR-MASTER-00');
    expect(release.sourceMaster.masterVersion).toBe('1.3');
    expect(release.sourceMaster.curricoloVigente).toBe(false);
    expect(release.sourceSnapshot.content).toBe(MASTER_TEXT);
    expect(release.sourceSnapshot.content).toContain('17.11 Esito documentale del gate');
    expect(release.manifest.coverageStatus).toBe('SATISFIED');
    expect(validateCurricoloVerticaleCompleteReleaseV1(release)).toEqual({ valid: true, errors: [] });
  });

  it('rejects a complete provisional release when the canonical source snapshot is absent', () => {
    const value = input();
    const { sourceSnapshot: _sourceSnapshot, ...withoutSnapshot } = value;

    expect(() => createCurricoloVerticaleCompleteReleaseV1(withoutSnapshot as never)).toThrow(/sourceSnapshot/i);
  });

  it('rejects a source marked in force while authority remains provisional', () => {
    const value = input();
    expect(() => createCurricoloVerticaleCompleteReleaseV1({
      ...value,
      sourceMaster: { ...value.sourceMaster, curricoloVigente: true },
    })).toThrow(/curricoloVigente/i);
  });

  it('binds snapshot content into the structural footprint', () => {
    const first = createCurricoloVerticaleCompleteReleaseV1(input());
    const value = input();
    const second = createCurricoloVerticaleCompleteReleaseV1({
      ...value,
      sourceSnapshot: { ...value.sourceSnapshot, content: `${MASTER_TEXT}\nMODIFICA` },
    });

    expect(first.structuralFootprint.hash).not.toBe(second.structuralFootprint.hash);
  });
});
