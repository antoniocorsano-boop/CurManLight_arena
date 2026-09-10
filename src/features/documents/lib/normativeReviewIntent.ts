export const NORMATIVE_REVIEW_REQUEST_EVENT = 'arena:normative-review-request' as const;

export type NormativeReviewRequestDetail = {
  sourceCode: string;
};

export function requestNormativeReview(sourceCode: string): void {
  const normalizedSourceCode = sourceCode.trim();
  if (!normalizedSourceCode || typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent<NormativeReviewRequestDetail>(NORMATIVE_REVIEW_REQUEST_EVENT, {
    detail: { sourceCode: normalizedSourceCode },
  }));
}

export function readNormativeReviewRequest(event: Event): string | null {
  if (!(event instanceof CustomEvent)) return null;
  const detail = event.detail as Partial<NormativeReviewRequestDetail> | undefined;
  const sourceCode = detail?.sourceCode?.trim();
  return sourceCode || null;
}
