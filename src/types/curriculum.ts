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
