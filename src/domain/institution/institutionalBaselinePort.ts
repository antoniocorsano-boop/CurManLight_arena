import type { WorkspaceActorContext } from './sharedWorkspacePort';

export interface VerifiedCurriculumFrameworkSource {
  sourceRef: string;
  title: string;
  sourceType: 'normative-ministerial' | 'normative-national';
  authority: string;
  issuedAt: string;
  publicationReference: string;
  officialIdentifier: string;
  officialLocator: string;
  effectiveFrom: string;
  status: 'active';
  assurance: 'verified-official';
}

export interface InstitutionalCurriculumBaselineAttestationInput {
  workspaceId: string;
  baselineVersionRef: string;
  baselineFingerprint: string;
  sourceDocumentTitle: string;
  sourceDocumentRef: string;
  sourceDocumentFingerprint: string;
  sourceDocumentIssuedAt: string;
  frameworkSourceRef: string;
  clientRequestId: string;
}

export interface InstitutionalCurriculumBaselineReceipt {
  id: string;
  workspaceId: string;
  baselineVersionRef: string;
  baselineFingerprint: string;
  sourceDocumentTitle: string;
  sourceDocumentRef: string;
  sourceDocumentFingerprint: string;
  sourceDocumentIssuedAt: string;
  frameworkSourceRef: string;
  status: 'current' | 'superseded';
  attestedByUserId: string;
  attestedAt: string;
  clientRequestId: string;
}

/**
 * Establishing which structured snapshot faithfully represents the current
 * institute curriculum is an authenticated attestation, not a review action,
 * a workspace-administration action or a curriculum decision.
 */
export interface InstitutionalCurriculumBaselineRepository {
  getVerifiedFrameworkSource(sourceRef: string): Promise<VerifiedCurriculumFrameworkSource | null>;

  getCurrentBaseline(
    context: WorkspaceActorContext
  ): Promise<InstitutionalCurriculumBaselineReceipt | null>;

  attestBaseline(
    context: WorkspaceActorContext,
    input: InstitutionalCurriculumBaselineAttestationInput
  ): Promise<InstitutionalCurriculumBaselineReceipt>;
}
