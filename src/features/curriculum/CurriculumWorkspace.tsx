import { useState } from 'react';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import type { SchoolOrder } from '../../types/curriculum';
import type { AppViewsLayerProps } from '../session/types/appViewContracts';
import { CurriculumTab as CurriculumTabBase, type CurriculumTabProps } from './components/CurriculumTab';
import { FinalPublicationSourceReviewWorkbench } from './components/FinalPublicationSourceReviewWorkbench';
import { ProfessionalCurriculumReader } from './components/ProfessionalCurriculumReader';
import type { CurriculumExploreContext } from './components/CurriculumExploreTrama';

type CurriculumWorkspaceProps = CurriculumTabProps & Pick<
  AppViewsLayerProps,
  'targetClass' | 'setTargetClass' | 'handleTabSwitch' | 'institutionalProfile'
>;

function toSchoolOrder(value: string): SchoolOrder | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'infanzia' || normalized === 'primaria' || normalized === 'secondaria') return normalized;
  return null;
}

export function CurriculumWorkspace(props: CurriculumWorkspaceProps) {
  const { setActiveCurricoloView, setActiveProgTab, setOrder, setDiscipline } = useCurriculumStore();
  const [sourceDisclosureOpen, setSourceDisclosureOpen] = useState(false);
  const [sourceToolsOpen, setSourceToolsOpen] = useState(false);
  const [legacyOpen, setLegacyOpen] = useState(false);

  const returnToMaster = () => {
    setActiveCurricoloView('home');
    setLegacyOpen(false);
  };

  const applyCurriculumContext = (context: CurriculumExploreContext) => {
    const schoolOrder = toSchoolOrder(context.order);
    if (schoolOrder) setOrder(schoolOrder);
    setDiscipline(context.disciplineId);
    if (context.targetClass) props.setTargetClass(context.targetClass);
  };

  const useInPlanning = (context: CurriculumExploreContext) => {
    applyCurriculumContext(context);
    setActiveProgTab('annuale');
    props.handleTabSwitch('progetta-annuale');
  };

  const canOpenReview = (context: CurriculumExploreContext) => (
    context.disciplineId === 'tecnologia'
    && context.order.toLowerCase() === 'secondaria'
    && (context.targetClass === '1' || context.targetClass === '2')
  );

  const openCurriculumReview = (context: CurriculumExploreContext) => {
    if (!canOpenReview(context)) return;
    applyCurriculumContext(context);
    props.handleTabSwitch('revisione');
  };

  const openSource = (_context: CurriculumExploreContext) => {
    setSourceDisclosureOpen(true);
    window.requestAnimationFrame(() => {
      document.querySelector('[data-canonical-source-review]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="space-y-4" data-teacher-surface="curriculum-workspace">
      {!legacyOpen && (
        <ProfessionalCurriculumReader
          institutionalProfile={props.institutionalProfile}
          onUseInPlanning={useInPlanning}
          onOpenReview={openCurriculumReview}
          canOpenReview={canOpenReview}
          onOpenSource={openSource}
        />
      )}

      {!legacyOpen && (
        <details
          open={sourceDisclosureOpen}
          onToggle={(event) => setSourceDisclosureOpen(event.currentTarget.open)}
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
