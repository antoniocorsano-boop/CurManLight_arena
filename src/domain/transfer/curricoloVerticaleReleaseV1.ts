import type { CurriculumNode } from '../curriculum/node';
import type { CurriculumSegment } from '../curriculum/segment';
import type { SchoolOrder, SegmentScope } from '../curriculum/types';
import type { InstituteCurriculumVersion } from '../curriculum/version';
import type { VerticalCurriculumLink } from '../curriculum/verticalLink';
import type { StructuralFootprint } from './types';
import { canonicalSerialize, computeStructuralFootprint } from './signatures';

export const TRAMA_CURRICOLO_VERTICALE_RELEASE_V1 = 'TRAMA_CURRICOLO_VERTICALE_RELEASE_V1' as const;

export type CurricoloVerticaleDomainKindV1 =
  | 'DISCIPLINA'
  | 'CAMPO_ESPERIENZA'
  | 'PERCORSO_CURRICOLARE'
  | 'AMBITO_TRASVERSALE';

export interface CurricoloVerticaleExpectedScopeV1 {
  schoolOrder: SchoolOrder;
  scope: SegmentScope;
  domainId: string;
  domainKind: CurricoloVerticaleDomainKindV1;
}

export interface CurricoloVerticalePerimeterV1 {
  expected: readonly CurricoloVerticaleExpectedScopeV1[];
  intentionallyNotApplicable: readonly CurricoloVerticaleExpectedScopeV1[];
}

export type CurricoloVerticaleAuthorityV1 =
  | {
      state: 'PROVISIONAL_COMPLETE';
      requiresRevalidationOnApproval: true;
      authorityReceiptRef?: never;
    }
  | {
      state: 'APPROVED';
      requiresRevalidationOnApproval: false;
      authorityReceiptRef: string;
    };

export interface CurricoloVerticaleManifestV1 {
  coverageStatus: 'SATISFIED' | 'INCOMPLETE';
  schoolOrders: SchoolOrder[];
  expected: CurricoloVerticaleExpectedScopeV1[];
  present: CurricoloVerticaleExpectedScopeV1[];
  missing: CurricoloVerticaleExpectedScopeV1[];
  intentionallyNotApplicable: CurricoloVerticaleExpectedScopeV1[];
}

export interface CurricoloVerticaleReleaseV1 {
  contract: typeof TRAMA_CURRICOLO_VERTICALE_RELEASE_V1;
  contractVersion: 1;
  institutionId: string;
  schoolYearRef: string;
  version: InstituteCurriculumVersion;
  authority: CurricoloVerticaleAuthorityV1;
  manifest: CurricoloVerticaleManifestV1;
  segments: CurriculumSegment[];
  nodes: CurriculumNode[];
  verticalLinks: VerticalCurriculumLink[];
  downstreamPolicy: {
    acceptanceRequired: true;
    automaticWriteAllowed: false;
  };
  issuedAt: string;
  structuralFootprint: StructuralFootprint;
}

export interface CreateCurricoloVerticaleReleaseV1Input {
  institutionId: string;
  schoolYearRef: string;
  version: InstituteCurriculumVersion;
  segments: readonly CurriculumSegment[];
  nodes: readonly CurriculumNode[];
  verticalLinks: readonly VerticalCurriculumLink[];
  perimeter: CurricoloVerticalePerimeterV1;
  authority: CurricoloVerticaleAuthorityV1;
  issuedAt?: string;
}

const ORDER_RANK: Record<SchoolOrder, number> = {
  infanzia: 0,
  primaria: 1,
  secondaria: 2,
};

function sortedUnique<T>(values: readonly T[], key: (value: T) => string): T[] {
  const unique = new Map<string, T>();
  for (const value of values) unique.set(key(value), value);
  return [...unique.values()].sort((left, right) => key(left).localeCompare(key(right)));
}

function normalizeScope(scope: SegmentScope): SegmentScope {
  if (scope.type === 'grade-range') {
    return { type: 'grade-range', grades: [...scope.grades].map(String).sort((a, b) => Number(a) - Number(b)) };
  }
  if (scope.type === 'grade') return { type: 'grade', grade: String(scope.grade) };
  return { type: 'school-level' };
}

function expectedKey(value: CurricoloVerticaleExpectedScopeV1): string {
  return canonicalSerialize({
    schoolOrder: value.schoolOrder,
    domainId: value.domainId,
    domainKind: value.domainKind,
    scope: normalizeScope(value.scope),
  });
}

function segmentScopeKey(segment: CurriculumSegment): string {
  return canonicalSerialize({
    schoolOrder: segment.schoolLevel,
    domainId: segment.subjectOrFieldId,
    scope: normalizeScope(segment.scope),
  });
}

