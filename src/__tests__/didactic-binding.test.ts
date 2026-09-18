import { describe, expect, it } from 'vitest';
import {
  buildDidacticBinding,
  resolveCurriculumClassOrAgeBand,
} from '../domain/curriculum/didacticBinding';

describe('DidacticBinding', () => {
  it('lega la progettazione al master canonico corrente senza attribuirgli vigenza', () => {
    const binding = buildDidacticBinding({
      targetType: 'uda',
      order: 'secondaria',
      targetClass: '1',
      disciplineOrField: 'tecnologia',
      createdAt: '2026-09-07T00:00:00.000Z',
    });

    expect(binding.curriculumUnit.masterId).toBe('CAN-CURR-MASTER-00');
    expect(binding.curriculumUnit.masterDriveFileId).toBe('12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4');
    expect(binding.curriculumUnit.masterVersion).toBe('1.3');
    expect(binding.curriculumUnit.unitKey).toContain('v1.3:secondaria:classe-1:tecnologia');
    expect(binding.curriculumUnit.identityKind).toBe('ARENA_MASTER_CONTEXT_KEY');
    expect(binding.curriculumUnit.resolutionState).toBe('CONTEXT_BOUND');
    expect(binding.curriculumInForce).toBe(false);
    expect(binding.authorityState).toBe('WORKING_BASELINE_NOT_IN_FORCE');
    expect(binding.useScope).toBe('DRAFT_PLANNING_REFERENCE');
    expect(binding.humanProfessionalValidation).toBe('OPEN');
    expect(binding.copiedCurriculumTextIsAuthoritative).toBe(false);
  });

  it('usa la stessa unità curricolare per programmazione e UDA nello stesso contesto, ma distingue il target', () => {
    const common = {
      order: 'primaria' as const,
      targetClass: '1',
      disciplineOrField: 'italiano',
      createdAt: '2026-09-07T00:00:00.000Z',
    };
    const annual = buildDidacticBinding({ targetType: 'annual-planning', ...common });
    const uda = buildDidacticBinding({ targetType: 'uda', ...common });

    expect(annual.curriculumUnit.unitKey).toBe(uda.curriculumUnit.unitKey);
    expect(annual.id).not.toBe(uda.id);
    expect(annual.targetType).toBe('annual-planning');
    expect(uda.targetType).toBe('uda');
  });

  it('mantiene l’Infanzia come fascia di età senza inventare una classe', () => {
    expect(resolveCurriculumClassOrAgeBand('infanzia', '5')).toBe('fascia-3-5');
    const binding = buildDidacticBinding({
      targetType: 'uda',
      order: 'infanzia',
      targetClass: '5',
      disciplineOrField: 'la conoscenza del mondo',
    });
    expect(binding.curriculumUnit.classOrAgeBand).toBe('fascia-3-5');
  });
});
