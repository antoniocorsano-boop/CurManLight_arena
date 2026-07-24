import { ArrowRight } from 'lucide-react';
import type { UdaModel, DocumentExportEvent } from '../../../types/curriculum';

const WIZARD_MAX_STEP = 5;

function localDaySerial(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
}

function formatDay(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return '';
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

function getMostRecentUda(savedUda: UdaModel[]): UdaModel | null {
  if (savedUda.length === 0) return null;

  let latest = savedUda[0];
  let latestTime = safeDateValue(latest.updatedAt) ?? safeDateValue(latest.createdAt) ?? 0;

  for (let i = 1; i < savedUda.length; i++) {
    const current = savedUda[i];
    const currentTime = safeDateValue(current.updatedAt) ?? safeDateValue(current.createdAt) ?? 0;

    if (currentTime > latestTime) {
      latest = current;
      latestTime = currentTime;
    } else if (currentTime === latestTime) {
      latest = current;
    }
  }

  return latest;
}

function getMostRecentExport(history: DocumentExportEvent[] | undefined): DocumentExportEvent | null {
  if (!history || history.length === 0) return null;

  let latest = history[0];
  let latestTime = safeDateValue(latest.exportedAt) ?? 0;

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const currentTime = safeDateValue(current.exportedAt) ?? 0;
    if (currentTime > latestTime) {
      latest = current;
      latestTime = currentTime;
    }
  }

  return latest;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  actionLabel: string;
  onAction: () => void;
}

function buildActivities(
  savedUda: UdaModel[],
  wizardStep: number,
  progTitle: string,
  documentExportHistory: DocumentExportEvent[] | undefined,
  handleTabSwitch: (tab: string) => void,
  setActiveProgTab: (value: string) => void
): ActivityItem[] {
  const activities: ActivityItem[] = [];

  if (wizardStep > 1 && wizardStep <= WIZARD_MAX_STEP) {
    activities.push({
      id: `wizard-${progTitle || 'nuova-uda'}`,
      title: progTitle || 'Nuova UDA',
      description: `in corso \u2014 passo ${wizardStep}/${WIZARD_MAX_STEP}`,
      timeLabel: 'oggi',
      actionLabel: 'Riprendi \u2192',
      onAction: () => { handleTabSwitch('progetta-annuale'); setActiveProgTab('annuale'); },
    });
  }

  const recentUda = getMostRecentUda(savedUda);
  if (recentUda) {
    const hasUpdatedAt = Boolean(safeDateValue(recentUda.updatedAt));
    const udaTime = safeDateValue(recentUda.updatedAt) ?? safeDateValue(recentUda.createdAt);

    activities.push({
      id: `uda-${recentUda.id}`,
      title: recentUda.title,
      description: hasUpdatedAt ? recentUda.status : 'UDA salvata',
      timeLabel: formatDay(udaTime ?? 0),
      actionLabel: 'Apri \u2192',
      onAction: () => { handleTabSwitch('progetta-annuale'); setActiveProgTab('uda'); },
    });
  }

  const recentExport = getMostRecentExport(documentExportHistory);
  if (recentExport) {
    const isDup = activities.some(a => {
      if (a.id.startsWith('uda-')) {
        const udaId = a.id.replace('uda-', '');
        return recentExport.sourceId === udaId;
      }
      return false;
    });

    if (!isDup) {
      activities.push({
        id: `export-${recentExport.id}`,
        title: recentExport.label,
        description: 'documento esportato',
        timeLabel: formatDay(safeDateValue(recentExport.exportedAt) ?? 0),
        actionLabel: 'Apri \u2192',
        onAction: () => { handleTabSwitch('esportazioni'); },
      });
    }
  }

  return activities.slice(0, 3);
}

interface RecentActivityProps {
  savedUda: UdaModel[];
  wizardStep: number;
  progTitle: string;
  documentExportHistory?: DocumentExportEvent[];
  handleTabSwitch: (tab: string) => void;
  setActiveProgTab: (value: string) => void;
}

export function RecentActivity({
  savedUda,
  wizardStep,
  progTitle,
  documentExportHistory,
  handleTabSwitch,
  setActiveProgTab,
}: RecentActivityProps) {
  const activities = buildActivities(
    savedUda,
    wizardStep,
    progTitle,
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
