import { useState } from 'react';
import { ArrowLeft, BookOpen, FileText, Network } from 'lucide-react';
import type { A07InstitutionalDocumentRead, InstitutionalConfigurationSummary } from '../../../domain/institution';
import {
  type CurriculumExploreContext,
  type CurriculumExploreView,
} from './CurriculumExploreTrama';
import { CanonicalCurricoloExploreTrama } from './CanonicalCurricoloExploreTrama';
import artifact from '../data/canonicalCurricoloV13.generated.json';
import {
  loadCanonicalCurricoloReadModel,
  type CanonicalCurricoloScope,
} from '../data/canonicalCurricoloReadModel';

const CANONICAL_READ_RESULT = loadCanonicalCurricoloReadModel(artifact);

type CurriculumPresentationMode = CurriculumExploreView | 'document' | 'catalog';

type ProfessionalCurriculumReaderProps = {
  institutionalProfile: A07InstitutionalDocumentRead;
  institutionalConfiguration?: InstitutionalConfigurationSummary;
  onUseInPlanning: (context: CurriculumExploreContext) => void;
  onOpenReview: (context: CurriculumExploreContext) => void;
  canOpenReview: (context: CurriculumExploreContext) => boolean;
  onOpenSource: (context: CurriculumExploreContext) => void;
};

type CanonicalDocumentField = {
  label: string;
  values: string[];
};

function canonicalDocumentFields(scope: CanonicalCurricoloScope): CanonicalDocumentField[] {
  const fields: CanonicalDocumentField[] = [
    { label: 'Nuclei fondanti', values: scope.content.nucleiFondanti },
    { label: 'Traguardi', values: scope.content.traguardi },
    { label: 'Obiettivi', values: scope.content.obiettivi },
    { label: 'Conoscenze', values: scope.content.conoscenze },
    { label: 'Abilità', values: scope.content.abilita },
    { label: 'Competenze', values: scope.content.competenze },
    { label: 'Evidenze', values: scope.content.evidenze },
  ];
  return fields.filter((field) => field.values.length > 0);
}

