import { useCurriculumStore } from '../../store/useCurriculumStore';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from '../../domain/curriculum/institute/currentSource';
import { ProgettazioneTab as ProgettazioneTabBase, type ProgettazioneTabProps } from './components/ProgettazioneTab';

const CANONICAL_MASTER_ID = 'CAN-CURR-MASTER-00';

const ORDER_LABELS: Record<string, string> = {
  infanzia: "Scuola dell’infanzia",
  primaria: 'Scuola primaria',
  secondaria: 'Scuola secondaria di primo grado',
};

const DISCIPLINE_LABELS: Record<string, string> = {
  italiano: 'Italiano',
  matematica: 'Matematica',
  scienze: 'Scienze',
  tecnologia: 'Tecnologia',
  storia: 'Storia',
  geografia: 'Geografia',
  inglese: 'Lingua inglese',
  secondaLingua: 'Seconda lingua comunitaria',
  arteImmagine: 'Arte e immagine',
  musica: 'Musica',
  educazioneFisica: 'Educazione fisica',
  educazioneCivica: 'Educazione civica',
  religione: 'Insegnamento della religione cattolica',
  latino: 'Latino per l’Educazione Linguistica',
};

function classLabel(order: string, targetClass: string, targetSection: string) {
  if (order === 'infanzia') return targetSection ? `Sezione ${targetSection}` : 'Sezione da definire';
  const normalizedClass = targetClass?.trim() || '—';
  const normalizedSection = targetSection?.trim();
  return `Classe ${normalizedClass}${normalizedSection ? ` ${normalizedSection}` : ''}`;
}

export function PlanningWorkspace(props: ProgettazioneTabProps) {
  const { activeProgTab, setActiveProgTab, discipline, order } = useCurriculumStore();
  const disciplineLabel = DISCIPLINE_LABELS[discipline] ?? discipline;
  const orderLabel = ORDER_LABELS[order] ?? order;
  const authorityLabel = INSTITUTE_CURRICULUM_CURRENT_SOURCE.curriculumInForce
    ? `Curricolo vigente · master ${INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion}`
    : `Riferimento di lavoro · master ${INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion} non vigente`;

  if (activeProgTab === 'home') {
    return (
      <section
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        data-teacher-surface="planning-context-first"
        data-hcm-level="1"
      >
        <div className="space-y-2">
          <span className="text-xs font-bold text-indigo-700">Progettazione didattica</span>
          <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">Prepara il lavoro della classe</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-700">
            Parti dal contesto reale della classe e dal curricolo di riferimento. Archivio, matrici e strumenti di riuso restano disponibili quando servono, ma non sostituiscono il compito corrente.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Contesto della progettazione">
          <p className="text-sm font-extrabold text-slate-950">{disciplineLabel}</p>
          <p className="mt-1 text-sm text-slate-700">{orderLabel} · {classLabel(order, props.targetClass, props.targetSection)}</p>
          <p className="mt-2 text-xs font-bold text-amber-800">{authorityLabel}</p>
        </div>

        <button
          type="button"
          onClick={() => setActiveProgTab('annuale')}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          data-human-next-action="start-current-planning"
        >
          Inizia la progettazione
        </button>

        <details className="rounded-xl border border-slate-200 bg-slate-50 p-4" data-hcm-level="2">
          <summary className="cursor-pointer text-sm font-bold text-slate-700">Altri strumenti di progettazione</summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveProgTab('uda')}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:border-indigo-300"
            >
              Consulta le UDA già progettate
            </button>
            <button
              type="button"
              onClick={() => setActiveProgTab('certificazione')}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:border-indigo-300"
            >
              Consulta la matrice delle competenze
            </button>
          </div>
        </details>

        <details className="rounded-xl border border-slate-200 bg-white p-4" data-hcm-level="3">
          <summary className="cursor-pointer text-sm font-bold text-slate-600">Verifica e tracciabilità</summary>
          <div className="mt-3 space-y-1 text-xs leading-5 text-slate-600">
            <p>Master: {CANONICAL_MASTER_ID}@{INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion}</p>
            <p>Stato: validazione professionale {INSTITUTE_CURRICULUM_CURRENT_SOURCE.humanProfessionalValidation.toLowerCase()} · curricolo vigente: {INSTITUTE_CURRICULUM_CURRENT_SOURCE.curriculumInForce ? 'sì' : 'no'}.</p>
            <p>La progettazione conserva un riferimento al curricolo; eventuali testi copiati restano snapshot di lavoro e non diventano una nuova fonte curricolare.</p>
          </div>
        </details>
      </section>
    );
  }

  return (
    <div className="space-y-4" data-teacher-surface="planning-workspace">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" data-planning-context>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Progettazione corrente</p>
            <p className="mt-1 text-base font-extrabold text-slate-950">{disciplineLabel} · {classLabel(order, props.targetClass, props.targetSection)}</p>
            <p className="mt-1 text-xs font-semibold text-amber-800">{authorityLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveProgTab('home')}
            className="min-h-11 shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-300"
          >
            Cambia attività
          </button>
        </div>
      </section>

      <ProgettazioneTabBase {...props} />
    </div>
  );
}
