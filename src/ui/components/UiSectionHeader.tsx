type UiSectionHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function UiSectionHeader({ title, description, actions, className = '' }: UiSectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[16px] font-semibold text-ui-text leading-tight">{title}</h2>
        {description && (
          <p className="text-[13px] text-ui-text-secondary mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
