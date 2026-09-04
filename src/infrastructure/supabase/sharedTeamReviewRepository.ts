import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getOperationalGroupByCode,
  type OperationalGroupCode,
  type OperationalGroupStatus,
  type OperationalSchoolOrder,
} from '../../domain/institution/operationalGroups';
import type { WorkspaceActorContext, WorkspaceMemberRole } from '../../domain/institution/sharedWorkspacePort';
import type {
  OperationalGroupMembership,
  RecordTeamReviewOutcomeInput,
  SharedTeamReviewRepository,
  TeamReviewContribution,
  TeamReviewOrientation,
  TeamReviewOutcome,
  TeamReviewOutcomeReceipt,
  TeamReviewScope,
  UpsertTeamReviewContributionInput,
} from '../../domain/revision/teamReview';

interface ContributionRow {
  workspace_id: string;
  academic_year: string;
  group_code: string;
  discipline: string;
  proposal_ref: string;
  proposal_fingerprint: string;
  contributor_user_id: string;
  contributor_role: string;
  orientation: string;
  custom_text: string | null;
  updated_at: string;
}

interface OutcomeRow {
  id: string;
  workspace_id: string;
  academic_year: string;
  group_code: string;
  discipline: string;
  proposal_ref: string;
  proposal_fingerprint: string;
  outcome: string;
  shared_text: string | null;
  rationale: string;
  recorded_by_user_id: string;
  recorded_by_role: string;
  recorded_by_operational_role: string;
  authority_state: string;
  recorded_at: string;
  client_request_id: string;
}

interface OperationalMembershipRow {
  user_id: string;
  academic_year: string;
  school_order: string;
  group_code: string;
  member_role: string;
  membership_state: string;
  disciplines: string[];
}

const CONTRIBUTION_ORIENTATIONS: readonly TeamReviewOrientation[] = [
  'confirm-proposal',
  'propose-change',
  'keep-previous',
];
const TEAM_OUTCOMES: readonly TeamReviewOutcome[] = [
  'accept-proposal',
  'keep-previous',
  'shared-text',
  'defer',
];
const CONTRIBUTOR_ROLES: readonly WorkspaceMemberRole[] = ['docente', 'dipartimento', 'referente'];
const FINGERPRINT_RE = /^[0-9a-f]{64}$/;
const AUTHORITY_STATES: readonly OperationalGroupStatus[] = ['OPERATIVO_PROVVISORIO', 'FORMALIZZATO'];

const assertContextWorkspace = (context: WorkspaceActorContext, workspaceId: string): void => {
  if (context.assurance !== 'authenticated-workspace') throw new Error('TEAM_REVIEW_AUTHORITY_UNAVAILABLE');
  if (context.membership.workspaceId !== workspaceId || context.membership.status !== 'active') {
    throw new Error('La richiesta non appartiene a una membership attiva del workspace corrente.');
  }
};

const assertRef = (value: string, field: string): void => {
  if (!value || value !== value.trim() || value.includes(String.fromCharCode(31))) {
    throw new Error(`${field} non canonico.`);
  }
};
const assertFingerprint = (value: string): void => {
  if (!FINGERPRINT_RE.test(value)) throw new Error('Fingerprint della scheda non valido.');
};
const assertScope = (scope: TeamReviewScope): void => {
  const group = getOperationalGroupByCode(scope.groupCode);
  if (!group || group.order !== scope.order || !group.disciplines.includes(scope.discipline)) {
    throw new Error('La disciplina non appartiene al gruppo operativo indicato.');
  }
  if (!/^\d{4}\/\d{4}$/.test(scope.academicYear)) throw new Error('Anno scolastico non valido.');
};

const isContributorRole = (value: string): value is Extract<WorkspaceMemberRole, 'docente' | 'dipartimento' | 'referente'> =>
  CONTRIBUTOR_ROLES.includes(value as WorkspaceMemberRole);
const isOrientation = (value: string): value is TeamReviewOrientation =>
  CONTRIBUTION_ORIENTATIONS.includes(value as TeamReviewOrientation);
