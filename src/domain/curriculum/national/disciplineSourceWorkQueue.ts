import { DM221_FIRST_CYCLE_DISCIPLINES } from './canonicalStructure';
import { DM221_2025_SOURCE_ID, type SourceBindingStatus } from './dm2212025';
import { getDm221FinalPublicationSectionBySegmentId } from './finalPublicationManifest';

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

function isFirstCycleOrder(order: string): order is 'primaria' | 'secondaria' {
  return order === 'primaria' || order === 'secondaria';
}

/**
 * Coda di indicizzazione delle discipline del primo ciclo.
 *
 * Tecnologia e' gestita dalla tranche dedicata. Per le altre discipline R7C5A
 * registra il locator di sezione nel volume finale MIM di marzo 2026.
 * SOURCE_LOCATED non equivale a SOURCE_VERIFIED: nessun testo viene promosso
 * finche' il singolo elemento non e' verificato da una persona.
 */
export const DM221_DISCIPLINE_SOURCE_WORK_QUEUE: readonly DisciplineSourceWorkItem[] = Object.values(
  DM221_FIRST_CYCLE_DISCIPLINES,
)
  .filter((segment) => segment.id !== 'dm221-disc-tecnologia')
  .map((segment) => {
    const publicationSection = getDm221FinalPublicationSectionBySegmentId(segment.id);
    const located = Boolean(publicationSection);

    return {
      segmentId: segment.id,
      label: segment.label,
      schoolOrders: segment.schoolOrders.filter(isFirstCycleOrder),
      sourceBindingStatus: (located ? 'SOURCE_LOCATED' : 'LOCATOR_REQUIRED') as SourceBindingStatus,
      sourceLocator: {
        sourceId: DM221_2025_SOURCE_ID,
        section: publicationSection?.label ?? segment.label,
        page: publicationSection?.pageStart,
        note: publicationSection
          ? `Volume finale MIM, marzo 2026, pp. ${publicationSection.pageStart}-${publicationSection.pageEnd}; confini di sezione localizzati, testo elemento-per-elemento ancora da verificare.`
          : 'Sezione disciplinare nota dalla struttura canonica; pagina e confini devono ancora essere verificati nella fonte ufficiale prima di SOURCE_LOCATED.',
      },
      verifiedByHuman: false as const,
    };
  });

export function getPendingDisciplineSourceCount(): number {
  return DM221_DISCIPLINE_SOURCE_WORK_QUEUE.filter(
    (item) => item.sourceBindingStatus === 'LOCATOR_REQUIRED',
  ).length;
}
