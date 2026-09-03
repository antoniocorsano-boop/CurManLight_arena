import { describe, expect, it } from 'vitest';
import {
  buildTechnologySourceReviewQueue,
  promoteTechnologyElementFromHumanReceipt,
  type TechnologySourceVerificationReceipt,
} from '../domain/curriculum/national/technologyHumanVerification';
import {
  buildTechnologyOperationalPilot,
  buildTechnologyPlanningHandoff,
} from '../domain/curriculum/technology/technologyOperationalPilot';
import {
  TECHNOLOGY_INSTITUTIONAL_DRAFT_NUCLEI,
  TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE,
} from '../domain/curriculum/technology/technologyInstitutionalDraft';
import {
  canArtifactBeAdopted,
  TECHNOLOGY_ARTIFACT_DEFINITIONS,
} from '../domain/curriculum/technology/technologyArtifacts';
import { validateOperationalCurriculumAggregate } from '../domain/curriculum/operationalContract';

const createdAt = '2026-09-03T14:50:00+02:00';

function verifiedReceiptForOrder(order: 'primaria' | 'secondaria'): TechnologySourceVerificationReceipt {
  const task = buildTechnologySourceReviewQueue().find(candidate => candidate.schoolOrder === order);
  if (!task) throw new Error(`Missing technology review task for ${order}`);
  return {
    schemaVersion: 'dm221-tech-source-review-v1',
    elementId: task.elementId,
    sourceId: task.sourceId,
    page: task.page,
    section: task.section,
    ordinal: task.ordinal,
    decision: 'VERIFIED',
    verifiedSourceText: `Testo verificato sulla fonte ufficiale per ${task.elementId}.`,
    reviewerAttestation: true,
    reviewedAt: createdAt,
  };
}

