/**
 * CML-633B — Canonical Identity and Metadata Foundation
 *
 * Contratti condivisi e riutilizzabili per:
 * - identità stabile delle entità
 * - provenienza dei dati
 * - autore e responsabilità dichiarata
 * - data di creazione e modifica
 * - versione
 * - stato di migrazione
 * - classificazione dell'origine
 * - relazioni tra entità
 * - compatibilità con i dati legacy
 */

import type { InstitutionalRole } from '../types';

// ─── Canonical Entity Identity ────────────────────────────────────────────────

/**
 * Identificativo canonico per tutte le entità del dominio.
 * Generato tramite generateEntityId(), mai derivato dal testo.
 */
export type EntityId = string & { readonly __brand: 'EntityId' };

/**
 * Versione dello schema per compatibilità.
 * Incrementata quando la struttura dell'entità cambia in modo non backward-compatible.
 */
export type SchemaVersion = number & { readonly __brand: 'SchemaVersion' };

/**
 * Versione corrente dello schema per ogni tipo di entità.
 */
export const CURRENT_SCHEMA_VERSION = 1 as SchemaVersion;

// ─── Content Origin ──────────────────────────────────────────────────────────

/**
 * Classificazione canonica dell'origine del contenuto.
 *
 * Regola essenziale: synthetic, assisted, demonstration e legacy
 * non devono essere interpretati come institute senza un evento futuro esplicito.
 */
export type ContentOrigin =
  | 'normative-source'
  | 'institute'
  | 'teacher'
  | 'imported'
  | 'assisted'
  | 'synthetic'
  | 'demonstration'
  | 'legacy'
  | 'migration';

/**
 * Metadati associati a ogni origine.
 */
export interface ContentOriginMetadata {
  /** Significato dell'origine */
  description: string;
  /** Livello di affidabilità (0-100) */
  reliability: number;
  /** Metadati obbligatori per questa origine */
  requiredMetadata: string[];
  /** Se può essere esportato */
  exportable: boolean;
  /** Se richiede conferma umana */
  requiresHumanConfirmation: boolean;
  /** Se può essere promosso a contenuto d'istituto */
  promotableToInstitute: boolean;
}

/**
 * Mapping delle origini con i loro metadati.
 */
export const CONTENT_ORIGIN_REGISTRY: ReadonlyMap<ContentOrigin, ContentOriginMetadata> = new Map([
  ['normative-source', {
    description: 'Contenuto da fonte normativa (DPR, D.Lgs, Linee Guida)',
    reliability: 100,
    requiredMetadata: ['documentReference'],
    exportable: true,
    requiresHumanConfirmation: false,
    promotableToInstitute: false,
  }],
  ['institute', {
    description: 'Contenuto approvato dall\'istituto',
    reliability: 90,
    requiredMetadata: ['instituteId'],
    exportable: true,
    requiresHumanConfirmation: false,
    promotableToInstitute: true,
  }],
  ['teacher', {
    description: 'Contenuto creato dal docente',
    reliability: 80,
    requiredMetadata: ['actorReference'],
    exportable: true,
    requiresHumanConfirmation: false,
    promotableToInstitute: true,
  }],
  ['imported', {
    description: 'Contenuto importato da fonte esterna',
    reliability: 70,
    requiredMetadata: ['sourceDocument'],
    exportable: true,
    requiresHumanConfirmation: true,
    promotableToInstitute: true,
  }],
  ['assisted', {
    description: 'Contenuto generato con assistenza AI',
    reliability: 60,
    requiredMetadata: ['actorReference'],
    exportable: true,
    requiresHumanConfirmation: true,
    promotableToInstitute: true,
  }],
  ['synthetic', {
    description: 'Contenuto suggerito dal sistema',
    reliability: 50,
    requiredMetadata: [],
    exportable: false,
    requiresHumanConfirmation: true,
    promotableToInstitute: true,
  }],
  ['demonstration', {
    description: 'Contenuto dimostrativo di esempio',
    reliability: 0,
    requiredMetadata: [],
    exportable: false,
    requiresHumanConfirmation: false,
    promotableToInstitute: false,
  }],
  ['legacy', {
    description: 'Dato legacy pre-migrazione',
    reliability: 40,
    requiredMetadata: ['migrationDate'],
    exportable: true,
    requiresHumanConfirmation: true,
    promotableToInstitute: true,
  }],
  ['migration', {
    description: 'Dato generato durante la migrazione',
    reliability: 40,
    requiredMetadata: ['migrationDate', 'previousSchemaVersion'],
    exportable: true,
    requiresHumanConfirmation: true,
    promotableToInstitute: true,
  }],
]);

