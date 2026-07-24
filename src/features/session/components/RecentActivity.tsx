import { ArrowRight } from 'lucide-react';
import type { UdaModel, DocumentExportEvent } from '../../../types/curriculum';

const WIZARD_MAX_STEP = 5;
const MAX_ACTIVITY_ITEMS = 3;

function localDaySerial(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
}

function formatDay(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0 || timestamp > Date.now()) return '';
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return '';

  const now = new Date();
  const todaySerial = localDaySerial(now);
  const activitySerial = localDaySerial(d);
  const diffDays = todaySerial - activitySerial;

  if (diffDays === 0) return 'oggi';
  if (diffDays === 1) return 'ieri';
  if (diffDays >= 2 && diffDays <= 6) return `${diffDays} giorni fa`;
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function safeDateValue(raw: string | undefined): number | null {
  if (!raw) return null;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : null;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  actionLabel: string;
  onAction: () => void;
}

interface RankedActivity extends ActivityItem {
  kind: 'uda' | 'export';
  stableId: string;
  timestamp: number | null;
}

function reliableDateValue(raw: string | undefined): number | null {
  const timestamp = safeDateValue(raw);
  if (timestamp === null || timestamp <= 0 || timestamp > Date.now()) return null;
  return timestamp;
}

function compareRankedActivities(a: RankedActivity, b: RankedActivity): number {
  const aHasTime = a.timestamp !== null;
  const bHasTime = b.timestamp !== null;

  if (aHasTime !== bHasTime) return aHasTime ? -1 : 1;
  if (a.timestamp !== null && b.timestamp !== null && a.timestamp !== b.timestamp) {
    return b.timestamp - a.timestamp;
  }
  if (a.kind !== b.kind) return a.kind === 'uda' ? -1 : 1;
  return a.stableId.localeCompare(b.stableId);
}

function buildActivities(
  savedUda: UdaModel[],
  wizardStep: number,
  progTitle: string,
  wizardLastSaveTime: number | null,
  documentExportHistory: DocumentExportEvent[] | undefined,
  handleTabSwitch: (tab: string) => void,
  setActiveProgTab: (value: string) => void
): ActivityItem[] {
  const activities: ActivityItem[] = [];
  const sourceFamilies = new Map<string, RankedActivity>();
  const independentExports: RankedActivity[] = [];
  const udaIds = new Set(savedUda.map((uda) => uda.id));

  if (wizardStep > 1 && wizardStep <= WIZARD_MAX_STEP) {
    activities.push({
      id: `wizard-${progTitle || 'nuova-uda'}`,
      title: progTitle || 'Nuova UDA',
      description: `in corso \u2014 passo ${wizardStep}/${WIZARD_MAX_STEP}`,
      timeLabel: formatDay(wizardLastSaveTime ?? 0),
      actionLabel: 'Riprendi \u2192',
      onAction: () => { handleTabSwitch('progetta-annuale'); setActiveProgTab('annuale'); },
    });
  }

  savedUda.forEach((uda) => {
    const updatedTime = reliableDateValue(uda.updatedAt);
    const timestamp = updatedTime ?? reliableDateValue(uda.createdAt);
    const candidate: RankedActivity = {
      kind: 'uda',
      stableId: uda.id,
      timestamp,
      id: `uda-${uda.id}`,
      title: uda.title,
      description: updatedTime !== null ? uda.status : 'UDA salvata',
      timeLabel: formatDay(timestamp ?? 0),
      actionLabel: 'Apri \u2192',
      onAction: () => { handleTabSwitch('progetta-annuale'); setActiveProgTab('uda'); },
    };
    const current = sourceFamilies.get(uda.id);
    if (!current || compareRankedActivities(candidate, current) < 0) {
      sourceFamilies.set(uda.id, candidate);
    }
  });

  (documentExportHistory ?? []).forEach((event) => {
    const timestamp = reliableDateValue(event.exportedAt);
    const candidate: RankedActivity = {
      kind: 'export',
      stableId: event.id,
      timestamp,
      id: `export-${event.id}`,
      title: event.label,
      description: 'documento esportato',
      timeLabel: formatDay(timestamp ?? 0),
      actionLabel: 'Apri \u2192',
      onAction: () => { handleTabSwitch('esportazioni'); },
    };

    if (event.sourceId && udaIds.has(event.sourceId)) {
      const current = sourceFamilies.get(event.sourceId);
      if (!current || compareRankedActivities(candidate, current) < 0) {
        sourceFamilies.set(event.sourceId, candidate);
      }
    } else {
      independentExports.push(candidate);
    }
  });

  const rankedEvents = [...sourceFamilies.values(), ...independentExports]
    .sort(compareRankedActivities);
  const remainingSlots = MAX_ACTIVITY_ITEMS - activities.length;
  activities.push(...rankedEvents.slice(0, remainingSlots));

  return activities;
}

interface RecentActivityProps {
  savedUda: UdaModel[];
  wizardStep: number;
  progTitle: string;
  wizardLastSaveTime?: number | null;
  documentExportHistory?: DocumentExportEvent[];
  handleTabSwitch: (tab: string) => void;
  setActiveProgTab: (value: string) => void;
}

export function RecentActivity({
  savedUda,
  wizardStep,
  progTitle,
  wizardLastSaveTime = null,
  documentExportHistory,
  handleTabSwitch,
  setActiveProgTab,
}: RecentActivityProps) {
  const activities = buildActivities(
    savedUda,
    wizardStep,
    progTitle,
    wizardLastSaveTime,
    documentExportHistory,
    handleTabSwitch,
    setActiveProgTab
  );

  if (activities.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-left col-span-3" data-testid="recent-activity-empty">
        <span className="text-[8px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md uppercase block w-fit">{"Attività recenti"}</span>
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
          {"Non hai ancora attività. Inizia a progettare un\u2019UDA o consulta il curricolo per impostare il tuo percorso didattico."}
        </p>
        <button
          onClick={() => handleTabSwitch('curricolo')}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] tracking-wider uppercase transition flex items-center justify-center gap-1.5"
          data-testid="recent-activity-start"
        >
          Inizia dal Curricolo <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-left col-span-3" data-testid="recent-activity">
      <span className="text-[8px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md uppercase block w-fit">{"Attività recenti"}</span>
      <div className="space-y-2.5">
        {activities.map((activity) => (
          <div key={activity.id} className="space-y-2 p-3 bg-white border border-slate-100 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{activity.title}</p>
                <p className="text-[10px] text-slate-500 font-medium">{activity.description}</p>
              </div>
              <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap shrink-0">{activity.timeLabel}</span>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={activity.onAction}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] tracking-wider uppercase transition flex items-center justify-center gap-1.5"
                data-testid={`recent-activity-action-${activity.id}`}
              >
                {activity.actionLabel} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
