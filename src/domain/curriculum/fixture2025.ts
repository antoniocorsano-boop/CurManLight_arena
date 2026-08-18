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

export const SOURCE_2025 = createSource(
  'D.M. 9 dicembre 2025, n. 221 — Nuove Indicazioni nazionali per il curricolo',
  'normative-national',
  {
    schoolOrders: ['infanzia', 'primaria', 'secondaria'],
    disciplines: ['italiano', 'musica'],
    isNational: true,
  },
  {
    authority: "Ministero dell'Istruzione",
    issuedAt: '2025-12-09',
    versionLabel: 'D.M. 221/2025',
    status: 'active',
    origin: 'normative-source',
    now: '2026-08-18T00:00:00.000Z',
  }
);

export const SOURCE_VERSION_2025 = createSourceVersion(
  createSourceReference(SOURCE_2025.id),
  1,
  {
    label: 'D.M. 221/2025',
    issuedAt: '2025-12-09',
    status: 'active',
    origin: 'normative-source',
    now: '2026-08-18T00:00:00.000Z',
  }
);

export const SOURCE_REF_2025 = createSourceReference(SOURCE_2025.id);

export const VERSION_2025_INFANZIA = createCurriculumVersion(
  'Indicazioni nazionali 2025 — Infanzia',
  'infanzia',
  {
    status: 'active',
    mainSourceRefs: [SOURCE_REF_2025],
    origin: 'normative-source',
    now: '2026-08-18T00:00:00.000Z',
  }
);

export const VERSION_2025_PRIMARIA = createCurriculumVersion(
  'Indicazioni nazionali 2025 — Primaria',
  'primaria',
  {
    disciplines: ['italiano', 'inglese'],
    status: 'active',
    mainSourceRefs: [SOURCE_REF_2025],
    origin: 'normative-source',
    now: '2026-08-18T00:00:00.000Z',
  }
);

export const VERSION_2025_SECONDARIA = createCurriculumVersion(
  'Indicazioni nazionali 2025 — Secondaria',
  'secondaria',
  {
    disciplines: ['italiano', 'latino', 'inglese', 'seconda-lingua', 'musica'],
    status: 'active',
    mainSourceRefs: [SOURCE_REF_2025],
    origin: 'normative-source',
    now: '2026-08-18T00:00:00.000Z',
  }
);

