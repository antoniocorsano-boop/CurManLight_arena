import type { AcademicYear as CanonicalAcademicYear } from '../types/curriculumTransition';

export type AcademicYear = CanonicalAcademicYear;

export interface InstitutionalAcademicYear {
  id: string;
  label: string;
  startsOn: string;
  endsOn: string;
  status: 'planned' | 'active' | 'closed' | 'archived' | 'legacy';
}

export function parseSchoolYear(schoolYear: string): AcademicYear | null {
  if (!schoolYear) return null;
  const match = schoolYear.match(/^(\d{4})-(\d{4})$/);
  if (!match) return null;
  const startYear = parseInt(match[1], 10);
  const endYear = parseInt(match[2], 10);
  if (endYear !== startYear + 1) return null;
  return { startYear, endYear };
}

export function formatAcademicYear(year: AcademicYear): string {
  return `${year.startYear}-${year.endYear}`;
}

export function formatInstitutionalAcademicYear(year: AcademicYear): string {
  return `${year.startYear}/${year.endYear}`;
}

export function createAcademicYear(startYear: number): AcademicYear {
  return { startYear, endYear: startYear + 1 };
}

export function isValidAcademicYear(year: AcademicYear): boolean {
  if (!Number.isFinite(year.startYear) || !Number.isFinite(year.endYear)) return false;
  if (!Number.isInteger(year.startYear) || !Number.isInteger(year.endYear)) return false;
  return year.endYear === year.startYear + 1;
}

export function schoolYearToInstitutionalLabel(schoolYear: string): string {
  const parsed = parseSchoolYear(schoolYear);
  if (!parsed) return schoolYear;
  return formatInstitutionalAcademicYear(parsed);
}

export function institutionalLabelToSchoolYear(label: string): string {
  if (!label) return '';
  const match = label.match(/^(\d{4})\/(\d{4})$/);
  if (!match) return label;
  return `${match[1]}-${match[2]}`;
}