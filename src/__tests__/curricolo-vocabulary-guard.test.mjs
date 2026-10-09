import { describe, expect, it } from 'vitest';
import registry from '../../docs/governance/TRAMA_TERM_01_CURRICOLO_VOCABULARY.json';
import {
  validateAddedVocabulary,
  validateVocabularyRegistry,
} from '../../scripts/validate-curricolo-vocabulary.mjs';

const syntheticRegistry = {
  canonicalTerm: 'curricolo',
  legacyToken: 'curriculum',
  exceptions: [
    {
      path: 'src/legacy-adapter.ts',
      contains: 'CurriculumReleaseContract',
      reason: 'Compatibility boundary for the versioned v1 release contract.',
    },
  ],
};

describe('TRAMA-TERM-01 — Arena diff-aware vocabulary guard', () => {
  it('rejects a new user-facing legacy term', () => {
    const violations = validateAddedVocabulary(
      '+La pagina mostra il Curriculum di istituto.\n',
      syntheticRegistry,
      'docs/current.md',
    );
    expect(violations).toHaveLength(1);
  });

  it('rejects a new technical identifier with the legacy token', () => {
    const violations = validateAddedVocabulary(
      '+export type NewCurriculumNode = unknown;\n',
      syntheticRegistry,
      'src/domain/new-node.ts',
    );
    expect(violations).toHaveLength(1);
  });

  it('rejects the curricular derivative', () => {
    const violations = validateAddedVocabulary(
      '+Arena is the curricular authority.\n',
      syntheticRegistry,
      'docs/current.md',
    );
    expect(violations).toHaveLength(1);
  });

  it('ignores removals because the guard only blocks new debt', () => {
    const violations = validateAddedVocabulary(
      '-Curriculum Atlas\n+Atlas\n',
      syntheticRegistry,
      'README.md',
    );
    expect(violations).toEqual([]);
  });

  it('allows only a registered legacy compatibility occurrence on its exact path', () => {
    expect(validateAddedVocabulary(
      '+type Alias = CurriculumReleaseContract;\n',
      syntheticRegistry,
      'src/legacy-adapter.ts',
    )).toEqual([]);

    expect(validateAddedVocabulary(
      '+type Alias = CurriculumReleaseContract;\n',
      syntheticRegistry,
      'src/domain/new-adapter.ts',
    )).toHaveLength(1);
  });

  it('is case-insensitive', () => {
    expect(validateAddedVocabulary(
      '+const curriculumNode = true;\n',
      syntheticRegistry,
      'src/domain/new-node.ts',
    )).toHaveLength(1);
  });

  it('requires every registry exception to have a non-empty reason', () => {
    const invalid = {
      ...syntheticRegistry,
      exceptions: [{ path: 'x.ts', contains: 'Curriculum', reason: '' }],
    };
    expect(() => validateVocabularyRegistry(invalid)).toThrow(/reason/i);
  });

  it('declares curricolo as canonical and documents every active exception', () => {
    expect(registry.canonicalTerm).toBe('curricolo');
    expect(registry.legacyToken).toBe('curriculum');
    expect(() => validateVocabularyRegistry(registry)).not.toThrow();
    expect(registry.exceptions.length).toBeGreaterThan(0);
    for (const exception of registry.exceptions) {
      expect(exception.reason.trim().length).toBeGreaterThan(0);
    }
  });
});
