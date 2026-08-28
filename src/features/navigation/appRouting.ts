import type { AppTab } from './hooks/useAppNavigation';

export const pathnameToAppTab = (pathname: string): AppTab => {
  if (pathname.startsWith('/revisione')) return 'revisione';
  if (pathname.startsWith('/curriculum')) return 'curricolo';
  if (pathname.startsWith('/classroom')) return 'progetta-annuale';
  if (pathname.startsWith('/planning')) return 'progetta-annuale';
  if (pathname.startsWith('/documents')) return 'esportazioni';
  if (pathname.startsWith('/copilot')) return 'dashboard';
  if (pathname.startsWith('/knowledge') || pathname.startsWith('/second-brain')) return 'second-brain';
  if (pathname.startsWith('/social')) return 'dashboard';
  if (pathname.startsWith('/fonti')) return 'fonti';
  // Legacy deep links remain readable, but new navigation never emits /settings.
  if (pathname.startsWith('/settings')) return 'fonti';
  if (pathname.startsWith('/guida')) return 'guida';
  if (pathname.startsWith('/onboarding')) return 'dashboard';
  return 'dashboard';
};

export const appTabToPath = (tab: AppTab): string => {
  switch (tab) {
    case 'curricolo': return '/curriculum';
    case 'revisione': return '/revisione';
    case 'progetta-annuale': return '/planning';
    case 'processo': return '/planning';
    case 'esportazioni': return '/documents';
    case 'certificazione-pa': return '/documents';
    case 'second-brain': return '/knowledge';
    case 'fonti': return '/fonti';
    case 'guida': return '/guida';
    case 'dashboard':
    default: return '/';
  }
};
