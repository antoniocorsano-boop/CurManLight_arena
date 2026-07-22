type UiMetadataItem = {
  label: string;
  value: React.ReactNode;
};

type UiMetadataListProps = {
  items: UiMetadataItem[];
  className?: string;
  orientation?: 'vertical' | 'horizontal';
};

export function UiMetadataList({ items, className = '', orientation = 'vertical' }: UiMetadataListProps) {
  if (orientation === 'horizontal') {
    return (
      <div className={`flex flex-wrap gap-x-4 gap-y-1 ${className}`}>
        {items.map((item) => (
          <span key={item.label} className="text-[12px] text-ui-text-muted font-medium">
            {item.value}
          </span>
        ))}
      </div>
    );
  }

  return (
    <dl className={`space-y-1 ${className}`}>
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-2">
          <dt className="text-[12px] text-ui-text-muted font-medium shrink-0">{item.label}</dt>
          <dd className="text-[13px] text-ui-text">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
