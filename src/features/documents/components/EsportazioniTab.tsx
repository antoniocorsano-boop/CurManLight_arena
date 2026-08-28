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
    <div className="space-y-4 fade-in text-left" data-beta-documents-scope="institutional-curriculum">
      <UiPanel variant="subtle">
        <UiSectionHeader
          title="Documenti del curricolo"
          description="Scegli se preparare un documento da condividere oppure conservare una copia di lavoro. Una copia esportata non diventa automaticamente una decisione ufficiale della scuola."
        />
      </UiPanel>

      {institutionalProfile.warning && (
        <div role="status" className="rounded-ui-panel border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] font-semibold leading-relaxed text-amber-900">
          {institutionalProfile.warning} Le copie di lavoro restano disponibili; un documento istituzionale richiede invece lo stato previsto dal percorso di adozione.
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2" aria-label="Azioni sui documenti del curricolo">
        <UiPanel>
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-ui-action" aria-hidden="true" />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <h2 className="text-[15px] font-semibold text-ui-text">Condividi il curricolo</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-ui-text-secondary">
                  Prepara una versione leggibile del curricolo corrente. Il sistema mantiene separata l’esportazione dall’eventuale adozione istituzionale.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <UiButton variant="primary" size="small" onClick={handleDownloadWordDocx}>Word (.docx)</UiButton>
                <UiButton variant="secondary" size="small" onClick={handleDownloadODF}>LibreOffice / ODF</UiButton>
                <UiButton variant="secondary" size="small" onClick={handleDownloadCurricoloPDF}><Printer className="h-3.5 w-3.5" aria-hidden="true" /> PDF</UiButton>
                <UiButton variant="quiet" size="small" onClick={handleCopyToClipboardFormatted}>Copia tabella</UiButton>
              </div>
            </div>
          </div>
        </UiPanel>

        <UiPanel>
          <div className="flex items-start gap-3">
            <Code className="mt-0.5 h-5 w-5 shrink-0 text-ui-success" aria-hidden="true" />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <h2 className="text-[15px] font-semibold text-ui-text">Continua il lavoro</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-ui-text-secondary">
                  Conserva una copia locale modificabile o trasferibile senza presentarla come documento adottato.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <UiButton variant="primary" size="small" onClick={handleDownloadCml}>Copia di lavoro .cml</UiButton>
                <UiButton variant="secondary" size="small" onClick={handleDownloadTxt}>Testo .txt</UiButton>
              </div>
            </div>
          </div>
        </UiPanel>
      </section>

      {documentExportHistory.length > 0 && (
        <details className="rounded-ui-panel border border-ui-border bg-ui-surface">
          <summary className="cursor-pointer px-4 py-3 text-[13px] font-semibold text-ui-text-secondary">
            Esportazioni recenti
          </summary>
          <div className="border-t border-ui-border p-4">
            <DocumentExportHistory events={documentExportHistory} onClearHistory={clearDocumentExportHistory} />
          </div>
        </details>
      )}

      <details className="rounded-ui-panel border border-ui-border bg-ui-surface" data-hcm-technical-details>
        <summary className="cursor-pointer px-4 py-3 text-[12px] font-semibold text-ui-text-muted">Dettagli sul perimetro Beta</summary>
        <div className="border-t border-ui-border px-4 py-3 text-[12px] leading-relaxed text-ui-text-secondary">
          Questa superficie contiene solo documenti del curricolo e copie di lavoro. La documentazione didattica operativa e gli strumenti non collegati al percorso curricolare istituzionale restano fuori dalla superficie primaria di Arena Beta.
        </div>
      </details>
    </div>
  );
}
