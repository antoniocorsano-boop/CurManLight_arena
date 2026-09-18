import type { SchoolOrder, UserRole } from '../../../types/curriculum';

export const PERSONAL_WORK_PROFILE_STORAGE_KEY = 'curman_personalWorkProfile_v1';
export const PERSONAL_WORK_PROFILE_SCHEMA_VERSION = 1 as const;

export type PersonalProfileRole = 'non-dichiarato' | 'insegnante';
export type PersonalTeachingActivity = 'disciplinare' | 'sostegno';
export type PersonalTeacherType = 'comune' | 'specialista';

export interface PersonalWorkProfileV1 {
  schemaVersion: typeof PERSONAL_WORK_PROFILE_SCHEMA_VERSION;
  completedAt: string;
  role: PersonalProfileRole;
  order: SchoolOrder;
  discipline: string;
  teachingActivity: PersonalTeachingActivity;
  teacherType: PersonalTeacherType;
  assignedClasses: string[];
  assignedCombinations: string[];
  availableSections: string[];
}

const SCHOOL_ORDERS: readonly SchoolOrder[] = ['infanzia', 'primaria', 'secondaria'];

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

export const toPersonalProfileRole = (role: UserRole): PersonalProfileRole =>
  role === 'insegnante' ? 'insegnante' : 'non-dichiarato';

export const isInstitutionalOnlyRole = (role: UserRole): boolean =>
  ['dipartimento', 'referente', 'dirigente', 'collegio', 'amministratore'].includes(role);

export const parsePersonalWorkProfile = (raw: string | null): PersonalWorkProfileV1 | null => {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<PersonalWorkProfileV1>;
    if (value.schemaVersion !== PERSONAL_WORK_PROFILE_SCHEMA_VERSION) return null;
    if (value.role !== 'non-dichiarato' && value.role !== 'insegnante') return null;
    if (!value.order || !SCHOOL_ORDERS.includes(value.order)) return null;
    if (typeof value.discipline !== 'string' || !value.discipline.trim()) return null;
    if (value.teachingActivity !== 'disciplinare' && value.teachingActivity !== 'sostegno') return null;
    if (value.teacherType !== 'comune' && value.teacherType !== 'specialista') return null;
    if (!isStringArray(value.assignedClasses)) return null;
    if (!isStringArray(value.assignedCombinations)) return null;
    if (!isStringArray(value.availableSections)) return null;
    if (typeof value.completedAt !== 'string' || !value.completedAt) return null;
    return value as PersonalWorkProfileV1;
  } catch {
    return null;
  }
};
