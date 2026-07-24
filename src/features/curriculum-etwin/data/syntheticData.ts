/**
 * CML-630C — Curriculum e-Twin Domain Validation Prototype
 *
 * Dati sintetici per la validazione del modello di dominio.
 * Tre scenari: continuità disciplinare, relazione interdisciplinare,
 * discontinuità/revisione.
 */

import type {
  InstituteCurriculumVersion,
  CurriculumSegment,
  CurriculumNode,
  VerticalCurriculumLink,
} from '../domain/types';

// ─── Scenario 1: Continuità Matematica Primaria→Secondaria ───

export const scenario1Version: InstituteCurriculumVersion = {
  id: 'version-scenario-1',
  title: 'Curricolo Verticale Matematica 2026-2028',
  versionNumber: 1,
  effectivePeriod: '2026/2027 - 2027/2028',
  status: 'approved',
  createdAt: '2026-06-15T10:00:00.000Z',
  updatedAt: '2026-07-01T14:30:00.000Z',
  approvedAt: '2026-07-01T14:30:00.000Z',
};

export const scenario1Segments: CurriculumSegment[] = [
  {
    id: 'seg-mat-prim-5',
    curriculumVersionId: 'version-scenario-1',
    schoolOrder: 'primaria',
    scope: { type: 'grade', grade: '5ª' },
    disciplineOrField: 'matematica',
    applicableFramework: 'IN2025',
    institutionalContentStatus: 'effective',
    contentVersion: 3,
    updatedAt: '2026-07-01T14:30:00.000Z',
  },
  {
    id: 'seg-mat-sec-1',
    curriculumVersionId: 'version-scenario-1',
    schoolOrder: 'secondaria',
    scope: { type: 'grade', grade: '1ª' },
    disciplineOrField: 'matematica',
    applicableFramework: 'IN2025',
    institutionalContentStatus: 'effective',
    sourceSegmentId: 'seg-mat-prim-5',
    contentVersion: 3,
    updatedAt: '2026-07-01T14:30:00.000Z',
  },
];

export const scenario1Nodes: CurriculumNode[] = [
  {
    id: 'node-numeri-prim5',
    segmentId: 'seg-mat-prim-5',
    type: 'competence',
    title: 'Numeri e calcolo',
    description: 'Conoscenza dei numeri naturali, decimali e frazioni. Operazioni aritmetiche di base.',
    framework: 'IN2025',
    contentStatus: 'effective',
  },
  {
    id: 'node-geometria-prim5',
    segmentId: 'seg-mat-prim-5',
    type: 'competence',
    title: 'Geometria',
    description: 'Riconoscimento e classificazione di figure geometriche. Perimetro e area.',
    framework: 'IN2025',
    contentStatus: 'effective',
  },
  {
    id: 'node-numeri-sec1',
    segmentId: 'seg-mat-sec-1',
    type: 'competence',
    title: 'Numeri e calcolo',
    description: 'Estensione ai numeri relativi. Primi passi nell\'algebra.',
    framework: 'IN2025',
    contentStatus: 'effective',
  },
  {
    id: 'node-geometria-sec1',
    segmentId: 'seg-mat-sec-1',
    type: 'competence',
    title: 'Geometria',
    description: 'Studio delle figure piane e solide. Teoremi di Pitagora e di Tales.',
    framework: 'IN2025',
    contentStatus: 'effective',
  },
  {
    id: 'node-dati-sec1',
    segmentId: 'seg-mat-sec-1',
    type: 'competence',
    title: 'Statistica e probabilità',
    description: 'Raccolta e analisi dati. Misure di tendenza centrale.',
    framework: 'IN2025',
    contentStatus: 'effective',
  },
];

export const scenario1Links: VerticalCurriculumLink[] = [
  {
    id: 'link-numeri-continuity',
    sourceNodeId: 'node-numeri-prim5',
    targetNodeId: 'node-numeri-sec1',
    relationType: 'continuity',
    rationale: 'I numeri naturali e le operazioni di base trovano continuazione nell\'introduzione dei numeri relativi e dell\'algebra.',
    status: 'validated',
    createdByRole: 'docente',
    validatedByRole: 'dipartimento',
  },
  {
    id: 'link-geometria-development',
    sourceNodeId: 'node-geometria-prim5',
    targetNodeId: 'node-geometria-sec1',
    relationType: 'development',
    rationale: 'La conoscenza delle figure geometriche si sviluppa nello studio formale dei teoremi e delle proprietà.',
    status: 'validated',
    createdByRole: 'docente',
    validatedByRole: 'dipartimento',
  },
  {
    id: 'link-numeri-deepening',
    sourceNodeId: 'node-numeri-prim5',
    targetNodeId: 'node-dati-sec1',
    relationType: 'deepening',
    rationale: 'La padronanza dei numeri e delle operazioni è prerequisito per l\'analisi statistica.',
    status: 'proposed',
    createdByRole: 'docente',
  },
];

