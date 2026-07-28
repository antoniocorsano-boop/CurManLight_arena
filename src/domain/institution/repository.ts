import type { ActorReference, EntityId } from '../curriculum/identity';
import { touchMetadata } from '../curriculum/identity';
import { cloneInstitutionalValue } from './constructors';
import { canTransitionInstituteStatus } from './vocabularies';
import { validateAcademicYear, validateArchiveIntegrity, validateInstitute, validateInstituteSite, validateInstitutionalContext } from './validators';
import type { AcademicYear, ArchiveOperationResult, Institute, InstituteSite, InstitutionalArchive, InstitutionalContext, InstitutionValidationError } from './types';

function fail(code: string, message: string): ArchiveOperationResult { return { success: false, errors: [{ code, message }] }; }
function accept(candidate: InstitutionalArchive, now = new Date().toISOString()): ArchiveOperationResult {
  const next = cloneInstitutionalValue({ ...candidate, updatedAt: now });
  const checked = validateArchiveIntegrity(next);
  return checked.valid ? { success: true, archive: next, errors: [] } : { success: false, errors: checked.errors };
}

export function addInstitute(archive: InstitutionalArchive, institute: Institute, now = new Date().toISOString()): ArchiveOperationResult {
  if (!validateInstitute(institute).valid) return fail('invalid-institute', 'Istituto non valido');
  if (archive.institutes.some(item => item.id === institute.id)) return fail('duplicate-id', 'Istituto già presente');
  const next = cloneInstitutionalValue(archive);
  next.institutes.push(cloneInstitutionalValue(institute));
  return accept(next, now);
}
export const createInstitute = addInstitute;
export function readInstitute(archive: InstitutionalArchive, id: EntityId): Institute | undefined { const found = archive.institutes.find(item => item.id === id); return found ? cloneInstitutionalValue(found) : undefined; }

export function updateInstitute(archive: InstitutionalArchive, id: EntityId, changes: Partial<Omit<Institute, 'id' | 'metadata'>>, now = new Date().toISOString(), actor?: ActorReference): ArchiveOperationResult {
  const current = archive.institutes.find(item => item.id === id);
  if (!current) return fail('not-found', 'Istituto non trovato');
  if (current.status === 'archived') return fail('archived-terminal', 'Un istituto archiviato non può essere modificato');
  if (changes.status && !canTransitionInstituteStatus(current.status, changes.status)) return fail('invalid-transition', 'Transizione non consentita');
  if (changes.status === 'archived') return fail('archive-operation-required', 'Usare l’operazione di archiviazione');
  const reviewedLegacy = current.status === 'legacy-imported' && changes.status === 'draft';
  const metadata = touchMetadata(reviewedLegacy ? { ...current.metadata, origin: 'imported' } : current.metadata, actor, now);
  const updated = cloneInstitutionalValue({ ...current, ...changes, id, metadata });
  if (!validateInstitute(updated).valid) return fail('invalid-institute', 'Modifica non valida');
  const next = cloneInstitutionalValue(archive);
  next.institutes = next.institutes.map(item => item.id === id ? updated : item);
  if (updated.status !== 'confirmed-local') {
    next.institutes = next.institutes.map(item => item.id === id ? { ...item, activeAcademicYearRef: undefined } : item);
    next.academicYears = next.academicYears.map(year => year.instituteRef.id === id && year.status === 'active' ? { ...year, status: 'closed', metadata: touchMetadata(year.metadata, actor, now) } : year);
    if (next.activeInstituteRef?.id === id) next.activeInstituteRef = undefined;
    const currentContext = next.contexts.find(context => context.id === next.currentContextRef?.id);
    if (currentContext?.instituteRef.id === id) next.currentContextRef = undefined;
  }
  return accept(next, now);
}

export function confirmInstitute(archive: InstitutionalArchive, id: EntityId, now = new Date().toISOString()): ArchiveOperationResult {
  const current = archive.institutes.find(item => item.id === id);
  if (!current || current.status !== 'draft') return fail('invalid-transition', 'Conferma locale consentita solo da bozza');
  return updateInstitute(archive, id, { status: 'confirmed-local' }, now);
}

export function archiveInstitute(archive: InstitutionalArchive, id: EntityId, now = new Date().toISOString()): ArchiveOperationResult {
  const current = archive.institutes.find(item => item.id === id);
  if (!current || current.status === 'archived' || !canTransitionInstituteStatus(current.status, 'archived')) return fail('invalid-transition', 'Archiviazione non consentita');
  const next = cloneInstitutionalValue(archive);
  next.institutes = next.institutes.map(item => item.id === id ? { ...item, status: 'archived', activeAcademicYearRef: undefined, metadata: touchMetadata(item.metadata, undefined, now) } : item);
  next.academicYears = next.academicYears.map(year => year.instituteRef.id === id && year.status === 'active' ? { ...year, status: 'closed', metadata: touchMetadata(year.metadata, undefined, now) } : year);
  if (next.activeInstituteRef?.id === id) next.activeInstituteRef = undefined;
  const currentContext = next.contexts.find(context => context.id === next.currentContextRef?.id);
  if (currentContext?.instituteRef.id === id) next.currentContextRef = undefined;
  return accept(next, now);
}

