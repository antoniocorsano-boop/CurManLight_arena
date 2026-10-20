import {
  CANONICAL_SOURCE_NOT_IN_FORCE_MARKER,
  type CurricoloVerticaleCanonicalSourceMasterV1,
} from '../../domain/transfer/curricoloVerticaleCompleteReleaseV1';
import { materializeCurricoloVerticaleMasterV1 } from '../../domain/transfer/curricoloVerticaleMasterMaterializationV1';

const PRIMARY = [
  'ITALIANO',
  'LINGUA INGLESE',
  'STORIA',
  'GEOGRAFIA',
  'MATEMATICA',
  'SCIENZE',
  'TECNOLOGIA',
  'MUSICA',
  'ARTE E IMMAGINE',
  'EDUCAZIONE MOTORIA — CLASSE I / EDUCAZIONE FISICA — CLASSI II–V',
  'INSEGNAMENTO DELLA RELIGIONE CATTOLICA',
] as const;

const SECONDARY = [
  'ITALIANO',
  'LINGUA INGLESE',
  'SECONDA LINGUA COMUNITARIA — FRANCESE',
  'STORIA',
  'GEOGRAFIA',
  'MATEMATICA',
  'SCIENZE',
  'TECNOLOGIA',
  'MUSICA',
  'ARTE E IMMAGINE',
  'EDUCAZIONE FISICA',
  'INSEGNAMENTO DELLA RELIGIONE CATTOLICA',
] as const;

const INFANCY = [
  ['I DISCORSI E LE PAROLE', 'Italiano; Lingua inglese.'],
  ['IL SÉ E L’ALTRO', 'Storia; Geografia.'],
  ['LA CONOSCENZA DEL MONDO', 'Matematica; Scienze; Tecnologia.'],
  ['IMMAGINI, SUONI, COLORI', 'Musica; Arte e immagine.'],
  ['IL CORPO E IL MOVIMENTO', 'Educazione motoria e fisica.'],
] as const;

const ROMAN_PRIMARY = ['I', 'II', 'III', 'IV', 'V'] as const;
const ROMAN_SECONDARY = ['I', 'II', 'III'] as const;

function ordinaryLine(roman: string, framework: '2025' | '2012 transitorio') {
  return `Classe ${roman} — Regime ${framework}. Progressione: progressione ${roman}. Competenze: competenza ${roman}. Obiettivi: obiettivo ${roman}. Conoscenze: conoscenza ${roman}. Evidenze: evidenza ${roman}. Raccordo: raccordo ${roman}.`;
}

