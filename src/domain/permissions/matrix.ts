import type { WorkspaceCapability, WorkspaceRole } from './types';

const all = (...capabilities: WorkspaceCapability[]) => Object.freeze(capabilities);

export const ROLE_CAPABILITIES: Readonly<Record<WorkspaceRole, readonly WorkspaceCapability[]>> = Object.freeze({
  teacher: all('workspace.view', 'curriculum.consult', 'design.create', 'document.create', 'document.preview', 'document.export', 'proposal.create'),
  department_member: all('workspace.view', 'curriculum.consult', 'design.create', 'document.create', 'document.preview', 'document.export', 'proposal.create', 'document.review', 'department.consolidate'),
  department_coordinator: all('workspace.view', 'curriculum.consult', 'design.create', 'document.create', 'document.preview', 'document.export', 'proposal.create', 'document.review', 'department.consolidate', 'curriculum.validate'),
  curriculum_referent: all('workspace.view', 'curriculum.consult', 'design.create', 'document.create', 'document.preview', 'document.export', 'proposal.create', 'document.review', 'department.consolidate', 'curriculum.validate'),
  school_leader: all('workspace.view', 'curriculum.consult', 'document.preview', 'document.export', 'document.review', 'curriculum.validate', 'institution.validate'),
  workspace_admin: all('workspace.view', 'workspace.configure', 'curriculum.consult', 'document.preview', 'document.export'),
});

export function can(role: WorkspaceRole, capability: WorkspaceCapability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}

export function getCapabilities(role: WorkspaceRole): readonly WorkspaceCapability[] {
  return ROLE_CAPABILITIES[role];
}
