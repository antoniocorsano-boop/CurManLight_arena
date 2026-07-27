/**
 * CML-633C — Canonical Vocabularies
 *
 * Vocabolari condivisi per ordini scolastici, discipline, nuclei e tipi di nodo.
 */

import type { SchoolOrder } from '../../../types/curriculum';

// ─── School Orders ───────────────────────────────────────────────────────────

/**
 * Ordini scolastici supportati dal sistema.
 */
export const SCHOOL_ORDERS: readonly SchoolOrder[] = [
  'infanzia',
  'primaria',
  'secondaria',
] as const;

/**
 * Etichette visualizzate per ogni ordine.
 */
export const SCHOOL_ORDER_LABELS: ReadonlyMap<SchoolOrder, string> = new Map([
  ['infanzia', 'Scuola dell\'Infanzia'],
  ['primaria', 'Scuola Primaria'],
  ['secondaria', 'Scuola Secondaria di Primo Grado'],
]);

// ─── Disciplines ─────────────────────────────────────────────────────────────

/**
 * Codice canonico della disciplina.
 */
export type DisciplineCode =
  | 'italiano'
  | 'storia'
  | 'inglese'
  | 'seconda-lingua'
  | 'matematica'
  | 'scienze'
  | 'geografia'
  | 'arte'
  | 'musica'
  | 'educazione-fisica'
  | 'educazione-civica'
  | 'tecnologia'
  | 'religione'
  | 'latino';

/**
 * Definizione completa di una disciplina.
 */
export interface DisciplineDefinition {
  /** Codice canonico */
  code: DisciplineCode;
  /** Etichetta visualizzata */
  label: string;
  /** Alias legacy (nomi usati in curriculumKB) */
  aliases: string[];
  /** Ordini supportati */
  supportedOrders: SchoolOrder[];
  /** Se è una disciplina specifica (non trasversale) */
  isSpecific: boolean;
}

/**
 * Registro completo delle 14 discipline.
 */
export const DISCIPLINES: readonly DisciplineDefinition[] = [
  {
    code: 'italiano',
    label: 'Italiano',
    aliases: ['italiano', 'Italiano', 'Lingua Italiana'],
    supportedOrders: ['infanzia', 'primaria', 'secondaria'],
    isSpecific: true,
  },
  {
    code: 'storia',
    label: 'Storia',
    aliases: ['storia', 'Storia'],
    supportedOrders: ['primaria', 'secondaria'],
    isSpecific: true,
  },
  {
    code: 'inglese',
    label: 'Inglese',
    aliases: ['inglese', 'Inglese', 'English', 'Lingua Straniera'],
    supportedOrders: ['primaria', 'secondaria'],
    isSpecific: true,
  },
  {
    code: 'seconda-lingua',
    label: 'Seconda Lingua Comunitaria',
    aliases: ['secondaLingua', 'Seconda Lingua', 'Seconda Lingua Comunitaria'],
    supportedOrders: ['secondaria'],
    isSpecific: true,
  },
  {
    code: 'matematica',
    label: 'Matematica',
    aliases: ['matematica', 'Matematica'],
    supportedOrders: ['infanzia', 'primaria', 'secondaria'],
    isSpecific: true,
  },
  {
    code: 'scienze',
    label: 'Scienze',
    aliases: ['scienze', 'Scienze', 'Scienze e Tecnologie'],
    supportedOrders: ['primaria', 'secondaria'],
    isSpecific: true,
  },
  {
    code: 'geografia',
    label: 'Geografia',
    aliases: ['geografia', 'Geografia'],
    supportedOrders: ['primaria', 'secondaria'],
    isSpecific: true,
  },
  {
    code: 'arte',
    label: 'Arte e Immagine',
    aliases: ['arte', 'Arte', 'arteImmagine', 'Arte e Immagine', 'Storia dell\'Arte'],
    supportedOrders: ['primaria', 'secondaria'],
    isSpecific: true,
  },
  {
    code: 'musica',
    label: 'Musica',
    aliases: ['musica', 'Musica'],
    supportedOrders: ['primaria', 'secondaria'],
    isSpecific: true,
  },
  {
    code: 'educazione-fisica',
    label: 'Educazione Fisica',
    aliases: ['educazione-fisica', 'Educazione Fisica', 'educazioneFisica', 'Motoria', 'Psicomotricità'],
    supportedOrders: ['infanzia', 'primaria', 'secondaria'],
    isSpecific: true,
  },
  {
    code: 'tecnologia',
    label: 'Tecnologia',
    aliases: ['tecnologia', 'Tecnologia', 'Tecnologie', 'Informatica'],
    supportedOrders: ['primaria', 'secondaria'],
    isSpecific: true,
  },
  {
    code: 'educazione-civica',
    label: 'Educazione Civica',
    aliases: ['educazioneCivica', 'Educazione Civica'],
    supportedOrders: ['primaria', 'secondaria'],
    isSpecific: true,
  },
  {
    code: 'religione',
    label: 'Religione Cattolica',
    aliases: ['religione', 'Religione', 'Religione Cattolica', 'RC'],
    supportedOrders: ['primaria', 'secondaria'],
    isSpecific: false,
  },
  {
    code: 'latino',
    label: 'Latino',
    aliases: ['latino', 'Latino'],
    supportedOrders: ['secondaria'],
    isSpecific: true,
  },
] as const;

