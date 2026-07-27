/**
 * CML-633B — Serialization Utilities
 *
 * Funzioni condivise per serializzazione e deserializzazione.
 * Formato JSON locale, nessuna perdita silenziosa, errori leggibili.
 */

import type {
  EntityId,
  EntityMetadata,
  EntityType,
  EntityReference,
} from './types';

import {
  isValidEntityId,
  isValidMetadata,
  isValidEntityReference,
  isSupportedSchemaVersion,
} from './validators';

import { CURRENT_SCHEMA_VERSION } from './types';

// ─── Serialization Result ────────────────────────────────────────────────────

/**
 * Risultato di deserializzazione discriminato.
 */
export interface DeserializationResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
}

// ─── Serialization ───────────────────────────────────────────────────────────

/**
 * Serializza un oggetto canonico in JSON.
 *
 * Regole:
 * - Preserva tutti i campi
 * - Preserva gli identificativi
 * - Gestisce le date in formato ISO 8601
 * - Non esegue contenuti
 * - Non interpreta HTML
 */
export function serialize<T>(data: T): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`Serializzazione fallita: ${error instanceof Error ? error.message : 'errore sconosciuto'}`);
  }
}

/**
 * Deserializza JSON in un oggetto.
 *
 * Regole:
 * - Preserva gli identificativi
 * - Preserva le date in formato ISO 8601
 * - Campi sconosciuti preservati
 * - Errori leggibili
 * - Nessuna esecuzione di contenuti
 */
export function deserialize<T>(json: string): DeserializationResult<T> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const data = JSON.parse(json) as T;
    return { success: true, data, errors, warnings };
  } catch (error) {
    errors.push(`Parsing JSON fallito: ${error instanceof Error ? error.message : 'errore sconosciuto'}`);
    return { success: false, errors, warnings };
  }
}

// ─── Metadata Serialization ──────────────────────────────────────────────────

/**
 * Serializza EntityMetadata preservando tutti i campi.
 */
export function serializeMetadata(metadata: EntityMetadata): string {
  return serialize(metadata);
}

/**
 * Deserializza EntityMetadata con validazione.
 */
export function deserializeMetadata(json: string): DeserializationResult<EntityMetadata> {
  const result = deserialize<EntityMetadata>(json);

  if (!result.success) {
    return result;
  }

  // Validazione
  if (!isValidMetadata(result.data)) {
    result.errors.push('Metadati non validi dopo deserializzazione');
    result.success = false;
    return result;
  }

  // Controllo versione schema
  if (!isSupportedSchemaVersion(result.data.schemaVersion, 'event' as EntityType)) {
    result.warnings.push(`Versione schema ${result.data.schemaVersion} non supportata`);
  }

  return result;
}

// ─── Entity Reference Serialization ──────────────────────────────────────────

/**
 * Serializza un EntityReference.
 */
export function serializeEntityReference(ref: EntityReference): string {
  return serialize(ref);
}

/**
 * Deserializza un EntityReference con validazione.
 */
export function deserializeEntityReference(json: string): DeserializationResult<EntityReference> {
  const result = deserialize<EntityReference>(json);

  if (!result.success) {
    return result;
  }

  // Validazione
  if (!isValidEntityReference(result.data)) {
    result.errors.push('Riferimento entità non valido dopo deserializzazione');
    result.success = false;
    return result;
  }

  return result;
}

// ─── Batch Serialization ─────────────────────────────────────────────────────

/**
 * Serializza una collezione di oggetti.
 */
export function serializeBatch<T>(items: T[]): string {
  return serialize(items);
}

/**
 * Deserializza una collezione di oggetti con validazione individuale.
 */
export function deserializeBatch<T>(
  json: string,
  validator: (item: unknown) => item is T
): DeserializationResult<T[]> {
  const result = deserialize<T[]>(json);

  if (!result.success) {
    return result;
  }

  // Validazione individuale
  const validItems: T[] = [];
  const invalidItems: { index: number; errors: string[] }[] = [];

  if (!Array.isArray(result.data)) {
    result.errors.push('Dati deserializzati non sono un array');
    result.success = false;
    return result;
  }

  for (let i = 0; i < result.data.length; i++) {
    const item = result.data[i];
    if (validator(item)) {
      validItems.push(item);
    } else {
      invalidItems.push({
        index: i,
        errors: [`Elemento all'indice ${i} non valido`],
      });
    }
  }

  if (invalidItems.length > 0) {
    result.warnings.push(`${invalidItems.length} elementi non validi su ${result.data.length}`);
    result.data = validItems;
  }

  return result;
}

// ─── Schema Validation ───────────────────────────────────────────────────────

/**
 * Verifica se uno schema è compatibile con la versione corrente.
 */
export function checkSchemaCompatibility(
  data: { schemaVersion?: number },
  entityType: EntityType
): { compatible: boolean; reason?: string } {
  if (data.schemaVersion === undefined) {
    return {
      compatible: false,
      reason: 'Versione schema non specificata',
    };
  }

  if (!isSupportedSchemaVersion(data.schemaVersion as any, entityType)) {
    return {
      compatible: false,
      reason: `Versione schema ${data.schemaVersion} non supportata (corrente: ${CURRENT_SCHEMA_VERSION})`,
    };
  }

  return { compatible: true };
}

// ─── ID Preservation ─────────────────────────────────────────────────────────

/**
 * Preserva un ID durante la migrazione.
 * Se l'ID è valido, lo restituisce. Altrimenti ne genera uno nuovo.
 */
export function preserveId(
  originalId: unknown,
  fallback?: EntityId
): EntityId {
  if (isValidEntityId(originalId)) {
    return originalId;
  }

  if (fallback && isValidEntityId(fallback)) {
    return fallback;
  }

  // Non generiamo automaticamente un nuovo ID qui
  // perché la chiamata deve decidere se farlo
  throw new Error(`ID non valido: ${JSON.stringify(originalId)}`);
}
