/**
 * CML-633B — Canonical Identity Validators
 *
 * Validatori puri per i contratti di identità e metadati.
 * Nessun accesso al DOM, nessun effetto collaterale, risultati deterministici.
 */

import type {
  EntityId,
  SchemaVersion,
  ContentOrigin,
  ActorReference,
  EntityReference,
  EntityType,
  EntityMetadata,
  MigrationMetadata,
  MigrationStatus,
} from './types';

import {
  CURRENT_SCHEMA_VERSION,
  CONTENT_ORIGIN_REGISTRY,
  VALID_ENTITY_TYPES,
} from './types';

// ─── Validation Result ───────────────────────────────────────────────────────

/**
 * Risultato di validazione discriminato.
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Errore di validazione tipizzato.
 */
export interface ValidationError {
  code: string;
  message: string;
  path?: string;
}

// ─── Entity ID Validators ────────────────────────────────────────────────────

/**
 * Valida che una stringa sia un EntityId valido.
 *
 * Regole:
 * - Non vuoto
 * - Stringa non vuota dopo trim
 * - Lunghezza minima 8 caratteri
 * - Solo caratteri alfanumerici e trattini (UUID format)
 */
export function isValidEntityId(value: unknown): value is EntityId {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < 8) return false;
  // UUID format: 8-4-4-4-12 or similar stable format
  return /^[a-f0-9-]+$/i.test(trimmed);
}

// ─── Schema Version Validators ───────────────────────────────────────────────

/**
 * Valida che un numero sia uno SchemaVersion valido.
 */
export function isValidSchemaVersion(value: unknown): value is SchemaVersion {
  if (typeof value !== 'number') return false;
  if (!Number.isInteger(value)) return false;
  if (value < 1) return false;
  return true;
}

/**
 * Verifica se una versione dello schema è supportata.
 */
export function isSupportedSchemaVersion(
  version: SchemaVersion,
  _entityType: EntityType
): boolean {
  // Per ora supportiamo solo la versione corrente
  // In futuro si potranno gestire versioni multiple per EntityType
  return version <= CURRENT_SCHEMA_VERSION;
}

// ─── Content Origin Validators ───────────────────────────────────────────────

/**
 * Valida che una stringa sia un ContentOrigin valido.
 */
export function isValidContentOrigin(value: unknown): value is ContentOrigin {
  if (typeof value !== 'string') return false;
  return CONTENT_ORIGIN_REGISTRY.has(value as ContentOrigin);
}

// ─── Actor Reference Validators ──────────────────────────────────────────────

/**
 * Valida che un oggetto sia un ActorReference valido.
 *
 * Regole:
 * - displayName obbligatorio e non vuoto
 * - role obbligatorio e valido
 * - assertion obbligatorio e valido
 * - id opzionale ma se presente deve essere EntityId valido
 */
export function isValidActorReference(value: unknown): value is ActorReference {
  if (typeof value !== 'object' || value === null) return false;

  const obj = value as Record<string, unknown>;

  // displayName obbligatorio
  if (typeof obj.displayName !== 'string' || obj.displayName.trim().length === 0) {
    return false;
  }

  // role obbligatorio
  if (typeof obj.role !== 'string') return false;

  // assertion obbligatorio
  if (typeof obj.assertion !== 'string') return false;
  if (!['self-declared', 'imported', 'system'].includes(obj.assertion)) {
    return false;
  }

  // id opzionale ma se presente deve essere valido
  if (obj.id !== undefined && !isValidEntityId(obj.id)) {
    return false;
  }

  return true;
}

// ─── Entity Reference Validators ─────────────────────────────────────────────

/**
 * Valida che un oggetto sia un EntityReference valido.
 *
 * Regole:
 * - id obbligatorio e valido
 * - entityType obbligatorio e valido
 * - snapshotLabel opzionale
 */
export function isValidEntityReference(value: unknown): value is EntityReference {
  if (typeof value !== 'object' || value === null) return false;

  const obj = value as Record<string, unknown>;

  // id obbligatorio
  if (!isValidEntityId(obj.id)) return false;

  // entityType obbligatorio e valido
  if (typeof obj.entityType !== 'string') return false;
  if (!VALID_ENTITY_TYPES.includes(obj.entityType as EntityType)) return false;

  return true;
}

// ─── Entity Type Validators ──────────────────────────────────────────────────

/**
 * Valida che una stringa sia un EntityType valido.
 */
