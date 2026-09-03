import { useState } from 'react';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import { CurriculumTab as CurriculumTabBase, type CurriculumTabProps } from './components/CurriculumTab';
import { FinalPublicationSourceReviewWorkbench } from './components/FinalPublicationSourceReviewWorkbench';

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
              <span className="text-xs font-bold text-indigo-700">Indicazioni nazionali 2025 · pubblicazione finale</span>
              <h3 className="mt-1 text-base font-extrabold text-slate-900">Controlla i testi della fonte ufficiale</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Verifica una scheda alla volta tra infanzia, primaria e secondaria di I grado, con filtri per campo, disciplina e stato. Puoi esportare e reimportare le ricevute senza sovrascrivere automaticamente eventuali conflitti.
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
              Il registro strutturale è completo; la verifica del testo resta umana e non equivale all’adozione del curricolo.
            </p>
          )}

          {reviewOpen && <FinalPublicationSourceReviewWorkbench />}
        </section>
      )}
    </div>
  );
}