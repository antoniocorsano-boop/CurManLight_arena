import type { SourceStatus, SourceType } from '../sources/types';

export const DM221_2025_SOURCE_ID = 'dm-221-2025-indicazioni-nazionali' as const;

/**
 * Registro minimo della fonte normativa primaria.
 *
 * Non contiene una copia del testo normativo: mantiene identita', date e
 * locatori stabili verso la pubblicazione ufficiale in Gazzetta Ufficiale.
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
  replaces: 'D.M. 16 novembre 2012, n. 254',
} as const;

export type NationalSourceLocator = {
  sourceId: typeof DM221_2025_SOURCE_ID;
  article?: string;
  section?: string;
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
