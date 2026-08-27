import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  InstitutionalCurriculumBaselineAttestationInput,
  InstitutionalCurriculumBaselineReceipt,
  InstitutionalCurriculumBaselineRepository,
  VerifiedCurriculumFrameworkSource,
} from '../../domain/institution/institutionalBaselinePort';
import type {
  SharedWorkspaceRepository,
  WorkspaceActorContext,
} from '../../domain/institution/sharedWorkspacePort';
import { SupabaseSharedWorkspaceRepository } from './sharedWorkspaceRepository';

interface BaselineRow {
  id: string;
  workspace_id: string;
  baseline_version_ref: string;
  baseline_fingerprint: string;
  source_document_title: string;
  source_document_ref: string;
  source_document_fingerprint: string;
  source_document_issued_at: string;
  framework_source_ref: string;
  status: string;
  attested_by: string;
  attested_at: string;
  client_request_id: string;
}

interface FrameworkSourceRow {
  source_ref: string;
  title: string;
  source_type: string;
  authority: string;
  issued_at: string;
  publication_reference: string;
  official_identifier: string;
  official_locator: string;
  effective_from: string;
  status: string;
  assurance: string;
}

const BASELINE_COLUMNS = 'id,workspace_id,baseline_version_ref,baseline_fingerprint,source_document_title,source_document_ref,source_document_fingerprint,source_document_issued_at,framework_source_ref,status,attested_by,attested_at,client_request_id';
const FRAMEWORK_SOURCE_COLUMNS = 'source_ref,title,source_type,authority,issued_at,publication_reference,official_identifier,official_locator,effective_from,status,assurance';

const SHA256 = /^[a-f0-9]{64}$/i;

const toBaselineReceipt = (row: BaselineRow): InstitutionalCurriculumBaselineReceipt => {
  if (row.status !== 'current' && row.status !== 'superseded') {
    throw new Error('Il server ha restituito uno stato baseline non riconosciuto.');
  }

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    baselineVersionRef: row.baseline_version_ref,
    baselineFingerprint: row.baseline_fingerprint,
    sourceDocumentTitle: row.source_document_title,
    sourceDocumentRef: row.source_document_ref,
    sourceDocumentFingerprint: row.source_document_fingerprint,
    sourceDocumentIssuedAt: row.source_document_issued_at,
    frameworkSourceRef: row.framework_source_ref,
    status: row.status,
    attestedByUserId: row.attested_by,
    attestedAt: row.attested_at,
    clientRequestId: row.client_request_id,
  };
};

const toFrameworkSource = (row: FrameworkSourceRow): VerifiedCurriculumFrameworkSource => {
  if (
    (row.source_type !== 'normative-ministerial' && row.source_type !== 'normative-national') ||
    row.status !== 'active' ||
    row.assurance !== 'verified-official'
  ) {
    throw new Error('La fonte curricolare non soddisfa il contratto di fonte ufficiale verificata.');
  }

  return {
    sourceRef: row.source_ref,
    title: row.title,
    sourceType: row.source_type,
    authority: row.authority,
    issuedAt: row.issued_at,
    publicationReference: row.publication_reference,
    officialIdentifier: row.official_identifier,
    officialLocator: row.official_locator,
    effectiveFrom: row.effective_from,
    status: 'active',
    assurance: 'verified-official',
  };
};

const assertAttestationInput = (input: InstitutionalCurriculumBaselineAttestationInput): void => {
  if (
    !input.workspaceId.trim() ||
    !input.baselineVersionRef.trim() ||
    !input.sourceDocumentTitle.trim() ||
    !input.sourceDocumentRef.trim() ||
    !input.frameworkSourceRef.trim() ||
    !input.clientRequestId.trim()
  ) {
    throw new Error('I riferimenti della baseline e della fonte istituzionale sono obbligatori.');
  }

  if (!SHA256.test(input.baselineFingerprint) || !SHA256.test(input.sourceDocumentFingerprint)) {
    throw new Error('Le impronte della baseline e del documento devono essere SHA-256 esadecimali.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.sourceDocumentIssuedAt)) {
    throw new Error('La data del documento istituzionale deve essere nel formato YYYY-MM-DD.');
  }
};

export class SupabaseInstitutionalCurriculumBaselineRepository
  implements InstitutionalCurriculumBaselineRepository {
  private readonly workspaceRepository: SharedWorkspaceRepository;

  constructor(
    private readonly client: SupabaseClient,
    workspaceRepository?: SharedWorkspaceRepository
  ) {
    this.workspaceRepository = workspaceRepository ?? new SupabaseSharedWorkspaceRepository(client);
  }

  async getVerifiedFrameworkSource(
    sourceRef: string
  ): Promise<VerifiedCurriculumFrameworkSource | null> {
    if (!sourceRef.trim()) return null;

    const { data, error } = await this.client
      .from('verified_curriculum_sources')
      .select(FRAMEWORK_SOURCE_COLUMNS)
      .eq('source_ref', sourceRef)
      .maybeSingle();

    if (error) {
      throw new Error(`Fonte curricolare non leggibile: ${error.message}`);
    }

    return data ? toFrameworkSource(data as FrameworkSourceRow) : null;
  }

  async getCurrentBaseline(
    context: WorkspaceActorContext
  ): Promise<InstitutionalCurriculumBaselineReceipt | null> {
    const allowed = await this.workspaceRepository.can(context, 'CURRICULUM_READ');
    if (!allowed) {
      throw new Error('La membership autenticata non può leggere la baseline del workspace.');
    }

    const { data, error } = await this.client
      .from('institutional_curriculum_baselines')
      .select(BASELINE_COLUMNS)
      .eq('workspace_id', context.membership.workspaceId)
      .eq('status', 'current')
      .maybeSingle();

    if (error) {
      throw new Error(`Baseline istituzionale non leggibile: ${error.message}`);
    }

    return data ? toBaselineReceipt(data as BaselineRow) : null;
  }

  async attestBaseline(
    context: WorkspaceActorContext,
    input: InstitutionalCurriculumBaselineAttestationInput
  ): Promise<InstitutionalCurriculumBaselineReceipt> {
    assertAttestationInput(input);

    if (context.membership.workspaceId !== input.workspaceId) {
      throw new Error('L’attestazione non appartiene al workspace autenticato corrente.');
    }

    const allowed = await this.workspaceRepository.can(context, 'CURRICULUM_BASELINE_ATTEST');
    if (!allowed) {
      throw new Error('La membership autenticata non possiede CURRICULUM_BASELINE_ATTEST.');
    }

    const { data, error } = await this.client.rpc('attest_institutional_curriculum_baseline', {
      p_workspace_id: input.workspaceId,
      p_baseline_version_ref: input.baselineVersionRef,
      p_baseline_fingerprint: input.baselineFingerprint.toLowerCase(),
      p_source_document_title: input.sourceDocumentTitle.trim(),
      p_source_document_ref: input.sourceDocumentRef.trim(),
      p_source_document_fingerprint: input.sourceDocumentFingerprint.toLowerCase(),
      p_source_document_issued_at: input.sourceDocumentIssuedAt,
      p_framework_source_ref: input.frameworkSourceRef,
      p_client_request_id: input.clientRequestId,
    });

    if (error) {
      throw new Error(`Baseline istituzionale non attestata: ${error.message}`);
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      throw new Error('Il server non ha restituito la ricevuta di attestazione della baseline.');
    }

    return toBaselineReceipt(row as BaselineRow);
  }
}
