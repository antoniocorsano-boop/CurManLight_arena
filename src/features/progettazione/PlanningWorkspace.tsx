import { ExternalLink, Route, ShieldCheck } from 'lucide-react';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from '../../domain/curriculum/institute/currentSource';
import { PlanningHandoffPreview } from '../beta/PlanningHandoffPreview';
import type { ProgettazioneTabProps } from './components/ProgettazioneTab';

const CANONICAL_MASTER_ID = 'CAN-CURR-MASTER-00';
const CURRICULUM_ATLAS_URL = 'https://antoniocorsano-boop.github.io/Curriculum-Atlas/';

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

function buildAtlasContextUrl(input: {
  discipline: string;
  order: string;
  targetClass: string;
}) {
  const params = new URLSearchParams({
    sourceProduct: 'curmanlight-arena',
    masterId: CANONICAL_MASTER_ID,
    masterVersion: INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion,
    curriculumState: INSTITUTE_CURRICULUM_CURRENT_SOURCE.curriculumInForce ? 'IN_FORCE' : 'WORKING_REFERENCE',
    discipline: input.discipline,
    order: input.order,
    classLevel: input.targetClass?.trim() || 'unspecified',
  });
  return `${CURRICULUM_ATLAS_URL}?${params.toString()}`;
}

export function PlanningWorkspace(props: ProgettazioneTabProps) {
  const { discipline, order } = useCurriculumStore();
  const disciplineLabel = DISCIPLINE_LABELS[discipline] ?? discipline;
  const orderLabel = ORDER_LABELS[order] ?? order;
  const authorityLabel = INSTITUTE_CURRICULUM_CURRENT_SOURCE.curriculumInForce
    ? `Curricolo vigente · master ${INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion}`
    : `Riferimento di lavoro · master ${INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion} non vigente`;
  const atlasContextUrl = buildAtlasContextUrl({
    discipline,
    order,
    targetClass: props.targetClass,
  });

  return (
    <div
      className="space-y-5"
      data-teacher-surface="planning-boundary-hub"
      data-surface-boundary="arena-atlas-docente-os"
      data-hcm-level="1"
    >
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-indigo-700">Dal curricolo alla pratica</span>
          <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">Scegli il passaggio giusto</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-700">
            Arena governa il curricolo. Curriculum Atlas lo rende esplorabile e collegato. Docente OS trasforma il contesto validato nel lavoro operativo del docente.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Contesto curricolare">
          <p className="text-sm font-extrabold text-slate-950">{disciplineLabel}</p>
          <p className="mt-1 text-sm text-slate-700">{orderLabel} · {classLabel(order, props.targetClass, props.targetSection)}</p>
          <p className="mt-2 text-xs font-bold text-amber-800">{authorityLabel}</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3" aria-label="Confine tra i tre ambienti">
          <article className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4">
            <div className="flex items-center gap-2 text-indigo-900">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <strong>Arena · governa</strong>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Verifica fonti, applicabilità, stato di validazione e requisiti curricolari. Qui non si costruisce il piano operativo della classe.
            </p>
            <button
              type="button"
              onClick={() => props.handleTabSwitch('curricolo')}
              className="mt-4 min-h-11 w-full rounded-xl border border-indigo-300 bg-white px-4 py-2.5 text-sm font-bold text-indigo-800 hover:bg-indigo-50"
              data-human-next-action="open-governed-curriculum"
            >
              Verifica il contesto curricolare
            </button>
          </article>

          <article className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4">
            <div className="flex items-center gap-2 text-violet-900">
              <Route className="h-5 w-5" aria-hidden="true" />
              <strong>Curriculum Atlas · naviga</strong>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Esplora relazioni, verticale, timeline e provenienza in modalità read-only. L’anteprima non approva né modifica il curricolo.
            </p>
            <a
              href={atlasContextUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-violet-300 bg-white px-4 py-2.5 text-sm font-bold text-violet-800 hover:bg-violet-50"
              data-human-next-action="open-curriculum-atlas"
              data-atlas-handoff="read-only-context"
            >
              Esplora in Curriculum Atlas
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              Anteprima S1 pubblica · sola consultazione. Il link conserva master, versione, disciplina, ordine e classe senza dati personali.
            </p>
          </article>

          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="flex items-center gap-2 text-emerald-900">
              <ExternalLink className="h-5 w-5" aria-hidden="true" />
              <strong>Docente OS · opera</strong>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Programmazione annuale, UDA, lezioni, materiali ed evidenze appartengono all’ambiente operativo del docente.
            </p>
            <p className="mt-4 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold leading-5 text-emerald-900">
              Il passaggio sottostante è esplicito e versionato: Docente OS deve accettarlo prima di usarlo.
            </p>
          </article>
        </div>

        <details className="rounded-xl border border-slate-200 bg-slate-50 p-4" data-hcm-level="2">
          <summary className="cursor-pointer text-sm font-bold text-slate-700">Cosa non si fa più in Arena</summary>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">
            <li>compilare e versionare UDA operative del docente;</li>
            <li>gestire la programmazione annuale della classe;</li>
            <li>archiviare o duplicare materiali e moduli didattici personali;</li>
            <li>registrare lezioni, calendario o avanzamento quotidiano.</li>
          </ul>
        </details>

        <details className="rounded-xl border border-slate-200 bg-white p-4" data-hcm-level="3">
          <summary className="cursor-pointer text-sm font-bold text-slate-600">Verifica e tracciabilità</summary>
          <div className="mt-3 space-y-1 text-xs leading-5 text-slate-600">
            <p>Master: {CANONICAL_MASTER_ID}@{INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion}</p>
            <p>Stato: validazione professionale {INSTITUTE_CURRICULUM_CURRENT_SOURCE.humanProfessionalValidation.toLowerCase()} · curricolo vigente: {INSTITUTE_CURRICULUM_CURRENT_SOURCE.curriculumInForce ? 'sì' : 'no'}.</p>
            <p>Atlas è una proiezione di consultazione e non trasferisce autorità. Il passaggio a Docente OS conserva identità, provenienza e stato del curricolo.</p>
          </div>
        </details>
      </section>

      <PlanningHandoffPreview />
    </div>
  );
}
