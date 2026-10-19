import {
  type CurricoloVerticaleArtifactV1,
  validateCurricoloVerticaleArtifactV1,
} from '../../../domain/transfer/curricoloVerticaleArtifactV1';

export type CanonicalCurricoloDomainKind = 'field' | 'discipline' | 'axis';

export type CanonicalCurricoloScope = {
  segmentId: string;
  type: 'school-level' | 'grade' | 'grade-range';
  label: string;
  targetClass: string | null;
  grades?: string[];
  content: CurricoloVerticaleArtifactV1['materialization']['segments'][number]['content'];
  workStatus: CurricoloVerticaleArtifactV1['materialization']['segments'][number]['workStatus'];
};

export type CanonicalCurricoloOrder = {
  id: 'infanzia' | 'primaria' | 'secondaria';
  label: string;
  scopes: CanonicalCurricoloScope[];
};

export type CanonicalCurricoloDomain = {
  id: string;
  label: string;
  kind: CanonicalCurricoloDomainKind;
  orders: CanonicalCurricoloOrder[];
};

export type CanonicalCurricoloRelation = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: string;
  status: string;
  rationale: string;
};

export type CanonicalCurricoloReadModel = {
  identity: {
    title: 'Curricolo verticale d’Istituto';
    schoolYearRef: string;
    masterVersion: string;
    revisionId: string;
    validationStatus: 'OPEN';
    validationLabel: 'Validazione professionale aperta';
    curricoloVigente: false;
    vigencyLabel: 'Non vigente';
  };
  domains: CanonicalCurricoloDomain[];
  relations: CanonicalCurricoloRelation[];
};

export type CanonicalCurricoloReadResult =
  | { ok: true; value: CanonicalCurricoloReadModel }
  | { ok: false; errors: string[] };

const FIELD_IDS = new Set([
  'i-discorsi-e-le-parole',
  'il-se-e-l-altro',
  'la-conoscenza-del-mondo',
  'immagini-suoni-colori',
  'il-corpo-e-il-movimento',
]);

const AXIS_IDS = new Set(['educazione-civica', 'ai-literacy']);

const DOMAIN_LABELS: Record<string, string> = {
  'ai-literacy': 'Alfabetizzazione all’intelligenza artificiale',
  'arte-e-immagine': 'Arte e immagine',
  'educazione-civica': 'Educazione civica',
  'educazione-fisica': 'Educazione fisica',
  'educazione-motoria-fisica': 'Educazione motoria e fisica',
  geografia: 'Geografia',
  'i-discorsi-e-le-parole': 'I discorsi e le parole',
  'il-corpo-e-il-movimento': 'Il corpo e il movimento',
  'il-se-e-l-altro': 'Il sé e l’altro',
  'immagini-suoni-colori': 'Immagini, suoni, colori',
  irc: 'IRC',
  italiano: 'Italiano',
  'la-conoscenza-del-mondo': 'La conoscenza del mondo',
  'latino-lel': 'Latino per l’Educazione Linguistica',
  'lingua-inglese': 'Lingua inglese',
  matematica: 'Matematica',
  musica: 'Musica',
  scienze: 'Scienze',
  'seconda-lingua-comunitaria-francese': 'Seconda lingua comunitaria · Francese',
  storia: 'Storia',
  tecnologia: 'Tecnologia',
};

const ORDER_LABELS: Record<CanonicalCurricoloOrder['id'], string> = {
  infanzia: 'Infanzia',
  primaria: 'Scuola primaria',
  secondaria: 'Scuola secondaria di primo grado',
};

const ORDER_RANK: Record<CanonicalCurricoloOrder['id'], number> = {
  infanzia: 0,
  primaria: 1,
  secondaria: 2,
};

const ROMAN_GRADE: Record<string, string> = {
  '1': 'I',
  '2': 'II',
  '3': 'III',
  '4': 'IV',
  '5': 'V',
};

