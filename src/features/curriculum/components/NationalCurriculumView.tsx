import { useMemo, useState } from 'react';
import type { NationalCurriculumConsultationService, FrameworkInfo, AreaInfo, ContentItem } from '../../../domain/curriculum/nationalCurriculumConsultation';
import type { SchoolOrder } from '../../../types/curriculum';
import type { CurriculumNodeType } from '../../../domain/curriculum/model/vocabularies';
import { resolveNationalFramework } from '../../../lib/curriculumTransitionResolver';
import type { AcademicYear } from '../../../types/curriculumTransition';
import { parseSchoolYear } from '../../../lib/academicYear';

type NationalCurriculumViewState = {
  frameworkId: string;
  schoolOrder: SchoolOrder | null;
  sourceAreaCode: string | null;
  nodeType: CurriculumNodeType | null;
  text: string;
};

interface NationalCurriculumViewProps {
  service: NationalCurriculumConsultationService;
  // Optional context for framework applicability guidance
  schoolYearStr?: string;
  schoolOrderContext?: SchoolOrder;
  classLevelContext?: number;
}

export function NationalCurriculumView({ 
  service, 
  schoolYearStr, 
  schoolOrderContext, 
  classLevelContext 
}: NationalCurriculumViewProps) {
  const frameworks = useMemo(() => service.listAvailableFrameworks(), [service]);
  const defaultFrameworkId = frameworks[0]?.id ?? 'IN2012';

  const [state, setState] = useState<NationalCurriculumViewState>(() => ({
    frameworkId: defaultFrameworkId,
    schoolOrder: null,
    sourceAreaCode: null,
    nodeType: null,
    text: '',
  }));

  const currentFramework = frameworks.find((f: FrameworkInfo) => f.id === state.frameworkId) ?? frameworks[0];
  const schoolOrders = useMemo(
    () => (currentFramework ? service.listSchoolOrders(currentFramework.id) : []),
    [service, currentFramework]
  );
  const areas = useMemo(
    () =>
      currentFramework && state.schoolOrder
        ? service.listAreas(currentFramework.id, state.schoolOrder)
        : [],
    [service, currentFramework, state.schoolOrder]
  );
  const content = useMemo(
    () =>
      service.listContent({
        frameworkId: state.frameworkId,
        schoolOrder: state.schoolOrder ?? undefined,
        sourceAreaCode: state.sourceAreaCode ?? undefined,
        nodeType: state.nodeType ?? undefined,
        text: state.text || undefined,
      }),
    [service, state.frameworkId, state.schoolOrder, state.sourceAreaCode, state.nodeType, state.text]
  );

  const updateFilter = <K extends keyof NationalCurriculumViewState>(key: K, value: NationalCurriculumViewState[K]) => {
    setState(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'frameworkId') {
        next.schoolOrder = null;
        next.sourceAreaCode = null;
      }
      if (key === 'schoolOrder') {
        next.sourceAreaCode = null;
      }
      return next;
    });
  };

  const nodeTypeLabel = (item: ContentItem) => {
    if (item.normativeNodeKind === 'osa-2025') {
      return 'OSA 2025';
    }
    return item.nodeType === 'traguardo' ? 'Traguardo' : 'Obiettivo';
  };

  // Get applicable framework guidance using resolver
  const applicableFrameworkGuidance = useMemo(() => {
    // If we don't have the minimum required context, return null
    if (!schoolYearStr || !schoolOrderContext) {
      return null;
    }

    const schoolYear: AcademicYear | null = parseSchoolYear(schoolYearStr);
    if (!schoolYear) {
      return null;
    }

    try {
      return resolveNationalFramework({
        schoolOrder: schoolOrderContext,
        schoolYear,
        classLevel: classLevelContext
      });
    } catch (error) {
      // In case of unexpected error, return null to avoid breaking UI
      return null;
    }
  }, [schoolYearStr, schoolOrderContext, classLevelContext]);

  return (
    <div className="space-y-4 fade-in text-left">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Consultazione nazionale</span>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Indicazioni nazionali</h3>
        <p className="text-xs text-slate-600 font-semibold leading-relaxed">
          Consulta i traguardi e gli obiettivi delle Indicazioni nazionali per ordine, area e tipo di contenuto.
        </p>
      </div>

{/* Framework Applicability Guidance */}
      {applicableFrameworkGuidance && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">
                Framework applicabile al contesto corrente
              </span>
              {applicableFrameworkGuidance.framework === 'IN2012' && (
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">
                  ● Indicazioni nazionali 2012
                </span>
              )}
              {applicableFrameworkGuidance.framework === 'IN2025' && (
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">
                  ● Indicazioni nazionali 2025
                </span>
              )}
              {!applicableFrameworkGuidance.framework && (
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  ● Framework non determinabile
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex">
                <span className="font-black text-slate-600 w-20">Anno scolastico:</span>
                <span className="text-slate-400">
                  {schoolYearStr ? schoolYearStr.replace('-', '/') : '-'}
                </span>
              </div>
              <div className="flex">
                <span className="font-black text-slate-600 w-20">Ordine:</span>
                <span className="text-slate-400">
                  {schoolOrderContext === 'infanzia' ? "Scuola dell'Infanzia" :
                   schoolOrderContext === 'primaria' ? "Scuola Primaria" :
                   schoolOrderContext === 'secondaria' ? "Scuola Secondaria I grado" :
                   '-'}
                </span>
              </div>
              <div className="flex">
                <span className="font-black text-slate-600 w-20">Classe:</span>
                <span className="text-slate-400">
                  {classLevelContext !== undefined && classLevelContext !== null
                    ? `${classLevelContext}ª`
                    : '[non specificata]'}
                </span>
              </div>
              {applicableFrameworkGuidance.framework && applicableFrameworkGuidance.reason && (
                <div className="mt-2">
                  <span className="font-black text-slate-600">Motivo:</span>
                  <span className="text-slate-400 italic">
                    {applicableFrameworkGuidance.reason.replace('_', ' ').toLowerCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Framework</label>
          <select
            value={state.frameworkId}
            onChange={event => updateFilter('frameworkId', event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
          >
            {frameworks.map((framework: FrameworkInfo) => (
              <option key={framework.id} value={framework.id}>
                {framework.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Ordine</label>
          <select
            value={state.schoolOrder ?? ''}
            onChange={event => updateFilter('schoolOrder', event.target.value as SchoolOrder)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
          >
            <option value="">Seleziona ordine</option>
            {schoolOrders.map((order: SchoolOrder) => (
              <option key={order} value={order}>
                {order}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Campo / Disciplina</label>
          <select
            value={state.sourceAreaCode ?? ''}
            onChange={event => updateFilter('sourceAreaCode', event.target.value || null)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 disabled:opacity-50"
            disabled={!state.schoolOrder}
          >
            <option value="">Seleziona area</option>
            {areas.map((area: AreaInfo) => {
              const applicability = area.frameworkApplicability;
              const label = applicability
                ? `${area.title} (${applicability.resolutionReason})`
                : area.title;
              return (
                <option key={area.code} value={area.code}>
                  {label}
                </option>
              );
            })}
          </select>
          {areas.some(a => a.frameworkApplicability) && (
            <p className="text-[9px] text-slate-400 font-medium">
              Le aree con parentesi indicano applicabilità condizionale al framework selezionato.
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Tipo contenuto</label>
          <select
            value={state.nodeType ?? ''}
            onChange={event => updateFilter('nodeType', event.target.value as CurriculumNodeType)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
          >
            <option value="">Tutti</option>
            <option value="traguardo">Traguardo</option>
            <option value="obiettivo">Obiettivo</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Ricerca testuale</label>
        <input
          type="text"
          value={state.text}
          onChange={event => updateFilter('text', event.target.value)}
          placeholder="Ricerca testuale..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800"
        />
      </div>

<div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Risultati</span>
          <div className="flex-1 flex justify-between">
            <span className="text-[10px] font-bold text-slate-500">{content.length} elementi</span>
            {/* Show framework mismatch warning if applicable */}
            {applicableFrameworkGuidance && applicableFrameworkGuidance.framework && applicableFrameworkGuidance.framework !== state.frameworkId && (
              <>
                <span className="ml-3 text-xs font-semibold">
                  {state.frameworkId === 'IN2012' ? 'Stai consultando il framework 2012.' : 'Stai consultando il framework 2025.'}
                </span>
                <span className="ml-2 text-xs">Per questo contesto il framework applicabile è </span>
                <span className="text-xs font-semibold">
                  {applicableFrameworkGuidance.framework === 'IN2012' ? '2012' : '2025'}
                </span>
                <span className="text-xs ml-1">.</span>
              </>
            )}
          </div>
        </div>

        {!state.schoolOrder ? (
          <p className="text-xs text-slate-500 font-medium">Seleziona un ordine per visualizzare i contenuti.</p>
        ) : content.length === 0 ? (
          <p className="text-xs text-slate-500 font-medium">Nessun contenuto disponibile per i filtri selezionati.</p>
        ) : (
          <div className="space-y-2">
            {content.map((item: ContentItem) => (
              <div
                key={item.id}
                className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mt-0.5">
                  {nodeTypeLabel(item)}
                </span>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">{item.text}</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {item.schoolOrder} · {item.sourceAreaKind === 'experience-field' ? 'Campo di esperienza' : 'Disciplina'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
