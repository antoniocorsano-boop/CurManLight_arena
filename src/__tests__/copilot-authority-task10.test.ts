import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCopilotInteractionHandlers } from '../features/copilot/hooks/useCopilotInteractionHandlers';

function args(activeTab: string) {
  return {
    activeTab, activeProgTab: '', detectedDeviceType: 'desktop' as const, discipline: 'italiano', order: 'primaria' as const,
    getDisciplineLabel: (disc: string) => disc, setProgTitle: vi.fn(), setRealTaskInput: vi.fn(), setProgNotes: vi.fn(),
    selectedStudentForFeedback: null, classroomStudentFeedback: [], setClassroomStudentFeedback: vi.fn(), setSelectedStudentForFeedback: vi.fn(), showToast: vi.fn(),
  };
}

describe('CML-633D Task 10 Copilot authority boundaries', () => {
  afterEach(() => vi.useRealTimers());

  it.each([
    ['dashboard', 'priorità pdm'],
    ['curricolo', 'scadenza linee guida'],
    ['revisione', 'raccordo verticale'],
  ])('returns generic non-verified assistance for %s context', (activeTab, query) => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCopilotInteractionHandlers(args(activeTab)));
    act(() => result.current.handleSendCopilotMessage(query));
    act(() => vi.advanceTimersByTime(1000));
    const response = result.current.copilotChatHistory[result.current.copilotChatHistory.length - 1].text;
    expect(response).toMatch(/suggerimento|spunto|non verificat|contesto locale/i);
    expect(response).not.toMatch(/PdM.*d.Istituto|15%|settembre 2026|obbligatorie|Curricolo d.Istituto|protocollo d.Istituto|forma protetta/i);
  });
});