function expectedSegmentKey(value: CurricoloVerticaleExpectedScopeV1): string {
  return canonicalSerialize({
    schoolOrder: value.schoolOrder,
    domainId: value.domainId,
    scope: normalizeScope(value.scope),
  });
}

function validateScopeBounds(segment: CurriculumSegment): string[] {
  const errors: string[] = [];
  const scope = segment.scope;
  if (segment.schoolLevel === 'infanzia' && scope.type !== 'school-level') {
    errors.push(`infanzia segment '${segment.id}' must use school-level scope without numeric grade`);
    return errors;
  }
  if (scope.type === 'school-level') return errors;

  const grades = scope.type === 'grade' ? [scope.grade] : scope.grades;
  const max = segment.schoolLevel === 'primaria' ? 5 : segment.schoolLevel === 'secondaria' ? 3 : 0;
  for (const raw of grades) {
    const grade = Number(raw);
    if (!Number.isInteger(grade) || grade < 1 || grade > max) {
      errors.push(`${segment.schoolLevel} segment '${segment.id}' has invalid grade '${raw}'`);
    }
  }
  return errors;
}

function validateAuthority(authority: CurricoloVerticaleAuthorityV1 | Record<string, unknown>): string[] {
  const errors: string[] = [];
  const state = authority.state;
  const receipt = typeof authority.authorityReceiptRef === 'string' ? authority.authorityReceiptRef.trim() : '';
  const revalidate = authority.requiresRevalidationOnApproval;

  if (state === 'APPROVED') {
    if (!receipt) errors.push('APPROVED authority requires authorityReceiptRef');
    if (revalidate !== false) errors.push('APPROVED authority must not require revalidation on approval');
  } else if (state === 'PROVISIONAL_COMPLETE') {
    if (receipt) errors.push('PROVISIONAL_COMPLETE authority cannot claim authorityReceiptRef');
    if (revalidate !== true) errors.push('PROVISIONAL_COMPLETE authority must require revalidation on approval');
  } else {
    errors.push(`unsupported authority state '${String(state)}'`);
  }
  return errors;
}

export function buildCurricoloVerticaleManifestV1(input: {
  segments: readonly CurriculumSegment[];
  perimeter: CurricoloVerticalePerimeterV1;
}): CurricoloVerticaleManifestV1 {
  const expected = sortedUnique(input.perimeter.expected, expectedKey);
  const intentionallyNotApplicable = sortedUnique(input.perimeter.intentionallyNotApplicable, expectedKey);
  const presentSegmentKeys = new Set(input.segments.map(segmentScopeKey));
  const notApplicableKeys = new Set(intentionallyNotApplicable.map(expectedKey));

  const present = expected.filter(item => presentSegmentKeys.has(expectedSegmentKey(item)));
  const missing = expected.filter(item => (
    !presentSegmentKeys.has(expectedSegmentKey(item)) && !notApplicableKeys.has(expectedKey(item))
  ));
  const schoolOrders = sortedUnique(
    [...expected, ...intentionallyNotApplicable].map(item => item.schoolOrder),
    item => String(ORDER_RANK[item]).padStart(2, '0'),
  );

  return {
    coverageStatus: missing.length === 0 && input.segments.length > 0 ? 'SATISFIED' : 'INCOMPLETE',
    schoolOrders,
    expected,
    present,
    missing,
    intentionallyNotApplicable,
  };
}

function validateGraph(input: {
  version: InstituteCurriculumVersion;
  segments: readonly CurriculumSegment[];
  nodes: readonly CurriculumNode[];
  verticalLinks: readonly VerticalCurriculumLink[];
}): string[] {
  const errors: string[] = [];
  const segmentIds = new Set(input.segments.map(item => item.id));
  const nodeIds = new Set(input.nodes.map(item => item.id));

  for (const segment of input.segments) {
    if (segment.versionId !== input.version.id) {
      errors.push(`segment '${segment.id}' belongs to another curriculum version`);
    }
    errors.push(...validateScopeBounds(segment));
  }
  for (const node of input.nodes) {
    if (node.versionId !== input.version.id) {
      errors.push(`node '${node.id}' belongs to another curriculum version`);
    }
    if (!segmentIds.has(node.segmentId)) {
      errors.push(`node '${node.id}' references a segment outside the release`);
    }
  }
  for (const link of input.verticalLinks) {
    if (link.versionId !== input.version.id) {
      errors.push(`vertical link '${link.id}' belongs to another curriculum version`);
    }
    if (!nodeIds.has(link.sourceNodeId) || !nodeIds.has(link.targetNodeId)) {
      errors.push(`vertical link '${link.id}' references a node outside the release`);
    }
  }
  if (input.segments.length === 0) errors.push('vertical curriculum release requires at least one usable segment');
  return errors;
}

