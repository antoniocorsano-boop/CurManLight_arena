import { useState } from 'react';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import { CurriculumTab as CurriculumTabBase, type CurriculumTabProps } from './components/CurriculumTab';
import { TechnologySourceReviewTask } from './components/TechnologySourceReviewTask';

export function CurriculumWorkspace(props: CurriculumTabProps) {
  const { activeCurricoloView } = useCurriculumStore();
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <div className="space-y-6">
      <CurriculumTabBase {...props} />

      {activeCurricoloView === 'home' && (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Fonte nazionale · Tecnologia</span>
              <h3 className="text-base font-black text-slate-900">Verifica ciò che arriva dalle Indicazioni 2025</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Controlla uno alla volta i 61 elementi già localizzati nel D.M. 221/2025. La verifica resta distinta dalla copia locale e da qualsiasi decisione della scuola.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReviewOpen((open) => !open)}
              aria-expanded={reviewOpen}
              className="shrink-0 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-700"
            >
              {reviewOpen ? 'Chiudi verifica' : 'Inizia la verifica'}
            </button>
          </div>

          {!reviewOpen && (
            <p className="text-xs font-semibold text-slate-500">
              Non viene modificato nulla finché non apri il compito e registri una decisione esplicita per il singolo elemento.
            </p>
          )}

          {reviewOpen && <TechnologySourceReviewTask />}
        </section>
      )}
    </div>
  );
}
