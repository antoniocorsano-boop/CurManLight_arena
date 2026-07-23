import { useState, type ReactNode } from 'react';

export type UiTab = {
  id: string;
  label: string;
  content: ReactNode;
};

type UiTabsProps = {
  tabs: UiTab[];
  defaultTab?: string;
  className?: string;
  onChange?: (tabId: string) => void;
};

export function UiTabs({ tabs, defaultTab, className = '', onChange }: UiTabsProps) {
  const [activeId, setActiveId] = useState(defaultTab || tabs[0]?.id || '');

  const handleChange = (id: string) => {
    setActiveId(id);
    onChange?.(id);
  };

  const activeTab = tabs.find((t) => t.id === activeId);

  return (
    <div className={className}>
      <div className="flex border-b border-ui-border" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeId}
            onClick={() => handleChange(tab.id)}
            className={`
              px-4 py-2 text-[13px] font-medium transition-colors
              border-b-2 -mb-px
              ${tab.id === activeId
                ? 'border-ui-action text-ui-action'
                : 'border-transparent text-ui-text-secondary hover:text-ui-text hover:border-ui-border'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">
        {activeTab?.content}
      </div>
    </div>
  );
}
