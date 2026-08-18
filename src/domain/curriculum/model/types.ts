/**
 * CML-633C — Curriculum Model Types
 *
 * Entità canoniche per il dominio curricolare:
 * - CurriculumVersion
 * - CurriculumSegment
 * - CurriculumNode
 * - CurriculumLink
 */

import type { EntityId, EntityMetadata, EntityReference, ContentOrigin } from '../identity/types';
import type { SchoolOrder } from '../../../types/curriculum';
import type { DisciplineCode, CurriculumNodeType, CurriculumLinkType } from './vocabularies';
import type { FrameworkApplicabilityReference } from '../types';

// ─── Source-native curriculum projection ─────────────────────────────────────

/**
 * Natura dell'area così come è organizzata dalla fonte normativa.
 * Consente di rappresentare, senza inventare discipline, campi di esperienza,
 * aree trasversali e sezioni generali della fonte.
 */
export type SourceAreaKind =
  | 'discipline'
  | 'experience-field'
  | 'transversal-area'
  | 'general-section';

/** Identità dell'area nella fonte originaria. */
export interface SourceAreaReference {
  kind: SourceAreaKind;
  code: string;
  label: string;
}

/** Identità del nucleo così come denominato dalla fonte originaria. */
export interface SourceNucleusReference {
  code: string;
  label: string;
}

/**
 * Checkpoint normativi esplicitamente necessari per il primo ciclo 2012.
 * Il vocabolario è controllato e può essere esteso solo tramite modifica del
 * contratto, evitando stringhe temporali arbitrarie nei dati normativi.
 */
export type NormativeCheckpoint =
  | 'end-infanzia'
  | 'end-primary-grade-3'
  | 'end-primary'
  | 'end-lower-secondary';

export const VALID_NORMATIVE_CHECKPOINTS: readonly NormativeCheckpoint[] = [
  'end-infanzia',
  'end-primary-grade-3',
  'end-primary',
  'end-lower-secondary',
] as const;

// ─── Curriculum Version ──────────────────────────────────────────────────────

/**
 * Stato di una versione curricolare.
 */
export type CurriculumVersionStatus =
  | 'draft'
  | 'working'
  | 'active'
  | 'superseded'
  | 'archived'
  | 'legacy'
  | 'experimental';

/**
 * Versione curricolare identificabile.
 */
export interface CurriculumVersion {
  /** Identificativo univoco */
  id: EntityId;
  /** Metadati */
  metadata: EntityMetadata;
  /** Titolo */
  title: string;
  /** Descrizione */
  description?: string;
  /** Ambito */
  scope: CurriculumScope;
  /** Anno o periodo */
  academicYear?: string;
  /** Stato */
  status: CurriculumVersionStatus;
  /** Fonti principali */
  mainSourceRefs: EntityReference[];
  /** Riferimento alla versione precedente */
  previousVersionRef?: EntityReference;
  /** Note di migrazione */
  migrationNotes?: string;
  /** Riferimenti ai segmenti (o caricamento lazy) */
  segmentRefs: EntityReference[];
  /** Origine dei dati */
  dataOrigin: ContentOrigin;
}

/**
 * Ambito di una versione curricolare.
 */
export interface CurriculumScope {
  /** Ordine scolastico */
  schoolOrder: SchoolOrder;
  /** Discipline incluse */
  disciplines: DisciplineCode[];
  /** Classi o fasce */
  gradeRange?: string[];
}

// ─── Curriculum Segment ──────────────────────────────────────────────────────

/**
 * Stato di un segmento curricolare.
 */
export type CurriculumSegmentStatus =
  | 'empty'
  | 'partial'
  | 'complete'
  | 'source-missing'
  | 'metadata-missing'
  | 'legacy'
  | 'unverified';

/**
 * Completezza strutturale (non istituzionale).
 */
