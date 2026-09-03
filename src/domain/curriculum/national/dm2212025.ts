import type { SourceStatus, SourceType } from '../sources/types';

export const DM221_2025_SOURCE_ID = 'dm-221-2025-indicazioni-nazionali' as const;

/**
 * Registro minimo della fonte normativa primaria.
 *
 * L'autorita' giuridica resta ancorata alla pubblicazione in Gazzetta Ufficiale.
 * Il volume editoriale MIM di marzo 2026 e' registrato separatamente come
 * riferimento finale per i locator di pagina dell'allegato curricolare.
 * Gli elementi curricolari derivati devono conservare un locator specifico
 * (articolo/sezione/pagina) prima di poter essere marcati come source-verified.
 */
export const DM221_2025_SOURCE = {
  id: DM221_2025_SOURCE_ID,
  title: 'D.M. 9 dicembre 2025, n. 221 — Indicazioni nazionali per il curricolo',
  authority: "Ministero dell'Istruzione e del Merito",
  issuedAt: '2025-12-09',
  publishedAt: '2026-01-27',
  effectiveFrom: '2026-02-11',
  sourceType: 'normative-national' as SourceType,
  sourceStatus: 'active' as SourceStatus,
  officialLocator: {
    publication: 'Gazzetta Ufficiale della Repubblica Italiana, Serie Generale n. 21 del 27-01-2026',
    url: 'https://www.gazzettaufficiale.it/eli/id/2026/01/27/26G00021/sg',
    pdfUrl: 'https://www.gazzettaufficiale.it/eli/gu/2026/01/27/21/sg/pdf',
  },
  officialCurriculumVolume: {
    publication: 'Indicazioni nazionali per il curricolo della scuola dell’infanzia e del primo ciclo d’istruzione',
    publisher: "Ministero dell'Istruzione e del Merito",
    printedAt: '2026-03',
    pageNumbering: 'PRINTED_PAGE',
    url: 'https://www.mim.gov.it/documents/20182/10554370/curricolo_web.pdf/f91c31a0-5ed4-65f3-bfea-fb49adaba55f?t=1773224873548&version=1.0',
    contentFingerprint: {
      algorithm: 'SHA-256',
      status: 'REQUIRED',
      sha256: null as string | null,
      note: 'L’impronta canonica delle bytes del PDF finale non è ancora acquisita. Nessun gate NATIONAL_PRESCRIPTIVE può considerare soddisfatto il binding crittografico finché sha256 resta null.',
    },
  },
  replaces: 'D.M. 16 novembre 2012, n. 254',
} as const;

export type NationalSourceLocator = {
  sourceId: typeof DM221_2025_SOURCE_ID;
  article?: string;
  section?: string;
  /** Numero di pagina stampato nel volume ufficiale MIM quando il locator riguarda l'allegato. */
  page?: number;
  note?: string;
};

export type SourceBindingStatus =
  | 'LOCATOR_REQUIRED'
  | 'SOURCE_LOCATED'
  | 'SOURCE_VERIFIED';

export interface NationalSourceBinding {
  locator: NationalSourceLocator;
  status: SourceBindingStatus;
  verifiedByHuman: boolean;
}

export function isVerifiedNationalSourceBinding(binding: NationalSourceBinding): boolean {
  return binding.status === 'SOURCE_VERIFIED' && binding.verifiedByHuman === true;
}
