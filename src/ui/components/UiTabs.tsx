import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

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
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleChange = (id: string) => {
    setActiveId(id);
    onChange?.(id);
  };

  const moveFocus = (currentIndex: number, nextIndex: number) => {
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;
    tabRefs.current[nextIndex]?.focus();
    handleChange(nextTab.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!tabs.length) return;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex === null) return;
    event.preventDefault();
    moveFocus(index, nextIndex);
  };

  const activeTab = tabs.find((t) => t.id === activeId);
  const activeTabId = activeTab ? `${baseId}-tab-${activeTab.id}` : undefined;
  const activePanelId = activeTab ? `${baseId}-panel-${activeTab.id}` : undefined;

  return (
    <div className={className}>
      <div className="flex border-b border-ui-border" role="tablist">
        {tabs.map((tab, index) => {
          const selected = tab.id === activeId;
          const tabId = `${baseId}-tab-${tab.id}`;
          const panelId = `${baseId}-panel-${tab.id}`;
          return (
            <button
              key={tab.id}
              ref={(node) => { tabRefs.current[index] = node; }}
              id={tabId}
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => handleChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`
                px-4 py-2 text-[13px] font-medium transition-colors
                border-b-2 -mb-px
                ${selected
                  ? 'border-ui-action text-ui-action'
                  : 'border-transparent text-ui-text-secondary hover:text-ui-text hover:border-ui-border'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id={activePanelId}
        role="tabpanel"
        aria-labelledby={activeTabId}
        className="pt-4"
      >
        {activeTab?.content}
      </div>
    </div>
  );
}
