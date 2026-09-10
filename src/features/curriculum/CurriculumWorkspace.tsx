import { useState } from 'react';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from '../../domain/curriculum/institute/currentSource';
import type { AppViewsLayerProps } from '../session/types/appViewContracts';
import { CurriculumTab as CurriculumTabBase, type CurriculumTabProps } from './components/CurriculumTab';
import { FinalPublicationSourceReviewWorkbench } from './components/FinalPublicationSourceReviewWorkbench';

const CANONICAL_MASTER_URL = `https://docs.google.com/document/d/${INSTITUTE_CURRICULUM_CURRENT_SOURCE.driveFileId}/edit`;

type CurriculumWorkspaceProps = CurriculumTabProps & Pick<
  AppViewsLayerProps,
  'targetClass' | 'setTargetClass' | 'handleTabSwitch'
>;

export function CurriculumWorkspace(props: CurriculumWorkspaceProps) {
  const { setActiveCurricoloView, setOrder, setDiscipline } = useCurriculumStore();
  const [sourceToolsOpen, setSourceToolsOpen] = useState(false);
  const [legacyOpen, setLegacyOpen] = useState(false);

  const returnToMaster = () => {
    setActiveCurricoloView('home');
    setLegacyOpen(false);
  };

  const openTechnologyReview = (targetClass: '1' | '2' | '3') => {
    setOrder('secondaria');
    setDiscipline('tecnologia');
    props.setTargetClass(targetClass);
    props.handleTabSwitch('revisione');
  };

  return (
    <div className="space-y-4" data-teacher-surface="curriculum-workspace">
      {!legacyOpen && (
        <section
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          data-canonical-curriculum-entry
          data-curriculum-primary-task="consultation"
          data-hcm-level="1"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-700">Curricolo verticale d’Istituto</span>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">Curricolo verticale 3–14</h2>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
                In revisione
              </span>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-700">
              Raccoglie il percorso dalla scuola dell’infanzia alla terza della secondaria di primo grado. È completo, ma deve ancora essere validato dall’Istituto.
            </p>
          </div>

          <div
            className="flex flex-wrap gap-2"
            aria-label="Copertura del curricolo"
            data-curriculum-scope-summary
          >
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Infanzia · 3–5 anni</span>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Primaria · I–V</span>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Secondaria · I–III</span>
          </div>

          <section
            className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4"
            data-secondary-curriculum-navigation
          >
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Per il tuo lavoro</p>
            <h3 className="mt-1 text-base font-extrabold text-slate-950">Tecnologia · Secondaria di primo grado</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">Scegli una classe se vuoi passare al Riesame.</p>

            <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Apri il riesame di Tecnologia per classe">
              {(['1', '2', '3'] as const).map((targetClass) => {
                const selected = props.targetClass === targetClass;
                return (
                  <button
                    key={targetClass}
                    type="button"
                    onClick={() => openTechnologyReview(targetClass)}
                    aria-label={`Apri il riesame di Tecnologia per la classe ${targetClass === '1' ? 'prima' : targetClass === '2' ? 'seconda' : 'terza'}`}
                    data-open-technology-review-class={targetClass}
                    className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-bold transition ${selected
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-indigo-200 bg-white text-indigo-800 hover:border-indigo-400'}`}
                  >
                    {targetClass === '1' ? 'Classe I' : targetClass === '2' ? 'Classe II' : 'Classe III'}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Classe III: il Riesame non è ancora disponibile.</p>
          </section>

          <a
            href={CANONICAL_MASTER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 sm:w-auto"
            data-open-canonical-curriculum
          >
            Consulta il curricolo
          </a>
        </section>
      )}

      {!legacyOpen && (
        <details
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
          data-hcm-level="3"
          data-canonical-source-review
          data-source-review-progressive-disclosure
          data-advanced-source-tools-default="collapsed"
        >
          <summary className="cursor-pointer text-sm font-bold text-slate-700">Fonti e verifiche</summary>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            <p>
              Apri questa area solo se devi controllare la fonte ufficiale o registrare una verifica documentale.
            </p>
            <button
              type="button"
              onClick={() => setSourceToolsOpen((open) => !open)}
              aria-expanded={sourceToolsOpen}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-300"
              data-open-source-review-tools
            >
              {sourceToolsOpen ? 'Chiudi gli strumenti di verifica' : 'Apri gli strumenti di verifica'}
            </button>
          </div>

          {sourceToolsOpen && (
            <div className="mt-4 border-t border-slate-200 pt-4" data-source-review-advanced-tools>
              <FinalPublicationSourceReviewWorkbench />
            </div>
          )}
        </details>
      )}

      {!legacyOpen && (
        <details
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
          data-hcm-level="3"
          data-legacy-curriculum-disclosure
          data-legacy-default="collapsed"
        >
          <summary className="cursor-pointer text-sm font-bold text-slate-700">Archivio precedente</summary>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            <p>
              Qui resta disponibile la vecchia copia locale per consultazione storica. Non è il curricolo corrente dell’Istituto.
            </p>
            <button
              type="button"
              onClick={() => setLegacyOpen(true)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-300"
            >
              Apri l’archivio precedente
            </button>
          </div>
        </details>
      )}

      {legacyOpen && (
        <section className="space-y-4" data-legacy-curriculum-workspace>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Archivio precedente</p>
                <p className="mt-1 text-sm leading-6 text-amber-950">
                  Stai consultando una copia storica, non il curricolo corrente dell’Istituto.
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
