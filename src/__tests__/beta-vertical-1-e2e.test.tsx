import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { CurriculumTab } from '../features/curriculum/components/CurriculumTab';
import { createCurriculumConsultationViewModel } from '../features/curriculum/components/curriculumConsultationViewModel';
import { AppViewsLayer } from '../features/session/components/AppViewsLayer';
import { createDidacticPlanning } from '../domain/planning';
import { createLocalDidacticPlanningRepository } from '../lib/didacticPlanningRepository';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { createEmptyDesignStore } from '../domain/design/archive';
import { addSelectionWithConflictResolution } from '../domain/design/conflicts';
import type { EntityId } from '../domain/curriculum/identity/types';
import type { CurriculumMap } from '../features/session';
import type { DesignCurriculumSelection } from '../domain/design/types';

const curriculum: CurriculumMap = { tecnologia: { infanzia: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] }, primaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] }, secondaria: { traguardi: ['Orienta il proprio lavoro con strumenti tecnologici'], obiettivi: ['Progetta una soluzione tecnica'], evidenze: ['Presenta il procedimento seguito'], proposals: [] } } };
const planningId = 'b4-energy-planning' as EntityId;
function createPlanningFromTransfer(selection: DesignCurriculumSelection) {
  return createDidacticPlanning({
    id: planningId, context: { schoolOrder: 'secondaria', discipline: 'tecnologia', classLabel: '2A' },
    curriculumReferences: [{ nodeId: String(selection.curriculumNodeRef?.id), curriculumVersionRef: selection.curriculumVersionRef!, snapshot: selection.currentTextSnapshot, provenance: { sourceArea: selection.sourceArea, qualification: selection.qualification, sourceEntityRef: selection.sourceEntityRef }, sourceRefs: selection.sourceRefs, evidenceRefs: selection.evidenceRefs }],
    content: { title: 'B4 - Energia sostenibile', period: 'Primo quadrimestre', hours: 8, objectives: ['Analizzare trasformazioni e uso responsabile dell energia'], activities: ['Analisi comparativa e produzione di una soluzione'], assessment: [], materials: [] }, status: 'ready',
  });
}

function renderPlanningSurface(repository: ReturnType<typeof createLocalDidacticPlanningRepository>, planning: ReturnType<typeof createPlanningFromTransfer>, seed = true) {
  if (seed) repository.save(planning); localStorage.setItem('curman_canonical_planning_id', planning.id);
  const showToast = vi.fn();
  function Surface() {
    const [activeProgTab, setActiveProgTabState] = useState<'home' | 'annuale' | 'uda'>('home'); const [progettazioneMode, setProgettazioneMode] = useState<'grid' | 'wizard'>('grid');
    const [progTitle, setProgTitle] = useState(''); const [progPeriod, setProgPeriod] = useState(''); const [progHours, setProgHours] = useState(0); const [progNotes, setProgNotes] = useState(''); const [realTaskInput, setRealTaskInput] = useState(''); const [targetClass, setTargetClass] = useState('2A'); const [progStatus, setProgStatus] = useState<'bozza' | 'pronta per confronto'>('bozza');
    const saved = useCurriculumStore(state => state.savedUda); const setActiveProgTab = (tab: 'home' | 'annuale' | 'uda') => { setActiveProgTabState(tab); useCurriculumStore.setState({ activeProgTab: tab }); };
    const props = { activeTab: 'progetta-annuale', activeProgTab, role: 'insegnante', savedUda: saved, decisions: {}, discipline: 'tecnologia', order: 'secondaria', localCurriculum: {}, targetClass, targetSection: '', progTitle, progPeriod, progHours, progStatus, progNotes, realTaskInput, designArchive: undefined, setActiveProgTab, progettazioneMode, setProgettazioneMode, setProgTitle, setProgPeriod, setProgHours, setProgStatus, setProgNotes, setRealTaskInput, setTargetClass, setTargetSection: vi.fn(), wizardStep: 1, setWizardStep: vi.fn(), assignedCombinations: [], progCoAuthors: '', setProgCoAuthors: vi.fn(), branchFocusHighlight: false, toggleBranchFocusHighlight: vi.fn(), tepBannerVisible: false, setTepBannerVisible: vi.fn(), setTepBannerDismissed: vi.fn(), handleTepSwitchToWizard: vi.fn(), handleTepSimplifyGrid: vi.fn(), anticipatedFields: [], confirmAnticipatedField: vi.fn(), applyAnticipatoryPrefill: vi.fn(), handleGenerateUda: vi.fn(), compileProgPreviewText: () => '', handleTriggerGemSuggestion: vi.fn(), handleBack: vi.fn(), handleNext: vi.fn(), handleTabSwitch: vi.fn(), showToast, getDisciplineLabel: (value: string) => value } as unknown as Parameters<typeof AppViewsLayer>[0];
    return <AppViewsLayer {...props} />;
  }
  return { ...render(<Surface />), showToast };
}

