import type { Source, SourceVersion } from './types';

/**
 * CML-DRIVE-01 — governance orthogonal to the technical Source lifecycle.
 *
 * Source/SourceVersion remain the canonical curriculum source entities.
 * This module records verification, authority, contextual validity and
 * provenance without deriving any of them from a physical provider/location.
 */

export type SourceAuthorityLevel =
  | 'personal'
  | 'internal'
  | 'institutional'
  | 'normative';

export type SourceVerificationStatus =
  | 'imported'
  | 'identified'
  | 'verified'
  | 'rejected';

export interface SourceValidityScope {
  /** Explicit users for personal/contextual material. Empty/undefined = unrestricted on this dimension. */
  userIds?: readonly string[];
  /** Explicit institutions. Empty/undefined = unrestricted on this dimension. */
  instituteIds?: readonly string[];
  schoolOrders?: readonly string[];
  disciplines?: readonly string[];
  /** Inclusive ISO calendar date (YYYY-MM-DD). */
  validFrom?: string;
  /** Inclusive ISO calendar date (YYYY-MM-DD). */
  validTo?: string;
}

export type SourceOriginKind =
  | 'local-upload'
  | 'institutional-import'
  | 'normative-registry'
  | 'legacy-migration'
  | 'system-import';

export interface SourceProvenanceRecord {
  originKind: SourceOriginKind;
  /** Human/system principal that registered the provenance claim. */
  assertedBy?: string;
  /** Required when verificationStatus=verified. */
  verifiedBy?: string;
  /** Required when verificationStatus=verified. ISO timestamp. */
  verifiedAt?: string;
  /** Optional provider-neutral locator/evidence reference. Never grants authority. */
  evidenceRef?: string;
  notes?: string;
}

export interface SourceGovernanceRecord {
  sourceId: Source['id'];
  sourceVersionId: SourceVersion['id'];
  /** SHA-256 hex fingerprint of the exact source-version payload used by Arena. */
  versionFingerprint: string;
  authorityLevel: SourceAuthorityLevel;
  verificationStatus: SourceVerificationStatus;
  validFor: SourceValidityScope;
  provenance: SourceProvenanceRecord;
}

export interface SourceUsageContext {
  /** ISO calendar date (YYYY-MM-DD), supplied explicitly for deterministic evaluation. */
  at: string;
  userId?: string;
  instituteId?: string;
  schoolOrder?: string;
  discipline?: string;
}

export interface SourceGovernanceValidationResult {
  valid: boolean;
  errors: readonly string[];
}

export interface DerivedKnowledgeSourceRef {
  sourceId: Source['id'];
  sourceVersionId: SourceVersion['id'];
  /** Fingerprint copied from the governance record to detect stale derivations. */
  sourceVersionFingerprint: string;
  /** Optional page/section/chunk/evidence locator inside that exact version. */
  evidenceRef?: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SHA256_HEX = /^[0-9a-f]{64}$/;

function matchesScopedValue(values: readonly string[] | undefined, actual: string | undefined): boolean {
  if (!values || values.length === 0) return true;
  return Boolean(actual && values.includes(actual));
}

function isValidIsoDate(value: string | undefined): boolean {
  return value === undefined || ISO_DATE.test(value);
}

export function validateSourceGovernance(record: SourceGovernanceRecord): SourceGovernanceValidationResult {
  const errors: string[] = [];

  if (!SHA256_HEX.test(record.versionFingerprint)) {
    errors.push('SOURCE_VERSION_FINGERPRINT_INVALID');
  }

  if (!isValidIsoDate(record.validFor.validFrom) || !isValidIsoDate(record.validFor.validTo)) {
    errors.push('SOURCE_VALIDITY_DATE_INVALID');
  }

  if (
    record.validFor.validFrom
    && record.validFor.validTo
    && record.validFor.validFrom > record.validFor.validTo
  ) {
    errors.push('SOURCE_VALIDITY_INTERVAL_INVALID');
  }

  if (record.authorityLevel === 'personal' && !record.validFor.userIds?.length) {
    errors.push('PERSONAL_SOURCE_REQUIRES_USER_SCOPE');
  }

  if (
    (record.authorityLevel === 'internal' || record.authorityLevel === 'institutional')
    && !record.validFor.instituteIds?.length
  ) {
    errors.push('INSTITUTE_SOURCE_REQUIRES_INSTITUTE_SCOPE');
  }

  if (record.verificationStatus === 'verified') {
    if (!record.provenance.verifiedBy?.trim()) {
      errors.push('VERIFIED_SOURCE_REQUIRES_VERIFIER');
    }
    if (!record.provenance.verifiedAt?.trim()) {
      errors.push('VERIFIED_SOURCE_REQUIRES_VERIFIED_AT');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * A source is usable only when the exact active SourceVersion is verified and
 * valid for the supplied context. Physical location/provider is intentionally
 * absent from this decision.
 */
export function isSourceUsableForContext(
  source: Source,
  version: SourceVersion,
  governance: SourceGovernanceRecord,
  context: SourceUsageContext,
): boolean {
  if (!ISO_DATE.test(context.at)) return false;
  if (!validateSourceGovernance(governance).valid) return false;
  if (governance.verificationStatus !== 'verified') return false;
  if (source.status !== 'active' || version.status !== 'active') return false;
  if (governance.sourceId !== source.id || governance.sourceVersionId !== version.id) return false;
  if (version.sourceRef.id !== source.id) return false;

  const scope = governance.validFor;
  if (!matchesScopedValue(scope.userIds, context.userId)) return false;
  if (!matchesScopedValue(scope.instituteIds, context.instituteId)) return false;
  if (!matchesScopedValue(scope.schoolOrders, context.schoolOrder)) return false;
  if (!matchesScopedValue(scope.disciplines, context.discipline)) return false;
  if (scope.validFrom && context.at < scope.validFrom) return false;
  if (scope.validTo && context.at > scope.validTo) return false;

  return true;
}

export function validateDerivedKnowledgeSourceRef(
  ref: DerivedKnowledgeSourceRef,
  governance: SourceGovernanceRecord,
): boolean {
  return ref.sourceId === governance.sourceId
    && ref.sourceVersionId === governance.sourceVersionId
    && ref.sourceVersionFingerprint === governance.versionFingerprint
    && SHA256_HEX.test(ref.sourceVersionFingerprint);
}
