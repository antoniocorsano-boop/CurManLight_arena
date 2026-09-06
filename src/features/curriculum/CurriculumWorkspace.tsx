import { useState } from 'react';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from '../../domain/curriculum/institute/currentSource';
import { CurriculumTab as CurriculumTabBase, type CurriculumTabProps } from './components/CurriculumTab';
import { FinalPublicationSourceReviewWorkbench } from './components/FinalPublicationSourceReviewWorkbench';

const CANONICAL_MASTER_URL = `https://docs.google.com/document/d/${INSTITUTE_CURRICULUM_CURRENT_SOURCE.driveFileId}/edit`;

export function CurriculumWorkspace(props: CurriculumTabProps) {
  const { activeCurricoloView, setActiveCurricoloView } = useCurriculumStore();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [legacyOpen, setLegacyOpen] = useState(false);
  const showingLegacyWorkspace = legacyOpen || activeCurricoloView !== 'home';

  const returnToMaster = () => {
    setActiveCurricoloView('home');
    setLegacyOpen(false);
  };

  return (
    <div className="space-y-4" data-teacher-surface="curriculum-workspace">
      {!showingLegacyWorkspace && (
        <section
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          data-canonical-curriculum-entry
          data-hcm-level="1"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-700">Curricolo verticale d’Istituto</span>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">Curricolo verticale integrale 3–14</h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                Baseline corrente
              </span>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-700">
              Un unico curricolo raccoglie il percorso dalla scuola dell’infanzia alla classe terza della scuola secondaria di primo grado. Le annualità sono materializzate; la validazione professionale resta aperta.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3" aria-label="Copertura del curricolo">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Scuola dell’infanzia</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">3 · 4 · 5 anni</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Scuola primaria</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">Classi I · II · III · IV · V</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Secondaria di primo grado</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">Classi I · II · III</p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm leading-6 text-amber-950">
            <strong>Stato:</strong> baseline curricolare completa da validare professionalmente. Non è ancora il curricolo vigente dell’Istituto.
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <a
              href={CANONICAL_MASTER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
              data-open-canonical-curriculum
            >
              Apri il curricolo integrale
            </a>
            <button
              type="button"
              onClick={() => setReviewOpen((open) => !open)}
              aria-expanded={reviewOpen}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:border-indigo-300"
            >
              {reviewOpen ? 'Chiudi verifica delle fonti' : 'Verifica le fonti'}
            </button>
          </div>

          {reviewOpen && (
            <div className="border-t border-slate-200 pt-4" data-canonical-source-review>
              <FinalPublicationSourceReviewWorkbench />
            </div>
          )}
        </section>
      )}

      {!showingLegacyWorkspace && (
        <details
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
          data-hcm-level="3"
          data-legacy-curriculum-disclosure
        >
          <summary className="cursor-pointer text-sm font-bold text-slate-700">Archivio locale precedente</summary>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            <p>
              La precedente copia locale di CurManLight è conservata per continuità tecnica e consultazione storica. Non coincide con il master curricolare corrente e non ne attesta completezza, validazione o vigenza.
            </p>
            <button
              type="button"
              onClick={() => setLegacyOpen(true)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-300"
            >
              Consulta l’archivio locale precedente
            </button>
          </div>
        </details>
      )}

      {showingLegacyWorkspace && (
        <section className="space-y-4" data-legacy-curriculum-workspace>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Archivio locale precedente</p>
                <p className="mt-1 text-sm leading-6 text-amber-950">
                  Stai consultando la copia locale legacy, non il master curricolare corrente.
                </p>
              </div>
              <button
                type="button"
                onClick={returnToMaster}
                className="min-h-11 shrink-0 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200"
              >
                Torna al curricolo corrente
              </button>
            </div>
          </div>

          <CurriculumTabBase {...props} />
        </section>
      )}
    </div>
  );
}
