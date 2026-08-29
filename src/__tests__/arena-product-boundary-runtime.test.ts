import { beforeEach, describe, expect, it } from 'vitest';
import { pathnameToAppTab } from '../features/navigation/appRouting';
import { useCurriculumStore } from '../store/useCurriculumStore';

describe('Arena product-boundary runtime containment', () => {
  beforeEach(() => {
    useCurriculumStore.setState({ activeProgTab: 'annuale' });
  });

  it('normalizes legacy classroom/social planning modes away from canonical Arena state', () => {
    const setActiveProgTab = useCurriculumStore.getState().setActiveProgTab;

    setActiveProgTab('social');
    expect(useCurriculumStore.getState().activeProgTab).toBe('annuale');

    setActiveProgTab('classe-home');
    expect(useCurriculumStore.getState().activeProgTab).toBe('annuale');

    setActiveProgTab('classe');
    expect(useCurriculumStore.getState().activeProgTab).toBe('annuale');
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
