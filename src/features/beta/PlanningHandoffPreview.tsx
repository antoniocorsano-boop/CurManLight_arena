import { useMemo } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, TriangleAlert } from 'lucide-react';
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
    revisionArchive,
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
    revisionArchive,
  }), [
    classContext,
    discipline,
    institutionalContext.configuredOrders,
    institutionalProfile,
    localCurriculum,
    order,
    resolvedSchoolYear,
    revisionArchive,
  ]);

  const classLabel = order === 'infanzia'
    ? `${targetClass}${targetSection ? ` · Sezione ${targetSection}` : ''}`
    : `Classe ${targetClass}${targetSection}`;

  const summaryStatus = preview.status === 'blocked'
    ? 'Mancano alcune informazioni prima di continuare'
    : `${curriculumStateLabel(preview.handoff.curricularContext.curriculumState)} · pronto da controllare`;

  return (
    <section
      aria-label="Anteprima passaggio alla progettazione"
      className="rounded-xl border border-slate-200 bg-white text-sm text-slate-700"
    >
      <details data-hia-handoff-details>
        <summary className="cursor-pointer list-none p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block text-xs uppercase tracking-wider text-slate-600">
                Porta questo lavoro nella progettazione
              </strong>
              <p className="mt-1 font-semibold text-slate-800">{summaryStatus}</p>
              <p className="mt-1 text-xs text-slate-500">Apri per vedere cosa verrà trasferito e cosa manca.</p>
            </div>
          </div>
        </summary>

        <div className="border-t border-slate-200 p-3 space-y-3 sm:p-4">
          <p className="max-w-[75ch] leading-relaxed">
            Arena prepara le informazioni curricolari necessarie per continuare il lavoro in Docente OS. In questa schermata non viene trasferito né modificato nulla: prima controlli ciò che verrà passato, poi decidi tu se proseguire.
          </p>

          {preview.status === 'blocked' ? (
            <div role="status" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <strong className="block">Non puoi ancora continuare</strong>
                <span>{preview.reason}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <strong className="block text-xs uppercase text-slate-500">Dove verrà usato</strong>
                  <div className="mt-1">{institutionalProfile.instituteName}</div>
                  <div>{classLabel} · {discipline} · {order}</div>
                  <div>Anno {resolvedSchoolYear}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <strong className="block text-xs uppercase text-slate-500">Stato del curricolo</strong>
                  <div className="mt-1">{curriculumStateLabel(preview.handoff.curricularContext.curriculumState)}</div>
                  <div>{preview.handoff.curricularContext.applicabilityStatus === 'TRANSITIONAL' ? 'Classe nel periodo di transizione' : 'Curricolo applicabile direttamente'}</div>
                  <div>{preview.mandatoryRequirements}/{preview.totalRequirements} elementi necessari presenti</div>
                </div>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-indigo-950">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Prima controlli, poi scegli</span>
                </div>
                <div><strong>Destinazione:</strong> Docente OS</div>
                <div><strong>In questa schermata:</strong> solo controllo</div>
                <div><strong>Per continuare:</strong> serve la conferma del docente</div>
                <details className="mt-2" data-hcm-technical-details>
                  <summary className="cursor-pointer font-semibold text-slate-500">Dettagli tecnici</summary>
                  <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                    <div><strong>Formato:</strong> {preview.handoff.format}</div>
                    <div><strong>Modalità:</strong> PREVIEW_ONLY</div>
                    <div><strong>Rimodulazione:</strong> {preview.handoff.curricularContext.transitionRemodulation.state}</div>
                  </div>
                </details>
              </div>

              <div className={`flex items-start gap-2 rounded-xl border p-3 ${preview.valid ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
                {preview.valid ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <strong className="block">{preview.valid ? 'Le informazioni sono pronte per il controllo' : 'C’è qualcosa da correggere prima di continuare'}</strong>
                  {preview.valid ? (
                    <>
                      <span>Non è stato ancora scritto o trasferito nulla.</span>
                      <details className="mt-2" data-hcm-technical-details>
                        <summary className="cursor-pointer text-xs font-semibold text-slate-500">Riferimento tecnico</summary>
                        <div className="mt-1 break-all text-xs text-slate-600">
                          Footprint: {preview.handoff.structuralFootprint.hash}
                        </div>
                      </details>
                    </>
                  ) : (
                    <span>{preview.validationErrors.join(' · ')}</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </details>
    </section>
  );
}
