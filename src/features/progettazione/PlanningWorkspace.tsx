import { ExternalLink, Route, ShieldCheck } from 'lucide-react';
import { getA04InstitutionalRead, getInstitutionalConfigurationSummary } from '../../domain/institution';
import {
  resolvePlanningSourceContext,
  type PlanningSourceContext,
} from '../../domain/curriculum/institute/planningSourceContext';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import { PlanningHandoffPreview } from '../beta/PlanningHandoffPreview';
import type { ProgettazioneTabProps } from './components/ProgettazioneTab';

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

function teacherFacingCurriculumStatus(sourceContext: PlanningSourceContext): string {
  switch (sourceContext.masterInstitutionalStatus) {
    case 'IN_FORCE':
      return 'Curricolo d’Istituto vigente';
    case 'PENDING_PROFESSIONAL_VALIDATION':
      return 'Riferimento curricolare di lavoro · validazione professionale ancora aperta';
    case 'PENDING_VERTICALITY_REVIEW':
      return 'Riferimento curricolare di lavoro · revisione verticale finale ancora aperta';
    case 'NOT_READY_FOR_COLLEGIO':
      return 'Riferimento curricolare di lavoro · non ancora pronto per il Collegio';
    case 'READY_FOR_COLLEGIO_PENDING_APPROVAL':
      return 'Pronto per il Collegio · approvazione collegiale non ancora registrata';
    case 'APPROVED_PENDING_CANONICAL_PROMOTION':
      return 'Approvazione collegiale registrata · aggiornamento del riferimento non ancora autorizzato';
    case 'PROMOTION_AUTHORIZED_PENDING_IN_FORCE':
      return 'Aggiornamento del riferimento autorizzato · vigenza non ancora registrata';
  }
}

function buildAtlasContextUrl(input: {
  discipline: string;
  order: string;
  targetClass: string;
  sourceContext: PlanningSourceContext;
}) {
  const params = new URLSearchParams({
    sourceProduct: 'curmanlight-arena',
    masterId: input.sourceContext.masterId,
    masterVersion: input.sourceContext.masterVersion,
    curriculumState: input.sourceContext.masterInstitutionalStatus === 'IN_FORCE'
      ? 'IN_FORCE'
      : 'WORKING_REFERENCE',
    masterGovernanceStatus: input.sourceContext.masterInstitutionalStatus,
    masterLifecycleState: input.sourceContext.masterLifecycleState,
    sourceRepertoryId: input.sourceContext.sourceRepertoryId,
    sourceRepertoryVersion: input.sourceContext.sourceRepertoryVersion,
    applicabilityState: input.sourceContext.applicabilityState,
    academicYear: input.sourceContext.academicYear || 'unspecified',
    discipline: input.discipline,
    order: input.order,
    classLevel: input.targetClass?.trim() || 'unspecified',
  });

  if (input.sourceContext.framework) {
    params.set('applicableFramework', input.sourceContext.framework);
  }
  if (input.sourceContext.applicableSource) {
    params.set('applicableSourceCode', input.sourceContext.applicableSource.code);
  }

  return `${CURRICULUM_ATLAS_URL}?${params.toString()}`;
}

export function PlanningWorkspace(props: ProgettazioneTabProps) {
  const {
    discipline,
    order,
    schoolYear,
    institutionalArchive,
  } = useCurriculumStore();
  const disciplineLabel = DISCIPLINE_LABELS[discipline] ?? discipline;
  const orderLabel = ORDER_LABELS[order] ?? order;
  const institutionalContext = getA04InstitutionalRead(institutionalArchive, order);
  const configurationSummary = getInstitutionalConfigurationSummary(institutionalArchive);
  const effectiveSchoolYear = institutionalContext.academicYearLabel
    ?? configurationSummary.academicYearLabel
    ?? schoolYear;
  const sourceContext = resolvePlanningSourceContext({
    schoolYear: effectiveSchoolYear,
    order,
    targetClass: props.targetClass,
  });
  const atlasContextUrl = buildAtlasContextUrl({
    discipline,
    order,
    targetClass: props.targetClass,
    sourceContext,
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

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Contesto curricolare">
          {configurationSummary.instituteDefined && (
            <div
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5"
              data-planning-institution-phase={configurationSummary.phase}
            >
              <p className="text-xs font-extrabold text-slate-900">
                Istituto definito: {configurationSummary.instituteName}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {configurationSummary.phase === 'ACTIVE'
                  ? 'Anno scolastico e contesto istituzionale attivi.'
                  : configurationSummary.phase === 'CONFIRMED_INACTIVE'
                    ? 'Istituto confermato localmente; anno e contesto devono ancora essere attivati.'
                    : 'Configurazione salvata come bozza; non è ancora un contesto istituzionale attivo.'}
                {configurationSummary.academicYearLabel ? ` A.S. ${configurationSummary.academicYearLabel}.` : ''}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm font-extrabold text-slate-950">{disciplineLabel}</p>
            <p className="mt-1 text-sm text-slate-700">
              {orderLabel} · {classLabel(order, props.targetClass, props.targetSection)}
              {sourceContext.academicYear ? ` · A.S. ${sourceContext.academicYear}` : ''}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5"
              data-planning-master-state={sourceContext.masterInstitutionalStatus}
            >
              <p className="text-xs font-extrabold text-amber-950">Curricolo di lavoro Arena · versione {sourceContext.masterVersion}</p>
              <p className="mt-1 text-xs leading-5 text-amber-900">{teacherFacingCurriculumStatus(sourceContext)}</p>
            </div>

            <div
              className={`rounded-lg border px-3 py-2.5 ${
                sourceContext.framework
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 bg-white'
              }`}
              data-planning-applicability={sourceContext.applicabilityState}
            >
              <p className={`text-xs font-extrabold ${
                sourceContext.framework ? 'text-emerald-950' : 'text-slate-800'
              }`}>
                {sourceContext.applicabilityLabel}
              </p>
              <p className={`mt-1 text-xs leading-5 ${
                sourceContext.framework ? 'text-emerald-900' : 'text-slate-600'
              }`}>
                {sourceContext.applicabilityDetail}
              </p>
            </div>
          </div>

          <p className="text-[11px] leading-5 text-slate-600">
            Il quadro nazionale applicabile alla coorte e lo stato di approvazione del riferimento curricolare d’Istituto sono informazioni distinte. Arena conserva entrambe senza trasformare un riferimento di lavoro in un’adozione istituzionale.
          </p>
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
              Esplora relazioni, sviluppo verticale, linea temporale e provenienza in sola consultazione. L’anteprima non approva né modifica il curricolo.
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
              Anteprima pubblica · sola consultazione. Il collegamento conserva versione curricolare, repertorio delle fonti, regime della coorte, disciplina, ordine e classe senza dati personali.
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
            <p>Master: {sourceContext.masterId}@{sourceContext.masterVersion}</p>
            <p>Stato master d’Istituto: {sourceContext.masterStatusLabel}.</p>
            <p>Repertorio fonti: {sourceContext.sourceRepertoryId}@{sourceContext.sourceRepertoryVersion}.</p>
            <p>Applicabilità: {sourceContext.applicabilityLabel}{sourceContext.applicableSource ? ` · ${sourceContext.applicableSource.code}` : ''}.</p>
            <p>Atlas è una proiezione di consultazione e non trasferisce autorità. Il passaggio a Docente OS conserva identità, provenienza e stato del curricolo.</p>
          </div>
        </details>
      </section>

      <PlanningHandoffPreview />
    </div>
  );
}
