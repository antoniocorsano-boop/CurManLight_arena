import type { CurriculumNode } from '../curriculum/node';
import type { CurriculumSegment, CurriculumSegmentContent } from '../curriculum/segment';
import type { FrameworkApplicabilityReference, SegmentScope } from '../curriculum/types';
import type { InstituteCurriculumVersion } from '../curriculum/version';
import type { VerticalCurriculumLink } from '../curriculum/verticalLink';
import type { CurricoloVerticaleCanonicalSourceMasterV1 } from './curricoloVerticaleCompleteReleaseV1';
import type {
  CurricoloVerticaleDomainKindV1,
  CurricoloVerticaleExpectedScopeV1,
  CurricoloVerticalePerimeterV1,
} from './curricoloVerticaleReleaseV1';

export interface MaterializeCurricoloVerticaleMasterV1Input {
  institutionId: string;
  schoolYearRef: string;
  sourceMaster: CurricoloVerticaleCanonicalSourceMasterV1;
  sourceSnapshot: {
    format: 'text/plain';
    content: string;
  };
}

export interface CurricoloVerticaleMasterMaterializationV1 {
  version: InstituteCurriculumVersion;
  segments: CurriculumSegment[];
  nodes: CurriculumNode[];
  verticalLinks: VerticalCurriculumLink[];
  perimeter: CurricoloVerticalePerimeterV1;
}

type SchoolOrder = 'infanzia' | 'primaria' | 'secondaria';

type DomainSpec = {
  section: string;
  domainId: string;
  title: string;
};

const INFANCY_DOMAINS: readonly DomainSpec[] = [
  { section: '5.4.1', domainId: 'i-discorsi-e-le-parole', title: 'I DISCORSI E LE PAROLE' },
  { section: '5.4.2', domainId: 'il-se-e-l-altro', title: 'IL SÉ E L’ALTRO' },
  { section: '5.4.3', domainId: 'la-conoscenza-del-mondo', title: 'LA CONOSCENZA DEL MONDO' },
  { section: '5.4.4', domainId: 'immagini-suoni-colori', title: 'IMMAGINI, SUONI, COLORI' },
  { section: '5.4.5', domainId: 'il-corpo-e-il-movimento', title: 'IL CORPO E IL MOVIMENTO' },
] as const;

const PRIMARY_DOMAINS: readonly DomainSpec[] = [
  { section: '6.3.1', domainId: 'italiano', title: 'ITALIANO' },
  { section: '6.3.2', domainId: 'lingua-inglese', title: 'LINGUA INGLESE' },
  { section: '6.3.3', domainId: 'storia', title: 'STORIA' },
  { section: '6.3.4', domainId: 'geografia', title: 'GEOGRAFIA' },
  { section: '6.3.5', domainId: 'matematica', title: 'MATEMATICA' },
  { section: '6.3.6', domainId: 'scienze', title: 'SCIENZE' },
  { section: '6.3.7', domainId: 'tecnologia', title: 'TECNOLOGIA' },
  { section: '6.3.8', domainId: 'musica', title: 'MUSICA' },
  { section: '6.3.9', domainId: 'arte-e-immagine', title: 'ARTE E IMMAGINE' },
  { section: '6.3.10', domainId: 'educazione-motoria-fisica', title: 'EDUCAZIONE MOTORIA / EDUCAZIONE FISICA' },
  { section: '6.3.11', domainId: 'irc', title: 'INSEGNAMENTO DELLA RELIGIONE CATTOLICA' },
] as const;

const SECONDARY_DOMAINS: readonly DomainSpec[] = [
  { section: '7.3.1', domainId: 'italiano', title: 'ITALIANO' },
  { section: '7.3.2', domainId: 'lingua-inglese', title: 'LINGUA INGLESE' },
  { section: '7.3.3', domainId: 'seconda-lingua-comunitaria-francese', title: 'SECONDA LINGUA COMUNITARIA — FRANCESE' },
  { section: '7.3.4', domainId: 'storia', title: 'STORIA' },
  { section: '7.3.5', domainId: 'geografia', title: 'GEOGRAFIA' },
  { section: '7.3.6', domainId: 'matematica', title: 'MATEMATICA' },
  { section: '7.3.7', domainId: 'scienze', title: 'SCIENZE' },
  { section: '7.3.8', domainId: 'tecnologia', title: 'TECNOLOGIA' },
  { section: '7.3.9', domainId: 'musica', title: 'MUSICA' },
  { section: '7.3.10', domainId: 'arte-e-immagine', title: 'ARTE E IMMAGINE' },
  { section: '7.3.11', domainId: 'educazione-fisica', title: 'EDUCAZIONE FISICA' },
  { section: '7.3.12', domainId: 'irc', title: 'INSEGNAMENTO DELLA RELIGIONE CATTOLICA' },
] as const;

