import { afterEach, describe, expect, it } from 'vitest';
import type { EntityReference } from '../../domain/curriculum/identity/types';
import type { CurriculumNode } from '../../domain/curriculum/node';
import type { CurriculumSegment } from '../../domain/curriculum/segment';
import type { InstituteCurriculumVersion } from '../../domain/curriculum/version';
import type {
  CivicEducationAnnualFramework,
  CivicEducationCurriculumBindingContext,
} from '../../domain/curriculum/civicEducationFramework';
import { CIVIC_EDUCATION_FRAMEWORK_SCHEMA_VERSION } from '../../domain/curriculum/civicEducationFramework';
import {
  assertCivicEducationSharedApprovalActor,
  CIVIC_EDUCATION_LOCAL_AUTHORITY_PLANE,
  cloneCivicEducationDraftArchive,
  createEmptyCivicEducationDraftArchive,
  getCivicEducationDraft,
  prepareCivicEducationInstitutionalApprovalCommand,
  removeCivicEducationDraft,
  saveCivicEducationDraft,
  validateCivicEducationDraftArchive,
} from '../../domain/curriculum/civicEducationWorkspace';
import type { CivicEducationDraftArchive } from '../../domain/curriculum/civicEducationWorkspace';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import workspaceSyncSource from '../../features/workspace/hooks/useWorkspaceSyncHandlers.ts?raw';

function ref(id: string): EntityReference {
  return {
    id: id as EntityReference['id'],
    entityType: 'curriculum-node',
    snapshotLabel: id,
  };
}

function framework(
  status: CivicEducationAnnualFramework['status'] = 'draft',
  overrides: Partial<CivicEducationAnnualFramework> = {},
): CivicEducationAnnualFramework {
  return {
    schemaVersion: CIVIC_EDUCATION_FRAMEWORK_SCHEMA_VERSION,
    id: 'ec-secondary-2026',
    institutionId: 'institute-1',
    curriculumVersionId: 'curriculum-2026',
    academicYear: { startYear: 2026, endYear: 2027 },
    schoolOrder: 'secondaria',
    versionLabel: '2026-27-v1',
    status,
    allocations: [
      {
        id: 'italiano',
        target: { type: 'discipline', disciplineCode: 'italiano' },
        annualHours: 11,
        nucleusIds: ['costituzione'],
        objectiveRefs: [ref('obj-costituzione')],
      },
      {
        id: 'scienze',
        target: { type: 'discipline', disciplineCode: 'scienze' },
        annualHours: 11,
        nucleusIds: ['sviluppo-economico-sostenibilita'],
        objectiveRefs: [ref('obj-sostenibilita')],
      },
      {
        id: 'tecnologia',
        target: { type: 'discipline', disciplineCode: 'tecnologia' },
        annualHours: 11,
        nucleusIds: ['cittadinanza-digitale'],
        objectiveRefs: [ref('obj-digitale')],
      },
    ],
    infanziaMappings: [],
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T08:00:00Z',
    ...overrides,
  };
}

