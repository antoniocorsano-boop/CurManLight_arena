import { beforeEach, describe, expect, it } from 'vitest';
import { pathnameToAppTab } from '../features/navigation/appRouting';
import { useCurriculumStore } from '../store/useCurriculumStore';
import type { UserState } from '../types/curriculum';

describe('Arena product-boundary runtime containment', () => {
  beforeEach(() => {
    useCurriculumStore.setState({ activeProgTab: 'annuale' });
  });

  it('normalizes legacy classroom/social planning modes away from canonical Arena state', () => {
    const setActiveProgTab = useCurriculumStore.getState().setActiveProgTab;
    const legacyValues = ['social', 'classe-home', 'classe'] as const;

    legacyValues.forEach((legacyValue) => {
      setActiveProgTab(legacyValue as unknown as UserState['activeProgTab']);
      expect(useCurriculumStore.getState().activeProgTab).toBe('annuale');
    });
  });

  it('normalizes legacy planning state during backup restore', () => {
    const result = useCurriculumStore.getState().restoreBackupState({
      activeProgTab: 'classe',
    });

    expect(result).toEqual({ success: true });
    expect(useCurriculumStore.getState().activeProgTab).toBe('annuale');
  });

  it('keeps legacy classroom/social deep links outside canonical Arena destinations', () => {
    expect(pathnameToAppTab('/classroom')).toBe('progetta-annuale');
    expect(pathnameToAppTab('/classroom/legacy')).toBe('progetta-annuale');
    expect(pathnameToAppTab('/social')).toBe('dashboard');
    expect(pathnameToAppTab('/social/legacy')).toBe('dashboard');
  });
});
