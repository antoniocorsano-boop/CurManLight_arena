import { createLegacyMetadata } from '../curriculum/identity';
import { SCHOOL_ORDERS } from '../curriculum/model/vocabularies';
import { cloneInstitutionalValue, createEmptyInstitutionalArchive, createInstituteSite } from './constructors';
import type { Institute, InstituteAddress, LegacyInstitutionImportResult, LegacyInstitutionSource } from './types';

function addressObject(value: unknown): { address?: InstituteAddress; invalid: boolean } {
  if (value === undefined || value === null || value === '') return { invalid: false };
  if (typeof value === 'string') return value.trim() ? { address: { street: value.trim() }, invalid: false } : { invalid: true };
  if (typeof value !== 'object' || Array.isArray(value)) return { invalid: true };
  const source = value as Record<string, unknown>;
  const address: InstituteAddress = {};
  let invalid = false;
  for (const field of ['street', 'city', 'province', 'postalCode', 'country'] as const) {
    if (source[field] === undefined) continue;
    if (typeof source[field] === 'string') address[field] = source[field].trim();
    else invalid = true;
  }
  return { address: Object.values(address).some(Boolean) ? address : undefined, invalid: invalid || Object.keys(source).some(key => !['street', 'city', 'province', 'postalCode', 'country'].includes(key)) };
}

export function importLegacyInstitutions(sources: LegacyInstitutionSource[], now = new Date().toISOString()): LegacyInstitutionImportResult {
  const archive = createEmptyInstitutionalArchive(now); const warnings: string[] = []; const addresses = new Map<string, Set<string>>();
  const records: unknown[] = Array.isArray(sources) ? cloneInstitutionalValue(sources) : [];
  for (const rawSource of records) {
    const source = rawSource && typeof rawSource === 'object' && !Array.isArray(rawSource) ? rawSource as Record<string, unknown> : {};
    const origin = typeof source.origin === 'string' && source.origin.trim() ? source.origin.trim() : 'origine sconosciuta';
    const name = typeof source.name === 'string' ? source.name.trim() : '';
    const rawOrders = Array.isArray(source.schoolOrders) ? source.schoolOrders : [];
    const missing: string[] = []; if (!name) missing.push('name'); if (!rawOrders.length) missing.push('schoolOrders');
    const itemWarnings = missing.map(field => `Campo mancante (${origin}): ${field}`);
    if (source.origin !== undefined && typeof source.origin !== 'string') itemWarnings.push('Origine legacy non valida: usata etichetta neutra');
    const schoolOrders = [...new Set(rawOrders.filter((order): order is Institute['schoolOrders'][number] => typeof order === 'string' && SCHOOL_ORDERS.includes(order as never)))];
    if (schoolOrders.length !== rawOrders.length) itemWarnings.push(`Ordine scolastico legacy non valido o duplicato (${origin}): valore omesso`);
    const rawCode = typeof source.mechanicalCode === 'string' ? source.mechanicalCode.trim().toUpperCase() : '';
    const mechanicalCode = rawCode && /^[A-Z0-9-]{6,20}$/.test(rawCode) ? rawCode : undefined;
    if ((source.mechanicalCode !== undefined && typeof source.mechanicalCode !== 'string') || (rawCode && !mechanicalCode)) itemWarnings.push(`Codice meccanografico legacy non valido (${origin}): valore omesso`);
    const normalizedAddress = addressObject(source.address);
    if (normalizedAddress.invalid) itemWarnings.push(`Indirizzo legacy non valido (${origin}): valore omesso o normalizzato`);
    const metadata = createLegacyMetadata(now, undefined, missing, itemWarnings);
    const institute: Institute = { id: metadata.id, metadata, name: name || `Candidato legacy da ${origin}`, mechanicalCode, schoolOrders, status: 'legacy-imported' };
    archive.institutes.push(institute); warnings.push(...itemWarnings);
    const address = normalizedAddress.address;
    if (address) {
      const site = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute', snapshotLabel: institute.name }, name: `Sede importata da ${origin}`, isMain: false, address, status: 'legacy-imported' }, now);
      archive.sites.push(site); const key = institute.name.toLocaleLowerCase('it'); const values = addresses.get(key) ?? new Set<string>(); values.add(JSON.stringify(address)); addresses.set(key, values);
    }
  }
  for (const values of addresses.values()) if (values.size > 1) warnings.push('Conflitto tra indirizzi legacy: i candidati restano separati e non vengono uniti');
  return { archive: cloneInstitutionalValue(archive), warnings: [...warnings] };
}
export const adaptLegacyInstitutions = importLegacyInstitutions;