// ─── Scenario 2: Relazione Interdisciplinare Tecnologia→Matematica ───

export const scenario2Version: InstituteCurriculumVersion = {
  id: 'version-scenario-2',
  title: 'Curricolo Interdisciplinare Tec-Mat 2026-2028',
  versionNumber: 1,
  effectivePeriod: '2026/2027 - 2027/2028',
  status: 'under-review',
  createdAt: '2026-06-20T09:00:00.000Z',
  updatedAt: '2026-07-10T11:00:00.000Z',
};

export const scenario2Segments: CurriculumSegment[] = [
  {
    id: 'seg-tec-sec-2',
    curriculumVersionId: 'version-scenario-2',
    schoolOrder: 'secondaria',
    scope: { type: 'grade', grade: '2ª' },
    disciplineOrField: 'tecnologia',
    applicableFramework: 'IN2025',
    institutionalContentStatus: 'under-review',
    contentVersion: 2,
    updatedAt: '2026-07-10T11:00:00.000Z',
  },
  {
    id: 'seg-mat-sec-2',
    curriculumVersionId: 'version-scenario-2',
    schoolOrder: 'secondaria',
    scope: { type: 'grade', grade: '2ª' },
    disciplineOrField: 'matematica',
    applicableFramework: 'IN2025',
    institutionalContentStatus: 'effective',
    contentVersion: 3,
    updatedAt: '2026-07-01T14:30:00.000Z',
  },
];

export const scenario2Nodes: CurriculumNode[] = [
  {
    id: 'node-progettazione-tec2',
    segmentId: 'seg-tec-sec-2',
    type: 'skill',
    title: 'Progettazione digitale',
    description: 'Utilizzo di software CAD per la progettazione di oggetti tridimensionali.',
    framework: 'IN2025',
    contentStatus: 'under-review',
  },
  {
    id: 'node-geometria-mat2',
    segmentId: 'seg-mat-sec-2',
    type: 'competence',
    title: 'Geometria nello spazio',
    description: 'Rappresentazione di solidi geometrici. Piani di simmetria.',
    framework: 'IN2025',
    contentStatus: 'effective',
  },
  {
    id: 'node-misurazione-tec2',
    segmentId: 'seg-tec-sec-2',
    type: 'skill',
    title: 'Misurazione e precisione',
    description: 'Utilizzo di strumenti di misura. Tolleranze e precisione.',
    framework: 'IN2025',
    contentStatus: 'draft',
  },
  {
    id: 'node-misurazione-mat2',
    segmentId: 'seg-mat-sec-2',
    type: 'competence',
    title: 'Misure e grandezze',
    description: 'Unità di misura. Conversioni. Approssimazione.',
    framework: 'IN2025',
    contentStatus: 'effective',
  },
];

export const scenario2Links: VerticalCurriculumLink[] = [
  {
    id: 'link-tec-mat-geometria',
    sourceNodeId: 'node-progettazione-tec2',
    targetNodeId: 'node-geometria-mat2',
    relationType: 'integration',
    rationale: 'La progettazione CAD richiede la conoscenza dei solidi geometrici e delle loro proprietà.',
    status: 'proposed',
    createdByRole: 'docente',
  },
  {
    id: 'link-tec-mat-misura',
    sourceNodeId: 'node-misurazione-tec2',
    targetNodeId: 'node-misurazione-mat2',
    relationType: 'integration',
    rationale: 'La misurazione tecnica applica i concetti matematici di grandezza e approssimazione.',
    status: 'draft',
    createdByRole: 'docente',
  },
];

// ─── Scenario 3: Discontinuità e Revisione ───