// ─── Actor Reference ─────────────────────────────────────────────────────────

/**
 * Riferimento all'attore dichiarato.
 * Non simula autenticazione - rappresenta una dichiarazione locale.
 */
export interface ActorReference {
  /** ID locale facoltativo */
  id?: EntityId;
  /** Nome dichiarato */
  displayName: string;
  /** Ruolo dichiarato */
  role: InstitutionalRole;
  /** Unità organizzativa facoltativa */
  organizationalUnit?: string;
  /** Natura della dichiarazione */
  assertion: 'self-declared' | 'imported' | 'system';
  /** Eventuale nota */
  note?: string;
}

// ─── Entity Reference ────────────────────────────────────────────────────────

/**
 * Riferimento a un'altra entità.
 * L'etichetta è solo uno snapshot visuale, non la chiave di ricerca.
 */
export interface EntityReference {
  /** Identificativo dell'entità referenziata */
  id: EntityId;
  /** Tipo dell'entità */
  entityType: EntityType;
  /** Snapshot visuale (non usato come chiave) */
  snapshotLabel?: string;
}

// ─── Entity Types ────────────────────────────────────────────────────────────

/**
 * Enum canonico dei tipi di entità supportati.
 */
export type EntityType =
  | 'institute'
  | 'source'
  | 'curriculum-version'
  | 'curriculum-segment'
  | 'curriculum-node'
  | 'curriculum-link'
  | 'revision-proposal'
  | 'decision'
  | 'teaching-design'
  | 'document'
  | 'document-version'
  | 'template'
  | 'class-context'
  | 'assessment'
  | 'actor'
  | 'event';

/**
 * Set completo dei tipi di entità validi.
 */
export const VALID_ENTITY_TYPES: readonly EntityType[] = [
  'institute',
  'source',
  'curriculum-version',
  'curriculum-segment',
  'curriculum-node',
  'curriculum-link',
  'revision-proposal',
  'decision',
  'teaching-design',
  'document',
  'document-version',
  'template',
  'class-context',
  'assessment',
  'actor',
  'event',
] as const;

// ─── Migration Status ────────────────────────────────────────────────────────

/**
 * Stato di migrazione del dato.
 */
export type MigrationStatus =
  | 'native-canonical'
  | 'migrated-automatic'
  | 'migrated-incomplete'
  | 'imported-legacy'
  | 'requires-confirmation'
  | 'non-migrable'
  | 'archived-historical';

/**
 * Metadati di migrazione per dati legacy.
 */
export interface MigrationMetadata {
  /** Stato della migrazione */
  status: MigrationStatus;
  /** Origine precedente del dato */
  previousOrigin?: string;
  /** Data di migrazione */
  migrationDate?: string;
  /** Versione dello schema precedente */
  previousSchemaVersion?: number;
  /** Campi mancanti */
  missingFields?: string[];
  /** Avvisi */
  warnings?: string[];
  /** Se richiede revisione umana */
  requiresReview?: boolean;
}

// ─── Entity Metadata ─────────────────────────────────────────────────────────

/**
 * Metadati condivisi per tutte le entità del dominio.
 */
export interface EntityMetadata {
  /** Identificativo univoco */
  id: EntityId;
  /** Data di creazione (ISO 8601) */
  createdAt: string;
  /** Data di ultimo aggiornamento (ISO 8601) */
  updatedAt: string;
  /** Autore della creazione */
  createdBy?: ActorReference;
  /** Autore dell'ultimo aggiornamento */
  updatedBy?: ActorReference;
  /** Origine del contenuto */
  origin: ContentOrigin;
  /** Versione dello schema */
  schemaVersion: SchemaVersion;
  /** Metadati di migrazione (solo per dati migrati/legacy) */
  migration?: MigrationMetadata;
}
