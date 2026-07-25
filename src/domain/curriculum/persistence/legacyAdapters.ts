import type { CurricularLevel, SchoolOrder } from '../../../types/curriculum';
import type { CurriculumNode } from '../node';
import type { CurriculumSegment, CurriculumSegmentContent } from '../segment';
import type { DomainValidationIssue } from '../types';
import type { InstituteCurriculumVersion } from '../version';

export type LegacyCurriculumLevel = Partial<CurricularLevel> & {
  conoscenze?: string[];
  abilita?: string[];
  competenze?: string[];
  classLabel?: string;
  classRange?: string[];
};

export type LegacyCurriculumSource =
  Record<string, Partial<Record<SchoolOrder, LegacyCurriculumLevel>>>;

export type LegacyAdaptationDisposition =
  | 'adapted'
  | 'adapted-with-warning'
  | 'skipped'
  | 'blocked';

export interface LegacyAdaptationResult<T> {
  value?: T;
  issues: DomainValidationIssue[];
  disposition: LegacyAdaptationDisposition;
}

export interface AdaptedLegacyCurriculum {
  version: InstituteCurriculumVersion;
  segments: CurriculumSegment[];
  nodes: CurriculumNode[];
  links: [];
}

const ORDERS: readonly SchoolOrder[] = ['infanzia', 'primaria', 'secondaria'];
const NODE_FIELDS = [
  ['traguardi', 'milestone'],
  ['obiettivi', 'objective'],
  ['evidenze', 'evidence'],
  ['conoscenze', 'knowledge'],
  ['abilita', 'skill'],
  ['competenze', 'competence'],
  ['nucleiFondanti', 'core-theme'],
] as const;

const slug = (value: string): string => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || 'unknown';

const emptyContent = (): CurriculumSegmentContent => ({
  traguardi: [],
  obiettivi: [],
  evidenze: [],
  conoscenze: [],
  abilita: [],
  competenze: [],
  nucleiFondanti: [],
  proposals: [],
});

function adaptLegacyScope(level: LegacyCurriculumLevel): CurriculumSegment['scope'] {
  if (level.classRange && level.classRange.length > 0) {
    return { type: 'grade-range', grades: [...level.classRange] };
  }
  if (level.classLabel?.trim()) {
    return { type: 'grade', grade: level.classLabel.trim() };
  }
  return { type: 'school-level' };
}

function warning(code: string, entityId: string, message: string): DomainValidationIssue {
  return { code, severity: 'warning', entityType: 'LegacyCurriculum', entityId, message };
}

export function adaptLegacyCurriculum(
  source: LegacyCurriculumSource,
  now = new Date().toISOString(),
): LegacyAdaptationResult<AdaptedLegacyCurriculum> {
  const issues: DomainValidationIssue[] = [];
  const versionId = 'legacy-imported-baseline-v1';
  const version: InstituteCurriculumVersion = {
    id: versionId,
    title: 'Legacy imported baseline',
    versionNumber: 'legacy-1',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  const segments: CurriculumSegment[] = [];
  const nodes: CurriculumNode[] = [];

  for (const subject of Object.keys(source).sort()) {
    const discipline = source[subject];
    for (const schoolLevel of ORDERS) {
      const level = discipline[schoolLevel];
      if (!level) continue;
      const segmentId = `legacy-segment-${slug(subject)}-${schoolLevel}`;
      const content = emptyContent();
      for (const [field] of NODE_FIELDS) {
        const candidate = level[field];
        if (Array.isArray(candidate)) {
          content[field] = candidate.filter((item): item is string => typeof item === 'string');
        }
      }
      content.proposals = Array.isArray(level.proposals)
        ? level.proposals.filter(proposal => proposal !== null && typeof proposal === 'object')
        : [];
      if (NODE_FIELDS.every(([field]) => content[field].length === 0)) {
        issues.push(warning('LEGACY_EMPTY_LEVEL', segmentId, 'Legacy level has no convertible curricular content'));
      }
      segments.push({
        id: segmentId,
        versionId,
        schoolLevel,
        subjectOrFieldId: subject,
        scope: adaptLegacyScope(level),
        frameworkApplicability: {
          framework: null,
          resolutionStatus: 'requires-context-confirmation',
          resolutionReason: 'Legacy data does not provide cohort context',
        },
        workStatus: 'legacy-imported',
        content,
        createdAt: now,
        updatedAt: now,
      });
      for (const [field, type] of NODE_FIELDS) {
        content[field].forEach((title, index) => {
          nodes.push({
            id: `${segmentId}-${type}-${index + 1}`,
            versionId,
            segmentId,
            type,
            title,
            workStatus: 'draft',
            createdAt: now,
            updatedAt: now,
          });
        });
      }
    }
  }

  if (segments.length === 0) {
    return {
      disposition: 'skipped',
      issues: [warning('LEGACY_NO_CURRICULUM_DATA', versionId, 'No legacy curriculum data was available')],
    };
  }
  return {
    value: { version, segments, nodes, links: [] },
    issues,
    disposition: issues.length > 0 ? 'adapted-with-warning' : 'adapted',
  };
}

export function countLegacyLevels(source: LegacyCurriculumSource): number {
  return Object.values(source)
    .reduce((count, discipline) => count + ORDERS.filter(order => discipline[order] !== undefined).length, 0);
}
