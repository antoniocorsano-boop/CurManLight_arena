import type { CurricoloSchoolOrder, CurricoloSegmentScope } from '../../types/curricolo';
import { canonicalSerialize } from './signatures';
import type {
  CurricoloVerticaleExpectedScopeV1,
  CurricoloVerticalePerimeterV1,
} from './curricoloVerticaleReleaseV1';

export interface BuildCurricoloVerticalePerimeterV1Input {
  schoolOrders: readonly CurricoloSchoolOrder[];
  expectedScopes: readonly CurricoloVerticaleExpectedScopeV1[];
  intentionallyNotApplicable: readonly CurricoloVerticaleExpectedScopeV1[];
}

function scopeKey(value: CurricoloVerticaleExpectedScopeV1): string {
  return canonicalSerialize(value);
}

function copyScope(scope: CurricoloSegmentScope): CurricoloSegmentScope {
  if (scope.type === 'grade-range') return { type: 'grade-range', grades: [...scope.grades] };
  if (scope.type === 'grade') return { type: 'grade', grade: scope.grade };
  return { type: 'school-level' };
}

function copyEntry(value: CurricoloVerticaleExpectedScopeV1): CurricoloVerticaleExpectedScopeV1 {
  return { ...value, scope: copyScope(value.scope) };
}

function validateScope(entry: CurricoloVerticaleExpectedScopeV1): string[] {
  const errors: string[] = [];
  const { schoolOrder, scope } = entry;
  if (schoolOrder === 'infanzia' && scope.type !== 'school-level') {
    errors.push(`infanzia scope '${entry.domainId}' must not declare a numeric grade`);
    return errors;
  }
  if (scope.type === 'school-level') return errors;

  const grades = scope.type === 'grade' ? [scope.grade] : scope.grades;
  const max = schoolOrder === 'primaria' ? 5 : schoolOrder === 'secondaria' ? 3 : 0;
  for (const raw of grades) {
    const grade = Number(raw);
    if (!Number.isInteger(grade) || grade < 1 || grade > max) {
      errors.push(`${schoolOrder} scope '${entry.domainId}' has invalid grade '${raw}'`);
    }
  }
  return errors;
}

function dedupe(values: readonly CurricoloVerticaleExpectedScopeV1[]): CurricoloVerticaleExpectedScopeV1[] {
  const map = new Map<string, CurricoloVerticaleExpectedScopeV1>();
  for (const value of values) map.set(scopeKey(value), copyEntry(value));
  return [...map.values()].sort((a, b) => scopeKey(a).localeCompare(scopeKey(b)));
}

export function buildCurricoloVerticalePerimeterV1(
  input: BuildCurricoloVerticalePerimeterV1Input,
): CurricoloVerticalePerimeterV1 {
  const configuredOrders = [...new Set(input.schoolOrders)];
  if (configuredOrders.length === 0) throw new Error('At least one school order must be configured');

  const expected = dedupe(input.expectedScopes);
  const intentionallyNotApplicable = dedupe(input.intentionallyNotApplicable);
  const declared = [...expected, ...intentionallyNotApplicable];
  const errors: string[] = [];

  for (const entry of declared) {
    if (!configuredOrders.includes(entry.schoolOrder)) {
      errors.push(`${entry.schoolOrder} scope '${entry.domainId}' is outside the configured institute school orders`);
    }
    if (!entry.domainId.trim()) errors.push('domainId is required');
    errors.push(...validateScope(entry));
  }

  for (const order of configuredOrders) {
    if (!declared.some(entry => entry.schoolOrder === order)) {
      errors.push(`${order} is configured for the institute but has no declared curricolo perimeter`);
    }
  }

  const expectedKeys = new Set(expected.map(scopeKey));
  for (const item of intentionallyNotApplicable) {
    if (expectedKeys.has(scopeKey(item))) {
      errors.push(`scope '${item.domainId}' cannot be both expected and intentionally not applicable`);
    }
  }

  if (errors.length > 0) throw new Error(errors.join('; '));
  return { expected, intentionallyNotApplicable };
}
