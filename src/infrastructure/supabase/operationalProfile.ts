import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getOperationalGroupForDiscipline,
  getOperationalGroupsForDisciplines,
  type OperationalSchoolOrder,
} from '../../domain/institution/operationalGroups';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../lib/consolidatedStorage';

export const OPERATIONAL_PROFILE_STORAGE = {
  academicYear: 'curman_operationalAcademicYear',
  schoolOrder: 'curman_operationalSchoolOrder',
  disciplines: 'curman_operationalDisciplines',
} as const;

export interface LocalOperationalProfile {
  academicYear: string;
  schoolOrder: OperationalSchoolOrder;
  disciplines: string[];
}

const isOperationalOrder = (value: string): value is OperationalSchoolOrder => value === 'primaria' || value === 'secondaria';

const normalizeDisciplines = (schoolOrder: OperationalSchoolOrder, disciplines: readonly string[]): string[] => {
  const unique = Array.from(new Set(disciplines.map((value) => value.trim()).filter(Boolean)));
  return unique.filter((discipline) => Boolean(getOperationalGroupForDiscipline(schoolOrder, discipline)));
};

export const saveLocalOperationalProfile = (profile: LocalOperationalProfile): void => {
  const disciplines = normalizeDisciplines(profile.schoolOrder, profile.disciplines);
  if (!/^\d{4}\/\d{4}$/.test(profile.academicYear) || disciplines.length === 0) return;
  safeLocalStorageSetItem(OPERATIONAL_PROFILE_STORAGE.academicYear, profile.academicYear);
  safeLocalStorageSetItem(OPERATIONAL_PROFILE_STORAGE.schoolOrder, profile.schoolOrder);
  safeLocalStorageSetItem(OPERATIONAL_PROFILE_STORAGE.disciplines, disciplines.join(','));
};

export const readLocalOperationalProfile = (): LocalOperationalProfile | null => {
  const academicYear = safeLocalStorageGetItem(OPERATIONAL_PROFILE_STORAGE.academicYear, '');
  const schoolOrder = safeLocalStorageGetItem(OPERATIONAL_PROFILE_STORAGE.schoolOrder, '');
  if (!/^\d{4}\/\d{4}$/.test(academicYear) || !isOperationalOrder(schoolOrder)) return null;
  const disciplines = normalizeDisciplines(
    schoolOrder,
    safeLocalStorageGetItem(OPERATIONAL_PROFILE_STORAGE.disciplines, '').split(','),
  );
  if (disciplines.length === 0 || getOperationalGroupsForDisciplines(schoolOrder, disciplines).length === 0) return null;
  return { academicYear, schoolOrder, disciplines };
};

/**
 * Adds the discipline selected in the personal work profile to the provisional
 * operational competence declaration. This never assigns a coordinator role.
 */
export const rememberOperationalDiscipline = (
  academicYear: string,
  schoolOrder: OperationalSchoolOrder,
  discipline: string,
): LocalOperationalProfile | null => {
  if (!getOperationalGroupForDiscipline(schoolOrder, discipline)) return null;
  const current = readLocalOperationalProfile();
  const disciplines = current
    && current.academicYear === academicYear
    && current.schoolOrder === schoolOrder
    ? [...current.disciplines, discipline]
    : [discipline];
  const profile: LocalOperationalProfile = {
    academicYear,
    schoolOrder,
    disciplines: normalizeDisciplines(schoolOrder, disciplines),
  };
  saveLocalOperationalProfile(profile);
  return profile;
};

export const syncOperationalProfile = async (
  client: SupabaseClient,
  profile: LocalOperationalProfile,
): Promise<boolean> => {
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError || !sessionData.session) return false;
  const { error } = await client.rpc('upsert_my_operational_profile_v1', {
    p_academic_year: profile.academicYear,
    p_school_order: profile.schoolOrder,
    p_disciplines: profile.disciplines,
    // Kept only for RPC signature compatibility. Self-service coordination is forbidden server-side.
    p_coordinator_group_code: null,
  });
  if (error) throw new Error(`Profilo operativo non sincronizzato: ${error.message}`);
  return true;
};

export const syncStoredOperationalProfile = async (client: SupabaseClient): Promise<boolean> => {
  const profile = readLocalOperationalProfile();
  if (!profile) return false;
  return syncOperationalProfile(client, profile);
};
