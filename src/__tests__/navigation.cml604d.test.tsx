import { describe, expect, it } from 'vitest';
import { appTabToPath, pathnameToAppTab } from '../features/navigation';

describe('CML-604D canonical navigation', () => {
  it('maps canonical Arena destinations deterministically', () => {
    expect(appTabToPath('curricolo')).toBe('/curriculum');
    expect(appTabToPath('progetta-annuale')).toBe('/planning');
    expect(appTabToPath('esportazioni')).toBe('/documents');
    expect(appTabToPath('second-brain')).toBe('/knowledge');
  });

  it('keeps retired Classroom and Social deep links outside canonical destinations', () => {
    expect(pathnameToAppTab('/classroom')).toBe('progetta-annuale');
    expect(pathnameToAppTab('/classroom/legacy')).toBe('progetta-annuale');
    expect(pathnameToAppTab('/social')).toBe('dashboard');
    expect(pathnameToAppTab('/social/legacy')).toBe('dashboard');
  });

  it('keeps planning and knowledge routes canonical', () => {
    expect(pathnameToAppTab('/planning')).toBe('progetta-annuale');
    expect(pathnameToAppTab('/planning/wizard')).toBe('progetta-annuale');
    expect(pathnameToAppTab('/knowledge')).toBe('second-brain');
  });
});
