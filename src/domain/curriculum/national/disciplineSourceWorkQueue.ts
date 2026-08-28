import { DM221_FIRST_CYCLE_DISCIPLINES } from './canonicalStructure';
import { DM221_2025_SOURCE_ID, type SourceBindingStatus } from './dm2212025';

export interface DisciplineSourceWorkItem {
  segmentId: string;
  label: string;
  schoolOrders: readonly ('primaria' | 'secondaria')[];
  sourceBindingStatus: SourceBindingStatus;
  sourceLocator: {
    sourceId: typeof DM221_2025_SOURCE_ID;
    section: string;
    page?: number;
    note: string;
  };
  verifiedByHuman: false;
}

/**
 * Coda di indicizzazione delle discipline del primo ciclo.
 *
 * Tecnologia e' gestita dalla tranche dedicata. Le altre discipline vengono
 * registrate come lavoro obbligatorio ma restano LOCATOR_REQUIRED finche' la
 * relativa sezione non viene verificata sulla pubblicazione ufficiale.
 */
export const DM221_DISCIPLINE_SOURCE_WORK_QUEUE: readonly DisciplineSourceWorkItem[] = Object.values(
  DM221_FIRST_CYCLE_DISCIPLINES,
)
  .filter((segment) => segment.id !== 'dm221-disc-tecnologia')
  .map((segment) => ({
    segmentId: segment.id,
    label: segment.label,
    schoolOrders: segment.schoolOrders,
    sourceBindingStatus: 'LOCATOR_REQUIRED' as const,
    sourceLocator: {
      sourceId: DM221_2025_SOURCE_ID,
      section: segment.label,
      note: 'Sezione disciplinare nota dalla struttura canonica; pagina e confini devono ancora essere verificati nella fonte ufficiale prima di SOURCE_LOCATED.',
    },
    verifiedByHuman: false as const,
  }));

export function getPendingDisciplineSourceCount(): number {
  return DM221_DISCIPLINE_SOURCE_WORK_QUEUE.filter(
    (item) => item.sourceBindingStatus === 'LOCATOR_REQUIRED',
  ).length;
}
