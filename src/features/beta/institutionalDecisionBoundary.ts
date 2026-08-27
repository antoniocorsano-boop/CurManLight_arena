import type {
  InstitutionalDecisionOutcome,
  InstitutionalRevisionDecisionReceipt,
} from '../../domain/revision';

export type ReceiptLookupState = 'idle' | 'loading' | 'resolved' | 'error';

const TERMINAL_OUTCOMES: readonly InstitutionalDecisionOutcome[] = [
  'approve',
  'approve-with-changes',
  'reject',
];

export const isTerminalInstitutionalOutcome = (
  outcome: InstitutionalDecisionOutcome
): boolean => TERMINAL_OUTCOMES.includes(outcome);

export const receiptMatchesCurrentVersion = (
  receipt: InstitutionalRevisionDecisionReceipt | null,
  currentFingerprint: string | null
): boolean => Boolean(
  receipt
  && currentFingerprint
  && receipt.proposalVersionFingerprint === currentFingerprint
);

export const receiptIsTerminalForCurrentVersion = (
  receipt: InstitutionalRevisionDecisionReceipt | null,
  currentFingerprint: string | null
): boolean => Boolean(
  receiptMatchesCurrentVersion(receipt, currentFingerprint)
  && receipt
  && isTerminalInstitutionalOutcome(receipt.outcome)
);

export const decisionControlsMayOpen = (
  lookupState: ReceiptLookupState,
  receipt: InstitutionalRevisionDecisionReceipt | null,
  currentFingerprint: string | null
): boolean => {
  if (lookupState !== 'resolved') return false;
  if (!receipt) return Boolean(currentFingerprint);
  if (!receiptMatchesCurrentVersion(receipt, currentFingerprint)) return false;
  return !isTerminalInstitutionalOutcome(receipt.outcome);
};

export const previewStillMatchesVersion = (
  previewFingerprint: string | null,
  freshFingerprint: string
): boolean => Boolean(previewFingerprint && previewFingerprint === freshFingerprint);
