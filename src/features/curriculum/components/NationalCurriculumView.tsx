import { useMemo, useState } from 'react';
import type { NationalCurriculumConsultationService, FrameworkInfo, AreaInfo, ContentItem } from '../../../domain/curriculum/nationalCurriculumConsultation';
import type { SchoolOrder } from '../../../types/curriculum';
import type { CurriculumNodeType } from '../../../domain/curriculum/model/vocabularies';

type NationalCurriculumViewState = {
  frameworkId: string;
  schoolOrder: SchoolOrder | null;
  sourceAreaCode: string | null;
  nodeType: CurriculumNodeType | null;
  text: string;
};

const DEFAULT_STATE: NationalCurriculumViewState = {
  frameworkId: 'IN2012',
  schoolOrder: null,
  sourceAreaCode: null,
  nodeType: null,
  text: '',
};

interface NationalCurriculumViewProps {
  service: NationalCurriculumConsultationService;
}

export function NationalCurriculumView({ service }: NationalCurriculumViewProps) {
  const [state, setState] = useState<NationalCurriculumViewState>(DEFAULT_STATE);
  const frameworks = useMemo(() => service.listAvailableFrameworks(), [service]);
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
        next.nodeType = null;
        next.text = '';
      }
      if (key === 'schoolOrder') {
        next.sourceAreaCode = null;
      }
      return next;
    });
  };

  const nodeTypeLabel = (nodeType: CurriculumNodeType) =>
    nodeType === 'traguardo' ? 'Traguardo' : 'Obiettivo';

  return (
    <div className="space-y-4 fade-in text-left">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Consultazione nazionale</span>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Indicazioni nazionali</h3>
        <p className="text-xs text-slate-600 font-semibold leading-relaxed">
          Consulta i traguardi e gli obiettivi del D.M. 254/2012 per ordine, area e tipo di contenuto.
        </p>
      </div>

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
            {areas.map((area: AreaInfo) => (
              <option key={area.code} value={area.code}>
                {area.title}
              </option>
            ))}
          </select>
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
          <span className="text-[10px] font-bold text-slate-500">{content.length} elementi</span>
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
                  {nodeTypeLabel(item.nodeType)}
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