describe('Beta Vertical 1 B4 E2E validation', () => {
  beforeEach(() => { localStorage.clear(); useCurriculumStore.setState({ savedUda: [] }); }); afterEach(() => vi.restoreAllMocks());
  it('carries curriculum through Planning, UDA persistence, reopen and export', async () => {
    createCurriculumConsultationViewModel(curriculum, 'secondaria', 'tecnologia');
    useCurriculumStore.setState({ order: 'secondaria', discipline: 'tecnologia', designArchive: createEmptyDesignStore() });
    render(<CurriculumTab
      localCurriculum={curriculum} showOnlyProfileCurriculum={false} setShowOnlyProfileCurriculum={vi.fn()}
      expandedMapSections={{}} setExpandedMapSections={vi.fn()} showOnlyProfileProcesso={false} setShowOnlyProfileProcesso={vi.fn()}
      importTopicInput="" setImportTopicInput={vi.fn()} isGeneratingKB={false} generatedKBOuput={null}
      localAgentStatus="disabled" localAgentSize="light" popolamentoTab="copilot" setPopolamentoTab={vi.fn()}
      setShowAgentSetupModal={vi.fn()} handleAiGenerateCurriculum={vi.fn()} handleSaveGeneratedToKB={vi.fn()}
      handleCSVUpload={vi.fn()} handleResetCurriculumToBaseline={vi.fn()} handleTabSwitch={vi.fn()} setActiveProgTab={vi.fn()}
    />);
    fireEvent.click(screen.getByRole('button', { name: /Progetta una soluzione tecnica/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Usa nella progettazione' }));
    await waitFor(() => expect(useCurriculumStore.getState().designArchive?.selections).toHaveLength(1));
    const transferredSelection = useCurriculumStore.getState().designArchive.selections[0];
    expect(transferredSelection?.currentTextSnapshot).toBe('Progetta una soluzione tecnica');
    expect(transferredSelection?.qualification).toBe('current-curriculum');
    const transferredPlanning = createPlanningFromTransfer(transferredSelection);
    const repository = createLocalDidacticPlanningRepository(localStorage); const first = renderPlanningSurface(repository, transferredPlanning);
    fireEvent.click(await screen.findByRole('button', { name: 'Continua B4 - Energia sostenibile' })); fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'B4 - Energia sostenibile aggiornata' } }); fireEvent.click(await screen.findByRole('button', { name: 'Salva Bozza' }));
    expect(first.showToast).toHaveBeenCalledWith('Planning salvato.', true); expect(repository.get(planningId)?.id).toBe(planningId); expect(repository.get(planningId)?.curriculumReferences).toEqual(transferredPlanning.curriculumReferences); first.unmount(); expect(repository.get(planningId)?.content.title).toBe('B4 - Energia sostenibile aggiornata');
    const reopened = renderPlanningSurface(repository, transferredPlanning, false); fireEvent.click(await screen.findByRole('button', { name: 'Continua B4 - Energia sostenibile aggiornata' })); fireEvent.click(await screen.findByRole('button', { name: 'Salva Bozza' })); fireEvent.click(screen.getByRole('button', { name: 'Materializza UDA' }));
    const fields = screen.getAllByRole('textbox'); fireEvent.change(fields[1], { target: { value: 'Confrontare fonti energetiche e impatti' } }); fireEvent.change(fields[2], { target: { value: 'Analisi comparativa e produzione di una soluzione' } }); fireEvent.change(fields[3], { target: { value: 'Rubrica con indicatori di correttezza e sostenibilita' } }); fireEvent.change(fields[4], { target: { value: 'Schema tecnico e dati di consumo' } }); fireEvent.change(fields[6], { target: { value: 'Sentinella B4' } }); fireEvent.click(screen.getByRole('button', { name: 'Salva UDA' }));
    const firstUda = useCurriculumStore.getState().savedUda[0]; expect(firstUda).toBeDefined(); expect(firstUda.obiettivi).toEqual(['Confrontare fonti energetiche e impatti']); expect(firstUda.sourcePlanningRef?.id).toBe(planningId); expect(firstUda.curriculumReferences).toEqual(repository.get(planningId)?.curriculumReferences); await useCurriculumStore.persist.rehydrate(); expect(useCurriculumStore.getState().savedUda[0].id).toBe(firstUda.id); expect(useCurriculumStore.getState().savedUda[0].curriculumReferences).toEqual(firstUda.curriculumReferences);
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'Dato non salvato' } }); expect(screen.getByRole('button', { name: 'Salva prima di esportare' })).toBeDisabled(); reopened.unmount(); renderPlanningSurface(repository, transferredPlanning, false); fireEvent.click(await screen.findByRole('button', { name: 'Continua B4 - Energia sostenibile aggiornata' })); fireEvent.click(await screen.findByRole('button', { name: 'Apri UDA' }));
    const write = vi.fn(); const print = vi.fn(); vi.spyOn(window, 'open').mockReturnValue({ document: { write, close: vi.fn() }, print, close: vi.fn() } as unknown as Window); fireEvent.click(screen.getByRole('button', { name: 'Stampa / Salva PDF' }));
    expect(write).toHaveBeenCalledWith(expect.stringContaining('Confrontare fonti energetiche e impatti')); expect(write).toHaveBeenCalledWith(expect.stringContaining('Rubrica con indicatori')); expect(write).toHaveBeenCalledWith(expect.stringContaining('Schema tecnico e dati di consumo')); expect(write).toHaveBeenCalledWith(expect.stringContaining('Sentinella B4')); expect(print).toHaveBeenCalledOnce(); expect(useCurriculumStore.getState().savedUda).toHaveLength(1); await waitFor(() => expect(useCurriculumStore.getState().savedUda[0].id).toBe(firstUda.id));
  });

  it('preserves curriculum selections when starting a new planning from the design archive', async () => {
    const repository = createLocalDidacticPlanningRepository(localStorage);
    repository.save(createDidacticPlanning({
      id: 'existing-planning' as EntityId,
      context: { schoolOrder: 'secondaria', discipline: 'tecnologia', classLabel: '2A' },
      content: { title: 'Existing', period: 'Primo quadrimestre', hours: 10, objectives: [], activities: [], assessment: [], materials: [] },
      status: 'in_progress',
    }));
    localStorage.setItem('curman_canonical_planning_id', 'existing-planning');

    const selection: DesignCurriculumSelection = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' as EntityId,
      metadata: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' as EntityId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), origin: 'teacher' as const, schemaVersion: 1 as any },
      designRef: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567891' as EntityId, entityType: 'teaching-design' },
      sourceArea: 'A02',
      sourceEntityRef: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567892' as EntityId, entityType: 'curriculum-node' },
      curriculumNodeRef: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567893' as EntityId, entityType: 'curriculum-node' },
      curriculumVersionRef: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567894' as EntityId, entityType: 'curriculum-version' },
      currentTextSnapshot: 'Progetta una soluzione tecnica',
      selectedTextSnapshot: 'Progetta una soluzione tecnica',
      qualification: 'current-curriculum',
      sourceRefs: [],
      evidenceRefs: [],
      transferredAt: new Date().toISOString(),
      transferContractVersion: '1.0.0',
      structuralFootprint: 'a1b2c3d4-e5f6-7890-abcd-ef1234567895',
      comparisonState: 'source-current',
      warnings: [],
    };

    const archive = createEmptyDesignStore();
    const committed = addSelectionWithConflictResolution(archive, selection, 'keep-existing');
    expect(committed.success).toBe(true);
    useCurriculumStore.setState({ designArchive: committed.archive, savedUda: [] });

    function Surface() {
      const [activeProgTab, setActiveProgTabState] = useState<'home' | 'annuale'>('home');
      const setActiveProgTab = (tab: 'home' | 'annuale') => {
        setActiveProgTabState(tab);
        useCurriculumStore.setState({ activeProgTab: tab });
      };
      const props = {
        activeTab: 'progetta-annuale', activeProgTab, role: 'insegnante', savedUda: [], decisions: {}, discipline: 'tecnologia', order: 'secondaria', localCurriculum: {}, targetClass: '2A', targetSection: '', progTitle: '', progPeriod: '', progHours: 0, progStatus: 'bozza' as const, progNotes: '', realTaskInput: '', designArchive: useCurriculumStore.getState().designArchive, setActiveProgTab, progettazioneMode: 'grid' as const, setProgettazioneMode: vi.fn(), setProgTitle: vi.fn(), setProgPeriod: vi.fn(), setProgHours: vi.fn(), setProgStatus: vi.fn(), setProgNotes: vi.fn(), setRealTaskInput: vi.fn(), setTargetClass: vi.fn(), setTargetSection: vi.fn(), wizardStep: 1, setWizardStep: vi.fn(), assignedCombinations: [], progCoAuthors: '', setProgCoAuthors: vi.fn(), branchFocusHighlight: false, toggleBranchFocusHighlight: vi.fn(), tepBannerVisible: false, setTepBannerVisible: vi.fn(), setTepBannerDismissed: vi.fn(), handleTepSwitchToWizard: vi.fn(), handleTepSimplifyGrid: vi.fn(), anticipatedFields: [], confirmAnticipatedField: vi.fn(), applyAnticipatoryPrefill: vi.fn(), handleGenerateUda: vi.fn(), compileProgPreviewText: () => '', handleTriggerGemSuggestion: vi.fn(), handleBack: vi.fn(), handleNext: vi.fn(), handleTabSwitch: vi.fn(), showToast: vi.fn(), getDisciplineLabel: (value: string) => value,
      } as unknown as Parameters<typeof AppViewsLayer>[0];
      return <AppViewsLayer {...props} />;
    }

    render(<Surface />);
    fireEvent.click(screen.getByRole('button', { name: 'Nuova progettazione' }));
    await waitFor(() => expect(screen.getByTestId('plan-curriculum-references')).toHaveTextContent('1'));
});
});