/**
 * Mappa da alias a codice canonico.
 */
export const DISCIPLINE_ALIAS_MAP: ReadonlyMap<string, DisciplineCode> = new Map(
  DISCIPLINES.flatMap(d =>
    d.aliases.map(alias => [alias.toLowerCase(), d.code])
  )
);

/**
 * Risolve un alias legacy al codice canonico.
 */
export function resolveDisciplineCode(input: string): DisciplineCode | undefined {
  return DISCIPLINE_ALIAS_MAP.get(input.toLowerCase());
}

/**
 * Ottiene la definizione completa di una disciplina.
 */
export function getDisciplineDefinition(code: DisciplineCode): DisciplineDefinition | undefined {
  return DISCIPLINES.find(d => d.code === code);
}

/**
 * Verifica se una disciplina è supportata per un ordine.
 */
export function isDisciplineSupportedForOrder(
  disciplineCode: DisciplineCode,
  order: SchoolOrder
): boolean {
  const def = getDisciplineDefinition(disciplineCode);
  return def?.supportedOrders.includes(order) ?? false;
}

// ─── Knowledge Areas (Nuclei) ────────────────────────────────────────────────

/**
 * Nuclei fondanti per disciplina e ordine.
 * Struttura: `disciplineCode_order_nucleusName`
 */
export interface NucleusDefinition {
  /** Identificativo canonico */
  id: string;
  /** Nome del nucleo */
  name: string;
  /** Disciplina */
  disciplineCode: DisciplineCode;
  /** Ordine scolastico */
  order: SchoolOrder;
  /** Se è un nucleo specifico della disciplina */
  isSpecific: boolean;
}

/**
 * Nuclei note dal curriculumKB.
 */
