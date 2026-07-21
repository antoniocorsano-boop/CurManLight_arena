import { UdaModel, SchoolOrder } from '../types/curriculum';
import { escapeHtml } from './escapeHtml';

interface DocumentConfig {
  type: string;
  format: string;
  template: string;
  includeHeader: boolean;
  includeFooter: boolean;
  customHeader: string;
  customFooter: string;
  fontSize: number;
  marginStyle: string;
}

interface ProgrammazioneData {
  discipline: string;
  order: SchoolOrder;
  traguardi: string[];
  obiettivi: string[];
  evidenze: string[];
  schoolYear: string;
}

export function generateProgrammazioneAnnuale(data: ProgrammazioneData): string {
  const header = `<h1>Programmazione Annuale - ${escapeHtml(data.discipline)}</h1>
<p><strong>Anno Scolastico:</strong> ${escapeHtml(data.schoolYear)}</p>
<p><strong>Ordine:</strong> ${escapeHtml(data.order)}</p>`;

  const traguardi = data.traguardi.length > 0
    ? `<h2>Traguardi</h2><ul>${data.traguardi.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
    : '';

  const obiettivi = data.obiettivi.length > 0
    ? `<h2>Obiettivi</h2><ul>${data.obiettivi.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul>`
    : '';

  const evidenze = data.evidenze.length > 0
    ? `<h2>Evidenze</h2><ul>${data.evidenze.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>`
    : '';

  return `${header}${traguardi}${obiettivi}${evidenze}`;
}

export function generateRelazione(data: { discipline: string; order: SchoolOrder; type: 'intermedia' | 'finale' }): string {
  const title = data.type === 'intermedia' ? 'Relazione Intermedia' : 'Relazione Finale';
  return `<h1>${title} - ${escapeHtml(data.discipline)}</h1>
<p><strong>Ordine:</strong> ${escapeHtml(data.order)}</p>
<p><em>Documento generato automaticamente. Completare con i contenuti specifici.</em></p>`;
}

export function generateSpecificoGrado(data: { discipline: string; order: SchoolOrder }): string {
  if (data.order === 'infanzia') {
    return `<h1>Osservazione - ${escapeHtml(data.discipline)}</h1>
<p><em>Documento di osservazione per la Scuola dell'Infanzia.</em></p>`;
  }
  if (data.order === 'primaria') {
    return `<h1>Valutazione Descrittiva - ${escapeHtml(data.discipline)}</h1>
<p><em>Documento di valutazione descrittiva per la Scuola Primaria.</em></p>`;
  }
  return `<h1>Stato di Valutazione - ${escapeHtml(data.discipline)}</h1>
<p><em>Documento di stato di valutazione per la Scuola Secondaria di I Grado.</em></p>`;
}

export function generateUdaDocument(uda: UdaModel, _config: DocumentConfig): string {
  return `<h1>${escapeHtml(uda.title)}</h1>
<p><strong>Disciplina:</strong> ${escapeHtml(uda.discipline)}</p>
<p><strong>Ordine:</strong> ${escapeHtml(uda.order)}</p>
<p><strong>Periodo:</strong> ${escapeHtml(uda.period)}</p>
<p><strong>Ore:</strong> ${uda.hours}</p>
<h2>Traguardi</h2><ul>${uda.traguardi.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
<h2>Obiettivi</h2><ul>${uda.obiettivi.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul>
<h2>Evidenze</h2><ul>${uda.evidenze.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
${uda.realTask ? `<h2>Compito di Realtà</h2><p>${escapeHtml(uda.realTask)}</p>` : ''}
${uda.notes ? `<h2>Note</h2><p>${escapeHtml(uda.notes)}</p>` : ''}`;
}

export function printDocument(html: string): void {
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(`<html><head><title>Documento CurManLight</title></head><body>${html}</body></html>`);
    w.document.close();
    w.print();
  }
}
