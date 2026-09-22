import { describe, expect, it } from 'vitest';
import type { EntityReference } from '../../domain/curriculum/identity/types';
import type { DisciplineCode } from '../../domain/curriculum/model/vocabularies';
import type { CurriculumNode } from '../../domain/curriculum/node';
import type { CurriculumSegment } from '../../domain/curriculum/segment';
import type { InstituteCurriculumVersion } from '../../domain/curriculum/version';
import type {
  CivicEducationAnnualAllocation,
  CivicEducationAnnualFramework,
  CivicEducationInfanziaMapping,
  CivicEducationCurriculumBindingContext,
} from '../../domain/curriculum/civicEducationFramework';
import {
  CIVIC_EDUCATION_FRAMEWORK_SCHEMA_VERSION,
  canProjectCivicEducationFramework,
  cloneCivicEducationFrameworkForAcademicYear,
  evaluateCivicEducationApprovalGate,
  validateCivicEducationAnnualFramework,
  validateCivicEducationCurriculumBindings,
  validateCivicEducationFrameworkSet,
} from '../../domain/curriculum/civicEducationFramework';

function objectiveRef(id: string): EntityReference {
  return {
    id: id as EntityReference['id'],
    entityType: 'curriculum-node',
    snapshotLabel: id,
  };
}

function allocation(
  id: string,
  disciplineCode: Exclude<DisciplineCode, 'educazione-civica'>,
  annualHours: number,
  nucleusIds: CivicEducationAnnualAllocation['nucleusIds'],
): CivicEducationAnnualAllocation {
  return {
    id,
    target: { type: 'discipline', disciplineCode },
    annualHours,
    nucleusIds,
    objectiveRefs: [objectiveRef(`objective-${id}`)],
  };
}

function normativeVerification(
  overrides: Partial<NonNullable<CivicEducationAnnualFramework['normativeVerification']>> = {},
): NonNullable<CivicEducationAnnualFramework['normativeVerification']> {
  return {
    automaticCheck: true,
    checkedAt: '2026-09-22T08:00:00Z',
    verifiedFrameworkVersion: '2026-27-v1',
    sources: [
      {
        id: 'mim-dm183',
        authority: 'MIM',
        title: 'D.M. 183/2024 e Linee guida Educazione civica',
        url: 'https://www.mim.gov.it/educazione-civica',
        checkedAt: '2026-09-22T08:00:00Z',
        outcome: 'unchanged',
      },
      {
        id: 'normattiva-l92',
        authority: 'NORMATTIVA',
        title: 'Legge 20 agosto 2019, n. 92',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2019-08-20;92',
        checkedAt: '2026-09-22T08:00:00Z',
        outcome: 'unchanged',
      },
    ],
    result: 'no-relevant-change',
    humanConfirmedAt: '2026-09-22T08:05:00Z',
    humanConfirmedByRole: 'referente',
    ...overrides,
  };
}

function primaryFramework(
  overrides: Partial<CivicEducationAnnualFramework> = {},
): CivicEducationAnnualFramework {
  return {
    schemaVersion: CIVIC_EDUCATION_FRAMEWORK_SCHEMA_VERSION,
    id: 'civic-primaria-2026',
    institutionId: 'institute-1',
    curriculumVersionId: 'curriculum-2026',
    academicYear: { startYear: 2026, endYear: 2027 },
    schoolOrder: 'primaria',
    versionLabel: '2026-27-v1',
    status: 'under-review',
    allocations: [
      allocation('italiano', 'italiano', 11, ['costituzione']),
      allocation('scienze', 'scienze', 11, ['sviluppo-economico-sostenibilita']),
      allocation('tecnologia', 'tecnologia', 11, ['cittadinanza-digitale']),
    ],
    infanziaMappings: [],
    normativeVerification: normativeVerification(),
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T08:00:00Z',
    ...overrides,
  };
}

