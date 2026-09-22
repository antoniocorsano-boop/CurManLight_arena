import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import migration from '../../supabase/migrations/20260922144500_ec01_civic_education_shared_approval.sql?raw';
import type { CivicEducationAnnualFramework } from '../domain/curriculum/civicEducationFramework';
import { CIVIC_EDUCATION_FRAMEWORK_SCHEMA_VERSION } from '../domain/curriculum/civicEducationFramework';
import type {
  CivicEducationInstitutionalApprovalCommand,
} from '../domain/curriculum/civicEducationWorkspace';
import type {
  SharedWorkspaceRepository,
  WorkspaceActorContext,
} from '../domain/institution/sharedWorkspacePort';
import { SupabaseSharedCivicEducationFrameworkRepository } from '../infrastructure/supabase/sharedCivicEducationFrameworkRepository';

const workspaceId = '11111111-1111-1111-1111-111111111111';
const userId = '22222222-2222-2222-2222-222222222222';

const context: WorkspaceActorContext = {
  assurance: 'authenticated-workspace',
  membership: {
    workspaceId,
    userId,
    role: 'collegio',
    status: 'active',
  },
};

const candidate = (): CivicEducationAnnualFramework => ({
  schemaVersion: CIVIC_EDUCATION_FRAMEWORK_SCHEMA_VERSION,
  id: 'ec-secondaria-2026-v1',
  institutionId: 'institute-1',
  curriculumVersionId: 'canonical-2026-v1',
  academicYear: { startYear: 2026, endYear: 2027 },
  schoolOrder: 'secondaria',
  versionLabel: '2026-27-v1',
  status: 'proposed-to-collegio',
  allocations: [
    {
      id: 'italiano',
      target: { type: 'discipline', disciplineCode: 'italiano' },
      annualHours: 11,
      nucleusIds: ['costituzione'],
      objectiveRefs: [{ id: 'obj-1' as never, entityType: 'curriculum-node', snapshotLabel: 'Obiettivo 1' }],
    },
    {
      id: 'scienze',
      target: { type: 'discipline', disciplineCode: 'scienze' },
      annualHours: 11,
      nucleusIds: ['sviluppo-economico-sostenibilita'],
      objectiveRefs: [{ id: 'obj-2' as never, entityType: 'curriculum-node', snapshotLabel: 'Obiettivo 2' }],
    },
    {
      id: 'tecnologia',
      target: { type: 'discipline', disciplineCode: 'tecnologia' },
      annualHours: 11,
      nucleusIds: ['cittadinanza-digitale'],
      objectiveRefs: [{ id: 'obj-3' as never, entityType: 'curriculum-node', snapshotLabel: 'Obiettivo 3' }],
    },
  ],
  infanziaMappings: [],
  normativeVerification: {
    automaticCheck: true,
    checkedAt: '2026-09-22T12:00:00Z',
    verifiedFrameworkVersion: '2026-27-v1',
    sources: [
      {
        id: 'mim-dm183',
        authority: 'MIM',
        title: 'D.M. 183/2024',
        url: 'https://www.mim.gov.it/educazione-civica',
        checkedAt: '2026-09-22T12:00:00Z',
        outcome: 'unchanged',
      },
      {
        id: 'normattiva-l92',
        authority: 'NORMATTIVA',
        title: 'Legge 92/2019',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2019-08-20;92',
        checkedAt: '2026-09-22T12:00:00Z',
        outcome: 'unchanged',
      },
    ],
    result: 'no-relevant-change',
    humanConfirmedAt: '2026-09-22T12:05:00Z',
    humanConfirmedByRole: 'referente',
  },
  createdAt: '2026-09-01T08:00:00Z',
  updatedAt: '2026-09-22T12:00:00Z',
});

const approvedSnapshot = () => {
  const value = candidate();
  const approvedAt = '2026-09-22T12:10:00.000Z';
  return {
    framework: {
      ...value,
      status: 'approved' as const,
      approvedAt,
      approvedByRole: 'collegio' as const,
    },
    receipt: {
      schemaVersion: 1 as const,
      id: '33333333-3333-3333-3333-333333333333',
      workspaceId,
      institutionId: value.institutionId,
      frameworkId: value.id,
      curriculumVersionId: value.curriculumVersionId,
      academicYear: value.academicYear,
      schoolOrder: value.schoolOrder,
      approvedByUserId: userId,
      approvedByRole: 'collegio' as const,
      approvedAt,
      status: 'APPROVED' as const,
    },
  };
};

