import type {
  CurricoloNode,
  CurricoloSchoolOrder,
  CurricoloSegment,
  CurricoloSegmentScope,
  InstituteCurricoloVersion,
  VerticalCurricoloLink,
} from '../../types/curricolo';
import type { StructuralFootprint } from './types';
import { canonicalSerialize, computeStructuralFootprint } from './signatures';

export const TRAMA_CURRICOLO_VERTICALE_RELEASE_V1 = 'TRAMA_CURRICOLO_VERTICALE_RELEASE_V1' as const;

export type CurricoloVerticaleDomainKindV1 =
  | 'DISCIPLINA'
  | 'CAMPO_ESPERIENZA'
  | 'PERCORSO_CURRICOLARE'
  | 'AMBITO_TRASVERSALE';

export interface CurricoloVerticaleExpectedScopeV1 {
  schoolOrder: CurricoloSchoolOrder;
  scope: CurricoloSegmentScope;
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
  schoolOrders: CurricoloSchoolOrder[];
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
  version: InstituteCurricoloVersion;
  authority: CurricoloVerticaleAuthorityV1;
  perimeter: CurricoloVerticalePerimeterV1;
  manifest: CurricoloVerticaleManifestV1;
  segments: CurricoloSegment[];
  nodes: CurricoloNode[];
  verticalLinks: VerticalCurricoloLink[];
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
  version: InstituteCurricoloVersion;
  segments: readonly CurricoloSegment[];
  nodes: readonly CurricoloNode[];
  verticalLinks: readonly VerticalCurricoloLink[];
  perimeter: CurricoloVerticalePerimeterV1;
  authority: CurricoloVerticaleAuthorityV1;
  issuedAt?: string;
}

type UnknownRecord = Record<string, unknown>;

const ORDER_RANK: Record<CurricoloSchoolOrder, number> = {
  infanzia: 0,
  primaria: 1,
  secondaria: 2,
};

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function sortedUnique<T>(values: readonly T[], key: (value: T) => string): T[] {
  const unique = new Map<string, T>();
  for (const value of values) unique.set(key(value), value);
  return [...unique.values()].sort((left, right) => key(left).localeCompare(key(right)));
}

function normalizeScope(scope: CurricoloSegmentScope): CurricoloSegmentScope {
  if (scope.type === 'grade-range') {
    return { type: 'grade-range', grades: [...scope.grades].map(String).sort((a, b) => Number(a) - Number(b)) };
  }
  if (scope.type === 'grade') return { type: 'grade', grade: String(scope.grade) };
  return { type: 'school-level' };
}

function copyPerimeter(perimeter: CurricoloVerticalePerimeterV1): CurricoloVerticalePerimeterV1 {
  const copy = (item: CurricoloVerticaleExpectedScopeV1): CurricoloVerticaleExpectedScopeV1 => ({
    ...item,
    scope: normalizeScope(item.scope),
  });
  return {
    expected: perimeter.expected.map(copy),
    intentionallyNotApplicable: perimeter.intentionallyNotApplicable.map(copy),
  };
}

function expectedKey(value: CurricoloVerticaleExpectedScopeV1): string {
  return canonicalSerialize({
    schoolOrder: value.schoolOrder,
    domainId: value.domainId,
    domainKind: value.domainKind,
    scope: normalizeScope(value.scope),
  });
}

function segmentScopeKey(segment: CurricoloSegment): string {
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

function validateScopeBounds(segment: CurricoloSegment): string[] {
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
  segments: readonly CurricoloSegment[];
  perimeter: CurricoloVerticalePerimeterV1;
}): CurricoloVerticaleManifestV1 {
  if (input.perimeter.expected.length + input.perimeter.intentionallyNotApplicable.length === 0) {
    throw new Error('curricolo perimeter must declare at least one expected or intentionally not applicable scope');
  }
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
  version: InstituteCurricoloVersion;
  segments: readonly CurricoloSegment[];
  nodes: readonly CurricoloNode[];
  verticalLinks: readonly VerticalCurricoloLink[];
}): string[] {
  const errors: string[] = [];
  const segmentIds = new Set(input.segments.map(item => item.id));
  const nodeIds = new Set(input.nodes.map(item => item.id));

  for (const segment of input.segments) {
    if (segment.versionId !== input.version.id) {
      errors.push(`segment '${segment.id}' belongs to another curricolo version`);
    }
    errors.push(...validateScopeBounds(segment));
  }
  for (const node of input.nodes) {
    if (node.versionId !== input.version.id) {
      errors.push(`node '${node.id}' belongs to another curricolo version`);
    }
    if (!segmentIds.has(node.segmentId)) {
      errors.push(`node '${node.id}' references a segment outside the release`);
    }
  }
  for (const link of input.verticalLinks) {
    if (link.versionId !== input.version.id) {
      errors.push(`vertical link '${link.id}' belongs to another curricolo version`);
    }
    if (!nodeIds.has(link.sourceNodeId) || !nodeIds.has(link.targetNodeId)) {
      errors.push(`vertical link '${link.id}' references a node outside the release`);
    }
  }
  if (input.segments.length === 0) errors.push('vertical curricolo release requires at least one usable segment');
  return errors;
}

