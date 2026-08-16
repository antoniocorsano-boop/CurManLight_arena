import type { UdaModel } from '../../../types/curriculum';
import { escapeHtml } from '../../../lib/escapeHtml';
import { printCanonicalDocument, type PrintResult } from './canonicalDocumentPrint';

const nonEmpty = (values?: string[]) => (values ?? []).map(value => value.trim()).filter(Boolean);

const section = (title: string, values: string[]) => {
  if (values.length === 0) return '';
  return `<section><h2>${escapeHtml(title)}</h2><ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul></section>`;
};

const normalizedTitle = (title: string) => {
  const safe = title.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return safe || 'senza-titolo';
};

export function renderUdaDocumentHtml(uda: UdaModel): string {
  const references = (uda.curriculumReferences ?? []).map(reference =>
    `${reference.snapshot} (${reference.curriculumVersionRef.id})`,
  );
  const provenance = uda.sourcePlanningRef?.id ? [String(uda.sourcePlanningRef.id)] : [];
  return `<article class="uda-document">
    <header><p class="eyebrow">UNITÀ DI APPRENDIMENTO</p><h1>${escapeHtml(uda.title.trim())}</h1>
      <p class="meta">${escapeHtml(uda.discipline)} · ${escapeHtml(uda.order)} · ${escapeHtml(uda.period)} · ${uda.hours} ore</p>
    </header>
    ${section('Riferimenti curricolari', references)}
    ${section('Traguardi', nonEmpty(uda.traguardi))}
    ${section('Obiettivi', nonEmpty(uda.obiettivi))}
    ${section('Attività', nonEmpty(uda.activities))}
    ${section('Evidenze', nonEmpty(uda.evidenze))}
    ${section('Compito autentico', nonEmpty([uda.realTask]))}
    ${section('Valutazione', nonEmpty(uda.assessment))}
    ${section('Materiali', nonEmpty(uda.materials))}
    ${section('Note', nonEmpty([uda.notes]))}
    ${section('Provenienza', provenance)}
  </article>`;
}

export function printUdaDocument(uda: UdaModel, targetWindow?: Window | null): PrintResult {
  if (!uda?.id || !uda.title.trim()) {
    return { success: false, error: 'render-failed', message: 'Impossibile esportare una UDA senza identità o titolo.' };
  }
  try {
    return printCanonicalDocument(renderUdaDocumentHtml(uda), {
      title: `UDA-${normalizedTitle(uda.title)}`,
      targetWindow,
    });
  } catch {
    return { success: false, error: 'render-failed', message: 'Impossibile generare il documento di stampa.' };
  }
}
