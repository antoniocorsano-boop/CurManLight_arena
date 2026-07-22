import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type UiEmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function UiEmptyState({ icon: Icon, title, description, action, className = '' }: UiEmptyStateProps) {
  return (
    <div className={`text-center py-10 px-6 ${className}`}>
      {Icon && <Icon className="w-10 h-10 text-ui-text-muted mx-auto mb-3" />}
      <h3 className="text-[14px] font-semibold text-ui-text mb-1">{title}</h3>
      {description && (
        <p className="text-[13px] text-ui-text-secondary max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