function sortReleaseCollections(input: CreateCurricoloVerticaleReleaseV1Input) {
  return {
    segments: [...input.segments].sort((a, b) => a.id.localeCompare(b.id)),
    nodes: [...input.nodes].sort((a, b) => a.id.localeCompare(b.id)),
    verticalLinks: [...input.verticalLinks].sort((a, b) => a.id.localeCompare(b.id)),
  };
}

function structuralMaterial(release: Omit<CurricoloVerticaleReleaseV1, 'structuralFootprint'>): Record<string, unknown> {
  const { issuedAt: _issuedAt, ...stable } = release;
  return stable as unknown as Record<string, unknown>;
}

export function createCurricoloVerticaleReleaseV1(
  input: CreateCurricoloVerticaleReleaseV1Input,
): CurricoloVerticaleReleaseV1 {
  const errors: string[] = [];
  if (!input.institutionId.trim()) errors.push('institutionId is required');
  if (!input.schoolYearRef.trim()) errors.push('schoolYearRef is required');
  if (input.version.institutionId && input.version.institutionId !== input.institutionId) {
    errors.push('curriculum version institutionId does not match release institutionId');
  }
  errors.push(...validateAuthority(input.authority));
  errors.push(...validateGraph(input));
  if (errors.length > 0) throw new Error(errors.join('; '));

  const collections = sortReleaseCollections(input);
  const manifest = buildCurricoloVerticaleManifestV1({
    segments: collections.segments,
    perimeter: input.perimeter,
  });

  const base: Omit<CurricoloVerticaleReleaseV1, 'structuralFootprint'> = {
    contract: TRAMA_CURRICOLO_VERTICALE_RELEASE_V1,
    contractVersion: 1,
    institutionId: input.institutionId,
    schoolYearRef: input.schoolYearRef,
    version: { ...input.version },
    authority: { ...input.authority },
    manifest,
    ...collections,
    downstreamPolicy: {
      acceptanceRequired: true,
      automaticWriteAllowed: false,
    },
    issuedAt: input.issuedAt ?? new Date().toISOString(),
  };

  return {
    ...base,
    structuralFootprint: computeStructuralFootprint(structuralMaterial(base)),
  };
}

export function validateCurricoloVerticaleReleaseV1(
  input: unknown,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['release must be an object'] };
  }

  const release = input as CurricoloVerticaleReleaseV1;
  if (release.contract !== TRAMA_CURRICOLO_VERTICALE_RELEASE_V1) errors.push('invalid release contract');
  if (release.contractVersion !== 1) errors.push('invalid release contractVersion');
  if (!release.institutionId?.trim()) errors.push('institutionId is required');
  if (!release.schoolYearRef?.trim()) errors.push('schoolYearRef is required');
  if (!release.version || !Array.isArray(release.segments) || !Array.isArray(release.nodes) || !Array.isArray(release.verticalLinks)) {
    errors.push('release graph is incomplete');
  } else {
    errors.push(...validateGraph(release));
  }
  if (!release.authority || typeof release.authority !== 'object') {
    errors.push('authority is required');
  } else {
    errors.push(...validateAuthority(release.authority));
  }
  if (release.downstreamPolicy?.acceptanceRequired !== true) {
    errors.push('downstreamPolicy.acceptanceRequired must remain true');
  }
  if (release.downstreamPolicy?.automaticWriteAllowed !== false) {
    errors.push('downstreamPolicy.automaticWriteAllowed must remain false');
  }
  if (!release.manifest || !Array.isArray(release.manifest.missing)) {
    errors.push('manifest is required');
  } else {
    const shouldBeSatisfied = release.manifest.missing.length === 0 && release.segments.length > 0;
    if ((release.manifest.coverageStatus === 'SATISFIED') !== shouldBeSatisfied) {
      errors.push('manifest coverageStatus does not match missing scopes');
    }
  }
  if (!release.structuralFootprint || release.structuralFootprint.algorithm !== 'fnv1a') {
    errors.push('structuralFootprint is required');
  } else {
    const { structuralFootprint: _footprint, ...withoutFootprint } = release;
    const recomputed = computeStructuralFootprint(structuralMaterial(withoutFootprint));
    if (recomputed.hash !== release.structuralFootprint.hash) {
      errors.push('structuralFootprint does not match release material');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function serializeCurricoloVerticaleReleaseV1(release: CurricoloVerticaleReleaseV1): string {
  const validation = validateCurricoloVerticaleReleaseV1(release);
  if (!validation.valid) throw new Error(validation.errors.join('; '));
  return canonicalSerialize(release);
}
