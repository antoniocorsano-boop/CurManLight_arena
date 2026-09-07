import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import type {
  RecordVerticalReviewOutcomeInput,
  VerticalReviewCandidate,
  VerticalReviewFinding,
  VerticalReviewMasterReference,
  VerticalReviewOutcomeReceipt,
  VerticalReviewOutcomeState,
  VerticalReviewRepository,
  VerticalReviewSourceSnapshot,
} from '../../domain/revision/verticalReview';
import type { TeamReviewOutcome } from '../../domain/revision/teamReview';

interface CandidateRow {
  team_outcome_id: string;
  workspace_id: string;
  review_case_id: string;
  academic_year: string;
  group_code: string;
  discipline: string;
  school_order: 'primaria' | 'secondaria';
  class_or_age_band: string;
  curriculum_unit_key: string;
  master_id: 'CAN-CURR-MASTER-00';
  master_drive_file_id: string;
  master_version: string;
  proposal_ref: string;
  proposal_fingerprint: string;
  team_outcome: TeamReviewOutcome;
  shared_text: string | null;
  team_rationale: string;
  team_outcome_recorded_at: string;
  scope_reason: string;
}

interface OutcomeRow {
  id: string;
  workspace_id: string;
  master_id: 'CAN-CURR-MASTER-00';
  master_drive_file_id: string;
  master_version: string;
  source_team_outcome_ids: string[];
  source_team_outcomes: unknown;
  reviewed_unit_keys: string[];
  outcome: VerticalReviewOutcomeState;
  findings: unknown;
  rationale: string;
  recorded_by_user_id: string;
  recorded_by_role: 'dipartimento' | 'referente' | 'dirigente';
  recorded_at: string;
  client_request_id: string;
  institutional_decision_created: false;
  adoption_receipt_created: false;
  curriculum_in_force_changed: false;
  automatic_master_promotion: false;
}

const assertContext = (context: WorkspaceActorContext, workspaceId: string): void => {
  if (context.assurance !== 'authenticated-workspace') throw new Error('VERTICAL_REVIEW_AUTHORITY_UNAVAILABLE');
  if (context.membership.workspaceId !== workspaceId || context.membership.status !== 'active') {
    throw new Error('La richiesta non appartiene a una membership attiva del workspace corrente.');
  }
};

const assertMaster = (master: VerticalReviewMasterReference): void => {
  if (
    master.id !== 'CAN-CURR-MASTER-00'
    || !master.driveFileId.trim()
    || !master.version.trim()
  ) throw new Error('VERTICAL_REVIEW_MASTER_INVALID');
};

const toCandidate = (row: CandidateRow): VerticalReviewCandidate => ({
  teamOutcomeId: row.team_outcome_id,
  workspaceId: row.workspace_id,
  reviewCaseId: row.review_case_id,
  academicYear: row.academic_year,
  groupCode: row.group_code,
  discipline: row.discipline,
  schoolOrder: row.school_order,
  classOrAgeBand: row.class_or_age_band,
  curriculumUnitKey: row.curriculum_unit_key,
  masterId: row.master_id,
  masterDriveFileId: row.master_drive_file_id,
  masterVersion: row.master_version,
  proposalRef: row.proposal_ref,
  proposalFingerprint: row.proposal_fingerprint,
  teamOutcome: row.team_outcome,
  sharedText: row.shared_text,
  teamRationale: row.team_rationale,
  teamOutcomeRecordedAt: row.team_outcome_recorded_at,
  scopeReason: row.scope_reason,
});

const parseFindings = (value: unknown): VerticalReviewFinding[] => Array.isArray(value)
  ? value.map((item) => {
      const raw = item as Record<string, unknown>;
      return {
        kind: String(raw.kind) as VerticalReviewFinding['kind'],
        fromUnitKey: String(raw.from_unit_key ?? raw.fromUnitKey ?? ''),
        toUnitKey: String(raw.to_unit_key ?? raw.toUnitKey ?? ''),
        note: String(raw.note ?? ''),
      };
    })
  : [];

const parseSourceSnapshots = (value: unknown): VerticalReviewSourceSnapshot[] => Array.isArray(value)
  ? value.map((item) => {
      const raw = item as Record<string, unknown>;
      return {
        teamOutcomeId: String(raw.team_outcome_id ?? ''),
        reviewCaseId: String(raw.review_case_id ?? ''),
        curriculumUnitKey: String(raw.curriculum_unit_key ?? ''),
        schoolOrder: String(raw.school_order ?? '') as VerticalReviewSourceSnapshot['schoolOrder'],
        classOrAgeBand: String(raw.class_or_age_band ?? ''),
        discipline: String(raw.discipline ?? ''),
        proposalRef: String(raw.proposal_ref ?? ''),
        proposalFingerprint: String(raw.proposal_fingerprint ?? ''),
        teamOutcome: String(raw.team_outcome ?? '') as TeamReviewOutcome,
        teamOutcomeRecordedAt: String(raw.team_outcome_recorded_at ?? ''),
      };
    })
  : [];

