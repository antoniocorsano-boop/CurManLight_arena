import type { EntityReference } from '../curriculum/identity';
import { isValidEntityReference } from '../curriculum/identity/validators';

export type InstitutionalDecisionQualificationStatus = 'unverified' | 'qualified' | 'rejected';

export interface InstitutionalDecisionQualification {
  decisionRef: EntityReference;
  authorityRef: EntityReference;
  status: InstitutionalDecisionQualificationStatus;
  validationRef?: EntityReference;
  validatedAt?: string;
}

export interface InstitutionalDecisionQualificationValidation {
  valid: boolean;
  errors: string[];
}

function parseCanonicalDate(value: unknown): number | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return date.getTime();
}

export function validateInstitutionalDecisionQualification(
  value: unknown,
  expectedDecisionRef?: EntityReference,
): InstitutionalDecisionQualificationValidation {
  const errors: string[] = [];
  if (!value || typeof value !== 'object') return { valid: false, errors: ['Qualification must be an object.'] };
  const candidate = value as Partial<InstitutionalDecisionQualification>;
  if (!isValidEntityReference(candidate.decisionRef) || candidate.decisionRef.entityType !== 'decision') {
    errors.push('Qualification decisionRef is invalid.');
  }
  if (!isValidEntityReference(candidate.authorityRef)) {
    errors.push('Qualification authorityRef is invalid.');
  }
  if (expectedDecisionRef && (!isValidEntityReference(candidate.decisionRef) || candidate.decisionRef.id !== expectedDecisionRef.id)) {
    errors.push('Qualification does not reference the requested decision.');
  }
  if (candidate.status !== 'qualified') {
    errors.push('Only qualified institutional decisions can feed the version bridge.');
  }
  if (!isValidEntityReference(candidate.validationRef)) {
    errors.push('Qualification validationRef is invalid.');
  }
  if (parseCanonicalDate(candidate.validatedAt) === undefined) {
    errors.push('Qualification validatedAt must be a valid YYYY-MM-DD date.');
  }
  return { valid: errors.length === 0, errors };
}

export function isInstitutionalDecisionQualification(value: unknown): value is InstitutionalDecisionQualification {
  return validateInstitutionalDecisionQualification(value).valid;
}

export function createInstitutionalDecisionQualification(
  input: InstitutionalDecisionQualification,
): InstitutionalDecisionQualification {
  const validation = validateInstitutionalDecisionQualification(input);
  if (!validation.valid) throw new Error(validation.errors.join(' '));
  return {
    decisionRef: { ...input.decisionRef },
    authorityRef: { ...input.authorityRef },
    status: 'qualified',
    validationRef: { ...input.validationRef! },
    validatedAt: input.validatedAt,
  };
}
