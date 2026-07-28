import type { SchoolOrder } from '../../types/curriculum';
import { cloneInstitutionalValue, createNeutralDocumentProfile } from './constructors';
import { calculateInstitutionCompleteness, validateArchiveIntegrity, validateInstitute } from './validators';
import type { A07InstitutionalDocumentProjection, A07InstitutionalDocumentRead, AcademicYear, Institute, InstituteAddress, InstituteSite, InstitutionalArchive, InstitutionalContext, InstitutionCompleteness, ResolvedInstitutionalDocumentProfile } from './types';

export const NEUTRAL_INSTITUTE_NAME = 'Istituto non configurato';

export interface A04InstitutionalReadModel {
  configured: boolean;
  instituteName: string;
  mechanicalCode?: string;
  configuredOrders: SchoolOrder[];
  order?: SchoolOrder;
  orderAvailable: boolean;
  orderWarning?: string;
  academicYearLabel?: string;
  siteName?: string;
}

function validatedActiveInstitute(archive: InstitutionalArchive): Institute | undefined {
  if (!validateArchiveIntegrity(archive).valid) return undefined;
  const found = archive.institutes.find(item => item.id === archive.activeInstituteRef?.id);
  if (!found || !validateInstitute(found).valid || found.status === 'archived' || found.status === 'legacy-imported') return undefined;
  return found;
}

export function getActiveInstitute(archive: InstitutionalArchive): Institute | undefined { const found = validatedActiveInstitute(archive); return found ? cloneInstitutionalValue(found) : undefined; }
export function getNeutralInstituteName(archive: InstitutionalArchive): string { return getActiveInstitute(archive)?.name || NEUTRAL_INSTITUTE_NAME; }
export function getActiveAcademicYear(archive: InstitutionalArchive): AcademicYear | undefined { const institute = validatedActiveInstitute(archive); const found = institute?.activeAcademicYearRef ? archive.academicYears.find(year => year.id === institute.activeAcademicYearRef?.id && year.instituteRef.id === institute.id && year.status === 'active') : undefined; return found ? cloneInstitutionalValue(found) : undefined; }
export function getConfiguredSchoolOrders(archive: InstitutionalArchive): SchoolOrder[] { return [...(validatedActiveInstitute(archive)?.schoolOrders ?? [])]; }
export function getMainInstituteSite(archive: InstitutionalArchive): InstituteSite | undefined { const institute = validatedActiveInstitute(archive); const found = institute ? archive.sites.find(site => site.instituteRef.id === institute.id && site.isMain && site.status !== 'archived') : undefined; return found ? cloneInstitutionalValue(found) : undefined; }
export function getInstitutionalDocumentProfile(archive: InstitutionalArchive): ResolvedInstitutionalDocumentProfile { const institute = validatedActiveInstitute(archive); return institute ? { ...cloneInstitutionalValue(institute.documentProfile ?? {}), instituteName: institute.name } : createNeutralDocumentProfile(); }
export function getInstitutionCompleteness(archive: InstitutionalArchive): InstitutionCompleteness { return calculateInstitutionCompleteness(validatedActiveInstitute(archive)); }
export function getCurrentInstitutionalContext(archive: InstitutionalArchive): InstitutionalContext | undefined { const institute = validatedActiveInstitute(archive); const found = institute ? archive.contexts.find(item => item.id === archive.currentContextRef?.id && item.instituteRef.id === institute.id) : undefined; return found ? cloneInstitutionalValue(found) : undefined; }
export function getInstitutionalWarnings(archive: InstitutionalArchive): string[] { const warnings: string[] = []; if (!validateArchiveIntegrity(archive).valid) warnings.push('La configurazione istituzionale contiene dati non validi'); const completeness = getInstitutionCompleteness(archive); if (completeness !== 'complete-local') warnings.push('Configurazione istituzionale incompleta: verificare l’intestazione prima dell’esportazione'); else warnings.push('Configurazione confermata localmente: non verificata, ufficiale o autenticata'); return warnings; }
export function getDeclaredRoleWording(archive: InstitutionalArchive): string | undefined { const actor = getCurrentInstitutionalContext(archive)?.declaredActor; return actor ? `Ruolo dichiarato per questa sessione: ${actor.role}` : undefined; }

function formatInstituteAddress(address?: InstituteAddress): string | undefined {
  if (!address) return undefined;
  const locality = [address.postalCode, address.city].filter(Boolean).join(' ');
  const province = address.province ? `(${address.province})` : '';
  return [address.street, [locality, province].filter(Boolean).join(' ')].filter(Boolean).join(', ') || undefined;
}