export function setActiveInstitute(archive: InstitutionalArchive, id?: EntityId, now = new Date().toISOString()): ArchiveOperationResult {
  const next = cloneInstitutionalValue(archive);
  if (!id) { next.activeInstituteRef = undefined; next.currentContextRef = undefined; return accept(next, now); }
  const institute = next.institutes.find(item => item.id === id);
  if (!institute || institute.status !== 'confirmed-local') return fail('not-activatable', 'Solo un istituto confermato localmente può essere attivato');
  next.activeInstituteRef = { id, entityType: 'institute', snapshotLabel: institute.name };
  const current = next.contexts.find(context => context.id === next.currentContextRef?.id);
  if (current && current.instituteRef.id !== id) next.currentContextRef = undefined;
  return accept(next, now);
}

export function addAcademicYear(archive: InstitutionalArchive, year: AcademicYear, now = new Date().toISOString()): ArchiveOperationResult {
  if (!validateAcademicYear(year).valid || year.status === 'active') return fail('invalid-academic-year', 'Anno non valido o già attivo senza selezione esplicita');
  if (!archive.institutes.some(item => item.id === year.instituteRef.id && item.status !== 'archived')) return fail('broken-reference', 'Istituto anno assente o archiviato');
  if (archive.academicYears.some(item => item.id === year.id)) return fail('duplicate-id', 'Anno già presente');
  const next = cloneInstitutionalValue(archive); next.academicYears.push(cloneInstitutionalValue(year)); return accept(next, now);
}
export function readAcademicYear(archive: InstitutionalArchive, id: EntityId): AcademicYear | undefined { const found = archive.academicYears.find(item => item.id === id); return found ? cloneInstitutionalValue(found) : undefined; }
export function updateAcademicYear(archive: InstitutionalArchive, id: EntityId, changes: Partial<Omit<AcademicYear, 'id' | 'metadata' | 'instituteRef'>>, now = new Date().toISOString()): ArchiveOperationResult {
  const current = archive.academicYears.find(item => item.id === id); if (!current) return fail('not-found', 'Anno non trovato');
  if (current.status === 'archived') return fail('archived-terminal', 'Un anno archiviato non può essere modificato');
  if (changes.status === 'active') return fail('active-requires-selection', 'Usare la selezione anno attivo');
  if (changes.status === 'archived') return fail('archive-operation-required', 'Usare l’operazione di archiviazione');
  const updated = cloneInstitutionalValue({ ...current, ...changes, id, instituteRef: current.instituteRef, metadata: touchMetadata(current.metadata, undefined, now) });
  if (!validateAcademicYear(updated).valid) return fail('invalid-academic-year', 'Modifica anno non valida');
  const next = cloneInstitutionalValue(archive); next.academicYears = next.academicYears.map(item => item.id === id ? updated : item); return accept(next, now);
}
export function archiveAcademicYear(archive: InstitutionalArchive, id: EntityId, now = new Date().toISOString()): ArchiveOperationResult {
  const year = archive.academicYears.find(item => item.id === id); if (!year) return fail('not-found', 'Anno non trovato');
  if (year.status === 'archived') return fail('archived-terminal', 'Anno già archiviato');
  const next = cloneInstitutionalValue(archive);
  next.academicYears = next.academicYears.map(item => item.id === id ? { ...item, status: 'archived', metadata: touchMetadata(item.metadata, undefined, now) } : item);
  next.institutes = next.institutes.map(item => item.activeAcademicYearRef?.id === id ? { ...item, activeAcademicYearRef: undefined, metadata: touchMetadata(item.metadata, undefined, now) } : item);
  next.contexts = next.contexts.map(context => context.academicYearRef?.id === id ? { ...context, academicYearRef: undefined, metadata: touchMetadata(context.metadata, undefined, now) } : context);
  return accept(next, now);
}
export function setActiveAcademicYear(archive: InstitutionalArchive, instituteId: EntityId, yearId: EntityId, now = new Date().toISOString()): ArchiveOperationResult {
  const target = archive.academicYears.find(year => year.id === yearId && year.instituteRef.id === instituteId && !['archived', 'legacy'].includes(year.status));
  if (!target || !archive.institutes.some(item => item.id === instituteId && item.status === 'confirmed-local')) return fail('not-found', 'Anno o istituto non attivabile');
  const next = cloneInstitutionalValue(archive);
  next.academicYears = next.academicYears.map(year => {
    if (year.instituteRef.id !== instituteId) return year;
    const status = year.id === yearId ? 'active' : year.status === 'active' ? 'closed' : year.status;
    return status === year.status ? year : { ...year, status, metadata: touchMetadata(year.metadata, undefined, now) };
  });
  next.institutes = next.institutes.map(item => item.id === instituteId && item.activeAcademicYearRef?.id !== yearId ? {
    ...item,
    activeAcademicYearRef: { id: yearId, entityType: 'academic-year', snapshotLabel: target.label },
    metadata: touchMetadata(item.metadata, undefined, now),
  } : item);
  return accept(next, now);
}