const ROMAN_TO_GRADE: Record<string, string> = {
  I: '1', II: '2', III: '3', IV: '4', V: '5',
};

const ITALIAN_MONTH: Record<string, number> = {
  gennaio: 0,
  febbraio: 1,
  marzo: 2,
  aprile: 3,
  maggio: 4,
  giugno: 5,
  luglio: 6,
  agosto: 7,
  settembre: 8,
  ottobre: 9,
  novembre: 10,
  dicembre: 11,
};

const TAGS = [
  'Progressione d’Istituto:',
  "Progressione d'Istituto:",
  'Progressione:',
  'Identità formativa:',
  'Competenze attese di campo:',
  'Competenze attese:',
  'Competenze:',
  'Obiettivi:',
  'Conoscenze:',
  'Evidenze osservabili:',
  'Evidenze trasversali:',
  'Evidenze:',
  'Raccordi verticali:',
  'Raccordo verticale:',
  'Raccordo:',
  'Nuclei verticali d’Istituto:',
  "Nuclei verticali d'Istituto:",
  'Nuclei d’Istituto:',
  "Nuclei d'Istituto:",
  'Ambiti:',
] as const;

function clean(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().replace(/\s+/g, ' ').replace(/[.;]\s*$/, '').trim();
  return normalized || undefined;
}

function taggedValue(text: string, label: string): string | undefined {
  const start = text.indexOf(label);
  if (start < 0) return undefined;
  const valueStart = start + label.length;
  let end = text.length;
  for (const candidate of TAGS) {
    if (candidate === label) continue;
    const index = text.indexOf(candidate, valueStart);
    if (index >= 0 && index < end) end = index;
  }
  return clean(text.slice(valueStart, end));
}

function firstTaggedValue(text: string, labels: readonly string[]): string | undefined {
  for (const label of labels) {
    const value = taggedValue(text, label);
    if (value) return value;
  }
  return undefined;
}

function requireLine(lines: readonly string[], prefix: string): string {
  const line = lines.find(value => value.startsWith(prefix));
  if (!line) throw new Error(`canonical master is missing required marker '${prefix}'`);
  return line;
}

function section(lines: readonly string[], startPrefix: string, endPrefixes: readonly string[]): string[] {
  const start = lines.findIndex(line => line.startsWith(startPrefix));
  if (start < 0) throw new Error(`canonical master is missing required section '${startPrefix}'`);
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (endPrefixes.some(prefix => lines[index].startsWith(prefix))) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end);
}

