export type LegacyDecisionStatus = 'approved' | 'rejected' | 'custom';

export interface LegacyProposal {
  id: string;
  focus: string;
  oldText: string;
  newText: string;
  notes: string;
}