export function addInstituteSite(archive: InstitutionalArchive, site: InstituteSite, now = new Date().toISOString()): ArchiveOperationResult {
  if (!validateInstituteSite(site).valid) return fail('invalid-site', 'Sede non valida');
  if (!archive.institutes.some(item => item.id === site.instituteRef.id && item.status !== 'archived')) return fail('broken-reference', 'Istituto sede assente o archiviato');
  if (archive.sites.some(item => item.id === site.id)) return fail('duplicate-id', 'Sede già presente');
  const next = cloneInstitutionalValue(archive); next.sites.push(cloneInstitutionalValue(site)); return accept(next, now);
}
export function readInstituteSite(archive: InstitutionalArchive, id: EntityId): InstituteSite | undefined { const found = archive.sites.find(item => item.id === id); return found ? cloneInstitutionalValue(found) : undefined; }
export function updateInstituteSite(archive: InstitutionalArchive, id: EntityId, changes: Partial<Omit<InstituteSite, 'id' | 'metadata' | 'instituteRef'>>, now = new Date().toISOString()): ArchiveOperationResult {
  const current = archive.sites.find(item => item.id === id); if (!current) return fail('not-found', 'Sede non trovata');
  if (current.status === 'archived') return fail('archived-terminal', 'Una sede archiviata non può essere modificata');
  if (changes.status === 'archived') return fail('archive-operation-required', 'Usare l’operazione di archiviazione');
  const updated = cloneInstitutionalValue({ ...current, ...changes, id, instituteRef: current.instituteRef, metadata: touchMetadata(current.metadata, undefined, now) });
  if (!validateInstituteSite(updated).valid) return fail('invalid-site', 'Modifica sede non valida');
  const next = cloneInstitutionalValue(archive); next.sites = next.sites.map(item => item.id === id ? updated : item); return accept(next, now);
}
export function archiveInstituteSite(archive: InstitutionalArchive, id: EntityId, now = new Date().toISOString()): ArchiveOperationResult {
  const site = archive.sites.find(item => item.id === id); if (!site) return fail('not-found', 'Sede non trovata');
  if (site.status === 'archived') return fail('archived-terminal', 'Sede già archiviata');
  const next = cloneInstitutionalValue(archive); next.sites = next.sites.map(item => item.id === id ? { ...item, status: 'archived', isMain: false, metadata: touchMetadata(item.metadata, undefined, now) } : item);
  next.contexts = next.contexts.map(context => context.siteRef?.id === id ? { ...context, siteRef: undefined, metadata: touchMetadata(context.metadata, undefined, now) } : context); return accept(next, now);
}

export function setInstitutionalContext(archive: InstitutionalArchive, context: InstitutionalContext, now = new Date().toISOString()): ArchiveOperationResult {
  if (!validateInstitutionalContext(context).valid) return fail('invalid-context', 'Contesto non valido');
  const owner = archive.institutes.find(item => item.id === context.instituteRef.id);
  if (!owner || owner.status !== 'confirmed-local' || archive.activeInstituteRef?.id !== owner.id) return fail('active-context-mismatch', 'Il contesto deve appartenere all’istituto confermato e attivo');
  if (context.academicYearRef && !archive.academicYears.some(year => year.id === context.academicYearRef?.id && year.instituteRef.id === owner.id && year.status !== 'archived')) return fail('cross-owner-year', 'Anno del contesto non appartiene all’istituto o è archiviato');
  if (context.siteRef && !archive.sites.some(site => site.id === context.siteRef?.id && site.instituteRef.id === owner.id && site.status !== 'archived')) return fail('cross-owner-site', 'Sede del contesto non appartiene all’istituto o è archiviata');
  const next = cloneInstitutionalValue(archive);
  next.contexts = next.contexts.some(item => item.id === context.id)
    ? next.contexts.map(item => item.id === context.id ? { ...cloneInstitutionalValue(context), metadata: touchMetadata(item.metadata, context.declaredActor, now) } : item)
    : [...next.contexts, cloneInstitutionalValue(context)];
  next.currentContextRef = { id: context.id, entityType: 'institutional-context' };
  return accept(next, now);
}

export function checkInstitutionalArchive(archive: InstitutionalArchive): InstitutionValidationError[] { return validateArchiveIntegrity(archive).errors; }
