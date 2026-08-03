import { describe, expect, it } from 'vitest';
import type { EntityId } from '../domain/curriculum/identity';
import {
  createWorkspaceIdentity,
  deserializeWorkspaceIdentity,
  removeDeclaredActor,
  serializeWorkspaceIdentity,
  updateDeclaredRole,
  updateWorkspaceAcademicYear,
  updateWorkspaceOperatingMode,
  updateWorkspaceSite,
  validateWorkspaceIdentity,
  type WorkspaceIdentity,
} from '../domain/institution';

const instituteRef = { id: 'a635a001' as EntityId, entityType: 'institute' as const, snapshotLabel: 'Istituto locale' };
const siteRef = { id: 'a635a002' as EntityId, entityType: 'institute-site' as const, snapshotLabel: 'Sede centrale' };
const yearRef = { id: 'a635a003' as EntityId, entityType: 'academic-year' as const, snapshotLabel: '2026/2027' };
const actor = { displayName: 'Docente locale', role: 'docente' as const, assertion: 'self-declared' as const };
const NOW = '2026-08-03T00:00:00.000Z';

function validIdentity(overrides: Partial<Parameters<typeof createWorkspaceIdentity>[0]> = {}): WorkspaceIdentity {
  return createWorkspaceIdentity({
    institutionRef: instituteRef,
    academicYearRef: yearRef,
    operatingMode: 'institutional-local',
    ...overrides,
  }, NOW);
}

describe('CML-635A1 WorkspaceIdentity domain model', () => {
  it('creates a canonical identity with optional site and actor', () => {
    const identity = validIdentity({ activeSiteRef: siteRef, declaredActor: actor, declaredRole: 'docente' });

    expect(identity.id).toBe(identity.metadata.id);
    expect(identity.id).not.toBe(instituteRef.id);
    expect(identity.institutionRef).toEqual(instituteRef);
    expect(identity.academicYearRef).toEqual(yearRef);
    expect(identity.operatingMode).toBe('institutional-local');
    expect(identity.metadata.origin).toBe('teacher');
  });

  it('accepts every closed operating mode without adding a permission role', () => {
    for (const operatingMode of ['public-consultation', 'personal-local', 'institutional-local'] as const) {
      const identity = validIdentity({ operatingMode });
      expect(validateWorkspaceIdentity(identity).valid).toBe(true);
      expect(identity).not.toHaveProperty('permissions');
      expect(identity).not.toHaveProperty('capabilities');
    }
  });

  it('rejects missing institution, invalid academic year references and arbitrary modes', () => {
    const missingInstitution = { ...validIdentity(), institutionRef: undefined };
    const invalidYear = { ...validIdentity(), academicYearRef: { id: 'bad' as EntityId, entityType: 'academic-year' as const } };
    const invalidMode = { ...validIdentity(), operatingMode: 'remote' as never };

    expect(validateWorkspaceIdentity(missingInstitution).errors.map(error => error.code)).toContain('WORKSPACE_INSTITUTION_REQUIRED');
    expect(validateWorkspaceIdentity(invalidYear).errors.map(error => error.code)).toContain('WORKSPACE_ACADEMIC_YEAR_INVALID');
    expect(validateWorkspaceIdentity(invalidMode).errors.map(error => error.code)).toContain('WORKSPACE_OPERATING_MODE_INVALID');
  });

  it('allows a missing site and actor but rejects malformed declared role', () => {
    const withoutOptionals = validIdentity();
    const malformedRole = { ...withoutOptionals, declaredRole: 'administrator' as never };

    expect(validateWorkspaceIdentity(withoutOptionals).valid).toBe(true);
    expect(validateWorkspaceIdentity(malformedRole).errors.map(error => error.code)).toContain('WORKSPACE_DECLARED_ROLE_INVALID');
  });

  it('updates fields immutably while preserving identity and creation metadata', () => {
    const original = validIdentity({ activeSiteRef: siteRef, declaredActor: actor, declaredRole: 'docente' });
    const changedYear = updateWorkspaceAcademicYear(original, { ...yearRef, snapshotLabel: '2027/2028' }, '2026-08-04T00:00:00.000Z');
    const changedSite = updateWorkspaceSite(changedYear, undefined, '2026-08-05T00:00:00.000Z');
    const withoutActor = removeDeclaredActor(changedSite, '2026-08-06T00:00:00.000Z');
    const changedRole = updateDeclaredRole(withoutActor, 'referente', '2026-08-07T00:00:00.000Z');
    const personal = updateWorkspaceOperatingMode(changedRole, 'personal-local', '2026-08-08T00:00:00.000Z');

    expect(original.activeSiteRef).toEqual(siteRef);
    expect(original.academicYearRef).toEqual(yearRef);
    expect(original.declaredActor).toEqual(actor);
    expect(changedYear.id).toBe(original.id);
    expect(changedYear.metadata.createdAt).toBe(NOW);
    expect(personal.operatingMode).toBe('personal-local');
    expect(personal.activeSiteRef).toBeUndefined();
    expect(personal.declaredActor).toBeUndefined();
    expect(personal.declaredRole).toBe('referente');
    expect(personal.metadata.updatedAt).toBe('2026-08-08T00:00:00.000Z');
  });

  it('serializes and deserializes a valid identity without changing its shape', () => {
    const identity = validIdentity({ activeSiteRef: siteRef, declaredActor: actor, declaredRole: 'docente' });
    const json = serializeWorkspaceIdentity(identity);
    const restored = deserializeWorkspaceIdentity(json);

    expect(restored.success).toBe(true);
    expect(restored.data).toEqual(identity);
  });

  it('rejects serialized identities that contain authorization concepts', () => {
    const identity = validIdentity();
    const serialized = JSON.stringify({ ...identity, permissions: ['write'] });
    const restored = deserializeWorkspaceIdentity(serialized);

    expect(restored.success).toBe(false);
    expect(restored.errors.map(error => error.code)).toContain('WORKSPACE_DECLARED_ROLE_INVALID');
  });
});
