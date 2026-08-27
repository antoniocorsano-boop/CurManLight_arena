import { describe, expect, it } from 'vitest';
import type { InstitutionalRevisionDecisionReceipt } from '../domain/revision';
import {
  decisionControlsMayOpen,
  isTerminalInstitutionalOutcome,
  previewStillMatchesVersion,
  receiptIsTerminalForCurrentVersion,
} from '../features/beta/institutionalDecisionBoundary';

const receipt = (
  outcome: InstitutionalRevisionDecisionReceipt['outcome'],
  fingerprint = 'a'.repeat(64)
): InstitutionalRevisionDecisionReceipt => ({
  id: 'receipt-1',
  workspaceId: 'workspace-1',
  proposalRef: 'proposal-1',
  proposalVersionRef: 'version-1',
  proposalVersionFingerprint: fingerprint,
  outcome,
  rationale: 'Motivazione',
  decidedByUserId: 'user-1',
  authorityRole: 'collegio',
  decidedAt: '2026-08-27T12:00:00.000Z',
  clientRequestId: 'request-1',
});

describe('institutional decision boundary', () => {
  it('fails closed while receipt lookup is loading or errored', () => {
    expect(decisionControlsMayOpen('loading', null, 'a'.repeat(64))).toBe(false);
    expect(decisionControlsMayOpen('error', null, 'a'.repeat(64))).toBe(false);
  });

  it('opens only after a conclusive no-receipt lookup and a computed current fingerprint', () => {
    expect(decisionControlsMayOpen('resolved', null, 'a'.repeat(64))).toBe(true);
    expect(decisionControlsMayOpen('resolved', null, null)).toBe(false);
  });

  it('treats approve, approve-with-changes and reject as terminal', () => {
    expect(isTerminalInstitutionalOutcome('approve')).toBe(true);
    expect(isTerminalInstitutionalOutcome('approve-with-changes')).toBe(true);
    expect(isTerminalInstitutionalOutcome('reject')).toBe(true);
    expect(receiptIsTerminalForCurrentVersion(receipt('approve'), 'a'.repeat(64))).toBe(true);
  });

  it('allows deliberation to resume after non-final defer or return-for-revision receipts', () => {
    expect(isTerminalInstitutionalOutcome('defer')).toBe(false);
    expect(isTerminalInstitutionalOutcome('return-for-revision')).toBe(false);
    expect(decisionControlsMayOpen('resolved', receipt('defer'), 'a'.repeat(64))).toBe(true);
    expect(decisionControlsMayOpen('resolved', receipt('return-for-revision'), 'a'.repeat(64))).toBe(true);
  });

  it('fails closed when an existing receipt fingerprint differs from current content', () => {
    const mismatched = receipt('approve', 'b'.repeat(64));
    expect(receiptIsTerminalForCurrentVersion(mismatched, 'a'.repeat(64))).toBe(false);
    expect(decisionControlsMayOpen('resolved', mismatched, 'a'.repeat(64))).toBe(false);
  });

  it('invalidates a prepared preview when the freshly computed fingerprint changes', () => {
    expect(previewStillMatchesVersion('a'.repeat(64), 'a'.repeat(64))).toBe(true);
    expect(previewStillMatchesVersion('a'.repeat(64), 'b'.repeat(64))).toBe(false);
    expect(previewStillMatchesVersion(null, 'a'.repeat(64))).toBe(false);
  });
});
