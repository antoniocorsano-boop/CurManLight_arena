import type { ReactNode } from 'react';

export type UiPanelVariant = 'default' | 'subtle' | 'emphasized';

type UiPanelProps = {
  variant?: UiPanelVariant;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

const variantClasses: Record<UiPanelVariant, string> = {
  default: 'bg-ui-surface border border-ui-border',
  subtle: 'bg-ui-surface-subtle border border-ui-border',
  emphasized: 'bg-ui-surface-emphasis border border-ui-border-strong',
};

export function UiPanel({
  variant = 'default',
  title,
  description,
  actions,
  children,
  className = '',
}: UiPanelProps) {
  return (
    <div className={`rounded-ui-panel p-4 ${variantClasses[variant]} ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            {title && (
              <h3 className="text-[14px] font-semibold text-ui-text leading-tight">{title}</h3>
            )}
            {description && (
              <p className="text-[13px] text-ui-text-secondary mt-0.5">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
