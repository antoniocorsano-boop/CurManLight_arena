import type { ActorReference, EntityId, EntityMetadata } from '../curriculum/identity';
import type { SchoolOrder } from '../../types/curriculum';

export type InstituteStatus = 'unconfigured' | 'draft' | 'confirmed-local' | 'incomplete' | 'legacy-imported' | 'archived';
export type AcademicYearStatus = 'planned' | 'active' | 'closed' | 'archived' | 'legacy';
export type InstituteSiteStatus = 'draft' | 'legacy-imported' | 'archived';
export type InstitutionCompleteness = 'unconfigured' | 'minimal' | 'partial' | 'complete-local' | 'legacy' | 'invalid';
export type LocalLogoMediaType = 'image/png' | 'image/jpeg' | 'image/webp';
export type InstitutionalEntityType = 'academic-year' | 'institute-site' | 'institutional-context';

export interface InstituteReference {
  id: EntityId;
  entityType: 'institute';
  snapshotLabel?: string;
}

export interface InstitutionalReference<T extends InstitutionalEntityType = InstitutionalEntityType> {
  id: EntityId;
  entityType: T;
  snapshotLabel?: string;
}

export type AcademicYearReference = InstitutionalReference<'academic-year'>;
export type InstituteSiteReference = InstitutionalReference<'institute-site'>;
export type InstitutionalContextReference = InstitutionalReference<'institutional-context'>;
export interface DeclaredActorReference extends Omit<ActorReference, 'assertion'> { assertion: 'self-declared' }

export interface LocalLogoDescriptor {
  assetId: string;
  fileName: string;
  mediaType: LocalLogoMediaType;
  byteSize: number;
}

export interface InstitutionalDocumentProfile {
  heading?: string;
  subheading?: string;
  footer?: string;
  generalReferences?: string;
  logo?: LocalLogoDescriptor;
}

export interface ResolvedInstitutionalDocumentProfile extends InstitutionalDocumentProfile {
  instituteName: string;
}

export interface A07InstitutionalDocumentRead extends ResolvedInstitutionalDocumentProfile {
  configured: boolean;
  mechanicalCode?: string;
  siteName?: string;
  siteAddress?: string;
  academicYearLabel?: string;
  declaredRole?: string;
  organizationId: string;
  warning?: string;
}

export interface A07InstitutionalDocumentProjection {
  primaryHeading?: string;
  displayName: string;
  secondaryLines: string[];
  footer?: string;
  declaredRoleLine?: string;
}

export interface Institute {
  id: EntityId;
  metadata: EntityMetadata;
  name: string;
  mechanicalCode?: string;
  schoolOrders: SchoolOrder[];
  status: InstituteStatus;
  documentProfile?: InstitutionalDocumentProfile;
  activeAcademicYearRef?: AcademicYearReference;
}

export interface InstituteAddress {
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
}

export interface InstituteSite {
  id: EntityId;
  metadata: EntityMetadata;
  instituteRef: InstituteReference;
  name: string;
  isMain: boolean;
  address?: InstituteAddress;
  email?: string;
  phone?: string;
  status: InstituteSiteStatus;
}

export interface AcademicYear {
  id: EntityId;
  metadata: EntityMetadata;
  instituteRef: InstituteReference;
  label: string;
  startsOn: string;
  endsOn: string;
  status: AcademicYearStatus;
}

export interface InstitutionalContext {
  id: EntityId;
  metadata: EntityMetadata;
  instituteRef: InstituteReference;
  academicYearRef?: AcademicYearReference;
  siteRef?: InstituteSiteReference;
  declaredActor?: DeclaredActorReference;
}

export interface InstitutionalArchive {
  schemaVersion: number;
  updatedAt: string;
  institutes: Institute[];
  academicYears: AcademicYear[];
  sites: InstituteSite[];
  contexts: InstitutionalContext[];
  activeInstituteRef?: InstituteReference;
  currentContextRef?: InstitutionalContextReference;
}

export interface InstitutionValidationError { code: string; message: string; path?: string }
export interface InstitutionValidationResult { valid: boolean; errors: InstitutionValidationError[]; warnings: string[] }
export interface ArchiveOperationResult { success: boolean; archive?: InstitutionalArchive; errors: InstitutionValidationError[] }
export interface InstitutionalBackupEnvelope { schemaVersion: number; exportedAt: string; archive: InstitutionalArchive }
export interface InstitutionalImportPreview {
  success: boolean;
  incomingArchive?: InstitutionalArchive;
  additions: EntityId[];
  updates: EntityId[];
  conflicts: EntityId[];
  baseFingerprint?: string;
  incomingFingerprint?: string;
  errors: string[];
}
export interface InstitutionalImportResolution { resolvedConflictIds: EntityId[] }
export interface InstitutionalImportResult { success: boolean; archive?: InstitutionalArchive; previousArchive?: InstitutionalArchive; errors: string[] }
export interface LegacyInstitutionSource {
  origin: string;
  name?: string;
  mechanicalCode?: string;
  address?: string | InstituteAddress;
  schoolOrders?: SchoolOrder[];
}
export interface LegacyInstitutionImportResult { archive: InstitutionalArchive; warnings: string[] }
