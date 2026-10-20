import { describe, expect, it } from 'vitest';
import workspaceSource from '../features/curriculum/CurriculumWorkspace.tsx?raw';
import professionalReaderSource from '../features/curriculum/components/ProfessionalCurriculumReader.tsx?raw';
import canonicalExploreSource from '../features/curriculum/components/CanonicalCurricoloExploreTrama.tsx?raw';

describe('canonical curricolo -> planning compatibility boundary', () => {
  it('maps canonical discipline identifiers to the legacy planning identifiers before navigation', () => {
    for (const [canonicalId, planningId] of [
      ['lingua-inglese', 'inglese'],
      ['seconda-lingua-comunitaria-francese', 'secondaLingua'],
      ['arte-e-immagine', 'arteImmagine'],
      ['educazione-fisica', 'educazioneFisica'],
      ['educazione-motoria-fisica', 'educazioneFisica'],
      ['educazione-civica', 'educazioneCivica'],
      ['irc', 'religione'],
      ['latino-lel', 'latino'],
    ]) {
      expect(workspaceSource).toContain(`'${canonicalId}': '${planningId}'`);
    }

    expect(workspaceSource).toContain('toPlanningDisciplineId(context.disciplineId)');
    expect(workspaceSource).toContain('setDiscipline(planningDisciplineId)');
    expect(workspaceSource).not.toContain('setDiscipline(context.disciplineId)');
  });

  it('fails closed when a canonical domain has no compatible planning baseline', () => {
    expect(workspaceSource).toContain("'ai-literacy': null");
    expect(workspaceSource).toContain('if (!planningDisciplineId) return;');
    expect(workspaceSource).toContain('const canUseInPlanning = (context: CurriculumExploreContext) =>');
    expect(professionalReaderSource).toContain('canUseInPlanning={canUseInPlanning}');
    expect(canonicalExploreSource).toContain('canUseInPlanning?: (context: CurricoloExploreContext) => boolean;');
    expect(canonicalExploreSource).toContain('planningAvailable');
  });
});