function safeScope(value: unknown): CurricoloSegmentScope | null {
  if (!isRecord(value) || !nonEmptyString(value.type)) return null;
  if (value.type === 'school-level') return { type: 'school-level' };
  if (value.type === 'grade' && nonEmptyString(value.grade)) return { type: 'grade', grade: value.grade };
  if (value.type === 'grade-range' && Array.isArray(value.grades)
    && value.grades.length > 0 && value.grades.every(nonEmptyString)) {
    return { type: 'grade-range', grades: [...value.grades] };
  }
  return null;
}

function safeExpectedScope(value: unknown): CurricoloVerticaleExpectedScopeV1 | null {
  if (!isRecord(value)) return null;
  const scope = safeScope(value.scope);
  if (!scope || !nonEmptyString(value.schoolOrder) || !nonEmptyString(value.domainId)
    || !nonEmptyString(value.domainKind)) return null;
  if (!['infanzia', 'primaria', 'secondaria'].includes(value.schoolOrder)) return null;
  if (!['DISCIPLINA', 'CAMPO_ESPERIENZA', 'PERCORSO_CURRICOLARE', 'AMBITO_TRASVERSALE'].includes(value.domainKind)) return null;
  return {
    schoolOrder: value.schoolOrder as CurricoloSchoolOrder,
    scope,
    domainId: value.domainId,
    domainKind: value.domainKind as CurricoloVerticaleDomainKindV1,
  };
}

function safeSegment(value: unknown): CurricoloSegment | null {
  if (!isRecord(value) || !nonEmptyString(value.id) || !nonEmptyString(value.versionId)
    || !nonEmptyString(value.schoolLevel) || !nonEmptyString(value.subjectOrFieldId)) return null;
  if (!['infanzia', 'primaria', 'secondaria'].includes(value.schoolLevel)) return null;
  const scope = safeScope(value.scope);
  if (!scope) return null;
  return value as unknown as CurricoloSegment;
}

