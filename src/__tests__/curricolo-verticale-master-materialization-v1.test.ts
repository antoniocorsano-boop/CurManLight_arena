import { describe, expect, it } from 'vitest';
import { materializeCurricoloVerticaleMasterV1 } from '../domain/transfer/curricoloVerticaleMasterMaterializationV1';

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

function buildMasterFixture(): string {
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
  lines.push('Stato: MATERIALIZZATO — DISTRIBUZIONE ISTRUTTORIA DA VALIDARE;', '9.3 SECONDARIA DI PRIMO GRADO — QUADRO ANNUALE PROPOSTO DI 33 ORE');
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
    'CURRICULUM_IN_FORCE = NO',
  );

  return lines.join('\n');
}

function sourceMaster() {
  return {
    masterId: 'CAN-CURR-MASTER-00',
    driveFileId: '12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4',
    masterVersion: '1.3',
    revisionId: 'drive-revision-fixture',
    materializationState: 'COMPLETE' as const,
    humanProfessionalValidation: 'OPEN' as const,
    curriculumInForce: false,
    authority: 'INSTITUTE_CANONICAL_WORKING_BASELINE' as const,
  };
}

describe('CAN-CURR-MASTER-00 productive materialization v1', () => {
  it('materializes the complete governed working baseline without inventing approval', () => {
    const result = materializeCurricoloVerticaleMasterV1({
      institutionId: 'ics-lorenzo-milani',
      schoolYearRef: '2026/2027',
      sourceMaster: sourceMaster(),
      sourceSnapshot: { format: 'text/plain' as const, content: buildMasterFixture() },
    });

    expect(result.version.versionNumber).toBe('1.3');
    expect(result.version.status).toBe('under-review');
    expect(result.version.approvedAt).toBeUndefined();
    expect(result.segments).toHaveLength(113);
    expect(result.perimeter.expected).toHaveLength(113);
    expect(result.segments.every(item => item.workStatus === 'under-review')).toBe(true);
    expect(result.nodes.every(item => item.workStatus === 'proposed')).toBe(true);
    expect(result.verticalLinks.every(item => item.status === 'proposed')).toBe(true);

    const infancy = result.segments.filter(item => item.schoolLevel === 'infanzia');
    expect(infancy.length).toBeGreaterThanOrEqual(5);
    expect(infancy.filter(item => item.subjectOrFieldId !== 'educazione-civica' && item.subjectOrFieldId !== 'ai-literacy')
      .every(item => item.scope.type === 'school-level')).toBe(true);

    const primaryTech1 = result.segments.find(item => item.id === 'can-curr-master-00-primaria-tecnologia-1');
    const primaryTech2 = result.segments.find(item => item.id === 'can-curr-master-00-primaria-tecnologia-2');
    const secondaryTech1 = result.segments.find(item => item.id === 'can-curr-master-00-secondaria-tecnologia-1');
    const secondaryTech2 = result.segments.find(item => item.id === 'can-curr-master-00-secondaria-tecnologia-2');

    expect(primaryTech1?.frameworkApplicability.framework).toBe('IN2025');
    expect(primaryTech2?.frameworkApplicability.framework).toBe('IN2012');
    expect(secondaryTech1?.frameworkApplicability.framework).toBe('IN2025');
    expect(secondaryTech2?.frameworkApplicability.framework).toBe('IN2012');
    expect(primaryTech1?.content.obiettivi).toEqual(['obiettivo I']);
    expect(primaryTech1?.sourceSegmentId).toMatch(/^CAN-CURR-MASTER-00@1\.3:/);

    expect(JSON.stringify(result)).not.toContain('"status":"approved"');
    expect(JSON.stringify(result)).not.toContain('"workStatus":"effective"');
  });

  it('fails closed when a required ordinary section is absent', () => {
    const content = buildMasterFixture().replace(/7\.3\.12 INSEGNAMENTO DELLA RELIGIONE CATTOLICA[\s\S]*?Stato: MATERIALIZZATO — DA VALIDARE\.\n/, '');

    expect(() => materializeCurricoloVerticaleMasterV1({
      institutionId: 'ics-lorenzo-milani',
      schoolYearRef: '2026/2027',
      sourceMaster: sourceMaster(),
      sourceSnapshot: { format: 'text/plain' as const, content },
    })).toThrow(/7\.3\.12|secondaria/i);
  });

  it('rejects a source version that disagrees with the canonical header', () => {
    const source = sourceMaster();
    expect(() => materializeCurricoloVerticaleMasterV1({
      institutionId: 'ics-lorenzo-milani',
      schoolYearRef: '2026/2027',
      sourceMaster: { ...source, masterVersion: '1.2' },
      sourceSnapshot: { format: 'text/plain' as const, content: buildMasterFixture() },
    })).toThrow(/version/i);
  });
});
