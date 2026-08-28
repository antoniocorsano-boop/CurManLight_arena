import type { SourceStatus, SourceType } from './sources/types';

export type CurriculumAuthorityLevel =
  | 'DEMONSTRATION_UNVERIFIED'
  | 'SOURCE_VERIFIED'
  | 'INSTITUTIONALLY_ADOPTED';

export interface CurriculumBaselineProvenance {
  id: string;
  title: string;
  sourceType: SourceType;
  sourceStatus: SourceStatus;
  authorityLevel: CurriculumAuthorityLevel;
  sourceLocator?: string;
  institutionallyAdopted: boolean;
  notes: string;
}

/**
 * Provenienza esplicita della KB storica incorporata nell'app.
 *
 * La classificazione e' intenzionalmente fail-closed: il dataset esistente
 * resta disponibile per ispezione, demo e migrazione, ma non costituisce
 * una fonte normativa verificata ne' un curricolo d'istituto adottato.
 */
export const LEGACY_CURRICULUM_KB_PROVENANCE: CurriculumBaselineProvenance = {
  id: 'legacy-curriculum-kb-v1',
  title: 'CurManLight legacy curriculum knowledge base',
  sourceType: 'demonstration',
  sourceStatus: 'unverified',
  authorityLevel: 'DEMONSTRATION_UNVERIFIED',
  sourceLocator: 'src/data/curriculumKB.ts',
  institutionallyAdopted: false,
  notes:
    'Contenuto storico dell’app privo di binding completo e verificato a fonti normative e adozione istituzionale. Non proiettabile come curricolo istituzionale autorevole.',
};

export interface CurriculumAuthorityAssessment {
  canPresentAsVerifiedSource: boolean;
  canPresentAsInstitutionallyAdopted: boolean;
  authorityLevel: CurriculumAuthorityLevel;
  humanLabel: string;
  reason: string;
}

function isSourceNatureVerified(provenance: CurriculumBaselineProvenance): boolean {
  return (
    provenance.sourceStatus === 'active' &&
    provenance.sourceType !== 'demonstration' &&
    provenance.sourceType !== 'legacy'
  );
}

/**
 * Valuta l'autorita' senza inferire livelli piu' alti dai soli metadati.
 *
 * Le combinazioni incoerenti falliscono chiuse. Esempio: una fonte `active`
 * dichiarata `DEMONSTRATION_UNVERIFIED` resta non verificata; allo stesso modo
 * `INSTITUTIONALLY_ADOPTED` senza attestazione di adozione non viene degradata
 * automaticamente a fonte verificata.
 */
export function assessCurriculumAuthority(
  provenance: CurriculumBaselineProvenance,
): CurriculumAuthorityAssessment {
  const sourceNatureVerified = isSourceNatureVerified(provenance);

  const institutionallyAdopted =
    sourceNatureVerified &&
    provenance.authorityLevel === 'INSTITUTIONALLY_ADOPTED' &&
    provenance.institutionallyAdopted === true;

  const sourceVerifiedOnly =
    sourceNatureVerified &&
    provenance.authorityLevel === 'SOURCE_VERIFIED' &&
    provenance.institutionallyAdopted === false;

  if (institutionallyAdopted) {
    return {
      canPresentAsVerifiedSource: true,
      canPresentAsInstitutionallyAdopted: true,
      authorityLevel: 'INSTITUTIONALLY_ADOPTED',
      humanLabel: 'Curricolo d’istituto adottato',
      reason: 'La fonte è verificata e l’adozione istituzionale è attestata.',
    };
  }

  if (sourceVerifiedOnly) {
    return {
      canPresentAsVerifiedSource: true,
      canPresentAsInstitutionallyAdopted: false,
      authorityLevel: 'SOURCE_VERIFIED',
      humanLabel: 'Fonte verificata, non ancora adottata',
      reason: 'La fonte è verificata, ma manca un’adozione istituzionale attestata.',
    };
  }

  return {
    canPresentAsVerifiedSource: false,
    canPresentAsInstitutionallyAdopted: false,
    authorityLevel: 'DEMONSTRATION_UNVERIFIED',
    humanLabel: 'Contenuti di lavoro non verificati',
    reason:
      'La provenienza non dimostra in modo coerente un livello di autorità superiore: il contenuto può essere consultato e revisionato, ma non presentato come fonte verificata o curricolo istituzionale adottato.',
  };
}

export function assertInstitutionalCurriculumProjection(
  provenance: CurriculumBaselineProvenance,
): void {
  const assessment = assessCurriculumAuthority(provenance);
  if (!assessment.canPresentAsInstitutionallyAdopted) {
    throw new Error(`CURRICULUM_AUTHORITY_BLOCKED: ${assessment.reason}`);
  }
}