function infanziaMapping(id: string): CivicEducationInfanziaMapping {
  return {
    id,
    experienceFieldId: 'il-se-e-l-altro',
    citizenshipAreaId: 'convivenza-responsabile',
    objectiveRefs: [objectiveRef(`objective-${id}`)],
  };
}

function bindingContext(
  framework: CivicEducationAnnualFramework,
  options: {
    curriculumStatus?: InstituteCurriculumVersion['status'];
    nodeType?: CurriculumNode['type'];
    segmentSubject?: string;
    curriculumVersionId?: string;
    curriculumInstitutionId?: string;
  } = {},
): CivicEducationCurriculumBindingContext {
  const curriculumVersionId = options.curriculumVersionId ?? framework.curriculumVersionId;
  const segmentId = `segment-${framework.schoolOrder}`;
  const curriculumVersion: InstituteCurriculumVersion = {
    id: curriculumVersionId,
    institutionId: options.curriculumInstitutionId ?? framework.institutionId,
    title: `Curricolo ${framework.versionLabel}`,
    versionNumber: framework.versionLabel,
    status: options.curriculumStatus ?? 'approved',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T08:00:00Z',
    approvedAt: options.curriculumStatus === 'draft' ? undefined : '2026-09-22T07:00:00Z',
  };

  const segment: CurriculumSegment = {
    id: segmentId,
    versionId: curriculumVersionId,
    schoolLevel: framework.schoolOrder,
    subjectOrFieldId: options.segmentSubject
      ?? (framework.schoolOrder === 'infanzia' ? 'il-se-e-l-altro' : 'educazione-civica'),
    scope: { type: 'school-level' },
    frameworkApplicability: {
      framework: 'IN2025',
      resolutionStatus: 'resolved',
      resolutionReason: 'EC-01',
    },
    workStatus: 'effective',
    content: {
      traguardi: [],
      obiettivi: [],
      evidenze: [],
      conoscenze: [],
      abilita: [],
      competenze: [],
      nucleiFondanti: [],
      proposals: [],
    },
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T08:00:00Z',
  };

  const refs = framework.schoolOrder === 'infanzia'
    ? framework.infanziaMappings.flatMap(mapping => mapping.objectiveRefs)
    : framework.allocations.flatMap(item => item.objectiveRefs);

  const nodes: CurriculumNode[] = refs.map(ref => ({
    id: String(ref.id),
    versionId: curriculumVersionId,
    segmentId,
    type: options.nodeType ?? 'objective',
    title: ref.snapshotLabel ?? String(ref.id),
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T08:00:00Z',
  }));

  return { curriculumVersion, segments: [segment], nodes };
}