const isOutcome = (value: string): value is TeamReviewOutcome => TEAM_OUTCOMES.includes(value as TeamReviewOutcome);
const isAuthorityState = (value: string): value is OperationalGroupStatus =>
  AUTHORITY_STATES.includes(value as OperationalGroupStatus);
const isOperationalOrder = (value: string): value is OperationalSchoolOrder => value === 'primaria' || value === 'secondaria';
const isOperationalGroupCode = (value: string): value is OperationalGroupCode => Boolean(getOperationalGroupByCode(value));

const toContribution = (row: ContributionRow): TeamReviewContribution => {
  if (!isContributorRole(row.contributor_role) || !isOrientation(row.orientation) || !isOperationalGroupCode(row.group_code)) {
    throw new Error('Contributo del gruppo non valido.');
  }
  const group = getOperationalGroupByCode(row.group_code);
  if (!group || !group.disciplines.includes(row.discipline)) throw new Error('Competenza disciplinare del contributo non valida.');
  assertFingerprint(row.proposal_fingerprint);
  return {
    workspaceId: row.workspace_id,
    academicYear: row.academic_year,
    order: group.order,
    groupCode: row.group_code,
    discipline: row.discipline,
    proposalRef: row.proposal_ref,
    proposalFingerprint: row.proposal_fingerprint,
    contributorUserId: row.contributor_user_id,
    contributorRole: row.contributor_role,
    orientation: row.orientation,
    customText: row.custom_text,
    updatedAt: row.updated_at,
  };
};

const toOutcome = (row: OutcomeRow): TeamReviewOutcomeReceipt => {
  if (
    !isContributorRole(row.recorded_by_role)
    || !isOutcome(row.outcome)
    || !isOperationalGroupCode(row.group_code)
    || row.recorded_by_operational_role !== 'coordinatore'
    || !isAuthorityState(row.authority_state)
  ) {
    throw new Error('Esito del gruppo non valido.');
  }
  const group = getOperationalGroupByCode(row.group_code);
  if (!group || !group.disciplines.includes(row.discipline)) throw new Error('Competenza disciplinare dell’esito non valida.');
  assertFingerprint(row.proposal_fingerprint);
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    academicYear: row.academic_year,
    order: group.order,
    groupCode: row.group_code,
    discipline: row.discipline,
    proposalRef: row.proposal_ref,
    proposalFingerprint: row.proposal_fingerprint,
    outcome: row.outcome,
    sharedText: row.shared_text,
    rationale: row.rationale,
    recordedByUserId: row.recorded_by_user_id,
    recordedByRole: row.recorded_by_role,
    recordedByOperationalRole: 'coordinatore',
    authorityState: row.authority_state,
    recordedAt: row.recorded_at,
    clientRequestId: row.client_request_id,
  };
};

const toOperationalMembership = (row: OperationalMembershipRow): OperationalGroupMembership => {
  if (
    !isOperationalOrder(row.school_order)
    || !isOperationalGroupCode(row.group_code)
    || !['docente', 'coordinatore'].includes(row.member_role)
    || !isAuthorityState(row.membership_state)
  ) {
    throw new Error('Appartenenza al gruppo operativo non valida.');
  }
  const group = getOperationalGroupByCode(row.group_code);
  if (!group || group.order !== row.school_order || row.disciplines.some((discipline) => !group.disciplines.includes(discipline))) {
    throw new Error('Competenze dichiarate non coerenti con il gruppo operativo.');
  }
  return {
    userId: row.user_id,
    academicYear: row.academic_year,
    schoolOrder: row.school_order,
    groupCode: row.group_code,
    memberRole: row.member_role as OperationalGroupMembership['memberRole'],
    membershipState: row.membership_state,
    disciplines: row.disciplines,
  };
};

