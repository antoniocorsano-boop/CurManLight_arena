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

describe('curriculum foundation completeness audit', () => {
  it('distinguishes empty cells from populated but unverified cells', () => {
    const audit = auditCurriculumFoundation(sample, LEGACY_CURRICULUM_KB_PROVENANCE);

    expect(audit.totals).toEqual({
      cells: 3,
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
});
