import type { SchoolOrder } from '../../types/curriculum';
import type { CurriculumMap } from '../../features/session/types/appViewContracts';
import type { CurriculumBaselineProvenance } from './foundationAuthority';
import { assessCurriculumAuthority } from './foundationAuthority';

export type CurriculumCellMaturity =
  | 'EMPTY'
  | 'CONTENT_PRESENT_SOURCE_UNVERIFIED'
  | 'SOURCE_VERIFIED_NEEDS_ADOPTION'
  | 'INSTITUTIONALLY_ADOPTED';

export interface CurriculumRequiredCell {
  discipline: string;
  schoolOrder: SchoolOrder;
  requireTraguardi?: boolean;
  requireObiettivi?: boolean;
}

export interface CurriculumCellAudit {
  discipline: string;
  schoolOrder: SchoolOrder;
  required: boolean;
  structurallyComplete: boolean;
  traguardiCount: number;
  obiettiviCount: number;
  proposalsCount: number;
  evidenzeCount: number;
  maturity: CurriculumCellMaturity;
}

export interface CurriculumFoundationAudit {
  cells: CurriculumCellAudit[];
  requirementsDeclared: boolean;
  totals: {
    cells: number;
    requiredCells: number;
    structurallyIncompleteRequiredCells: number;
    empty: number;
    contentPresentSourceUnverified: number;
    sourceVerifiedNeedsAdoption: number;
    institutionallyAdopted: number;
  };
  canClaimCompleteInstitutionalCurriculum: boolean;
}

const SCHOOL_ORDERS: readonly SchoolOrder[] = ['infanzia', 'primaria', 'secondaria'];

function cellKey(discipline: string, schoolOrder: SchoolOrder): string {
  return `${discipline}::${schoolOrder}`;
}

/**
 * Misura la completezza rispetto a una matrice di requisiti esplicita.
 *
 * Senza `requiredCells` il sistema puo' descrivere il contenuto presente, ma
 * non puo' certificare il curricolo completo: l'assenza di una disciplina non
 * deve diventare invisibile solo perche' la chiave manca dal dataset.
 */
export function auditCurriculumFoundation(
  curriculum: CurriculumMap,
  provenance: CurriculumBaselineProvenance,
  requiredCells: readonly CurriculumRequiredCell[] = [],
): CurriculumFoundationAudit {
  const authority = assessCurriculumAuthority(provenance);
  const requirements = new Map(
    requiredCells.map((requirement) => [cellKey(requirement.discipline, requirement.schoolOrder), requirement]),
  );

  const disciplines = new Set(Object.keys(curriculum));
  for (const requirement of requiredCells) disciplines.add(requirement.discipline);

  const cells: CurriculumCellAudit[] = [];

  for (const discipline of [...disciplines].sort()) {
    for (const schoolOrder of SCHOOL_ORDERS) {
      const data = curriculum[discipline]?.[schoolOrder];
      const requirement = requirements.get(cellKey(discipline, schoolOrder));
      const required = Boolean(requirement);
      const traguardiCount = data?.traguardi?.length ?? 0;
      const obiettiviCount = data?.obiettivi?.length ?? 0;
      const proposalsCount = data?.proposals?.length ?? 0;
      const evidenzeCount = data?.evidenze?.length ?? 0;
      const hasCoreContent = traguardiCount > 0 || obiettiviCount > 0;

      const requireTraguardi = requirement?.requireTraguardi ?? required;
      const requireObiettivi = requirement?.requireObiettivi ?? required;
      const structurallyComplete =
        (!requireTraguardi || traguardiCount > 0) &&
        (!requireObiettivi || obiettiviCount > 0);

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
        required,
        structurallyComplete,
        traguardiCount,
        obiettiviCount,
        proposalsCount,
        evidenzeCount,
        maturity,
      });
    }
  }

  const requiredAuditCells = cells.filter((cell) => cell.required);
  const totals = {
    cells: cells.length,
    requiredCells: requiredAuditCells.length,
    structurallyIncompleteRequiredCells: requiredAuditCells.filter(
      (cell) => !cell.structurallyComplete,
    ).length,
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

  const requirementsDeclared = requiredCells.length > 0;
  const everyRequiredCellCompleteAndAdopted =
    requirementsDeclared &&
    requiredAuditCells.length === requiredCells.length &&
    requiredAuditCells.every(
      (cell) => cell.structurallyComplete && cell.maturity === 'INSTITUTIONALLY_ADOPTED',
    );

  return {
    cells,
    requirementsDeclared,
    totals,
    canClaimCompleteInstitutionalCurriculum: everyRequiredCellCompleteAndAdopted,
  };
}
