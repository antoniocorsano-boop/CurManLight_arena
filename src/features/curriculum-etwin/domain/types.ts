/**
 * CML-630C — Curriculum e-Twin Domain Validation Prototype
 *
 * Tipi sperimentali per la validazione del modello di dominio
 * del curricolo verticale d'istituto.
 *
 * Questi tipi NON fanno parte del dominio produttivo.
 * Sono esclusivamente per prototipazione e validazione.
 */

export type SchoolOrder = 'infanzia' | 'primaria' | 'secondaria';

export type NationalFramework = 'IN2012' | 'IN2025';

export type InstituteCurriculumStatus =
  | 'draft'
  | 'under-review'
  | 'proposed-to-collegio'
  | 'approved'
  | 'superseded';

export type SegmentWorkflowStatus =
  | 'not-started'
  | 'draft'
  | 'open-for-contributions'
  | 'under-review'
  | 'ready-for-consolidation'
  | 'included-in-proposal'
  | 'effective'
  | 'legacy-imported';

export type CurriculumNodeType =
  | 'competence'
  | 'milestone'
  | 'objective'
  | 'evidence'
  | 'knowledge'
  | 'skill'
  | 'core-theme';

export type LinkRelationType =
  | 'prerequisite'
  | 'continuity'
  | 'development'
  | 'deepening'
  | 'integration'
  | 'discontinuity';

export type LinkStatus =
  | 'draft'
  | 'proposed'
  | 'validated'
  | 'rejected';

export type InstitutionalRole =
  | 'docente'
  | 'dipartimento'
  | 'referente'
  | 'collegio';

export type SegmentScope =
  | { type: 'grade'; grade: string }
  | { type: 'grade-range'; grades: string[] }
  | { type: 'school-level' };

export interface InstituteCurriculumVersion {
  id: string;
  title: string;
  versionNumber: number;
  effectivePeriod: string;
  status: InstituteCurriculumStatus;
  previousVersionId?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  supersededAt?: string;
}

export interface CurriculumSegment {
  id: string;
  curriculumVersionId: string;
  schoolOrder: SchoolOrder;
  scope: SegmentScope;
  disciplineOrField: string;
  applicableFramework: NationalFramework;
  institutionalContentStatus: SegmentWorkflowStatus;
  sourceSegmentId?: string;
  replacesSegmentId?: string;
  contentVersion: number;
  updatedAt: string;
}

export interface CurriculumNode {
  id: string;
  segmentId: string;
  type: CurriculumNodeType;
  title: string;
  description?: string;
  framework?: NationalFramework;
  contentStatus?: SegmentWorkflowStatus;
}

export interface VerticalCurriculumLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: LinkRelationType;
  rationale?: string;
  status: LinkStatus;
  createdByRole?: InstitutionalRole;
  validatedByRole?: InstitutionalRole;
}

export interface CurriculumVersionWithSegments {
  version: InstituteCurriculumVersion;
  segments: CurriculumSegment[];
}

export interface SegmentWithNodes {
  segment: CurriculumSegment;
  nodes: CurriculumNode[];
}

export interface LinkWithNodes {
  link: VerticalCurriculumLink;
  sourceNode: CurriculumNode;
  targetNode: CurriculumNode;
}