export const scenario3Version: InstituteCurriculumVersion = {
  id: 'version-scenario-3',
  title: 'Curricolo Italiano con Revisione 2026-2028',
  versionNumber: 2,
  effectivePeriod: '2026/2027 - 2027/2028',
  status: 'under-review',
  previousVersionId: 'version-scenario-3-v1',
  createdAt: '2026-07-01T08:00:00.000Z',
  updatedAt: '2026-07-15T16:00:00.000Z',
};

export const scenario3Segments: CurriculumSegment[] = [
  {
    id: 'seg-ita-sec-1',
    curriculumVersionId: 'version-scenario-3',
    schoolOrder: 'secondaria',
    scope: { type: 'grade', grade: '1ª' },
    disciplineOrField: 'italiano',
    applicableFramework: 'IN2025',
    institutionalContentStatus: 'under-review',
    sourceSegmentId: 'seg-ita-sec-1-v1',
    contentVersion: 4,
    updatedAt: '2026-07-15T16:00:00.000Z',
  },
];

export const scenario3Nodes: CurriculumNode[] = [
  {
    id: 'node-grammatica-sec1',
    segmentId: 'seg-ita-sec-1',
    type: 'competence',
    title: 'Grammatica e morfologia',
    description: 'Analisi logica della frase semplice e complessa.',
    framework: 'IN2025',
    contentStatus: 'effective',
  },
  {
    id: 'node-ortografia-sec1',
    segmentId: 'seg-ita-sec-1',
    type: 'milestone',
    title: 'Ortografia e punteggiatura',
    description: 'Padronanza delle regole ortografiche e dell\'uso della punteggiatura.',
    framework: 'IN2025',
    contentStatus: 'effective',
  },
  {
    id: 'node-lettoria-sec1',
    segmentId: 'seg-ita-sec-1',
    type: 'competence',
    title: 'Lettura e comprensione',
    description: 'Comprensione di testi narrativi, descrittivi e argomentativi.',
    framework: 'IN2025',
    contentStatus: 'effective',
  },
  {
    id: 'node-retorica-sec1',
    segmentId: 'seg-ita-sec-1',
    type: 'objective',
    title: 'Retorica e argomentazione',
    description: 'Studio delle figure retoriche e delle tecniche argomentative.',
    framework: 'IN2012',
    contentStatus: 'not-started',
  },
  {
    id: 'node-latino-sec1',
    segmentId: 'seg-ita-sec-1',
    type: 'knowledge',
    title: 'Avviamento al latino',
    description: 'Primi elementi di grammatica latina e traduzione di testi semplici.',
    framework: 'IN2025',
    contentStatus: 'draft',
  },
];

export const scenario3Links: VerticalCurriculumLink[] = [
  {
    id: 'link-grammatica-valid',
    sourceNodeId: 'node-grammatica-sec1',
    targetNodeId: 'node-lettoria-sec1',
    relationType: 'prerequisite',
    rationale: 'La conoscenza della grammatica è prerequisito per la comprensione testuale.',
    status: 'validated',
    createdByRole: 'docente',
    validatedByRole: 'dipartimento',
  },
  {
    id: 'link-ortografia-valid',
    sourceNodeId: 'node-ortografia-sec1',
    targetNodeId: 'node-lettoria-sec1',
    relationType: 'prerequisite',
    rationale: 'L\'ortografia è prerequisito per la lettura fluente.',
    status: 'validated',
    createdByRole: 'docente',
    validatedByRole: 'dipartimento',
  },
  {
    id: 'link-retorica-removed',
    sourceNodeId: 'node-retorica-sec1',
    targetNodeId: 'node-lettoria-sec1',
    relationType: 'discontinuity',
    rationale: 'La retorica è stata rimossa dalla versione precedente e non è ancora stata reintegrata.',
    status: 'rejected',
    createdByRole: 'referente',
  },
  {
    id: 'link-latino-proposed',
    sourceNodeId: 'node-latino-sec1',
    targetNodeId: 'node-grammatica-sec1',
    relationType: 'integration',
    rationale: 'L\'avviamento al latino si integra con lo studio della grammatica italiana.',
    status: 'proposed',
    createdByRole: 'docente',
  },
];

// ─── All Data ───

export const allVersions = [scenario1Version, scenario2Version, scenario3Version];
export const allSegments = [...scenario1Segments, ...scenario2Segments, ...scenario3Segments];
export const allNodes = [...scenario1Nodes, ...scenario2Nodes, ...scenario3Nodes];
export const allLinks = [...scenario1Links, ...scenario2Links, ...scenario3Links];
