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

/**
 * Arena Beta exposes only outputs that belong to the institutional curriculum
 * journey. Teacher-operational documentation and other legacy utilities remain
 * outside this primary surface. The wider prop contract is retained only for
 * compatibility with the existing application boundary while migration proceeds.
 */
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
          description="Prima scegli cosa vuoi ottenere. Il formato del file viene dopo: puoi preparare un documento da condividere oppure conservare una copia per continuare il lavoro. Nessuna esportazione rende automaticamente ufficiale una decisione della scuola."
        />
      </UiPanel>

      {institutionalProfile.warning && (
        <div role="status" className="rounded-ui-panel border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] font-semibold leading-relaxed text-amber-900">
          {institutionalProfile.warning} Le copie di lavoro restano disponibili; un documento istituzionale richiede invece lo stato previsto dal percorso di adozione.
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2" aria-label="Scegli cosa vuoi ottenere dal curricolo">
        <UiPanel>
          <section className="flex items-start gap-3" aria-labelledby="export-share-title" data-export-intent="share-readable-document">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-ui-action" aria-hidden="true" />
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <h2 id="export-share-title" className="text-[15px] font-semibold text-ui-text">Condividi il curricolo</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-ui-text-secondary">
                  Prepara una versione leggibile del curricolo corrente da inviare, stampare o discutere. Il sistema mantiene separata l’esportazione dall’eventuale adozione istituzionale.
                </p>
              </div>

              <div className="space-y-2" role="group" aria-label="Azione principale per condividere il curricolo">
                <UiButton
                  variant="primary"
                  size="medium"
                  className="w-full sm:w-auto"
                  onClick={handleDownloadWordDocx}
                >
                  Scarica il documento
                  <span className="text-[11px] font-normal opacity-85">Word .docx</span>
                </UiButton>
                <p className="text-[11px] leading-relaxed text-ui-text-muted">
                  Scelta consigliata per un documento modificabile e facilmente condivisibile.
                </p>
              </div>

              <details className="rounded-ui-control border border-ui-border bg-ui-surface-subtle" data-export-format-options>
                <summary className="cursor-pointer px-3 py-2.5 text-[12px] font-semibold text-ui-text-secondary focus:outline-none focus:ring-2 focus:ring-ui-focus focus:ring-inset">
                  Altri modi per condividere
                </summary>
                <div className="flex flex-col gap-2 border-t border-ui-border p-3 sm:flex-row sm:flex-wrap" role="group" aria-label="Formati alternativi per condividere il curricolo">
                  <UiButton variant="secondary" size="small" className="w-full sm:w-auto" onClick={handleDownloadODF}>
                    Documento aperto (.odt)
                  </UiButton>
                  <UiButton variant="secondary" size="small" className="w-full sm:w-auto" onClick={handleDownloadCurricoloPDF}>
                    <Printer className="h-3.5 w-3.5" aria-hidden="true" /> PDF da leggere o stampare
                  </UiButton>
                  <UiButton variant="quiet" size="small" className="w-full sm:w-auto" onClick={handleCopyToClipboardFormatted}>
                    Copia la tabella
                  </UiButton>
                </div>
              </details>
            </div>
          </section>
        </UiPanel>

        <UiPanel>
          <section className="flex items-start gap-3" aria-labelledby="export-work-title" data-export-intent="continue-work">
            <Code className="mt-0.5 h-5 w-5 shrink-0 text-ui-success" aria-hidden="true" />
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <h2 id="export-work-title" className="text-[15px] font-semibold text-ui-text">Continua il lavoro</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-ui-text-secondary">
                  Conserva una copia locale trasferibile per riprendere il lavoro in CurManLight, senza presentarla come documento adottato.
                </p>
              </div>

              <div className="space-y-2" role="group" aria-label="Azione principale per continuare il lavoro">
                <UiButton
                  variant="primary"
                  size="medium"
                  className="w-full sm:w-auto"
                  onClick={handleDownloadCml}
                >
                  Salva una copia di lavoro
                  <span className="text-[11px] font-normal opacity-85">.cml</span>
                </UiButton>
                <p className="text-[11px] leading-relaxed text-ui-text-muted">
                  Mantiene il contenuto in un file di lavoro CurManLight da trasferire o conservare localmente.
                </p>
              </div>

              <details className="rounded-ui-control border border-ui-border bg-ui-surface-subtle" data-export-format-options>
                <summary className="cursor-pointer px-3 py-2.5 text-[12px] font-semibold text-ui-text-secondary focus:outline-none focus:ring-2 focus:ring-ui-focus focus:ring-inset">
                  Serve solo il testo?
                </summary>
                <div className="border-t border-ui-border p-3" role="group" aria-label="Formato alternativo per continuare il lavoro">
                  <UiButton variant="secondary" size="small" className="w-full sm:w-auto" onClick={handleDownloadTxt}>
                    Esporta testo semplice (.txt)
                  </UiButton>
                </div>
              </details>
            </div>
          </section>
        </UiPanel>
      </section>

      {documentExportHistory.length > 0 && (
        <details className="rounded-ui-panel border border-ui-border bg-ui-surface">
          <summary className="cursor-pointer px-4 py-3 text-[13px] font-semibold text-ui-text-secondary focus:outline-none focus:ring-2 focus:ring-ui-focus focus:ring-inset">
            Esportazioni recenti
          </summary>
          <div className="border-t border-ui-border p-4">
            <DocumentExportHistory events={documentExportHistory} onClearHistory={clearDocumentExportHistory} />
          </div>
        </details>
      )}

      <details className="rounded-ui-panel border border-ui-border bg-ui-surface" data-hcm-technical-details>
        <summary className="cursor-pointer px-4 py-3 text-[12px] font-semibold text-ui-text-muted focus:outline-none focus:ring-2 focus:ring-ui-focus focus:ring-inset">Dettagli sul perimetro Beta</summary>
        <div className="border-t border-ui-border px-4 py-3 text-[12px] leading-relaxed text-ui-text-secondary">
          Questa superficie contiene solo documenti del curricolo e copie di lavoro. La documentazione didattica operativa e gli strumenti non collegati al percorso curricolare istituzionale restano fuori dalla superficie primaria di Arena Beta.
        </div>
      </details>
    </div>
  );
}
