import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppViewsLayer } from '../features/session/components/AppViewsLayer';
import { createDidacticPlanning } from '../domain/planning';
import { createLocalDidacticPlanningRepository } from '../lib/didacticPlanningRepository';
import { useCurriculumStore } from '../store/useCurriculumStore';

const planning = createDidacticPlanning({
  id: 'b1-ui-planning',
  context: { schoolOrder: 'secondaria', discipline: 'tecnologia', classLabel: '2A' },
  content: {
    title: 'Energia e territorio',
    period: 'Primo quadrimestre',
    hours: 12,
    objectives: ['Comprendere i consumi'],
    activities: ['Mappa dei consumi', 'Discussione guidata'],
    assessment: [],
    materials: [],
  },
  status: 'in_progress',
});

function renderPlanningSurface(seed = true) {
  const setActiveProgTab = vi.fn();
  const showToast = vi.fn();
  const repository = createLocalDidacticPlanningRepository(localStorage);
  if (seed) {
    repository.save(planning);
    localStorage.setItem('curman_canonical_planning_id', planning.id);
  }

  function Surface() {
    const [activeProgTab, setActiveProgTabState] = useState<'home' | 'annuale'>('home');
    const [progettazioneMode, setProgettazioneMode] = useState<'grid' | 'wizard'>('grid');
    const [progTitle, setProgTitle] = useState('');
    const [progPeriod, setProgPeriod] = useState('');
    const [progHours, setProgHours] = useState(0);
    const [progNotes, setProgNotes] = useState('');
    const [realTaskInput, setRealTaskInput] = useState('');
    const [targetClass, setTargetClass] = useState('2A');
    const [progStatus, setProgStatus] = useState<'bozza'>('bozza');
    const props = {
    activeTab: 'progetta-annuale',
    activeProgTab,
    role: 'insegnante',
    savedUda: [],
    decisions: {},
    discipline: 'tecnologia',
    order: 'secondaria',
    localCurriculum: {},
    targetClass,
    targetSection: '',
    progTitle,
    progPeriod,
    progHours,
    progStatus,
    progNotes,
    realTaskInput,
    designArchive: undefined,
    setActiveProgTab: (tab: 'home' | 'annuale') => {
      setActiveProgTabState(tab);
      setActiveProgTab(tab);
      useCurriculumStore.setState({ activeProgTab: tab });
    },
    progettazioneMode,
    setProgettazioneMode,
    setProgTitle,
    setProgPeriod,
    setProgHours,
    setProgStatus,
    setProgNotes,
    setRealTaskInput,
    setTargetClass,
    setTargetSection: vi.fn(),
    wizardStep: 1,
    setWizardStep: vi.fn(),
    assignedCombinations: [],
    progCoAuthors: '',
    setProgCoAuthors: vi.fn(),
    branchFocusHighlight: false,
    toggleBranchFocusHighlight: vi.fn(),
    tepBannerVisible: false,
    setTepBannerVisible: vi.fn(),
    setTepBannerDismissed: vi.fn(),
    handleTepSwitchToWizard: vi.fn(),
    handleTepSimplifyGrid: vi.fn(),
    anticipatedFields: [],
    confirmAnticipatedField: vi.fn(),
    applyAnticipatoryPrefill: vi.fn(),
    handleGenerateUda: vi.fn(),
    compileProgPreviewText: () => '',
    handleTriggerGemSuggestion: vi.fn(),
    handleBack: vi.fn(),
    handleNext: vi.fn(),
    handleTabSwitch: vi.fn(),
    showToast,
    getDisciplineLabel: (value: string) => value,
    } as never;
    return <AppViewsLayer {...props} />;
  }

  return { ...render(<Surface />), setActiveProgTab, showToast, repository };
}

describe('Beta B1 planning continuity UI', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reopens the same persisted Planning from the catalogue after a remount', async () => {
    const first = renderPlanningSurface();
    expect(await screen.findByRole('button', { name: 'Continua Energia e territorio' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continua Energia e territorio' }));
    expect(first.setActiveProgTab).toHaveBeenCalledWith('annuale');
    expect(await screen.findByRole('button', { name: 'Salva Bozza' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salva Bozza' }));
    expect(first.showToast).toHaveBeenCalledWith('Planning salvato.', true);
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'Mappa aggiornata' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salva Bozza' }));
    expect(first.repository.get(planning.id)?.content.activities).toEqual([
      'Mappa aggiornata',
      'Discussione guidata',
    ]);
    first.unmount();

    const second = renderPlanningSurface(false);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Continua Energia e territorio' })).toBeInTheDocument());
    expect(screen.getAllByText('Energia e territorio')).not.toHaveLength(0);
    expect(second.repository.get(planning.id)?.content.activities).toEqual([
      'Mappa aggiornata',
      'Discussione guidata',
    ]);
  });
});
