import type { AreaInfo, ContentItem } from './nationalCurriculumConsultation';
import type { DisciplineCode } from './model/vocabularies';
import type { SchoolOrder } from '../../types/curriculum';
import type { SourceAreaKind, NormativeCheckpoint, CurriculumSegment } from './model/types';
import { fixture2012 } from './fixture2012';
import { fixture2025 } from './fixture2025';
import { adaptFixture2012ToNationalCurriculumFixture, adaptFixture2025ToNationalCurriculumFixture, createNationalCurriculumConsultationService } from './nationalCurriculumConsultation';

export interface ComparisonScope {
  schoolOrder?: SchoolOrder;
  disciplineCode?: DisciplineCode | null;
  sourceAreaKind?: SourceAreaKind;
  sourceAreaCode?: string;
  normativeCheckpoint?: NormativeCheckpoint;
}

export interface FrameworkSideSummary {
  frameworkId: string;
  areas: AreaInfo[];
  items: ContentItem[];
}

export interface StructuralDifference {
  kind:
    | 'area-only-left'
    | 'area-only-right'
    | 'checkpoint-only-left'
    | 'checkpoint-only-right'
    | 'node-type-only-left'
    | 'node-type-only-right'
    | 'applicability-difference';
  description: string;
  leftRef?: string;
  rightRef?: string;
}

export interface NationalCurriculumComparisonResult {
  left: FrameworkSideSummary;
  right: FrameworkSideSummary;
  structuralDifferences: StructuralDifference[];
}

export interface NationalCurriculumComparisonService {
  compare(
    leftFrameworkId: string,
    rightFrameworkId: string,
    scope?: ComparisonScope
  ): NationalCurriculumComparisonResult;
}

// Helper to get segments for a framework
function getSegmentsForFramework(frameworkId: string): CurriculumSegment[] {
  if (frameworkId === 'IN2012') {
    const adapted = adaptFixture2012ToNationalCurriculumFixture(fixture2012);
    return adapted[0].segments;
  } else if (frameworkId === 'IN2025') {
    const adapted = adaptFixture2025ToNationalCurriculumFixture(fixture2025);
    return adapted[0].segments;
  } else {
    throw new Error(`Unknown framework: ${frameworkId}`);
  }
}