export const SEGMENTS_2025_INFANZIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_INFANZIA.id, VERSION_2025_INFANZIA.title),
    'infanzia',
    null,
    'Il sé e l\'altro',
    {
      sourceArea: { kind: 'experience-field', code: 'in2025-infanzia-se-altro', label: 'Il sé e l\'altro' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_INFANZIA.id, VERSION_2025_INFANZIA.title),
    'infanzia',
    null,
    'Il corpo e il movimento',
    {
      sourceArea: { kind: 'experience-field', code: 'in2025-infanzia-corpo-movimento', label: 'Il corpo e il movimento' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_INFANZIA.id, VERSION_2025_INFANZIA.title),
    'infanzia',
    null,
    'Immagini, suoni e colori',
    {
      sourceArea: { kind: 'experience-field', code: 'in2025-infanzia-immagini-suoni-colori', label: 'Immagini, suoni e colori' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_INFANZIA.id, VERSION_2025_INFANZIA.title),
    'infanzia',
    null,
    'I discorsi e le parole',
    {
      sourceArea: { kind: 'experience-field', code: 'in2025-infanzia-discorsi-parole', label: 'I discorsi e le parole' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_INFANZIA.id, VERSION_2025_INFANZIA.title),
    'infanzia',
    null,
    'La conoscenza del mondo',
    {
      sourceArea: { kind: 'experience-field', code: 'in2025-infanzia-conoscenza-mondo', label: 'La conoscenza del mondo' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_INFANZIA.id, VERSION_2025_INFANZIA.title),
    'infanzia',
    null,
    'Dalla scuola dell\'infanzia alla scuola primaria',
    {
      sourceArea: { kind: 'general-section', code: 'in2025-infanzia-transizione-primaria', label: 'Dalla scuola dell\'infanzia alla scuola primaria' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const NODES_2025_INFANZIA = SEGMENTS_2025_INFANZIA.filter(
  segment => segment.sourceArea?.kind === 'experience-field'
).map((segment) =>
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_INFANZIA.id, VERSION_2025_INFANZIA.title),
    createSegmentReference(segment.id, segment.title),
    'traguardo',
    `Traguardo - ${segment.title}`,
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-infanzia',
    }
  )
);

export const SEGMENTS_2025_PRIMARIA_ITALIANO = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    'primaria',
    'italiano',
    'Italiano',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-italiano', label: 'Italiano' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_PRIMARIA_INGLESE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    'primaria',
    'inglese',
    'Inglese',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-inglese', label: 'Inglese' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_SECONDARIA_ITALIANO = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    'secondaria',
    'italiano',
    'Italiano',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-italiano', label: 'Italiano' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_SECONDARIA_INGLESE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    'secondaria',
    'inglese',
    'Inglese',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-inglese', label: 'Inglese' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_SECONDARIA_STRUMENTO_MUSICALE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    'secondaria',
    'musica',
    'Strumento musicale',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-strumento-musicale', label: 'Strumento musicale' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      frameworkApplicability: {
        framework: 'IN2025',
        resolutionStatus: 'resolved',
        resolutionReason: 'Percorso ad indirizzo musicale',
        cohortEntryYear: 2026,
      },
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_SECONDARIA_LATINO = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    'secondaria',
    'latino',
    'Latino',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-latino', label: 'Latino' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const NODES_2025_PRIMARIA_ITALIANO = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_ITALIANO[0].id, SEGMENTS_2025_PRIMARIA_ITALIANO[0].title),
    'competenza',
    'Competenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_ITALIANO[0].id, SEGMENTS_2025_PRIMARIA_ITALIANO[0].title),
    'obiettivo',
    'Obiettivo OSA 2025 - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
      normativeNodeKind: 'osa-2025',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_ITALIANO[0].id, SEGMENTS_2025_PRIMARIA_ITALIANO[0].title),
    'conoscenza',
    'Conoscenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2025_PRIMARIA_INGLESE = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_INGLESE[0].id, SEGMENTS_2025_PRIMARIA_INGLESE[0].title),
    'competenza',
    'Competenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_INGLESE[0].id, SEGMENTS_2025_PRIMARIA_INGLESE[0].title),
    'obiettivo',
    'Obiettivo OSA 2025 - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
      normativeNodeKind: 'osa-2025',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_INGLESE[0].id, SEGMENTS_2025_PRIMARIA_INGLESE[0].title),
    'conoscenza',
    'Conoscenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2025_SECONDARIA_ITALIANO = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_ITALIANO[0].id, SEGMENTS_2025_SECONDARIA_ITALIANO[0].title),
    'competenza',
    'Competenza - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2025_SECONDARIA_INGLESE = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_INGLESE[0].id, SEGMENTS_2025_SECONDARIA_INGLESE[0].title),
    'competenza',
    'Competenza - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2025_SECONDARIA_LATINO = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_LATINO[0].id, SEGMENTS_2025_SECONDARIA_LATINO[0].title),
    'competenza',
    'Competenza - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_LATINO[0].id, SEGMENTS_2025_SECONDARIA_LATINO[0].title),
    'obiettivo',
    'Obiettivo LEL - classe II',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
      normativeNodeKind: 'osa-2025',
    }
  ),
];

