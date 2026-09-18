type GeneralSubtab = 'premessa' | 'riforma' | 'obiettivi' | 'livelli';

interface InfoViewsProps {
  activeTab: string;
  activeGeneralSubtab: GeneralSubtab;
  setActiveGeneralSubtab: (value: GeneralSubtab) => void;
}

/**
 * Compatibility shell for historical informational tabs.
 *
 * Canonical source support now lives in Fascicolo and canonical help in SupportGuideView.
 * This component intentionally renders no first-class product surface.
 */
export function InfoViews(_props: InfoViewsProps) {
  return null;
}
