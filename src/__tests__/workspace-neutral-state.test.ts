import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useWorkspaceState } from '../features/workspace';

describe('CML-633D Task 10 neutral workspace state', () => {
  beforeEach(() => localStorage.clear());

  it('starts without a presumed school account or fake email', () => {
    const { result } = renderHook(() => useWorkspaceState());

    expect(result.current.cloudAccountType).toBe('personale');
    expect(result.current.workspaceUserEmail).toBe('');
    expect(result.current.personalUserEmail).toBe('');
  });

  it('still reads an explicitly selected persisted account mode', () => {
    localStorage.setItem('curman_cloudAccountType', 'scolastica');
    const { result } = renderHook(() => useWorkspaceState());
    act(() => result.current.setWorkspaceUserEmail('utente@scuola.edu.it'));
    expect(result.current.cloudAccountType).toBe('scolastica');
    expect(result.current.workspaceUserEmail).toBe('utente@scuola.edu.it');
  });
});