export const SEGMENTS_2025_PRIMARIA_STORIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    'primaria',
    'storia',
    'Storia',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-storia', label: 'Storia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_SECONDARIA_STORIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    'secondaria',
    'storia',
    'Storia',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-storia', label: 'Storia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_PRIMARIA_GEOGRAFIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    'primaria',
    'geografia',
    'Geografia',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-geografia', label: 'Geografia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_SECONDARIA_GEOGRAFIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    'secondaria',
    'geografia',
    'Geografia',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-geografia', label: 'Geografia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const NODES_2025_PRIMARIA_STORIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_STORIA[0].id, SEGMENTS_2025_PRIMARIA_STORIA[0].title),
    'competenza',
    'Competenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_STORIA[0].id, SEGMENTS_2025_PRIMARIA_STORIA[0].title),
    'obiettivo',
    'Obiettivo OSA 2025 - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
      normativeNodeKind: 'osa-2025',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_STORIA[0].id, SEGMENTS_2025_PRIMARIA_STORIA[0].title),
    'conoscenza',
    'Conoscenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2025_SECONDARIA_STORIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_STORIA[0].id, SEGMENTS_2025_SECONDARIA_STORIA[0].title),
    'competenza',
    'Competenza - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_STORIA[0].id, SEGMENTS_2025_SECONDARIA_STORIA[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2025_PRIMARIA_GEOGRAFIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_GEOGRAFIA[0].id, SEGMENTS_2025_PRIMARIA_GEOGRAFIA[0].title),
    'competenza',
    'Competenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_GEOGRAFIA[0].id, SEGMENTS_2025_PRIMARIA_GEOGRAFIA[0].title),
    'obiettivo',
    'Obiettivo OSA 2025 - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
      normativeNodeKind: 'osa-2025',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_GEOGRAFIA[0].id, SEGMENTS_2025_PRIMARIA_GEOGRAFIA[0].title),
    'conoscenza',
    'Conoscenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2025_SECONDARIA_GEOGRAFIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_GEOGRAFIA[0].id, SEGMENTS_2025_SECONDARIA_GEOGRAFIA[0].title),
    'competenza',
    'Competenza - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_GEOGRAFIA[0].id, SEGMENTS_2025_SECONDARIA_GEOGRAFIA[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const SEGMENTS_2025_PRIMARIA_MATEMATICA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    'primaria',
    'matematica',
    'Matematica',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-matematica', label: 'Matematica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_SECONDARIA_MATEMATICA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    'secondaria',
    'matematica',
    'Matematica',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-matematica', label: 'Matematica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_PRIMARIA_SCIENZE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    'primaria',
    'scienze',
    'Scienze',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-scienze', label: 'Scienze' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_SECONDARIA_SCIENZE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    'secondaria',
    'scienze',
    'Scienze',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-scienze', label: 'Scienze' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_PRIMARIA_TECNOLOGIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    'primaria',
    'tecnologia',
    'Tecnologia',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-tecnologia', label: 'Tecnologia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_SECONDARIA_TECNOLOGIA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    'secondaria',
    'tecnologia',
    'Tecnologia',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-tecnologia', label: 'Tecnologia' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_PRIMARIA_MUSICA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    'primaria',
    'musica',
    'Musica',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-musica', label: 'Musica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_SECONDARIA_MUSICA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    'secondaria',
    'musica',
    'Musica',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-musica', label: 'Musica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_PRIMARIA_ARTE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    'primaria',
    'arte',
    'Arte e immagine',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-arte', label: 'Arte e immagine' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_SECONDARIA_ARTE = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    'secondaria',
    'arte',
    'Arte e immagine',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-arte', label: 'Arte e immagine' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    'primaria',
    'educazione-fisica',
    'Educazione fisica',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-educazione-fisica', label: 'Educazione fisica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA = [
  createCurriculumSegment(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    'secondaria',
    'educazione-fisica',
    'Educazione fisica',
    {
      sourceArea: { kind: 'discipline', code: 'in2025-educazione-fisica', label: 'Educazione fisica' },
      status: 'complete',
      completeness: 'complete',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
    }
  ),
];

