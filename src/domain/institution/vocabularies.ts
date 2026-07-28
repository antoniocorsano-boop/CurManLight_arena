import type { InstitutionalRole } from '../curriculum/types';
import type { InstituteStatus, LocalLogoMediaType } from './types';
import { SCHOOL_ORDERS } from '../curriculum/model/vocabularies';

export { SCHOOL_ORDERS };

export const INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION = 1;
export const MAX_LOCAL_LOGO_BYTES = 2 * 1024 * 1024;

export const LOCAL_LOGO_MEDIA_TYPES: readonly LocalLogoMediaType[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

export const DECLARED_INSTITUTIONAL_ROLES: readonly InstitutionalRole[] = [
  'docente',
  'dipartimento',
  'referente',
  'collegio',
  'dirigente',
  'amministratore',
] as const;

const INSTITUTE_STATUS_TRANSITIONS: Readonly<Record<InstituteStatus, readonly InstituteStatus[]>> = {
  unconfigured: ['draft', 'archived'],
  draft: ['confirmed-local', 'archived'],
  'confirmed-local': ['draft', 'incomplete', 'archived'],
  incomplete: ['archived'],
  'legacy-imported': ['draft', 'archived'],
  archived: [],
};

export function canTransitionInstituteStatus(from: InstituteStatus, to: InstituteStatus): boolean {
  const transitions = INSTITUTE_STATUS_TRANSITIONS[from];
  return Array.isArray(transitions) && (from === to || transitions.includes(to));
}