function sourceDate(lines: readonly string[], expectedVersion: string): string {
  const versionLine = requireLine(lines, 'Versione ');
  const match = /^Versione\s+([0-9.]+)\s+—\s+(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/u.exec(versionLine);
  if (!match) throw new Error('canonical master Versione header is not parseable');
  if (match[1] !== expectedVersion) {
    throw new Error(`canonical master version '${match[1]}' does not match sourceMaster version '${expectedVersion}'`);
  }
  const month = ITALIAN_MONTH[match[3].toLowerCase()];
  if (month === undefined) throw new Error(`unsupported canonical master month '${match[3]}'`);
  return new Date(Date.UTC(Number(match[4]), month, Number(match[2]))).toISOString();
}

function stableVersionId(masterId: string, version: string): string {
  return `${masterId.toLowerCase()}-v${version.replace(/[^0-9]+/g, '-')}`.replace(/-+$/g, '');
}

function frameworkFor(order: SchoolOrder, domainId: string, grade?: string): FrameworkApplicabilityReference {
  if (domainId === 'irc') {
    return {
      framework: null,
      resolutionStatus: 'resolved',
      resolutionReason: 'fonte nazionale specifica IRC; scansione d’Istituto da validare',
    };
  }
  if (domainId === 'educazione-civica') {
    return {
      framework: null,
      resolutionStatus: 'resolved',
      resolutionReason: 'insegnamento trasversale governato da fonte specifica; quadro d’Istituto da validare',
    };
  }
  if (domainId === 'ai-literacy') {
    return {
      framework: null,
      resolutionStatus: 'resolved',
      resolutionReason: 'asse verticale e trasversale d’Istituto; non disciplina autonoma',
    };
  }
  if (domainId === 'latino-lel') {
    return {
      framework: 'IN2025',
      resolutionStatus: 'resolved',
      resolutionReason: 'percorso Latino per l’Educazione Linguistica II–III da validare',
    };
  }
  if (order === 'infanzia') {
    return {
      framework: 'IN2025',
      resolutionStatus: 'resolved',
      resolutionReason: 'scuola dell’infanzia 3–5 anni in regime IN2025',
      cohortEntryYear: 2026,
    };
  }
  if (grade === '1') {
    return {
      framework: 'IN2025',
      resolutionStatus: 'resolved',
      resolutionReason: `${order} classe prima in prima applicazione IN2025 nell’A.S. 2026/2027`,
      cohortEntryYear: 2026,
    };
  }
  return {
    framework: 'IN2012',
    resolutionStatus: 'resolved',
    resolutionReason: `${order} classe ${grade} in regime transitorio IN2012 nell’A.S. 2026/2027`,
  };
}

function emptyContent(): CurriculumSegmentContent {
  return {
    traguardi: [],
    obiettivi: [],
    evidenze: [],
    conoscenze: [],
    abilita: [],
    competenze: [],
    nucleiFondanti: [],
    proposals: [],
  };
}

function ordinaryContent(classLine: string, sectionLines: readonly string[]): { content: CurriculumSegmentContent; progression?: string } {
  const content = emptyContent();
  const progression = firstTaggedValue(classLine, ['Progressione:', 'Identità formativa:']);
  const competence = taggedValue(classLine, 'Competenze:');
  const objective = taggedValue(classLine, 'Obiettivi:');
  const knowledge = taggedValue(classLine, 'Conoscenze:');
  const evidence = taggedValue(classLine, 'Evidenze:');
  if (competence) content.competenze.push(competence);
  if (objective) content.obiettivi.push(objective);
  if (knowledge) content.conoscenze.push(knowledge);
  if (evidence) content.evidenze.push(evidence);

  const sectionText = sectionLines.join(' ');
  const nuclei = firstTaggedValue(sectionText, [
    'Nuclei verticali d’Istituto:',
    "Nuclei verticali d'Istituto:",
    'Nuclei d’Istituto:',
    "Nuclei d'Istituto:",
    'Ambiti:',
  ]);
  if (nuclei) content.nucleiFondanti.push(nuclei);
  return { content, progression };
}

function addNodes(
  nodes: CurriculumNode[],
  segment: CurriculumSegment,
  title: string,
  description: string,
  timestamp: string,
): string {
  const milestoneId = `${segment.id}-milestone`;
  nodes.push({
    id: milestoneId,
    versionId: segment.versionId,
    segmentId: segment.id,
    type: 'milestone',
    title,
    description,
    workStatus: 'proposed',
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const collections: Array<[keyof CurriculumSegmentContent, CurriculumNode['type']]> = [
    ['competenze', 'competence'],
    ['obiettivi', 'objective'],
    ['evidenze', 'evidence'],
    ['conoscenze', 'knowledge'],
    ['abilita', 'skill'],
    ['nucleiFondanti', 'core-theme'],
  ];
  for (const [key, type] of collections) {
    const values = segment.content[key];
    if (!Array.isArray(values)) continue;
    values.forEach((value, index) => {
      if (typeof value !== 'string') return;
      nodes.push({
        id: `${segment.id}-${type}-${index + 1}`,
        versionId: segment.versionId,
        segmentId: segment.id,
        type,
        title: value,
        workStatus: 'proposed',
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });
  }
  return milestoneId;
}

function sortById<T extends { id: string }>(values: T[]): T[] {
  return values.sort((a, b) => a.id.localeCompare(b.id));
}

function assertCanonicalSource(input: MaterializeCurricoloVerticaleMasterV1Input, lines: readonly string[]): string {
  if (!input.institutionId.trim()) throw new Error('institutionId is required');
  if (!input.schoolYearRef.trim()) throw new Error('schoolYearRef is required');
  if (input.sourceSnapshot.format !== 'text/plain' || !input.sourceSnapshot.content.trim()) {
    throw new Error('canonical sourceSnapshot text/plain content is required');
  }
  if (input.sourceMaster.masterId !== 'CAN-CURR-MASTER-00') {
    throw new Error('unsupported canonical master id');
  }
  if (input.sourceMaster.materializationState !== 'COMPLETE') {
    throw new Error('canonical master must be materialized COMPLETE');
  }
  if (input.sourceMaster.humanProfessionalValidation !== 'OPEN') {
    throw new Error('v1 materialization expects human professional validation OPEN');
  }
  if (input.sourceMaster.curriculumInForce !== false) {
    throw new Error('v1 materialization cannot materialize a curriculum already marked in force');
  }
  if (input.sourceMaster.authority !== 'INSTITUTE_CANONICAL_WORKING_BASELINE') {
    throw new Error('v1 materialization requires the canonical working baseline authority');
  }

  const header = requireLine(lines, 'CAN-CURR-MASTER-00 —');
  requireLine(lines, 'STATO: BASELINE CURRICOLARE CANONICA INTEGRALE — MATERIALIZZATA — DA VALIDARE PROFESSIONALMENTE — NON VIGENTE');
  requireLine(lines, 'OSA_DOCUMENTARY_COVERAGE_COMPLETE = TRUE');
  requireLine(lines, 'HUMAN_PROFESSIONAL_VALIDATION = OPEN');
  requireLine(lines, 'CURRICULUM_IN_FORCE = NO');
  if (!lines.some(line => line.includes(`A.S. ${input.schoolYearRef}`))) {
    throw new Error(`canonical master does not declare requested school year '${input.schoolYearRef}'`);
  }
  return header;
}

export function materializeCurricoloVerticaleMasterV1(
  input: MaterializeCurricoloVerticaleMasterV1Input,
): CurricoloVerticaleMasterMaterializationV1 {
  const lines = input.sourceSnapshot.content
    .split(/\r?\n/u)
    .map((line, index) => (index === 0 ? line.replace(/^\uFEFF/u, '') : line).trim())
    .filter(Boolean);
  const title = assertCanonicalSource(input, lines);
  const timestamp = sourceDate(lines, input.sourceMaster.masterVersion);
  const versionId = stableVersionId(input.sourceMaster.masterId, input.sourceMaster.masterVersion);
  const version: InstituteCurriculumVersion = {
    id: versionId,
    institutionId: input.institutionId,
    title,
    versionNumber: input.sourceMaster.masterVersion,
    status: 'under-review',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const segments: CurriculumSegment[] = [];
  const nodes: CurriculumNode[] = [];
  const verticalLinks: VerticalCurriculumLink[] = [];
  const expected: CurricoloVerticaleExpectedScopeV1[] = [];
  const anchorBySegmentId = new Map<string, string>();

  const addSegment = (args: {
    order: SchoolOrder;
    domainId: string;
    domainKind: CurricoloVerticaleDomainKindV1;
    scope: SegmentScope;
    sourceRef: string;
    content: CurriculumSegmentContent;
    title: string;
    description: string;
    gradeForFramework?: string;
  }): CurriculumSegment => {
    const suffix = args.scope.type === 'school-level'
      ? ''
      : args.scope.type === 'grade'
        ? `-${args.scope.grade}`
        : `-${args.scope.grades.join('-')}`;
    const id = `${input.sourceMaster.masterId.toLowerCase()}-${args.order}-${args.domainId}${suffix}`;
    const segment: CurriculumSegment = {
      id,
      versionId,
      schoolLevel: args.order,
      subjectOrFieldId: args.domainId,
      scope: args.scope,
      frameworkApplicability: frameworkFor(args.order, args.domainId, args.gradeForFramework),
      workStatus: 'under-review',
      content: args.content,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    segments.push(segment);
    expected.push({
      schoolOrder: args.order,
      scope: args.scope,
      domainId: args.domainId,
      domainKind: args.domainKind,
    });
    const anchor = addNodes(nodes, segment, args.title, args.description, timestamp);
    anchorBySegmentId.set(segment.id, anchor);
    return segment;
  };

  const addLink = (source: CurriculumSegment | undefined, target: CurriculumSegment | undefined, relationType: VerticalCurriculumLink['relationType'], rationale: string) => {
    if (!source || !target) return;
    const sourceNodeId = anchorBySegmentId.get(source.id);
    const targetNodeId = anchorBySegmentId.get(target.id);
    if (!sourceNodeId || !targetNodeId) return;
    const id = `${input.sourceMaster.masterId.toLowerCase()}-link-${source.id}-to-${target.id}`;
    if (verticalLinks.some(item => item.id === id)) return;
    verticalLinks.push({
      id,
      versionId,
      sourceNodeId,
      targetNodeId,
      relationType,
      rationale,
      status: 'proposed',
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  };

  const infancyRaccordi = new Map<string, string[]>();
  INFANCY_DOMAINS.forEach((domain, index) => {
    const next = INFANCY_DOMAINS[index + 1]?.section ?? '5.5';
    const block = section(lines, `${domain.section} `, [`${next} `]);
    const text = block.join(' ');
    const content = emptyContent();
    const competence = taggedValue(text, 'Competenze attese di campo:');
    if (!competence) throw new Error(`${domain.section} is missing Competenze attese di campo`);
    content.competenze.push(competence);
    for (const age of ['3', '4', '5']) {
      const ageLine = block.find(line => line.startsWith(`${age} anni —`));
      if (!ageLine) throw new Error(`${domain.section} is missing ${age} anni progression`);
      const objective = taggedValue(ageLine, 'Obiettivi:');
      const knowledge = taggedValue(ageLine, 'Conoscenze:');
      if (!objective || !knowledge) throw new Error(`${domain.section} ${age} anni is incomplete`);
      content.obiettivi.push(`${age} anni — ${objective}`);
      content.conoscenze.push(`${age} anni — ${knowledge}`);
    }
    const raccordiRaw = firstTaggedValue(text, ['Raccordi verticali:', 'Raccordo verticale:']);
    if (!raccordiRaw) throw new Error(`${domain.section} is missing vertical raccordi`);
    infancyRaccordi.set(domain.domainId, raccordiRaw.split(';').map(value => clean(value)).filter((value): value is string => Boolean(value)));
    addSegment({
      order: 'infanzia',
      domainId: domain.domainId,
      domainKind: 'CAMPO_ESPERIENZA',
      scope: { type: 'school-level' },
      sourceRef: domain.section,
      content,
      title: domain.title,
      description: text,
    });
  });

  const materializeOrdinary = (order: 'primaria' | 'secondaria', domains: readonly DomainSpec[], romans: readonly string[], closingPrefix: string) => {
    domains.forEach((domain, index) => {
      const next = domains[index + 1]?.section ?? closingPrefix;
      const block = section(lines, `${domain.section} `, [`${next} `]);
      for (const roman of romans) {
        const classLine = block.find(line => line.startsWith(`Classe ${roman} —`));
        if (!classLine) throw new Error(`${domain.section} ${order} is missing Classe ${roman}`);
        const grade = ROMAN_TO_GRADE[roman];
        const parsed = ordinaryContent(classLine, block);
        if (parsed.content.competenze.length === 0 || parsed.content.obiettivi.length === 0 || parsed.content.conoscenze.length === 0 || parsed.content.evidenze.length === 0) {
          throw new Error(`${domain.section} Classe ${roman} is missing governed curriculum fields`);
        }
        addSegment({
          order,
          domainId: domain.domainId,
          domainKind: 'DISCIPLINA',
          scope: { type: 'grade', grade },
          sourceRef: `${domain.section}:classe-${grade}`,
          content: parsed.content,
          title: `${domain.title} — Classe ${roman}`,
          description: parsed.progression ?? classLine,
          gradeForFramework: grade,
        });
      }
    });
  };

  materializeOrdinary('primaria', PRIMARY_DOMAINS, ['I', 'II', 'III', 'IV', 'V'], '6.4');
  materializeOrdinary('secondaria', SECONDARY_DOMAINS, ['I', 'II', 'III'], '7.4');

  const latin = section(lines, '8. LATINO PER L’EDUCAZIONE LINGUISTICA', ['9. EDUCAZIONE CIVICA']);
  for (const [roman, nextMarker] of [['II', 'Classe III —'], ['III', '9. EDUCAZIONE CIVICA']] as const) {
    const start = latin.findIndex(line => line.startsWith(`Classe ${roman} —`));
    if (start < 0) throw new Error(`Latin LEL is missing Classe ${roman}`);
    let end = latin.length;
    const next = latin.findIndex((line, index) => index > start && line.startsWith(nextMarker));
    if (next >= 0) end = next;
    const block = latin.slice(start, end);
    const text = block.join(' ');
    const content = emptyContent();
    const competence = taggedValue(text, 'Competenze attese:');
    const evidence = taggedValue(text, 'Evidenze osservabili:');
    const progression = firstTaggedValue(text, ['Progressione d’Istituto:', "Progressione d'Istituto:"]);
    if (!competence || !evidence || !progression) throw new Error(`Latin LEL Classe ${roman} is incomplete`);
    content.competenze.push(competence);
    content.evidenze.push(evidence);
    const grade = ROMAN_TO_GRADE[roman];
    addSegment({
      order: 'secondaria',
      domainId: 'latino-lel',
      domainKind: 'PERCORSO_CURRICOLARE',
      scope: { type: 'grade', grade },
      sourceRef: `8:classe-${grade}`,
      content,
      title: `Latino per l’Educazione Linguistica — Classe ${roman}`,
      description: progression,
      gradeForFramework: grade,
    });
  }

  const civic = section(lines, '9. EDUCAZIONE CIVICA', ['10. ALFABETIZZAZIONE ALL’INTELLIGENZA ARTIFICIALE']);
  const civicInfancy = section(civic, '9.1 INFANZIA', ['9.2 PRIMARIA']);
  const civicInfContent = emptyContent();
  for (const age of ['3', '4', '5']) {
    const line = civicInfancy.find(value => value.startsWith(`${age} anni —`));
    if (!line) throw new Error(`Educazione civica Infanzia is missing ${age} anni`);
    const evidence = taggedValue(line, 'Evidenze:');
    const objective = clean(line.slice(line.indexOf('—') + 1, line.indexOf('Evidenze:')));
    if (!objective || !evidence) throw new Error(`Educazione civica Infanzia ${age} anni is incomplete`);
    civicInfContent.obiettivi.push(`${age} anni — ${objective}`);
    civicInfContent.evidenze.push(`${age} anni — ${evidence}`);
  }
  addSegment({
    order: 'infanzia',
    domainId: 'educazione-civica',
    domainKind: 'AMBITO_TRASVERSALE',
    scope: { type: 'school-level' },
    sourceRef: '9.1',
    content: civicInfContent,
    title: 'Educazione civica — Infanzia',
    description: civicInfancy.join(' '),
  });

  const civicPrimary = section(civic, '9.2 PRIMARIA', ['9.3 SECONDARIA']);
  for (const roman of ['I', 'II', 'III', 'IV', 'V']) {
    const line = civicPrimary.find(value => value.startsWith(`Classe ${roman} —`));
    if (!line) throw new Error(`Educazione civica Primaria is missing Classe ${roman}`);
    const content = emptyContent();
    const evidence = taggedValue(line, 'Evidenze:');
    const objective = clean(line.slice(line.indexOf('—') + 1, line.indexOf('Evidenze:')));
    if (!objective || !evidence) throw new Error(`Educazione civica Primaria Classe ${roman} is incomplete`);
    content.obiettivi.push(objective);
    content.evidenze.push(evidence);
    const grade = ROMAN_TO_GRADE[roman];
    addSegment({
      order: 'primaria',
      domainId: 'educazione-civica',
      domainKind: 'AMBITO_TRASVERSALE',
      scope: { type: 'grade', grade },
      sourceRef: `9.2:classe-${grade}`,
      content,
      title: `Educazione civica — Primaria Classe ${roman}`,
      description: line,
      gradeForFramework: grade,
    });
  }

  const civicSecondary = section(civic, '9.3 SECONDARIA', []);
  for (const roman of ['I', 'II', 'III']) {
    const line = civicSecondary.find(value => value.startsWith(`Classe ${roman} —`));
    if (!line) throw new Error(`Educazione civica Secondaria is missing Classe ${roman}`);
    const content = emptyContent();
    const evidence = taggedValue(line, 'Evidenze:');
    const objective = clean(line.slice(line.indexOf('—') + 1, line.indexOf('Evidenze:')));
    if (!objective || !evidence) throw new Error(`Educazione civica Secondaria Classe ${roman} is incomplete`);
    content.obiettivi.push(objective);
    content.evidenze.push(evidence);
    const grade = ROMAN_TO_GRADE[roman];
    addSegment({
      order: 'secondaria',
      domainId: 'educazione-civica',
      domainKind: 'AMBITO_TRASVERSALE',
      scope: { type: 'grade', grade },
      sourceRef: `9.3:classe-${grade}`,
      content,
      title: `Educazione civica — Secondaria Classe ${roman}`,
      description: line,
      gradeForFramework: grade,
    });
  }

  const ai = section(lines, '10. ALFABETIZZAZIONE ALL’INTELLIGENZA ARTIFICIALE', ['11. INDICE CANONICO DI PROVENIENZA']);
  const aiEvidenceLine = ai.find(value => value.startsWith('Evidenze trasversali:'));
  const aiEvidence = aiEvidenceLine ? taggedValue(aiEvidenceLine, 'Evidenze trasversali:') : undefined;
  if (!aiEvidence) throw new Error('AI literacy is missing Evidenze trasversali');
  const aiSpecs: Array<{ prefix: string; order: SchoolOrder; scope: SegmentScope; suffix: string; gradeForFramework?: string }> = [
    { prefix: 'Infanzia —', order: 'infanzia', scope: { type: 'school-level' }, suffix: 'infanzia' },
    { prefix: 'Primaria I–II —', order: 'primaria', scope: { type: 'grade-range', grades: ['1', '2'] }, suffix: '1-2', gradeForFramework: '1' },
    { prefix: 'Primaria III–V —', order: 'primaria', scope: { type: 'grade-range', grades: ['3', '4', '5'] }, suffix: '3-5', gradeForFramework: '3' },
    { prefix: 'Secondaria I — Classe I:', order: 'secondaria', scope: { type: 'grade', grade: '1' }, suffix: '1', gradeForFramework: '1' },
    { prefix: 'Secondaria I — Classe II:', order: 'secondaria', scope: { type: 'grade', grade: '2' }, suffix: '2', gradeForFramework: '2' },
    { prefix: 'Secondaria I — Classe III:', order: 'secondaria', scope: { type: 'grade', grade: '3' }, suffix: '3', gradeForFramework: '3' },
  ];
  for (const spec of aiSpecs) {
    const line = ai.find(value => value.startsWith(spec.prefix));
    if (!line) throw new Error(`AI literacy is missing '${spec.prefix}'`);
    const content = emptyContent();
    const objective = clean(line.slice(spec.prefix.length));
    if (!objective) throw new Error(`AI literacy '${spec.prefix}' is empty`);
    content.obiettivi.push(objective);
    content.evidenze.push(aiEvidence);
    addSegment({
      order: spec.order,
      domainId: 'ai-literacy',
      domainKind: 'AMBITO_TRASVERSALE',
      scope: spec.scope,
      sourceRef: `10:${spec.suffix}`,
      content,
      title: `AI literacy — ${spec.order} ${spec.suffix}`,
      description: line,
      gradeForFramework: spec.gradeForFramework,
    });
  }

  const segmentBy = (order: SchoolOrder, domainId: string, scopeKey: string) => segments.find(item => {
    if (item.schoolLevel !== order || item.subjectOrFieldId !== domainId) return false;
    if (item.scope.type === 'school-level') return scopeKey === 'school-level';
    if (item.scope.type === 'grade') return item.scope.grade === scopeKey;
    return item.scope.grades.join('-') === scopeKey;
  });

  for (const domain of PRIMARY_DOMAINS) {
    for (let grade = 1; grade < 5; grade += 1) {
      addLink(segmentBy('primaria', domain.domainId, String(grade)), segmentBy('primaria', domain.domainId, String(grade + 1)), 'development', 'Progressione verticale d’Istituto nella scuola primaria; validazione professionale ancora aperta.');
    }
  }
  for (const domain of SECONDARY_DOMAINS) {
    for (let grade = 1; grade < 3; grade += 1) {
      addLink(segmentBy('secondaria', domain.domainId, String(grade)), segmentBy('secondaria', domain.domainId, String(grade + 1)), 'development', 'Progressione verticale d’Istituto nella scuola secondaria di primo grado; validazione professionale ancora aperta.');
    }
  }

  const crossOrder: Array<[string, string]> = [
    ['italiano', 'italiano'],
    ['lingua-inglese', 'lingua-inglese'],
    ['storia', 'storia'],
    ['geografia', 'geografia'],
    ['matematica', 'matematica'],
    ['scienze', 'scienze'],
    ['tecnologia', 'tecnologia'],
    ['musica', 'musica'],
    ['arte-e-immagine', 'arte-e-immagine'],
    ['educazione-motoria-fisica', 'educazione-fisica'],
    ['irc', 'irc'],
  ];
  for (const [primaryId, secondaryId] of crossOrder) {
    addLink(segmentBy('primaria', primaryId, '5'), segmentBy('secondaria', secondaryId, '1'), 'continuity', 'Raccordo tra termine della primaria e ingresso nella secondaria; non costituisce approvazione del curricolo.');
  }

  const raccordoTarget: Record<string, string> = {
    italiano: 'italiano',
    'lingua inglese': 'lingua-inglese',
    storia: 'storia',
    geografia: 'geografia',
    matematica: 'matematica',
    scienze: 'scienze',
    tecnologia: 'tecnologia',
    musica: 'musica',
    'arte e immagine': 'arte-e-immagine',
    'educazione motoria e fisica': 'educazione-motoria-fisica',
  };
  for (const domain of INFANCY_DOMAINS) {
    const source = segmentBy('infanzia', domain.domainId, 'school-level');
    const targets = infancyRaccordi.get(domain.domainId) ?? [];
    for (const target of targets) {
      const key = target.toLowerCase().replace(/[.]$/u, '').trim();
      const targetDomain = raccordoTarget[key];
      if (!targetDomain) throw new Error(`${domain.section} has unsupported vertical raccordo '${target}'`);
      addLink(source, segmentBy('primaria', targetDomain, '1'), 'continuity', 'Raccordo verticale nativo dal campo di esperienza alla disciplina del primo ciclo.');
    }
  }

  addLink(segmentBy('secondaria', 'latino-lel', '2'), segmentBy('secondaria', 'latino-lel', '3'), 'development', 'Progressione del percorso Latino per l’Educazione Linguistica II→III; da validare professionalmente.');
  addLink(segmentBy('infanzia', 'educazione-civica', 'school-level'), segmentBy('primaria', 'educazione-civica', '1'), 'continuity', 'Continuità dell’asse di Educazione civica 3–14.');
  for (let grade = 1; grade < 5; grade += 1) {
    addLink(segmentBy('primaria', 'educazione-civica', String(grade)), segmentBy('primaria', 'educazione-civica', String(grade + 1)), 'development', 'Progressione annuale proposta di Educazione civica; distribuzione istruttoria da validare.');
  }
  addLink(segmentBy('primaria', 'educazione-civica', '5'), segmentBy('secondaria', 'educazione-civica', '1'), 'continuity', 'Continuità dell’asse di Educazione civica tra primaria e secondaria.');
  for (let grade = 1; grade < 3; grade += 1) {
    addLink(segmentBy('secondaria', 'educazione-civica', String(grade)), segmentBy('secondaria', 'educazione-civica', String(grade + 1)), 'development', 'Progressione annuale proposta di Educazione civica; distribuzione istruttoria da validare.');
  }
  addLink(segmentBy('infanzia', 'ai-literacy', 'school-level'), segmentBy('primaria', 'ai-literacy', '1-2'), 'continuity', 'Continuità dell’asse AI literacy 3–14.');
  addLink(segmentBy('primaria', 'ai-literacy', '1-2'), segmentBy('primaria', 'ai-literacy', '3-4-5'), 'development', 'Progressione dell’asse AI literacy nella primaria.');
  addLink(segmentBy('primaria', 'ai-literacy', '3-4-5'), segmentBy('secondaria', 'ai-literacy', '1'), 'continuity', 'Continuità dell’asse AI literacy tra primaria e secondaria.');
  addLink(segmentBy('secondaria', 'ai-literacy', '1'), segmentBy('secondaria', 'ai-literacy', '2'), 'development', 'Progressione dell’asse AI literacy nella secondaria.');
  addLink(segmentBy('secondaria', 'ai-literacy', '2'), segmentBy('secondaria', 'ai-literacy', '3'), 'development', 'Progressione dell’asse AI literacy nella secondaria.');

  if (segments.length !== 113 || expected.length !== 113) {
    throw new Error(`canonical master materialization is incomplete: expected 113 governed scopes, got ${segments.length}`);
  }

  return {
    version,
    segments: sortById(segments),
    nodes: sortById(nodes),
    verticalLinks: sortById(verticalLinks),
    perimeter: {
      expected: [...expected].sort((a, b) => `${a.schoolOrder}:${a.domainId}:${JSON.stringify(a.scope)}`.localeCompare(`${b.schoolOrder}:${b.domainId}:${JSON.stringify(b.scope)}`)),
      intentionallyNotApplicable: [],
    },
  };
}
