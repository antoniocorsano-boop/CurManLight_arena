import { useMemo } from 'react';
import { ArrowRight, CheckCircle2, Download, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useAppContext } from '../../components/layout/AppContext';
import { getA04InstitutionalRead } from '../../domain/institution';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import {
  buildPlanningHandoffPreview,
  resolvePlanningHandoffClassContext,
  resolvePlanningSchoolYear,
} from './planningHandoffPreview';

const curriculumStateLabel = (state: 'APPROVED' | 'PROVISIONAL_COMPLETE'): string =>
  state === 'APPROVED' ? 'Approvato' : 'Completo per progettare · ancora provvisorio';

export function PlanningHandoffPreview() {
  const {
    localCurriculum,
    targetClass,
    targetSection,
    institutionalProfile,
  } = useAppContext();
  const {
    discipline,
    order,
    schoolYear,
    institutionalArchive,
  } = useCurriculumStore();

  const institutionalContext = useMemo(
    () => getA04InstitutionalRead(institutionalArchive, order),
    [institutionalArchive, order],
  );
  const resolvedSchoolYear = useMemo(
    () => resolvePlanningSchoolYear(institutionalContext.academicYearLabel, schoolYear),
    [institutionalContext.academicYearLabel, schoolYear],
  );
  const classContext = useMemo(
    () => resolvePlanningHandoffClassContext(order, targetClass, targetSection),
    [order, targetClass, targetSection],
  );

  const preview = useMemo(() => buildPlanningHandoffPreview({
    institutionalProfile,
    configuredSchoolOrders: institutionalContext.configuredOrders,
    schoolYear: resolvedSchoolYear,
    schoolOrder: order,
    ...classContext,
    disciplineRef: discipline,
    curriculumMap: localCurriculum,
  }), [
    classContext,
    discipline,
    institutionalContext.configuredOrders,
    institutionalProfile,
    localCurriculum,
    order,
    resolvedSchoolYear,
  ]);

  const classLabel = order === 'infanzia'
    ? `${targetClass}${targetSection ? ` · Sezione ${targetSection}` : ''}`
    : `Classe ${targetClass}${targetSection}`;

  const downloadHandoff = () => {
    if (preview.status !== 'ready' || !preview.valid || typeof document === 'undefined') return;

    const blob = new Blob([JSON.stringify(preview.handoff, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `curmanlight-docente-os-${discipline}-${order}-${targetClass}${targetSection || ''}.cml-handoff.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      aria-label="Passaggio alla progettazione"
      data-human-task="planning-handoff"
      data-human-handoff-status={preview.status}
      className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 p-4 text-sm leading-6 text-slate-700"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-slate-900">Passaggio alla progettazione</h2>
          <p className="mt-1">
            Qui vedi cosa Arena prepara per Docente OS. Il passaggio è esplicito e versionato: non sincronizza automaticamente e non modifica il lavoro del docente.
          </p>
        </div>
      </div>

      {preview.status === 'blocked' ? (
        <>
          <div role="status" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <strong className="block">Il passaggio non è ancora pronto</strong>
              <span>{preview.reason}</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <strong className="block text-slate-900">Quando sarà pronto</strong>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Arena prepara il contesto curricolare da consegnare a Docente OS.</li>
              <li>Docente OS dovrà controllarlo e accettarlo prima di usarlo.</li>
              <li>Nessuna classe, UDA o lezione viene modificata automaticamente.</li>
            </ul>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <strong className="block text-xs uppercase tracking-wide text-slate-500">Contesto</strong>
              <div className="mt-1">{institutionalProfile.instituteName}</div>
              <div>{classLabel} · {discipline} · {order}</div>
              <div>Anno {resolvedSchoolYear}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <strong className="block text-xs uppercase tracking-wide text-slate-500">Baseline risultante</strong>
              <div className="mt-1">{curriculumStateLabel(preview.handoff.curricularContext.curriculumState)}</div>
              <div>{preview.handoff.curricularContext.applicabilityStatus === 'TRANSITIONAL' ? 'Coorte in transizione' : 'Quadro direttamente applicabile'}</div>
              <div>{preview.mandatoryRequirements}/{preview.totalRequirements} requisiti obbligatori</div>
            </div>
          </div>

          <div className="space-y-1 rounded-xl border border-indigo-200 bg-white p-3">
            <div className="flex items-center gap-2 font-semibold text-indigo-950">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Cosa viene consegnato</span>
            </div>
            <div><strong>Formato:</strong> {preview.handoff.format}</div>
            <div><strong>Destinazione:</strong> Docente OS</div>
            <div><strong>Modalità:</strong> trasferimento esplicito, non sincronizzazione automatica</div>
            <div><strong>Accettazione docente:</strong> obbligatoria</div>
            <div><strong>Rimodulazione:</strong> {preview.handoff.curricularContext.transitionRemodulation.state}</div>
          </div>

          <div className={`flex items-start gap-2 rounded-xl border p-3 ${preview.valid ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
            {preview.valid ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <div className="min-w-0">
              <strong className="block">{preview.valid ? 'Passaggio verificato' : 'Passaggio non valido'}</strong>
              {preview.valid ? (
                <span>Il file può essere preparato. Nessuna scrittura in Docente OS è stata eseguita.</span>
              ) : (
                <span>{preview.validationErrors.join(' · ')}</span>
              )}
            </div>
          </div>

          {preview.valid && (
            <button
              type="button"
              data-human-next-action="download-planning-handoff"
              onClick={downloadHandoff}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Scarica passaggio per Docente OS
            </button>
          )}
        </>
      )}
    </section>
  );
}