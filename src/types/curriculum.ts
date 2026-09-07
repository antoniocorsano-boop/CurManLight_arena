export type SchoolOrder = 'infanzia' | 'primaria' | 'secondaria';

export type DecisionStatus = 'approved' | 'rejected' | 'custom';

export type UserRole = 'non-dichiarato' | 'insegnante' | 'dipartimento' | 'referente' | 'dirigente' | 'collegio' | 'amministratore';

export interface Proposal {
  id: string;
  focus: string;
  oldText: string;
  newText: string;
  notes: string;
  scopeLabel?: string;
  oldLabel?: string;
  newLabel?: string;
  keepLabel?: string;
  contextSummary?: string;
  sourceRefs?: string[];
  gateId?: string;
}

export interface CurricularLevel {
  traguardi: string[];
  obiettivi: string[];
  proposals: Proposal[];
  evidenze: string[];
  nucleiFondanti?: string[];
}

export interface DisciplineData {
  infanzia: CurricularLevel;
  primaria: CurricularLevel;
  secondaria: CurricularLevel;
}

export type DidacticBindingTarget = 'annual-planning' | 'uda' | 'learning-activity';
export type DidacticBindingAuthorityState = 'WORKING_BASELINE_NOT_IN_FORCE' | 'IN_FORCE_CURRICULUM';
export type DidacticBindingUseScope = 'DRAFT_PLANNING_REFERENCE' | 'IN_FORCE_CURRICULUM_REFERENCE';
export type CurriculumUnitResolutionState = 'CONTEXT_BOUND' | 'CURRICULUM_UNIT_VERIFIED';

export interface CurriculumUnitReference {
  masterId: 'CAN-CURR-MASTER-00';
  masterDriveFileId: string;
  masterVersion: string;
  unitKey: string;
  identityKind: 'ARENA_MASTER_CONTEXT_KEY';
  order: SchoolOrder;
  classOrAgeBand: string;
  disciplineOrField: string;
  resolutionState: CurriculumUnitResolutionState;
}

export interface DidacticBinding {
  id: string;
  kind: 'DIDACTIC_BINDING';
  targetType: DidacticBindingTarget;
  curriculumUnit: CurriculumUnitReference;
  authorityState: DidacticBindingAuthorityState;
  useScope: DidacticBindingUseScope;
  humanProfessionalValidation: 'OPEN' | 'COMPLETE';
  curriculumInForce: boolean;
  copiedCurriculumTextIsAuthoritative: false;
  createdAt: string;
}

export type ImplementationSignal =
  | 'ADEQUATE'
  | 'TOO_EARLY'
  | 'TOO_LATE'
  | 'DUPLICATED'
  | 'MISSING_PREREQUISITE'
  | 'WEAK_EVIDENCE'
  | 'UNSUSTAINABLE_LOAD'
  | 'EFFECTIVE_VERTICAL_LINK'
  | 'OTHER';

export interface ImplementationObservation {
  id: string;
  kind: 'IMPLEMENTATION_OBSERVATION';
  signal: ImplementationSignal;
  note?: string;
  didacticBindingId: string;
  curriculumUnit: CurriculumUnitReference;
  sourceArtifact: {
    type: 'uda';
    id: string;
    title: string;
  };
  personalDataDeclaration: 'DECLARED_ABSENT';
  containsStudentPersonalData: false;
  automaticCurriculumChange: false;
  reviewState: 'RECORDED_FOR_AGGREGATION';
  createdAt: string;
}

export interface UdaModel {
  id: string;
  title: string;
  discipline: string;
  order: SchoolOrder;
  period: string;
  hours: number;
  status: 'bozza' | 'in revisione' | 'pronta per confronto' | 'validata' | 'archiviata';
  traguardi: string[];
  obiettivi: string[];
  evidenze: string[];
  realTask: string;
  notes: string;
  curriculumBindings?: DidacticBinding[];
  implementationObservations?: ImplementationObservation[];
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentExportEvent {
  id: string;
  documentType: string;
  format: string;
  label: string;
  sourceKind: string;
  sourceId?: string;
  sourceTitle?: string;
  discipline: string;
  order: string;
  classLabel?: string;
  workStatus?: string;
  exportedAt: string;
  sourceSignature?: string;
  sourceView?: string;
  coherence: 'current' | 'modified' | 'unverifiable';
}

export interface UserState {
  role: UserRole;
  discipline: string;
  order: SchoolOrder;
  schoolYear: string;
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
  savedUda: UdaModel[];
  activeRevisionFilter: 'all' | 'pending' | 'approved' | 'rejected';
  selectedTraguardi: number[];
  selectedObiettivi: number[];
  selectedEvidenze: string[];
  activeProgTab: 'home' | 'annuale' | 'uda' | 'certificazione';
  activeCurricoloView: 'home' | 'albero' | 'mappa' | 'popolamento' | 'pilota';
  activeProcessoTab: 'flusso' | 'verifica';
  activeGeneralSubtab: 'premessa' | 'riforma' | 'obiettivi' | 'livelli';
  documentExportHistory: DocumentExportEvent[];
}
