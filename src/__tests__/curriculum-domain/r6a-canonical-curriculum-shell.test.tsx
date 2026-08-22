import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { AppSidebar } from '../../features/navigation/components/AppSidebar';
import { CurriculumTab } from '../../features/curriculum/components/CurriculumTab';
import { DashboardView } from '../../features/session/components/DashboardView';
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
  it('opens Home as a task-oriented teacher workspace without legacy module cards', () => {
    render(
      <DashboardView
        activeTab="dashboard"
        role="insegnante"
        savedUda={[]}
        decisions={{}}
        wizardStep={1}
        progTitle=""
        progStatus="bozza"
        documentExportHistory={[]}
        handleDownloadCml={vi.fn()}
        handleTabSwitch={vi.fn()}
        setSelectedBrainDoc={vi.fn()}
        setWikiWorkspaceTab={vi.fn()}
        setShowSaveModal={vi.fn()}
        setActiveCurricoloView={vi.fn()}
        setActiveProgTab={vi.fn()}
        setSelectedUda={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Cosa devi fare oggi?' })).toBeInTheDocument();
    expect(screen.getByText('Contesto attivo')).toBeInTheDocument();
    for (const legacyLabel of ['PTOF HUB', 'UDA Compilatore', 'Apri Wizard', 'Ambiente Aula', 'PTOF Hub (IA)']) {
      expect(screen.queryByText(new RegExp(legacyLabel, 'i'))).not.toBeInTheDocument();
    }
  });

  it('exposes the six canonical primary product areas without legacy labels', async () => {
    const handleTabSwitch = vi.fn();
    const setActiveCurricoloView = vi.fn();
    const setActiveProgTab = vi.fn();

    render(
      <AppSidebar
        sidebarCollapsed={false}
        activeTab="dashboard"
        activeCurricoloView="home"
        activeProgTab="home"
        pendingCount={0}
        handleTabSwitch={handleTabSwitch}
        setActiveCurricoloView={setActiveCurricoloView}
        setActiveProgTab={setActiveProgTab}
      />,
    );

    const primaryLabels = ['Home', 'Curricolo', 'Progettazione', 'Documenti', 'Classe', 'Impostazioni'];
    for (const label of primaryLabels) {
      expect(screen.getByRole('button', { name: new RegExp(`^${label}$`) })).toBeInTheDocument();
    }

    for (const legacyLabel of ['Home Dashboard', 'Consulta Curricolo', 'Progettazione UDA', 'Spazio d\'Aula e Classe', 'WikiLLM e archivio locale']) {
      expect(screen.queryByRole('button', { name: new RegExp(`^${legacyLabel}$`) })).not.toBeInTheDocument();
    }

    await userEvent.setup().click(screen.getByRole('button', { name: /^Documenti$/ }));
    expect(handleTabSwitch).toHaveBeenCalledWith('esportazioni');
    await userEvent.setup().click(screen.getByRole('button', { name: /^Impostazioni$/ }));
    expect(handleTabSwitch).toHaveBeenCalledWith('fonti');
  });

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
    expect(screen.queryByText(/Area locale di consultazione/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Visualizzazione degli obiettivi verticali/i)).not.toBeInTheDocument();
    expect(screen.getByText('Indicazioni nazionali')).toBeInTheDocument(); expect(screen.getByText(/Curricolo d.istituto/)).toBeInTheDocument(); expect(screen.getByText('Confronto 2012 / 2025')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: /Processo Revisione istituzionale/ })); expect(curriculumProps.handleTabSwitch).toHaveBeenCalledWith('revisione');
  });

  it('routes the canonical institutional revision card to the real RevisioneTab', async () => {
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn() });
    render(<MemoryRouter initialEntries={['/curriculum']}><App /></MemoryRouter>);

    await userEvent.setup().click(screen.getByRole('button', { name: /Processo Revisione istituzionale/ }));

    expect(await screen.findByRole('heading', { name: /Revisione del Curricolo: Gap 2025/ })).toBeInTheDocument();
  });
});
