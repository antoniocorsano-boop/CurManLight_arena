import { useState } from 'react';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import { CurriculumTab as CurriculumTabBase, type CurriculumTabProps } from './components/CurriculumTab';
import { TechnologySourceReviewTask } from './components/TechnologySourceReviewTask';

export function CurriculumWorkspace(props: CurriculumTabProps) {
  const { activeCurricoloView } = useCurriculumStore();
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <div className="space-y-4" data-teacher-surface="curriculum-workspace">
      <CurriculumTabBase {...props} />

      {activeCurricoloView === 'home' && (
        <section className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/30 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-indigo-700">Curricolo verticale · Tecnologia</span>
              <h3 className="mt-1 text-base font-extrabold text-slate-900">Controlla le Indicazioni 2025</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Verifica una scheda alla volta, dalla primaria alla secondaria di I grado.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReviewOpen((open) => !open)}
              aria-expanded={reviewOpen}
              className="w-full shrink-0 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 sm:w-auto"
            >
              {reviewOpen ? 'Chiudi' : 'Controlla la fonte'}
            </button>
          </div>

          {!reviewOpen && (
            <p className="text-xs text-slate-500" data-hcm-secondary-content>
              La verifica registra solo ciò che controlli nella fonte: non approva il curricolo.
            </p>
          )}

          {reviewOpen && <TechnologySourceReviewTask />}
        </section>
      )}
    </div>
  );
}