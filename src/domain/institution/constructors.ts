import { createMetadata } from '../curriculum/identity';
import { INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION } from './vocabularies';
import type { AcademicYear, Institute, InstituteReference, InstituteSite, InstitutionalArchive, InstitutionalContext, InstitutionalDocumentProfile, ResolvedInstitutionalDocumentProfile } from './types';

export function cloneInstitutionalValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export interface CreateInstituteDraftInput {
  name: string;
  schoolOrders: Institute['schoolOrders'];
  mechanicalCode?: string;
  documentProfile?: InstitutionalDocumentProfile;
}

export function createEmptyInstitutionalArchive(now = new Date().toISOString()): InstitutionalArchive {
  return { schemaVersion: INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION, updatedAt: now, institutes: [], academicYears: [], sites: [], contexts: [] };
}

export function createInstituteDraft(input: CreateInstituteDraftInput, now = new Date().toISOString()): Institute {
  const metadata = createMetadata('teacher', undefined, now);
  return {
    id: metadata.id,
    metadata,
    name: typeof input.name === 'string' ? input.name.trim() : '',
    mechanicalCode: typeof input.mechanicalCode === 'string' ? input.mechanicalCode.trim() || undefined : undefined,
    schoolOrders: Array.isArray(input.schoolOrders) ? [...input.schoolOrders] : [],
    status: 'draft',
    documentProfile: input.documentProfile ? cloneInstitutionalValue(input.documentProfile) : undefined,
  };
}

export function createInstituteSite(input: Omit<InstituteSite, 'id' | 'metadata' | 'status'> & { status?: InstituteSite['status'] }, now = new Date().toISOString()): InstituteSite {
  const metadata = createMetadata(input.status === 'legacy-imported' ? 'legacy' : 'teacher', undefined, now);
  return { ...cloneInstitutionalValue(input), id: metadata.id, metadata, name: typeof input.name === 'string' ? input.name.trim() : '', status: input.status ?? 'draft' };
}

export function createAcademicYear(input: Omit<AcademicYear, 'id' | 'metadata'>, now = new Date().toISOString()): AcademicYear {
  const metadata = createMetadata(input.status === 'legacy' ? 'legacy' : 'teacher', undefined, now);
  return { ...cloneInstitutionalValue(input), id: metadata.id, metadata };
}

export function createInstitutionalContext(input: Omit<InstitutionalContext, 'id' | 'metadata'>, now = new Date().toISOString()): InstitutionalContext {
  const metadata = createMetadata('teacher', input.declaredActor, now);
  return { ...cloneInstitutionalValue(input), id: metadata.id, metadata };
}

export function createNeutralDocumentProfile(): ResolvedInstitutionalDocumentProfile {
  return { instituteName: 'Istituto non configurato' };
}

export function instituteReference(institute: Institute): InstituteReference {
  return { id: institute.id, entityType: 'institute', snapshotLabel: institute.name };
}
