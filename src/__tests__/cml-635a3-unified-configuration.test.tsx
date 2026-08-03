import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TeacherProfileDraft } from '../features/session/hooks/useOnboardingProfile';
import { TeacherProfileConfigPanel } from '../features/session/components/TeacherProfileConfigPanel';

const baseProfile: TeacherProfileDraft = {
  teacherType: 'comune',
  isSostegno: false,
  order: 'secondaria',
  discipline: 'italiano',
  assignedClasses: [],
  availableSections: [],
  assignedCombinations: [],
};

const renderPanel = (profile: TeacherProfileDraft = baseProfile, onSave = vi.fn(), onReset = vi.fn()) => render(
  <TeacherProfileConfigPanel
    profile={profile}
    localCurriculum={{ italiano: { secondaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] } }, matematica: { secondaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] } } } as never}
    getDisciplineLabel={value => value}
    onSave={onSave}
    onReset={onReset}
  />
);

describe('CML-635A3 unified teacher profile configuration', () => {
  beforeEach(() => localStorage.clear());

  it('shows a neutral state without implicit classes or sections', () => {
    renderPanel();

    expect(screen.getByRole('heading', { name: 'Profilo docente' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/non configurato/i);
    expect(screen.getByText(/nessuna classe o sezione/i)).toBeInTheDocument();
  });

  it('shows existing profile values without introducing migration', () => {
    renderPanel({
      ...baseProfile,
      isSostegno: true,
      assignedClasses: ['1', '2'],
      availableSections: ['A', 'B'],
      assignedCombinations: ['1^A', '2^B'],
    });

    expect(screen.getByRole('checkbox', { name: /sostegno/i })).toBeChecked();
    expect(screen.getByDisplayValue('1^A, 2^B')).toBeInTheDocument();
  });

  it('keeps edits temporary until the profile save action', () => {
    const onSave = vi.fn();
    renderPanel(baseProfile, onSave);

    fireEvent.change(screen.getByLabelText(/disciplina/i), { target: { value: 'matematica' } });
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /salva profilo/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ discipline: 'matematica' }));
  });

  it('resets only the teacher profile section', () => {
    const onReset = vi.fn();
    renderPanel({ ...baseProfile, assignedCombinations: ['1^A'] }, vi.fn(), onReset);

    fireEvent.click(screen.getByRole('button', { name: /ripristina profilo/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('does not vary controls based on declared institutional roles', () => {
    renderPanel();

    expect(screen.getByRole('button', { name: /salva profilo/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /ripristina profilo/i })).toBeEnabled();
  });
});