export function isValidEntityType(value: unknown): value is EntityType {
  if (typeof value !== 'string') return false;
  return VALID_ENTITY_TYPES.includes(value as EntityType);
}

// ─── Migration Status Validators ─────────────────────────────────────────────

const VALID_MIGRATION_STATUSES: readonly MigrationStatus[] = [
  'native-canonical',
  'migrated-automatic',
  'migrated-incomplete',
  'imported-legacy',
  'requires-confirmation',
  'non-migrable',
  'archived-historical',
] as const;

/**
 * Valida che una stringa sia un MigrationStatus valido.
 */
export function isValidMigrationStatus(value: unknown): value is MigrationStatus {
  if (typeof value !== 'string') return false;
  return VALID_MIGRATION_STATUSES.includes(value as MigrationStatus);
}

/**
 * Valida che un oggetto sia un MigrationMetadata valido.
 */
export function isValidMigrationMetadata(value: unknown): value is MigrationMetadata {
  if (typeof value !== 'object' || value === null) return false;

  const obj = value as Record<string, unknown>;

  // status obbligatorio
  if (!isValidMigrationStatus(obj.status)) return false;

  return true;
}

// ─── Entity Metadata Validators ──────────────────────────────────────────────

/**
 * Valida che un oggetto sia un EntityMetadata valido.
 *
 * Regole:
 * - id obbligatorio e valido
 * - createdAt obbligatorio e formato ISO 8601
 * - updatedAt obbligatorio e formato ISO 8601
 * - origin obbligatorio e valido
 * - schemaVersion obbligatorio e valido
 * - createdBy opzionale ma se presente deve essere valido
 * - updatedBy opzionale ma se presente deve essere valido
 * - migration opzionale ma se presente deve essere valido
 */
export function isValidMetadata(value: unknown): value is EntityMetadata {
  if (typeof value !== 'object' || value === null) return false;

  const obj = value as Record<string, unknown>;

  // id obbligatorio
  if (!isValidEntityId(obj.id)) return false;

  // createdAt obbligatorio e formato ISO 8601
  if (typeof obj.createdAt !== 'string') return false;
  if (!isValidISO8601(obj.createdAt)) return false;

  // updatedAt obbligatorio e formato ISO 8601
  if (typeof obj.updatedAt !== 'string') return false;
  if (!isValidISO8601(obj.updatedAt)) return false;

  // origin obbligatorio e valido
  if (!isValidContentOrigin(obj.origin)) return false;

  // schemaVersion obbligatorio e valido
  if (!isValidSchemaVersion(obj.schemaVersion)) return false;

  // createdBy opzionale
  if (obj.createdBy !== undefined && !isValidActorReference(obj.createdBy)) return false;

  // updatedBy opzionale
  if (obj.updatedBy !== undefined && !isValidActorReference(obj.updatedBy)) return false;

  // migration opzionale
  if (obj.migration !== undefined && !isValidMigrationMetadata(obj.migration)) return false;

  return true;
}

// ─── Date Validators ─────────────────────────────────────────────────────────

/**
 * Valida che una stringa sia in formato ISO 8601.
 */
function isValidISO8601(value: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!iso8601Regex.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// ─── Duplicate Detection ─────────────────────────────────────────────────────

/**
 * Rileva duplicati in una collezione di EntityMetadata.
 */
export function detectDuplicates(
  items: EntityMetadata[]
): { id: EntityId; count: number }[] {
  const counts = new Map<EntityId, number>();
  for (const item of items) {
    counts.set(item.id, (counts.get(item.id) || 0) + 1);
  }
  const duplicates: { id: EntityId; count: number }[] = [];
  for (const [id, count] of counts) {
    if (count > 1) {
      duplicates.push({ id, count });
    }
  }
  return duplicates;
}

// ─── Referential Integrity ───────────────────────────────────────────────────

/**
 * Verifica l'integrità referenziale tra riferimenti e entità esistenti.
 */
export function checkReferentialIntegrity(
  references: EntityReference[],
  existingIds: Set<EntityId>
): { broken: EntityReference[]; valid: EntityReference[] } {
  const broken: EntityReference[] = [];
  const valid: EntityReference[] = [];

  for (const ref of references) {
    if (existingIds.has(ref.id)) {
      valid.push(ref);
    } else {
      broken.push(ref);
    }
  }

  return { broken, valid };
}
