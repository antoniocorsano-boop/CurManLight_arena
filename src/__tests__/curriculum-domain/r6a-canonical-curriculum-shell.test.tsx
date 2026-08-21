import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppSidebar } from '../../features/navigation/components/AppSidebar';
import { CurriculumTab } from '../../features/curriculum/components/CurriculumTab';
import { useCurriculumStore } from '../../store/useCurriculumStore';

const curriculumProps = {
  localCurriculum: {} as never,
  showOnlyProfileCurriculum: false, setShowOnlyProfileCurriculum: vi.fn(), expandedMapSections: {}, setExpandedMapSections: vi.fn(),
  showOnlyProfileProcesso: false, setShowOnlyProfileProcesso: vi.fn(), importTopicInput: '', setImportTopicInput: vi.fn(),
  isGeneratingKB: false, generatedKBOuput: null, localAgentStatus: 'disabled', localAgentSize: '', popolamentoTab: 'copilot' as const,
  setPopolamentoTab: vi.fn(), setShowAgentSetupModal: vi.fn(), handleAiGenerateCurriculum: vi.fn(), handleSaveGeneratedToKB: vi.fn(),
  handleCSVUpload: vi.fn(), handleResetCurriculumToBaseline: vi.fn(), handleTabSwitch: vi.fn(),
};

describe('R6-A canonical curriculum shell exposure', () => {
  it('defaults the curriculum store to the canonical landing view', () => {
    expect(useCurriculumStore.getState().activeCurricoloView).toBe('home');
  });

  it('exposes native keyboard-accessible canonical sidebar actions without legacy primary labels', async () => {
    const handleTabSwitch = vi.fn(); const setActiveCurricoloView = vi.fn();
    render(<AppSidebar sidebarCollapsed={false} activeTab="curricolo" activeCurricoloView="home" activeProgTab="home" pendingCount={0} handleTabSwitch={handleTabSwitch} setActiveCurricoloView={setActiveCurricoloView} setActiveProgTab={vi.fn()} />);
    for (const legacyLabel of ['Vista Strutturata (Albero)', 'Raccordo Diacronico (Mappa)', 'Integrazione & Popolamento', 'Revisione (Gap 2025)', 'Fonti locali', 'Pilota Sperimentale']) expect(screen.queryByText(new RegExp(legacyLabel.replace(/[()&]/g, '\\$&')))).not.toBeInTheDocument();
    const canonicalItems = [screen.getByRole('button', { name: /Indicazioni nazionali/ }), screen.getByRole('button', { name: /Curricolo d.istituto/ }), screen.getByRole('button', { name: /Confronto 2012 \/ 2025/ }), screen.getByRole('button', { name: /Revisione istituzionale/ })];
    for (const item of canonicalItems) expect(item.tagName).toBe('BUTTON');
    const user = userEvent.setup(); canonicalItems[0].focus(); await user.keyboard('{Enter}');
    expect(setActiveCurricoloView).toHaveBeenCalledWith('nazionale'); fireEvent.click(canonicalItems[3]); expect(handleTabSwitch).toHaveBeenCalledWith('revisione');
  });

  it('opens with the canonical curriculum landing and makes institutional revision actionable', async () => {
    render(<CurriculumTab {...curriculumProps} />);
    expect(screen.getByRole('heading', { name: 'Curricolo' })).toBeInTheDocument();
    expect(screen.getByText('Indicazioni nazionali')).toBeInTheDocument(); expect(screen.getByText(/Curricolo d.istituto/)).toBeInTheDocument(); expect(screen.getByText('Confronto 2012 / 2025')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: /Processo Revisione istituzionale/ })); expect(curriculumProps.handleTabSwitch).toHaveBeenCalledWith('revisione');
  });
});
