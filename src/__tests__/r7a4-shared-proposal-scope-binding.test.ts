import { describe, expect, it } from 'vitest';
import {
  SHARED_PROPOSAL_AUTHORITY_BOUNDARY,
  SHARED_PROPOSAL_SCOPE_BINDING_SCHEMA,
  isValidSharedProposalScopeRef,
} from '../domain/revision';

describe('R7A4 shared proposal scope binding', () => {
  it('requires target and base scope refs to already be canonical trimmed values', () => {
    expect(SHARED_PROPOSAL_SCOPE_BINDING_SCHEMA).toEqual({
      targetNodeRef: 'canonical-trimmed-non-empty-string',
      baseCurriculumVersionRef: 'canonical-trimmed-non-empty-string',
      submittedValueMustEqualTrimmedValue: true,
    });
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.scopeReferencesRequireTrimmedNonEmpty).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.scopeReferencesMustEqualTrimmedValue).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.scopeBindingSchema).toBe(
      SHARED_PROPOSAL_SCOPE_BINDING_SCHEMA,
    );
  });

  it.each(['', ' ', '   ', '\t', '\n', ' \t\n ', ' curriculum-v1 ', 'node-1 ', ' node-1'])(
    'rejects non-canonical institutional scope reference %j',
    (value) => {
      expect(isValidSharedProposalScopeRef(value)).toBe(false);
    },
  );

  it.each(['node-1', 'curriculum-v1', 'x', 'curriculum version 1'])(
    'accepts canonical scope reference %j',
    (value) => {
      expect(isValidSharedProposalScopeRef(value)).toBe(true);
    },
  );
});
