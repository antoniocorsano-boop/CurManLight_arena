import { describe, expect, it } from 'vitest';
import {
  can,
  getCapabilities,
  requireCapability,
  resolveOperationalRole,
  type WorkspaceCapability,
  type WorkspaceRole,
} from '../domain/permissions';

const capabilities: WorkspaceCapability[] = [
  'workspace.view', 'workspace.configure', 'curriculum.consult', 'design.create',
  'document.create', 'document.preview', 'document.export', 'proposal.create',
  'document.review', 'department.consolidate', 'curriculum.validate', 'institution.validate',
];

const expected: Record<WorkspaceRole, Partial<Record<WorkspaceCapability, boolean>>> = {
  teacher: { 'workspace.view': true, 'curriculum.consult': true, 'design.create': true, 'document.create': true, 'document.preview': true, 'document.export': true, 'proposal.create': true },
  department_member: { 'workspace.view': true, 'curriculum.consult': true, 'design.create': true, 'document.create': true, 'document.preview': true, 'document.export': true, 'proposal.create': true, 'document.review': true, 'department.consolidate': true },
  department_coordinator: { 'workspace.view': true, 'curriculum.consult': true, 'design.create': true, 'document.create': true, 'document.preview': true, 'document.export': true, 'proposal.create': true, 'document.review': true, 'department.consolidate': true, 'curriculum.validate': true },
  curriculum_referent: { 'workspace.view': true, 'curriculum.consult': true, 'design.create': true, 'document.create': true, 'document.preview': true, 'document.export': true, 'proposal.create': true, 'document.review': true, 'department.consolidate': true, 'curriculum.validate': true },
  school_leader: { 'workspace.view': true, 'curriculum.consult': true, 'document.preview': true, 'document.export': true, 'document.review': true, 'curriculum.validate': true, 'institution.validate': true },
  workspace_admin: { 'workspace.view': true, 'workspace.configure': true, 'curriculum.consult': true, 'document.preview': true, 'document.export': true },
};

describe('CML-635B2 permission domain', () => {
  it.each(Object.entries(expected).flatMap(([role, grants]) => capabilities.map(capability => [role, capability, grants[capability] ?? false] as const)))('matches B1 matrix for %s/%s', (role, capability, granted) => {
    expect(can(role as WorkspaceRole, capability)).toBe(granted);
  });

  it('maps declared roles conservatively', () => {
    expect(resolveOperationalRole('docente')).toEqual({ status: 'resolved', role: 'teacher', trust: 'self-declared' });
    expect(resolveOperationalRole('dipartimento')).toEqual({ status: 'resolved', role: 'department_member', trust: 'self-declared' });
    expect(resolveOperationalRole('dipartimento')).not.toEqual(expect.objectContaining({ role: 'department_coordinator' }));
    expect(resolveOperationalRole('referente').status).toBe('resolved');
    expect(resolveOperationalRole('dirigente').status).toBe('resolved');
    expect(resolveOperationalRole('amministratore').status).toBe('resolved');
    expect(resolveOperationalRole('collegio')).toEqual({ status: 'unknown', declaredRole: 'collegio', trust: 'unknown' });
    expect(resolveOperationalRole(undefined)).toEqual({ status: 'neutral', trust: 'unknown' });
    expect(resolveOperationalRole('non-dichiarato')).toEqual({ status: 'neutral', trust: 'unknown' });
    expect(resolveOperationalRole('future-role')).toEqual({ status: 'unknown', declaredRole: 'future-role', trust: 'unknown' });
  });

  it('returns stable readonly capability views', () => {
    const first = getCapabilities('workspace_admin');
    const second = getCapabilities('workspace_admin');
    expect(first).toBe(second);
    expect(first).toEqual(['workspace.view', 'workspace.configure', 'curriculum.consult', 'document.preview', 'document.export']);
  });

  it('denies neutral and unknown without effects', () => {
    for (const resolution of [resolveOperationalRole(undefined), resolveOperationalRole('future-role')]) {
      expect(requireCapability(resolution, 'document.export')).toEqual({ ok: false, reason: 'CAPABILITY_NOT_GRANTED', requiredCapability: 'document.export', resolution });
    }
  });
});