describe('EC-01/Arena-F1 — quadro annuale Educazione civica', () => {
  it('rende approvabile un quadro primaria da 33 ore con verifica normativa completa', () => {
    const framework = primaryFramework();
    const gate = evaluateCivicEducationApprovalGate(framework, bindingContext(framework), [framework]);

    expect(gate.totalAnnualHours).toBe(33);
    expect(gate.uncoveredNuclei).toEqual([]);
    expect(gate.approvable).toBe(true);
  });

  it('blocca un quadro primaria sotto le 33 ore', () => {
    const framework = primaryFramework({
      allocations: [
        allocation('italiano', 'italiano', 10.5, ['costituzione']),
        allocation('scienze', 'scienze', 11, ['sviluppo-economico-sostenibilita']),
        allocation('tecnologia', 'tecnologia', 11, ['cittadinanza-digitale']),
      ],
    });

    const gate = evaluateCivicEducationApprovalGate(framework, bindingContext(framework), [framework]);

    expect(gate.totalAnnualHours).toBe(32.5);
    expect(gate.approvable).toBe(false);
    expect(gate.issues.some(issue => issue.code === 'CIVIC_MINIMUM_HOURS_NOT_MET')).toBe(true);
  });

  it('ammette un totale superiore a 33 ore', () => {
    const framework = primaryFramework({
      allocations: [
        allocation('italiano', 'italiano', 12, ['costituzione']),
        allocation('scienze', 'scienze', 11, ['sviluppo-economico-sostenibilita']),
        allocation('tecnologia', 'tecnologia', 11, ['cittadinanza-digitale']),
      ],
    });

    const gate = evaluateCivicEducationApprovalGate(framework, bindingContext(framework), [framework]);

    expect(gate.totalAnnualHours).toBe(34);
    expect(gate.approvable).toBe(true);
  });

  it('segnala un nucleo non coperto senza bloccare l’approvabilità', () => {
    const framework = primaryFramework({
      allocations: [
        allocation('italiano', 'italiano', 17, ['costituzione']),
        allocation('scienze', 'scienze', 16, ['sviluppo-economico-sostenibilita']),
      ],
    });

    const gate = evaluateCivicEducationApprovalGate(framework, bindingContext(framework), [framework]);

    expect(gate.uncoveredNuclei).toEqual(['cittadinanza-digitale']);
    expect(gate.issues.some(issue =>
      issue.code === 'CIVIC_NUCLEUS_NOT_COVERED' && issue.severity === 'warning',
    )).toBe(true);
    expect(gate.approvable).toBe(true);
  });

  it('blocca una quota senza obiettivo curricolare', () => {
    const allocations = primaryFramework().allocations.map(item => ({ ...item }));
    allocations[0] = { ...allocations[0], objectiveRefs: [] };

    const issues = validateCivicEducationAnnualFramework(primaryFramework({ allocations }));

    expect(issues.some(issue => issue.code === 'CIVIC_ALLOCATION_OBJECTIVE_REQUIRED')).toBe(true);
  });

  it('blocca una fonte normativa non ufficiale', () => {
    const framework = primaryFramework({
      normativeVerification: normativeVerification({
        sources: [
          {
            id: 'secondary-source',
            authority: 'MIM',
            title: 'Fonte non ufficiale',
            url: 'https://example.com/educazione-civica',
            checkedAt: '2026-09-22T08:00:00Z',
            outcome: 'unchanged',
          },
          normativeVerification().sources[1],
        ],
      }),
    });

    const gate = evaluateCivicEducationApprovalGate(framework, bindingContext(framework), [framework]);

    expect(gate.approvable).toBe(false);
    expect(gate.issues.some(issue => issue.code === 'CIVIC_NORMATIVE_SOURCE_NOT_OFFICIAL')).toBe(true);
  });

  it('blocca una modifica normativa rilevante non recepita', () => {
    const framework = primaryFramework({
      normativeVerification: normativeVerification({
        result: 'relevant-change-unresolved',
      }),
    });

    const gate = evaluateCivicEducationApprovalGate(framework, bindingContext(framework), [framework]);

    expect(gate.approvable).toBe(false);
    expect(gate.issues.some(issue => issue.code === 'CIVIC_NORMATIVE_CHANGE_UNRESOLVED')).toBe(true);
  });

  it('blocca l’approvazione senza conferma umana della verifica normativa', () => {
    const framework = primaryFramework({
      normativeVerification: normativeVerification({
        humanConfirmedAt: undefined,
        humanConfirmedByRole: undefined,
      }),
    });

    const gate = evaluateCivicEducationApprovalGate(framework, bindingContext(framework), [framework]);

    expect(gate.approvable).toBe(false);
    expect(gate.issues.some(issue => issue.code === 'CIVIC_NORMATIVE_HUMAN_CONFIRMATION_REQUIRED')).toBe(true);
  });

  it('blocca due quadri approvati per stesso istituto, anno e ordine', () => {
    const first = primaryFramework({
      id: 'approved-1',
      status: 'approved',
      approvedAt: '2026-09-22T09:00:00Z',
      approvedByRole: 'collegio',
    });
    const second = primaryFramework({
      id: 'approved-2',
      versionLabel: '2026-27-v2',
      normativeVerification: normativeVerification({ verifiedFrameworkVersion: '2026-27-v2' }),
      status: 'approved',
      approvedAt: '2026-09-22T10:00:00Z',
      approvedByRole: 'collegio',
    });

    const issues = validateCivicEducationFrameworkSet([first, second]);

    expect(issues.some(issue => issue.code === 'CIVIC_DUPLICATE_APPROVED_FRAMEWORK')).toBe(true);
  });

  it('consente quadri approvati distinti per ordini diversi nello stesso anno', () => {
    const primary = primaryFramework({
      status: 'approved',
      approvedAt: '2026-09-22T09:00:00Z',
      approvedByRole: 'collegio',
    });
    const secondary = {
      ...primaryFramework(),
      id: 'civic-secondaria-2026',
      schoolOrder: 'secondaria' as const,
      status: 'approved' as const,
      approvedAt: '2026-09-22T09:05:00Z',
      approvedByRole: 'collegio' as const,
    };

    const issues = validateCivicEducationFrameworkSet([primary, secondary]);

    expect(issues.some(issue => issue.code === 'CIVIC_DUPLICATE_APPROVED_FRAMEWORK')).toBe(false);
  });

  it('clona il quadro precedente solo come draft e azzera verifica/approvazione', () => {
    const approved = primaryFramework({
      id: 'previous',
      status: 'approved',
      approvedAt: '2026-06-15T08:00:00Z',
      approvedByRole: 'collegio',
    });

    const cloned = cloneCivicEducationFrameworkForAcademicYear(approved, {
      id: 'next',
      curriculumVersionId: 'curriculum-2027',
      academicYear: { startYear: 2027, endYear: 2028 },
      versionLabel: '2027-28-v1',
      now: '2027-09-01T08:00:00Z',
    });

    expect(cloned.status).toBe('draft');
    expect(cloned.previousFrameworkId).toBe('previous');
    expect(cloned.curriculumVersionId).toBe('curriculum-2027');
    expect(cloned.normativeVerification).toBeUndefined();
    expect(cloned.approvedAt).toBeUndefined();
    expect(cloned.approvedByRole).toBeUndefined();
    expect(cloned.allocations).toEqual(approved.allocations);
    expect(cloned.allocations).not.toBe(approved.allocations);
  });

  it('proietta soltanto un quadro approvato e valido', () => {
    const draft = primaryFramework({ status: 'under-review' });
    const approved = primaryFramework({
      status: 'approved',
      approvedAt: '2026-09-22T09:00:00Z',
      approvedByRole: 'collegio',
    });

    expect(canProjectCivicEducationFramework(draft, bindingContext(draft), [draft])).toBe(false);
    expect(canProjectCivicEducationFramework(approved, bindingContext(approved), [approved])).toBe(true);
    expect(canProjectCivicEducationFramework(
      approved,
      bindingContext(approved, { curriculumStatus: 'draft' }),
      [approved],
    )).toBe(false);
  });

  it('blocca la proiezione di quadri approvati concorrenti nello stesso ordine/anno', () => {
    const first = primaryFramework({
      id: 'approved-1',
      status: 'approved',
      approvedAt: '2026-09-22T09:00:00Z',
      approvedByRole: 'collegio',
    });
    const second = primaryFramework({
      id: 'approved-2',
      status: 'approved',
      approvedAt: '2026-09-22T10:00:00Z',
      approvedByRole: 'collegio',
    });
    const activeSet = [first, second];

    expect(canProjectCivicEducationFramework(first, bindingContext(first), activeSet)).toBe(false);
    expect(canProjectCivicEducationFramework(second, bindingContext(second), activeSet)).toBe(false);
  });

  it('blocca il gate di approvazione se esiste già un altro quadro approvato concorrente', () => {
    const existing = primaryFramework({
      id: 'approved-existing',
      status: 'approved',
      approvedAt: '2026-09-22T09:00:00Z',
      approvedByRole: 'collegio',
    });
    const candidate = primaryFramework({ id: 'candidate' });

    const gate = evaluateCivicEducationApprovalGate(
      candidate,
      bindingContext(candidate),
      [existing, candidate],
    );

    expect(gate.approvable).toBe(false);
    expect(gate.issues.some(issue => issue.code === 'CIVIC_APPROVED_FRAMEWORK_CONFLICT')).toBe(true);
  });

  it('blocca un riferimento che non risolve a un vero obiettivo curricolare', () => {
    const framework = primaryFramework();
    const issues = validateCivicEducationCurriculumBindings(
      framework,
      bindingContext(framework, { nodeType: 'competence' }),
    );

    expect(issues.some(issue => issue.code === 'CIVIC_OBJECTIVE_REF_NOT_OBJECTIVE')).toBe(true);
  });

  it('blocca un obiettivo primaria/secondaria che non appartiene al segmento di Educazione civica', () => {
    const framework = primaryFramework();
    const issues = validateCivicEducationCurriculumBindings(
      framework,
      bindingContext(framework, { segmentSubject: 'italiano' }),
    );

    expect(issues.some(issue => issue.code === 'CIVIC_OBJECTIVE_NOT_CIVIC')).toBe(true);
  });

  it('blocca il binding a una versione curricolare Arena differente', () => {
    const framework = primaryFramework();
    const issues = validateCivicEducationCurriculumBindings(
      framework,
      bindingContext(framework, { curriculumVersionId: 'curriculum-other' }),
    );

    expect(issues.some(issue => issue.code === 'CIVIC_CURRICULUM_VERSION_MISMATCH')).toBe(true);
  });

  it('blocca il binding se la versione curricolare appartiene a un altro istituto', () => {
    const framework = primaryFramework();
    const issues = validateCivicEducationCurriculumBindings(
      framework,
      bindingContext(framework, { curriculumInstitutionId: 'institute-other' }),
    );

    expect(issues.some(issue => issue.code === 'CIVIC_CURRICULUM_INSTITUTION_MISMATCH')).toBe(true);
  });

  it('gestisce l’infanzia senza monte ore e con collegamenti ai campi di esperienza', () => {
    const framework: CivicEducationAnnualFramework = {
      schemaVersion: CIVIC_EDUCATION_FRAMEWORK_SCHEMA_VERSION,
      id: 'civic-infanzia-2026',
      institutionId: 'institute-1',
      curriculumVersionId: 'curriculum-2026',
      academicYear: { startYear: 2026, endYear: 2027 },
      schoolOrder: 'infanzia',
      versionLabel: '2026-27-v1',
      status: 'under-review',
      allocations: [],
      infanziaMappings: [infanziaMapping('mapping-1')],
      normativeVerification: normativeVerification(),
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-22T08:00:00Z',
    };

    const gate = evaluateCivicEducationApprovalGate(framework, bindingContext(framework), [framework]);

    expect(gate.totalAnnualHours).toBeNull();
    expect(gate.approvable).toBe(true);
  });

  it('rifiuta allocazioni orarie nel quadro infanzia', () => {
    const framework: CivicEducationAnnualFramework = {
      schemaVersion: CIVIC_EDUCATION_FRAMEWORK_SCHEMA_VERSION,
      id: 'civic-infanzia-invalid',
      institutionId: 'institute-1',
      curriculumVersionId: 'curriculum-2026',
      academicYear: { startYear: 2026, endYear: 2027 },
      schoolOrder: 'infanzia',
      versionLabel: '2026-27-v1',
      status: 'draft',
      allocations: [allocation('italiano', 'italiano', 33, ['costituzione'])],
      infanziaMappings: [infanziaMapping('mapping-1')],
      normativeVerification: normativeVerification(),
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-22T08:00:00Z',
    };

    const issues = validateCivicEducationAnnualFramework(framework);

    expect(issues.some(issue => issue.code === 'CIVIC_INFANZIA_HOUR_ALLOCATIONS_FORBIDDEN')).toBe(true);
  });
});
