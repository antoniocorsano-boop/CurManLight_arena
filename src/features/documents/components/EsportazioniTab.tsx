import { Code, FileText, Printer } from 'lucide-react';
import type { AppViewsLayerProps } from '../../session';
import { DocumentExportHistory } from './DocumentExportHistory';
import { UiButton } from '../../../ui/components/UiButton';
import { UiPanel } from '../../../ui/components/UiPanel';
import { UiSectionHeader } from '../../../ui/components/UiSectionHeader';

export type EsportazioniTabProps = Pick<AppViewsLayerProps,
  | 'esportazioniTab'
  | 'setEsportazioniTab'
  | 'templateDocType'
  | 'setTemplateDocType'
  | 'templateJsonState'
  | 'setTemplateJsonState'
  | 'templateChatInput'
  | 'setTemplateChatInput'
  | 'templateChatHistory'
  | 'handleSendTemplateInstruction'
  | 'handleDownloadWordDefinitivo'
  | 'handleDownloadWordDocx'
  | 'handleDownloadODF'
  | 'handleDownloadCurricoloPDF'
  | 'handleCopyToClipboardFormatted'
  | 'handleDownloadTxt'
  | 'handleDownloadCml'
  | 'handleDownloadWordConfronto'
  | 'handleDownloadRichMarkdown'
  | 'handleDownloadPdfDirect'
  | 'handleClearLocalStorageWithReset'
  | 'handleGenerateProgrammazioneAnnualeDoc'
  | 'handleGenerateRelazioneDoc'
  | 'handleGenerateSpecificoGradoDoc'
  | 'targetClass'
  | 'targetSection'
  | 'showToast'
  | 'documentExportHistory'
  | 'clearDocumentExportHistory'
  | 'institutionalProfile'
  | 'resetTemplateState'
>;

export function EsportazioniTab({
  handleDownloadWordDocx,
  handleDownloadODF,
  handleDownloadCurricoloPDF,
  handleCopyToClipboardFormatted,
  handleDownloadTxt,
  handleDownloadCml,
  documentExportHistory,
  clearDocumentExportHistory,
  institutionalProfile,
}: EsportazioniTabProps) {
  return (
    <div
      className="space-y-4 fade-in text-left"
      data-beta-documents-scope="institutional-curriculum"
      data-human-task="export-curriculum"
    >
      <UiPanel variant="subtle">
        <UiSectionHeader
          title="Documenti del curricolo"
          description="Scegli cosa vuoi ottenere. Esportare un file non approva il curricolo e non modifica lo stato della scuola."
        />
      </UiPanel>

      {institutionalProfile.warning && (
        <div role="status" className="rounded-ui-panel border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">
          Stai lavorando senza un contesto istituzionale verificato. Puoi comunque creare copie di lavoro e documenti da leggere.
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2" aria-label="Scegli cosa vuoi ottenere dal curricolo">
        <UiPanel>
          <section className="flex items-start gap-3" aria-labelledby="export-share-title" data-export-intent="share-readable-document">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-ui-action" aria-hidden="true" />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <h2 id="export-share-title" className="text-base font-semibold text-ui-text">Condividi il curricolo</h2>
                <p className="mt-1 text-sm leading-6 text-ui-text-secondary">Crea un documento leggibile da inviare, stampare o discutere.</p>
              </div>

              <UiButton variant="primary" size="medium" className="w-full sm:w-auto" onClick={handleDownloadWordDocx}>
                Scarica Word (.docx)
              </UiButton>

              <details className="rounded-ui-control border border-ui-border bg-ui-surface-subtle" data-export-format-options>
                <summary className="cursor-pointer px-3 py-3 text-sm font-semibold text-ui-text-secondary focus:outline-none focus:ring-2 focus:ring-ui-focus focus:ring-inset">
                  Altri formati
                </summary>
                <div className="flex flex-col gap-2 border-t border-ui-border p-3 sm:flex-row sm:flex-wrap" role="group" aria-label="Formati alternativi per condividere il curricolo">
                  <UiButton variant="secondary" size="small" className="w-full sm:w-auto" onClick={handleDownloadODF}>Documento aperto (.odt)</UiButton>
                  <UiButton variant="secondary" size="small" className="w-full sm:w-auto" onClick={handleDownloadCurricoloPDF}>
                    <Printer className="h-3.5 w-3.5" aria-hidden="true" /> PDF
                  </UiButton>
                  <UiButton variant="quiet" size="small" className="w-full sm:w-auto" onClick={handleCopyToClipboardFormatted}>Copia tabella</UiButton>
                </div>
              </details>
            </div>
          </section>
        </UiPanel>

        <UiPanel>
          <section className="flex items-start gap-3" aria-labelledby="export-work-title" data-export-intent="continue-work">
            <Code className="mt-0.5 h-5 w-5 shrink-0 text-ui-success" aria-hidden="true" />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <h2 id="export-work-title" className="text-base font-semibold text-ui-text">Continua il lavoro</h2>
                <p className="mt-1 text-sm leading-6 text-ui-text-secondary">Salva una copia locale trasferibile per riprendere il lavoro in CurManLight.</p>
              </div>

              <UiButton variant="primary" size="medium" className="w-full sm:w-auto" onClick={handleDownloadCml}>
                Salva copia di lavoro (.cml)
              </UiButton>

              <details className="rounded-ui-control border border-ui-border bg-ui-surface-subtle" data-export-format-options>
                <summary className="cursor-pointer px-3 py-3 text-sm font-semibold text-ui-text-secondary focus:outline-none focus:ring-2 focus:ring-ui-focus focus:ring-inset">
                  Serve solo il testo?
                </summary>
                <div className="border-t border-ui-border p-3">
                  <UiButton variant="secondary" size="small" className="w-full sm:w-auto" onClick={handleDownloadTxt}>Esporta testo (.txt)</UiButton>
                </div>
              </details>
            </div>
          </section>
        </UiPanel>
      </section>

      {documentExportHistory.length > 0 && (
        <details className="rounded-ui-panel border border-ui-border bg-ui-surface">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-ui-text-secondary focus:outline-none focus:ring-2 focus:ring-ui-focus focus:ring-inset">Esportazioni recenti</summary>
          <div className="border-t border-ui-border p-4">
            <DocumentExportHistory events={documentExportHistory} onClearHistory={clearDocumentExportHistory} />
          </div>
        </details>
      )}

      <details className="rounded-ui-panel border border-ui-border bg-ui-surface" data-hcm-technical-details>
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-ui-text-muted focus:outline-none focus:ring-2 focus:ring-ui-focus focus:ring-inset">Cosa non fa questa pagina</summary>
        <div className="border-t border-ui-border px-4 py-3 text-sm leading-6 text-ui-text-secondary">
          Non adotta il curricolo, non attribuisce autorità e non modifica automaticamente il lavoro didattico a valle.
        </div>
      </details>
    </div>
  );
}
