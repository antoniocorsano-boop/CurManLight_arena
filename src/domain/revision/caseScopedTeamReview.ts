import type {
  RecordTeamReviewOutcomeInput,
  TeamReviewContribution,
  TeamReviewOutcomeReceipt,
  TeamReviewScope,
  UpsertTeamReviewContributionInput,
} from './teamReview';

export interface CaseScopedTeamReviewScope extends TeamReviewScope {
  reviewCaseId: string;
}

export interface CaseScopedTeamReviewContribution extends TeamReviewContribution {
  reviewCaseId: string;
}

export interface CaseScopedTeamReviewOutcomeReceipt extends TeamReviewOutcomeReceipt {
  reviewCaseId: string;
}

export interface UpsertCaseScopedTeamReviewContributionInput extends UpsertTeamReviewContributionInput {
  reviewCaseId: string;
}

export interface RecordCaseScopedTeamReviewOutcomeInput extends RecordTeamReviewOutcomeInput {
  reviewCaseId: string;
}

export const assertReviewCaseId = (reviewCaseId: string): void => {
  if (
    !reviewCaseId
    || reviewCaseId !== reviewCaseId.trim()
    || reviewCaseId.length > 600
    || reviewCaseId.includes(String.fromCharCode(31))
  ) {
    throw new Error('REVIEW_CASE_ID_NOT_CANONICAL');
  }
};

export async function fingerprintCaseScopedTeamReviewProposal(input: {
  academicYear: string;
  order: string;
  groupCode: string;
  discipline: string;
  reviewCaseId: string;
  proposalRef: string;
  focus: string;
  oldText: string;
  newText: string;
}): Promise<string> {
  assertReviewCaseId(input.reviewCaseId);
  const canonical = JSON.stringify({
    academicYear: input.academicYear,
    order: input.order,
    groupCode: input.groupCode,
    discipline: input.discipline,
    reviewCaseId: input.reviewCaseId,
    proposalRef: input.proposalRef,
    focus: input.focus.trim(),
    oldText: input.oldText.trim(),
    newText: input.newText.trim(),
  });
  const bytes = new TextEncoder().encode(canonical);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function sameCaseScopedTeamReviewScope(
  a: CaseScopedTeamReviewScope,
  b: CaseScopedTeamReviewScope,
): boolean {
  return a.reviewCaseId === b.reviewCaseId
    && a.academicYear === b.academicYear
    && a.order === b.order
    && a.groupCode === b.groupCode
    && a.discipline === b.discipline;
}
