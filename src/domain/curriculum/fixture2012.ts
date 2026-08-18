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
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_INFANZIA.id, VERSION_2012_INFANZIA.title),
    'infanzia',
    null,
    'I bambini, le famiglie, i docenti, l\'ambiente di apprendimento',
    {
      sourceArea: { kind: 'general-section', code: 'in2012-infanzia-bambini-famiglie', label: 'I bambini, le famiglie, i docenti, l\'ambiente di apprendimento' },
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
    'Dalla scuola dell\'infanzia alla scuola primaria',
    {
      sourceArea: { kind: 'general-section', code: 'in2012-infanzia-transizione-primaria', label: 'Dalla scuola dell\'infanzia alla scuola primaria' },
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
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'musica',
    'Musica',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-musica', label: 'Musica' },
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
    'arte',
    'Arte e immagine',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-arte-immagine', label: 'Arte e immagine' },
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
    'educazione-fisica',
    'Educazione fisica',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-educazione-fisica', label: 'Educazione fisica' },
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
    null,
    'Il senso dell\'esperienza educativa',
    {
      sourceArea: { kind: 'general-section', code: 'in2012-primaria-senso-esperienza', label: 'Il senso dell\'esperienza educativa' },
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
    null,
    'L\'alfabetizzazione culturale di base',
    {
      sourceArea: { kind: 'general-section', code: 'in2012-primaria-alfabetizzazione-culturale', label: 'L\'alfabetizzazione culturale di base' },
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
    null,
    'L\'ambiente di apprendimento',
    {
      sourceArea: { kind: 'general-section', code: 'in2012-primaria-ambiente-apprendimento', label: 'L\'ambiente di apprendimento' },
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
    null,
    'Cittadinanza e Costituzione',
    {
      sourceArea: { kind: 'transversal-area', code: 'in2012-primaria-cittadinanza-costituzione', label: 'Cittadinanza e Costituzione' },
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
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'musica',
    'Musica',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-musica', label: 'Musica' },
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
    'arte',
    'Arte e immagine',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-arte-immagine', label: 'Arte e immagine' },
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
    'educazione-fisica',
    'Educazione fisica',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-educazione-fisica', label: 'Educazione fisica' },
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
    null,
    'Il senso dell\'esperienza educativa',
    {
      sourceArea: { kind: 'general-section', code: 'in2012-secondaria-senso-esperienza', label: 'Il senso dell\'esperienza educativa' },
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
    null,
    'L\'alfabetizzazione culturale di base',
    {
      sourceArea: { kind: 'general-section', code: 'in2012-secondaria-alfabetizzazione-culturale', label: 'L\'alfabetizzazione culturale di base' },
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
    null,
    'L\'ambiente di apprendimento',
    {
      sourceArea: { kind: 'general-section', code: 'in2012-secondaria-ambiente-apprendimento', label: 'L\'ambiente di apprendimento' },
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
    null,
    'Cittadinanza e Costituzione',
    {
      sourceArea: { kind: 'transversal-area', code: 'in2012-secondaria-cittadinanza-costituzione', label: 'Cittadinanza e Costituzione' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const NODES_2012_INFANZIA = SEGMENTS_2012_INFANZIA.filter(
  segment => segment.sourceArea?.kind === 'experience-field'
).map((segment) =>
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

export const SEGMENTS_2012_PRIMARIA_MUSICA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'musica',
    'Musica',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-musica', label: 'Musica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_SECONDARIA_MUSICA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'musica',
    'Musica',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-musica', label: 'Musica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_PRIMARIA_ARTE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'arte',
    'Arte e immagine',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-arte-immagine', label: 'Arte e immagine' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_SECONDARIA_ARTE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'arte',
    'Arte e immagine',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-arte-immagine', label: 'Arte e immagine' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    'primaria',
    'educazione-fisica',
    'Educazione fisica',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-educazione-fisica', label: 'Educazione fisica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF],
      origin: 'normative-source',
      now: '2026-08-17T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2012_SECONDARIA_EDUCAZIONE_FISICA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    'secondaria',
    'educazione-fisica',
    'Educazione fisica',
    {
      sourceArea: { kind: 'discipline', code: 'in2012-educazione-fisica', label: 'Educazione fisica' },
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

export const NODES_2012_PRIMARIA_MUSICA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_MUSICA[0].id, SEGMENTS_2012_PRIMARIA_MUSICA[0].title),
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
    createSegmentReference(SEGMENTS_2012_PRIMARIA_MUSICA[0].id, SEGMENTS_2012_PRIMARIA_MUSICA[0].title),
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
    createSegmentReference(SEGMENTS_2012_PRIMARIA_MUSICA[0].id, SEGMENTS_2012_PRIMARIA_MUSICA[0].title),
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

export const NODES_2012_SECONDARIA_MUSICA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_MUSICA[0].id, SEGMENTS_2012_SECONDARIA_MUSICA[0].title),
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
    createSegmentReference(SEGMENTS_2012_SECONDARIA_MUSICA[0].id, SEGMENTS_2012_SECONDARIA_MUSICA[0].title),
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

export const NODES_2012_PRIMARIA_ARTE = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_ARTE[0].id, SEGMENTS_2012_PRIMARIA_ARTE[0].title),
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
    createSegmentReference(SEGMENTS_2012_PRIMARIA_ARTE[0].id, SEGMENTS_2012_PRIMARIA_ARTE[0].title),
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
    createSegmentReference(SEGMENTS_2012_PRIMARIA_ARTE[0].id, SEGMENTS_2012_PRIMARIA_ARTE[0].title),
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

export const NODES_2012_SECONDARIA_ARTE = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_ARTE[0].id, SEGMENTS_2012_SECONDARIA_ARTE[0].title),
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
    createSegmentReference(SEGMENTS_2012_SECONDARIA_ARTE[0].id, SEGMENTS_2012_SECONDARIA_ARTE[0].title),
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

export const NODES_2012_PRIMARIA_EDUCAZIONE_FISICA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_PRIMARIA.id, VERSION_2012_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA[0].id, SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA[0].title),
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
    createSegmentReference(SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA[0].id, SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA[0].title),
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
    createSegmentReference(SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA[0].id, SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA[0].title),
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

export const NODES_2012_SECONDARIA_EDUCAZIONE_FISICA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2012_SECONDARIA.id, VERSION_2012_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2012_SECONDARIA_EDUCAZIONE_FISICA[0].id, SEGMENTS_2012_SECONDARIA_EDUCAZIONE_FISICA[0].title),
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
    createSegmentReference(SEGMENTS_2012_SECONDARIA_EDUCAZIONE_FISICA[0].id, SEGMENTS_2012_SECONDARIA_EDUCAZIONE_FISICA[0].title),
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

export const REPRESENTATION_GAPS_2012 = [
  {
    id: 'gap-2012-macrostructure-cultura-scuola-persona',
    reason: 'Macrostructure section spanning all school orders without a specific school order anchor; cannot be faithfully represented as a curriculum segment tied to a single version.',
    sourceReference: 'D.M. 254/2012 — Cultura scuola persona',
  },
  {
    id: 'gap-2012-macrostructure-finalita-generali',
    reason: 'Macrostructure section spanning all school orders without a specific school order anchor; cannot be faithfully represented as a curriculum segment tied to a single version.',
    sourceReference: 'D.M. 254/2012 — Finalità generali',
  },
  {
    id: 'gap-2012-macrostructure-organizzazione-curricolo',
    reason: 'Macrostructure section spanning all school orders without a specific school order anchor; cannot be faithfully represented as a curriculum segment tied to a single version.',
    sourceReference: 'D.M. 254/2012 — L\'organizzazione del curricolo',
  },
  {
    id: 'gap-2012-narrative-framing-text',
    reason: 'Narrative framing and pedagogical orientation text within general sections does not map to any CurriculumNodeType without falsification. Source-native role is orientation, not competence target or objective.',
    sourceReference: 'D.M. 254/2012 — general sections narrative text',
  },
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
  SEGMENTS_2012_PRIMARIA_MUSICA,
  SEGMENTS_2012_PRIMARIA_ARTE,
  SEGMENTS_2012_PRIMARIA_EDUCAZIONE_FISICA,
  SEGMENTS_2012_SECONDARIA,
  SEGMENTS_2012_SECONDARIA_INGLESE,
  SEGMENTS_2012_SECONDARIA_SECONDA_LINGUA,
  SEGMENTS_2012_SECONDARIA_STORIA,
  SEGMENTS_2012_SECONDARIA_GEOGRAFIA,
  SEGMENTS_2012_SECONDARIA_MATEMATICA,
  SEGMENTS_2012_SECONDARIA_SCIENZE,
  SEGMENTS_2012_SECONDARIA_TECNOLOGIA,
  SEGMENTS_2012_SECONDARIA_MUSICA,
  SEGMENTS_2012_SECONDARIA_ARTE,
  SEGMENTS_2012_SECONDARIA_EDUCAZIONE_FISICA,
  NODES_2012_INFANZIA,
  NODES_2012_PRIMARIA,
  NODES_2012_PRIMARIA_INGLESE,
  NODES_2012_PRIMARIA_SECONDA_LINGUA,
  NODES_2012_PRIMARIA_STORIA,
  NODES_2012_PRIMARIA_GEOGRAFIA,
  NODES_2012_PRIMARIA_MATEMATICA,
  NODES_2012_PRIMARIA_SCIENZE,
  NODES_2012_PRIMARIA_TECNOLOGIA,
  NODES_2012_PRIMARIA_MUSICA,
  NODES_2012_PRIMARIA_ARTE,
  NODES_2012_PRIMARIA_EDUCAZIONE_FISICA,
  NODES_2012_SECONDARIA,
  NODES_2012_SECONDARIA_INGLESE,
  NODES_2012_SECONDARIA_SECONDA_LINGUA,
  NODES_2012_SECONDARIA_STORIA,
  NODES_2012_SECONDARIA_GEOGRAFIA,
  NODES_2012_SECONDARIA_MATEMATICA,
  NODES_2012_SECONDARIA_SCIENZE,
  NODES_2012_SECONDARIA_TECNOLOGIA,
  NODES_2012_SECONDARIA_MUSICA,
  NODES_2012_SECONDARIA_ARTE,
  NODES_2012_SECONDARIA_EDUCAZIONE_FISICA,
  representationGaps: REPRESENTATION_GAPS_2012,
};

export type Fixture2012 = typeof fixture2012;

export interface RepresentationGap {
  id: string;
  reason: string;
  sourceReference: string;
}