const labelForDomain = (id: string): string => DOMAIN_LABELS[id]
  ?? id
    .split('-')
    .map((part) => part.length === 0 ? part : `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(' ');

const kindForDomain = (id: string): CanonicalCurricoloDomainKind => {
  if (FIELD_IDS.has(id)) return 'field';
  if (AXIS_IDS.has(id)) return 'axis';
  return 'discipline';
};

const romanGrade = (grade: string): string => ROMAN_GRADE[grade] ?? grade;

const scopeSortKey = (scope: CanonicalCurricoloScope): number => {
  if (scope.type === 'school-level') return 0;
  const first = scope.grades?.[0] ?? scope.targetClass;
  if (!first) return 0;
  const numeric = Object.entries(ROMAN_GRADE).find(([, roman]) => roman === first)?.[0] ?? first;
  const parsed = Number.parseInt(numeric, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const projectScope = (
  segment: CurricoloVerticaleArtifactV1['materialization']['segments'][number],
): CanonicalCurricoloScope => {
  if (segment.scope.type === 'school-level') {
    return {
      segmentId: segment.id,
      type: 'school-level',
      label: '3–5 anni',
      targetClass: null,
      content: segment.content,
      workStatus: segment.workStatus,
    };
  }

  if (segment.scope.type === 'grade-range') {
    const grades = [...segment.scope.grades];
    const firstGrade = romanGrade(grades[0]);
    const lastGrade = romanGrade(grades[grades.length - 1]);
    return {
      segmentId: segment.id,
      type: 'grade-range',
      grades,
      label: `Classi ${firstGrade}–${lastGrade}`,
      targetClass: null,
      content: segment.content,
      workStatus: segment.workStatus,
    };
  }

  const targetClass = romanGrade(segment.scope.grade);
  return {
    segmentId: segment.id,
    type: 'grade',
    grades: [segment.scope.grade],
    label: `Classe ${targetClass}`,
    targetClass,
    content: segment.content,
    workStatus: segment.workStatus,
  };
};

const buildVerifiedReadModel = (artifact: CurricoloVerticaleArtifactV1): CanonicalCurricoloReadModel => {
  const domains = new Map<string, CanonicalCurricoloDomain>();

  for (const segment of artifact.materialization.segments) {
    const domain = domains.get(segment.subjectOrFieldId) ?? {
      id: segment.subjectOrFieldId,
      label: labelForDomain(segment.subjectOrFieldId),
      kind: kindForDomain(segment.subjectOrFieldId),
      orders: [],
    };

    const orderId = segment.schoolLevel;
    let order = domain.orders.find((candidate) => candidate.id === orderId);
    if (!order) {
      order = {
        id: orderId,
        label: ORDER_LABELS[orderId],
        scopes: [],
      };
      domain.orders.push(order);
    }

    order.scopes.push(projectScope(segment));
    domains.set(domain.id, domain);
  }

  const projectedDomains = [...domains.values()]
    .map((domain) => ({
      ...domain,
      orders: [...domain.orders]
        .sort((left, right) => ORDER_RANK[left.id] - ORDER_RANK[right.id])
        .map((order) => ({
          ...order,
          scopes: [...order.scopes].sort((left, right) => scopeSortKey(left) - scopeSortKey(right)),
        })),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, 'it'));

  return {
    identity: {
      title: 'Curricolo verticale d’Istituto',
      schoolYearRef: artifact.schoolYearRef,
      masterVersion: artifact.source.masterVersion,
      revisionId: artifact.source.revisionId,
      validationStatus: 'OPEN',
      validationLabel: 'Validazione professionale aperta',
      curricoloVigente: false,
      vigencyLabel: 'Non vigente',
    },
    domains: projectedDomains,
    relations: artifact.materialization.verticalLinks.map((link) => ({
      id: link.id,
      sourceNodeId: link.sourceNodeId,
      targetNodeId: link.targetNodeId,
      relationType: link.relationType,
      status: link.status,
      rationale: link.rationale,
    })),
  };
};

export function buildCanonicalCurricoloReadModel(
  artifact: CurricoloVerticaleArtifactV1,
): CanonicalCurricoloReadModel {
  const validation = validateCurricoloVerticaleArtifactV1(artifact);
  if (!validation.valid) {
    throw new Error(`Canonical curricolo artifact is invalid: ${validation.errors.join('; ')}`);
  }
  return buildVerifiedReadModel(artifact);
}

export function loadCanonicalCurricoloReadModel(input: unknown): CanonicalCurricoloReadResult {
  const validation = validateCurricoloVerticaleArtifactV1(input);
  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  return {
    ok: true,
    value: buildVerifiedReadModel(input as CurricoloVerticaleArtifactV1),
  };
}
