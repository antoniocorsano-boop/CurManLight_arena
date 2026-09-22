// EC-01/Arena-F4 — trusted normative checker Edge Function.
// Deployment is intentionally outside this slice.

import { withSupabase } from 'npm:@supabase/server@^1';
import {
  confirmTrustedCivicNormativeCheck,
  previewTrustedCivicNormativeCheck,
  type CivicNormativeBaselineLoader,
  type CivicNormativeReceiptRecorder,
  type CivicNormativeSourceBaseline,
  type CivicNormativeConfirmationRole,
} from '../../../src/infrastructure/server/civicEducationNormativeChecker.ts';

type RequestBody = {
  mode: 'preview' | 'confirm';
  workspaceId: string;
  institutionId: string;
  frameworkId: string;
  frameworkVersionLabel: string;
  clientRequestId?: string;
};

function json(status: number, body: unknown): Response {
  return Response.json(body, { status });
}

function isRequestBody(value: unknown): value is RequestBody {
  if (!value || typeof value !== 'object') return false;
  const body = value as Partial<RequestBody>;
  return (
    (body.mode === 'preview' || body.mode === 'confirm')
    && typeof body.workspaceId === 'string'
    && body.workspaceId.trim() === body.workspaceId
    && body.workspaceId.length > 0
    && typeof body.institutionId === 'string'
    && body.institutionId.trim() === body.institutionId
    && body.institutionId.length > 0
    && typeof body.frameworkId === 'string'
    && body.frameworkId.trim() === body.frameworkId
    && body.frameworkId.length > 0
    && typeof body.frameworkVersionLabel === 'string'
    && body.frameworkVersionLabel.trim() === body.frameworkVersionLabel
    && body.frameworkVersionLabel.length > 0
    && (
      body.clientRequestId === undefined
      || (
        typeof body.clientRequestId === 'string'
        && body.clientRequestId.trim() === body.clientRequestId
        && body.clientRequestId.length > 0
        && body.clientRequestId.length <= 200
      )
    )
  );
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, ctx) => {
  if (request.method !== 'POST') return json(405, { error: 'METHOD_NOT_ALLOWED' });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'INVALID_JSON' });
  }
  if (!isRequestBody(body)) return json(400, { error: 'INVALID_REQUEST' });

  const userId = ctx.userClaims?.id;
  if (!userId) return json(401, { error: 'AUTHENTICATION_REQUIRED' });
  const serviceClient = ctx.supabaseAdmin;

  const { data: memberships, error: membershipError } = await serviceClient
    .from('workspace_memberships')
    .select('role,status')
    .eq('workspace_id', body.workspaceId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1);

  if (membershipError) return json(503, { error: 'MEMBERSHIP_LOOKUP_FAILED' });
  const role = memberships?.[0]?.role as string | undefined;
  if (role !== 'referente' && role !== 'collegio') {
    return json(403, { error: 'CIVIC_NORMATIVE_CONFIRMATION_ROLE_REQUIRED' });
  }

  const loader: CivicNormativeBaselineLoader = {
    async loadActiveBaselines(frameworkVersionLabel: string): Promise<CivicNormativeSourceBaseline[]> {
      const { data: heads, error: headsError } = await serviceClient
        .from('civic_education_normative_source_heads')
        .select('framework_version_label,source_key,baseline_id')
        .eq('framework_version_label', frameworkVersionLabel)
        .order('source_key');
      if (headsError) throw new Error('CIVIC_NORMATIVE_BASELINE_LOAD_FAILED');
      if (!heads?.length) return [];

      const ids = heads.map(head => head.baseline_id);
      const { data: rows, error: baselineError } = await serviceClient
        .from('civic_education_normative_source_baselines')
        .select('id,source_key,authority,title,source_url,normalization_version,expected_sha256')
        .in('id', ids);
      if (baselineError) throw new Error('CIVIC_NORMATIVE_BASELINE_LOAD_FAILED');

      const byId = new Map((rows ?? []).map(row => [row.id, row]));
      return heads.map(head => {
        const row = byId.get(head.baseline_id);
        if (!row) throw new Error('CIVIC_NORMATIVE_BASELINE_HEAD_DANGLING');
        return {
          sourceKey: row.source_key,
          authority: row.authority,
          title: row.title,
          url: row.source_url,
          normalizationVersion: row.normalization_version,
          expectedSha256: row.expected_sha256,
        } as CivicNormativeSourceBaseline;
      });
    },
  };

  try {
    if (body.mode === 'preview') {
      const result = await previewTrustedCivicNormativeCheck(
        loader,
        fetch,
        body.frameworkVersionLabel,
      );
      return json(result.status === 'verified' ? 200 : 409, result);
    }

    if (!body.clientRequestId) {
      return json(400, { error: 'CIVIC_NORMATIVE_CLIENT_REQUEST_ID_REQUIRED' });
    }

    const recorder: CivicNormativeReceiptRecorder = {
      async findExisting(scope) {
        const { data, error } = await serviceClient
          .from('civic_education_normative_check_receipts')
          .select(
            'id,normative_fingerprint,verification_snapshot,source_observations,institution_id,framework_id,framework_version_label,confirmed_by_user_id,confirmed_by_role',
          )
          .eq('workspace_id', scope.workspaceId)
          .eq('client_request_id', scope.clientRequestId)
          .maybeSingle();

        if (error) throw new Error('CIVIC_NORMATIVE_RECEIPT_LOOKUP_FAILED');
        if (!data) return null;

        if (
          data.institution_id !== scope.institutionId
          || data.framework_id !== scope.frameworkId
          || data.framework_version_label !== scope.frameworkVersionLabel
          || data.confirmed_by_user_id !== scope.requestedByUserId
          || data.confirmed_by_role !== scope.requestedByRole
        ) {
          throw new Error('CIVIC_NORMATIVE_REQUEST_ID_REUSE_MISMATCH');
        }

        if (
          !data.id
          || !data.normative_fingerprint
          || !data.verification_snapshot
          || !Array.isArray(data.source_observations)
        ) {
          throw new Error('CIVIC_NORMATIVE_RECEIPT_INVALID');
        }

        return {
          id: data.id,
          normativeFingerprint: data.normative_fingerprint,
          verificationSnapshot: data.verification_snapshot as Parameters<CivicNormativeReceiptRecorder['record']>[0]['verification'],
          observations: data.source_observations as Parameters<CivicNormativeReceiptRecorder['record']>[0]['observations'],
        };
      },
      async record(input) {
        const { data, error } = await serviceClient.rpc(
          'record_civic_education_normative_check_v1',
          {
            p_workspace_id: input.scope.workspaceId,
            p_requested_by_user_id: input.scope.requestedByUserId,
            p_institution_id: input.scope.institutionId,
            p_framework_id: input.scope.frameworkId,
            p_framework_version_label: input.scope.frameworkVersionLabel,
            p_client_request_id: input.scope.clientRequestId,
            p_verification_snapshot: input.verification,
            p_source_observations: input.observations,
          },
        );
        if (error || !data) throw new Error(error?.message ?? 'CIVIC_NORMATIVE_RECEIPT_RECORD_FAILED');
        const receipt = data as {
          id?: string;
          normative_fingerprint?: string;
          verification_snapshot?: unknown;
        };
        if (!receipt.id || !receipt.normative_fingerprint || !receipt.verification_snapshot) {
          throw new Error('CIVIC_NORMATIVE_RECEIPT_INVALID');
        }
        return {
          id: receipt.id,
          normativeFingerprint: receipt.normative_fingerprint,
          verificationSnapshot: receipt.verification_snapshot as Parameters<CivicNormativeReceiptRecorder['record']>[0]['verification'],
          observations: input.observations,
        };
      },
    };

    const result = await confirmTrustedCivicNormativeCheck(
      {
        workspaceId: body.workspaceId,
        requestedByUserId: userId,
        requestedByRole: role as CivicNormativeConfirmationRole,
        institutionId: body.institutionId,
        frameworkId: body.frameworkId,
        frameworkVersionLabel: body.frameworkVersionLabel,
        clientRequestId: body.clientRequestId,
      },
      loader,
      recorder,
      fetch,
    );

    return json(result.status === 'recorded' ? 200 : 409, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CIVIC_NORMATIVE_CHECK_FAILED';
    return json(503, { error: message });
  }
  }),
};