export const NUCLEI_FONDANTI: readonly NucleusDefinition[] = [
  // Italiano - Infanzia
  { id: 'italiano_infanzia_discorsi', name: 'I discorsi e le parole', disciplineCode: 'italiano', order: 'infanzia', isSpecific: true },
  // Italiano - Primaria
  { id: 'italiano_primaria_ascolto', name: 'Ascolto e Parlato', disciplineCode: 'italiano', order: 'primaria', isSpecific: true },
  { id: 'italiano_primaria_lettura', name: 'Lettura', disciplineCode: 'italiano', order: 'primaria', isSpecific: true },
  { id: 'italiano_primaria_scrittura', name: 'Scrittura', disciplineCode: 'italiano', order: 'primaria', isSpecific: true },
  { id: 'italiano_primaria_lessico', name: 'Acquisizione e Lessico', disciplineCode: 'italiano', order: 'primaria', isSpecific: true },
  { id: 'italiano_primaria_riflessione', name: 'Riflessione sulla lingua', disciplineCode: 'italiano', order: 'primaria', isSpecific: true },
  // Italiano - Secondaria
  { id: 'italiano_secondaria_comunicazione', name: 'Comunicazione', disciplineCode: 'italiano', order: 'secondaria', isSpecific: true },
  { id: 'italiano_secondaria_letteratura', name: 'Letteratura', disciplineCode: 'italiano', order: 'secondaria', isSpecific: true },
  { id: 'italiano_secondaria_grammatica', name: 'Grammatica e Analisi', disciplineCode: 'italiano', order: 'secondaria', isSpecific: true },
  // Matematica
  { id: 'matematica_primaria_numeri', name: 'Numeri e Calcolo', disciplineCode: 'matematica', order: 'primaria', isSpecific: true },
  { id: 'matematica_primaria_geometria', name: 'Geometria', disciplineCode: 'matematica', order: 'primaria', isSpecific: true },
  { id: 'matematica_secondaria_algebra', name: 'Algebra', disciplineCode: 'matematica', order: 'secondaria', isSpecific: true },
  { id: 'matematica_secondaria_analisi', name: 'Analisi', disciplineCode: 'matematica', order: 'secondaria', isSpecific: true },
  // Scienze
  { id: 'scienze_primaria_vita', name: 'Scienze della Vita', disciplineCode: 'scienze', order: 'primaria', isSpecific: true },
  { id: 'scienze_primaria_materia', name: 'Scienze della Materia', disciplineCode: 'scienze', order: 'primaria', isSpecific: true },
  { id: 'scienze_secondaria_bioscienze', name: 'Bioscienze', disciplineCode: 'scienze', order: 'secondaria', isSpecific: true },
  { id: 'scienze_secondaria_scienze Terra', name: 'Scienze della Terra', disciplineCode: 'scienze', order: 'secondaria', isSpecific: true },
] as const;

// ─── Node Types ──────────────────────────────────────────────────────────────

/**
 * Tipi di nodo curricolare supportati.
 */
export type CurriculumNodeType =
  | 'traguardo'
  | 'obiettivo'
  | 'conoscenza'
  | 'abilita'
  | 'competenza'
  | 'evidenza'
  | 'criterio'
  | 'indicatore';

/**
 * Etichette visualizzate per ogni tipo di nodo.
 */
export const NODE_TYPE_LABELS: ReadonlyMap<CurriculumNodeType, string> = new Map([
  ['traguardo', 'Traguardo'],
  ['obiettivo', 'Obiettivo'],
  ['conoscenza', 'Conoscenza'],
  ['abilita', 'Abilità'],
  ['competenza', 'Competenza'],
  ['evidenza', 'Evidenza'],
  ['criterio', 'Criterio'],
  ['indicatore', 'Indicatore'],
]);

/**
 * Tipi di nodo presenti nel curriculumKB.
 */
export const LEGACY_NODE_TYPES: readonly CurriculumNodeType[] = [
  'traguardo',
  'obiettivo',
  'evidenza',
] as const;

// ─── Link Types ──────────────────────────────────────────────────────────────

/**
 * Tipi di relazione tra nodi curricolari.
 */
export type CurriculumLinkType =
  | 'progression'
  | 'prerequisite'
  | 'continuation'
  | 'equivalent'
  | 'related'
  | 'interdisciplinary'
  | 'evidence-for'
  | 'derived-from';

/**
 * Etichette visualizzate per ogni tipo di relazione.
 */
export const LINK_TYPE_LABELS: ReadonlyMap<CurriculumLinkType, string> = new Map([
  ['progression', 'Progressione'],
  ['prerequisite', 'Prerequisito'],
  ['continuation', 'Continuità'],
  ['equivalent', 'Equivalente'],
  ['related', 'Correlato'],
  ['interdisciplinary', 'Interdisciplinare'],
  ['evidence-for', 'Evidenza per'],
  ['derived-from', 'Derivato da'],
]);
