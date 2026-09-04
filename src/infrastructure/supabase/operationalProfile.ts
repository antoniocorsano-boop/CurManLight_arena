import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getOperationalGroupByCode,
  getOperationalGroupsForDisciplines,
  type OperationalGroupCode,
  type OperationalSchoolOrder,
} from '../../domain/institution/operationalGroups';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../lib/consolidatedStorage';

export const OPERATIONAL_PROFILE_STORAGE = {
  academicYear: 'curman_operationalAcademicYear',
  schoolOrder: 'curman_operationalSchoolOrder',
  disciplines: 'curman_operationalDisciplines',
  coordinatorGroup: 'curman_operationalCoordinatorGroup',
} as const;

export interface LocalOperationalProfile {
  academicYear: string;
  schoolOrder: OperationalSchoolOrder;
  disciplines: string[];
  coordinatorGroupCode: OperationalGroupCode | null;
}

const isOperationalOrder = (value: string): value is OperationalSchoolOrder => value === 'primaria' || value === 'secondaria';

export const saveLocalOperationalProfile = (profile: LocalOperationalProfile): void => {
  safeLocalStorageSetItem(OPERATIONAL_PROFILE_STORAGE.academicYear, profile.academicYear);
  safeLocalStorageSetItem(OPERATIONAL_PROFILE_STORAGE.schoolOrder, profile.schoolOrder);
  safeLocalStorageSetItem(OPERATIONAL_PROFILE_STORAGE.disciplines, profile.disciplines.join(','));
  safeLocalStorageSetItem(OPERATIONAL_PROFILE_STORAGE.coordinatorGroup, profile.coordinatorGroupCode ?? '');
};

export const readLocalOperationalProfile = (): LocalOperationalProfile | null => {
  const academicYear = safeLocalStorageGetItem(OPERATIONAL_PROFILE_STORAGE.academicYear, '');
  const schoolOrder = safeLocalStorageGetItem(OPERATIONAL_PROFILE_STORAGE.schoolOrder, '');
  const disciplines = safeLocalStorageGetItem(OPERATIONAL_PROFILE_STORAGE.disciplines, '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const coordinatorRaw = safeLocalStorageGetItem(OPERATIONAL_PROFILE_STORAGE.coordinatorGroup, '');
  if (!/^\d{4}\/\d{4}$/.test(academicYear) || !isOperationalOrder(schoolOrder) || disciplines.length === 0) return null;
  const groups = getOperationalGroupsForDisciplines(schoolOrder, disciplines);
  if (groups.length === 0) return null;
  const coordinator = coordinatorRaw ? getOperationalGroupByCode(coordinatorRaw) : null;
  return {
    academicYear,
    schoolOrder,
    disciplines,
    coordinatorGroupCode: coordinator && coordinator.order === schoolOrder && groups.some((group) => group.code === coordinator.code)
      ? coordinator.code
      : null,
  };
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
    p_coordinator_group_code: profile.coordinatorGroupCode,
  });
  if (error) throw new Error(`Profilo operativo non sincronizzato: ${error.message}`);
  return true;
};

export const syncStoredOperationalProfile = async (client: SupabaseClient): Promise<boolean> => {
  const profile = readLocalOperationalProfile();
  if (!profile) return false;
  return syncOperationalProfile(client, profile);
};
