import { useCallback } from 'react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type { DocumentExportEvent, UdaModel, SchoolOrder } from '../../../types/curriculum';
import { computeUdaSignature, computeCurriculumSignature } from '../utils/sourceSignature';

let eventCounter = 0;

function generateEventId(): string {
  eventCounter += 1;
  return `exp-${Date.now()}-${eventCounter}`;
}

type RecordExportArgs = {
  documentType: DocumentExportEvent['documentType'];
  format: DocumentExportEvent['format'];
  label: string;
  sourceKind: DocumentExportEvent['sourceKind'];
  sourceId?: string;
  sourceTitle?: string;
  discipline: string;
  order: SchoolOrder;
  classLabel?: string;
  workStatus?: string;
  sourceView?: string;
  sourceSignature?: string;
};

export function useDocumentContinuity() {
  const addDocumentExportEvent = useCurriculumStore((s) => s.addDocumentExportEvent);
  const clearDocumentExportHistory = useCurriculumStore((s) => s.clearDocumentExportHistory);
  const documentExportHistory = useCurriculumStore((s) => s.documentExportHistory);
  const savedUda = useCurriculumStore((s) => s.savedUda);
  const decisions = useCurriculumStore((s) => s.decisions);
  const customTexts = useCurriculumStore((s) => s.customTexts);
  const discipline = useCurriculumStore((s) => s.discipline);
  const order = useCurriculumStore((s) => s.order);
  const selectedTraguardi = useCurriculumStore((s) => s.selectedTraguardi);
  const selectedObiettivi = useCurriculumStore((s) => s.selectedObiettivi);

  const recordExport = useCallback(
    (args: RecordExportArgs) => {
      const event: DocumentExportEvent = {
        id: generateEventId(),
        documentType: args.documentType,
        format: args.format,
        label: args.label,
        sourceKind: args.sourceKind,
        sourceId: args.sourceId,
        sourceTitle: args.sourceTitle,
        discipline: args.discipline,
        order: args.order,
        classLabel: args.classLabel,
        workStatus: args.workStatus,
        exportedAt: new Date().toISOString(),
        sourceSignature: args.sourceSignature,
        sourceView: args.sourceView,
        coherence: 'current',
      };
      addDocumentExportEvent(event);
    },
    [addDocumentExportEvent]
  );

  const computeCurrentUdaSignature = useCallback(
    (uda: UdaModel) => computeUdaSignature(uda),
    []
  );

  const computeCurrentCurriculumSignature = useCallback(
    () => computeCurriculumSignature(discipline, order, decisions as Record<string, string>, customTexts as Record<string, string>, selectedTraguardi, selectedObiettivi),
    [discipline, order, decisions, customTexts, selectedTraguardi, selectedObiettivi]
  );

  const computeCoherence = useCallback(
    (event: DocumentExportEvent): DocumentExportEvent['coherence'] => {
      if (!event.sourceSignature) return 'unverifiable';

      if (event.sourceKind === 'uda' && event.sourceId) {
        const uda = savedUda.find((u) => u.id === event.sourceId);
        if (!uda) return 'unverifiable';
        const currentSig = computeUdaSignature(uda);
        return currentSig === event.sourceSignature ? 'current' : 'modified';
      }

      if (event.sourceKind === 'curriculum') {
        const currentSig = computeCurriculumSignature(
          discipline,
          order,
          decisions as Record<string, string>,
          customTexts as Record<string, string>,
          selectedTraguardi,
          selectedObiettivi
        );
        return currentSig === event.sourceSignature ? 'current' : 'modified';
      }

      return 'unverifiable';
    },
    [savedUda, discipline, order, decisions, customTexts, selectedTraguardi, selectedObiettivi]
  );

  const historyWithCoherence = documentExportHistory.map((event) => ({
    ...event,
    coherence: computeCoherence(event),
  }));

  return {
    recordExport,
    clearDocumentExportHistory,
    documentExportHistory: historyWithCoherence,
    computeCurrentUdaSignature,
    computeCurrentCurriculumSignature,
  };
}