export type CompletenessLevel =
  | 'complete'
  | 'partial'
  | 'source-missing'
  | 'metadata-missing'
  | 'empty'
  | 'legacy'
  | 'unverified';

/**
 * Segmento curricolare come aggregato strutturato.
 */
export interface CurriculumSegment {
  /** Identificativo univoco */
  id: EntityId;
  /** Metadati */
  metadata: EntityMetadata;
  /** Riferimento alla versione curricolare */
  curriculumVersionRef: EntityReference;
  /** Ordine scolastico */
  schoolOrder: SchoolOrder;
  /**
   * Disciplina canonica quando il segmento è disciplinare.
   * È null per strutture fonte-native non disciplinari (es. campi di esperienza).
   */
  disciplineCode: DisciplineCode | null;
  /** Area così come organizzata dalla fonte normativa. */
  sourceArea?: SourceAreaReference;
  /** Nucleo così come denominato dalla fonte normativa. */
  sourceNucleus?: SourceNucleusReference;
  /** Nucleo fondante legacy/compatibilità */
  nucleusId?: string;
  /** Applicabilità condizionale del segmento a framework/percorsi specifici. */
  frameworkApplicability?: FrameworkApplicabilityReference;
  /** Titolo del segmento */
  title: string;
  /** Descrizione */
  description?: string;
  /** Stato */
  status: CurriculumSegmentStatus;
  /** Livello di completezza */
  completeness: CompletenessLevel;
  /** Fonti associate */
  sourceRefs: EntityReference[];
  /** Riferimenti ai nodi */
  nodeRefs: EntityReference[];
  /** Origine dei dati */
  dataOrigin: ContentOrigin;
  /** Note */
  notes?: string;
}

// ─── Curriculum Node ─────────────────────────────────────────────────────────

/**
 * Stato di un nodo curricolare.
 */
export type CurriculumNodeStatus =
  | 'active'
  | 'proposed'
  | 'superseded'
  | 'archived'
  | 'legacy'
  | 'experimental'
  | 'unverified';

/**
 * Provenienza del nodo.
 */
export type CurriculumProvenance =
  | 'normative'
  | 'institute'
  | 'derived'
  | 'teacher-proposed'
  | 'synthetic'
  | 'demonstration'
  | 'legacy';

/**
 * Informazioni legacy per un nodo.
 */
export interface LegacyNodeInfo {
  /** Se il nodo proviene da dati legacy */
  isLegacy: boolean;
  /** Chiave originale nel curriculumKB */
  originalKey?: string;
  /** Testo originale preservato */
  originalText?: string;
  /** Data di migrazione */
  migrationDate?: string;
  /** Avvisi di migrazione */
  migrationWarnings?: string[];
}

/**
 * Nodo canonico del curricolo.
 */
export interface CurriculumNode {
  /** Identificativo univoco */
  id: EntityId;
  /** Metadati */
  metadata: EntityMetadata;
  /** Riferimento alla versione curricolare */
  curriculumVersionRef: EntityReference;
  /** Riferimento al segmento */
  segmentRef: EntityReference;
  /** Tipo di nodo */
  nodeType: CurriculumNodeType;
  /** Testo del nodo */
  text: string;
  /** Riferimenti alle fonti */
  sourceRefs: EntityReference[];
  /** Stato */
  status: CurriculumNodeStatus;
  /** Provenienza */
  provenance: CurriculumProvenance;
  /** Informazioni legacy (se presenti) */
  legacy?: LegacyNodeInfo;
  /** Checkpoint temporale normativo controllato. */
  normativeCheckpoint?: NormativeCheckpoint;
  /** Discriminante source-native per obiettivi 2025 vs obiettivi 2012. */
  normativeNodeKind?: 'objective-2012' | 'osa-2025';
  /** Grado (campo legacy/istituzionale, se specifico) */
  grade?: string;
  /** Periodo (campo legacy/istituzionale, se specifico) */
  period?: string;
  /** Se è trasversale */
  isCrossCurricular?: boolean;
  /** Parole chiave */
  keywords: string[];
}

