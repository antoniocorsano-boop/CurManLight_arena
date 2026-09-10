import { useMemo, useState } from 'react';
import { ArrowDown, BookOpen, Network } from 'lucide-react';
import type { DepartmentCurriculumSection } from './DepartmentCurriculumPublication';

type ExploreView = 'explore' | 'trama';

type DisciplineOption = {
  id: 'matematica' | 'scienze' | 'tecnologia' | 'informatica';
  label: string;
  sectionNumber: number;
};

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

const DISCIPLINES: DisciplineOption[] = [
  { id: 'matematica', label: 'Matematica', sectionNumber: 7 },
  { id: 'scienze', label: 'Scienze', sectionNumber: 8 },
  { id: 'tecnologia', label: 'Tecnologia', sectionNumber: 9 },
  { id: 'informatica', label: 'Informatica', sectionNumber: 10 },
];

const ANNUALITY_HEADING = /^(Infanzia|Primaria|Secondaria)\s+—\s+(.+)$/i;

function normalizeKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function humanClassLabel(value: string) {
  return value.replace(/^classe\s+/i, 'Classe ');
}

function secondaryClassId(annuality: CurriculumAnnualityProjection): '1' | '2' | '3' | null {
  if (annuality.order.toLowerCase() !== 'secondaria') return null;
  const normalized = annuality.classLabel.toUpperCase();
  if (/\bIII\b/.test(normalized)) return '3';
  if (/\bII\b/.test(normalized)) return '2';
  if (/\bI\b/.test(normalized)) return '1';
  return null;
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

type CurriculumExploreTramaProps = {
  sections: DepartmentCurriculumSection[];
  targetClass: string;
  onOpenTechnologyReview: (targetClass: '1' | '2' | '3') => void;
};

export function CurriculumExploreTrama({
  sections,
  targetClass,
  onOpenTechnologyReview,
}: CurriculumExploreTramaProps) {
  const [view, setView] = useState<ExploreView>('explore');
  const [disciplineId, setDisciplineId] = useState<DisciplineOption['id']>('tecnologia');
  const [order, setOrder] = useState('Secondaria');
  const [annualityId, setAnnualityId] = useState('');
  const [nucleus, setNucleus] = useState('');

  const discipline = DISCIPLINES.find((item) => item.id === disciplineId) ?? DISCIPLINES[2];
  const section = sections.find((item) => item.number === discipline.sectionNumber) ?? sections[0];
  const annualities = useMemo(() => buildDisciplineProjection(section), [section]);
  const orders = useMemo(() => Array.from(new Set(annualities.map((item) => item.order))), [annualities]);

  const activeOrder = orders.includes(order) ? order : orders[0] ?? '';
  const annualitiesForOrder = annualities.filter((item) => item.order === activeOrder);
  const targetRoman = targetClass === '3' ? 'III' : targetClass === '2' ? 'II' : 'I';
  const preferredTechnologyAnnuality = disciplineId === 'tecnologia' && activeOrder === 'Secondaria'
    ? annualitiesForOrder.find((item) => item.classLabel.toUpperCase().includes(targetRoman))
    : undefined;
  const selectedAnnuality = annualitiesForOrder.find((item) => item.id === annualityId)
    ?? preferredTechnologyAnnuality
    ?? annualitiesForOrder[0]
    ?? annualities[0];

  const selectedNucleus = selectedAnnuality?.rows.find((row) => row.nucleus === nucleus)?.nucleus
    ?? selectedAnnuality?.rows[0]?.nucleus
    ?? '';

  const relationOccurrences = useMemo(() => {
    if (!selectedNucleus) return [];
    return annualities.flatMap((annuality) => annuality.rows
      .filter((row) => row.nucleus === selectedNucleus)
      .map((row) => ({ annuality, row })));
  }, [annualities, selectedNucleus]);

  const chooseDiscipline = (next: DisciplineOption['id']) => {
    const nextDiscipline = DISCIPLINES.find((item) => item.id === next) ?? DISCIPLINES[0];
    const nextSection = sections.find((item) => item.number === nextDiscipline.sectionNumber) ?? sections[0];
    const nextAnnualities = buildDisciplineProjection(nextSection);
    const nextOrder = nextAnnualities.some((item) => item.order === 'Secondaria')
      ? 'Secondaria'
      : nextAnnualities[0]?.order ?? '';
    setDisciplineId(next);
    setOrder(nextOrder);
    setAnnualityId('');
    setNucleus('');
  };

  const chooseOrder = (nextOrder: string) => {
    setOrder(nextOrder);
    setAnnualityId(annualities.find((item) => item.order === nextOrder)?.id ?? '');
    setNucleus('');
  };

  const chooseAnnuality = (nextAnnualityId: string) => {
    setAnnualityId(nextAnnualityId);
    setNucleus('');
  };

  if (!selectedAnnuality) return null;

  const reviewClassId = disciplineId === 'tecnologia' ? secondaryClassId(selectedAnnuality) : null;

  return (
    <section
      className="mb-8 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 to-white p-4 shadow-sm sm:p-6"
      data-curriculum-explore-trama
      data-curriculum-explore-source="department-v3.1"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Consultazione docente</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Entra nel curricolo senza leggere il fascicolo in sequenza</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Scegli disciplina, ordine e annualità. I contenuti restano quelli del fascicolo v3.1; cambia soltanto la modalità di lettura.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200" aria-label="Vista di consultazione">
          <button
            type="button"
            onClick={() => setView('explore')}
            aria-pressed={view === 'explore'}
            data-curriculum-explore-view="explore"
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${view === 'explore' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Esplora
          </button>
          <button
            type="button"
            onClick={() => setView('trama')}
            aria-pressed={view === 'trama'}
            data-curriculum-explore-view="trama"
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${view === 'trama' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
          >
            <Network className="h-4 w-4" aria-hidden="true" />
            Trama
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Disciplina</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-curriculum-discipline-selector>
            {DISCIPLINES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseDiscipline(item.id)}
                aria-pressed={disciplineId === item.id}
                className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-bold ${disciplineId === item.id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" data-curriculum-annuality-selector>
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
            {selectedAnnuality.rows.map((row) => (
              <article key={`${selectedAnnuality.id}-${row.nucleus}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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
                    setView('trama');
                  }}
                  className="mt-4 min-h-11 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-800"
                  data-open-curriculum-trama
                >
                  Vedi nella Trama
                </button>
              </article>
            ))}
          </div>

          {reviewClassId && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4" data-curriculum-explore-review-handoff>
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Dal curricolo al lavoro del docente</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Il Riesame resta separato dalla consultazione e richiede un'azione intenzionale.</p>
              {reviewClassId === '3' ? (
                <p className="mt-3 text-sm font-semibold text-slate-500">Classe III: il Riesame non è ancora disponibile.</p>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenTechnologyReview(reviewClassId)}
                  className="mt-3 min-h-11 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white"
                  data-open-focused-technology-review={reviewClassId}
                >
                  Apri il Riesame di {selectedAnnuality.title}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-7" data-curriculum-trama-view>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Trama del curricolo</p>
            <h3 className="mt-1 text-lg font-black text-slate-950">Segui un nucleo nelle annualità</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Vengono mostrate soltanto occorrenze con la stessa denominazione del nucleo nel fascicolo. Nessun collegamento viene inferito o inventato.
            </p>

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
              Per questo nucleo non risultano altre occorrenze con denominazione identica. La Trama non crea un raccordo semantico presunto.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
