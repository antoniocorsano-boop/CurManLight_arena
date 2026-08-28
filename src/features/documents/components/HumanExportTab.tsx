import { FileText, RefreshCcw, School, Share2, Wrench } from 'lucide-react';
import { UiButton } from '../../../ui/components/UiButton';
import { UiPanel } from '../../../ui/components/UiPanel';
import { UiSectionHeader } from '../../../ui/components/UiSectionHeader';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import { DocumentExportHistory } from './DocumentExportHistory';
import { EsportazioniTab, type EsportazioniTabProps } from './EsportazioniTab';
import { EXPORT_INTENTS } from '../communication/exportCommunication';

const getDisciplineLabel = (disc: string) => {
  const labels: Record<string, string> = {
    italiano: 'Italiano', matematica: 'Matematica', scienze: 'Scienze', tecnologia: 'Tecnologia',
    storia: 'Storia', geografia: 'Geografia', inglese: 'Inglese', secondaLingua: 'Seconda Lingua',
    arteImmagine: 'Arte e Immagine', musica: 'Musica', educazioneFisica: 'Educazione Fisica',
    educazioneCivica: 'Educazione Civica', religione: 'Religione', latino: 'Latino',
  };
  return labels[disc] || disc;
};

export function HumanExportTab(props: EsportazioniTabProps) {
  const { discipline, order } = useCurriculumStore();

  if (props.esportazioniTab === 'template') {
    return <EsportazioniTab {...props} />;
  }

  const [share, continueWork, teaching] = EXPORT_INTENTS;
  const classLabel = order === 'infanzia'
    ? `Sezione ${props.targetSection}`
    : `Classe ${props.targetClass}^${props.targetSection}`;

  return (
    <div className="space-y-6 fade-in text-left" data-hcm-export-surface>
      <UiPanel variant="subtle">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <UiSectionHeader
            title="Esporta"
            description="Scegli prima cosa devi ottenere. Il formato del file viene dopo."
          />
          <UiButton variant="quiet" size="small" onClick={() => props.setEsportazioniTab('template')}>
            <Wrench className="h-4 w-4" /> Modelli assistiti
          </UiButton>
        </div>
      </UiPanel>

      {props.institutionalProfile.warning && (
        <div role="status" className="rounded-ui-panel border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          <strong className="block">Puoi creare una copia, ma manca un dato dell’istituto.</strong>
          <span>{props.institutionalProfile.warning} Il file resta utilizzabile come copia personale o dimostrativa.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <UiPanel>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Share2 className="mt-0.5 h-5 w-5 shrink-0 text-ui-action" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ui-text-muted">{share.eyebrow}</div>
                <h3 className="mt-1 text-[16px] font-semibold text-ui-text">{share.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ui-text-secondary">{share.summary}</p>
              </div>
            </div>
            <div className="rounded-ui-control bg-ui-surface-subtle p-3 text-[12px] text-ui-text-secondary">{share.consequence}</div>
            <UiButton variant="primary" size="small" className="w-full" onClick={props.handleDownloadWordDocx}>
              <FileText className="h-4 w-4" /> Scarica documento modificabile
            </UiButton>
            <div className="flex flex-wrap gap-2">
              <UiButton variant="secondary" size="small" onClick={props.handleDownloadCurricoloPDF}>Salva per stampa</UiButton>
              <UiButton variant="secondary" size="small" onClick={props.handleDownloadODF}>Formato aperto</UiButton>
              <UiButton variant="quiet" size="small" onClick={props.handleCopyToClipboardFormatted}>Copia contenuto</UiButton>
            </div>
            <details className="text-[12px] text-ui-text-muted" data-hcm-technical-details>
              <summary className="cursor-pointer font-semibold">Dettagli sui formati</summary>
              <div className="mt-2 space-y-1">Documento modificabile: .docx · formato aperto: .odt · stampa: PDF.</div>
            </details>
          </div>
        </UiPanel>

        <UiPanel>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <RefreshCcw className="mt-0.5 h-5 w-5 shrink-0 text-ui-action" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ui-text-muted">{continueWork.eyebrow}</div>
                <h3 className="mt-1 text-[16px] font-semibold text-ui-text">{continueWork.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ui-text-secondary">{continueWork.summary}</p>
              </div>
            </div>
            <div className="rounded-ui-control bg-ui-surface-subtle p-3 text-[12px] text-ui-text-secondary">{continueWork.consequence}</div>
            <UiButton variant="primary" size="small" className="w-full" onClick={props.handleDownloadCml}>
              Scarica copia di lavoro
            </UiButton>
            <div className="flex flex-wrap gap-2">
              <UiButton variant="secondary" size="small" onClick={props.handleDownloadWordConfronto}>Confronto leggibile</UiButton>
              <UiButton variant="secondary" size="small" onClick={props.handleDownloadRichMarkdown}>Testo strutturato</UiButton>
              <UiButton variant="quiet" size="small" onClick={props.handleDownloadTxt}>Solo testo</UiButton>
            </div>
            <details className="text-[12px] text-ui-text-muted" data-hcm-technical-details>
              <summary className="cursor-pointer font-semibold">Dettagli sui formati</summary>
              <div className="mt-2 space-y-1">Copia di lavoro: .cml · testo strutturato: Markdown · testo semplice: .txt.</div>
            </details>
          </div>
        </UiPanel>

        <UiPanel>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <School className="mt-0.5 h-5 w-5 shrink-0 text-ui-action" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ui-text-muted">{teaching.eyebrow}</div>
                <h3 className="mt-1 text-[16px] font-semibold text-ui-text">{teaching.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ui-text-secondary">{teaching.summary}</p>
              </div>
            </div>
            <div className="rounded-ui-control bg-ui-surface-subtle p-3 text-[12px] text-ui-text-secondary">
              <strong>{classLabel} · {getDisciplineLabel(discipline)}</strong><br />{teaching.consequence}
            </div>
            <UiButton variant="primary" size="small" className="w-full" onClick={props.handleGenerateProgrammazioneAnnualeDoc}>
              Prepara programmazione annuale
            </UiButton>
            <UiButton variant="secondary" size="small" className="w-full" onClick={props.handleGenerateRelazioneDoc}>
              Prepara relazione
            </UiButton>
            {order !== 'secondaria' || props.targetClass === '3' ? (
              <UiButton variant="secondary" size="small" className="w-full" onClick={props.handleGenerateSpecificoGradoDoc}>
                Prepara documento specifico
              </UiButton>
            ) : (
              <div className="rounded-ui-control bg-ui-surface-subtle p-3 text-center text-[12px] text-ui-text-muted">
                Il documento specifico è disponibile per la classe terza.
              </div>
            )}
          </div>
        </UiPanel>
      </div>

      <UiPanel>
        <DocumentExportHistory events={props.documentExportHistory} onClearHistory={props.clearDocumentExportHistory} />
      </UiPanel>

      <div className="text-center text-[12px] text-ui-text-muted">
        Le operazioni di esportazione creano copie locali: non approvano, non pubblicano e non modificano automaticamente il curricolo istituzionale.
      </div>
    </div>
  );
}
