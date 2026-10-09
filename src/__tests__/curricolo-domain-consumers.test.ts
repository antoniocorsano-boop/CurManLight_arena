import { describe, expect, it } from 'vitest';
import didacticBindingSource from '../domain/curriculum/didacticBinding.ts?raw';
import reviewCaseSource from '../domain/curriculum/reviewCase.ts?raw';
import revisionTriggerSource from '../domain/curriculum/revisionTrigger.ts?raw';
import sharedReviewCaseSource from '../domain/curriculum/sharedReviewCase.ts?raw';
import caseWorkSessionSource from '../domain/curriculum/caseWorkSession.ts?raw';

const expectCanonicalFacade = (source: string, expectedNames: string[]) => {
  expect(source).toContain("types/curricolo");
  for (const name of expectedNames) expect(source).toContain(name);
};

describe('TRAMA-TERM-01 — consumer interni del dominio curricolare', () => {
  it('usa CurricoloUnitReference nel binding didattico', () => {
    expectCanonicalFacade(didacticBindingSource, ['CurricoloUnitReference']);
  });

  it('usa i tipi Curricolo* nella revisione curricolare', () => {
    expectCanonicalFacade(reviewCaseSource, [
      'CurricoloReviewCase',
      'CurricoloReviewCaseReadiness',
      'CurricoloUnitReference',
    ]);
  });

  it('usa CurricoloUnitReference nei trigger di revisione', () => {
    expectCanonicalFacade(revisionTriggerSource, ['CurricoloUnitReference']);
  });

  it('usa i tipi Curricolo* nella condivisione dei casi', () => {
    expectCanonicalFacade(sharedReviewCaseSource, ['CurricoloReviewCase', 'CurricoloUnitReference']);
  });

  it('usa i tipi Curricolo* nelle sessioni di lavoro', () => {
    expectCanonicalFacade(caseWorkSessionSource, [
      'CaseScopedCurricoloWorkSession',
      'CurricoloReviewCase',
      'CurricoloWorkSessionStage',
    ]);
  });
});
