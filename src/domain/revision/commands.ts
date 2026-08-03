import type { EntityId } from '../curriculum/identity';
import { requireCapability, type ProtectedActionResult, type ResolvedWorkspaceRole } from '../permissions';
import type {
  RevisionArchive,
  RevisionError,
  RevisionProposal,
  RevisionProposalCreationResult,
  RevisionProposalVersion,
} from './types';
import { addProposal, addProposalVersion } from './repository';

export type CreateRevisionProposalInput = Parameters<typeof addProposal>[1];
export type AddRevisionProposalVersionInput = Parameters<typeof addProposalVersion>[2];

export type RevisionCommandSuccess = {
  proposal: RevisionProposal;
  version: RevisionProposalVersion;
  archive: RevisionArchive;
};

export type RevisionCommandError = {
  ok: false;
  reason: 'REVISION_DOMAIN_INVALID';
  errors: RevisionError[];
};

function toCommandResult(result: RevisionProposalCreationResult): ProtectedActionResult<RevisionCommandSuccess, RevisionCommandError> {
  if (!result.success) return { ok: false, reason: 'REVISION_DOMAIN_INVALID', errors: result.errors };
  return {
    ok: true,
    value: {
      proposal: result.proposal,
      version: result.version,
      archive: result.archive,
    },
  };
}

export function createRevisionProposal(
  resolution: ResolvedWorkspaceRole,
  archive: RevisionArchive,
  input: CreateRevisionProposalInput,
  now?: string,
): ProtectedActionResult<RevisionCommandSuccess, RevisionCommandError> {
  const guard = requireCapability(resolution, 'proposal.create');
  if (!guard.ok) return guard;
  return toCommandResult(addProposal(archive, input, now));
}

export function addRevisionProposalVersion(
  resolution: ResolvedWorkspaceRole,
  archive: RevisionArchive,
  proposalId: EntityId,
  input: AddRevisionProposalVersionInput,
  now?: string,
): ProtectedActionResult<RevisionCommandSuccess, RevisionCommandError> {
  const guard = requireCapability(resolution, 'proposal.create');
  if (!guard.ok) return guard;

  const proposal = archive.proposals.find(candidate => candidate.id === proposalId);
  if (!proposal) {
    return {
      ok: false,
      reason: 'REVISION_DOMAIN_INVALID',
      errors: [{ code: 'PROPOSAL_NOT_FOUND', message: `Proposal ${proposalId} not found` }],
    };
  }

  if (proposal.status !== 'draft' && proposal.status !== 'changes-requested') {
    return {
      ok: false,
      reason: 'REVISION_DOMAIN_INVALID',
      errors: [{
        code: 'PROPOSAL_STATE_NOT_MODIFIABLE',
        message: `Proposal ${proposalId} cannot receive a version while in status ${proposal.status}`,
      }],
    };
  }

  return toCommandResult(addProposalVersion(archive, proposalId, input, now));
}
