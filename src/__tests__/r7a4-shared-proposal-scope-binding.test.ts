import { describe, expect, it } from 'vitest';
import {
  SHARED_PROPOSAL_AUTHORITY_BOUNDARY,
  SHARED_PROPOSAL_SCOPE_BINDING_SCHEMA,
  isValidSharedProposalScopeRef,
} from '../domain/revision';

describe('R7A4 shared proposal scope binding', () => {
  it('requires target and base scope refs to be non-empty after trimming', () => {
    expect(SHARED_PROPOSAL_SCOPE_BINDING_SCHEMA).toEqual({
      targetNodeRef: 'trimmed-non-empty-string',
      baseCurriculumVersionRef: 'trimmed-non-empty-string',
    });
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.scopeReferencesRequireTrimmedNonEmpty).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.scopeBindingSchema).toBe(
      SHARED_PROPOSAL_SCOPE_BINDING_SCHEMA,
    );
  });

  it.each(['', ' ', '   ', '\t', '\n', ' \t\n '])(
    'rejects blank institutional scope reference %j',
    (value) => {
      expect(isValidSharedProposalScopeRef(value)).toBe(false);
    },
  );

  it.each(['node-1', ' curriculum-v1 ', 'x'])('accepts nonblank scope reference %j', (value) => {
    expect(isValidSharedProposalScopeRef(value)).toBe(true);
  });
});