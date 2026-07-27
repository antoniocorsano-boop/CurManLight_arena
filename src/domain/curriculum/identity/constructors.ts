/**
 * CML-633B — Canonical Identity Constructors
 *
 * Funzioni condivise per la costruzione sicura degli oggetti.
 * Nessun valore istituzionale hardcoded, nessuna promozione automatica del dato legacy.
 */

import type {
  EntityId,
  ContentOrigin,
  ActorReference,
  EntityReference,
  EntityType,
  EntityMetadata,
  MigrationStatus,
} from './types';

import {
  CURRENT_SCHEMA_VERSION,
} from './types';

// ─── Entity ID Generation ────────────────────────────────────────────────────

/**
 * Genera un EntityId canonico.
 *
 * Usa crypto.randomUUID() quando disponibile,
 * altrimenti un fallback sicuro.
 *
 * Non usare Math.random() come unica fonte per identità persistenti.
 */
export function generateEntityId(): EntityId {
  // Crypto API disponibile in browser e Node.js 19+
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID() as EntityId;
  }

  // Fallback: generazione UUID v4 senza crypto
  return fallbackUUID() as EntityId;
}

/**
 * Genera un UUID v4 di fallback.
 * Usa Math.random() solo come parte di una combinazione più ampia.
 */
function fallbackUUID(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 6);

  // Formato UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const hex = (timestamp + randomPart + randomPart2).padStart(32, '0');
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    '4' + hex.substring(13, 16),
    '8' + hex.substring(17, 20), // Variant 10xx
    hex.substring(20, 32),
  ].join('-');
}

/**
 * Genera un EntityId deterministico per dati canonici importati.
 * Usato solo quando l'ID è derivato da una fonte autorevole.
 */
export function generateDeterministicId(seed: string): EntityId {
  // Usiamo il seed per generare un ID prevedibile
  // ma non usiamo Math.random() per mantenere la determinismicità
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return [
    hex.substring(0, 8),
    '0000',
    '4000',
    '8000',
    hex.substring(0, 12).padStart(12, '0'),
  ].join('-') as EntityId;
}

// ─── Metadata Constructors ───────────────────────────────────────────────────

/**
 * Crea EntityMetadata per una nuova entità.
 *
 * @param origin - Origine del contenuto (obbligatoria)
 * @param createdBy - Autore della creazione (opzionale)
 * @param now - Timestamp per testabilità (opzionale, default: new Date().toISOString())
 */
export function createMetadata(
  origin: ContentOrigin,
  createdBy?: ActorReference,
  now?: string
): EntityMetadata {
  const timestamp = now || new Date().toISOString();
  const id = generateEntityId();

  return {
    id,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy,
    updatedBy: createdBy,
    origin,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
}

/**
 * Aggiorna i metadati di un'entità esistente.
 *
 * @param metadata - Metadati esistenti
 * @param updatedBy - Autore dell'aggiornamento (opzionale)
 * @param now - Timestamp per testabilità (opzionale)
 */
export function touchMetadata(
  metadata: EntityMetadata,
  updatedBy?: ActorReference,
  now?: string
): EntityMetadata {
  const timestamp = now || new Date().toISOString();

  return {
    ...metadata,
    updatedAt: timestamp,
    updatedBy: updatedBy || metadata.updatedBy,
  };
}

/**
 * Crea EntityMetadata per un dato legacy.
 *
 * Assegna origine 'legacy' e registra i metadati di migrazione.
 *
 * @param originalId - ID originale del dato legacy (opzionale)
 * @param migrationDate - Data di migrazione
 * @param previousSchemaVersion - Versione dello schema precedente
 * @param missingFields - Campi mancanti
 * @param warnings - Avvisi
 */
export function createLegacyMetadata(
  migrationDate: string,
  previousSchemaVersion?: number,
  missingFields?: string[],
  warnings?: string[]
): EntityMetadata {
  const id = generateEntityId();

  return {
    id,
    createdAt: migrationDate,
    updatedAt: migrationDate,
    origin: 'legacy',
    schemaVersion: CURRENT_SCHEMA_VERSION,
    migration: {
      status: 'imported-legacy',
      previousSchemaVersion: previousSchemaVersion,
      migrationDate,
      missingFields,
      warnings,
      requiresReview: true,
    },
  };
}

/**
 * Crea EntityMetadata per un dato migrato.
 *
 * @param migrationDate - Data di migrazione
 * @param previousOrigin - Origine precedente del dato
 * @param previousSchemaVersion - Versione dello schema precedente
 * @param status - Stato della migrazione
 */
export function createMigrationMetadata(
  migrationDate: string,
  previousOrigin: string,
  previousSchemaVersion: number,
  status: MigrationStatus = 'migrated-automatic'
): EntityMetadata {
  const id = generateEntityId();

  return {
    id,
    createdAt: migrationDate,
    updatedAt: migrationDate,
    origin: 'migration',
    schemaVersion: CURRENT_SCHEMA_VERSION,
    migration: {
      status,
      previousOrigin,
      migrationDate,
      previousSchemaVersion,
      requiresReview: status === 'migrated-incomplete' || status === 'requires-confirmation',
    },
  };
}

// ─── Actor Reference Constructors ────────────────────────────────────────────

/**
 * Crea un ActorReference per un utente che dichiara il proprio ruolo.
 *
 * @param displayName - Nome dichiarato
 * @param role - Ruolo dichiarato
 * @param organizationalUnit - Unità organizzativa (opzionale)
 * @param id - ID locale (opzionale)
 */
export function createSelfDeclaredActor(
  displayName: string,
  role: string,
  organizationalUnit?: string,
  id?: EntityId
): ActorReference {
  return {
    id,
    displayName,
    role: role as ActorReference['role'],
    organizationalUnit,
    assertion: 'self-declared',
  };
}

/**
 * Crea un ActorReference per un dato importato.
 *
 * @param displayName - Nome importato
 * @param role - Ruolo importato
 * @param note - Nota sull'importazione (opzionale)
 */
export function createImportedActor(
  displayName: string,
  role: string,
  note?: string
): ActorReference {
  return {
    displayName,
    role: role as ActorReference['role'],
    assertion: 'imported',
    note,
  };
}

/**
 * Crea un ActorReference per il sistema.
 *
 * @param note - Nota del sistema (opzionale)
 */
export function createSystemActor(note?: string): ActorReference {
  return {
    displayName: 'Sistema',
    role: 'amministratore',
    assertion: 'system',
    note,
  };
}

// ─── Entity Reference Constructors ───────────────────────────────────────────

/**
 * Crea un EntityReference.
 *
 * @param id - Identificativo dell'entità referenziata
 * @param entityType - Tipo dell'entità
 * @param snapshotLabel - Snapshot visuale (opzionale)
 */
export function createEntityReference(
  id: EntityId,
  entityType: EntityType,
  snapshotLabel?: string
): EntityReference {
  return {
    id,
    entityType,
    snapshotLabel,
  };
}

/**
 * Crea un EntityReference non risolto (riferimento a entità mancante).
 *
 * @param entityType - Tipo dell'entità attesa
 * @param reason - Motivo dell'assenza
 */
export function createUnresolvedReference(
  entityType: EntityType,
  reason: string
): EntityReference {
  return {
    id: '' as EntityId, // ID vuoto segnala riferimento non risolto
    entityType,
    snapshotLabel: `[MANCANTE: ${reason}]`,
  };
}
