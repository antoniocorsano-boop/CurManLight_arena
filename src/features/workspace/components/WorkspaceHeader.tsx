import type { ReactNode } from 'react';

export interface WorkspaceHeaderProps {
  identity: string;
  context?: string;
  workObject?: string;
  status?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  contextualActions?: ReactNode;
  assistanceLabel?: string;
  onAssistance?: () => void;
}

export function WorkspaceHeader({
  identity,
  context,
  workObject,
  status,
  primaryAction,
  contextualActions,
  assistanceLabel,
  onAssistance,
}: WorkspaceHeaderProps) {
  return (
    <header className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm space-y-4" data-testid="workspace-header">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1.5 min-w-0">
          <span className="text-[10px] font-semibold text-indigo-600 tracking-wide">Area di lavoro</span>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{identity}</h1>
          {context && <p className="text-sm font-medium text-slate-600" data-testid="workspace-context">{context}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {status && <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold" data-testid="workspace-status">{status}</span>}
          {assistanceLabel && (
            <button type="button" onClick={onAssistance} className="px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 transition">
              {assistanceLabel}
            </button>
          )}
          {contextualActions}
        </div>
      </div>
      {(workObject || primaryAction) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-t border-slate-100 pt-3">
          {workObject ? (
            <div className="space-y-0.5" data-testid="workspace-work-object">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Oggetto di lavoro</span>
              <p className="text-sm font-semibold text-slate-800">{workObject}</p>
            </div>
          ) : <span />}
          {primaryAction && (
            <button type="button" onClick={primaryAction.onClick} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition shadow-sm">
              {primaryAction.label}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