// Helper to build AreaInfo from segments, applying scope filters
function getAreasForFramework(frameworkId: string, scope: ComparisonScope): AreaInfo[] {
  const segments = getSegmentsForFramework(frameworkId);
  const seen = new Map<string, AreaInfo>();
  for (const segment of segments) {
    // Apply scope filters
    if (scope.schoolOrder !== undefined && segment.schoolOrder !== scope.schoolOrder) {
      continue;
    }
    if (scope.disciplineCode !== undefined && segment.disciplineCode !== scope.disciplineCode) {
      continue;
    }
    if (scope.sourceAreaKind !== undefined && segment.sourceArea?.kind !== scope.sourceAreaKind) {
      continue;
    }
    if (scope.sourceAreaCode !== undefined && segment.sourceArea?.code !== scope.sourceAreaCode) {
      continue;
    }
    const sourceArea = segment.sourceArea;
    const key = `${segment.sourceArea?.code ?? 'unknown'}-${segment.disciplineCode ?? 'null'}`;
    if (!seen.has(key)) {
      seen.set(key, {
        id: segment.id,
        title: segment.title,
        kind: sourceArea?.kind ?? 'discipline',
        code: sourceArea?.code ?? segment.title,
        disciplineCode: segment.disciplineCode,
        schoolOrder: segment.schoolOrder,
        frameworkApplicability: segment.frameworkApplicability,
      });
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.title.localeCompare(b.title));
}

// Helper to compute area key for matching
function areaKey(area: AreaInfo): string {
  return `${area.schoolOrder}-${area.code}-${area.disciplineCode}`;
}

export function createNationalCurriculumComparisonService(): NationalCurriculumComparisonService {
  // Create a consultation service that holds both frameworks
  const consultationService = createNationalCurriculumConsultationService([
    adaptFixture2012ToNationalCurriculumFixture(fixture2012)[0],
    adaptFixture2025ToNationalCurriculumFixture(fixture2025)[0]
  ]);

  return {
    compare(
      leftFrameworkId: string,
      rightFrameworkId: string,
      scope: ComparisonScope = {}
    ): NationalCurriculumComparisonResult {
      // Get areas for each framework
      const leftAreas = getAreasForFramework(leftFrameworkId, scope);
      const rightAreas = getAreasForFramework(rightFrameworkId, scope);

      // Get content for each framework using the consultation service
      const leftContent = consultationService.listContent({
        frameworkId: leftFrameworkId,
        schoolOrder: scope.schoolOrder,
        disciplineCode: scope.disciplineCode,
        sourceAreaKind: scope.sourceAreaKind,
        sourceAreaCode: scope.sourceAreaCode,
        normativeCheckpoint: scope.normativeCheckpoint
        // Note: nodeType and text are not in our scope, so we leave them undefined
      });

      const rightContent = consultationService.listContent({
        frameworkId: rightFrameworkId,
        schoolOrder: scope.schoolOrder,
        disciplineCode: scope.disciplineCode,
        sourceAreaKind: scope.sourceAreaKind,
        sourceAreaCode: scope.sourceAreaCode,
        normativeCheckpoint: scope.normativeCheckpoint
      });

      // Compute structural differences
      const differences: StructuralDifference[] = [];

      // 1. Area differences
      const leftAreaKeys = new Set(leftAreas.map(areaKey));
      const rightAreaKeys = new Set(rightAreas.map(areaKey));

      for (const area of leftAreas) {
        if (!rightAreaKeys.has(areaKey(area))) {
          differences.push({
            kind: 'area-only-left',
            description: `Area "${area.title}" (code: ${area.code}, discipline: ${area.disciplineCode ?? 'null'}) exists only in ${leftFrameworkId}`,
            leftRef: area.id
          });
        }
      }

      for (const area of rightAreas) {
        if (!leftAreaKeys.has(areaKey(area))) {
          differences.push({
            kind: 'area-only-right',
            description: `Area "${area.title}" (code: ${area.code}, discipline: ${area.disciplineCode ?? 'null'}) exists only in ${rightFrameworkId}`,
            rightRef: area.id
          });
        }
      }

      // 2. Checkpoint differences
      const leftCheckpoints = new Set();
      const rightCheckpoints = new Set();
      
      leftContent.forEach(item => {
        if (item.normativeCheckpoint !== undefined) {
          leftCheckpoints.add(item.normativeCheckpoint);
        }
      });
      rightContent.forEach(item => {
        if (item.normativeCheckpoint !== undefined) {
          rightCheckpoints.add(item.normativeCheckpoint);
        }
      });

      for (const cp of leftCheckpoints) {
        if (!rightCheckpoints.has(cp)) {
          differences.push({
            kind: 'checkpoint-only-left',
            description: `Checkpoint "${cp}" exists only in ${leftFrameworkId}`
          });
        }
      }

      for (const cp of rightCheckpoints) {
        if (!leftCheckpoints.has(cp)) {
          differences.push({
            kind: 'checkpoint-only-right',
            description: `Checkpoint "${cp}" exists only in ${rightFrameworkId}`
          });
        }
      }

      // 3. Node type differences
      const leftNodeTypes = new Set(leftContent.map(item => item.nodeType));
      const rightNodeTypes = new Set(rightContent.map(item => item.nodeType));

      for (const nt of leftNodeTypes) {
        if (!rightNodeTypes.has(nt)) {
          differences.push({
            kind: 'node-type-only-left',
            description: `Node type "${nt}" exists only in ${leftFrameworkId}`
          });
        }
      }

      for (const nt of rightNodeTypes) {
        if (!leftNodeTypes.has(nt)) {
          differences.push({
            kind: 'node-type-only-right',
            description: `Node type "${nt}" exists only in ${rightFrameworkId}`
          });
        }
      }

      // 4. Applicability differences (for common areas)
      const leftAreaMap = new Map(leftAreas.map(area => [areaKey(area), area]));
      const rightAreaMap = new Map(rightAreas.map(area => [areaKey(area), area]));

      for (const [key, leftArea] of leftAreaMap) {
        const rightArea = rightAreaMap.get(key);
        if (rightArea) {
          // Compare frameworkApplicability
          const leftApplicability = leftArea.frameworkApplicability;
          const rightApplicability = rightArea.frameworkApplicability;
          if (
            (leftApplicability === undefined && rightApplicability !== undefined) ||
            (leftApplicability !== undefined && rightApplicability === undefined) ||
            (leftApplicability !== undefined && rightApplicability !== undefined &&
              JSON.stringify(leftApplicability) !== JSON.stringify(rightApplicability))
          ) {
            differences.push({
              kind: 'applicability-difference',
              description: `frameworkApplicability differs for area "${leftArea.title}": left=${JSON.stringify(leftApplicability)}, right=${JSON.stringify(rightApplicability)}`,
              leftRef: leftArea.id,
              rightRef: rightArea.id
            });
          }
        }
      }

      // Sort differences deterministically
      differences.sort((a, b) => {
        if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
        if (a.description !== b.description) return a.description.localeCompare(b.description);
        const leftRefA = a.leftRef ?? '';
        const leftRefB = b.leftRef ?? '';
        if (leftRefA !== leftRefB) return leftRefA.localeCompare(leftRefB);
        const rightRefA = a.rightRef ?? '';
        const rightRefB = b.rightRef ?? '';
        return rightRefA.localeCompare(rightRefB);
      });

      return {
        left: {
          frameworkId: leftFrameworkId,
          areas: leftAreas,
          items: leftContent
        },
        right: {
          frameworkId: rightFrameworkId,
          areas: rightAreas,
          items: rightContent
        },
        structuralDifferences: differences
      };
    }
  };
}