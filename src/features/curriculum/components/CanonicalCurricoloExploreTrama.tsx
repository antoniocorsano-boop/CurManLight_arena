import { useMemo, useState } from 'react';
import { BookOpen, Network, SearchCheck, Send } from 'lucide-react';
import type {
  CanonicalCurricoloDomain,
  CanonicalCurricoloReadModel,
  CanonicalCurricoloScope,
} from '../data/canonicalCurricoloReadModel';

export type CurricoloExploreView = 'explore' | 'trama';

export type CurricoloExploreContext = {
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

type CanonicalCurricoloExploreTramaProps = {
  model: CanonicalCurricoloReadModel;
  initialDomainId?: string;
  view: CurricoloExploreView;
  onViewChange: (view: CurricoloExploreView) => void;
  onUseInPlanning?: (context: CurricoloExploreContext) => void;
  onOpenReview?: (context: CurricoloExploreContext) => void;
  canOpenReview?: (context: CurricoloExploreContext) => boolean;
  onOpenSource?: (context: CurricoloExploreContext) => void;
  onOpenDocument?: () => void;
};

const visibleCollections: Array<{
  key: keyof CanonicalCurricoloScope['content'];
  label: string;
}> = [
  { key: 'traguardi', label: 'Traguardi' },
  { key: 'obiettivi', label: 'Obiettivi' },
  { key: 'evidenze', label: 'Evidenze' },
  { key: 'conoscenze', label: 'Conoscenze' },
  { key: 'abilita', label: 'Abilità' },
  { key: 'competenze', label: 'Competenze' },
];

function preferredOrderId(domain: CanonicalCurricoloDomain): CanonicalCurricoloDomain['orders'][number]['id'] {
  return domain.orders.find((order) => order.id === 'secondaria')?.id
    ?? domain.orders[0]?.id
    ?? 'infanzia';
}

function scopeContext(
  domain: CanonicalCurricoloDomain,
  order: CanonicalCurricoloDomain['orders'][number],
  scope: CanonicalCurricoloScope,
  nucleus: string,
): CurricoloExploreContext {
  return {
    disciplineId: domain.id,
    disciplineLabel: domain.label,
    order: order.id,
    annualityId: scope.segmentId,
    annualityTitle: scope.label,
    classLabel: scope.label,
    targetClass: scope.targetClass ?? '',
    nucleus,
    references: [],
  };
}

function ScopeCard({
  domain,
  order,
  scope,
  onOpenTrama,
  onUseInPlanning,
  onOpenReview,
  canOpenReview,
  onOpenSource,
  onOpenDocument,
}: {
  domain: CanonicalCurricoloDomain;
  order: CanonicalCurricoloDomain['orders'][number];
  scope: CanonicalCurricoloScope;
  onOpenTrama: (nucleus: string) => void;
  onUseInPlanning?: (context: CurricoloExploreContext) => void;
  onOpenReview?: (context: CurricoloExploreContext) => void;
  canOpenReview?: (context: CurricoloExploreContext) => boolean;
  onOpenSource?: (context: CurricoloExploreContext) => void;
  onOpenDocument?: () => void;
}) {
  const nuclei = scope.content.nucleiFondanti.length > 0
    ? scope.content.nucleiFondanti
    : ['Contenuti curricolari'];
  const fields = visibleCollections.flatMap(({ key, label }) => {
    const values = scope.content[key];
    if (!Array.isArray(values) || values.length === 0) return [];
    return [{ label, values: values as string[] }];
  });

  return (
    <div className="grid gap-3 xl:grid-cols-2" data-curricolo-node-cards>
      {nuclei.map((nucleus) => {
        const context = scopeContext(domain, order, scope, nucleus);
        const reviewAvailable = Boolean(onOpenReview && (canOpenReview ? canOpenReview(context) : true));
        return (
          <article
            key={`${scope.segmentId}-${nucleus}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            data-curricolo-unit-card
            data-curricolo-card-density="compact-disclosure"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Nucleo</p>
            <h4 className="mt-1 text-base font-black text-slate-950">{nucleus}</h4>
            <dl className="mt-4 space-y-3" data-curricolo-detail-fields="canonical">
              {fields.map((field) => (
                <div key={field.label}>
                  <dt className="text-xs font-bold uppercase tracking-wide text-indigo-700">{field.label}</dt>
                  <dd className="mt-1 text-sm leading-6 text-slate-700">{field.values.join(' · ')}</dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={() => onOpenTrama(nucleus)}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-800"
              data-open-curricolo-trama
            >
              <Network className="h-4 w-4" aria-hidden="true" />
              Vedi nella Trama
            </button>

            <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" data-curricolo-context-actions>
              <summary className="cursor-pointer py-1 text-sm font-bold text-slate-700">Altre azioni</summary>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {onUseInPlanning && scope.targetClass && (
                  <button
                    type="button"
                    onClick={() => onUseInPlanning(context)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                    data-use-curricolo-in-planning
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
                    data-send-curricolo-to-review
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
                    data-open-curricolo-source
                  >
                    Vedi fonte
                  </button>
                )}
                {onOpenDocument && (
                  <button
                    type="button"
                    onClick={onOpenDocument}
                    className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                    data-open-curricolo-document-from-unit
                  >
                    Apri Documento
                  </button>
                )}
              </div>
            </details>
          </article>
        );
      })}
    </div>
  );
}

export function CanonicalCurricoloExploreTrama({
  model,
  initialDomainId,
  view,
  onViewChange,
  onUseInPlanning,
  onOpenReview,
  canOpenReview,
  onOpenSource,
  onOpenDocument,
}: CanonicalCurricoloExploreTramaProps) {
  const preferredDomain = useMemo(
    () => model.domains.find((domain) => domain.id === initialDomainId)
      ?? model.domains.find((domain) => domain.id === 'tecnologia')
      ?? model.domains[0],
    [initialDomainId, model.domains],
  );
  const [domainId, setDomainId] = useState(preferredDomain?.id ?? '');
  const domain = model.domains.find((candidate) => candidate.id === domainId) ?? preferredDomain;
  const [orderId, setOrderId] = useState(domain ? preferredOrderId(domain) : 'infanzia');
  const [scopeId, setScopeId] = useState('');
  const [nucleus, setNucleus] = useState('');

  if (!domain) return null;

  const activeOrder = domain.orders.find((order) => order.id === orderId) ?? domain.orders[0];
  if (!activeOrder) return null;
  const selectedScope = activeOrder.scopes.find((scope) => scope.segmentId === scopeId) ?? activeOrder.scopes[0];
  if (!selectedScope) return null;

  const chooseDomain = (nextDomainId: string) => {
    const next = model.domains.find((candidate) => candidate.id === nextDomainId) ?? model.domains[0];
    setDomainId(nextDomainId);
    setOrderId(next ? preferredOrderId(next) : 'infanzia');
    setScopeId('');
    setNucleus('');
  };

  const chooseOrder = (nextOrderId: CanonicalCurricoloDomain['orders'][number]['id']) => {
    setOrderId(nextOrderId);
    setScopeId('');
    setNucleus('');
  };

  return (
    <section
      className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 to-white p-4 shadow-sm sm:p-6"
      data-curricolo-explore-trama
      data-curricolo-explore-source="canonical-curricolo-v1.3"
      data-curricolo-ux-contract="ARENA_UX_CONTRACT@1.0.0"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Consultazione del curricolo</p>
        <h2 className="mt-1 text-xl font-black text-slate-950">Trova ciò che si applica per disciplina, ordine e annualità</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          La consultazione deriva dall’unica versione di lavoro dell’Istituto. Le relazioni ancora proposte non vengono mostrate come raccordi professionali validati.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Disciplina, campo o asse</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" data-curricolo-discipline-selector>
            {model.domains.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseDomain(item.id)}
                aria-pressed={domain.id === item.id}
                className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-bold ${domain.id === item.id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Ordine di scuola</p>
          <div className="flex flex-wrap gap-2" data-curricolo-order-selector>
            {domain.orders.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseOrder(item.id)}
                aria-pressed={activeOrder.id === item.id}
                className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-bold ${activeOrder.id === item.id ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white text-slate-700'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Annualità o ambito</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" data-curricolo-annuality-selector data-annuality-semantics="consultation-only">
            {activeOrder.scopes.map((scope) => (
              <button
                key={scope.segmentId}
                type="button"
                onClick={() => {
                  setScopeId(scope.segmentId);
                  setNucleus('');
                }}
                aria-pressed={selectedScope.segmentId === scope.segmentId}
                className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-bold ${selectedScope.segmentId === scope.segmentId ? 'border-indigo-600 bg-white text-indigo-800 shadow-sm' : 'border-slate-200 bg-white/70 text-slate-700'}`}
              >
                {scope.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'explore' ? (
        <div className="mt-7" data-curricolo-focused-explorer>
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">{domain.label}</p>
            <h3 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">{activeOrder.label} · {selectedScope.label}</h3>
          </div>
          <ScopeCard
            domain={domain}
            order={activeOrder}
            scope={selectedScope}
            onOpenTrama={(nextNucleus) => {
              setNucleus(nextNucleus);
              onViewChange('trama');
            }}
            onUseInPlanning={onUseInPlanning}
            onOpenReview={onOpenReview}
            canOpenReview={canOpenReview}
            onOpenSource={onOpenSource}
            onOpenDocument={onOpenDocument}
          />
        </div>
      ) : (
        <div className="mt-7" data-curricolo-trama-view>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Trama del curricolo</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">Raccordi professionali verificati</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  In questa versione i raccordi presenti nell’artefatto hanno stato proposto. Per evitare inferenze o promozioni implicite, non vengono rappresentati come relazioni validate.
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
            {nucleus && <p className="mt-4 text-sm font-semibold text-slate-700">Nucleo selezionato: {nucleus}</p>}
          </div>

          <div
            className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950"
            data-curricolo-trama-no-inferred-edge
            data-relation-policy="canonical-validated-only"
          >
            Nessun raccordo professionale validato è disponibile in questa versione. Nessuna relazione viene inferita dalla coincidenza del testo e nessun link proposto viene presentato come validato.
          </div>
        </div>
      )}
    </section>
  );
}
