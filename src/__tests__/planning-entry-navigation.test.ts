import { describe, expect, it } from 'vitest';
import { useCurriculumStore } from '../store/useCurriculumStore';

describe('P2.1-E-C1 canonical Planning entry', () => {
  it('defaults the planning surface to PLAN-01 catalogue', () => {
    expect(useCurriculumStore.getInitialState().activeProgTab).toBe('home');
  });
});