const workspaceRepository = (allowed: boolean): SharedWorkspaceRepository => ({
  getMembership: vi.fn(),
  can: vi.fn().mockResolvedValue(allowed),
});

describe('EC-01/Arena-F3 — shared institutional approval migration', () => {
  it('keeps the normative receipt table structurally closed before the current-head table', () => {
    const normativeStart = migration.indexOf(
      'create table if not exists public.civic_education_normative_check_receipts (',
    );
    const headStart = migration.indexOf(
      'create table if not exists public.civic_education_approved_heads (',
      normativeStart,
    );

    expect(normativeStart).toBeGreaterThanOrEqual(0);
    expect(headStart).toBeGreaterThan(normativeStart);

    const normativeTable = migration.slice(normativeStart, headStart);
    expect(normativeTable).toContain(
      "normative_fingerprint text not null check (normative_fingerprint ~ '^[a-f0-9]{64}
    expect(migration).toContain('create table if not exists public.civic_education_approved_frameworks');
    expect(migration).toContain('create table if not exists public.civic_education_approval_receipts');
    expect(migration).toContain('create table if not exists public.civic_education_approved_heads');
    expect(migration).toContain('unique (workspace_id, client_request_id)');
    expect(migration).toContain('primary key (workspace_id, institution_id, academic_start_year, school_order)');
  });

  it('keeps browser mutation closed and exposes only authenticated reads plus RPCs', () => {
    for (const table of [
      'civic_education_approved_frameworks',
      'civic_education_approval_receipts',
      'civic_education_approved_heads',
    ]) {
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toContain(`revoke insert, update, delete on public.${table} from public, anon, authenticated`);
      expect(migration).toContain(`grant select on public.${table} to authenticated`);
    }
    expect(migration).toContain('grant execute on function public.approve_civic_education_framework_v1');
    expect(migration).toContain('to authenticated;');
  });

  it('requires authenticated active Collegio authority and exact principal', () => {
    expect(migration).toContain('p_expected_context_user_id <> v_user');
    expect(migration).toContain("membership.status = 'active'");
    expect(migration).toContain("workspace.status = 'active'");
    expect(migration).toContain("v_role is distinct from 'collegio'");
    expect(migration).toContain("raise exception 'REVISION_DECIDE_REQUIRED'");
  });

  it('revalidates the candidate server-side instead of trusting TypeScript', () => {
    expect(migration).toContain("p_candidate->>'schemaVersion' is distinct from 'cml-civic-education-framework-v1'");
    expect(migration).toContain("p_candidate->>'status' is distinct from 'proposed-to-collegio'");
    expect(migration).toContain("raise exception 'CIVIC_MINIMUM_HOURS_NOT_MET'");
    expect(migration).toContain("raise exception 'INVALID_CIVIC_INFANZIA_MODEL'");
    expect(migration).toContain("raise exception 'INVALID_CIVIC_NORMATIVE_VERIFICATION'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SOURCE_NOT_OFFICIAL'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_BASELINE_INCOMPLETE'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_CHANGE_RESULT_MISMATCH'");
    expect(migration).toContain("raise exception 'CIVIC_ALLOCATION_DUPLICATE_TARGET'");
    expect(migration).toContain("v_norm->'automaticCheck' is distinct from 'true'::jsonb");
  });

  it('binds approval to the current ACTIVE canonical curriculum head', () => {
    expect(migration).toContain('from public.shared_canonical_curriculum_heads head');
    expect(migration).toContain('v_canonical_head.canonical_version_ref <> v_curriculum_version_id');
    expect(migration).toContain("raise exception 'CIVIC_CURRICULUM_HEAD_MISMATCH'");
    expect(migration).toContain('from public.shared_canonical_curriculum_versions version');
    expect(migration).toContain("v_canonical_version.status <> 'ACTIVE'");
  });

  it('binds institution, objectives and discipline/order to the ACTIVE canonical materialization', () => {
    expect(migration).toContain('from public.shared_canonical_materializations materialization');
    expect(migration).toContain("v_canonical_curriculum->>'institutionId' is distinct from v_institution_id");
    expect(migration).toContain("v_canonical_curriculum->>'curriculumVersionRef' is distinct from v_curriculum_version_id");
    expect(migration).toContain("value->>'nodeRef' = v_ref->>'id'");
    expect(migration).toContain("v_node->>'nodeType' <> 'obiettivo'");
    expect(migration).toContain("CIVIC_OBJECTIVE_REF_NOT_FOUND_OR_INVALID");
    expect(migration).toContain("CIVIC_OBJECTIVE_SEGMENT_BINDING_MISMATCH");
    expect(migration).toContain("CIVIC_ALLOCATION_DISCIPLINE_ORDER_MISMATCH");
    expect(migration).toContain("'dm221-framework-educazione-civica'");
  });

  it('requires a server-known normative receipt and parseable timestamps', () => {
    expect(migration).toContain('create table if not exists public.civic_education_normative_check_receipts');
    expect(migration).toContain("checker_authority text not null default 'SERVER_AUTOMATIC_CHECK'");
    expect(migration).toContain('revoke insert, update, delete on public.civic_education_normative_check_receipts from public, anon, authenticated');
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SERVER_RECEIPT_REQUIRED'");
    expect(migration).toContain("receipt.checked_at = (v_norm->>'checkedAt')::timestamptz");
    expect(migration).toContain("perform (p_candidate->>'createdAt')::timestamptz");
    expect(migration).toContain("perform (p_candidate->>'updatedAt')::timestamptz");
    expect(migration).toContain("perform (v_norm->>'checkedAt')::timestamptz");
    expect(migration).toContain("perform (v_norm->>'humanConfirmedAt')::timestamptz");
    expect(migration).toContain("perform (v_source->>'checkedAt')::timestamptz");
  });

  it('enforces immutability of historical framework, approval and normative receipts at DB level', () => {
    expect(migration).toContain('CIVIC_EDUCATION_HISTORY_IMMUTABLE');
    expect(migration).toContain('before update or delete on public.civic_education_approved_frameworks');
    expect(migration).toContain('before update or delete on public.civic_education_approval_receipts');
    expect(migration).toContain('before update or delete on public.civic_education_normative_check_receipts');
  });

  it('rejects noncanonical whitespace before persisting framework or request identities', () => {
    expect(migration).toContain("p_candidate->>'id' <> v_framework_id");
    expect(migration).toContain("p_candidate->>'institutionId' <> v_institution_id");
    expect(migration).toContain("p_candidate->>'curriculumVersionId' <> v_curriculum_version_id");
    expect(migration).toContain("p_candidate->>'versionLabel' <> v_version_label");
    expect(migration).toContain("p_expected_current_approved_framework_id <> trim(p_expected_current_approved_framework_id)");
    expect(migration).toContain("p_client_request_id <> trim(p_client_request_id)");
  });

  it('uses an advisory lock, CAS and idempotent request identity', () => {
    expect(migration).toContain("pg_advisory_xact_lock(hashtextextended(");
    expect(migration).toContain("where receipt.workspace_id = p_workspace_id");
    expect(migration).toContain("and receipt.client_request_id = p_client_request_id");
    expect(migration).toContain("raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH'");
    expect(migration).toContain("raise exception 'CIVIC_APPROVED_HEAD_CAS_MISMATCH'");
  });

  it('does not rewrite historical approved snapshots when the head advances', () => {
    expect(migration).toContain('insert into public.civic_education_approved_frameworks');
    expect(migration).toContain('insert into public.civic_education_approval_receipts');
    expect(migration).toContain('insert into public.civic_education_approved_heads');
    expect(migration).not.toMatch(/update\s+public\.civic_education_approved_frameworks/i);
    expect(migration).not.toMatch(/update\s+public\.civic_education_approval_receipts/i);
    expect(migration).not.toMatch(/update\s+public\.civic_education_normative_check_receipts/i);
  });
});

describe('SupabaseSharedCivicEducationFrameworkRepository', () => {
  it('reads the current approved framework through the governed RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: approvedSnapshot(), error: null });
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      workspaceRepository(true),
    );

    const result = await repository.getCurrentApproved(
      context,
      'institute-1',
      { startYear: 2026, endYear: 2027 },
      'secondaria',
    );

    expect(result?.framework.status).toBe('approved');
    expect(rpc).toHaveBeenCalledWith('get_current_civic_education_framework_v1', {
      p_workspace_id: workspaceId,
      p_expected_context_user_id: userId,
      p_institution_id: 'institute-1',
      p_academic_start_year: 2026,
      p_academic_end_year: 2027,
      p_school_order: 'secondaria',
    });
  });

  it('approves only through REVISION_DECIDE and the server RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: approvedSnapshot(), error: null });
    const permissions = workspaceRepository(true);
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      permissions,
    );
    const command: CivicEducationInstitutionalApprovalCommand = {
      workspaceId,
      clientRequestId: 'request-1',
      expectedCurrentApprovedFrameworkId: null,
      candidate: candidate(),
    };

    await expect(repository.approve(context, command)).resolves.toEqual(approvedSnapshot());
    expect(permissions.can).toHaveBeenCalledWith(context, 'REVISION_DECIDE');
    expect(rpc).toHaveBeenCalledWith('approve_civic_education_framework_v1', {
      p_workspace_id: workspaceId,
      p_expected_context_user_id: userId,
      p_expected_current_approved_framework_id: null,
      p_candidate: command.candidate,
      p_client_request_id: 'request-1',
    });
  });

  it('fails closed when fresh backend membership lacks REVISION_DECIDE', async () => {
    const rpc = vi.fn();
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      workspaceRepository(false),
    );

    await expect(repository.approve(context, {
      workspaceId,
      clientRequestId: 'request-2',
      expectedCurrentApprovedFrameworkId: null,
      candidate: candidate(),
    })).rejects.toThrow('REVISION_DECIDE_REQUIRED');

    expect(rpc).not.toHaveBeenCalled();
  });

  it('rejects a mismatched server principal in the approval receipt', async () => {
    const snapshot = approvedSnapshot();
    snapshot.receipt.approvedByUserId = 'other-user';
    const rpc = vi.fn().mockResolvedValue({ data: snapshot, error: null });
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      workspaceRepository(true),
    );

    await expect(repository.approve(context, {
      workspaceId,
      clientRequestId: 'request-3',
      expectedCurrentApprovedFrameworkId: null,
      candidate: candidate(),
    })).rejects.toThrow('principal autenticato');
  });

  it('rejects a current snapshot returned outside the requested scope', async () => {
    const snapshot = approvedSnapshot();
    snapshot.framework.institutionId = 'other-institute';
    snapshot.receipt.institutionId = 'other-institute';
    const rpc = vi.fn().mockResolvedValue({ data: snapshot, error: null });
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      workspaceRepository(true),
    );

    await expect(repository.getCurrentApproved(
      context,
      'institute-1',
      { startYear: 2026, endYear: 2027 },
      'secondaria',
    )).rejects.toThrow('fuori dallo scope richiesto');
  });

  it('rejects an approval response bound to a different candidate', async () => {
    const snapshot = approvedSnapshot();
    snapshot.framework.id = 'different-framework';
    snapshot.receipt.frameworkId = 'different-framework';
    const rpc = vi.fn().mockResolvedValue({ data: snapshot, error: null });
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      workspaceRepository(true),
    );

    await expect(repository.approve(context, {
      workspaceId,
      clientRequestId: 'request-4',
      expectedCurrentApprovedFrameworkId: null,
      candidate: candidate(),
    })).rejects.toThrow('diverso dal candidato richiesto');
  });

  it('rejects inconsistent framework/receipt server payloads', async () => {
    const snapshot = approvedSnapshot();
    snapshot.receipt.frameworkId = 'other-framework';
    const rpc = vi.fn().mockResolvedValue({ data: snapshot, error: null });
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      workspaceRepository(true),
    );

    await expect(repository.getCurrentApproved(
      context,
      'institute-1',
      { startYear: 2026, endYear: 2027 },
      'secondaria',
    )).rejects.toThrow('non sono coerenti');
  });
});
),",
    );
    expect(normativeTable).toContain('verification_snapshot jsonb not null');
    expect(normativeTable).toContain('checked_at timestamptz not null');
    expect(normativeTable.trimEnd().endsWith(');')).toBe(true);
    expect(normativeTable).not.toContain('create or replace function');
    expect(normativeTable).not.toContain('comment on table');

    const occurrences = (needle: string) => migration.split(needle).length - 1;
    expect(occurrences('create table if not exists public.civic_education_approved_frameworks')).toBe(1);
    expect(occurrences('create table if not exists public.civic_education_approval_receipts')).toBe(1);
    expect(occurrences('create table if not exists public.civic_education_normative_check_receipts')).toBe(1);
    expect(occurrences('create table if not exists public.civic_education_approved_heads')).toBe(1);
    expect(occurrences('create or replace function public.get_current_civic_education_framework_v1')).toBe(1);
    expect(occurrences('create or replace function public.approve_civic_education_framework_v1')).toBe(1);
  });

  it('creates immutable snapshot, receipt and current-head tables', () => {
    expect(migration).toContain('create table if not exists public.civic_education_approved_frameworks');
    expect(migration).toContain('create table if not exists public.civic_education_approval_receipts');
    expect(migration).toContain('create table if not exists public.civic_education_approved_heads');
    expect(migration).toContain('unique (workspace_id, client_request_id)');
    expect(migration).toContain('primary key (workspace_id, institution_id, academic_start_year, school_order)');
  });

  it('keeps browser mutation closed and exposes only authenticated reads plus RPCs', () => {
    for (const table of [
      'civic_education_approved_frameworks',
      'civic_education_approval_receipts',
      'civic_education_approved_heads',
    ]) {
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toContain(`revoke insert, update, delete on public.${table} from public, anon, authenticated`);
      expect(migration).toContain(`grant select on public.${table} to authenticated`);
    }
    expect(migration).toContain('grant execute on function public.approve_civic_education_framework_v1');
    expect(migration).toContain('to authenticated;');
  });

  it('requires authenticated active Collegio authority and exact principal', () => {
    expect(migration).toContain('p_expected_context_user_id <> v_user');
    expect(migration).toContain("membership.status = 'active'");
    expect(migration).toContain("workspace.status = 'active'");
    expect(migration).toContain("v_role is distinct from 'collegio'");
    expect(migration).toContain("raise exception 'REVISION_DECIDE_REQUIRED'");
  });

  it('revalidates the candidate server-side instead of trusting TypeScript', () => {
    expect(migration).toContain("p_candidate->>'schemaVersion' is distinct from 'cml-civic-education-framework-v1'");
    expect(migration).toContain("p_candidate->>'status' is distinct from 'proposed-to-collegio'");
    expect(migration).toContain("raise exception 'CIVIC_MINIMUM_HOURS_NOT_MET'");
    expect(migration).toContain("raise exception 'INVALID_CIVIC_INFANZIA_MODEL'");
    expect(migration).toContain("raise exception 'INVALID_CIVIC_NORMATIVE_VERIFICATION'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SOURCE_NOT_OFFICIAL'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_BASELINE_INCOMPLETE'");
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_CHANGE_RESULT_MISMATCH'");
    expect(migration).toContain("raise exception 'CIVIC_ALLOCATION_DUPLICATE_TARGET'");
    expect(migration).toContain("v_norm->'automaticCheck' is distinct from 'true'::jsonb");
  });

  it('binds approval to the current ACTIVE canonical curriculum head', () => {
    expect(migration).toContain('from public.shared_canonical_curriculum_heads head');
    expect(migration).toContain('v_canonical_head.canonical_version_ref <> v_curriculum_version_id');
    expect(migration).toContain("raise exception 'CIVIC_CURRICULUM_HEAD_MISMATCH'");
    expect(migration).toContain('from public.shared_canonical_curriculum_versions version');
    expect(migration).toContain("v_canonical_version.status <> 'ACTIVE'");
  });

  it('binds institution, objectives and discipline/order to the ACTIVE canonical materialization', () => {
    expect(migration).toContain('from public.shared_canonical_materializations materialization');
    expect(migration).toContain("v_canonical_curriculum->>'institutionId' is distinct from v_institution_id");
    expect(migration).toContain("v_canonical_curriculum->>'curriculumVersionRef' is distinct from v_curriculum_version_id");
    expect(migration).toContain("value->>'nodeRef' = v_ref->>'id'");
    expect(migration).toContain("v_node->>'nodeType' <> 'obiettivo'");
    expect(migration).toContain("CIVIC_OBJECTIVE_REF_NOT_FOUND_OR_INVALID");
    expect(migration).toContain("CIVIC_OBJECTIVE_SEGMENT_BINDING_MISMATCH");
    expect(migration).toContain("CIVIC_ALLOCATION_DISCIPLINE_ORDER_MISMATCH");
    expect(migration).toContain("'dm221-framework-educazione-civica'");
  });

  it('requires a server-known normative receipt and parseable timestamps', () => {
    expect(migration).toContain('create table if not exists public.civic_education_normative_check_receipts');
    expect(migration).toContain("checker_authority text not null default 'SERVER_AUTOMATIC_CHECK'");
    expect(migration).toContain('revoke insert, update, delete on public.civic_education_normative_check_receipts from public, anon, authenticated');
    expect(migration).toContain("raise exception 'CIVIC_NORMATIVE_SERVER_RECEIPT_REQUIRED'");
    expect(migration).toContain("receipt.checked_at = (v_norm->>'checkedAt')::timestamptz");
    expect(migration).toContain("perform (p_candidate->>'createdAt')::timestamptz");
    expect(migration).toContain("perform (p_candidate->>'updatedAt')::timestamptz");
    expect(migration).toContain("perform (v_norm->>'checkedAt')::timestamptz");
    expect(migration).toContain("perform (v_norm->>'humanConfirmedAt')::timestamptz");
    expect(migration).toContain("perform (v_source->>'checkedAt')::timestamptz");
  });

  it('enforces immutability of historical framework, approval and normative receipts at DB level', () => {
    expect(migration).toContain('CIVIC_EDUCATION_HISTORY_IMMUTABLE');
    expect(migration).toContain('before update or delete on public.civic_education_approved_frameworks');
    expect(migration).toContain('before update or delete on public.civic_education_approval_receipts');
    expect(migration).toContain('before update or delete on public.civic_education_normative_check_receipts');
  });

  it('rejects noncanonical whitespace before persisting framework or request identities', () => {
    expect(migration).toContain("p_candidate->>'id' <> v_framework_id");
    expect(migration).toContain("p_candidate->>'institutionId' <> v_institution_id");
    expect(migration).toContain("p_candidate->>'curriculumVersionId' <> v_curriculum_version_id");
    expect(migration).toContain("p_candidate->>'versionLabel' <> v_version_label");
    expect(migration).toContain("p_expected_current_approved_framework_id <> trim(p_expected_current_approved_framework_id)");
    expect(migration).toContain("p_client_request_id <> trim(p_client_request_id)");
  });

  it('uses an advisory lock, CAS and idempotent request identity', () => {
    expect(migration).toContain("pg_advisory_xact_lock(hashtextextended(");
    expect(migration).toContain("where receipt.workspace_id = p_workspace_id");
    expect(migration).toContain("and receipt.client_request_id = p_client_request_id");
    expect(migration).toContain("raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH'");
    expect(migration).toContain("raise exception 'CIVIC_APPROVED_HEAD_CAS_MISMATCH'");
  });

  it('does not rewrite historical approved snapshots when the head advances', () => {
    expect(migration).toContain('insert into public.civic_education_approved_frameworks');
    expect(migration).toContain('insert into public.civic_education_approval_receipts');
    expect(migration).toContain('insert into public.civic_education_approved_heads');
    expect(migration).not.toMatch(/update\s+public\.civic_education_approved_frameworks/i);
    expect(migration).not.toMatch(/update\s+public\.civic_education_approval_receipts/i);
    expect(migration).not.toMatch(/update\s+public\.civic_education_normative_check_receipts/i);
  });
});

