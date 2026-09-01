export interface InstitutionalAdoptionBindingV2 {
  version: 2;
  targetNodeRef: string;
  baseCurriculumVersionRef: string;
  bindingFingerprint: string;
}

export interface InstitutionalAdoptionBindingMaterial {
  workspaceId: string;
  proposalRef: string;
  proposalVersionRef: string;
  proposalVersionFingerprint: string;
  targetNodeRef: string;
  baseCurriculumVersionRef: string;
}

const BINDING_PREFIX = 'CML_ARENA_ADOPTION_BINDING_V2';
const FIELD_SEPARATOR = '\u001f';

const assertBindingField = (name: string, value: string): string => {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${name} è obbligatorio per il binding di adozione.`);
  if (normalized.includes(FIELD_SEPARATOR)) {
    throw new Error(`${name} contiene un separatore non ammesso nel binding di adozione.`);
  }
  return normalized;
};

export const canonicalAdoptionBindingMaterial = (
  material: InstitutionalAdoptionBindingMaterial,
): string => [
  BINDING_PREFIX,
  assertBindingField('workspaceId', material.workspaceId),
  assertBindingField('proposalRef', material.proposalRef),
  assertBindingField('proposalVersionRef', material.proposalVersionRef),
  assertBindingField('proposalVersionFingerprint', material.proposalVersionFingerprint).toLowerCase(),
  assertBindingField('targetNodeRef', material.targetNodeRef),
  assertBindingField('baseCurriculumVersionRef', material.baseCurriculumVersionRef),
].join(FIELD_SEPARATOR);

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');

/**
 * Fingerprint used by decision receipt v2 to bind the frozen proposal version
 * to the exact target node and base curriculum version that may later be
 * adopted. This is separate from the proposal-version fingerprint itself.
 */
export const fingerprintInstitutionalAdoptionBinding = async (
  material: InstitutionalAdoptionBindingMaterial,
): Promise<string> => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('SHA-256 non disponibile nel contesto corrente.');
  }
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalAdoptionBindingMaterial(material)),
  );
  return toHex(digest);
};