const operationalError = (message: string): Error => {
  if (message.includes('OPERATIONAL_DISCIPLINE_MEMBERSHIP_REQUIRED')) {
    return new Error('Questa disciplina non è tra le competenze dichiarate nel tuo gruppo operativo.');
  }
  if (message.includes('OPERATIONAL_COORDINATOR_REQUIRED')) {
    return new Error('Per registrare la decisione devi risultare coordinatore operativo del gruppo.');
  }
  if (message.includes('TEAM_REVIEW_COVERAGE_INCOMPLETE')) {
    return new Error('Mancano ancora pareri dei docenti competenti per questa disciplina. Puoi rinviare il punto oppure attendere i contributi mancanti.');
  }
  if (message.includes('OPERATIONAL_TEAM_SCOPE_REQUIRED')) {
    return new Error('La decisione deve essere collegata a un gruppo operativo e a una disciplina.');
  }
  return new Error(message);
};

export class SupabaseSharedTeamReviewRepository implements SharedTeamReviewRepository {
  constructor(private readonly client: SupabaseClient) {}

  async upsertContribution(context: WorkspaceActorContext, input: UpsertTeamReviewContributionInput): Promise<TeamReviewContribution> {
    assertContextWorkspace(context, input.workspaceId);
    assertScope(input);
    assertRef(input.proposalRef, 'proposalRef');
    assertFingerprint(input.proposalFingerprint);
    if (!CONTRIBUTOR_ROLES.includes(context.membership.role)) throw new Error('TEAM_REVIEW_CONTRIBUTE_REQUIRED');
    if (!CONTRIBUTION_ORIENTATIONS.includes(input.orientation)) throw new Error('Orientamento non valido.');
    if (input.orientation === 'propose-change' && !input.customText?.trim()) {
      throw new Error('La modifica proposta richiede una formulazione esplicita.');
    }

    const { data, error } = await this.client.rpc('upsert_team_review_contribution_v2', {
      p_workspace_id: input.workspaceId,
      p_academic_year: input.academicYear,
      p_group_code: input.groupCode,
      p_discipline: input.discipline,
      p_proposal_ref: input.proposalRef,
      p_proposal_fingerprint: input.proposalFingerprint,
      p_orientation: input.orientation,
      p_custom_text: input.orientation === 'propose-change' ? input.customText?.trim() ?? null : null,
    });
    if (error) throw operationalError(error.message);
    if (!data || typeof data !== 'object') throw new Error('Il server non ha restituito il contributo registrato.');
    const contribution = toContribution(data as ContributionRow);
    if (
      contribution.workspaceId !== input.workspaceId
      || contribution.contributorUserId !== context.membership.userId
      || contribution.proposalRef !== input.proposalRef
      || contribution.groupCode !== input.groupCode
      || contribution.discipline !== input.discipline
    ) {
      throw new Error('Il contributo restituito dal server non corrisponde al profilo o alla scheda richiesti.');
    }
    return contribution;
  }

  async listContributions(context: WorkspaceActorContext, workspaceId: string, scope: TeamReviewScope): Promise<TeamReviewContribution[]> {
    assertContextWorkspace(context, workspaceId);
    assertScope(scope);
    const { data, error } = await this.client
      .from('team_review_contributions')
      .select('workspace_id,academic_year,group_code,discipline,proposal_ref,proposal_fingerprint,contributor_user_id,contributor_role,orientation,custom_text,updated_at')
      .eq('workspace_id', workspaceId)
      .eq('academic_year', scope.academicYear)
      .eq('group_code', scope.groupCode)
      .eq('discipline', scope.discipline);
    if (error) throw new Error(`Contributi del gruppo non leggibili: ${error.message}`);
    return ((data ?? []) as ContributionRow[]).map(toContribution);
  }

  async getEligibleContributorCount(context: WorkspaceActorContext, workspaceId: string, scope: TeamReviewScope): Promise<number | null> {
    assertContextWorkspace(context, workspaceId);
    assertScope(scope);
    const { data, error } = await this.client.rpc('get_team_review_eligible_contributor_count_v3', {
      p_workspace_id: workspaceId,
      p_academic_year: scope.academicYear,
      p_group_code: scope.groupCode,
      p_discipline: scope.discipline,
    });
    if (error) throw new Error(`Partecipazione del gruppo non verificabile: ${error.message}`);
    if (data === null) return null;
    if (typeof data !== 'number' || !Number.isInteger(data) || data < 0) {
      throw new Error('Il server non ha restituito una partecipazione del gruppo valida.');
    }
    return data;
  }

