import { describe, expect, it } from 'vitest';
import { INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3, countInstituteSourceReviewBlockers } from '../domain/curriculum/institute/sourceReconstructionReadiness';
import {
  CURRENT_INSTITUTE_SOURCE_REVIEW_ASSESSMENT,
  INSTITUTE_SOURCE_REVIEW_QUEUE,
  assessInstituteSourceReview,
  createInstituteSourceReviewReceiptPack,
  doesInstituteSourceReceiptResolveTask,
  validateInstituteSourceReviewReceipt,
  validateInstituteSourceReviewReceiptPack,
  type InstituteSourceReviewReceipt,
  type InstituteSourceReviewTaskId,
} from '../domain/curriculum/institute/sourceReviewQueue';

const sourceSha256 = INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3.sourceSha256;
const correctedSha256 = 'b'.repeat(64);
const reviewedAt = '2026-09-03T20:30:00.000Z';

function receipt(
  taskId: InstituteSourceReviewTaskId,
  decision: InstituteSourceReviewReceipt['decision'],
  extra: Partial<InstituteSourceReviewReceipt> = {},
): InstituteSourceReviewReceipt {
  const task = INSTITUTE_SOURCE_REVIEW_QUEUE.find((candidate) => candidate.taskId === taskId);
  if (!task) throw new Error(`missing test task ${taskId}`);
  return {
    schemaVersion: 'arena-institute-source-review-receipt-v1',
    sourceSha256,
    taskId,
    findingId: task.findingId,
    decision,
    reviewerAttestation: true,
    reviewedAt,
    ...extra,
  };
}

