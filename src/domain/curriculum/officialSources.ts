import type { SourceStatus, SourceType } from './sources/types';
import type { CurriculumBaselineProvenance } from './foundationAuthority';

export interface OfficialCurriculumSourceDescriptor {
  id: string;
  title: string;
  sourceType: SourceType;
  sourceStatus: SourceStatus;
  authority: string;
  issuedAt: string;
  effectiveFrom: string;
  officialLocator: string;
  officialAttachmentLocator: string;
  transitionRule: {
    schoolYear: '2026/2027';
    gradualImplementation: true;
    startsFromPrimaryGradeOne: true;
    startsFromLowerSecondaryGradeOne: true;
  };
}

/**
 * Metadati della fonte normativa nazionale vigente.
 *
 * Questo descrittore attesta la fonte, non l'adozione di un curricolo
 * d'istituto e non attribuisce automaticamente provenienza ai singoli testi
 * presenti nella legacy curriculumKB.
 */
export const DM_221_2025_SOURCE: OfficialCurriculumSourceDescriptor = {
  id: 'dm-221-2025-indicazioni-nazionali',
  title:
    "D.M. 9 dicembre 2025, n. 221 — Indicazioni nazionali per il curricolo della scuola dell'infanzia e del primo ciclo d'istruzione",
  sourceType: 'normative-ministerial',
  sourceStatus: 'active',
  authority: "Ministero dell'Istruzione e del Merito",
  issuedAt: '2025-12-09',
  effectiveFrom: '2026-02-11',
  officialLocator:
    'https://www.gazzettaufficiale.it/eli/id/2026/01/27/26G00021/sg',
  officialAttachmentLocator:
    'https://www.mim.gov.it/documents/20182/8952594/Indicazioni%2Bnazionali%2B2025.pdf/593dfc49-bcdc-ffbb-747a-5c368b4bac01?t=1749622399405&version=1.0',
  transitionRule: {
    schoolYear: '2026/2027',
    gradualImplementation: true,
    startsFromPrimaryGradeOne: true,
    startsFromLowerSecondaryGradeOne: true,
  },
};

/**
 * Provenienza utilizzabile quando un elemento e' stato effettivamente
 * verificato contro la fonte ufficiale. Non implica adozione d'istituto.
 */
export const DM_221_2025_VERIFIED_PROVENANCE: CurriculumBaselineProvenance = {
  id: DM_221_2025_SOURCE.id,
  title: DM_221_2025_SOURCE.title,
  sourceType: DM_221_2025_SOURCE.sourceType,
  sourceStatus: DM_221_2025_SOURCE.sourceStatus,
  authorityLevel: 'SOURCE_VERIFIED',
  sourceLocator: DM_221_2025_SOURCE.officialLocator,
  institutionallyAdopted: false,
  notes:
    "Fonte normativa nazionale verificata. L'adozione e la rielaborazione del curricolo d'istituto richiedono un passaggio istituzionale distinto.",
};
