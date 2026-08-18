import {
  createSource,
  createSourceVersion,
  createSourceReference,
  createCurriculumVersion,
  createCurriculumVersionReference,
  createCurriculumSegment,
  createSegmentReference,
  createCurriculumNode,
} from './constructors';

export const SOURCE_2012 = createSource(
  'D.M. 254/2012 — Indicazioni nazionali per il curricolo',
  'normative-national',
  {
    schoolOrders: ['infanzia', 'primaria', 'secondaria'],
    disciplines: ['italiano'],
    isNational: true,
  },
  {
    authority: "Ministero dell'Istruzione",
    issuedAt: '2012-11-16',
    versionLabel: 'D.M. 254/2012',
    status: 'active',
    origin: 'normative-source',
    now: '2026-08-17T00:00:00.000Z',
  }
);

export const SOURCE_VERSION_2012 = createSourceVersion(
  createSourceReference(SOURCE_2012.id),
  1,
  {
    label: 'D.M. 254/2012',
    issuedAt: '2012-11-16',
    status: 'active',
    origin: 'normative-source',
    now: '2026-08-17T00:00:00.000Z',
  }
);

export const SOURCE_REF = createSourceReference(SOURCE_2012.id);

export const VERSION_2012_INFANZIA = createCurriculumVersion(
  'Indicazioni nazionali 2012 — Infanzia',
  'infanzia',
  {
    status: 'active',
    mainSourceRefs: [SOURCE_REF],
    origin: 'normative-source',
    now: '2026-08-17T00:00:00.000Z',
  }
);

export const VERSION_2012_PRIMARIA = createCurriculumVersion(
  'Indicazioni nazionali 2012 — Primaria',
  'primaria',
  {
    disciplines: ['italiano'],
    status: 'active',
    mainSourceRefs: [SOURCE_REF],
    origin: 'normative-source',
    now: '2026-08-17T00:00:00.000Z',
  }
);

export const VERSION_2012_SECONDARIA = createCurriculumVersion(
  'Indicazioni nazionali 2012 — Secondaria',
  'secondaria',
  {
    disciplines: ['italiano'],
    status: 'active',
    mainSourceRefs: [SOURCE_REF],
    origin: 'normative-source',
    now: '2026-08-17T00:00:00.000Z',
  }
);