function bindingContext(
  value: CivicEducationAnnualFramework,
  curriculumStatus: InstituteCurriculumVersion['status'] = 'approved',
): CivicEducationCurriculumBindingContext {
  const curriculumVersion: InstituteCurriculumVersion = {
    id: value.curriculumVersionId,
    institutionId: value.institutionId,
    title: 'Curricolo 2026/27',
    versionNumber: '1.0',
    status: curriculumStatus,
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T08:00:00Z',
    approvedAt: curriculumStatus === 'approved' ? '2026-09-10T08:00:00Z' : undefined,
  };

  const segment: CurriculumSegment = {
    id: 'segment-ec-secondary',
    versionId: value.curriculumVersionId,
    schoolLevel: 'secondaria',
    subjectOrFieldId: 'educazione-civica',
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

  const nodes: CurriculumNode[] = value.allocations.flatMap(allocation =>
    allocation.objectiveRefs.map(objective => ({
      id: String(objective.id),
      versionId: value.curriculumVersionId,
      segmentId: segment.id,
      type: 'objective',
      title: objective.snapshotLabel ?? String(objective.id),
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-22T08:00:00Z',
    }))
  );

  return { curriculumVersion, segments: [segment], nodes };
}

function approvableFramework(): CivicEducationAnnualFramework {
  return framework('proposed-to-collegio', {
    normativeVerification: {
      automaticCheck: true,
      checkedAt: '2026-09-22T08:00:00Z',
      verifiedFrameworkVersion: '2026-27-v1',
      sources: [
        {
          id: 'mim-dm183',
          authority: 'MIM',
          title: 'D.M. 183/2024 e Linee guida',
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
    },
  });
}

function actor(role: WorkspaceActorContext['membership']['role'] = 'collegio'): WorkspaceActorContext {
  return {
    assurance: 'authenticated-workspace',
    membership: {
      workspaceId: 'workspace-1',
      userId: 'user-1',
      role,
      status: 'active',
    },
  };
}

afterEach(() => {
  useCurriculumStore.setState({
    civicEducationDraftArchive: createEmptyCivicEducationDraftArchive('2026-09-22T00:00:00Z'),
  });
});

describe('EC-01/Arena-F2 — local draft workspace', () => {
  it('crea un archivio locale vuoto e valido', () => {
    const archive = createEmptyCivicEducationDraftArchive('2026-09-22T08:00:00Z');

    expect(validateCivicEducationDraftArchive(archive).valid).toBe(true);
    expect(archive.frameworks).toEqual([]);
  });

  it('dichiara esplicitamente che l’archivio locale non è autorità istituzionale', () => {
    const archive = createEmptyCivicEducationDraftArchive('2026-09-22T08:00:00Z');

    expect(archive.authorityPlane).toBe('LOCAL_DEVICE_NON_AUTHORITATIVE');

    const tampered = {
      ...archive,
      authorityPlane: 'SHARED_INSTITUTIONAL',
    };
    const validation = validateCivicEducationDraftArchive(tampered);

    expect(validation.valid).toBe(false);
    expect(validation.errors.some(error => error.code === 'CIVIC_DRAFT_ARCHIVE_AUTHORITY_PLANE_INVALID')).toBe(true);
  });

  it('rifiuta senza eccezioni voci persistite malformate', () => {
    expect(() => validateCivicEducationDraftArchive({
      schemaVersion: 1,
      authorityPlane: CIVIC_EDUCATION_LOCAL_AUTHORITY_PLANE,
      updatedAt: '2026-09-22T09:00:00Z',
      frameworks: [null, 42, { id: 'incomplete', status: 'draft' }],
    })).not.toThrow();

    const validation = validateCivicEducationDraftArchive({
      schemaVersion: 1,
      authorityPlane: CIVIC_EDUCATION_LOCAL_AUTHORITY_PLANE,
      updatedAt: '2026-09-22T09:00:00Z',
      frameworks: [null, 42, { id: 'incomplete', status: 'draft' }],
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors.some(error =>
      error.code === 'CIVIC_DRAFT_ARCHIVE_FRAMEWORK_INVALID'
      || error.code === 'CIVIC_DRAFT_ARCHIVE_FRAMEWORK_MALFORMED'
    )).toBe(true);
  });

  it('salva una bozza come copia indipendente', () => {
    const archive = createEmptyCivicEducationDraftArchive();
    const value = framework();
    const result = saveCivicEducationDraft(archive, value, bindingContext(value), '2026-09-22T09:00:00Z');

    expect(result.success).toBe(true);
    if (!result.success) return;
    value.allocations[0].annualHours = 99;

    expect(result.archive.frameworks[0].allocations[0].annualHours).toBe(11);
    expect(getCivicEducationDraft(result.archive, value.id)?.status).toBe('draft');
  });

  it('rifiuta un quadro approved nel piano locale', () => {
    const archive = createEmptyCivicEducationDraftArchive();
    const value = framework('approved', {
      approvedAt: '2026-09-22T09:00:00Z',
      approvedByRole: 'collegio',
    });
    const result = saveCivicEducationDraft(archive, value, bindingContext(value));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.some(error => error.code === 'CIVIC_LOCAL_AUTHORITY_FORBIDDEN')).toBe(true);
  });

  it('richiede draft come stato iniziale di un nuovo quadro locale', () => {
    const empty = createEmptyCivicEducationDraftArchive();
    const review = framework('under-review', { id: 'new-review' });
    const proposed = framework('proposed-to-collegio', { id: 'new-proposed' });

    const reviewResult = saveCivicEducationDraft(empty, review, bindingContext(review));
    const proposedResult = saveCivicEducationDraft(empty, proposed, bindingContext(proposed));

    expect(reviewResult.success).toBe(false);
    expect(proposedResult.success).toBe(false);
    if (!reviewResult.success) {
      expect(reviewResult.errors.some(error => error.code === 'CIVIC_LOCAL_INITIAL_STATUS_MUST_BE_DRAFT')).toBe(true);
    }
    if (!proposedResult.success) {
      expect(proposedResult.errors.some(error => error.code === 'CIVIC_LOCAL_INITIAL_STATUS_MUST_BE_DRAFT')).toBe(true);
    }
  });

  it('rifiuta un salto draft → proposed-to-collegio', () => {
    const empty = createEmptyCivicEducationDraftArchive();
    const draft = framework('draft');
    const first = saveCivicEducationDraft(empty, draft, bindingContext(draft));
    expect(first.success).toBe(true);
    if (!first.success) return;

    const proposed = framework('proposed-to-collegio');
    const result = saveCivicEducationDraft(first.archive, proposed, bindingContext(proposed));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.some(error => error.code === 'CIVIC_LOCAL_INVALID_STATUS_TRANSITION')).toBe(true);
  });

  it('consente la sequenza draft → under-review → proposed-to-collegio', () => {
    const empty = createEmptyCivicEducationDraftArchive();
    const draft = framework('draft');
    const one = saveCivicEducationDraft(empty, draft, bindingContext(draft));
    expect(one.success).toBe(true);
    if (!one.success) return;

    const review = framework('under-review');
    const two = saveCivicEducationDraft(one.archive, review, bindingContext(review));
    expect(two.success).toBe(true);
    if (!two.success) return;

    const proposed = framework('proposed-to-collegio');
    const three = saveCivicEducationDraft(two.archive, proposed, bindingContext(proposed));

    expect(three.success).toBe(true);
    if (!three.success) return;
    expect(getCivicEducationDraft(three.archive, proposed.id)?.status).toBe('proposed-to-collegio');
  });

  it('rifiuta operazioni su un archivio locale già corrotto', () => {
    const invalid: CivicEducationDraftArchive = {
      schemaVersion: 1,
      authorityPlane: CIVIC_EDUCATION_LOCAL_AUTHORITY_PLANE,
      updatedAt: '2026-09-22T09:00:00Z',
      frameworks: [framework('approved', {
        approvedAt: '2026-09-22T08:59:00Z',
        approvedByRole: 'collegio',
      })],
    };
    const candidate = framework('draft');

    const save = saveCivicEducationDraft(invalid, candidate, bindingContext(candidate));
    const remove = removeCivicEducationDraft(invalid, invalid.frameworks[0].id);

    expect(save.success).toBe(false);
    expect(remove.success).toBe(false);
  });

  it('rimuove soltanto una bozza esistente', () => {
    const empty = createEmptyCivicEducationDraftArchive();
    const value = framework();
    const saved = saveCivicEducationDraft(empty, value, bindingContext(value));
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    const removed = removeCivicEducationDraft(saved.archive, value.id);
    expect(removed.success).toBe(true);
    if (!removed.success) return;
    expect(removed.archive.frameworks).toHaveLength(0);

    const missing = removeCivicEducationDraft(removed.archive, value.id);
    expect(missing.success).toBe(false);
  });

  it('l’integrità dell’archivio rifiuta evidenze di approvazione locale', () => {
    const invalid: CivicEducationDraftArchive = {
      schemaVersion: 1,
      authorityPlane: CIVIC_EDUCATION_LOCAL_AUTHORITY_PLANE,
      updatedAt: '2026-09-22T09:00:00Z',
      frameworks: [framework('draft', {
        approvedAt: '2026-09-22T08:59:00Z',
        approvedByRole: 'collegio',
      })],
    };

    const validation = validateCivicEducationDraftArchive(invalid);

    expect(validation.valid).toBe(false);
    expect(validation.errors.some(error => error.code === 'CIVIC_LOCAL_APPROVAL_EVIDENCE_FORBIDDEN')).toBe(true);
  });

  it('prepara un comando condiviso senza trasformare localmente il candidato in approved', () => {
    const candidate = approvableFramework();
    const current = framework('approved', {
      id: 'current-approved',
      approvedAt: '2026-09-15T08:00:00Z',
      approvedByRole: 'collegio',
    });

    const result = prepareCivicEducationInstitutionalApprovalCommand(
      candidate,
      bindingContext(candidate),
      [current, candidate],
      {
        workspaceId: 'workspace-1',
        clientRequestId: 'request-1',
        expectedCurrentApprovedFrameworkId: current.id,
      },
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.command.candidate.status).toBe('proposed-to-collegio');
    expect(result.command.expectedCurrentApprovedFrameworkId).toBe('current-approved');
  });

  it('blocca un comando di approvazione con baseline shared obsoleta', () => {
    const candidate = approvableFramework();
    const current = framework('approved', {
      id: 'current-approved',
      approvedAt: '2026-09-15T08:00:00Z',
      approvedByRole: 'collegio',
    });

    const result = prepareCivicEducationInstitutionalApprovalCommand(
      candidate,
      bindingContext(candidate),
      [current, candidate],
      {
        workspaceId: 'workspace-1',
        clientRequestId: 'request-stale',
        expectedCurrentApprovedFrameworkId: 'different-approved',
      },
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.some(error => error.code === 'CIVIC_APPROVAL_STALE_CURRENT_HEAD')).toBe(true);
  });

  it('blocca un set shared già ambiguo con due approved concorrenti', () => {
    const candidate = approvableFramework();
    const first = framework('approved', {
      id: 'approved-1',
      approvedAt: '2026-09-15T08:00:00Z',
      approvedByRole: 'collegio',
    });
    const second = framework('approved', {
      id: 'approved-2',
      approvedAt: '2026-09-16T08:00:00Z',
      approvedByRole: 'collegio',
    });

    const result = prepareCivicEducationInstitutionalApprovalCommand(
      candidate,
      bindingContext(candidate),
      [first, second, candidate],
      {
        workspaceId: 'workspace-1',
        clientRequestId: 'request-ambiguous',
        expectedCurrentApprovedFrameworkId: first.id,
      },
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.some(error => error.code === 'CIVIC_APPROVAL_SHARED_SET_AMBIGUOUS')).toBe(true);
  });

  it('rifiuta un candidato che non è proposed-to-collegio', () => {
    const candidate = framework('under-review');
    const result = prepareCivicEducationInstitutionalApprovalCommand(
      candidate,
      bindingContext(candidate),
      [candidate],
      {
        workspaceId: 'workspace-1',
        clientRequestId: 'request-1',
        expectedCurrentApprovedFrameworkId: null,
      },
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.some(error => error.code === 'CIVIC_APPROVAL_CANDIDATE_NOT_PROPOSED')).toBe(true);
  });

  it('richiede Collegio autenticato sul workspace corretto per il port condiviso', () => {
    expect(() => assertCivicEducationSharedApprovalActor(actor('collegio'), 'workspace-1')).not.toThrow();
    expect(() => assertCivicEducationSharedApprovalActor(actor('referente'), 'workspace-1'))
      .toThrow('CIVIC_APPROVAL_COLLEGIO_REQUIRED');
    expect(() => assertCivicEducationSharedApprovalActor(actor('collegio'), 'workspace-other'))
      .toThrow('CIVIC_APPROVAL_WORKSPACE_MISMATCH');
  });

  it('lo store accetta solo archivi locali validi e ne conserva una copia', () => {
    const archive = createEmptyCivicEducationDraftArchive('2026-09-22T09:00:00Z');
    const value = framework();
    const saved = saveCivicEducationDraft(archive, value, bindingContext(value));
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    useCurriculumStore.getState().replaceCivicEducationDraftArchive(saved.archive);
    const stored = useCurriculumStore.getState().civicEducationDraftArchive;

    expect(stored.frameworks).toHaveLength(1);
    expect(stored).not.toBe(saved.archive);

    const invalid = cloneCivicEducationDraftArchive(saved.archive);
    invalid.frameworks[0].status = 'approved';
    useCurriculumStore.getState().replaceCivicEducationDraftArchive(invalid);

    expect(useCurriculumStore.getState().civicEducationDraftArchive.frameworks[0].status).toBe('draft');
  });

  it('include le bozze EC in tutti i payload di backup Workspace/Drive', () => {
    const occurrences = workspaceSyncSource.match(/civicEducationDraftArchive/g) ?? [];
    expect(occurrences.length).toBeGreaterThanOrEqual(5);
    expect(workspaceSyncSource).toContain('revisionArchive, civicEducationDraftArchive');
  });

  it('restoreBackupState rifiuta un archivio EC locale non valido', () => {
    const invalid = createEmptyCivicEducationDraftArchive();
    invalid.frameworks.push(framework('approved', {
      approvedAt: '2026-09-22T09:00:00Z',
      approvedByRole: 'collegio',
    }));

    const result = useCurriculumStore.getState().restoreBackupState({
      civicEducationDraftArchive: invalid,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toBe('invalid-civic-education-draft-archive');
  });
});