describe('R7C2 Technology end-to-end pilot', () => {
  it('builds the nine-nucleus institutional working draft without claiming adoption', async () => {
    const pilot = await buildTechnologyOperationalPilot({
      institutionId: 'istituto-pilota',
      curriculumVersionRef: 'technology:2026-2027:draft-v1',
      createdAt,
    });

    expect(TECHNOLOGY_INSTITUTIONAL_DRAFT_NUCLEI).toHaveLength(9);
    expect(pilot.aggregate.authority.state).toBe('NON_AUTHORITATIVE');
    expect(pilot.aggregate.semanticStatus).toBe('STRUCTURAL_ONLY');
    expect(pilot.institutionalContext.authorityStatus).toBe('WORKING_DRAFT_NOT_ADOPTED');
    expect(TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE.authorityStatus).toBe('WORKING_DRAFT_NOT_ADOPTED');
    expect(pilot.aggregate.segments).toHaveLength(9);
    expect(pilot.aggregate.nodes).toHaveLength(36);
    expect(pilot.aggregate.links).toHaveLength(9);
    expect(validateOperationalCurriculumAggregate(pilot.aggregate).valid).toBe(true);
  });

  it('preserves the source terminology of the institutional Technology draft', async () => {
    const pilot = await buildTechnologyOperationalPilot({
      institutionId: 'istituto-pilota',
      curriculumVersionRef: 'technology:2026-2027:draft-v1',
      createdAt,
    });

    expect(TECHNOLOGY_INSTITUTIONAL_DRAFT_NUCLEI.map(nucleus => nucleus.label)).toContain(
      'Digitale, dati, informatica, IA e cittadinanza tecnologica',
    );
    expect(pilot.institutionalContext.finalities).toHaveLength(5);
    expect(pilot.institutionalContext.exitProfile).toHaveLength(6);
    expect(pilot.aggregate.nodes.some(node => node.text.includes('Dato, informazione, algoritmo'))).toBe(true);
    expect(pilot.aggregate.nodes.every(node => node.authorityLevel === 'LOCAL_WORKING')).toBe(true);
  });

  it('keeps the class 1-2-3 progression as explicit source-derived records', async () => {
    const pilot = await buildTechnologyOperationalPilot({
      institutionId: 'istituto-pilota',
      curriculumVersionRef: 'technology:2026-2027:draft-v1',
      createdAt,
    });

    expect(pilot.progressionEntries).toHaveLength(27);
    expect(pilot.progressionLinks).toHaveLength(18);
    const drawing = pilot.progressionEntries.filter(entry => entry.nucleusId === 'DISEGNO_MODELLAZIONE');
    expect(drawing.map(entry => entry.grade)).toEqual(['prima', 'seconda', 'terza']);
    expect(drawing.map(entry => entry.text)).toEqual([
      'Strumenti, costruzioni geometriche, precisione.',
      'Scale, viste, quotature, schemi funzionali.',
      'Assonometrie, prospettiva/CAD, modellazione.',
    ]);
  });

  it('creates all A-H artifacts as version-bound working objects and keeps decision artifacts blocked', async () => {
    const pilot = await buildTechnologyOperationalPilot({
      institutionId: 'istituto-pilota',
      curriculumVersionRef: 'technology:2026-2027:draft-v1',
      createdAt,
    });

    expect(TECHNOLOGY_ARTIFACT_DEFINITIONS).toHaveLength(8);
    expect(pilot.artifacts.map(artifact => artifact.code)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    expect(pilot.artifacts.every(artifact => artifact.curriculumVersionRef === pilot.aggregate.curriculumVersionRef)).toBe(true);

    const matrix = pilot.artifacts.find(artifact => artifact.code === 'A');
    const minutes = pilot.artifacts.find(artifact => artifact.code === 'H');
    expect(matrix?.status).toBe('DECISION_REQUIRED');
    expect(minutes?.status).toBe('DECISION_REQUIRED');
    expect(matrix && canArtifactBeAdopted(matrix)).toBe(false);
    expect(minutes && canArtifactBeAdopted(minutes)).toBe(false);
  });

  it('hands off stable curriculum refs and snapshots to planning instead of text-only selections', async () => {
    const pilot = await buildTechnologyOperationalPilot({
      institutionId: 'istituto-pilota',
      curriculumVersionRef: 'technology:2026-2027:draft-v1',
      createdAt,
    });
    const selected = pilot.aggregate.nodes.slice(0, 2).map(node => node.nodeRef);
    const handoff = buildTechnologyPlanningHandoff(pilot, selected);

    expect(handoff.curriculumVersionRef).toBe('technology:2026-2027:draft-v1');
    expect(handoff.nodeRefs).toEqual(selected);
    expect(handoff.requirements.every(requirement => Boolean(requirement.segmentRef))).toBe(true);
    expect(handoff.requirements.every(requirement => Boolean(requirement.snapshotText))).toBe(true);
    expect(handoff.status).toBe('WORKING_DRAFT_ONLY');
    expect(() => buildTechnologyPlanningHandoff(pilot, ['missing-node'])).toThrow(/PLANNING_NODE_NOT_FOUND/);
  });

  it('adds a human-verified lower-secondary national element as NATIONAL_PRESCRIPTIVE without adopting the draft', async () => {
    const verified = promoteTechnologyElementFromHumanReceipt(verifiedReceiptForOrder('secondaria'));
    const pilot = await buildTechnologyOperationalPilot({
      institutionId: 'istituto-pilota',
      curriculumVersionRef: 'technology:2026-2027:draft-v1',
      createdAt,
      verifiedNationalElements: [verified],
    });

    expect(pilot.aggregate.semanticStatus).toBe('ELEMENT_BOUND');
    expect(pilot.aggregate.authority.state).toBe('NON_AUTHORITATIVE');
    expect(pilot.nationalSourceReview.verifiedCount).toBe(1);

    const nationalNode = pilot.aggregate.nodes.find(node => node.authorityLevel === 'NATIONAL_PRESCRIPTIVE');
    expect(nationalNode).toBeDefined();
    expect(nationalNode?.origin).toBe('normative-source');
    expect(nationalNode?.nationalElementEvidence[0]?.binding.elementId).toBe(verified.elementId);
    expect(validateOperationalCurriculumAggregate(pilot.aggregate).valid).toBe(true);

    const handoff = buildTechnologyPlanningHandoff(pilot, [nationalNode!.nodeRef]);
    expect(handoff.status).toBe('SOURCE_VERIFIED_REFERENCE_SET');
  });

  it('never infers a mapping from the nine institutional nuclei to national elements', async () => {
    const verified = promoteTechnologyElementFromHumanReceipt(verifiedReceiptForOrder('secondaria'));
    const pilot = await buildTechnologyOperationalPilot({
      institutionId: 'istituto-pilota',
      curriculumVersionRef: 'technology:2026-2027:draft-v1',
      createdAt,
      verifiedNationalElements: [verified],
    });

    const institutionalNodes = pilot.aggregate.nodes.filter(node => node.authorityLevel === 'LOCAL_WORKING');
    expect(institutionalNodes).toHaveLength(36);
    expect(institutionalNodes.every(node => node.nationalElementEvidence.length === 0)).toBe(true);
    expect(pilot.aggregate.links.every(link => !link.fromNodeRef.startsWith('technology-national-node:'))).toBe(true);
    expect(pilot.aggregate.links.every(link => !link.toNodeRef.startsWith('technology-national-node:'))).toBe(true);
  });

  it('rejects primary-school national elements from the lower-secondary pilot', async () => {
    const primary = promoteTechnologyElementFromHumanReceipt(verifiedReceiptForOrder('primaria'));
    await expect(buildTechnologyOperationalPilot({
      institutionId: 'istituto-pilota',
      curriculumVersionRef: 'technology:2026-2027:draft-v1',
      createdAt,
      verifiedNationalElements: [primary],
    })).rejects.toThrow(/ORDER_MISMATCH/);
  });
});
