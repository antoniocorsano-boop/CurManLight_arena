import type { TechnologyOperationalPilotPackage } from './technologyOperationalPilot';
import { DM221_TECHNOLOGY_ELEMENT_INVENTORY } from '../national/technologyElementInventory';
import {
  analyzeCurriculumSemanticCoverage,
  type CurriculumSemanticAnalysisResult,
  type CurriculumSemanticReviewReceipt,
} from '../../institution/curriculumSemanticAnalysis';

export const DM221_LOWER_SECONDARY_TECHNOLOGY_ELEMENT_INVENTORY =
  DM221_TECHNOLOGY_ELEMENT_INVENTORY.filter(element => element.schoolOrder === 'secondaria');

export interface TechnologySemanticAnalysisPackage {
  packageVersion: 'r7c3-technology-semantic-analysis-v1';
  scope: 'LOWER_SECONDARY_TECHNOLOGY';
  nationalElementCount: number;
  analysis: CurriculumSemanticAnalysisResult;
}

export function analyzeTechnologySemanticCoverage(input: {
  pilot: TechnologyOperationalPilotPackage;
  reviews?: readonly CurriculumSemanticReviewReceipt[];
}): TechnologySemanticAnalysisPackage {
  const analysis = analyzeCurriculumSemanticCoverage({
    aggregate: input.pilot.aggregate,
    nationalInventory: DM221_LOWER_SECONDARY_TECHNOLOGY_ELEMENT_INVENTORY,
    reviews: input.reviews ?? [],
  });

  return {
    packageVersion: 'r7c3-technology-semantic-analysis-v1',
    scope: 'LOWER_SECONDARY_TECHNOLOGY',
    nationalElementCount: DM221_LOWER_SECONDARY_TECHNOLOGY_ELEMENT_INVENTORY.length,
    analysis,
  };
}
