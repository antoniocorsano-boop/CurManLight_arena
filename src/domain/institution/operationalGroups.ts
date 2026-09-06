import type { SchoolOrder } from '../../types/curriculum';

export type OperationalSchoolOrder = Extract<SchoolOrder, 'primaria' | 'secondaria'>;

export type OperationalGroupCode =
  | 'P-G01'
  | 'P-G02'
  | 'P-G03'
  | 'P-G04'
  | 'S-G01'
  | 'S-G02'
  | 'S-G03'
  | 'S-G04';

export type OperationalGroupStatus = 'OPERATIVO_PROVVISORIO' | 'FORMALIZZATO';
export type OperationalGroupMemberRole = 'docente' | 'coordinatore';
export type TransversalAxisCode = 'educazione-civica' | 'ai-literacy';

export interface OperationalGroupDefinition {
  code: OperationalGroupCode;
  order: OperationalSchoolOrder;
  label: string;
  disciplines: readonly string[];
}

export interface OperationalReviewScope {
  academicYear: string;
  order: OperationalSchoolOrder;
  groupCode: OperationalGroupCode;
  discipline: string;
}

export interface TransversalReviewRouting {
  axis: TransversalAxisCode;
  nucleus: string;
  responsibleGroupCode: OperationalGroupCode;
  linkedGroupCodes: OperationalGroupCode[];
}

export const OPERATIONAL_GROUPS: readonly OperationalGroupDefinition[] = [
  { code: 'P-G01', order: 'primaria', label: 'Area linguistico-storico-geografica', disciplines: ['italiano', 'storia', 'geografia', 'religione'] },
  { code: 'P-G02', order: 'primaria', label: 'Area matematico-scientifico-tecnologica', disciplines: ['matematica', 'scienze', 'tecnologia'] },
  { code: 'P-G03', order: 'primaria', label: 'Area delle lingue straniere', disciplines: ['inglese'] },
  { code: 'P-G04', order: 'primaria', label: 'Area artistico-espressiva e motoria', disciplines: ['musica', 'arteImmagine', 'educazioneFisica'] },
  { code: 'S-G01', order: 'secondaria', label: 'Area linguistico-storico-geografica', disciplines: ['italiano', 'storia', 'geografia', 'latino', 'religione'] },
  { code: 'S-G02', order: 'secondaria', label: 'Area matematico-scientifico-tecnologica', disciplines: ['matematica', 'scienze', 'tecnologia'] },
  { code: 'S-G03', order: 'secondaria', label: 'Area delle lingue straniere', disciplines: ['inglese', 'secondaLingua'] },
  { code: 'S-G04', order: 'secondaria', label: 'Area artistico-espressiva e motoria', disciplines: ['musica', 'arteImmagine', 'educazioneFisica'] },
] as const;

export const TRANSVERSAL_AXES: Readonly<Record<TransversalAxisCode, { label: string; routing: 'NUCLEUS' }>> = {
  'educazione-civica': { label: 'Educazione civica', routing: 'NUCLEUS' },
  'ai-literacy': { label: 'AI Literacy', routing: 'NUCLEUS' },
};

export const getOperationalGroupsForOrder = (order: SchoolOrder): OperationalGroupDefinition[] => {
  if (order !== 'primaria' && order !== 'secondaria') return [];
  return OPERATIONAL_GROUPS.filter((group) => group.order === order);
};

export const getOperationalGroupByCode = (code: string | null | undefined): OperationalGroupDefinition | null =>
  OPERATIONAL_GROUPS.find((group) => group.code === code) ?? null;

export const getOperationalGroupForDiscipline = (order: SchoolOrder, discipline: string): OperationalGroupDefinition | null => {
  if (discipline === 'educazioneCivica') return null;
  return getOperationalGroupsForOrder(order).find((group) => group.disciplines.includes(discipline)) ?? null;
};

export const getOperationalGroupsForDisciplines = (order: SchoolOrder, disciplines: readonly string[]): OperationalGroupDefinition[] => {
  const selected = new Set(disciplines);
  return getOperationalGroupsForOrder(order).filter((group) => group.disciplines.some((discipline) => selected.has(discipline)));
};

export const getOperationalDisciplinesForOrder = (order: SchoolOrder): string[] =>
  Array.from(new Set(getOperationalGroupsForOrder(order).flatMap((group) => [...group.disciplines])));

export const isOperationalDisciplineCompetence = (
  order: SchoolOrder,
  groupCode: OperationalGroupCode,
  discipline: string,
): boolean => {
  const group = getOperationalGroupByCode(groupCode);
  return Boolean(group && group.order === order && group.disciplines.includes(discipline));
};

/** Educazione civica e AI Literacy restano assi trasversali: il routing è esplicito per nucleo. */
export const createTransversalReviewRouting = (input: TransversalReviewRouting): TransversalReviewRouting => {
  const responsible = getOperationalGroupByCode(input.responsibleGroupCode);
  if (!responsible) throw new Error('Gruppo responsabile trasversale non valido.');
  if (!input.nucleus.trim()) throw new Error('Il nucleo trasversale è obbligatorio.');
  const linked = Array.from(new Set(input.linkedGroupCodes));
  linked.forEach((code) => {
    if (!getOperationalGroupByCode(code)) throw new Error('Gruppo collegato trasversale non valido.');
  });
  return { ...input, nucleus: input.nucleus.trim(), linkedGroupCodes: linked };
};
