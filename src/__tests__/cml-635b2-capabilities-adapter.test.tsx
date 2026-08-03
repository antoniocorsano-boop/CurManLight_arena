import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { createWorkspaceIdentity } from '../domain/institution';
import type { EntityId } from '../domain/curriculum/identity';
import { deriveWorkspaceCapabilities, useWorkspaceCapabilities } from '../features/session/hooks/useWorkspaceCapabilities';

const adminIdentity = () => createWorkspaceIdentity({
  institutionRef: { id: 'a635a001' as EntityId, entityType: 'institute', snapshotLabel: 'Istituto locale' },
  academicYearRef: { id: 'a635a003' as EntityId, entityType: 'academic-year', snapshotLabel: '2026/2027' },
  declaredRole: 'amministratore',
  operatingMode: 'institutional-local',
});

describe('CML-635B2 workspace capability adapter', () => {
  it('derives neutral state without persistence', () => {
    const readModel = deriveWorkspaceCapabilities(undefined);
    expect(readModel.resolution).toEqual({ status: 'neutral', trust: 'unknown' });
    expect(readModel.can('document.preview')).toBe(false);
    expect(readModel.capabilities).toEqual([]);
  });

  it('derives configured capabilities from workspaceIdentity only', () => {
    const readModel = deriveWorkspaceCapabilities(adminIdentity());
    expect(readModel.resolution).toEqual({ status: 'resolved', role: 'workspace_admin', trust: 'self-declared' });
    expect(readModel.can('workspace.configure')).toBe(true);
    expect(readModel.can('design.create')).toBe(false);
  });

  it('updates immediately after role changes and reset', () => {
    const original = useCurriculumStore.getState().workspaceIdentity;
    const { result } = renderHook(() => useWorkspaceCapabilities());
    act(() => useCurriculumStore.getState().setWorkspaceIdentity(adminIdentity()));
    expect(result.current.can('workspace.configure')).toBe(true);
    act(() => useCurriculumStore.getState().resetWorkspaceIdentity());
    expect(result.current.resolution.status).toBe('neutral');
    act(() => original ? useCurriculumStore.getState().setWorkspaceIdentity(original) : useCurriculumStore.getState().resetWorkspaceIdentity());
  });

  it('does not call setters or create authorization state', () => {
    const before = useCurriculumStore.getState();
    deriveWorkspaceCapabilities(before.workspaceIdentity);
    const after = useCurriculumStore.getState();
    expect(after.workspaceIdentity).toEqual(before.workspaceIdentity);
    expect('permissions' in after).toBe(false);
    expect('capabilities' in after).toBe(false);
  });
});
