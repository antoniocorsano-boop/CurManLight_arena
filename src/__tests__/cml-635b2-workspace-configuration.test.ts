import { describe, expect, it, vi } from 'vitest';
import { createWorkspaceIdentity } from '../domain/institution';
import type { EntityId } from '../domain/curriculum/identity';
import { resolveOperationalRole } from '../domain/permissions';
import { configureWorkspace, resetWorkspaceConfiguration } from '../features/session/services/workspaceConfiguration';

const identity = () => createWorkspaceIdentity({
  institutionRef: { id: 'a635a001' as EntityId, entityType: 'institute', snapshotLabel: 'Istituto locale' },
  academicYearRef: { id: 'a635a003' as EntityId, entityType: 'academic-year', snapshotLabel: '2026/2027' },
  declaredRole: 'amministratore',
  operatingMode: 'institutional-local',
}, '2026-08-03T00:00:00.000Z');

describe('CML-635B2 workspace configuration command', () => {
  it('allows BOOTSTRAP_LOCAL only when identity is absent', () => {
    const set = vi.fn();
    const result = configureWorkspace(resolveOperationalRole(undefined), identity(), { currentIdentity: undefined }, { setWorkspaceIdentity: set, resetWorkspaceIdentity: vi.fn() });
    expect(result.ok).toBe(true);
    expect(set).toHaveBeenCalledTimes(1);
  });

  it('requires workspace.configure after bootstrap', () => {
    const set = vi.fn();
    const result = configureWorkspace(resolveOperationalRole('docente'), identity(), { currentIdentity: identity() }, { setWorkspaceIdentity: set, resetWorkspaceIdentity: vi.fn() });
    expect(result).toMatchObject({ ok: false, reason: 'CAPABILITY_NOT_GRANTED' });
    expect(set).not.toHaveBeenCalled();
  });

  it('allows configured admin save and reset', () => {
    const set = vi.fn();
    const reset = vi.fn();
    const resolution = resolveOperationalRole('amministratore');
    expect(configureWorkspace(resolution, identity(), { currentIdentity: identity() }, { setWorkspaceIdentity: set, resetWorkspaceIdentity: reset }).ok).toBe(true);
    expect(resetWorkspaceConfiguration(resolution, { currentIdentity: identity() }, { setWorkspaceIdentity: set, resetWorkspaceIdentity: reset }).ok).toBe(true);
    expect(set).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('keeps an empty reset a no-op without granting capability', () => {
    const reset = vi.fn();
    const result = resetWorkspaceConfiguration(resolveOperationalRole(undefined), { currentIdentity: undefined }, { setWorkspaceIdentity: vi.fn(), resetWorkspaceIdentity: reset });
    expect(result).toEqual({ ok: true, value: undefined });
    expect(reset).not.toHaveBeenCalled();
  });
});
