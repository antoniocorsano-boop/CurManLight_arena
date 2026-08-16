import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppViewsLayer } from '../features/session/components/AppViewsLayer';
import { createDidacticPlanning } from '../domain/planning';
import { createLocalDidacticPlanningRepository } from '../lib/didacticPlanningRepository';
import { useCurriculumStore } from '../store/useCurriculumStore';
import type { EntityId } from '../domain/curriculum/identity/types';

const planning = createDidacticPlanning({
  id: 'b2-smoke-planning' as EntityId,
  context: { schoolOrder: 'secondaria', discipline: 'tecnologia', classLabel: '2A' },
  content: { title: 'Energia e territorio', period: 'Primo quadrimestre', hours: 12, objectives: ['Comprendere i consumi'], activities: ['Mappa dei consumi'] },
  status: 'ready',
});

function renderSurface(seed = true) {
  const repository = createLocalDidacticPlanningRepository(localStorage);
  if (seed) {
    repository.save(planning);
    localStorage.setItem('curman_canonical_planning_id', planning.id);
  }
  const showToast = vi.fn();
  function Surface() {
    const [activeProgTab, setActiveProgTabState] = useState<'home' | 'annuale' | 'uda'>('home');
    const [progettazioneMode, setProgettazioneMode] = useState<'grid' | 'wizard'>('grid');
    const [progTitle, setProgTitle] = useState('');
    const [progPeriod, setProgPeriod] = useState('');
    const [progHours, setProgHours] = useState(0);
    const [progNotes, setProgNotes] = useState('');
    const [realTaskInput, setRealTaskInput] = useState('');
    const [targetClass, setTargetClass] = useState('2A');
    const [progStatus, setProgStatus] = useState<'bozza' | 'pronta per confronto'>('bozza');
    const savedUda = useCurriculumStore(state => state.savedUda);
    const setActiveProgTab = (tab: 'home' | 'annuale' | 'uda') => {
      setActiveProgTabState(tab);
      useCurriculumStore.setState({ activeProgTab: tab });
    };
    const props = {
      activeTab: 'progetta-annuale', activeProgTab, role: 'insegnante', savedUda, decisions: {}, discipline: 'tecnologia', order: 'secondaria', localCurriculum: {}, targetClass, targetSection: '', progTitle, progPeriod, progHours, progStatus, progNotes, realTaskInput, designArchive: undefined,
      setActiveProgTab, progettazioneMode, setProgettazioneMode, setProgTitle, setProgPeriod, setProgHours, setProgStatus, setProgNotes, setRealTaskInput, setTargetClass, setTargetSection: vi.fn(), wizardStep: 1, setWizardStep: vi.fn(), assignedCombinations: [], progCoAuthors: '', setProgCoAuthors: vi.fn(), branchFocusHighlight: false, toggleBranchFocusHighlight: vi.fn(), tepBannerVisible: false, setTepBannerVisible: vi.fn(), setTepBannerDismissed: vi.fn(), handleTepSwitchToWizard: vi.fn(), handleTepSimplifyGrid: vi.fn(), anticipatedFields: [], confirmAnticipatedField: vi.fn(), applyAnticipatoryPrefill: vi.fn(), handleGenerateUda: vi.fn(), compileProgPreviewText: () => '', handleTriggerGemSuggestion: vi.fn(), handleBack: vi.fn(), handleNext: vi.fn(), handleTabSwitch: vi.fn(), showToast,
      getDisciplineLabel: (value: string) => value,
    } as unknown as Parameters<typeof AppViewsLayer>[0];
    return <AppViewsLayer {...props} />;
  }
  return { ...render(<Surface />), repository, showToast };
}

describe('Beta B2 Planning to UDA runtime smoke', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurriculumStore.setState({ savedUda: [] });
  });

  it('creates, edits, saves, reopens, and edits the same UDA without duplicating it', async () => {
    const first = renderSurface();
    fireEvent.click(await screen.findByRole('button', { name: 'Continua Energia e territorio' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Materializza UDA' }));
    fireEvent.change(screen.getByLabelText('Obiettivi'), { target: { value: 'Comprendere i consumi\nArgomentare le scelte' } });
    fireEvent.change(screen.getByLabelText('Attività'), { target: { value: 'Mappa dei consumi\nDiscussione guidata' } });
    fireEvent.change(screen.getByLabelText('Valutazione'), { target: { value: 'Rubrica osservativa' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salva UDA' }));
    expect(first.showToast).toHaveBeenCalledWith('UDA salvata.', true);
    const saved = useCurriculumStore.getState().savedUda;
    expect(saved).toHaveLength(1);
    expect(saved[0].obiettivi).toEqual(['Comprendere i consumi', 'Argomentare le scelte']);
    first.unmount();

    await useCurriculumStore.persist.rehydrate();
    expect(useCurriculumStore.getState().savedUda).toHaveLength(1);
    const reopened = renderSurface(false);
    fireEvent.click(await screen.findByRole('button', { name: 'Apri UDA Energia e territorio' }));
    expect(screen.getByDisplayValue('Energia e territorio')).toBeInTheDocument();
    expect(screen.getByLabelText('Valutazione')).toHaveValue('Rubrica osservativa');
    const print = vi.fn();
    const write = vi.fn();
    vi.spyOn(window, 'open').mockReturnValue({ document: { write, close: vi.fn() }, print, close: vi.fn() } as unknown as Window);
    fireEvent.click(screen.getByRole('button', { name: 'Stampa / Salva PDF' }));
    expect(print).toHaveBeenCalledOnce();
    expect(write).toHaveBeenCalledWith(expect.stringContaining('Energia e territorio'));
    expect(write).toHaveBeenCalledWith(expect.stringContaining('Comprendere i consumi'));
    expect(write).toHaveBeenCalledWith(expect.stringContaining('Mappa dei consumi'));
    expect(write).toHaveBeenCalledWith(expect.stringContaining('Rubrica osservativa'));
    expect(reopened.showToast).toHaveBeenCalledWith('Stampa avviata. Salva il documento come PDF dalla finestra di stampa.', true);
    expect(useCurriculumStore.getState().savedUda).toHaveLength(1);
    await waitFor(() => expect(useCurriculumStore.getState().savedUda[0].id).toBe(saved[0].id));
  });
});
