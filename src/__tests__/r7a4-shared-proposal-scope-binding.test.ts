import { describe, expect, it } from 'vitest';
import {
  SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER,
  SHARED_PROPOSAL_AUTHORITY_BOUNDARY,
  SHARED_PROPOSAL_SCOPE_BINDING_SCHEMA,
  isValidSharedProposalScopeRef,
} from '../domain/revision';

describe('R7A4 shared proposal scope binding', () => {
  it('requires target and base scope refs to be canonical, delimiter-safe and PostgreSQL-representable', () => {
    expect(SHARED_PROPOSAL_SCOPE_BINDING_SCHEMA).toEqual({
      targetNodeRef: 'canonical-trimmed-non-empty-string-without-adoption-binding-delimiter',
      baseCurriculumVersionRef: 'canonical-trimmed-non-empty-string-without-adoption-binding-delimiter',
      submittedValueMustEqualTrimmedValue: true,
      rejectsAdoptionBindingDelimiter: true,
      requiresPostgresRepresentableString: true,
      forbiddenCharacters: [SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER],
    });
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.scopeReferencesRequireTrimmedNonEmpty).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.scopeReferencesMustEqualTrimmedValue).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.scopeReferencesRejectAdoptionDelimiter).toBe(true);
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.scopeReferencesRequirePostgresRepresentability).toBe(
      true,
    );
    expect(SHARED_PROPOSAL_AUTHORITY_BOUNDARY.scopeBindingSchema).toBe(
      SHARED_PROPOSAL_SCOPE_BINDING_SCHEMA,
    );
  });

  it.each([
    '',
    ' ',
    '   ',
    '\t',
    '\n',
    ' \t\n ',
    ' curriculum-v1 ',
    'node-1 ',
    ' node-1',
    `node${SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER}1`,
    `curriculum${SHARED_PROPOSAL_ADOPTION_BINDING_DELIMITER}v1`,
    'node\u00001',
    'node\ud800',
    'node\udc00',
  ])('rejects non-canonical institutional scope reference %j', (value) => {
    expect(isValidSharedProposalScopeRef(value)).toBe(false);
  });

  it.each(['node-1', 'curriculum-v1', 'x', 'curriculum version 1', 'node-😀'])(
    'accepts canonical scope reference %j',
    (value) => {
      expect(isValidSharedProposalScopeRef(value)).toBe(true);
    },
  );
});