function validateGraphUnknown(
  version: UnknownRecord,
  segments: UnknownRecord[],
  nodes: UnknownRecord[],
  links: UnknownRecord[],
): string[] {
  const errors: string[] = [];
  const versionId = nonEmptyString(version.id) ? version.id : null;
  if (!versionId) errors.push('release version id is required');
  const segmentIds = new Set<string>();
  const nodeIds = new Set<string>();

  for (const segment of segments) {
    if (!nonEmptyString(segment.id)) errors.push('segment id is required');
    else segmentIds.add(segment.id);
    if (versionId && segment.versionId !== versionId) errors.push(`segment '${String(segment.id)}' belongs to another curricolo version`);
    const typed = safeSegment(segment);
    if (!typed) errors.push(`segment '${String(segment.id)}' has invalid scope or identity`);
    else errors.push(...validateScopeBounds(typed));
  }
  if (segments.length === 0) errors.push('vertical curricolo release requires at least one usable segment');

  for (const node of nodes) {
    if (!nonEmptyString(node.id)) errors.push('node id is required');
    else nodeIds.add(node.id);
    if (versionId && node.versionId !== versionId) errors.push(`node '${String(node.id)}' belongs to another curricolo version`);
    if (!nonEmptyString(node.segmentId) || !segmentIds.has(node.segmentId)) {
      errors.push(`node '${String(node.id)}' references a segment outside the release`);
    }
  }

  for (const link of links) {
    if (versionId && link.versionId !== versionId) errors.push(`vertical link '${String(link.id)}' belongs to another curricolo version`);
    if (!nonEmptyString(link.sourceNodeId) || !nodeIds.has(link.sourceNodeId)
      || !nonEmptyString(link.targetNodeId) || !nodeIds.has(link.targetNodeId)) {
      errors.push(`vertical link '${String(link.id)}' references a node outside the release`);
    }
  }
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

function structuralMaterialUnknown(release: UnknownRecord): Record<string, unknown> {
  const { structuralFootprint: _footprint, issuedAt: _issuedAt, ...stable } = release;
  return stable;
}

export function createCurricoloVerticaleReleaseV1(
  input: CreateCurricoloVerticaleReleaseV1Input,
): CurricoloVerticaleReleaseV1 {
  const errors: string[] = [];
  if (!input.institutionId.trim()) errors.push('institutionId is required');
  if (!input.schoolYearRef.trim()) errors.push('schoolYearRef is required');
  if (input.version.institutionId && input.version.institutionId !== input.institutionId) {
    errors.push('curricolo version institutionId does not match release institutionId');
  }
  if (input.perimeter.expected.length + input.perimeter.intentionallyNotApplicable.length === 0) {
    errors.push('curricolo perimeter must declare at least one expected or intentionally not applicable scope');
  }
  errors.push(...validateAuthority(input.authority));
  errors.push(...validateGraph(input));
  if (errors.length > 0) throw new Error(errors.join('; '));

  const collections = sortReleaseCollections(input);
  const perimeter = copyPerimeter(input.perimeter);
  const manifest = buildCurricoloVerticaleManifestV1({
    segments: collections.segments,
    perimeter,
  });

  const base: Omit<CurricoloVerticaleReleaseV1, 'structuralFootprint'> = {
    contract: TRAMA_CURRICOLO_VERTICALE_RELEASE_V1,
    contractVersion: 1,
    institutionId: input.institutionId,
    schoolYearRef: input.schoolYearRef,
    version: { ...input.version },
    authority: { ...input.authority },
    perimeter,
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
  if (!isRecord(input)) {
    return { valid: false, errors: ['release must be an object'] };
  }

  const release = input;
  if (release.contract !== TRAMA_CURRICOLO_VERTICALE_RELEASE_V1) errors.push('invalid release contract');
  if (release.contractVersion !== 1) errors.push('invalid release contractVersion');
  if (!nonEmptyString(release.institutionId)) errors.push('institutionId is required');
  if (!nonEmptyString(release.schoolYearRef)) errors.push('schoolYearRef is required');

  const version = release.version;
  const segments = release.segments;
  const nodes = release.nodes;
  const links = release.verticalLinks;
  if (
    isRecord(version)
    && nonEmptyString(release.institutionId)
    && nonEmptyString(version.institutionId)
    && version.institutionId !== release.institutionId
  ) {
    errors.push('curricolo version institutionId does not match release institutionId');
  }
  if (!isRecord(version) || !Array.isArray(segments) || !Array.isArray(nodes) || !Array.isArray(links)) {
    errors.push('release graph is incomplete');
  } else {
    const segmentRecords = segments.filter(isRecord);
    const nodeRecords = nodes.filter(isRecord);
    const linkRecords = links.filter(isRecord);
    if (segmentRecords.length !== segments.length) errors.push('all release segments must be objects');
    if (nodeRecords.length !== nodes.length) errors.push('all release nodes must be objects');
    if (linkRecords.length !== links.length) errors.push('all release vertical links must be objects');
    errors.push(...validateGraphUnknown(version, segmentRecords, nodeRecords, linkRecords));
  }

  if (!isRecord(release.authority)) {
    errors.push('authority is required');
  } else {
    errors.push(...validateAuthority(release.authority));
  }

  if (!isRecord(release.downstreamPolicy) || release.downstreamPolicy.acceptanceRequired !== true) {
    errors.push('downstreamPolicy.acceptanceRequired must remain true');
  }
  if (!isRecord(release.downstreamPolicy) || release.downstreamPolicy.automaticWriteAllowed !== false) {
    errors.push('downstreamPolicy.automaticWriteAllowed must remain false');
  }

  const perimeter = release.perimeter;
  const perimeterExpected = isRecord(perimeter) ? perimeter.expected : undefined;
  const perimeterNotApplicable = isRecord(perimeter) ? perimeter.intentionallyNotApplicable : undefined;
  const safeExpected = Array.isArray(perimeterExpected) ? perimeterExpected.map(safeExpectedScope) : [];
  const safeNotApplicable = Array.isArray(perimeterNotApplicable) ? perimeterNotApplicable.map(safeExpectedScope) : [];
  const safeSegments = Array.isArray(segments) ? segments.map(safeSegment) : [];
  const perimeterStructurallyValid = isRecord(perimeter)
    && Array.isArray(perimeterExpected)
    && Array.isArray(perimeterNotApplicable)
    && safeExpected.every(Boolean)
    && safeNotApplicable.every(Boolean)
    && safeExpected.length + safeNotApplicable.length > 0;
  const segmentsStructurallyValid = Array.isArray(segments) && safeSegments.every(Boolean);

  if (!perimeterStructurallyValid) {
    errors.push('perimeter is required and must declare valid scopes');
  }
  if (!isRecord(release.manifest)) {
    errors.push('manifest is required');
  } else if (perimeterStructurallyValid && segmentsStructurallyValid) {
    try {
      const rebuilt = buildCurricoloVerticaleManifestV1({
        perimeter: {
          expected: safeExpected as CurricoloVerticaleExpectedScopeV1[],
          intentionallyNotApplicable: safeNotApplicable as CurricoloVerticaleExpectedScopeV1[],
        },
        segments: safeSegments as CurricoloSegment[],
      });
      if (canonicalSerialize(rebuilt) !== canonicalSerialize(release.manifest)) {
        errors.push('manifest coverage does not match actual segments and perimeter');
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'manifest cannot be rebuilt');
    }
  }

  if (!isRecord(release.structuralFootprint) || release.structuralFootprint.algorithm !== 'fnv1a'
    || !nonEmptyString(release.structuralFootprint.hash)) {
    errors.push('structuralFootprint is required');
  } else {
    try {
      const recomputed = computeStructuralFootprint(structuralMaterialUnknown(release));
      if (recomputed.hash !== release.structuralFootprint.hash) {
        errors.push('structuralFootprint does not match release material');
      }
    } catch {
      errors.push('release material cannot be canonicalized');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function serializeCurricoloVerticaleReleaseV1(release: CurricoloVerticaleReleaseV1): string {
  const validation = validateCurricoloVerticaleReleaseV1(release);
  if (!validation.valid) throw new Error(validation.errors.join('; '));
  return canonicalSerialize(release);
}