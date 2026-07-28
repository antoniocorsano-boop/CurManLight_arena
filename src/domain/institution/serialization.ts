import type { EntityId } from '../curriculum/identity';
import { cloneInstitutionalValue } from './constructors';
import { INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION } from './vocabularies';
import { validateArchiveIntegrity } from './validators';
import type { InstitutionalArchive, InstitutionalBackupEnvelope, InstitutionalImportPreview, InstitutionalImportResolution, InstitutionalImportResult } from './types';

export interface InstitutionalDeserializationResult { success: boolean; envelope?: InstitutionalBackupEnvelope; errors: string[] }

export function serializeInstitutionalArchive(archive: InstitutionalArchive, exportedAt = new Date().toISOString()): string {
  const checked = validateArchiveIntegrity(archive);
  if (!checked.valid) throw new Error(`Archivio istituzionale non valido: ${checked.errors.map(item => item.code).join(', ')}`);
  return JSON.stringify({ schemaVersion: INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION, exportedAt, archive: cloneInstitutionalValue(archive) } satisfies InstitutionalBackupEnvelope);
}

export function deserializeInstitutionalArchive(json: string): InstitutionalDeserializationResult {
  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return { success: false, errors: ['Envelope non valido'] };
    const envelope = parsed as Partial<InstitutionalBackupEnvelope>;
    if (envelope.schemaVersion !== INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION) return { success: false, errors: [`Versione schema ${String(envelope.schemaVersion)} non supportata`] };
    if (typeof envelope.exportedAt !== 'string' || Number.isNaN(Date.parse(envelope.exportedAt)) || !envelope.archive) return { success: false, errors: ['Envelope malformato'] };
    const checked = validateArchiveIntegrity(envelope.archive);
    if (!checked.valid) return { success: false, errors: checked.errors.map(item => `${item.code}: ${item.message}`) };
    return { success: true, envelope: { schemaVersion: envelope.schemaVersion, exportedAt: envelope.exportedAt, archive: cloneInstitutionalValue(envelope.archive) }, errors: [] };
  } catch (cause) { return { success: false, errors: [`JSON non valido: ${cause instanceof Error ? cause.message : 'errore sconosciuto'}`] }; }
}

function items(archive: InstitutionalArchive): Map<EntityId, unknown> { return new Map([...archive.institutes, ...archive.academicYears, ...archive.sites, ...archive.contexts].map(item => [item.id, item])); }

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function fingerprintInstitutionalArchive(archive: InstitutionalArchive): string {
  const input = canonicalJson(archive);
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function importDiff(current: InstitutionalArchive, incoming: InstitutionalArchive): Pick<InstitutionalImportPreview, 'additions' | 'updates' | 'conflicts'> {
  const currentItems = items(current);
  const incomingItems = items(incoming);
  const additions: EntityId[] = [];
  const updates: EntityId[] = [];
  const conflicts: EntityId[] = [];
  for (const [id, item] of incomingItems) {
    const existing = currentItems.get(id);
    if (!existing) additions.push(id);
    else if (canonicalJson(existing) !== canonicalJson(item)) {
      updates.push(id);
      conflicts.push(id);
    }
  }
  return { additions, updates, conflicts };
}

function sameIds(left: EntityId[], right: EntityId[]): boolean {
  return [...left].sort().join('|') === [...right].sort().join('|');
}

export function previewInstitutionalImport(current: InstitutionalArchive, json: string): InstitutionalImportPreview {
  const currentCheck = validateArchiveIntegrity(current); if (!currentCheck.valid) return { success: false, additions: [], updates: [], conflicts: [], errors: currentCheck.errors.map(item => item.message) };
  const parsed = deserializeInstitutionalArchive(json); if (!parsed.success || !parsed.envelope) return { success: false, additions: [], updates: [], conflicts: [], errors: parsed.errors };
  const incomingArchive = cloneInstitutionalValue(parsed.envelope.archive);
  const diff = importDiff(current, incomingArchive);
  return {
    success: true,
    incomingArchive,
    ...diff,
    baseFingerprint: fingerprintInstitutionalArchive(current),
    incomingFingerprint: fingerprintInstitutionalArchive(incomingArchive),
    errors: [],
  };
}

export function applyInstitutionalImport(current: InstitutionalArchive, preview: InstitutionalImportPreview, resolution?: InstitutionalImportResolution): InstitutionalImportResult {
  const currentCopy = cloneInstitutionalValue(current); const incomingCopy = preview.incomingArchive ? cloneInstitutionalValue(preview.incomingArchive) : undefined;
  if (!preview.success || !incomingCopy) return { success: false, errors: [...preview.errors] };
  const currentCheck = validateArchiveIntegrity(currentCopy); const incomingCheck = validateArchiveIntegrity(incomingCopy);
  if (!currentCheck.valid || !incomingCheck.valid) return { success: false, errors: [...currentCheck.errors, ...incomingCheck.errors].map(item => item.message) };
  if (preview.baseFingerprint !== fingerprintInstitutionalArchive(currentCopy)) return { success: false, errors: ['La base è cambiata dopo l’anteprima'] };
  if (preview.incomingFingerprint !== fingerprintInstitutionalArchive(incomingCopy)) return { success: false, errors: ['Il contenuto dell’anteprima è stato modificato'] };
  const recomputed = importDiff(currentCopy, incomingCopy);
  if (!sameIds(preview.additions, recomputed.additions) || !sameIds(preview.updates, recomputed.updates) || !sameIds(preview.conflicts, recomputed.conflicts)) return { success: false, errors: ['Il riepilogo dell’anteprima è stato modificato'] };
  const resolved = resolution?.resolvedConflictIds ?? [];
  if (!sameIds(resolved, recomputed.conflicts)) return { success: false, errors: ['Tutti e soli i conflitti devono essere risolti esplicitamente'] };
  return { success: true, archive: incomingCopy, previousArchive: currentCopy, errors: [] };
}

export function rollbackInstitutionalImport(result: InstitutionalImportResult): InstitutionalArchive | undefined { return result.previousArchive ? cloneInstitutionalValue(result.previousArchive) : undefined; }
