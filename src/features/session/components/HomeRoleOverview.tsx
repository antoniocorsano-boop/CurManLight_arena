import { ArrowRight, BookOpen, ClipboardList, Download, FileCheck2, Settings2 } from 'lucide-react';
import type { UserRole } from '../../../types/curriculum';
import type { ProgStatus } from '../types/appViewContracts';
import { getHomeRoleCommunication } from '../communication/homeCommunication';

const WIZARD_STEP_LABELS: Record<number, string> = {
  1: 'Traguardi e obiettivi',
  2: 'Compito di realtà',
  3: 'Evidenze e valutazione',
  4: 'Risorse e tempi',
  5: 'Anteprima e salvataggio',
};

function deriveWorkState(savedUdaCount: number, wizardStep: number, progStatus: ProgStatus) {
  if (wizardStep > 1 && wizardStep <= 5) return 'in_corso';
  if (savedUdaCount === 0) return 'nessuna_attivita';
  if (progStatus === 'pronta per confronto') return 'completo';
  return 'bozza';
}

const WORK_STATE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  nessuna_attivita: { label: 'Nessuna attività', color: 'text-slate-500', bg: 'bg-slate-100' },
  in_corso: { label: 'In corso', color: 'text-amber-700', bg: 'bg-amber-100' },
  bozza: { label: 'Bozza salvata', color: 'text-blue-700', bg: 'bg-blue-100' },
  completo: { label: 'Completo', color: 'text-emerald-700', bg: 'bg-emerald-100' },
};

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'adesso';
  if (diffMin < 60) return `${diffMin} min fa`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h fa`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}g fa`;
}

interface HomeRoleOverviewProps {
  role: UserRole;
  savedUdaCount: number;
  localChoiceCount: number;
  wizardStep: number;
  progTitle: string;
  progStatus: ProgStatus;
  lastSaveTime: number | null;
  handleDownloadCml: () => void;
  handleTabSwitch: (tab: string) => void;
  setSelectedBrainDoc: (value: string) => void;
  setWikiWorkspaceTab: (value: 'read') => void;
  setShowSaveModal: (value: boolean) => void;
  setActiveProgTab: (value: string) => void;
}

export function HomeRoleOverview({
  role,
  savedUdaCount,
  localChoiceCount,
  wizardStep,
  progTitle,
  progStatus,
  lastSaveTime,
  handleDownloadCml,
  handleTabSwitch,
  setSelectedBrainDoc,
  setWikiWorkspaceTab,
  setShowSaveModal,
  setActiveProgTab,
}: HomeRoleOverviewProps) {
  const communication = getHomeRoleCommunication(role);
  const teacherState = deriveWorkState(savedUdaCount, wizardStep, progStatus);
  const teacherStateConfig = WORK_STATE_CONFIG[teacherState];

  const openReference = () => {
    setSelectedBrainDoc('vol10');
    setWikiWorkspaceTab('read');
    handleTabSwitch('second-brain');
  };

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      data-hcm-home-role={role}
      data-hia-task-block="home-role-orientation"
      data-testid={role === 'insegnante' ? 'teacher-work-status' : undefined}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-600">{communication.eyebrow}</span>
          <h1 className="mt-1 text-lg font-extrabold leading-tight text-slate-900">{communication.title}</h1>
          <p className="mt-1 max-w-[70ch] text-sm leading-relaxed text-slate-600">{communication.summary}</p>
        </div>
        {role === 'insegnante' && (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${teacherStateConfig.color} ${teacherStateConfig.bg}`}>
            {teacherStateConfig.label}
          </span>
        )}
      </header>

      {role === 'insegnante' && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
            <div>
              <span className="block text-[10px] font-semibold text-slate-500">UDA salvate</span>
              <strong className="text-base text-slate-900">{savedUdaCount}</strong>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-500">Scelte locali</span>
              <strong className="text-base text-slate-900">{localChoiceCount}</strong>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-500">
                {wizardStep > 1 ? 'Passo in corso' : 'Prossimo Passo'}
              </span>
              <strong className="text-base text-slate-900">
                {wizardStep > 1 ? `${wizardStep}/5` : savedUdaCount > 0 ? '—' : '1/5'}
              </strong>
            </div>
          </div>

          {wizardStep > 1 && wizardStep <= 5 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <ClipboardList className="h-4 w-4 text-amber-500" aria-hidden="true" />
              <span>{progTitle ? `Progettazione: ${progTitle}` : `Passo ${wizardStep}: ${WIZARD_STEP_LABELS[wizardStep]}`}</span>
            </div>
          )}

          {lastSaveTime && (
            <div className="text-[11px] text-slate-500">Ultimo salvataggio: {formatRelativeTime(lastSaveTime)}</div>
          )}

          {wizardStep > 1 && wizardStep <= 5 ? (
            <button
              onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('annuale'); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
              data-testid="teacher-action-continue"
            >
              Continua la progettazione <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : savedUdaCount > 0 ? (
            <button
              onClick={() => { handleTabSwitch('progetta-annuale'); setActiveProgTab('uda'); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-800 transition hover:bg-indigo-100"
              data-testid="teacher-action-consult"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" /> Apri le UDA
            </button>
          ) : (
            <button
              onClick={() => handleTabSwitch('curricolo')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
              data-testid="teacher-action-start"
            >
              Consulta il curricolo <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {role === 'dipartimento' && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
            <div><span className="block text-xs text-slate-500">Scelte locali</span><strong>{localChoiceCount}</strong></div>
            <div><span className="block text-xs text-slate-500">Raccordi</span><strong>Da esaminare</strong></div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button onClick={() => handleTabSwitch('revisione')} className="rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-600">Apri il confronto</button>
            <button onClick={handleDownloadCml} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" aria-hidden="true" /> Scarica una copia
            </button>
          </div>
        </div>
      )}

      {role === 'referente' && (
        <div className="mt-4">
          <button onClick={() => handleTabSwitch('processo')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600">
            Raccogli i contributi <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {(role === 'dirigente' || role === 'collegio') && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button onClick={openReference} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-600">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> Apri la fonte di riferimento
          </button>
          <button onClick={() => handleTabSwitch('certificazione-pa')} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <FileCheck2 className="h-4 w-4" aria-hidden="true" /> Apri le verifiche
          </button>
        </div>
      )}

      {role === 'amministratore' && (
        <div className="mt-4">
          <button onClick={() => setShowSaveModal(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600">
            <Settings2 className="h-4 w-4" aria-hidden="true" /> Gestisci le copie locali
          </button>
        </div>
      )}

      {communication.details.length > 0 && (
        <details className="mt-4 border-t border-slate-100 pt-3" data-hcm-technical-details>
          <summary className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-700">{communication.detailSummary}</summary>
          <dl className="mt-2 space-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            {communication.details.map((detail) => (
              <div key={detail.label} className="grid gap-0.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-3">
                <dt className="font-bold text-slate-700">{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
            {(role === 'dirigente' || role === 'collegio') && (
              <div className="grid gap-0.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-3">
                <dt className="font-bold text-slate-700">Configurazione sedi</dt>
                <dd>Verifica nelle impostazioni.</dd>
              </div>
            )}
          </dl>
        </details>
      )}
    </section>
  );
}
