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

/**
 * Resolves the personal working academic year without assigning institutional
 * meaning to it. Explicit YYYY/YYYY or YYYY-YYYY values are normalized; when
 * the local store has not selected a year yet, the current school year is used
 * only as the provisional working context (September → August).
 */
export const resolveOperationalAcademicYear = (
  value: string,
  now: Date = new Date(),
): string | null => {
  const trimmed = value.trim();
  if (trimmed) {
    const match = /^(\d{4})[\/-](\d{4})$/.exec(trimmed);
    if (!match) return null;
    const startYear = Number(match[1]);
    const endYear = Number(match[2]);
    if (endYear !== startYear + 1) return null;
    return `${startYear}/${endYear}`;
  }

  const calendarYear = now.getFullYear();
  const startYear = now.getMonth() >= 8 ? calendarYear : calendarYear - 1;
  return `${startYear}/${startYear + 1}`;
};

const normalizeDisciplines = (schoolOrder: OperationalSchoolOrder, disciplines: readonly string[]): string[] => {
  const unique = Array.from(new Set(disciplines.map((value) => value.trim()).filter(Boolean)));
  return unique.filter((discipline) => Boolean(getOperationalGroupForDiscipline(schoolOrder, discipline)));
};

export const saveLocalOperationalProfile = (profile: LocalOperationalProfile): void => {
  const academicYear = resolveOperationalAcademicYear(profile.academicYear);
  const disciplines = normalizeDisciplines(profile.schoolOrder, profile.disciplines);
  if (!academicYear || disciplines.length === 0) return;
  safeLocalStorageSetItem(OPERATIONAL_PROFILE_STORAGE.academicYear, academicYear);
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
  const resolvedAcademicYear = resolveOperationalAcademicYear(academicYear);
  if (!resolvedAcademicYear || !getOperationalGroupForDiscipline(schoolOrder, discipline)) return null;
  const current = readLocalOperationalProfile();
  const disciplines = current
    && current.academicYear === resolvedAcademicYear
    && current.schoolOrder === schoolOrder
    ? [...current.disciplines, discipline]
    : [discipline];
  const profile: LocalOperationalProfile = {
    academicYear: resolvedAcademicYear,
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
  const academicYear = resolveOperationalAcademicYear(profile.academicYear);
  if (!academicYear) return false;
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError || !sessionData.session) return false;
  const { error } = await client.rpc('upsert_my_operational_profile_v1', {
    p_academic_year: academicYear,
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
