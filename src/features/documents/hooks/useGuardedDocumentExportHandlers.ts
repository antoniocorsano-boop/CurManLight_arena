import { assertInstitutionalCurriculumProjection } from '../../../domain/curriculum/foundationAuthority';
import { getCurriculumBaselineProvenance } from '../../../lib/curriculumBaseline';
import { useDocumentExportHandlers as useLegacyDocumentExportHandlers } from './useDocumentExportHandlers';

export const CURRICULUM_INSTITUTIONAL_EXPORT_BLOCKED_MESSAGE =
  'Questo curricolo non è ancora attestato come curricolo d’istituto adottato. Puoi continuare a lavorare ed esportare una copia di lavoro, ma non un documento che lo presenti come ufficiale.';

type LegacyArgs = Parameters<typeof useLegacyDocumentExportHandlers>[0];
type AnyHandler = (...args: any[]) => any;

function guardInstitutionalExport<THandler extends AnyHandler>(
  handler: THandler,
  showToast: LegacyArgs['showToast'],
): THandler {
  return ((...handlerArgs: Parameters<THandler>): ReturnType<THandler> | undefined => {
    try {
      assertInstitutionalCurriculumProjection(getCurriculumBaselineProvenance());
    } catch {
      showToast(CURRICULUM_INSTITUTIONAL_EXPORT_BLOCKED_MESSAGE, false);
      return undefined;
    }

    return handler(...handlerArgs);
  }) as THandler;
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
  const guard = <THandler extends AnyHandler>(handler: THandler) =>
    guardInstitutionalExport(handler, args.showToast);

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
