export type ExportIntent = 'share' | 'continue-work' | 'teaching-document';

export interface ExportIntentCommunication {
  id: ExportIntent;
  eyebrow: string;
  title: string;
  summary: string;
  consequence: string;
}

export const EXPORT_INTENTS: readonly ExportIntentCommunication[] = [
  {
    id: 'share',
    eyebrow: 'Per leggere o consegnare',
    title: 'Prepara un documento da condividere',
    summary: 'Crea una copia leggibile del curricolo da aprire, stampare o inviare ad altre persone.',
    consequence: 'Viene scaricato un nuovo file sul dispositivo. Il curricolo in Arena non viene modificato.',
  },
  {
    id: 'continue-work',
    eyebrow: 'Per continuare il lavoro',
    title: 'Porta con te una copia modificabile',
    summary: 'Scarica una copia del lavoro da riaprire o usare in un passaggio successivo senza trasformarla in una decisione istituzionale.',
    consequence: 'Il file è una copia di lavoro: non approva, non pubblica e non sostituisce il curricolo istituzionale.',
  },
  {
    id: 'teaching-document',
    eyebrow: 'Per la classe',
    title: 'Crea un documento didattico',
    summary: 'Genera programmazione, relazione o documento specifico usando il contesto di classe e disciplina già selezionato.',
    consequence: 'Prima viene preparata una bozza locale da controllare; nessun documento viene inviato automaticamente.',
  },
] as const;

const PRIMARY_TECHNICAL_TERMS = /\b(?:DOCX|ODF|CML|Markdown|JSON|blob|IndexedDB|PREVIEW_ONLY|downstream|footprint)\b|\.docx?\b|\.odt\b|\.cml\b|\.md\b/i;

export function auditExportPrimaryCommunication(): string[] {
  return EXPORT_INTENTS.flatMap((intent) => {
    const primary = `${intent.eyebrow} ${intent.title} ${intent.summary} ${intent.consequence}`;
    return PRIMARY_TECHNICAL_TERMS.test(primary) ? [`technical leak in ${intent.id}`] : [];
  });
}