describe('R7C7A institute source remediation queue', () => {
  it('models the seven actionable audit units without promoting source authority', () => {
    expect(INSTITUTE_SOURCE_REVIEW_QUEUE).toHaveLength(7);
    expect(countInstituteSourceReviewBlockers()).toBe(7);
    expect(INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3.rationaleStatus.blockedSourceDefect).toBe(2);
    expect(CURRENT_INSTITUTE_SOURCE_REVIEW_ASSESSMENT).toMatchObject({
      state: 'BLOCKED',
      totalTaskCount: 7,
      resolvedTaskCount: 0,
      unresolvedTaskCount: 7,
      sourceAuthorityMutationAuthorized: false,
      semanticReviewComplete: false,
      automaticCanonicalPromotionAuthorized: false,
    });
  });

  it('does not treat acknowledgement as repair', () => {
    const acknowledgement = receipt(
      'CV-AUD-002-MUSICA-RATIONALE',
      'ACKNOWLEDGED_REQUIRES_CORRECTED_SOURCE',
    );
    expect(validateInstituteSourceReviewReceipt(acknowledgement).valid).toBe(true);
    expect(doesInstituteSourceReceiptResolveTask(acknowledgement)).toBe(false);
    expect(assessInstituteSourceReview([acknowledgement])).toMatchObject({
      state: 'BLOCKED',
      resolvedTaskCount: 0,
      acknowledgedButUnresolvedTaskCount: 1,
      unresolvedTaskCount: 7,
    });
  });

  it('requires a different valid SHA-256 and a correction note for corrected-source resolution', () => {
    const missingReplacement = receipt(
      'CV-AUD-005-EDUCAZIONE-FISICA-HEADER',
      'CORRECTED_SOURCE_VERSION_LINKED',
    );
    expect(validateInstituteSourceReviewReceipt(missingReplacement).valid).toBe(false);

    const sameReplacement = receipt(
      'CV-AUD-005-EDUCAZIONE-FISICA-HEADER',
      'CORRECTED_SOURCE_VERSION_LINKED',
      { replacementSourceSha256: sourceSha256, notes: 'Intestazione corretta.' },
    );
    expect(validateInstituteSourceReviewReceipt(sameReplacement).valid).toBe(false);

    const corrected = receipt(
      'CV-AUD-005-EDUCAZIONE-FISICA-HEADER',
      'CORRECTED_SOURCE_VERSION_LINKED',
      { replacementSourceSha256: correctedSha256, notes: 'Intestazione corretta nella nuova versione.' },
    );
    expect(validateInstituteSourceReviewReceipt(corrected).valid).toBe(true);
    expect(doesInstituteSourceReceiptResolveTask(corrected)).toBe(true);
  });

  it('allows only explicit human scope/identity decisions to resolve the two decision tasks', () => {
    const deferredScope = receipt('CV-AUD-004-LATINO-SCOPE', 'SCOPE_DEFERRED');
    const resolvedScope = receipt('CV-AUD-004-LATINO-SCOPE', 'SCOPE_SECOND_YEAR_AND_LATER');
    const pendingIdentity = receipt(
      'CV-AUD-006-CORPO-IDENTITY',
      'IDENTITY_KEEP_SOURCE_LABEL_PENDING_REPAIR',
    );
    const resolvedIdentity = receipt(
      'CV-AUD-006-CORPO-IDENTITY',
      'IDENTITY_NORMALIZE_CANONICAL_PRESERVE_SOURCE_LABEL',
    );

    expect(doesInstituteSourceReceiptResolveTask(deferredScope)).toBe(false);
    expect(doesInstituteSourceReceiptResolveTask(resolvedScope)).toBe(true);
    expect(doesInstituteSourceReceiptResolveTask(pendingIdentity)).toBe(false);
    expect(doesInstituteSourceReceiptResolveTask(resolvedIdentity)).toBe(true);
  });

  it('can close source remediation only when all seven tasks have non-conflicting resolving evidence', () => {
    const receipts: InstituteSourceReviewReceipt[] = [
      receipt('CV-AUD-001-ITALIANO', 'CORRECTED_SOURCE_VERSION_LINKED', { replacementSourceSha256: correctedSha256, notes: 'Progressione corretta.' }),
      receipt('CV-AUD-001-INGLESE', 'CORRECTED_SOURCE_VERSION_LINKED', { replacementSourceSha256: correctedSha256, notes: 'Progressione corretta.' }),
      receipt('CV-AUD-002-MUSICA-RATIONALE', 'CORRECTED_SOURCE_VERSION_LINKED', { replacementSourceSha256: correctedSha256, notes: 'Razionale Musica corretto.' }),
      receipt('CV-AUD-003-MOTORIA-RATIONALE', 'CORRECTED_SOURCE_VERSION_LINKED', { replacementSourceSha256: correctedSha256, notes: 'Razionale motorio corretto.' }),
      receipt('CV-AUD-004-LATINO-SCOPE', 'SCOPE_SECOND_YEAR_AND_LATER'),
      receipt('CV-AUD-005-EDUCAZIONE-FISICA-HEADER', 'CORRECTED_SOURCE_VERSION_LINKED', { replacementSourceSha256: correctedSha256, notes: 'Header corretto.' }),
      receipt('CV-AUD-006-CORPO-IDENTITY', 'IDENTITY_NORMALIZE_CANONICAL_PRESERVE_SOURCE_LABEL'),
    ];

    expect(assessInstituteSourceReview(receipts)).toMatchObject({
      state: 'SOURCE_REMEDIATION_COMPLETE',
      totalTaskCount: 7,
      resolvedTaskCount: 7,
      unresolvedTaskCount: 0,
      invalidReceiptCount: 0,
      sourceAuthorityMutationAuthorized: false,
      semanticReviewComplete: false,
      automaticCanonicalPromotionAuthorized: false,
    });

    const pack = createInstituteSourceReviewReceiptPack(receipts, '2026-09-03T20:31:00.000Z');
    expect(validateInstituteSourceReviewReceiptPack(pack)).toEqual({ valid: true });
  });

  it('fails closed when conflicting human receipts exist for the same task', () => {
    const assessment = assessInstituteSourceReview([
      receipt('CV-AUD-004-LATINO-SCOPE', 'SCOPE_SECOND_YEAR_AND_LATER'),
      receipt('CV-AUD-004-LATINO-SCOPE', 'SCOPE_CLASS_ONE'),
    ]);
    expect(assessment.state).toBe('BLOCKED');
    expect(assessment.conflictingTaskIds).toContain('CV-AUD-004-LATINO-SCOPE');
  });
});