function CanonicalScopeDocumentContent({ scope }: { scope: CanonicalCurricoloScope }) {
  const fields = canonicalDocumentFields(scope);
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2" data-curricolo-document-content>
      {fields.map((field) => (
        <section key={field.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h6 className="text-xs font-black uppercase tracking-wide text-slate-600">{field.label}</h6>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
            {field.values.map((value, index) => (
              <li key={`${field.label}-${index}`} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function ProfessionalCurriculumReader({
  institutionalProfile,
  institutionalConfiguration,
  onUseInPlanning,
  onOpenReview,
  canOpenReview,
  onOpenSource,
}: ProfessionalCurriculumReaderProps) {
  const [mode, setMode] = useState<CurriculumPresentationMode>('catalog');
  const [selectedDomainId, setSelectedDomainId] = useState<string | undefined>(undefined);
  const effectiveConfiguration = institutionalConfiguration ?? {
    phase: institutionalProfile.configured ? 'ACTIVE' : 'UNCONFIGURED',
    instituteDefined: institutionalProfile.configured,
    instituteName: institutionalProfile.instituteName,
    configuredOrders: [],
    academicYearLabel: institutionalProfile.academicYearLabel,
    academicYearCount: institutionalProfile.academicYearLabel ? 1 : 0,
    contextActive: institutionalProfile.configured,
  } satisfies InstitutionalConfigurationSummary;
  const contextActive = effectiveConfiguration.phase === 'ACTIVE';
  const localContextLabel = contextActive
    ? institutionalProfile.instituteName
    : effectiveConfiguration.instituteDefined
      ? effectiveConfiguration.instituteName
      : 'Curricolo d’Istituto';

  if (!CANONICAL_READ_RESULT.ok) {
    return (
      <section
        className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm sm:p-7"
        data-canonical-curriculum-entry
        data-curriculum-primary-task="consultation"
        data-curriculum-presentation="professional-publication"
        data-curriculum-ux-contract="ARENA_UX_CONTRACT@1.0.0"
        data-curriculum-read-state="fail-closed"
        data-hcm-level="1"
      >
        <h1 className="text-xl font-black text-rose-950">Curricolo d’Istituto non verificabile</h1>
        <p className="mt-2 text-sm leading-6 text-rose-900">
          La consultazione è stata interrotta perché l’artefatto locale non supera i controlli di integrità e copertura. Nessun fascicolo precedente viene usato come sostituto.
        </p>
      </section>
    );
  }

  const model = CANONICAL_READ_RESULT.value;
  const openDomain = (domainId: string) => {
    setSelectedDomainId(domainId);
    setMode('explore');
  };
  const returnToCatalog = () => {
    setSelectedDomainId(undefined);
    setMode('catalog');
  };
  const setExploreView = (view: CurriculumExploreView) => setMode(view);

  if (mode === 'catalog') {
    return (
      <section
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        data-canonical-curriculum-entry
        data-curriculum-primary-task="scope-selection"
        data-curriculum-presentation="professional-publication"
        data-curriculum-ux-contract="ARENA_UX_CONTRACT@1.0.0"
        data-curriculum-read-state="verified-local-artifact"
        data-hcm-level="1"
      >
        <header className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-5 py-7 sm:px-8 sm:py-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{localContextLabel}</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">{model.identity.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Seleziona una disciplina, un campo di esperienza o un asse. La consultazione mantiene ordine di scuola, annualità e contenuti così come sono presenti nella versione di lavoro dell’Istituto.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-800">Versione di lavoro · {model.identity.masterVersion}</span>
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-900">Validazione professionale aperta</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">{model.identity.vigencyLabel}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">A.S. {model.identity.schoolYearRef}</span>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-curriculum-domain-catalog>
            {model.domains.map((domain) => (
              <button
                key={domain.id}
                type="button"
                onClick={() => openDomain(domain.id)}
                className="min-h-14 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-black text-slate-900 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/30"
                data-open-curriculum-discipline={domain.id}
              >
                {domain.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      data-canonical-curriculum-entry
      data-curriculum-primary-task="consultation"
      data-curriculum-presentation="professional-publication"
      data-curriculum-publication-parity="source-snapshot"
      data-curriculum-ux-contract="ARENA_UX_CONTRACT@1.0.0"
      data-hcm-level="1"
    >
      <header className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-5 py-7 sm:px-8 sm:py-10">
        <button
          type="button"
          onClick={returnToCatalog}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"
          data-return-to-curriculum-catalog
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Torna al catalogo
        </button>
        <div className="mt-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{localContextLabel}</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">{model.identity.title}</h1>
          <p className="mt-2 text-sm font-bold text-indigo-700 sm:text-base">Versione di lavoro · {model.identity.masterVersion}</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">A.S. {model.identity.schoolYearRef}</span>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-900">Validazione professionale aperta</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">{model.identity.vigencyLabel}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">Percorso verticale 3–14</span>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6" aria-label="Modalità di consultazione del curricolo">
        <div className="mx-auto grid max-w-xl grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" data-curriculum-mode-switch>
          <button
            type="button"
            onClick={() => setMode('explore')}
            aria-pressed={mode === 'explore'}
            data-curriculum-mode="explore"
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-bold transition ${mode === 'explore' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Esplora
          </button>
          <button
            type="button"
            onClick={() => setMode('trama')}
            aria-pressed={mode === 'trama'}
            data-curriculum-mode="trama"
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-bold transition ${mode === 'trama' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
          >
            <Network className="h-4 w-4" aria-hidden="true" />
            Trama
          </button>
          <button
            type="button"
            onClick={() => setMode('document')}
            aria-pressed={mode === 'document'}
            data-curriculum-mode="document"
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-bold transition ${mode === 'document' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Documento
          </button>
        </div>
      </div>

      {mode !== 'document' ? (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8" data-curriculum-professional-explorer>
          <CanonicalCurricoloExploreTrama
            key={selectedDomainId ?? 'canonical-entry'}
            model={model}
            initialDomainId={selectedDomainId}
            view={mode}
            onViewChange={setExploreView}
            onUseInPlanning={onUseInPlanning}
            onOpenReview={onOpenReview}
            canOpenReview={canOpenReview}
            onOpenSource={onOpenSource}
            onOpenDocument={() => setMode('document')}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-6xl space-y-6 px-5 py-6 sm:px-8 sm:py-8" data-curricolo-document-reader>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Documento del curricolo</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">{model.identity.title} · versione {model.identity.masterVersion}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Questa proiezione sequenziale legge la stessa versione strutturata usata da Esplora e Trama. Ordini di scuola, annualità e contenuti restano quelli della versione di lavoro sottoposta a validazione professionale.
            </p>
          </div>

          <div className="space-y-8">
            {model.domains.map((domain) => (
              <section
                key={domain.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                data-curricolo-document-domain={domain.id}
              >
                <h3 className="text-xl font-black text-slate-950 sm:text-2xl">{domain.label}</h3>
                <div className="mt-5 space-y-6">
                  {domain.orders.map((order) => (
                    <section key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                      <h4 className="text-base font-black text-slate-900">{order.label}</h4>
                      <div className="mt-4 space-y-4">
                        {order.scopes.map((scope) => (
                          <article
                            key={scope.segmentId}
                            className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
                            data-curricolo-document-scope={scope.segmentId}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h5 className="text-sm font-black text-slate-950">{scope.label}</h5>
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900">In revisione</span>
                            </div>
                            <CanonicalScopeDocumentContent scope={scope} />
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