export const NODES_2025_PRIMARIA_MATEMATICA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_MATEMATICA[0].id, SEGMENTS_2025_PRIMARIA_MATEMATICA[0].title),
    'competenza',
    'Competenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_MATEMATICA[0].id, SEGMENTS_2025_PRIMARIA_MATEMATICA[0].title),
    'obiettivo',
    'Obiettivo OSA 2025 - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
      normativeNodeKind: 'osa-2025',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_MATEMATICA[0].id, SEGMENTS_2025_PRIMARIA_MATEMATICA[0].title),
    'conoscenza',
    'Conoscenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2025_SECONDARIA_MATEMATICA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_MATEMATICA[0].id, SEGMENTS_2025_SECONDARIA_MATEMATICA[0].title),
    'competenza',
    'Competenza - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_MATEMATICA[0].id, SEGMENTS_2025_SECONDARIA_MATEMATICA[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2025_PRIMARIA_SCIENZE = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_SCIENZE[0].id, SEGMENTS_2025_PRIMARIA_SCIENZE[0].title),
    'competenza',
    'Competenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_SCIENZE[0].id, SEGMENTS_2025_PRIMARIA_SCIENZE[0].title),
    'obiettivo',
    'Obiettivo OSA 2025 - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
      normativeNodeKind: 'osa-2025',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_SCIENZE[0].id, SEGMENTS_2025_PRIMARIA_SCIENZE[0].title),
    'conoscenza',
    'Conoscenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2025_SECONDARIA_SCIENZE = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_SCIENZE[0].id, SEGMENTS_2025_SECONDARIA_SCIENZE[0].title),
    'competenza',
    'Competenza - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_SCIENZE[0].id, SEGMENTS_2025_SECONDARIA_SCIENZE[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2025_PRIMARIA_TECNOLOGIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_TECNOLOGIA[0].id, SEGMENTS_2025_PRIMARIA_TECNOLOGIA[0].title),
    'competenza',
    'Competenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_TECNOLOGIA[0].id, SEGMENTS_2025_PRIMARIA_TECNOLOGIA[0].title),
    'obiettivo',
    'Obiettivo OSA 2025 - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
      normativeNodeKind: 'osa-2025',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_TECNOLOGIA[0].id, SEGMENTS_2025_PRIMARIA_TECNOLOGIA[0].title),
    'conoscenza',
    'Conoscenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2025_SECONDARIA_TECNOLOGIA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_TECNOLOGIA[0].id, SEGMENTS_2025_SECONDARIA_TECNOLOGIA[0].title),
    'competenza',
    'Competenza - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_TECNOLOGIA[0].id, SEGMENTS_2025_SECONDARIA_TECNOLOGIA[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2025_PRIMARIA_MUSICA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_MUSICA[0].id, SEGMENTS_2025_PRIMARIA_MUSICA[0].title),
    'competenza',
    'Competenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_MUSICA[0].id, SEGMENTS_2025_PRIMARIA_MUSICA[0].title),
    'obiettivo',
    'Obiettivo OSA 2025 - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
      normativeNodeKind: 'osa-2025',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_MUSICA[0].id, SEGMENTS_2025_PRIMARIA_MUSICA[0].title),
    'conoscenza',
    'Conoscenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2025_SECONDARIA_MUSICA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_MUSICA[0].id, SEGMENTS_2025_SECONDARIA_MUSICA[0].title),
    'competenza',
    'Competenza - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_MUSICA[0].id, SEGMENTS_2025_SECONDARIA_MUSICA[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2025_PRIMARIA_ARTE = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_ARTE[0].id, SEGMENTS_2025_PRIMARIA_ARTE[0].title),
    'competenza',
    'Competenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_ARTE[0].id, SEGMENTS_2025_PRIMARIA_ARTE[0].title),
    'obiettivo',
    'Obiettivo OSA 2025 - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
      normativeNodeKind: 'osa-2025',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_ARTE[0].id, SEGMENTS_2025_PRIMARIA_ARTE[0].title),
    'conoscenza',
    'Conoscenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2025_SECONDARIA_ARTE = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_ARTE[0].id, SEGMENTS_2025_SECONDARIA_ARTE[0].title),
    'competenza',
    'Competenza - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_ARTE[0].id, SEGMENTS_2025_SECONDARIA_ARTE[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const NODES_2025_PRIMARIA_EDUCAZIONE_FISICA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA[0].id, SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA[0].title),
    'competenza',
    'Competenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA[0].id, SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA[0].title),
    'obiettivo',
    'Obiettivo OSA 2025 - classe III',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary-grade-3',
      normativeNodeKind: 'osa-2025',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_PRIMARIA.id, VERSION_2025_PRIMARIA.title),
    createSegmentReference(SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA[0].id, SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA[0].title),
    'conoscenza',
    'Conoscenza - fine primaria',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-primary',
    }
  ),
];

