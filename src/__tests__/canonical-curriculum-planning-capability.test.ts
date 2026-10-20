import { describe, expect, it } from 'vitest';
import canonicalExploreSource from '../features/curriculum/components/CanonicalCurricoloExploreTrama.tsx?raw';
import professionalReaderSource from '../features/curriculum/components/ProfessionalCurriculumReader.tsx?raw';
import workspaceSource from '../features/curriculum/CurriculumWorkspace.tsx?raw';
import canonicalArtifact from '../features/curriculum/data/canonicalCurricoloV13.generated.json';

describe('canonical curriculum planning capability boundary', () => {
  it('does not expose the planning action for materialized domains without a compatible planning consumer', () => {
    expect(JSON.stringify(canonicalArtifact)).toContain('ai-literacy');
    expect(workspaceSource).not.toContain("'ai-literacy':");

    expect(workspaceSource).toContain(
      'const canUseCurriculumContextInPlanning = (context: CurriculumExploreContext) => Boolean(toPlanningDisciplineId(context.disciplineId));',
    );
    expect(workspaceSource).toContain('canUseInPlanning={canUseCurriculumContextInPlanning}');
    expect(professionalReaderSource).toContain('canUseInPlanning: (context: CurriculumExploreContext) => boolean;');
    expect(professionalReaderSource).toContain('canUseInPlanning={canUseInPlanning}');
    expect(canonicalExploreSource).toContain('canUseInPlanning?: (context: CurricoloExploreContext) => boolean;');
    expect(canonicalExploreSource).toContain(
      'const planningAvailable = Boolean(onUseInPlanning && scope.targetClass && (canUseInPlanning ? canUseInPlanning(context) : true));',
    );
    expect(canonicalExploreSource).toContain('{planningAvailable && (');
  });
});
