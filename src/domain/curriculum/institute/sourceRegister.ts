export type CurriculumSourceAuthority =
  | 'NORMATIVE'
  | 'MINISTERIAL_OPERATIONAL';

export type CurriculumSourceLocatorKind =
  | 'OFFICIAL'
  | 'INSTITUTIONAL_MIRROR';

export type CurriculumSourceVerificationState =
  | 'OFFICIAL_SOURCE_VERIFIED'
  | 'ACT_VERIFIED_INSTITUTIONAL_MIRROR';

export type CurriculumSourceRecord = {
  code: string;
  title: string;
  issuer: string;
  actDate: string;
  authority: CurriculumSourceAuthority;
  roleInMaster: string;
  applicability: string;
  locator: string;
  locatorKind: CurriculumSourceLocatorKind;
  verificationState: CurriculumSourceVerificationState;
  verifiedAt: string;
};

export const INSTITUTE_CURRICULUM_SOURCE_REPERTORY = {
  repertoryId: 'ALL-CURR-A',
  title: 'ALL-CURR-A_Repertorio_fonti_normative_e_istituzionali_2026-2027',
  driveFileId: '1MBZKbis6i6xg50z6fKgbh9yUianJXdhZ5jsK4r852PQ',
  version: '1.1',
  date: '2026-09-06',
  status: 'CURRENT_INSTRUCTIONAL_SOURCE_REPERTORY',
  authorityInferenceFromPresence: false,
} as const;

export const INSTITUTE_CURRICULUM_SOURCE_CHAIN = [
  {
    id: 'CAN-CURR-MASTER-00',
    title: 'CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027',
    driveFileId: '12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4',
    version: '1.3',
    role: 'CANONICAL_WORKING_BASELINE',
  },
  {
    id: 'MATR-CURR-MASTER-01',
    title: 'MATR-CURR-MASTER-01_Matrice_conformita_normativa_IN2025_e_atti_collegati_2026-2027',
    driveFileId: '1Wiw8Wsifls1-wr_GPYuqIAoB8GnwXMChO8Mz_kwiLKY',
    version: '1.0',
    role: 'CONTROL_ATTACHMENT_NOT_CURRICULUM_BASELINE',
  },
  {
    id: 'ALL-CURR-A',
    title: INSTITUTE_CURRICULUM_SOURCE_REPERTORY.title,
    driveFileId: INSTITUTE_CURRICULUM_SOURCE_REPERTORY.driveFileId,
    version: INSTITUTE_CURRICULUM_SOURCE_REPERTORY.version,
    role: 'INSTRUCTIONAL_SOURCE_REPERTORY',
  },
  {
    id: 'PRIMARY-CORRECTED-PROVENANCE',
    title: 'CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx',
    driveFileId: '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf',
    version: 'sha256:c89fbbbe43432db8410913675381b7dc3654d2448f9f91a8c72b115b9ec6fc55',
    role: 'PRIMARY_CORRECTED_PROVENANCE',
  },
] as const;

