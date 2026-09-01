import { describe, expect, it } from 'vitest';
import { canonicalAdoptionBindingMaterial, fingerprintInstitutionalAdoptionBinding } from '../domain/revision/adoptionBinding';

const material = () => ({
  workspaceId: '11111111-1111-4111-8111-111111111111',
  proposalRef: 'proposal-1',
  proposalVersionRef: 'proposal-version-2',
  proposalVersionFingerprint: 'a'.repeat(64),
  targetNodeRef: 'node-17',
  baseCurriculumVersionRef: 'curriculum-v4',
});

describe('R7A2 institutional adoption binding v2', () => {
  it('is deterministic and SHA-256 shaped', async () => {
    const first = await fingerprintInstitutionalAdoptionBinding(material());
    const second = await fingerprintInstitutionalAdoptionBinding(material());
    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it('changes when target node changes', async () => {
    const first = await fingerprintInstitutionalAdoptionBinding(material());
    const second = await fingerprintInstitutionalAdoptionBinding({ ...material(), targetNodeRef: 'node-18' });
    expect(first).not.toBe(second);
  });

  it('changes when base curriculum version changes', async () => {
    const first = await fingerprintInstitutionalAdoptionBinding(material());
    const second = await fingerprintInstitutionalAdoptionBinding({ ...material(), baseCurriculumVersionRef: 'curriculum-v5' });
    expect(first).not.toBe(second);
  });

  it('normalizes the proposal fingerprint to lowercase', () => {
    const lower = canonicalAdoptionBindingMaterial(material());
    const upper = canonicalAdoptionBindingMaterial({ ...material(), proposalVersionFingerprint: 'A'.repeat(64) });
    expect(lower).toBe(upper);
  });

  it('rejects the field separator to keep canonical material unambiguous', () => {
    expect(() => canonicalAdoptionBindingMaterial({ ...material(), targetNodeRef: 'node\u001fother' })).toThrow(/separatore non ammesso/i);
  });
});
