/**
 * CML-633B — Legacy Adapters
 *
 * Adattatori pilota per verificare che i contratti possano
 * rappresentare dati legacy senza perdita o reinterpretazione indebita.
 *
 * Categorie adattate:
 * 1. curriculumKB (Knowledge Builder)
 * 2. UDA salvate (Teaching Design)
 */

import type {
  EntityMetadata,
  ContentOrigin,
} from './types';

import {
  createLegacyMetadata,
  createMigrationMetadata,
} from './constructors';

// ─── Legacy Types ────────────────────────────────────────────────────────────

/**
 * Tipo legacy del curriculumKB.
 * Preservato esattamente com'è nel codice sorgente.
 */
export interface LegacyCurriculumKBItem {
  discipline: string;
  order: string;
  hasSpecificDiscipline: boolean;
  traguardi: string[];
  obiettivi: string[];
  proposals: string[];
}

/**
 * Tipo legacy di un UDA salvato.
 * Preservato esattamente com'è nel codice sorgente.
 */
export interface LegacyUdaModel {
  id: string;
  title: string;
  discipline: string;
  order: string;
  description?: string;
  content?: string;
  classes?: string[];
  status: 'work-in-progress' | 'review-needed' | 'completed';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  exportedAt?: string;
  workStatus?: string;
}

// ─── Adapted Types ───────────────────────────────────────────────────────────

/**
 * Risultato dell'adattamento di un elemento legacy.
 */
export interface AdaptedLegacyItem<T> {
  /** Dato originale preservato */
  original: T;
  /** Metadati canonici assegnati */
  metadata: EntityMetadata;
  /** Avvisi generati durante l'adattamento */
  warnings: string[];
  /** Campi mancanti o non validi */
  missingFields: string[];
}

// ─── curriculumKB Adapter ────────────────────────────────────────────────────

/**
 * Adatta un elemento del curriculumKB al contratto canonico.
 *
 * Regole:
 * - Preserva il dato originale
 * - Assegna origine 'legacy'
 * - Registra i metadati mancanti
 * - Non attribuisce fonte inesistente
 * - Non attribuisce autore inesistente
 * - Non attribuisce validazione
 * - Produce avvisi verificabili
 */
export function adaptCurriculumKBItem(
  item: LegacyCurriculumKBItem,
  migrationDate: string
): AdaptedLegacyItem<LegacyCurriculumKBItem> {
  const warnings: string[] = [];
  const missingFields: string[] = [];

  // Verifica campi obbligatori
  if (!item.discipline || item.discipline.trim().length === 0) {
    missingFields.push('discipline');
    warnings.push('Campo discipline mancante o vuoto');
  }

  if (!item.order || item.order.trim().length === 0) {
    missingFields.push('order');
    warnings.push('Campo order mancante o vuoto');
  }

  // Verifica contenuto
  if (!item.traguardi || item.traguardi.length === 0) {
    missingFields.push('traguardi');
    warnings.push('Nessun traguardo definito');
  }

  if (!item.obiettivi || item.obiettivi.length === 0) {
    missingFields.push('obiettivi');
    warnings.push('Nessun obiettivo definito');
  }

  // Crea metadati legacy
  const metadata = createLegacyMetadata(
    migrationDate,
    undefined, // previousSchemaVersion sconosciuto
    missingFields,
    warnings
  );

  return {
    original: item,
    metadata,
    warnings,
    missingFields,
  };
}

/**
 * Adatta una collezione di elementi curriculumKB.
 */
export function adaptCurriculumKB(
  items: Record<string, LegacyCurriculumKBItem>,
  migrationDate: string
): AdaptedLegacyItem<LegacyCurriculumKBItem>[] {
  return Object.entries(items).map(([key, item]) => {
    const adapted = adaptCurriculumKBItem(item, migrationDate);
    // Aggiungi informazione sulla chiave originale
    adapted.warnings.push(`Chiave originale: ${key}`);
    return adapted;
  });
}

// ─── UDA Adapter ─────────────────────────────────────────────────────────────

/**
 * Adatta un UDA salvato al contratto canonico.
 *
 * Regole:
 * - Preserva il dato originale
 * - Assegna origine 'legacy' o 'teacher' in base allo stato
 * - Registra i metadati mancanti
 * - Preserva l'ID originale se valido
 */