// ─── Curriculum Link ─────────────────────────────────────────────────────────

/**
 * Stato di un link curricolare.
 */
export type CurriculumLinkStatus =
  | 'active'
  | 'proposed'
  | 'superseded'
  | 'experimental'
  | 'legacy';

/**
 * Relazione strutturata tra nodi.
 */
export interface CurriculumLink {
  /** Identificativo univoco */
  id: EntityId;
  /** Metadati */
  metadata: EntityMetadata;
  /** Nodo di origine */
  fromNodeRef: EntityReference;
  /** Nodo di destinazione */
  toNodeRef: EntityReference;
  /** Tipo di relazione */
  linkType: CurriculumLinkType;
  /** Descrizione della relazione */
  description?: string;
  /** Motivazione */
  motivation?: string;
  /** Fonti o evidenze a supporto */
  sourceRefs: EntityReference[];
  /** Origine */
  origin: ContentOrigin;
  /** Stato */
  status: CurriculumLinkStatus;
  /** Se è una relazione跨-ordine (verticale) */
  isVertical: boolean;
  /** Ordine di origine (se verticale) */
  fromOrder?: SchoolOrder;
  /** Ordine di destinazione (se verticale) */
  toOrder?: SchoolOrder;
}

// ─── Evidence (as Node Type) ─────────────────────────────────────────────────

/**
 * Le evidenze sono rappresentate come CurriculumNode con tipo 'evidenza'.
 * Questa è una funzione helper per la creazione.
 */
export interface EvidenceNode extends Omit<CurriculumNode, 'nodeType'> {
  nodeType: 'evidenza';
  /** Riferimento al nodo curricolare supportato */
  supportedNodeRef?: EntityReference;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Errore di validazione per il dominio curricolare.
 */
export interface CurriculumValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  entityType: string;
  entityId?: string;
  path?: string;
}

/**
 * Risultato di validazione per il dominio curricolare.
 */
export interface CurriculumValidationResult {
  valid: boolean;
  errors: CurriculumValidationError[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Schema version corrente per il dominio curricolare.
 */
export const CURRICULUM_SCHEMA_VERSION = 1;

/**
 * Set completo degli stati versione curricolare validi.
 */
export const VALID_CURRICULUM_VERSION_STATUSES: readonly CurriculumVersionStatus[] = [
  'draft',
  'working',
  'active',
  'superseded',
  'archived',
  'legacy',
  'experimental',
] as const;

/**
 * Set completo degli stati segmento validi.
 */
export const VALID_SEGMENT_STATUSES: readonly CurriculumSegmentStatus[] = [
  'empty',
  'partial',
  'complete',
  'source-missing',
  'metadata-missing',
  'legacy',
  'unverified',
] as const;

/**
 * Set completo degli stati nodo validi.
 */
export const VALID_NODE_STATUSES: readonly CurriculumNodeStatus[] = [
  'active',
  'proposed',
  'superseded',
  'archived',
  'legacy',
  'experimental',
  'unverified',
] as const;

/**
 * Set completo degli stati link validi.
 */
export const VALID_LINK_STATUSES: readonly CurriculumLinkStatus[] = [
  'active',
  'proposed',
  'superseded',
  'experimental',
  'legacy',
] as const;

/**
 * Set completo delle provenienze valide.
 */
export const VALID_PROVENANCES: readonly CurriculumProvenance[] = [
  'normative',
  'institute',
  'derived',
  'teacher-proposed',
  'synthetic',
  'demonstration',
  'legacy',
] as const;

/**
 * Set completo dei livelli di completezza validi.
 */
export const VALID_COMPLETENESS_LEVELS: readonly CompletenessLevel[] = [
  'complete',
  'partial',
  'source-missing',
  'metadata-missing',
  'empty',
  'legacy',
  'unverified',
] as const;
