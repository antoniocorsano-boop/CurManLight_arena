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
  'D.M. 2025 — Nuove Indicazioni nazionali per il curricolo',
  'normative-national',
  {
    schoolOrders: ['primaria', 'secondaria'],
    disciplines: ['italiano', 'musica'],
    isNational: true,
  },
  {
    authority: "Ministero dell'Istruzione",
    issuedAt: '2025-01-01',
    versionLabel: 'D.M. 2025',
    status: 'active',
    origin: 'normative-source',
    now: '2026-08-18T00:00:00.000Z',
  }
);

export const SOURCE_VERSION_2025 = createSourceVersion(
  createSourceReference(SOURCE_2025.id),
  1,
  {
    label: 'D.M. 2025',
    issuedAt: '2025-01-01',
    status: 'active',
    origin: 'normative-source',
    now: '2026-08-18T00:00:00.000Z',
  }
);

export const SOURCE_REF_2025 = createSourceReference(SOURCE_2025.id);

export const VERSION_2025_PRIMARIA = createCurriculumVersion(
  'Indicazioni nazionali 2025 — Primaria',
  'primaria',
  {
    disciplines: ['italiano'],
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
    disciplines: ['italiano', 'musica'],
    status: 'active',
    mainSourceRefs: [SOURCE_REF_2025],
    origin: 'normative-source',
    now: '2026-08-18T00:00:00.000Z',
  }
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

export const fixture2025 = {
  SOURCE_2025,
  SOURCE_VERSION_2025,
  SOURCE_REF_2025,
  VERSION_2025_PRIMARIA,
  VERSION_2025_SECONDARIA,
  SEGMENTS_2025_PRIMARIA_ITALIANO,
  SEGMENTS_2025_SECONDARIA_ITALIANO,
  SEGMENTS_2025_SECONDARIA_STRUMENTO_MUSICALE,
  NODES_2025_PRIMARIA_ITALIANO,
  NODES_2025_SECONDARIA_ITALIANO,
};

export type Fixture2025 = typeof fixture2025;
