import { describe, expect, it } from 'vitest';
import { curriculumKB } from '../data/curriculumKB';
import { auditLegacyStructureAgainstDm221 } from '../domain/curriculum/national/legacyStructureAudit';

describe('embedded legacy curriculum vs DM221 canonical structure', () => {
  it('detects legacy discipline projections for infancy instead of treating them as canonical fields', () => {
    const findings = auditLegacyStructureAgainstDm221(curriculumKB);
    const infancyProjectionFindings = findings.filter(
      (finding) => finding.code === 'LEGACY_DISCIPLINE_PROJECTION_FOR_INFANZIA',
    );

    expect(infancyProjectionFindings.length).toBeGreaterThan(0);
    expect(infancyProjectionFindings.every((finding) => finding.severity === 'BLOCKING')).toBe(true);
  });

  it('always reports that the legacy CurriculumMap lacks canonical infancy-field entities', () => {
    const findings = auditLegacyStructureAgainstDm221(curriculumKB);

    expect(findings).toContainEqual(
      expect.objectContaining({
        code: 'INFANZIA_FIELDS_NOT_MODELED_CANONICALLY',
        severity: 'BLOCKING',
      }),
    );
  });

  it('never treats structurally present first-cycle legacy content as source-verified', () => {
    const findings = auditLegacyStructureAgainstDm221(curriculumKB);
    const present = findings.filter(
      (finding) => finding.code === 'FIRST_CYCLE_DISCIPLINE_PRESENT_UNVERIFIED',
    );

    expect(present.length).toBeGreaterThan(0);
    expect(present.every((finding) => finding.severity === 'REVIEW')).toBe(true);
  });
});