const toOutcome = (row: OutcomeRow): VerticalReviewOutcomeReceipt => {
  if (row.source_team_outcome_ids.length !== 2 || row.reviewed_unit_keys.length !== 2) {
    throw new Error('VERTICAL_REVIEW_RECEIPT_INVALID');
  }
  return {
    id: row.id,
    kind: 'VERTICAL_REVIEW_OUTCOME',
    workspaceId: row.workspace_id,
    master: {
      id: row.master_id,
      driveFileId: row.master_drive_file_id,
      version: row.master_version,
    },
    sourceTeamOutcomeIds: [row.source_team_outcome_ids[0], row.source_team_outcome_ids[1]],
    sourceTeamOutcomes: parseSourceSnapshots(row.source_team_outcomes),
    reviewedUnitKeys: [row.reviewed_unit_keys[0], row.reviewed_unit_keys[1]],
    outcome: row.outcome,
    findings: parseFindings(row.findings),
    rationale: row.rationale,
    recordedByUserId: row.recorded_by_user_id,
    recordedByRole: row.recorded_by_role,
    recordedAt: row.recorded_at,
    clientRequestId: row.client_request_id,
    institutionalDecisionCreated: row.institutional_decision_created,
    adoptionReceiptCreated: row.adoption_receipt_created,
    curriculumInForceChanged: row.curriculum_in_force_changed,
    automaticMasterPromotion: row.automatic_master_promotion,
  };
};

export class SupabaseVerticalReviewRepository implements VerticalReviewRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listCandidates(
    context: WorkspaceActorContext,
    workspaceId: string,
    master: VerticalReviewMasterReference,
    discipline: string,
  ): Promise<VerticalReviewCandidate[]> {
    assertContext(context, workspaceId);
    assertMaster(master);
    const { data, error } = await this.client.rpc('list_vertical_review_candidates_v1', {
      p_workspace_id: workspaceId,
      p_master_id: master.id,
      p_master_drive_file_id: master.driveFileId,
      p_master_version: master.version,
      p_discipline: discipline.trim(),
    });
    if (error) throw new Error(`Esiti professionali H2 non leggibili: ${error.message}`);
    return ((data ?? []) as CandidateRow[]).map(toCandidate);
  }

  async recordOutcome(
    context: WorkspaceActorContext,
    input: RecordVerticalReviewOutcomeInput,
  ): Promise<VerticalReviewOutcomeReceipt> {
    assertContext(context, input.workspaceId);
    assertMaster(input.master);
    const { data, error } = await this.client.rpc('record_vertical_review_outcome_v1', {
      p_workspace_id: input.workspaceId,
      p_master_id: input.master.id,
      p_master_drive_file_id: input.master.driveFileId,
      p_master_version: input.master.version,
      p_source_team_outcome_ids: input.sourceTeamOutcomeIds,
      p_outcome: input.outcome,
      p_findings: input.findings.map((finding) => ({
        kind: finding.kind,
        from_unit_key: finding.fromUnitKey,
        to_unit_key: finding.toUnitKey,
        note: finding.note,
      })),
      p_rationale: input.rationale,
      p_client_request_id: input.clientRequestId,
    });
    if (error) throw new Error(error.message);
    if (!data || typeof data !== 'object') throw new Error('Il server non ha restituito la ricevuta del riesame verticale.');
    return toOutcome(data as OutcomeRow);
  }

  async listOutcomes(
    context: WorkspaceActorContext,
    workspaceId: string,
    master: VerticalReviewMasterReference,
  ): Promise<VerticalReviewOutcomeReceipt[]> {
    assertContext(context, workspaceId);
    assertMaster(master);
    const { data, error } = await this.client
      .from('vertical_review_outcomes')
      .select('id,workspace_id,master_id,master_drive_file_id,master_version,source_team_outcome_ids,source_team_outcomes,reviewed_unit_keys,outcome,findings,rationale,recorded_by_user_id,recorded_by_role,recorded_at,client_request_id,institutional_decision_created,adoption_receipt_created,curriculum_in_force_changed,automatic_master_promotion')
      .eq('workspace_id', workspaceId)
      .eq('master_id', master.id)
      .eq('master_drive_file_id', master.driveFileId)
      .eq('master_version', master.version)
      .order('recorded_at', { ascending: false });
    if (error) throw new Error(`Esiti del riesame verticale non leggibili: ${error.message}`);
    return ((data ?? []) as OutcomeRow[]).map(toOutcome);
  }
}
