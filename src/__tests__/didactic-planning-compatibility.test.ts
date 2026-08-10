import { describe, expect, it } from 'vitest';
import type { UdaModel } from '../types/curriculum';
import { createEntityReference } from '../domain/curriculum/identity';
import { createInitialGuidedWorkflowState } from '../features/guided-workflow/workflow';
import {
  addCurriculumReference,
  createDidacticPlanning,
  curriculumReferenceFromSelection,
  mapGuidedWorkflowStateToPlanning,
  mapLegacyDraftToPlanning,
  mapLegacyUdaToPlanning,
} from '../domain/planning';
import type { DesignCurriculumSelection } from '../domain/design/types';

const selection: DesignCurriculumSelection = {
  id: 'selection-1' as never,
  metadata: {} as never,
  designRef: createEntityReference('design-1' as never, 'teaching-design'),
  sourceArea: 'A02',
  sourceEntityRef: createEntityReference('node-17' as never, 'curriculum-node'),
  sourceVersionRef: createEntityReference('version-2026' as never, 'curriculum-version'),
  curriculumNodeRef: createEntityReference('node-17' as never, 'curriculum-node'),
  curriculumVersionRef: createEntityReference('version-2026' as never, 'curriculum-version'),
  currentTextSnapshot: 'Progetta una soluzione tecnica',
  selectedTextSnapshot: 'Progetta una soluzione tecnica',
  qualification: 'current-curriculum',
  sourceRefs: [createEntityReference('source-1' as never, 'source')],
  evidenceRefs: [],
  transferredAt: '2026-08-10T00:00:00.000Z',
  transferContractVersion: '1.0',
  structuralFootprint: 'fp-1',
  warnings: [],
};

const planning = createDidacticPlanning({
  id: 'planning-1' as never,
  context: { schoolOrder: 'secondaria', discipline: 'tecnologia', classLabel: '2A' },
});

const legacyUda: UdaModel = {
  id: 'uda-1', title: 'UDA storica', discipline: 'tecnologia', order: 'secondaria',
  period: 'Primo Quadrimestre', hours: 12, status: 'bozza',
  traguardi: ['T'], obiettivi: ['O'], evidenze: ['E'], realTask: 'Task', notes: 'Note',
  createdAt: '10/08/2026',
};

describe('P2.1-A canonical DidacticPlanning compatibility', () => {
  it('maps a P1.3 selection to a structured curriculum reference', () => {
    const reference = curriculumReferenceFromSelection(selection);

    expect(reference).toMatchObject({
      nodeId: 'node-17',
      curriculumVersionRef: { id: 'version-2026', entityType: 'curriculum-version' },
      snapshot: 'Progetta una soluzione tecnica',
      provenance: { sourceArea: 'A02', qualification: 'current-curriculum' },
    });
    expect(reference.sourceRefs).toHaveLength(1);
  });

  it('deduplicates the same node and curriculum version without mutation', () => {
    const reference = curriculumReferenceFromSelection(selection);
    const once = addCurriculumReference(planning, reference);
    const twice = addCurriculumReference(once, reference);

    expect(planning.curriculumReferences).toHaveLength(0);
    expect(once.curriculumReferences).toHaveLength(1);
    expect(twice.curriculumReferences).toHaveLength(1);
    expect(twice.curriculumReferences[0]).toEqual(reference);
  });

  it('maps saved draft fields and reports unknown legacy fields', () => {
    const result = mapLegacyDraftToPlanning({
      title: 'Bozza tecnologia', discipline: 'tecnologia', schoolOrder: 'secondaria', classLabel: '2A',
      period: 'Primo Quadrimestre', hours: 10, notes: 'Note', unsupportedLegacyFlag: true,
    });

    expect(result.planning?.content).toMatchObject({ title: 'Bozza tecnologia', period: 'Primo Quadrimestre', hours: 10, notes: 'Note' });
    expect(result.unmappedFields).toContain('unsupportedLegacyFlag');
    expect(result.warnings.some(warning => warning.code === 'UNMAPPED_LEGACY_FIELD')).toBe(true);
  });

  it('maps the same legacy draft deterministically when the mapping timestamp is fixed', () => {
    const draft = { title: 'Bozza', discipline: 'tecnologia', schoolOrder: 'secondaria' as const };
    const first = mapLegacyDraftToPlanning(draft, '2026-08-10T00:00:00.000Z');
    const second = mapLegacyDraftToPlanning(draft, '2026-08-10T00:00:00.000Z');

    expect(second.planning).toEqual(first.planning);
  });

  it('preserves a legacy UDA as an artifact without inventing planning history', () => {
    const result = mapLegacyUdaToPlanning(legacyUda);

    expect(result.artifact).toEqual(legacyUda);
    expect(result.planning).toBeUndefined();
    expect(result.warnings.some(warning => warning.code === 'PLANNING_HISTORY_UNAVAILABLE')).toBe(true);
  });

  it('does not promote guided workflow presentation state to domain truth', () => {
    const result = mapGuidedWorkflowStateToPlanning({
      ...createInitialGuidedWorkflowState(),
      currentStep: 'teaching-design',
      selectedCurriculumRefs: [createEntityReference('node-17' as never, 'curriculum-node')],
    });

    expect(result.planning).toBeUndefined();
    expect(result.warnings.some(warning => warning.code === 'PRESENTATION_STATE_NOT_DOMAIN_SOURCE')).toBe(true);
  });
});
