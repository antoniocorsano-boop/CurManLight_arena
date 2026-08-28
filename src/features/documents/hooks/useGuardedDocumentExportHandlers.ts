import { assertInstitutionalCurriculumProjection } from '../../../domain/curriculum/foundationAuthority';
import { getCurriculumBaselineProvenance } from '../../../lib/curriculumBaseline';
import { useDocumentExportHandlers as useLegacyDocumentExportHandlers } from './useDocumentExportHandlers';

export const CURRICULUM_INSTITUTIONAL_EXPORT_BLOCKED_MESSAGE =
  'Questo curricolo non è ancora attestato come curricolo d’istituto adottato. Puoi continuare a lavorare ed esportare una copia di lavoro, ma non un documento che lo presenti come ufficiale.';

type LegacyArgs = Parameters<typeof useLegacyDocumentExportHandlers>[0];
type VoidHandler = () => void;

function guardInstitutionalExport(handler: VoidHandler, showToast: LegacyArgs['showToast']): VoidHandler {
  return () => {
    try {
      assertInstitutionalCurriculumProjection(getCurriculumBaselineProvenance());
    } catch {
      showToast(CURRICULUM_INSTITUTIONAL_EXPORT_BLOCKED_MESSAGE, false);
      return;
    }

    handler();
  };
}

/**
 * Boundary applicativo per gli export curricolari.
 *
 * Il generatore legacy resta un implementation detail. Tutte le proiezioni che
 * presentano il curricolo come documento istituzionale passano da questo gate
 * prima di creare Blob, aprire la stampa o avviare un download.
 *
 * Le copie di lavoro (es. CML/TXT) non vengono promosse ad atti istituzionali e
 * restano disponibili per revisione, continuità e trasferimento controllato.
 */
export function useGuardedDocumentExportHandlers(args: LegacyArgs) {
  const handlers = useLegacyDocumentExportHandlers(args);
  const guard = (handler: VoidHandler) => guardInstitutionalExport(handler, args.showToast);

  return {
    ...handlers,
    handleDownloadWordDefinitivo: guard(handlers.handleDownloadWordDefinitivo),
    handleDownloadWordDocx: guard(handlers.handleDownloadWordDocx),
    handleDownloadODF: guard(handlers.handleDownloadODF),
    handlePrintDocumentPdf: guard(handlers.handlePrintDocumentPdf),
    handleDownloadCurricoloPDF: guard(handlers.handleDownloadCurricoloPDF),
    handleDownloadRichMarkdown: guard(handlers.handleDownloadRichMarkdown),
    handleDownloadPdfDirect: guard(handlers.handleDownloadPdfDirect),
    handleDownloadWordConfronto: guard(handlers.handleDownloadWordConfronto),
  };
}
