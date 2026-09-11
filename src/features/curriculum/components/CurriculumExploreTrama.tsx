import { useMemo, useState } from 'react';
import { ArrowDown, BookOpen, FileText, Network, SearchCheck, Send } from 'lucide-react';
import type { DepartmentCurriculumSection } from './DepartmentCurriculumPublication';

export type CurriculumExploreView = 'explore' | 'trama';

type CurriculumField = {
  label: string;
  value: string;
};

export type CurriculumNodeProjection = {
  nucleus: string;
  fields: CurriculumField[];
};

export type CurriculumAnnualityProjection = {
  id: string;
  title: string;
  order: string;
  classLabel: string;
  references: string[];
  rows: CurriculumNodeProjection[];
};

export type CurriculumDisciplineProjection = {
  id: string;
  label: string;
  sectionId: string;
  annualities: CurriculumAnnualityProjection[];
};

export type CurriculumExploreContext = {
  disciplineId: string;
  disciplineLabel: string;
  order: string;
  annualityId: string;
  annualityTitle: string;
  classLabel: string;
  targetClass: string;
  nucleus: string;
  references: string[];
};

const ANNUALITY_HEADING = /^(Infanzia|Primaria|Secondaria)\s+—\s+(.+)$/i;

function normalizeKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function disciplineLabelFromSection(section: DepartmentCurriculumSection) {
  return section.title
    .replace(/^\d+\.?\s*/, '')
    .replace(/\s+—\s+curricolo verticale.*$/i, '')
    .trim();
}

function humanClassLabel(value: string) {
  return value.replace(/^classe\s+/i, 'Classe ');
}

function targetClassFromAnnuality(annuality: CurriculumAnnualityProjection): string {
  const value = annuality.classLabel.toUpperCase();
  const romanMatch = value.match(/\b(V|IV|III|II|I)\b/);
  if (romanMatch) {
    return ({ I: '1', II: '2', III: '3', IV: '4', V: '5' } as Record<string, string>)[romanMatch[1]] ?? '';
  }
  const numericMatch = value.match(/\b([1-5])\b/);
  return numericMatch?.[1] ?? '';
}

export function buildDisciplineProjection(section: DepartmentCurriculumSection): CurriculumAnnualityProjection[] {
  const annualities: CurriculumAnnualityProjection[] = [];
  let current: CurriculumAnnualityProjection | null = null;

  const pushCurrent = () => {
    if (!current) return;
    annualities.push(current);
    current = null;
  };

  section.blocks.forEach((block) => {
    if (block.type === 'heading2' && block.text) {
      const match = block.text.match(ANNUALITY_HEADING);
      if (match) {
        pushCurrent();
        const order = match[1];
        const classLabel = match[2];
        current = {
          id: normalizeKey(`${section.id}-${order}-${classLabel}`),
          title: block.text,
          order,
          classLabel,
          references: [],
          rows: [],
        };
        return;
      }

      if (current) pushCurrent();
      return;
    }

    if (!current) return;

    if (block.type === 'paragraph' && block.text) {
      current.references.push(block.text);
      return;
    }

    if (block.type === 'table' && block.rows && block.rows.length > 1) {
      const [headers, ...rows] = block.rows;
      rows.forEach((row) => {
        if (!row[0]) return;
        current?.rows.push({
          nucleus: row[0],
          fields: headers.slice(1).map((label, index) => ({
            label,
            value: row[index + 1] ?? '',
          })),
        });
      });
    }
  });

  pushCurrent();
  return annualities;
}

export function buildCurriculumCatalog(sections: DepartmentCurriculumSection[]): CurriculumDisciplineProjection[] {
  return sections.flatMap((section) => {
    const annualities = buildDisciplineProjection(section);
    if (annualities.length === 0) return [];
    return [{
      id: normalizeKey(section.id || disciplineLabelFromSection(section)),
      label: disciplineLabelFromSection(section),
      sectionId: section.id,
      annualities,
    }];
  });
}

type CurriculumExploreTramaProps = {
  sections: DepartmentCurriculumSection[];
  view: CurriculumExploreView;
  onViewChange: (view: CurriculumExploreView) => void;
  onUseInPlanning?: (context: CurriculumExploreContext) => void;
  onOpenReview?: (context: CurriculumExploreContext) => void;
  canOpenReview?: (context: CurriculumExploreContext) => boolean;
  onOpenSource?: (context: CurriculumExploreContext) => void;
  onOpenDocument?: () => void;
};

