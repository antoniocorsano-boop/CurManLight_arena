import { AlertCircle, CheckCircle, Info, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

export type UiStatusType = 'info' | 'success' | 'warning' | 'error' | 'unverifiable' | 'loading';

type UiStatusMessageProps = {
  type: UiStatusType;
  children: ReactNode;
  className?: string;
};

const statusConfig: Record<UiStatusType, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-ui-action', bg: 'bg-ui-action-soft' },
  success: { icon: CheckCircle, color: 'text-ui-success', bg: 'bg-ui-success-soft' },
  warning: { icon: AlertTriangle, color: 'text-ui-warning', bg: 'bg-ui-warning-soft' },
  error: { icon: AlertCircle, color: 'text-ui-danger', bg: 'bg-ui-danger-soft' },
  unverifiable: { icon: HelpCircle, color: 'text-ui-text-muted', bg: 'bg-ui-surface-subtle' },
  loading: { icon: Loader2, color: 'text-ui-text-muted', bg: 'bg-ui-surface-subtle' },
};

export function UiStatusMessage({ type, children, className = '' }: UiStatusMessageProps) {
  const config = statusConfig[type];
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-ui-panel ${config.bg} ${className}`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.color} ${type === 'loading' ? 'animate-spin' : ''}`} />
      <div className="text-[13px] text-ui-text leading-relaxed">{children}</div>
    </div>
  );
}
