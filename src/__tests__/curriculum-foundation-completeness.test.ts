import { describe, expect, it } from 'vitest';
import type { CurriculumMap } from '../features/session/types/appViewContracts';
import {
  LEGACY_CURRICULUM_KB_PROVENANCE,
  type CurriculumBaselineProvenance,
} from '../domain/curriculum/foundationAuthority';
import { auditCurriculumFoundation } from '../domain/curriculum/foundationCompleteness';

const sample: CurriculumMap = {
  tecnologia: {
    infanzia: { traguardi: [], obiettivi: [], proposals: [], evidenze: [] },
    primaria: {
      traguardi: ['contenuto'],
      obiettivi: ['contenuto'],
      proposals: [],
      evidenze: [],
    },
    secondaria: {
      traguardi: ['contenuto'],
      obiettivi: ['contenuto'],
      proposals: [],
      evidenze: [],
    },
  },
};

const adopted: CurriculumBaselineProvenance = {
  ...LEGACY_CURRICULUM_KB_PROVENANCE,
  sourceType: 'institute-curriculum',
  sourceStatus: 'active',
  authorityLevel: 'INSTITUTIONALLY_ADOPTED',
  sourceLocator: 'institutional-curriculum-version-id',
  institutionallyAdopted: true,
};

describe('curriculum foundation completeness audit', () => {
  it('distinguishes empty cells from populated but unverified cells', () => {
    const audit = auditCurriculumFoundation(sample, LEGACY_CURRICULUM_KB_PROVENANCE);

    expect(audit.requirementsDeclared).toBe(false);
    expect(audit.totals).toEqual({
      cells: 3,
      requiredCells: 0,
      structurallyIncompleteRequiredCells: 0,
      empty: 1,
      contentPresentSourceUnverified: 2,
      sourceVerifiedNeedsAdoption: 0,
      institutionallyAdopted: 0,
    });
    expect(audit.canClaimCompleteInstitutionalCurriculum).toBe(false);
  });

  it('does not turn verified national material into an adopted institute curriculum', () => {
    const verified: CurriculumBaselineProvenance = {
      ...LEGACY_CURRICULUM_KB_PROVENANCE,
      sourceType: 'normative-national',
      sourceStatus: 'active',
      authorityLevel: 'SOURCE_VERIFIED',
      institutionallyAdopted: false,
    };
    const audit = auditCurriculumFoundation(sample, verified);

    expect(audit.totals.sourceVerifiedNeedsAdoption).toBe(2);
    expect(audit.totals.institutionallyAdopted).toBe(0);
    expect(audit.canClaimCompleteInstitutionalCurriculum).toBe(false);
  });

  it('never claims completeness when no required matrix is declared, even for adopted content', () => {
    const audit = auditCurriculumFoundation(sample, adopted);

    expect(audit.requirementsDeclared).toBe(false);
    expect(audit.canClaimCompleteInstitutionalCurriculum).toBe(false);
  });

  it('detects a required discipline/order cell missing from the dataset', () => {
    const audit = auditCurriculumFoundation(sample, adopted, [
      { discipline: 'tecnologia', schoolOrder: 'primaria' },
      { discipline: 'matematica', schoolOrder: 'primaria' },
    ]);

    expect(audit.totals.requiredCells).toBe(2);
    expect(audit.totals.structurallyIncompleteRequiredCells).toBe(1);
    expect(audit.canClaimCompleteInstitutionalCurriculum).toBe(false);
  });

  it('requires both traguardi and obiettivi by default for a required cell', () => {
    const incomplete: CurriculumMap = {
      tecnologia: {
        infanzia: { traguardi: [], obiettivi: [], proposals: [], evidenze: [] },
        primaria: { traguardi: ['T1'], obiettivi: [], proposals: [], evidenze: [] },
        secondaria: { traguardi: [], obiettivi: [], proposals: [], evidenze: [] },
      },
    };

    const audit = auditCurriculumFoundation(incomplete, adopted, [
      { discipline: 'tecnologia', schoolOrder: 'primaria' },
    ]);

    expect(audit.totals.structurallyIncompleteRequiredCells).toBe(1);
    expect(audit.canClaimCompleteInstitutionalCurriculum).toBe(false);
  });

  it('claims completeness only when every declared required cell is complete and adopted', () => {
    const audit = auditCurriculumFoundation(sample, adopted, [
      { discipline: 'tecnologia', schoolOrder: 'primaria' },
      { discipline: 'tecnologia', schoolOrder: 'secondaria' },
    ]);

    expect(audit.totals.structurallyIncompleteRequiredCells).toBe(0);
    expect(audit.canClaimCompleteInstitutionalCurriculum).toBe(true);
  });
});
