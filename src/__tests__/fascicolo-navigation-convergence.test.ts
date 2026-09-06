import { describe, expect, it } from 'vitest';
import { appTabToPath, pathnameToAppTab } from '../features/navigation/appRouting';
import sidebarSource from '../features/navigation/components/AppSidebar.tsx?raw';
import mobileSource from '../features/navigation/components/MobileBottomNav.tsx?raw';
import homeSource from '../features/session/components/DashboardView.tsx?raw';
import fascicoloSource from '../features/documents/components/FontiWorkspace.tsx?raw';
import viewsSource from '../features/session/components/AppViewsLayer.tsx?raw';

const sliceBetween = (source: string, start: string, end: string): string => {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  return from >= 0 && to > from ? source.slice(from, to) : '';
};

describe('FASCICOLO_NAVIGATION_CONVERGENCE', () => {
  it('keeps Fascicolo outside the desktop primary curriculum block', () => {
    const curriculumBlock = sliceBetween(sidebarSource, 'aria-labelledby="nav-curricolo"', 'aria-labelledby="nav-supporto"');
    const supportBlock = sidebarSource.slice(sidebarSource.indexOf('aria-labelledby="nav-supporto"'));

    expect(curriculumBlock).not.toContain("switchTab('fonti')");
    expect(curriculumBlock).not.toContain('Controlla le fonti');
    expect(supportBlock).toContain("switchTab('fonti')");
    expect(supportBlock).toContain('<span>Fascicolo</span>');
    expect(supportBlock).toContain('data-secondary-destination="fascicolo"');
  });

  it('removes Fonti from the mobile primary dock while keeping the secondary navigation entry available through the hamburger drawer', () => {
    expect(mobileSource).toContain('grid-cols-4');
    expect(mobileSource).not.toContain("handleTabSwitch('fonti')");
    expect(mobileSource).not.toContain('<span>Fonti</span>');
    expect(mobileSource).toContain('data-secondary-navigation-entry="hamburger"');
    expect(sidebarSource).toContain('data-beta-secondary-navigation="support"');
  });

  it('uses /fascicolo as the canonical public route and preserves historical deep links', () => {
    expect(appTabToPath('fonti')).toBe('/fascicolo');
    expect(pathnameToAppTab('/fascicolo')).toBe('fonti');
    expect(pathnameToAppTab('/fascicolo/fonti-normative')).toBe('fonti');
    expect(pathnameToAppTab('/fonti')).toBe('fonti');
    expect(pathnameToAppTab('/settings')).toBe('fonti');
  });

  it('gives the secondary surface a clear Fascicolo identity without changing source authority', () => {
    expect(fascicoloSource).toContain('data-fascicolo-workspace="canonical"');
    expect(fascicoloSource).toContain('data-fonti-workspace="legacy-alias"');
    expect(fascicoloSource).toContain('>Fascicolo</h1>');
    expect(fascicoloSource).toContain('Fonti, versioni, registri, ricevute e materiali di tracciabilità del curricolo.');
    expect(fascicoloSource).toContain('<InstituteCurrentSourcePanel />');
    expect(fascicoloSource).toContain('<InstituteCurriculumSourceRegisterPanel />');
    expect(fascicoloSource).toContain('<SourceRegistry {...props} />');
  });

  it('does not represent sources or institutional decision as universal stages of the Home journey', () => {
    const journeyBlock = sliceBetween(homeSource, 'const JOURNEY = [', '] as const;');
    expect(journeyBlock).toContain("title: 'Curricolo'");
    expect(journeyBlock).toContain("title: 'Revisione'");
    expect(journeyBlock).toContain("title: 'Progettazione'");
    expect(journeyBlock).not.toContain("title: 'Fonti'");
    expect(journeyBlock).not.toContain("title: 'Decisione'");
    expect(homeSource).toContain('data-secondary-service="fascicolo"');
    expect(homeSource).toContain('Apri il Fascicolo');
    expect(viewsSource).toContain('verifica nel Fascicolo fonti, applicabilità e stato');
  });
});
