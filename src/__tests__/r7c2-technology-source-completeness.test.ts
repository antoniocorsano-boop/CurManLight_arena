import { describe, expect, it } from 'vitest';
import {
  TECHNOLOGY_INSTITUTIONAL_ASSESSMENT,
  TECHNOLOGY_INSTITUTIONAL_CROSS_CURRICULAR,
  TECHNOLOGY_INSTITUTIONAL_GOVERNANCE_RULES,
  TECHNOLOGY_INSTITUTIONAL_GUIDING_PRINCIPLE,
  TECHNOLOGY_INSTITUTIONAL_METHODOLOGIES,
} from '../domain/curriculum/technology/technologyInstitutionalCompanion';
import {
  TECHNOLOGY_ARTIFACT_TEMPLATE_SCHEMAS,
  getTechnologyArtifactTemplateSchema,
} from '../domain/curriculum/technology/technologyArtifactSchemas';

describe('R7C2 Technology source completeness snapshot', () => {
  it('preserves the curriculum-level guiding principle and companion sections', () => {
    expect(TECHNOLOGY_INSTITUTIONAL_GUIDING_PRINCIPLE).toContain('cultura del progetto');
    expect(TECHNOLOGY_INSTITUTIONAL_METHODOLOGIES).toHaveLength(6);
    expect(TECHNOLOGY_INSTITUTIONAL_CROSS_CURRICULAR).toHaveLength(5);
    expect(TECHNOLOGY_INSTITUTIONAL_ASSESSMENT).toHaveLength(6);
    expect(TECHNOLOGY_INSTITUTIONAL_GOVERNANCE_RULES).toHaveLength(4);
  });

  it('keeps the curriculum document terminology instead of replacing it with the personal meeting-note structure', () => {
    expect(TECHNOLOGY_INSTITUTIONAL_METHODOLOGIES.map(entry => entry.method)).toEqual([
      'Laboratorio',
      'Project Based Learning',
      'Inquiry e problem solving',
      'Cooperative learning',
      'UDL',
      'Didattica digitale e IA prudente',
    ]);
    expect(TECHNOLOGY_INSTITUTIONAL_CROSS_CURRICULAR.map(entry => entry.area)).toEqual([
      'Educazione civica',
      'Orientamento',
      'Inclusione',
      'Territorio',
      'Continuità',
    ]);
  });

  it('represents every annex A-H with a structured field schema', () => {
    expect(TECHNOLOGY_ARTIFACT_TEMPLATE_SCHEMAS).toHaveLength(8);
    expect(TECHNOLOGY_ARTIFACT_TEMPLATE_SCHEMAS.map(schema => schema.code)).toEqual([
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    ]);
    expect(TECHNOLOGY_ARTIFACT_TEMPLATE_SCHEMAS.every(schema => schema.groups.length > 0)).toBe(true);
    expect(TECHNOLOGY_ARTIFACT_TEMPLATE_SCHEMAS.every(schema => schema.groups.every(group => group.fieldKeys.length > 0))).toBe(true);
  });

  it('keeps UDA traceability fields and decision-register fields machine-readable', () => {
    const uda = getTechnologyArtifactTemplateSchema('C');
    const minutes = getTechnologyArtifactTemplateSchema('H');
    const udaFields = uda.groups.flatMap(group => group.fieldKeys);
    const decisionFields = minutes.groups.flatMap(group => group.fieldKeys);

    expect(udaFields).toEqual(expect.arrayContaining([
      'nucleusRefs',
      'essentialKnowledge',
      'skills',
      'expectedCompetence',
      'assessableEvidence',
      'humanSupervision',
      'privacyAndSecurity',
    ]));
    expect(decisionFields).toEqual(expect.arrayContaining([
      'decisionId',
      'decision',
      'motivationOrEvidence',
      'affectedDocument',
      'status',
    ]));
  });
});
