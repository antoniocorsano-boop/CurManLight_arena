const BETA_REPOSITORY_BASENAME = '/CurManLight_arena';

export const resolveRouterBasename = (mode: string, pathname: string): string => {
  if (mode !== 'beta') return '/';
  return pathname === BETA_REPOSITORY_BASENAME || pathname.startsWith(`${BETA_REPOSITORY_BASENAME}/`)
    ? BETA_REPOSITORY_BASENAME
    : '/';
};