export function buildMasterFixture(): string {
  const lines: string[] = [
    'CAN-CURR-MASTER-00 — CURRICOLO VERTICALE INTEGRALE UNIFICATO 3–14',
    'Istituto Comprensivo Statale “Lorenzo Milani” — A.S. 2026/2027',
    'STATO: BASELINE CURRICOLARE CANONICA INTEGRALE — MATERIALIZZATA — DA VALIDARE PROFESSIONALMENTE — NON VIGENTE',
    'Versione 1.3 — 6 settembre 2026',
    '5.4 PROGRESSIONE MATERIALIZZATA — SCUOLA DELL’INFANZIA',
  ];

  INFANCY.forEach(([title, raccordi], index) => {
    lines.push(
      `5.4.${index + 1} ${title}`,
      `Raccordi verticali: ${raccordi}`,
      'Competenze attese di campo: competenza di campo.',
      '3 anni — Obiettivi: obiettivo 3. Conoscenze: conoscenza 3.',
      '4 anni — Obiettivi: obiettivo 4. Conoscenze: conoscenza 4.',
      '5 anni — Obiettivi: obiettivo 5. Conoscenze: conoscenza 5.',
      'Stato: progressione d’Istituto da validare professionalmente.',
    );
  });

  lines.push('6.3 PROGRESSIONI MATERIALIZZATE — SCUOLA PRIMARIA');
  PRIMARY.forEach((title, index) => {
    lines.push(`6.3.${index + 1} ${title}`, 'Fonte: fonte governata.');
    ROMAN_PRIMARY.forEach((roman, gradeIndex) => {
      lines.push(ordinaryLine(roman, gradeIndex === 0 ? '2025' : '2012 transitorio'));
    });
    lines.push('Stato: MATERIALIZZATO — DA VALIDARE.');
  });

  lines.push('7.3 PROGRESSIONI MATERIALIZZATE — SCUOLA SECONDARIA DI PRIMO GRADO');
  SECONDARY.forEach((title, index) => {
    lines.push(`7.3.${index + 1} ${title}`, 'Fonte: fonte governata.');
    ROMAN_SECONDARY.forEach((roman, gradeIndex) => {
      lines.push(ordinaryLine(roman, gradeIndex === 0 ? '2025' : '2012 transitorio'));
    });
    lines.push('Stato: MATERIALIZZATO — DA VALIDARE.');
  });

  lines.push(
    '8. LATINO PER L’EDUCAZIONE LINGUISTICA — CLASSI II–III',
    'Classe II — AVVIO.',
    'Progressione d’Istituto: progressione latino II.',
    'Competenze attese: competenza latino II.',
    'Evidenze osservabili: evidenza latino II.',
    'Raccordo: consolidamento in III.',
    'Classe III — CONSOLIDAMENTO E BENCHMARK FINALE.',
    'Progressione d’Istituto: progressione latino III.',
    'Competenze attese: competenza latino III.',
    'Evidenze osservabili: evidenza latino III.',
    'Stato curricolare: MATERIALIZZATO NEL MASTER — DA VALIDARE PROFESSIONALMENTE.',
    '9. EDUCAZIONE CIVICA — ASSE TRASVERSALE 3–14',
    '9.1 INFANZIA',
    '3 anni — Comunità e cura. Evidenze: evidenza infanzia 3.',
    '4 anni — Convivenza e responsabilità. Evidenze: evidenza infanzia 4.',
    '5 anni — Comunità, bene comune e prime scelte consapevoli. Evidenze: evidenza infanzia 5.',
    'Stato: MATERIALIZZATO — DA VALIDARE DAL TEAM INFANZIA.',
    '9.2 PRIMARIA — QUADRO ANNUALE PROPOSTO DI 33 ORE',
  );
  ROMAN_PRIMARY.forEach(roman => lines.push(`Classe ${roman} — Costituzione. Evidenze: evidenza civica primaria ${roman}.`));
  lines.push(
    'Stato: MATERIALIZZATO — DISTRIBUZIONE ISTRUTTORIA DA VALIDARE;',
    '9.3 SECONDARIA DI PRIMO GRADO — QUADRO ANNUALE PROPOSTO DI 33 ORE',
  );
  ROMAN_SECONDARY.forEach(roman => lines.push(`Classe ${roman} — Costituzione. Evidenze: evidenza civica secondaria ${roman}.`));
  lines.push(
    'Stato: MATERIALIZZATO — DISTRIBUZIONE ISTRUTTORIA DA VALIDARE;',
    '10. ALFABETIZZAZIONE ALL’INTELLIGENZA ARTIFICIALE — ASSE TRASVERSALE 3–14',
    'Infanzia — Esperienze guidate: esperienza AI infanzia.',
    'Primaria I–II — Prime idee di sistema e controllo umano: esperienza AI primaria I-II.',
    'Primaria III–V — Dati, verifica e prime questioni etiche: esperienza AI primaria III-V.',
    'Secondaria I — Classe I: esperienza AI secondaria I.',
    'Secondaria I — Classe II: esperienza AI secondaria II.',
    'Secondaria I — Classe III: esperienza AI secondaria III.',
    'Evidenze trasversali: verifica output; documenta l’uso; protegge dati e integrità del lavoro.',
    'Stato: MATERIALIZZATO NEL MASTER — DA VALIDARE VERTICALMENTE DA TEAM/DIPARTIMENTI.',
    '17.11 Esito documentale del gate',
    'OSA_DOCUMENTARY_COVERAGE_COMPLETE = TRUE',
    'HUMAN_PROFESSIONAL_VALIDATION = OPEN',
    CANONICAL_SOURCE_NOT_IN_FORCE_MARKER,
  );

  return lines.join('\n');
}

export function sourceMaster(
  overrides: Partial<CurricoloVerticaleCanonicalSourceMasterV1> = {},
): CurricoloVerticaleCanonicalSourceMasterV1 {
  return {
    masterId: 'CAN-CURR-MASTER-00',
    driveFileId: '12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4',
    masterVersion: '1.3',
    revisionId: 'drive-revision-fixture',
    materializationState: 'COMPLETE',
    humanProfessionalValidation: 'OPEN',
    curricoloVigente: false,
    authority: 'INSTITUTE_CANONICAL_WORKING_BASELINE',
    ...overrides,
  };
}

export function materializeFixture(options: {
  content?: string;
  sourceOverrides?: Partial<CurricoloVerticaleCanonicalSourceMasterV1>;
} = {}) {
  return materializeCurricoloVerticaleMasterV1({
    institutionId: 'ics-lorenzo-milani',
    schoolYearRef: '2026/2027',
    sourceMaster: sourceMaster(options.sourceOverrides),
    sourceSnapshot: {
      format: 'text/plain',
      content: options.content ?? buildMasterFixture(),
    },
  });
}
