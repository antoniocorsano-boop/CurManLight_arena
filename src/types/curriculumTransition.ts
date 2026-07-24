export interface AcademicYear {
  startYear: number;
  endYear: number;
}

export type NationalFramework = 'IN2012' | 'IN2025';

export type SchoolOrder = 'infanzia' | 'primaria' | 'secondaria';

export interface TransitionPolicy {
  targetFramework: 'IN2025';
  firstEntrySchoolYear: number;
  strategy: 'entry-cohort-progression';
  immediateOrders: SchoolOrder[];
  progressiveOrders: SchoolOrder[];
}

export type ResolutionStatus =
  | 'resolved'
  | 'requires-context-confirmation';

export type ResolutionReason =
  | 'BEFORE_TRANSITION'
  | 'IMMEDIATE_ORDER_FROM_EFFECTIVE_YEAR'
  | 'ENTRY_COHORT_2026_OR_LATER'
  | 'PRE_TRANSITION_COHORT'
  | 'INVALID_CONTEXT';

export interface FrameworkResolution {
  framework: NationalFramework | null;
  status: ResolutionStatus;
  reason: ResolutionReason;
  cohortEntryYear?: number;
}

export const DEFAULT_TRANSITION_POLICY: TransitionPolicy = {
  targetFramework: 'IN2025',
  firstEntrySchoolYear: 2026,
  strategy: 'entry-cohort-progression',
  immediateOrders: ['infanzia'],
  progressiveOrders: ['primaria', 'secondaria'],
};

export const ALL_SCHOOL_ORDERS: SchoolOrder[] = ['infanzia', 'primaria', 'secondaria'];

export const MAX_CLASS_LEVEL: Record<SchoolOrder, number> = {
  infanzia: 0,
  primaria: 5,
  secondaria: 3,
};