describe('SupabaseSharedCivicEducationFrameworkRepository', () => {
  it('reads the current approved framework through the governed RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: approvedSnapshot(), error: null });
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      workspaceRepository(true),
    );

    const result = await repository.getCurrentApproved(
      context,
      'institute-1',
      { startYear: 2026, endYear: 2027 },
      'secondaria',
    );

    expect(result?.framework.status).toBe('approved');
    expect(rpc).toHaveBeenCalledWith('get_current_civic_education_framework_v1', {
      p_workspace_id: workspaceId,
      p_expected_context_user_id: userId,
      p_institution_id: 'institute-1',
      p_academic_start_year: 2026,
      p_academic_end_year: 2027,
      p_school_order: 'secondaria',
    });
  });

  it('approves only through REVISION_DECIDE and the server RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: approvedSnapshot(), error: null });
    const permissions = workspaceRepository(true);
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      permissions,
    );
    const command: CivicEducationInstitutionalApprovalCommand = {
      workspaceId,
      clientRequestId: 'request-1',
      expectedCurrentApprovedFrameworkId: null,
      candidate: candidate(),
    };

    await expect(repository.approve(context, command)).resolves.toEqual(approvedSnapshot());
    expect(permissions.can).toHaveBeenCalledWith(context, 'REVISION_DECIDE');
    expect(rpc).toHaveBeenCalledWith('approve_civic_education_framework_v1', {
      p_workspace_id: workspaceId,
      p_expected_context_user_id: userId,
      p_expected_current_approved_framework_id: null,
      p_candidate: command.candidate,
      p_client_request_id: 'request-1',
    });
  });

  it('fails closed when fresh backend membership lacks REVISION_DECIDE', async () => {
    const rpc = vi.fn();
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      workspaceRepository(false),
    );

    await expect(repository.approve(context, {
      workspaceId,
      clientRequestId: 'request-2',
      expectedCurrentApprovedFrameworkId: null,
      candidate: candidate(),
    })).rejects.toThrow('REVISION_DECIDE_REQUIRED');

    expect(rpc).not.toHaveBeenCalled();
  });

  it('rejects a mismatched server principal in the approval receipt', async () => {
    const snapshot = approvedSnapshot();
    snapshot.receipt.approvedByUserId = 'other-user';
    const rpc = vi.fn().mockResolvedValue({ data: snapshot, error: null });
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      workspaceRepository(true),
    );

    await expect(repository.approve(context, {
      workspaceId,
      clientRequestId: 'request-3',
      expectedCurrentApprovedFrameworkId: null,
      candidate: candidate(),
    })).rejects.toThrow('principal autenticato');
  });

  it('rejects a current snapshot returned outside the requested scope', async () => {
    const snapshot = approvedSnapshot();
    snapshot.framework.institutionId = 'other-institute';
    snapshot.receipt.institutionId = 'other-institute';
    const rpc = vi.fn().mockResolvedValue({ data: snapshot, error: null });
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      workspaceRepository(true),
    );

    await expect(repository.getCurrentApproved(
      context,
      'institute-1',
      { startYear: 2026, endYear: 2027 },
      'secondaria',
    )).rejects.toThrow('fuori dallo scope richiesto');
  });

  it('rejects an approval response bound to a different candidate', async () => {
    const snapshot = approvedSnapshot();
    snapshot.framework.id = 'different-framework';
    snapshot.receipt.frameworkId = 'different-framework';
    const rpc = vi.fn().mockResolvedValue({ data: snapshot, error: null });
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      workspaceRepository(true),
    );

    await expect(repository.approve(context, {
      workspaceId,
      clientRequestId: 'request-4',
      expectedCurrentApprovedFrameworkId: null,
      candidate: candidate(),
    })).rejects.toThrow('diverso dal candidato richiesto');
  });

  it('rejects inconsistent framework/receipt server payloads', async () => {
    const snapshot = approvedSnapshot();
    snapshot.receipt.frameworkId = 'other-framework';
    const rpc = vi.fn().mockResolvedValue({ data: snapshot, error: null });
    const repository = new SupabaseSharedCivicEducationFrameworkRepository(
      { rpc } as unknown as SupabaseClient,
      workspaceRepository(true),
    );

    await expect(repository.getCurrentApproved(
      context,
      'institute-1',
      { startYear: 2026, endYear: 2027 },
      'secondaria',
    )).rejects.toThrow('non sono coerenti');
  });
});