export function adaptUdaModel(
  item: LegacyUdaModel,
  migrationDate: string
): AdaptedLegacyItem<LegacyUdaModel> {
  const warnings: string[] = [];
  const missingFields: string[] = [];

  // Determina origine in base allo stato
  let origin: ContentOrigin = 'legacy';
  if (item.status === 'completed') {
    // Un UDA completato potrebbe essere stato approvato dall'istituto
    origin = 'legacy';
    warnings.push('UDA completato classificato come legacy (non automaticamente come institute)');
  }

  // Verifica campi obbligatori
  if (!item.title || item.title.trim().length === 0) {
    missingFields.push('title');
    warnings.push('Campo title mancante o vuoto');
  }

  if (!item.discipline || item.discipline.trim().length === 0) {
    missingFields.push('discipline');
    warnings.push('Campo discipline mancante o vuoto');
  }

  if (!item.order || item.order.trim().length === 0) {
    missingFields.push('order');
    warnings.push('Campo order mancante o vuoto');
  }

  // Verifica date
  if (!item.createdAt) {
    missingFields.push('createdAt');
    warnings.push('Data di creazione mancante');
  }

  if (!item.updatedAt) {
    missingFields.push('updatedAt');
    warnings.push('Data di aggiornamento mancante');
  }

  // Crea metadati in base all'origine determinata
  let metadata: EntityMetadata;
  if (origin === 'legacy') {
    metadata = createLegacyMetadata(
              item.createdAt || migrationDate,
      undefined,
      missingFields,
      warnings
    );
  } else {
    metadata = createMigrationMetadata(
              item.createdAt || migrationDate,
      origin,
      1, // Versione sconosciuta
      'migrated-incomplete'
    );
    metadata.migration!.missingFields = missingFields;
    metadata.migration!.warnings = warnings;
  }

  // Preserva l'ID originale se valido
  if (item.id && typeof item.id === 'string' && item.id.trim().length > 0) {
    warnings.push(`ID originale preservato: ${item.id}`);
  }

  return {
    original: item,
    metadata,
    warnings,
    missingFields,
  };
}

/**
 * Adatta una collezione di UDA salvate.
 */
export function adaptUdaModels(
  items: LegacyUdaModel[],
  migrationDate: string
): AdaptedLegacyItem<LegacyUdaModel>[] {
  return items.map(item => adaptUdaModel(item, migrationDate));
}

// ─── Validation Helpers ──────────────────────────────────────────────────────

/**
 * Verifica che un dato legacy non sia stato promosso automaticamente a canonico completo.
 */
export function isLegacyDataPreserved<T>(
  adapted: AdaptedLegacyItem<T>
): boolean {
  // Il dato legacy deve mantenere origine 'legacy' o 'migration'
  return (
    adapted.metadata.origin === 'legacy' ||
    adapted.metadata.origin === 'migration'
  );
}

/**
 * Verifica che un dato legacy abbia tutti i warning necessari.
 */
export function hasRequiredWarnings<T>(
  adapted: AdaptedLegacyItem<T>,
  requiredWarnings: string[]
): boolean {
  return requiredWarnings.every(w =>
    adapted.warnings.some(aw => aw.includes(w))
  );
}

/**
 * Verifica che un dato legacy non abbia attribuito fonte inesistente.
 */
export function hasNoPhantomSource<T>(
  adapted: AdaptedLegacyItem<T>
): boolean {
  // L'origine deve essere 'legacy' o 'migration', non 'institute' o 'normative-source'
  return (
    adapted.metadata.origin !== 'institute' &&
    adapted.metadata.origin !== 'normative-source'
  );
}

/**
 * Verifica che un dato legacy non abbia attribuito autore inesistente.
 */
export function hasNoPhantomAuthor<T>(
  adapted: AdaptedLegacyItem<T>
): boolean {
  // L'autore non deve essere impostato automaticamente
  // tranne che per il sistema during migration
  if (adapted.metadata.createdBy) {
    return adapted.metadata.createdBy.assertion === 'system';
  }
  return true;
}