export const NODES_2025_SECONDARIA_EDUCAZIONE_FISICA = [
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA[0].id, SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA[0].title),
    'competenza',
    'Competenza - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
  createCurriculumNode(
    createCurriculumVersionReference(VERSION_2025_SECONDARIA.id, VERSION_2025_SECONDARIA.title),
    createSegmentReference(SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA[0].id, SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA[0].title),
    'obiettivo',
    'Obiettivo - fine secondaria I grado',
    {
      status: 'active',
      provenance: 'normative',
      sourceRefs: [SOURCE_REF_2025],
      origin: 'normative-source',
      now: '2026-08-18T00:00:00.000Z',
      normativeCheckpoint: 'end-lower-secondary',
    }
  ),
];

export const fixture2025 = {
  SOURCE_2025,
  SOURCE_VERSION_2025,
  SOURCE_REF_2025,
  VERSION_2025_INFANZIA,
  VERSION_2025_PRIMARIA,
  VERSION_2025_SECONDARIA,
  SEGMENTS_2025_INFANZIA,
  SEGMENTS_2025_PRIMARIA_ITALIANO,
  SEGMENTS_2025_PRIMARIA_INGLESE,
  SEGMENTS_2025_PRIMARIA_STORIA,
  SEGMENTS_2025_PRIMARIA_GEOGRAFIA,
  SEGMENTS_2025_PRIMARIA_MATEMATICA,
  SEGMENTS_2025_PRIMARIA_SCIENZE,
  SEGMENTS_2025_PRIMARIA_TECNOLOGIA,
  SEGMENTS_2025_PRIMARIA_MUSICA,
  SEGMENTS_2025_PRIMARIA_ARTE,
  SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA,
  SEGMENTS_2025_SECONDARIA_ITALIANO,
  SEGMENTS_2025_SECONDARIA_INGLESE,
  SEGMENTS_2025_SECONDARIA_STRUMENTO_MUSICALE,
  SEGMENTS_2025_SECONDARIA_LATINO,
  SEGMENTS_2025_SECONDARIA_STORIA,
  SEGMENTS_2025_SECONDARIA_GEOGRAFIA,
  SEGMENTS_2025_SECONDARIA_MATEMATICA,
  SEGMENTS_2025_SECONDARIA_SCIENZE,
  SEGMENTS_2025_SECONDARIA_TECNOLOGIA,
  SEGMENTS_2025_SECONDARIA_MUSICA,
  SEGMENTS_2025_SECONDARIA_ARTE,
  SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA,
  NODES_2025_INFANZIA,
  NODES_2025_PRIMARIA_ITALIANO,
  NODES_2025_PRIMARIA_INGLESE,
  NODES_2025_PRIMARIA_STORIA,
  NODES_2025_PRIMARIA_GEOGRAFIA,
  NODES_2025_PRIMARIA_MATEMATICA,
  NODES_2025_PRIMARIA_SCIENZE,
  NODES_2025_PRIMARIA_TECNOLOGIA,
  NODES_2025_PRIMARIA_MUSICA,
  NODES_2025_PRIMARIA_ARTE,
  NODES_2025_PRIMARIA_EDUCAZIONE_FISICA,
  NODES_2025_SECONDARIA_ITALIANO,
  NODES_2025_SECONDARIA_INGLESE,
  NODES_2025_SECONDARIA_LATINO,
  NODES_2025_SECONDARIA_STORIA,
  NODES_2025_SECONDARIA_GEOGRAFIA,
  NODES_2025_SECONDARIA_MATEMATICA,
  NODES_2025_SECONDARIA_SCIENZE,
  NODES_2025_SECONDARIA_TECNOLOGIA,
  NODES_2025_SECONDARIA_MUSICA,
  NODES_2025_SECONDARIA_ARTE,
  NODES_2025_SECONDARIA_EDUCAZIONE_FISICA,
};

export type Fixture2025 = typeof fixture2025;