export const INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES: CurriculumSourceRecord[] = [
  {
    code: 'N2',
    title: 'D.P.R. 8 marzo 1999, n. 275 — Regolamento dell’autonomia scolastica',
    issuer: 'Presidente della Repubblica',
    actDate: '1999-03-08',
    authority: 'NORMATIVE',
    roleInMaster: 'Autonomia didattica e curricolo d’Istituto',
    applicability: 'Governance del curricolo e spazi di autonomia',
    locator: 'https://www.normattiva.it/atto/caricaDettaglioAtto?atto.codiceRedazionale=099G0339&atto.dataPubblicazioneGazzetta=1999-08-10',
    locatorKind: 'OFFICIAL',
    verificationState: 'OFFICIAL_SOURCE_VERIFIED',
    verifiedAt: '2026-09-06',
  },
  {
    code: 'N4',
    title: 'D.M. 9 dicembre 2025, n. 221 — Indicazioni nazionali per il curricolo della scuola dell’infanzia e del primo ciclo d’istruzione',
    issuer: 'Ministero dell’istruzione e del merito',
    actDate: '2025-12-09',
    authority: 'NORMATIVE',
    roleInMaster: 'Quadro curricolare nazionale corrente e decorrenza progressiva',
    applicability: 'Scuola dell’infanzia e primo ciclo; applicazione progressiva dal 2026/2027',
    locator: 'https://www.normattiva.it/atto/caricaDettaglioAtto?atto.codiceRedazionale=26G00021&atto.dataPubblicazioneGazzetta=2026-01-27',
    locatorKind: 'OFFICIAL',
    verificationState: 'OFFICIAL_SOURCE_VERIFIED',
    verifiedAt: '2026-09-06',
  },
  {
    code: 'N5',
    title: 'D.M. 16 novembre 2012, n. 254 — Indicazioni nazionali per il curricolo',
    issuer: 'Ministero dell’istruzione, dell’università e della ricerca',
    actDate: '2012-11-16',
    authority: 'NORMATIVE',
    roleInMaster: 'Quadro transitorio per le coorti non ancora coperte dalle Indicazioni 2025',
    applicability: 'Classi in prosecuzione durante il regime transitorio',
    locator: 'https://www.normattiva.it/atto/caricaDettaglioAtto?atto.codiceRedazionale=13G00034&atto.dataPubblicazioneGazzetta=2013-02-05',
    locatorKind: 'OFFICIAL',
    verificationState: 'OFFICIAL_SOURCE_VERIFIED',
    verifiedAt: '2026-09-06',
  },
  {
    code: 'N6',
    title: 'D.Lgs. 13 aprile 2017, n. 62 — Valutazione e certificazione delle competenze nel primo ciclo',
    issuer: 'Repubblica Italiana',
    actDate: '2017-04-13',
    authority: 'NORMATIVE',
    roleInMaster: 'Raccordo tra curricolo, valutazione e certificazione',
    applicability: 'Primo ciclo',
    locator: 'https://www.normattiva.it/eli/stato/DECRETO_LEGISLATIVO/2017/04/13/62/CONSOLIDATED',
    locatorKind: 'OFFICIAL',
    verificationState: 'OFFICIAL_SOURCE_VERIFIED',
    verifiedAt: '2026-09-06',
  },
  {
    code: 'N10',
    title: 'Legge 20 agosto 2019, n. 92 — Introduzione dell’insegnamento scolastico dell’educazione civica',
    issuer: 'Repubblica Italiana',
    actDate: '2019-08-20',
    authority: 'NORMATIVE',
    roleInMaster: 'Fondamento dell’asse trasversale di Educazione civica',
    applicability: 'Sistema nazionale di istruzione',
    locator: 'https://www.normattiva.it/uri-res/N2Ls?urn%3Anir%3Astato%3Alegge%3A2019%3B92=',
    locatorKind: 'OFFICIAL',
    verificationState: 'OFFICIAL_SOURCE_VERIFIED',
    verifiedAt: '2026-09-06',
  },
  {
    code: 'N11',
    title: 'D.M. 7 settembre 2024, n. 183 — Linee guida per l’insegnamento dell’educazione civica',
    issuer: 'Ministero dell’istruzione e del merito',
    actDate: '2024-09-07',
    authority: 'NORMATIVE',
    roleInMaster: 'Traguardi e obiettivi dell’asse Educazione civica',
    applicability: 'Dal 2024/2025; scuola dell’infanzia, primo e secondo ciclo secondo le Linee guida',
    locator: 'https://www.mim.gov.it/documents/20182/0/Decreto%2B%281%29.pdf/4a35f2a3-4b53-6e9d-a0eb-a3d6ad4c9134?t=1725710176010',
    locatorKind: 'OFFICIAL',
    verificationState: 'OFFICIAL_SOURCE_VERIFIED',
    verifiedAt: '2026-09-06',
  },
  {
    code: 'N13',
    title: 'Raccomandazione del Consiglio dell’Unione europea del 22 maggio 2018 sulle competenze chiave per l’apprendimento permanente',
    issuer: 'Consiglio dell’Unione europea',
    actDate: '2018-05-22',
    authority: 'NORMATIVE',
    roleInMaster: 'Quadro europeo delle competenze chiave',
    applicability: 'Riferimento europeo trasversale',
    locator: 'https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX%3A32018H0604%2801%29',
    locatorKind: 'OFFICIAL',
    verificationState: 'OFFICIAL_SOURCE_VERIFIED',
    verifiedAt: '2026-09-06',
  },
  {
    code: 'N17',
    title: 'Nota MIM prot. n. 1312 del 12 marzo 2026 — chiarimenti operativi per la prima applicazione del D.M. 221/2025',
    issuer: 'Ministero dell’istruzione e del merito — Dipartimento per il sistema educativo di istruzione e formazione',
    actDate: '2026-03-12',
    authority: 'MINISTERIAL_OPERATIONAL',
    roleInMaster: 'Regime transitorio e chiarimenti operativi su Storia, Informatica, LEL e valutazione',
    applicability: 'Prima applicazione delle Indicazioni 2025 nel 2026/2027',
    locator: 'https://www.icgigiproietti.edu.it/circolare/trasmissione-nota-mim-1312-del-12-marzo-2026/',
    locatorKind: 'INSTITUTIONAL_MIRROR',
    verificationState: 'ACT_VERIFIED_INSTITUTIONAL_MIRROR',
    verifiedAt: '2026-09-06',
  },
  {
    code: 'N18',
    title: 'D.M. 15 settembre 2023, n. 184 — Adozione delle Linee guida per le discipline STEM',
    issuer: 'Ministero dell’istruzione e del merito',
    actDate: '2023-09-15',
    authority: 'NORMATIVE',
    roleInMaster: 'Raccordo metodologico e curricolare STEM',
    applicability: 'Istituzioni scolastiche del sistema nazionale',
    locator: 'https://www.mim.gov.it/documents/20182/0/DM%2B184%2Bdel%2B15%2Bsettembre%2B2023.pdf/278712a8-19de-e28b-8938-6fa4610fb13a?t=1698173015248&version=1.0',
    locatorKind: 'OFFICIAL',
    verificationState: 'OFFICIAL_SOURCE_VERIFIED',
    verifiedAt: '2026-09-06',
  },
  {
    code: 'N19',
    title: 'D.M. 9 agosto 2025, n. 166 e Linee guida per l’introduzione dell’Intelligenza Artificiale nelle istituzioni scolastiche',
    issuer: 'Ministero dell’istruzione e del merito',
    actDate: '2025-08-09',
    authority: 'MINISTERIAL_OPERATIONAL',
    roleInMaster: 'Governance dell’IA distinta dall’asse curricolare di alfabetizzazione all’intelligenza artificiale',
    applicability: 'Istituzioni scolastiche; uso consapevole, sicuro e governato dell’IA',
    locator: 'https://www.mim.gov.it/en/-/decreto-ministeriale-n-166-del-9-agosto-2025',
    locatorKind: 'OFFICIAL',
    verificationState: 'OFFICIAL_SOURCE_VERIFIED',
    verifiedAt: '2026-09-06',
  },
  {
    code: 'N20',
    title: 'D.P.R. 11 febbraio 2010 — Traguardi e obiettivi di apprendimento dell’Insegnamento della religione cattolica',
    issuer: 'Presidente della Repubblica',
    actDate: '2010-02-11',
    authority: 'NORMATIVE',
    roleInMaster: 'Fonte specifica dell’Insegnamento della religione cattolica',
    applicability: 'Scuola dell’infanzia e primo ciclo',
    locator: 'https://www.gazzettaufficiale.it/eli/gu/2010/05/07/105/sg/pdf',
    locatorKind: 'OFFICIAL',
    verificationState: 'OFFICIAL_SOURCE_VERIFIED',
    verifiedAt: '2026-09-06',
  },
];

export const INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCE_COUNT =
  INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES.length;
