import { describe, expect, it } from 'vitest';
import type { EntityId, EntityReference } from '../domain/curriculum/identity/types';
import type { UdaModel } from '../types/curriculum';
import {
  buildPlanningCatalogue,
  createDidacticPlanning,
  type PlanningCatalogueInput,
} from '../domain/planning';

const ref = (id: string): EntityReference => ({ entityType: 'curriculum-version', id: id as EntityReference['id'] });
const entityId = (id: string): EntityId => id as EntityId;

const planning = createDidacticPlanning({
  id: entityId('planning-1'),
  context: { schoolOrder: 'secondaria', discipline: 'tecnologia', classLabel: '2A' },
  content: { title: 'Energia e territorio', objectives: ['Comprendere i consumi'] },
  curriculumReferences: [
    {
      nodeId: 'node-1',
      curriculumVersionRef: ref('version-2026'),
      snapshot: 'Riferimento canonico',
      provenance: {
        sourceArea: 'A02',
        qualification: 'current-curriculum',
        sourceEntityRef: ref('source-1'),
      },
      sourceRefs: [],
      evidenceRefs: [],
    },
  ],
  status: 'in_progress',
  createdAt: '2026-08-01T09:00:00.000Z',
  updatedAt: '2026-08-02T09:00:00.000Z',
});

const historicalUda: UdaModel = {
  id: 'uda-historical', title: 'UDA storica', discipline: 'tecnologia', order: 'secondaria',
  period: 'Primo quadrimestre', hours: 12, status: 'archiviata', traguardi: [], obiettivi: [],
  evidenze: [], realTask: 'Compito', notes: '', createdAt: '2026-07-01',
};

describe('P2.1-B canonical planning catalogue', () => {
  it('lists a canonical Planning once with semantic status and reference count', () => {
    const catalogue = buildPlanningCatalogue({ plannings: [planning] });

    expect(catalogue).toHaveLength(1);
    expect(catalogue[0]).toMatchObject({
      id: 'planning-1', title: 'Energia e territorio', status: 'in_progress',
      statusLabel: 'Da continuare', curriculumReferenceCount: 1,
    });
  });

  it('reconstructs a compatible legacy draft without exposing the legacy source', () => {
    const catalogue = buildPlanningCatalogue({
      compatibilityResults: [{
        sourceKind: 'legacy-draft',
        planning: { ...planning, id: entityId('planning-legacy-1'), reconstruction: 'partial', content: { ...planning.content, title: 'Bozza recuperabile' } },
        mappedFields: ['title'], unmappedFields: [], warnings: [],
      }],
    });

    expect(catalogue[0]).toMatchObject({ id: 'planning-legacy-1', title: 'Bozza recuperabile', reconstruction: 'partial' });
    expect(catalogue[0]).not.toHaveProperty('sourceKind');
  });

  it('does not turn a historical UDA without Planning evidence into a Planning', () => {
    const input: PlanningCatalogueInput = { udaArtifacts: [historicalUda] };
    expect(buildPlanningCatalogue(input)).toEqual([]);
  });

  it('shows a derived UDA only when the canonical Planning carries its reference', () => {
    const linked = { ...planning, derivedArtifactRef: { entityType: 'document', id: 'uda-linked' } as EntityReference };
    const catalogue = buildPlanningCatalogue({
      plannings: [linked],
      udaArtifacts: [{ ...historicalUda, id: 'uda-linked', title: 'UDA derivata' }],
    });

    expect(catalogue[0].derivedArtifact).toMatchObject({ id: 'uda-linked', title: 'UDA derivata' });
  });

  it('orders entries deterministically by latest update', () => {
    const older = { ...planning, id: entityId('older'), updatedAt: '2026-08-01T09:00:00.000Z' };
    const newer = { ...planning, id: entityId('newer'), updatedAt: '2026-08-03T09:00:00.000Z' };
    expect(buildPlanningCatalogue({ plannings: [older, newer] }).map(entry => entry.id)).toEqual(['newer', 'older']);
  });

  it('deduplicates the same Planning converging from compatible sources', () => {
    const compatible = { sourceKind: 'legacy-draft' as const, planning: { ...planning, reconstruction: 'partial' as const }, mappedFields: [], unmappedFields: [], warnings: [] };
    expect(buildPlanningCatalogue({ plannings: [planning], compatibilityResults: [compatible] }).map(entry => entry.id)).toEqual(['planning-1']);
  });
});
