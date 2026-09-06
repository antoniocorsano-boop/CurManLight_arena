import { describe, expect, it } from 'vitest';
import { resolveRouterBasename } from '../features/navigation/routerBasename';

describe('BETA-G4 router basename contract', () => {
  it('uses the GitHub Pages repository mount when the beta pathname is under the repository path', () => {
    expect(resolveRouterBasename('beta', '/CurManLight_arena/')).toBe('/CurManLight_arena');
    expect(resolveRouterBasename('beta', '/CurManLight_arena/beta-identity')).toBe('/CurManLight_arena');
  });

  it('allows the same beta build to mount at the root for isolated previews', () => {
    expect(resolveRouterBasename('beta', '/')).toBe('/');
    expect(resolveRouterBasename('beta', '/beta-identity')).toBe('/');
  });

  it('keeps ordinary builds rooted at slash', () => {
    expect(resolveRouterBasename('production', '/CurManLight_arena/')).toBe('/');
    expect(resolveRouterBasename('development', '/')).toBe('/');
  });
});
