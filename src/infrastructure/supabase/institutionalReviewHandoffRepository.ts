import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import {
  assertInstitutionalReviewHandoffEligible,
  type InstitutionalReviewHandoffReceipt,
  type InstitutionalReviewHandoffRepository,
} from '../../domain/revision/institutionalReviewHandoff';
import type {
  VerticalReviewFinding,
  VerticalReviewMasterReference,
  VerticalReviewOutcomeReceipt,
  VerticalReviewSourceSnapshot,
} from '../../domain/revision/verticalReview';
import type { TeamReviewOutcome } from '../../domain/revision/teamReview';

interface HandoffRow {
  id: string;
  workspace_id: string;
  vertical_review_outcome_id: string;
  master_id: 'CAN-CURR-MASTER-00';
  master_drive_file_id: string;
  master_version: string;
  source_team_outcome_ids: string[];
  source_team_outcomes: unknown;
  reviewed_unit_keys: string[];
  discipline: string;
  vertical_outcome: 'COHERENT' | 'ISSUES_FOUND';
  findings: unknown;
  vertical_rationale: string;
  handoff_state: 'READY_FOR_INSTITUTIONAL_REVIEW';
  required_authority_role: 'collegio';
  prepared_by_user_id: string;
  prepared_by_role: 'dipartimento' | 'referente' | 'dirigente';
  prepared_at: string;
  client_request_id: string;
  institutional_decision_created: false;
  adoption_receipt_created: false;
  curriculum_in_force_changed: false;
  automatic_master_promotion: false;
}

const assertContext = (context: WorkspaceActorContext, workspaceId: string): void => {
  if (context.assurance !== 'authenticated-workspace') throw new Error('INSTITUTIONAL_REVIEW_HANDOFF_AUTHORITY_UNAVAILABLE');
  if (context.membership.workspaceId !== workspaceId || context.membership.status !== 'active') {
    throw new Error('La richiesta non appartiene a una membership attiva del workspace corrente.');
  }
};

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
        teamOutcomeId: String(raw.team_outcome_id ?? raw.teamOutcomeId ?? ''),
        reviewCaseId: String(raw.review_case_id ?? raw.reviewCaseId ?? ''),
        curriculumUnitKey: String(raw.curriculum_unit_key ?? raw.curriculumUnitKey ?? ''),
        schoolOrder: String(raw.school_order ?? raw.schoolOrder ?? '') as VerticalReviewSourceSnapshot['schoolOrder'],
        classOrAgeBand: String(raw.class_or_age_band ?? raw.classOrAgeBand ?? ''),
        discipline: String(raw.discipline ?? ''),
        proposalRef: String(raw.proposal_ref ?? raw.proposalRef ?? ''),
        proposalFingerprint: String(raw.proposal_fingerprint ?? raw.proposalFingerprint ?? ''),
        teamOutcome: String(raw.team_outcome ?? raw.teamOutcome ?? '') as TeamReviewOutcome,
        teamOutcomeRecordedAt: String(raw.team_outcome_recorded_at ?? raw.teamOutcomeRecordedAt ?? ''),
      };
    })
  : [];

const toReceipt = (row: HandoffRow): InstitutionalReviewHandoffReceipt => {
  if (row.source_team_outcome_ids.length !== 2 || row.reviewed_unit_keys.length !== 2) {
    throw new Error('INSTITUTIONAL_REVIEW_HANDOFF_RECEIPT_INVALID');
  }
  if (row.required_authority_role !== 'collegio' || row.handoff_state !== 'READY_FOR_INSTITUTIONAL_REVIEW') {
    throw new Error('INSTITUTIONAL_REVIEW_HANDOFF_AUTHORITY_INVALID');
  }
  return {
    id: row.id,
    kind: 'INSTITUTIONAL_REVIEW_HANDOFF',
    workspaceId: row.workspace_id,
    verticalReviewOutcomeId: row.vertical_review_outcome_id,
    master: {
      id: row.master_id,
      driveFileId: row.master_drive_file_id,
      version: row.master_version,
    },
    sourceTeamOutcomeIds: [row.source_team_outcome_ids[0], row.source_team_outcome_ids[1]],
    sourceTeamOutcomes: parseSourceSnapshots(row.source_team_outcomes),
    reviewedUnitKeys: [row.reviewed_unit_keys[0], row.reviewed_unit_keys[1]],
    discipline: row.discipline,
    verticalOutcome: row.vertical_outcome,
    findings: parseFindings(row.findings),
    verticalRationale: row.vertical_rationale,
    handoffState: row.handoff_state,
    requiredAuthorityRole: row.required_authority_role,
    preparedByUserId: row.prepared_by_user_id,
    preparedByRole: row.prepared_by_role,
    preparedAt: row.prepared_at,
    clientRequestId: row.client_request_id,
    institutionalDecisionCreated: row.institutional_decision_created,
    adoptionReceiptCreated: row.adoption_receipt_created,
    curriculumInForceChanged: row.curriculum_in_force_changed,
    automaticMasterPromotion: row.automatic_master_promotion,
  };
};

export class SupabaseInstitutionalReviewHandoffRepository implements InstitutionalReviewHandoffRepository {
  constructor(private readonly client: SupabaseClient) {}

  async prepare(
    context: WorkspaceActorContext,
    verticalReviewOutcome: VerticalReviewOutcomeReceipt,
    clientRequestId: string,
  ): Promise<InstitutionalReviewHandoffReceipt> {
    assertContext(context, verticalReviewOutcome.workspaceId);
    assertInstitutionalReviewHandoffEligible(verticalReviewOutcome);
    if (!clientRequestId.trim()) throw new Error('INSTITUTIONAL_REVIEW_HANDOFF_CLIENT_REQUEST_ID_REQUIRED');

    const { data, error } = await this.client.rpc('prepare_vertical_review_institutional_handoff_v1', {
      p_workspace_id: verticalReviewOutcome.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_vertical_review_outcome_id: verticalReviewOutcome.id,
      p_client_request_id: clientRequestId,
    });
    if (error) throw new Error(error.message);
    if (!data || typeof data !== 'object') throw new Error('Il server non ha restituito la ricevuta del passaggio istituzionale.');
    return toReceipt(data as HandoffRow);
  }

  async list(
    context: WorkspaceActorContext,
    workspaceId: string,
    master: VerticalReviewMasterReference,
  ): Promise<InstitutionalReviewHandoffReceipt[]> {
    assertContext(context, workspaceId);
    const { data, error } = await this.client
      .from('vertical_review_institutional_handoffs')
      .select('id,workspace_id,vertical_review_outcome_id,master_id,master_drive_file_id,master_version,source_team_outcome_ids,source_team_outcomes,reviewed_unit_keys,discipline,vertical_outcome,findings,vertical_rationale,handoff_state,required_authority_role,prepared_by_user_id,prepared_by_role,prepared_at,client_request_id,institutional_decision_created,adoption_receipt_created,curriculum_in_force_changed,automatic_master_promotion')
      .eq('workspace_id', workspaceId)
      .eq('master_id', master.id)
      .eq('master_drive_file_id', master.driveFileId)
      .eq('master_version', master.version)
      .order('prepared_at', { ascending: false });
    if (error) throw new Error(`Passaggi verso l’iter istituzionale non leggibili: ${error.message}`);
    return ((data ?? []) as HandoffRow[]).map(toReceipt);
  }
}
