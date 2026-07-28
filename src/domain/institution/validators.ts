import { CURRENT_SCHEMA_VERSION, isValidActorReference, isValidEntityId, isValidMetadata } from '../curriculum/identity';
import { SCHOOL_ORDERS } from '../curriculum/model/vocabularies';
import { DECLARED_INSTITUTIONAL_ROLES, INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION, LOCAL_LOGO_MEDIA_TYPES, MAX_LOCAL_LOGO_BYTES } from './vocabularies';
import type { AcademicYear, AcademicYearStatus, Institute, InstituteReference, InstituteSite, InstituteSiteStatus, InstitutionalContext, InstitutionalEntityType, InstitutionalReference, InstitutionCompleteness, InstitutionValidationError, InstitutionValidationResult, InstituteStatus, LocalLogoMediaType } from './types';

const INSTITUTE_STATUSES: readonly InstituteStatus[] = ['unconfigured', 'draft', 'confirmed-local', 'incomplete', 'legacy-imported', 'archived'];
const YEAR_STATUSES: readonly AcademicYearStatus[] = ['planned', 'active', 'closed', 'archived', 'legacy'];
const SITE_STATUSES: readonly InstituteSiteStatus[] = ['draft', 'legacy-imported', 'archived'];

function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function issue(code: string, message: string, path?: string): InstitutionValidationError { return { code, message, path }; }
function done(errors: InstitutionValidationError[], warnings: string[] = []): InstitutionValidationResult { return { valid: errors.length === 0, errors, warnings }; }
function text(value: unknown): value is string { return typeof value === 'string'; }
function validDate(value: unknown): value is string {
  if (!text(value)) return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
function metadataValid(value: unknown, id: unknown): boolean {
  return object(value) && value.id === id && isValidMetadata(value) && value.schemaVersion === CURRENT_SCHEMA_VERSION;
}

export function isValidInstitutionalReference<T extends InstitutionalEntityType>(value: unknown, entityType: T): value is InstitutionalReference<T> {
  return object(value) && isValidEntityId(value.id) && value.entityType === entityType && (value.snapshotLabel === undefined || text(value.snapshotLabel));
}

export function isValidInstituteReference(value: unknown): value is InstituteReference {
  return object(value)
    && isValidEntityId(value.id)
    && value.entityType === 'institute'
    && (value.snapshotLabel === undefined || text(value.snapshotLabel));
}

function validateLogo(value: unknown): InstitutionValidationError[] {
  if (!object(value)) return [issue('invalid-logo', 'Descrittore logo non valido', 'documentProfile.logo')];
  const errors: InstitutionValidationError[] = [];
  const assetId = value.assetId;
  const fileName = value.fileName;
  const mediaType = value.mediaType;
  if (!text(assetId) || !/^[a-z0-9._-]+$/i.test(assetId) || /^(?:https?:|data:|file:|[a-z]:)/i.test(assetId)) errors.push(issue('invalid-logo-asset', 'Identificativo locale logo non valido'));
  if (!text(fileName) || !fileName.trim() || /[\u0000-\u001f\u007f]/.test(fileName) || /^(?:https?:|data:|file:|[a-z]:|\/|\\)/i.test(fileName) || /[\\/]/.test(fileName) || /\.svg$/i.test(fileName)) errors.push(issue('invalid-logo-name', 'Nome file logo non valido'));
  if (!LOCAL_LOGO_MEDIA_TYPES.includes(mediaType as LocalLogoMediaType)) errors.push(issue('invalid-logo-media-type', 'Sono ammessi solo PNG, JPEG o WebP'));
  const expected = mediaType === 'image/png' ? ['png'] : mediaType === 'image/jpeg' ? ['jpg', 'jpeg'] : mediaType === 'image/webp' ? ['webp'] : [];
  const extension = text(fileName) ? fileName.split('.').pop()?.toLowerCase() : undefined;
  if (!extension || !expected.includes(extension)) errors.push(issue('logo-extension-mismatch', 'Estensione e media type del logo non coincidono'));
  if (!Number.isInteger(value.byteSize) || (value.byteSize as number) <= 0 || (value.byteSize as number) > MAX_LOCAL_LOGO_BYTES) errors.push(issue('invalid-logo-size', `Il logo non può superare ${MAX_LOCAL_LOGO_BYTES} byte`));
  return errors;
}

export function validateInstitute(value: unknown): InstitutionValidationResult {
  if (!object(value)) return done([issue('invalid-institute', 'Istituto non valido')]);
  const errors: InstitutionValidationError[] = [];
  if (!isValidEntityId(value.id) || !metadataValid(value.metadata, value.id)) errors.push(issue('invalid-identity', 'Identità o metadati istituto non validi', 'id'));
  if (!text(value.name) || !value.name.trim()) errors.push(issue('name-required', 'Nome istituto obbligatorio', 'name'));
  if (value.mechanicalCode !== undefined && (!text(value.mechanicalCode) || !/^[A-Z0-9-]{6,20}$/i.test(value.mechanicalCode))) errors.push(issue('invalid-mechanical-code', 'Formato codice meccanografico non valido'));
  if (!Array.isArray(value.schoolOrders) || value.schoolOrders.some(order => !SCHOOL_ORDERS.includes(order as never))) errors.push(issue('invalid-school-order', 'Ordine scolastico non valido'));
  else {
    if (value.schoolOrders.length === 0 && value.status !== 'legacy-imported' && value.status !== 'unconfigured') errors.push(issue('school-order-required', 'Almeno un ordine scolastico è obbligatorio'));
    if (new Set(value.schoolOrders).size !== value.schoolOrders.length) errors.push(issue('duplicate-school-order', 'Ordini scolastici duplicati'));
  }
  if (!INSTITUTE_STATUSES.includes(value.status as InstituteStatus)) errors.push(issue('invalid-status', 'Stato istituto non valido'));
  if (value.activeAcademicYearRef !== undefined && !isValidInstitutionalReference(value.activeAcademicYearRef, 'academic-year')) errors.push(issue('invalid-active-year-reference', 'Riferimento anno attivo non valido'));
  if (value.documentProfile !== undefined) {
    if (!object(value.documentProfile)) errors.push(issue('invalid-document-profile', 'Profilo documentale non valido'));
    else {
      for (const field of ['heading', 'subheading', 'footer', 'generalReferences'] as const) if (value.documentProfile[field] !== undefined && !text(value.documentProfile[field])) errors.push(issue('invalid-profile-field', `Campo ${field} non valido`));
      if (value.documentProfile.logo !== undefined) errors.push(...validateLogo(value.documentProfile.logo));
    }
  }
  return done(errors, value.mechanicalCode ? ['Codice controllato solo strutturalmente, non autenticato'] : []);
}

export function validateInstituteSite(value: unknown): InstitutionValidationResult {
  if (!object(value)) return done([issue('invalid-site', 'Sede non valida')]);
  const errors: InstitutionValidationError[] = [];
  if (!isValidEntityId(value.id) || !metadataValid(value.metadata, value.id)) errors.push(issue('invalid-identity', 'Identità o metadati sede non validi'));
  if (!isValidInstituteReference(value.instituteRef)) errors.push(issue('invalid-institute-reference', 'Riferimento istituto non valido'));
  if (!text(value.name) || !value.name.trim()) errors.push(issue('site-name-required', 'Nome sede obbligatorio'));
  if (typeof value.isMain !== 'boolean') errors.push(issue('invalid-main-flag', 'Indicatore sede principale non valido'));
  if (!SITE_STATUSES.includes(value.status as InstituteSiteStatus)) errors.push(issue('invalid-status', 'Stato sede non valido'));
  if (value.address !== undefined) {
    if (!object(value.address)) errors.push(issue('invalid-address', 'Indirizzo non valido'));
    else for (const field of ['street', 'city', 'province', 'postalCode', 'country']) if (value.address[field] !== undefined && !text(value.address[field])) errors.push(issue('invalid-address-field', `Campo indirizzo ${field} non valido`));
  }
  if (value.email !== undefined && !text(value.email)) errors.push(issue('invalid-email', 'Email non valida'));
  if (value.phone !== undefined && !text(value.phone)) errors.push(issue('invalid-phone', 'Telefono non valido'));
  return done(errors);
}

export function validateAcademicYear(value: unknown): InstitutionValidationResult {
  if (!object(value)) return done([issue('invalid-academic-year', 'Anno scolastico non valido')]);
  const errors: InstitutionValidationError[] = [];
  if (!isValidEntityId(value.id) || !metadataValid(value.metadata, value.id)) errors.push(issue('invalid-identity', 'Identità o metadati anno non validi'));
  if (!isValidInstituteReference(value.instituteRef)) errors.push(issue('invalid-institute-reference', 'Riferimento istituto non valido'));
  if (!YEAR_STATUSES.includes(value.status as AcademicYearStatus)) errors.push(issue('invalid-status', 'Stato anno non valido'));
  if (!validDate(value.startsOn) || !validDate(value.endsOn) || value.startsOn > value.endsOn) errors.push(issue('invalid-date-range', 'Intervallo date non valido'));
  const match = text(value.label) ? /^(\d{4})\/(\d{4})$/.exec(value.label) : null;
  if (!match || Number(match[2]) !== Number(match[1]) + 1 || !text(value.startsOn) || !text(value.endsOn) || value.startsOn.slice(0, 4) !== match[1] || value.endsOn.slice(0, 4) !== match[2]) errors.push(issue('incoherent-year-label', 'Etichetta e date non coerenti'));
  return done(errors);
}

export function validateInstitutionalContext(value: unknown): InstitutionValidationResult {
  if (!object(value)) return done([issue('invalid-context', 'Contesto non valido')]);
  const errors: InstitutionValidationError[] = [];
  if (!isValidEntityId(value.id) || !metadataValid(value.metadata, value.id)) errors.push(issue('invalid-identity', 'Identità o metadati contesto non validi'));
  if (!isValidInstituteReference(value.instituteRef)) errors.push(issue('invalid-institute-reference', 'Riferimento istituto non valido'));
  if (value.academicYearRef !== undefined && !isValidInstitutionalReference(value.academicYearRef, 'academic-year')) errors.push(issue('invalid-year-reference', 'Riferimento anno non valido'));
  if (value.siteRef !== undefined && !isValidInstitutionalReference(value.siteRef, 'institute-site')) errors.push(issue('invalid-site-reference', 'Riferimento sede non valido'));
  if (value.declaredActor !== undefined && (
    !isValidActorReference(value.declaredActor)
    || !object(value.declaredActor)
    || value.declaredActor.assertion !== 'self-declared'
    || !DECLARED_INSTITUTIONAL_ROLES.includes(value.declaredActor.role as never)
  )) errors.push(issue('invalid-actor-reference', 'Attore o ruolo dichiarato non valido'));
  return done(errors);
}

export function calculateInstitutionCompleteness(value?: unknown): InstitutionCompleteness {
  if (value === undefined || (object(value) && value.status === 'unconfigured')) return 'unconfigured';
  if (!validateInstitute(value).valid || !object(value)) return 'invalid';
  if (value.status === 'legacy-imported' || (object(value.metadata) && value.metadata.origin === 'legacy')) return 'legacy';
  const hasOrders = Array.isArray(value.schoolOrders) && value.schoolOrders.length > 0;
  const heading = object(value.documentProfile) && text(value.documentProfile.heading) && value.documentProfile.heading.trim();
  if (value.status === 'confirmed-local' && hasOrders && heading) return 'complete-local';
  if (value.mechanicalCode || heading || hasOrders && value.status === 'confirmed-local') return 'partial';
  return 'minimal';
}

function overlaps(a: AcademicYear, b: AcademicYear): boolean { return a.startsOn <= b.endsOn && b.startsOn <= a.endsOn; }

export function validateArchiveIntegrity(value: unknown): InstitutionValidationResult {
  if (!object(value)) return done([issue('invalid-archive', 'Archivio non valido')]);
  const errors: InstitutionValidationError[] = [];
  if (value.schemaVersion !== INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION) errors.push(issue('unsupported-schema', 'Versione archivio non supportata'));
  if (!text(value.updatedAt) || Number.isNaN(Date.parse(value.updatedAt))) errors.push(issue('invalid-updated-at', 'Data archivio non valida'));
  if ('activeAcademicYearRefs' in value) errors.push(issue('unknown-active-year-authority', 'Mappa anno attivo non supportata'));
  if (!Array.isArray(value.institutes) || !Array.isArray(value.academicYears) || !Array.isArray(value.sites) || !Array.isArray(value.contexts)) return done([...errors, issue('invalid-collections', 'Collezioni archivio non valide')]);
  const institutes = value.institutes as unknown[];
  const years = value.academicYears as unknown[];
  const sites = value.sites as unknown[];
  const contexts = value.contexts as unknown[];
  const archiveErrorCount = errors.length;
  institutes.forEach(item => errors.push(...validateInstitute(item).errors));
  years.forEach(item => errors.push(...validateAcademicYear(item).errors));
  sites.forEach(item => errors.push(...validateInstituteSite(item).errors));
  contexts.forEach(item => errors.push(...validateInstitutionalContext(item).errors));
  if (errors.length > archiveErrorCount) return done(errors);
  const validInstitutes = institutes.filter(object) as unknown as Institute[];
  const validYears = years.filter(object) as unknown as AcademicYear[];
  const validSites = sites.filter(object) as unknown as InstituteSite[];
  const validContexts = contexts.filter(object) as unknown as InstitutionalContext[];
  const allIds = [...validInstitutes, ...validYears, ...validSites, ...validContexts].map(item => item.id);
  if (new Set(allIds).size !== allIds.length) errors.push(issue('duplicate-id', 'Identificativi duplicati'));
  const instituteById = new Map(validInstitutes.map(item => [item.id, item]));
  const yearById = new Map(validYears.map(item => [item.id, item]));
  const siteById = new Map(validSites.map(item => [item.id, item]));
  const contextById = new Map(validContexts.map(item => [item.id, item]));
  for (const year of validYears) if (!instituteById.has(year.instituteRef?.id)) errors.push(issue('orphan-year', 'Anno riferito a istituto assente'));
  for (const site of validSites) if (!instituteById.has(site.instituteRef?.id)) errors.push(issue('orphan-site', 'Sede riferita a istituto assente'));
  for (const context of validContexts) {
    const owner = instituteById.get(context.instituteRef?.id);
    if (!owner) errors.push(issue('orphan-context', 'Contesto riferito a istituto assente'));
    const year = context.academicYearRef ? yearById.get(context.academicYearRef.id) : undefined;
    const site = context.siteRef ? siteById.get(context.siteRef.id) : undefined;
    if (context.academicYearRef && (!year || year.instituteRef.id !== context.instituteRef.id || year.status === 'archived')) errors.push(issue('cross-owner-year', 'Anno del contesto non appartiene all’istituto o è archiviato'));
    if (context.siteRef && (!site || site.instituteRef.id !== context.instituteRef.id || site.status === 'archived')) errors.push(issue('cross-owner-site', 'Sede del contesto non appartiene all’istituto o è archiviata'));
  }
  for (const institute of validInstitutes) {
    const ownedYears = validYears.filter(year => year.instituteRef.id === institute.id);
    const active = ownedYears.filter(year => year.status === 'active');
    if (active.length > 1) errors.push(issue('multiple-active-years', 'È ammesso un solo anno attivo'));
    if (institute.activeAcademicYearRef) {
      const target = yearById.get(institute.activeAcademicYearRef.id);
      if (!target || target.instituteRef.id !== institute.id || target.status !== 'active') errors.push(issue('broken-active-year', 'Riferimento anno attivo non coerente'));
    }
    if (institute.status !== 'confirmed-local' && (institute.activeAcademicYearRef || active.length > 0)) errors.push(issue('inactive-institute-active-year', 'Solo un istituto confermato localmente può avere un anno attivo'));
    if (active.length === 1 && institute.activeAcademicYearRef?.id !== active[0].id) errors.push(issue('missing-active-year-reference', 'Anno attivo privo del riferimento istituto'));
    for (let i = 0; i < ownedYears.length; i += 1) for (let j = i + 1; j < ownedYears.length; j += 1) if (ownedYears[i].status !== 'archived' && ownedYears[j].status !== 'archived' && overlaps(ownedYears[i], ownedYears[j])) errors.push(issue('overlapping-years', 'Anni scolastici sovrapposti'));
    const ownedSites = validSites.filter(site => site.instituteRef.id === institute.id && site.status !== 'archived');
    if (ownedSites.filter(site => site.isMain).length > 1) errors.push(issue('multiple-main-sites', 'Più sedi principali'));
    const names = ownedSites.map(site => site.name.trim().toLocaleLowerCase('it'));
    if (new Set(names).size !== names.length) errors.push(issue('duplicate-site', 'Sede duplicata'));
  }
  if (value.activeInstituteRef !== undefined) {
    if (!isValidInstituteReference(value.activeInstituteRef)) errors.push(issue('invalid-active-institute-reference', 'Riferimento istituto attivo non valido'));
    else {
      const active = instituteById.get(value.activeInstituteRef.id);
      if (!active || active.status !== 'confirmed-local') errors.push(issue('inactive-active-institute', 'Solo un istituto confermato localmente può essere attivo'));
    }
  }
  if (value.currentContextRef !== undefined) {
    if (!isValidInstitutionalReference(value.currentContextRef, 'institutional-context')) errors.push(issue('invalid-current-context-reference', 'Riferimento contesto corrente non valido'));
    else {
      const current = contextById.get(value.currentContextRef.id);
      if (!current) errors.push(issue('orphan-current-context', 'Contesto corrente assente'));
      else {
        const activeInstituteRef = value.activeInstituteRef;
        if (!object(activeInstituteRef) || current.instituteRef.id !== activeInstituteRef.id) errors.push(issue('active-context-mismatch', 'Contesto corrente e istituto attivo non coincidono'));
      }
    }
  }
  return done(errors);
}
