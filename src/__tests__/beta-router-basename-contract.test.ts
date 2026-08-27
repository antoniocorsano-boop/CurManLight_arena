import { describe, expect, it } from 'vitest';
import { resolveRouterBasename } from '../features/navigation/routerBasename';

describe('BETA-G4 router basename contract', () => {
  it('uses the GitHub Pages repository mount in beta mode', () => {
    expect(resolveRouterBasename('beta')).toBe('/CurManLight_arena');
  });

  it('keeps ordinary builds rooted at slash', () => {
    expect(resolveRouterBasename('production')).toBe('/');
    expect(resolveRouterBasename('development')).toBe('/');
  });
});