export function CurriculumExploreTrama({
  sections,
  view,
  onViewChange,
  onUseInPlanning,
  onOpenReview,
  canOpenReview,
  onOpenSource,
  onOpenDocument,
}: CurriculumExploreTramaProps) {
  const catalog = useMemo(() => buildCurriculumCatalog(sections), [sections]);
  const preferredEntry = catalog.find((item) => normalizeKey(item.label) === 'tecnologia') ?? catalog[0];
  const [disciplineId, setDisciplineId] = useState('');
  const [order, setOrder] = useState('Secondaria');
  const [annualityId, setAnnualityId] = useState('');
  const [nucleus, setNucleus] = useState('');

  const discipline = catalog.find((item) => item.id === disciplineId) ?? preferredEntry;
  if (!discipline) return null;

  const orders = Array.from(new Set(discipline.annualities.map((item) => item.order)));
  const activeOrder = orders.includes(order) ? order : orders[0] ?? '';
  const annualitiesForOrder = discipline.annualities.filter((item) => item.order === activeOrder);
  const selectedAnnuality = annualitiesForOrder.find((item) => item.id === annualityId)
    ?? annualitiesForOrder[0]
    ?? discipline.annualities[0];

  if (!selectedAnnuality) return null;

  const selectedNucleus = selectedAnnuality.rows.find((row) => row.nucleus === nucleus)?.nucleus
    ?? selectedAnnuality.rows[0]?.nucleus
    ?? '';

  const makeContext = (nextNucleus: string): CurriculumExploreContext => ({
    disciplineId: normalizeKey(discipline.label),
    disciplineLabel: discipline.label,
    order: selectedAnnuality.order,
    annualityId: selectedAnnuality.id,
    annualityTitle: selectedAnnuality.title,
    classLabel: selectedAnnuality.classLabel,
    targetClass: targetClassFromAnnuality(selectedAnnuality),
    nucleus: nextNucleus,
    references: selectedAnnuality.references,
  });

  const relationOccurrences = useMemo(() => {
    if (!selectedNucleus) return [];
    return discipline.annualities.flatMap((annuality) => annuality.rows
      .filter((row) => row.nucleus === selectedNucleus)
      .map((row) => ({ annuality, row })));
  }, [discipline.annualities, selectedNucleus]);

  const chooseDiscipline = (nextId: string) => {
    const next = catalog.find((item) => item.id === nextId) ?? catalog[0];
    const nextOrders = Array.from(new Set(next?.annualities.map((item) => item.order) ?? []));
    const nextOrder = nextOrders.includes('Secondaria') ? 'Secondaria' : nextOrders[0] ?? '';
    setDisciplineId(nextId);
    setOrder(nextOrder);
    setAnnualityId('');
    setNucleus('');
  };

  const chooseOrder = (nextOrder: string) => {
    setOrder(nextOrder);
    setAnnualityId('');
    setNucleus('');
  };

  const chooseAnnuality = (nextAnnualityId: string) => {
    setAnnualityId(nextAnnualityId);
    setNucleus('');
  };

  return (
    <section
      className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 to-white p-4 shadow-sm sm:p-6"
      data-curriculum-explore-trama
      data-curriculum-explore-source="department-v3.1"
      data-curriculum-ux-contract="ARENA_UX_CONTRACT@1.0.0"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Consultazione del curricolo</p>
        <h2 className="mt-1 text-xl font-black text-slate-950">Trova ciò che si applica senza percorrere il documento in sequenza</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Scegli disciplina, ordine e annualità. Esplora e Trama sono due letture dello stesso curricolo d’Istituto.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Disciplina o campo</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-curriculum-discipline-selector>
            {catalog.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseDiscipline(item.id)}
                aria-pressed={discipline.id === item.id}
                className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-bold ${discipline.id === item.id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Ordine di scuola</p>
          <div className="flex flex-wrap gap-2" data-curriculum-order-selector>
            {orders.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => chooseOrder(item)}
                aria-pressed={activeOrder === item}
                className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-bold ${activeOrder === item ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white text-slate-700'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Annualità</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" data-curriculum-annuality-selector data-annuality-semantics="consultation-only">
            {annualitiesForOrder.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseAnnuality(item.id)}
                aria-pressed={selectedAnnuality.id === item.id}
                className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-bold ${selectedAnnuality.id === item.id ? 'border-indigo-600 bg-white text-indigo-800 shadow-sm' : 'border-slate-200 bg-white/70 text-slate-700'}`}
              >
                {humanClassLabel(item.classLabel)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'explore' ? (
        <div className="mt-7" data-curriculum-focused-explorer>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">{discipline.label}</p>
            <h3 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">{selectedAnnuality.title}</h3>
            {selectedAnnuality.references.map((reference, index) => (
              <p key={`${selectedAnnuality.id}-reference-${index}`} className="mt-2 text-sm leading-6 text-slate-600">{reference}</p>
            ))}
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2" data-curriculum-node-cards>
            {selectedAnnuality.rows.map((row) => {
              const context = makeContext(row.nucleus);
              const reviewAvailable = Boolean(onOpenReview && (canOpenReview ? canOpenReview(context) : true));
              return (
                <article key={`${selectedAnnuality.id}-${row.nucleus}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" data-curriculum-unit-card>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Nucleo</p>
                  <h4 className="mt-1 text-base font-black text-slate-950">{row.nucleus}</h4>
                  <dl className="mt-4 space-y-3">
                    {row.fields.map((field) => (
                      <div key={`${row.nucleus}-${field.label}`}>
                        <dt className="text-xs font-bold uppercase tracking-wide text-indigo-700">{field.label}</dt>
                        <dd className="mt-1 text-sm leading-6 text-slate-700">{field.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    onClick={() => {
                      setNucleus(row.nucleus);
                      onViewChange('trama');
                    }}
                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-800"
                    data-open-curriculum-trama
                  >
                    <Network className="h-4 w-4" aria-hidden="true" />
                    Vedi nella Trama
                  </button>

                  <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" data-curriculum-context-actions>
                    <summary className="cursor-pointer py-1 text-sm font-bold text-slate-700">Altre azioni</summary>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {onUseInPlanning && (
                        <button
                          type="button"
                          onClick={() => onUseInPlanning(context)}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                          data-use-curriculum-in-planning
                        >
                          <Send className="h-4 w-4" aria-hidden="true" />
                          Usa in Progettazione
                        </button>
                      )}
                      {reviewAvailable ? (
                        <button
                          type="button"
                          onClick={() => onOpenReview?.(context)}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                          data-send-curriculum-to-review
                        >
                          <SearchCheck className="h-4 w-4" aria-hidden="true" />
                          Segnala per il Riesame
                        </button>
                      ) : onOpenReview ? (
                        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-500" data-review-unavailable-for-context>
                          Il Riesame non è ancora disponibile per questo contesto. La consultazione resta comunque completa.
                        </p>
                      ) : null}
                      {onOpenSource && (
                        <button
                          type="button"
                          onClick={() => onOpenSource(context)}
                          className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                          data-open-curriculum-source
                        >
                          Vedi fonte
                        </button>
                      )}
                      {onOpenDocument && (
                        <button
                          type="button"
                          onClick={onOpenDocument}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                          data-open-curriculum-document-from-unit
                        >
                          <FileText className="h-4 w-4" aria-hidden="true" />
                          Apri Documento
                        </button>
                      )}
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-7" data-curriculum-trama-view>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Trama del curricolo</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">Segui un nucleo nelle annualità</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sono mostrate soltanto relazioni presenti e verificabili. Se il raccordo non è disponibile, Trama non lo inventa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onViewChange('explore')}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Torna a Esplora
              </button>
            </div>

            <label htmlFor="curriculum-trama-nucleus" className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-500">Nucleo di partenza</label>
            <select
              id="curriculum-trama-nucleus"
              value={selectedNucleus}
              onChange={(event) => setNucleus(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
              data-curriculum-trama-nucleus-selector
            >
              {selectedAnnuality.rows.map((row) => (
                <option key={`${selectedAnnuality.id}-${row.nucleus}`} value={row.nucleus}>{row.nucleus}</option>
              ))}
            </select>
          </div>

          <div className="mx-auto mt-5 max-w-2xl" data-curriculum-trama-graph data-relation-policy="same-nucleus-exact-only">
            {relationOccurrences.map(({ annuality, row }, index) => {
              const outcome = row.fields.find((field) => field.label.toLowerCase().includes('esito annuale'))?.value ?? row.fields[0]?.value ?? '';
              return (
                <div key={`${annuality.id}-${row.nucleus}`} className="flex flex-col items-center">
                  <article className="w-full rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm sm:p-5" data-curriculum-trama-node>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">{annuality.title}</p>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">stesso nucleo</span>
                    </div>
                    <h4 className="mt-2 text-base font-black text-slate-950">{row.nucleus}</h4>
                    {outcome && <p className="mt-2 text-sm leading-6 text-slate-700">{outcome}</p>}
                  </article>
                  {index < relationOccurrences.length - 1 && (
                    <div className="flex min-h-12 flex-col items-center justify-center text-indigo-500" aria-hidden="true">
                      <span className="h-4 w-px bg-indigo-200" />
                      <ArrowDown className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {relationOccurrences.length < 2 && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950" data-curriculum-trama-no-inferred-edge>
              Per questo nucleo non risultano altre occorrenze con denominazione identica. Nessun raccordo presunto viene aggiunto.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
