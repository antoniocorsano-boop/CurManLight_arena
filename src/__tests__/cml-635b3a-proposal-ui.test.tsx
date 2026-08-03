import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { RevisioneTab } from '../features/curriculum/components/RevisioneTab';

const mocked = vi.hoisted(() => ({
  state: {
    workspaceIdentity: { declaredRole: 'docente' },
    revisionArchive: { schemaVersion: 1, updatedAt: '2026-08-03T10:00:00.000Z', proposals: [], versions: [], decisions: [], effects: [], events: [] },
    decisions: {},
    customTexts: {},
    activeRevisionFilter: 'all',
    replaceRevisionArchive: vi.fn(),
    setActiveRevisionFilter: vi.fn(),
    setDecision: vi.fn(),
    resetDecision: vi.fn(),
    setCustomText: vi.fn(),
  },
}));

vi.mock('../store/useCurriculumStore', () => ({
  useCurriculumStore: Object.assign(
    (selector?: (state: typeof mocked.state) => unknown) => selector ? selector(mocked.state) : mocked.state,
    { getState: () => mocked.state },
  ),
}));

function renderTab() {
  return render(
    <RevisioneTab
      currentDisciplineProps={[]}
      currentDisciplineDecided={0}
      revisioneMode="list"
      setRevisioneMode={vi.fn()}
      revisioneWizardIndex={0}
      setRevisioneWizardIndex={vi.fn()}
    />,
  );
}

describe('CML-635B3A proposal UI boundary', () => {
  beforeEach(() => {
    mocked.state.workspaceIdentity = { declaredRole: 'docente' };
    mocked.state.replaceRevisionArchive.mockReset();
  });

  it('creates a local draft through the guarded command for an allowed role', () => {
    renderTab();

    fireEvent.change(screen.getByLabelText('Nodo o ambito'), { target: { value: 'Nodo 1' } });
    fireEvent.change(screen.getByLabelText('Testo vigente'), { target: { value: 'Testo vigente' } });
    fireEvent.change(screen.getByLabelText('Testo proposto'), { target: { value: 'Testo proposto' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crea bozza locale' }));

    expect(mocked.state.replaceRevisionArchive).toHaveBeenCalledTimes(1);
    expect(mocked.state.replaceRevisionArchive.mock.calls[0][0].proposals[0].status).toBe('draft');
  });

  it('disables creation and explains the denial for an unknown role', () => {
    mocked.state.workspaceIdentity = { declaredRole: 'future-role' };
    renderTab();

    const button = screen.getByRole('button', { name: 'Crea bozza locale' });
    expect(button).toBeDisabled();
    expect(screen.getByText(/ruolo attivo non è riconosciuto/i)).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-describedby', 'proposal-create-help');
    expect(mocked.state.replaceRevisionArchive).not.toHaveBeenCalled();
  });
});