export function getA07InstitutionalDocumentRead(archive: InstitutionalArchive): A07InstitutionalDocumentRead {
  const institute = validatedActiveInstitute(archive);
  if (!institute) return {
    configured: false,
    instituteName: NEUTRAL_INSTITUTE_NAME,
    organizationId: 'curmanlight-local',
    warning: 'Configurazione istituzionale incompleta: l’esportazione userà un’intestazione neutra.',
  };

  const context = getCurrentInstitutionalContext(archive);
  const site = archive.sites.find(item =>
    item.id === context?.siteRef?.id
    && item.instituteRef.id === institute.id
    && item.status !== 'archived'
  ) ?? getMainInstituteSite(archive);
  const academicYear = archive.academicYears.find(year =>
    year.id === context?.academicYearRef?.id
    && year.instituteRef.id === institute.id
    && year.status === 'active'
  ) ?? getActiveAcademicYear(archive);
  const completeness = calculateInstitutionCompleteness(institute);

  return {
    configured: true,
    ...cloneInstitutionalValue(institute.documentProfile ?? {}),
    instituteName: institute.name,
    mechanicalCode: institute.mechanicalCode,
    siteName: site?.name,
    siteAddress: formatInstituteAddress(site?.address),
    academicYearLabel: academicYear?.label,
    ...(context?.declaredActor ? { declaredRole: context.declaredActor.role } : {}),
    organizationId: `institute-${institute.id}`,
    warning: completeness === 'complete-local'
      ? undefined
      : 'Configurazione istituzionale incompleta: verificare l’intestazione prima dell’esportazione.',
  };
}

export function projectA07InstitutionalDocumentHeader(profile: A07InstitutionalDocumentRead): A07InstitutionalDocumentProjection {
  const site = [profile.siteName, profile.siteAddress].filter(Boolean).join(' - ');
  return {
    ...(profile.heading ? { primaryHeading: profile.heading } : {}),
    displayName: profile.instituteName,
    secondaryLines: [
      profile.subheading,
      site ? `Sede: ${site}` : undefined,
      profile.mechanicalCode ? `Codice meccanografico: ${profile.mechanicalCode}` : undefined,
      profile.generalReferences ? `Riferimenti: ${profile.generalReferences}` : undefined,
      profile.academicYearLabel ? `Anno scolastico: ${profile.academicYearLabel}` : undefined,
    ].filter((line): line is string => Boolean(line)),
    ...(profile.footer ? { footer: profile.footer } : {}),
    ...(profile.declaredRole ? { declaredRoleLine: `Ruolo dichiarato: ${profile.declaredRole}` } : {}),
  };
}

export function getA04InstitutionalRead(
  archive: InstitutionalArchive,
  selectedOrder?: SchoolOrder,
  contextOrder?: SchoolOrder,
): A04InstitutionalReadModel {
  const institute = validatedActiveInstitute(archive);
  if (!institute) return {
    configured: false,
    instituteName: NEUTRAL_INSTITUTE_NAME,
    configuredOrders: [],
    order: selectedOrder,
    orderAvailable: selectedOrder !== undefined,
  };

  const context = getCurrentInstitutionalContext(archive);
  const academicYear = archive.academicYears.find(year =>
    year.id === context?.academicYearRef?.id
    && year.instituteRef.id === institute.id
    && year.status === 'active'
  ) ?? getActiveAcademicYear(archive);
  const site = archive.sites.find(item =>
    item.id === context?.siteRef?.id
    && item.instituteRef.id === institute.id
    && item.status !== 'archived'
  ) ?? getMainInstituteSite(archive);
  const configuredOrders = [...institute.schoolOrders];
  const contextOrderAvailable = contextOrder !== undefined && configuredOrders.includes(contextOrder);
  const order = contextOrderAvailable ? contextOrder : selectedOrder;
  const orderAvailable = order !== undefined && configuredOrders.includes(order);
  let orderWarning: string | undefined;
  if (contextOrder && !contextOrderAvailable) {
    orderWarning = orderAvailable
      ? `L'ordine del contesto ${contextOrder} non è configurato per l'istituto attivo; resta valido l'ordine selezionato ${order}.`
      : `L'ordine del contesto ${contextOrder} non è configurato per l'istituto attivo.`;
  } else if (order && !orderAvailable) {
    orderWarning = `L'ordine ${order} non è configurato per l'istituto attivo. Seleziona un ordine configurato prima di generare l'UDA.`;
  } else if (!order) {
    orderWarning = `Nessun ordine scolastico è stato selezionato per l'A04.`;
  }

  return {
    configured: true,
    instituteName: institute.name,
    mechanicalCode: institute.mechanicalCode,
    configuredOrders,
    order,
    orderAvailable,
    orderWarning,
    academicYearLabel: academicYear?.label,
    siteName: site?.name,
  };
}
