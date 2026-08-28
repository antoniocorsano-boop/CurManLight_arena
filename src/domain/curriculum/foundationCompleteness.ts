import type { SchoolOrder } from '../../types/curriculum';
import type { CurriculumMap } from '../../features/session/types/appViewContracts';
import type { CurriculumBaselineProvenance } from './foundationAuthority';
import { assessCurriculumAuthority } from './foundationAuthority';

export type CurriculumCellMaturity =
  | 'EMPTY'
  | 'CONTENT_PRESENT_SOURCE_UNVERIFIED'
  | 'SOURCE_VERIFIED_NEEDS_ADOPTION'
  | 'INSTITUTIONALLY_ADOPTED';

export interface CurriculumCellAudit {
  discipline: string;
  schoolOrder: SchoolOrder;
  traguardiCount: number;
  obiettiviCount: number;
  proposalsCount: number;
  evidenzeCount: number;
  maturity: CurriculumCellMaturity;
}

export interface CurriculumFoundationAudit {
  cells: CurriculumCellAudit[];
  totals: {
    cells: number;
    empty: number;
    contentPresentSourceUnverified: number;
    sourceVerifiedNeedsAdoption: number;
    institutionallyAdopted: number;
  };
  canClaimCompleteInstitutionalCurriculum: boolean;
}

const SCHOOL_ORDERS: readonly SchoolOrder[] = ['infanzia', 'primaria', 'secondaria'];

export function auditCurriculumFoundation(
  curriculum: CurriculumMap,
  provenance: CurriculumBaselineProvenance,
): CurriculumFoundationAudit {
  const authority = assessCurriculumAuthority(provenance);
  const cells: CurriculumCellAudit[] = [];

  for (const discipline of Object.keys(curriculum).sort()) {
    for (const schoolOrder of SCHOOL_ORDERS) {
      const data = curriculum[discipline]?.[schoolOrder];
      const traguardiCount = data?.traguardi?.length ?? 0;
      const obiettiviCount = data?.obiettivi?.length ?? 0;
      const proposalsCount = data?.proposals?.length ?? 0;
      const evidenzeCount = data?.evidenze?.length ?? 0;
      const hasCoreContent = traguardiCount > 0 || obiettiviCount > 0;

      let maturity: CurriculumCellMaturity;
      if (!hasCoreContent) {
        maturity = 'EMPTY';
      } else if (authority.canPresentAsInstitutionallyAdopted) {
        maturity = 'INSTITUTIONALLY_ADOPTED';
      } else if (authority.canPresentAsVerifiedSource) {
        maturity = 'SOURCE_VERIFIED_NEEDS_ADOPTION';
      } else {
        maturity = 'CONTENT_PRESENT_SOURCE_UNVERIFIED';
      }

      cells.push({
        discipline,
        schoolOrder,
        traguardiCount,
        obiettiviCount,
        proposalsCount,
        evidenzeCount,
        maturity,
      });
    }
  }

  const totals = {
    cells: cells.length,
    empty: cells.filter((cell) => cell.maturity === 'EMPTY').length,
    contentPresentSourceUnverified: cells.filter(
      (cell) => cell.maturity === 'CONTENT_PRESENT_SOURCE_UNVERIFIED',
    ).length,
    sourceVerifiedNeedsAdoption: cells.filter(
      (cell) => cell.maturity === 'SOURCE_VERIFIED_NEEDS_ADOPTION',
    ).length,
    institutionallyAdopted: cells.filter(
      (cell) => cell.maturity === 'INSTITUTIONALLY_ADOPTED',
    ).length,
  };

  return {
    cells,
    totals,
    canClaimCompleteInstitutionalCurriculum:
      totals.cells > 0 && totals.institutionallyAdopted === totals.cells,
  };
}
