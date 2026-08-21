import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppSidebar } from '../../features/navigation/components/AppSidebar';
import { CurriculumTab } from '../../features/curriculum/components/CurriculumTab';
import { useCurriculumStore } from '../../store/useCurriculumStore';

const curriculumProps = {
  localCurriculum: {} as never,
  showOnlyProfileCurriculum: false,
  setShowOnlyProfileCurriculum: vi.fn(),
  expandedMapSections: {},
  setExpandedMapSections: vi.fn(),
  showOnlyProfileProcesso: false,
  setShowOnlyProfileProcesso: vi.fn(),
  importTopicInput: '',
  setImportTopicInput: vi.fn(),
  isGeneratingKB: false,
  generatedKBOuput: null,
  localAgentStatus: 'disabled',
  localAgentSize: '',
  popolamentoTab: 'copilot' as const,
  setPopolamentoTab: vi.fn(),
  setShowAgentSetupModal: vi.fn(),
  handleAiGenerateCurriculum: vi.fn(),
  handleSaveGeneratedToKB: vi.fn(),
  handleCSVUpload: vi.fn(),
  handleResetCurriculumToBaseline: vi.fn(),
};

describe('R6-A canonical curriculum shell exposure', () => {
  it('keeps legacy curriculum labels out of the primary sidebar and exposes canonical routes', () => {
    const handleTabSwitch = vi.fn();
    const setActiveCurricoloView = vi.fn();

    render(
      <AppSidebar
        sidebarCollapsed={false}
        activeTab="curricolo"
        activeCurricoloView="home"
        activeProgTab="home"
        pendingCount={0}
        handleTabSwitch={handleTabSwitch}
        setActiveCurricoloView={setActiveCurricoloView}
        setActiveProgTab={vi.fn()}
      />,
    );

    for (const legacyLabel of [
      'Vista Strutturata (Albero)',
      'Raccordo Diacronico (Mappa)',
      'Integrazione & Popolamento',
      'Revisione (Gap 2025)',
      'Fonti locali',
      'Pilota Sperimentale',
    ]) {
      expect(screen.queryByText(new RegExp(legacyLabel.replace(/[()&]/g, '\\$&')))).not.toBeInTheDocument();
    }

    expect(screen.getByRole('button', { name: 'Indicazioni nazionali' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Curricolo d’istituto' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confronto 2012 / 2025' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revisione istituzionale' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confronto 2012 / 2025' }));
    expect(setActiveCurricoloView).toHaveBeenCalledWith('confronto');
    fireEvent.click(screen.getByRole('button', { name: 'Indicazioni nazionali' }));
    expect(setActiveCurricoloView).toHaveBeenCalledWith('nazionale');
    fireEvent.click(screen.getByRole('button', { name: 'Curricolo d’istituto' }));
    expect(setActiveCurricoloView).toHaveBeenCalledWith('albero');
    fireEvent.click(screen.getByRole('button', { name: 'Revisione istituzionale' }));
    expect(handleTabSwitch).toHaveBeenCalledWith('revisione');
  });

  it('opens with the canonical curriculum landing instead of the legacy local-copy landing', () => {
    useCurriculumStore.setState({ activeCurricoloView: 'home' });

    render(<CurriculumTab {...curriculumProps} />);

    expect(screen.getByRole('heading', { name: 'Curricolo' })).toBeInTheDocument();
    expect(screen.getByText('Indicazioni nazionali')).toBeInTheDocument();
    expect(screen.getByText('Curricolo d’istituto')).toBeInTheDocument();
    expect(screen.getByText('Confronto 2012 / 2025')).toBeInTheDocument();
    expect(screen.getByText('Revisione istituzionale')).toBeInTheDocument();
    expect(screen.queryByText(/copia locale non verificata/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mappa locale non validata/i)).not.toBeInTheDocument();
  });
});