export const SEGMENTS_2012_INFANZIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_INFANZIA.id, VERSION_2012_INFANZIA.title),
    'infanzia',
    null,
    'Il sé e l\'altro',
    {
      sourceArea: { kind: 'experience-field', code: 'in2012-infanzia-se-altro', label: 'Il sé e l\'altro' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_INFANZIA.id, VERSION_2012_INFANZIA.title),
    'infanzia',
    null,
    'Il corpo e il movimento',
    {
      sourceArea: { kind: 'experience-field', code: 'in2012-infanzia-corpo-movimento', label: 'Il corpo e il movimento' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_INFANZIA.id, VERSION_2012_INFANZIA.title),
    'infanzia',
    null,
    'Immagini, suoni, colori',
    {
      sourceArea: { kind: 'experience-field', code: 'in2012-infanzia-immagini-suoni-colori', label: 'Immagini, suoni, colori' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_INFANZIA.id, VERSION_2012_INFANZIA.title),
    'infanzia',
    null,
    'I discorsi e le parole',
    {
      sourceArea: { kind: 'experience-field', code: 'in2012-infanzia-discorsi-parole', label: 'I discorsi e le parole' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_INFANZIA.id, VERSION_2012_INFANZIA.title),
    'infanzia',
    null,
    'La conoscenza del mondo',
    {
      sourceArea: { kind: 'experience-field', code: 'in2012-infanzia-conoscenza-mondo', label: 'La conoscenza del mondo' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_PRIMARIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'italiano',
    'Italiano',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-italiano', label: 'Italiano' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'storia',
    'Storia',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-storia', label: 'Storia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'geografia',
    'Geografia',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-geografia', label: 'Geografia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'matematica',
    'Matematica',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-matematica', label: 'Matematica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'scienze',
    'Scienze',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-scienze', label: 'Scienze' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'tecnologia',
    'Tecnologia',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-tecnologia', label: 'Tecnologia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_SECONDARIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'italiano',
    'Italiano',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-italiano', label: 'Italiano' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'storia',
    'Storia',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-storia', label: 'Storia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'geografia',
    'Geografia',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-geografia', label: 'Geografia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'matematica',
    'Matematica',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-matematica', label: 'Matematica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'scienze',
    'Scienze',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-scienze', label: 'Scienze' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'tecnologia',
    'Tecnologia',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-tecnologia', label: 'Tecnologia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const NODES_2012_INFANZIA = SEGMENTS_2012_INFANZIA.map((segment) =>
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_INFANZIA.id, VERSION_2012_INFANZIA.title),
    createSegmentReference(segment.id, segment.title),
    'traguardo',
    `Traguardo - ${segment.title}`,
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-infanzia',
    }
  )
);

export const NODES_2012_PRIMARIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA[0].id, SEGMENTS_2012_PRIMARIA[0].title),
    'traguardo',
    'Traguardo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA[0].id, SEGMENTS_2012_PRIMARIA[0].title),
    'obiettivo',
    'Obiettivo - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA[0].id, SEGMENTS_2012_PRIMARIA[0].title),
    'obiettivo',
    'Obiettivo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2012_SECONDARIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA[0].id, SEGMENTS_2012_SECONDARIA[0].title),
    'traguardo',
    'Traguardo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA[0].id, SEGMENTS_2012_SECONDARIA[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const SEGMENTS_2012_PRIMARIA_INGLESE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'inglese',
    'Lingua inglese',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-inglese', label: 'Lingua inglese' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_SECONDARIA_INGLESE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'inglese',
    'Lingua inglese',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-inglese', label: 'Lingua inglese' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'seconda-lingua',
    'Seconda lingua comunitaria',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-secondaLingua', label: 'Seconda lingua comunitaria' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'seconda-lingua',
    'Seconda lingua comunitaria',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-secondaLingua', label: 'Seconda lingua comunitaria' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_PRIMARIA_STORIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'storia',
    'Storia',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-storia', label: 'Storia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_SECONDARIA_STORIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'storia',
    'Storia',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-storia', label: 'Storia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_PRIMARIA_GEOGRAFIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'geografia',
    'Geografia',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-geografia', label: 'Geografia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_SECONDARIA_GEOGRAFIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'geografia',
    'Geografia',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-geografia', label: 'Geografia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_PRIMARIA_MATEMATICA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'matematica',
    'Matematica',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-matematica', label: 'Matematica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_SECONDARIA_MATEMATICA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'matematica',
    'Matematica',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-matematica', label: 'Matematica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_PRIMARIA_SCIENZE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'scienze',
    'Scienze',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-scienze', label: 'Scienze' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_SECONDARIA_SCIENZE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'scienze',
    'Scienze',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-scienze', label: 'Scienze' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_PRIMARIA_TECNOLOGIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'tecnologia',
    'Tecnologia',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-tecnologia', label: 'Tecnologia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_SECONDARIA_TECNOLOGIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'tecnologia',
    'Tecnologia',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-tecnologia', label: 'Tecnologia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const NODES_2012_PRIMARIA_MATEMATICA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_MATEMATICA[0].id, SEGMENTS_2012_PRIMARIA_MATEMATICA[0].title),
    'traguardo',
    'Traguardo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_MATEMATICA[0].id, SEGMENTS_2012_PRIMARIA_MATEMATICA[0].title),
    'obiettivo',
    'Obiettivo - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_MATEMATICA[0].id, SEGMENTS_2012_PRIMARIA_MATEMATICA[0].title),
    'obiettivo',
    'Obiettivo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2012_SECONDARIA_MATEMATICA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_MATEMATICA[0].id, SEGMENTS_2012_SECONDARIA_MATEMATICA[0].title),
    'traguardo',
    'Traguardo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_MATEMATICA[0].id, SEGMENTS_2012_SECONDARIA_MATEMATICA[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2012_PRIMARIA_SCIENZE = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_SCIENZE[0].id, SEGMENTS_2012_PRIMARIA_SCIENZE[0].title),
    'traguardo',
    'Traguardo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_SCIENZE[0].id, SEGMENTS_2012_PRIMARIA_SCIENZE[0].title),
    'obiettivo',
    'Obiettivo - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_SCIENZE[0].id, SEGMENTS_2012_PRIMARIA_SCIENZE[0].title),
    'obiettivo',
    'Obiettivo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2012_SECONDARIA_SCIENZE = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_SCIENZE[0].id, SEGMENTS_2012_SECONDARIA_SCIENZE[0].title),
    'traguardo',
    'Traguardo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_SCIENZE[0].id, SEGMENTS_2012_SECONDARIA_SCIENZE[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2012_PRIMARIA_TECNOLOGIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_TECNOLOGIA[0].id, SEGMENTS_2012_PRIMARIA_TECNOLOGIA[0].title),
    'traguardo',
    'Traguardo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_TECNOLOGIA[0].id, SEGMENTS_2012_PRIMARIA_TECNOLOGIA[0].title),
    'obiettivo',
    'Obiettivo - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_TECNOLOGIA[0].id, SEGMENTS_2012_PRIMARIA_TECNOLOGIA[0].title),
    'obiettivo',
    'Obiettivo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2012_SECONDARIA_TECNOLOGIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_TECNOLOGIA[0].id, SEGMENTS_2012_SECONDARIA_TECNOLOGIA[0].title),
    'traguardo',
    'Traguardo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_TECNOLOGIA[0].id, SEGMENTS_2012_SECONDARIA_TECNOLOGIA[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2012_PRIMARIA_INGLESE = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_INGLESE[0].id, SEGMENTS_2012_PRIMARIA_INGLESE[0].title),
    'traguardo',
    'Traguardo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_INGLESE[0].id, SEGMENTS_2012_PRIMARIA_INGLESE[0].title),
    'obiettivo',
    'Obiettivo - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_INGLESE[0].id, SEGMENTS_2012_PRIMARIA_INGLESE[0].title),
    'obiettivo',
    'Obiettivo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2012_SECONDARIA_INGLESE = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_INGLESE[0].id, SEGMENTS_2012_SECONDARIA_INGLESE[0].title),
    'traguardo',
    'Traguardo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_INGLESE[0].id, SEGMENTS_2012_SECONDARIA_INGLESE[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2012_PRIMARIA_SECONDA_LINGUA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA[0].id, SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA[0].title),
    'traguardo',
    'Traguardo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA[0].id, SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA[0].title),
    'obiettivo',
    'Obiettivo - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA[0].id, SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA[0].title),
    'obiettivo',
    'Obiettivo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2012_SECONDARIA_SECONDA_LINGUA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA[0].id, SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA[0].title),
    'traguardo',
    'Traguardo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA[0].id, SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2012_PRIMARIA_STORIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_STORIA[0].id, SEGMENTS_2012_PRIMARIA_STORIA[0].title),
    'traguardo',
    'Traguardo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_STORIA[0].id, SEGMENTS_2012_PRIMARIA_STORIA[0].title),
    'obiettivo',
    'Obiettivo - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_STORIA[0].id, SEGMENTS_2012_PRIMARIA_STORIA[0].title),
    'obiettivo',
    'Obiettivo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2012_SECONDARIA_STORIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_STORIA[0].id, SEGMENTS_2012_SECONDARIA_STORIA[0].title),
    'traguardo',
    'Traguardo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_STORIA[0].id, SEGMENTS_2012_SECONDARIA_STORIA[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2012_PRIMARIA_GEOGRAFIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_GEOGRAFIA[0].id, SEGMENTS_2012_PRIMARIA_GEOGRAFIA[0].title),
    'traguardo',
    'Traguardo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_GEOGRAFIA[0].id, SEGMENTS_2012_PRIMARIA_GEOGRAFIA[0].title),
    'obiettivo',
    'Obiettivo - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_GEOGRAFIA[0].id, SEGMENTS_2012_PRIMARIA_GEOGRAFIA[0].title),
    'obiettivo',
    'Obiettivo - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2012_SECONDARIA_GEOGRAFIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_GEOGRAFIA[0].id, SEGMENTS_2012_SECONDARIA_GEOGRAFIA[0].title),
    'traguardo',
    'Traguardo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_GEOGRAFIA[0].id, SEGMENTS_2012_SECONDARIA_GEOGRAFIA[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const fixture2012 = {
  SOURCE_2012,
  SOURCE_VERSION_2012,
  SOURCE_REF,
  VERSION_2012_INFANZIA,
  VERSION_2012_PRIMARIA,
  VERSION_2012_SECONDARIA,
  SEGMENTS_2012_INFANZIA,
  SEGMENTS_2012_PRIMARIA,
  SEGMENTS_2012_PRIMARIA_INGLESE,
  SEGMENTS_2012_PRIMARIA_SECONDA_LINGUA,
  SEGMENTS_2012_PRIMARIA_STORIA,
  SEGMENTS_2012_PRIMARIA_GEOGRAFIA,
  SEGMENTS_2012_PRIMARIA_MATEMATICA,
  SEGMENTS_2012_PRIMARIA_SCIENZE,
  SEGMENTS_2012_PRIMARIA_TECNOLOGIA,
  SEGMENTS_2012_SECONDARIA,
  SEGMENTS_2012_SECONDARIA_INGLESE,
  SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA,
  SEGMENTS_2012_SECONDARIA_STORIA,
  SEGMENTS_2012_SECONDARIA_GEOGRAFIA,
  SEGMENTS_2012_SECONDARIA_MATEMATICA,
  SEGMENTS_2012_SECONDARIA_SCIENZE,
  SEGMENTS_2012_SECONDARIA_TECNOLOGIA,
  NODES_2012_INFANZIA,
  NODES_2012_PRIMARIA,
  NODES_2012_PRIMARIA_INGLESE,
  NODES_2012_PRIMARIA_SECONDA_LINGUA,
  NODES_2012_PRIMARIA_STORIA,
  NODES_2012_PRIMARIA_GEOGRAFIA,
  NODES_2012_PRIMARIA_MATEMATICA,
  NODES_2012_PRIMARIA_SCIENZE,
  NODES_2012_PRIMARIA_TECNOLOGIA,
  NODES_2012_SECONDARIA,
  NODES_2012_SECONDARIA_INGLESE,
  NODES_2012_SECONDARIA_SECONDA_LINGUA,
  NODES_2012_SECONDARIA_STORIA,
  NODES_2012_SECONDARIA_GEOGRAFIA,
  NODES_2012_SECONDARIA_MATEMATICA,
  NODES_2012_SECONDARIA_SCIENZE,
  NODES_2012_SECONDARIA_TECNOLOGIA,
};

export type Fixture2012 = typeof fixture2012;