  async getMyOperationalMembership(context: WorkspaceActorContext, scope: TeamReviewScope): Promise<OperationalGroupMembership | null> {
    assertContextWorkspace(context, context.membership.workspaceId);
    assertScope(scope);
    const { data, error } = await this.client
      .from('team_operational_memberships')
      .select('user_id,academic_year,school_order,group_code,member_role,membership_state,disciplines')
      .eq('user_id', context.membership.userId)
      .eq('academic_year', scope.academicYear)
      .eq('group_code', scope.groupCode)
      .maybeSingle();
    if (error) throw new Error(`Profilo del gruppo non leggibile: ${error.message}`);
    return data ? toOperationalMembership(data as OperationalMembershipRow) : null;
  }

  async recordTeamOutcome(context: WorkspaceActorContext, input: RecordTeamReviewOutcomeInput): Promise<TeamReviewOutcomeReceipt> {
    assertContextWorkspace(context, input.workspaceId);
    assertScope(input);
    assertRef(input.proposalRef, 'proposalRef');
    assertFingerprint(input.proposalFingerprint);
    assertRef(input.clientRequestId, 'clientRequestId');
    if (!CONTRIBUTOR_ROLES.includes(context.membership.role)) throw new Error('TEAM_REVIEW_DECIDE_REQUIRED');
    if (!TEAM_OUTCOMES.includes(input.outcome)) throw new Error('Esito del gruppo non valido.');
    if (!input.rationale.trim()) throw new Error('La motivazione dell’esito del gruppo è obbligatoria.');
    if (input.outcome === 'shared-text' && !input.sharedText?.trim()) {
      throw new Error('Il testo condiviso è obbligatorio per questo esito.');
    }

    const { data, error } = await this.client.rpc('record_team_review_outcome_v2', {
      p_workspace_id: input.workspaceId,
      p_academic_year: input.academicYear,
      p_group_code: input.groupCode,
      p_discipline: input.discipline,
      p_proposal_ref: input.proposalRef,
      p_proposal_fingerprint: input.proposalFingerprint,
      p_outcome: input.outcome,
      p_shared_text: input.outcome === 'shared-text' ? input.sharedText?.trim() ?? null : null,
      p_rationale: input.rationale.trim(),
      p_client_request_id: input.clientRequestId,
    });
    if (error) throw operationalError(error.message);
    if (!data || typeof data !== 'object') throw new Error('Il server non ha restituito la ricevuta dell’esito del gruppo.');
    const receipt = toOutcome(data as OutcomeRow);
    if (
      receipt.workspaceId !== input.workspaceId
      || receipt.recordedByUserId !== context.membership.userId
      || receipt.proposalRef !== input.proposalRef
      || receipt.groupCode !== input.groupCode
      || receipt.discipline !== input.discipline
    ) {
      throw new Error('La ricevuta restituita dal server non corrisponde al profilo o alla scheda richiesti.');
    }
    return receipt;
  }

  async listTeamOutcomes(context: WorkspaceActorContext, workspaceId: string, scope: TeamReviewScope): Promise<TeamReviewOutcomeReceipt[]> {
    assertContextWorkspace(context, workspaceId);
    assertScope(scope);
    const { data, error } = await this.client
      .from('team_review_outcomes')
      .select('id,workspace_id,academic_year,group_code,discipline,proposal_ref,proposal_fingerprint,outcome,shared_text,rationale,recorded_by_user_id,recorded_by_role,recorded_by_operational_role,authority_state,recorded_at,client_request_id')
      .eq('workspace_id', workspaceId)
      .eq('academic_year', scope.academicYear)
      .eq('group_code', scope.groupCode)
      .eq('discipline', scope.discipline)
      .order('recorded_at', { ascending: false });
    if (error) throw new Error(`Esiti del gruppo non leggibili: ${error.message}`);
    return ((data ?? []) as OutcomeRow[]).map(toOutcome);
  }
}
