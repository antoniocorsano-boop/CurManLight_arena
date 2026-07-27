/**
 * CML-633C — Source Entity
 *
 * Entità canonica per la rappresentazione delle fonti curricolari.
 */

import type { EntityId, EntityMetadata, EntityReference } from '../identity/types';

// ─── Source Type ─────────────────────────────────────────────────────────────

/**
 * Tipo di fonte.
 */
export type SourceType =
  | 'normative-national'
  | 'normative-ministerial'
  | 'institute-document'
  | 'institute-curriculum'
  | 'guideline'
  | 'support-document'
  | 'training-material'
  | 'local-import'
  | 'legacy'
  | 'demonstration';

/**
 * Etichette per i tipi di fonte.
 */
export const SOURCE_TYPE_LABELS: ReadonlyMap<SourceType, string> = new Map([
  ['normative-national', 'Normativa Nazionale'],
  ['normative-ministerial', 'Normativa Ministeriale'],
  ['institute-document', 'Documento d\'Istituto'],
  ['institute-curriculum', 'Curricolo d\'Istituto'],
  ['guideline', 'Linea Guida'],
  ['support-document', 'Documento di Supporto'],
  ['training-material', 'Materiale Formativo'],
  ['local-import', 'Fonte Locale Importata'],
  ['legacy', 'Fonte Legacy'],
  ['demonstration', 'Fonte Dimostrativa'],
]);

// ─── Source Status ───────────────────────────────────────────────────────────

/**
 * Stato della fonte.
 */
export type SourceStatus =
  | 'draft'
  | 'active'
  | 'superseded'
  | 'archived'
  | 'unverified'
  | 'legacy';

/**
 * Livello di affidabilità per ogni stato.
 */
export const SOURCE_STATUS_RELIABILITY: ReadonlyMap<SourceStatus, number> = new Map([
  ['draft', 30],
  ['active', 90],
  ['superseded', 60],
  ['archived', 50],
  ['unverified', 20],
  ['legacy', 40],
]);

// ─── Source Scope ────────────────────────────────────────────────────────────

/**
 * Ambito di applicabilità della fonte.
 */
export interface SourceScope {
  /** Ordini scolastici */
  schoolOrders?: string[];
  /** Discipline */
  disciplines?: string[];
  /** Nuclei */
  nuclei?: string[];
  /** Periodo di validità */
  validFrom?: string;
  validTo?: string;
  /** Istituto (se pertinente) */
  instituteId?: string;
  /** Se è nazionale */
  isNational?: boolean;
}

// ─── Source Locator ──────────────────────────────────────────────────────────

/**
 * Localizzatore della fonte.
 */
export interface SourceLocator {
  /** Tipo di localizzatore */
  type: 'file' | 'url' | 'document-id' | 'bibliographic' | 'internal' | 'none';
  /** Percorso o identificativo */
  value?: string;
  /** URL (se applicabile) */
  url?: string;
  /** Riferimento bibliografico */
  bibliographicRef?: string;
  /** Note aggiuntive */
  notes?: string;
}

// ─── Source Entity ───────────────────────────────────────────────────────────

/**
 * Entità canonica per una fonte.
 */
export interface Source {
  /** Identificativo univoco */
  id: EntityId;
  /** Metadati */
  metadata: EntityMetadata;
  /** Titolo della fonte */
  title: string;
  /** Tipo di fonte */
  sourceType: SourceType;
  /** Autorità emittente */
  authority?: string;
  /** Data di emissione */
  issuedAt?: string;
  /** Etichetta della versione */
  versionLabel?: string;
  /** Stato */
  status: SourceStatus;
  /** Ambito di applicabilità */
  scope: SourceScope;
  /** Localizzatore */
  locator?: SourceLocator;
  /** Note */
  notes?: string;
  /** Riferimenti ai nodi che utilizzano questa fonte */
  usedByNodeRefs: EntityReference[];
  /** Riferimento alla versione precedente (se superseded) */
  previousVersionRef?: EntityReference;
}

// ─── Source Version ──────────────────────────────────────────────────────────

/**
 * Versione di una fonte.
 */
export interface SourceVersion {
  /** Identificativo univoco */
  id: EntityId;
  /** Metadati */
  metadata: EntityMetadata;
  /** Riferimento alla fonte */
  sourceRef: EntityReference;
  /** Numero di versione */
  versionNumber: number;
  /** Etichetta della versione */
  label?: string;
  /** Data di emissione */
  issuedAt?: string;
  /** Stato */
  status: SourceStatus;
  /** Note sulla variazione */
  changeNotes?: string;
  /** Riferimento alla versione precedente */
  previousVersionRef?: EntityReference;
  /** Riferimenti ai nodi che utilizzano questa versione */
  usedByNodeRefs: EntityReference[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Errore di validazione per Source.
 */
export interface SourceValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  path?: string;
}

/**
 * Risultato di validazione per Source.
 */
export interface SourceValidationResult {
  valid: boolean;
  errors: SourceValidationError[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Schema version corrente per Source.
 */
export const SOURCE_SCHEMA_VERSION = 1;

/**
 * Set completo dei tipi di fonte validi.
 */
export const VALID_SOURCE_TYPES: readonly SourceType[] = [
  'normative-national',
  'normative-ministerial',
  'institute-document',
  'institute-curriculum',
  'guideline',
  'support-document',
  'training-material',
  'local-import',
  'legacy',
  'demonstration',
] as const;

/**
 * Set completo degli stati fonte validi.
 */
export const VALID_SOURCE_STATUSES: readonly SourceStatus[] = [
  'draft',
  'active',
  'superseded',
  'archived',
  'unverified',
  'legacy',
] as const;
