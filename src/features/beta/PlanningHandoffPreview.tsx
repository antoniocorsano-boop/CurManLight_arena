import { useMemo } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useAppContext } from '../../components/layout/AppContext';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import { buildPlanningHandoffPreview } from './planningHandoffPreview';

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
  } = useCurriculumStore();

  const preview = useMemo(() => buildPlanningHandoffPreview({
    institutionalProfile,
    schoolYear,
    schoolOrder: order,
    classLevel: Number.parseInt(targetClass, 10),
    sectionRef: targetSection,
    disciplineRef: discipline,
    curriculumMap: localCurriculum,
    revisionArchive,
  }), [
    discipline,
    institutionalProfile,
    localCurriculum,
    order,
    revisionArchive,
    schoolYear,
    targetClass,
    targetSection,
  ]);

  return (
    <section
      aria-label="Anteprima passaggio alla progettazione"
      className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700 space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <strong className="block text-[10px] uppercase tracking-wider text-slate-600">
            Beta · anteprima passaggio alla progettazione
          </strong>
          <p className="mt-1 leading-relaxed">
            Arena prepara il contesto curricolare che potrà essere consegnato a Docente OS. Questa vista è solo un’anteprima: non sincronizza, non importa e non modifica il lavoro operativo del docente.
          </p>
        </div>
      </div>

      {preview.status === 'blocked' ? (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <strong className="block">Anteprima non disponibile</strong>
            <span>{preview.reason}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <strong className="block text-[10px] uppercase text-slate-500">Contesto</strong>
              <div className="mt-1">{institutionalProfile.instituteName}</div>
              <div>Classe {targetClass}{targetSection} · {discipline} · {order}</div>
              <div>Anno {schoolYear}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <strong className="block text-[10px] uppercase text-slate-500">Baseline risultante</strong>
              <div className="mt-1">{curriculumStateLabel(preview.handoff.curricularContext.curriculumState)}</div>
              <div>{preview.handoff.curricularContext.applicabilityStatus === 'TRANSITIONAL' ? 'Coorte in transizione' : 'Quadro direttamente applicabile'}</div>
              <div>{preview.mandatoryRequirements}/{preview.totalRequirements} requisiti obbligatori</div>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-indigo-950">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Contratto di passaggio controllato</span>
            </div>
            <div><strong>Formato:</strong> {preview.handoff.format}</div>
            <div><strong>Destinazione:</strong> Docente OS</div>
            <div><strong>Modalità:</strong> PREVIEW_ONLY</div>
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
              <strong className="block">{preview.valid ? 'Contratto verificato' : 'Contratto non valido'}</strong>
              {preview.valid ? (
                <>
                  <span>Nessuna scrittura downstream è stata eseguita.</span>
                  <div className="mt-1 break-all text-[10px] text-slate-600">
                    Footprint: {preview.handoff.structuralFootprint.hash}
                  </div>
                </>
              ) : (
                <span>{preview.validationErrors.join(' · ')}</span>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
