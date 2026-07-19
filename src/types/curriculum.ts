export type SchoolOrder = 'infanzia' | 'primaria' | 'secondaria';

export type DecisionStatus = 'approved' | 'rejected' | 'custom';

export type UserRole = 'insegnante' | 'dipartimento' | 'referente' | 'dirigente' | 'collegio' | 'amministratore';

export interface Proposal {
  id: string;
  focus: string;
  oldText: string;
  newText: string;
  notes: string;
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
  activeProgTab: 'annuale' | 'uda' | 'certificazione' | 'social' | 'classe';
  activeCurricoloView: 'albero' | 'mappa' | 'popolamento';
  activeProcessoTab: 'flusso' | 'verifica';
  activeGeneralSubtab: 'premessa' | 'riforma' | 'obiettivi' | 'livelli';
}
