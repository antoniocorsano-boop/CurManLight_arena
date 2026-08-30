import { describe, expect, it } from 'vitest';
import appSource from '../App.tsx?raw';
import routingSource from '../features/navigation/routing.ts?raw';
import navigationIndexSource from '../features/navigation/index.ts?raw';
import appSidebarSource from '../features/navigation/components/AppSidebar.tsx?raw';
import mobileBottomNavSource from '../features/navigation/components/MobileBottomNav.tsx?raw';
import dashboardSource from '../features/session/components/DashboardView.tsx?raw';
import appViewsSource from '../features/session/components/AppViewsLayer.tsx?raw';
import curriculumSource from '../features/curriculum/components/CurriculumTab.tsx?raw';
import revisionSource from '../features/curriculum/components/RevisioneTab.tsx?raw';
import documentsSource from '../features/documents/components/EsportazioniTab.tsx?raw';

describe('Arena Beta canonical shell regression guard', () => {
  it('keeps a stable vector brand mark without returning to the fragile image asset', () => {
    expect(appSource).not.toContain('/curmanlight_logo.png');
    expect(appSource).toContain('AppHeader');
  });

  it('keeps primary navigation aligned with the institutional Beta journey', () => {
    expect(appSidebarSource).toContain('Home');
    expect(appSidebarSource).toContain('Consulta il curricolo');
    expect(appSidebarSource).toContain('Rivedi le proposte');
    expect(appSidebarSource).toContain('Controlla le fonti');
    expect(appSidebarSource).toContain('Crea un documento');
    expect(mobileBottomNavSource).toContain('Curricolo');
    expect(mobileBottomNavSource).toContain('Revisione');
    expect(mobileBottomNavSource).toContain('Fonti');
    expect(mobileBottomNavSource).toContain('Documenti');
  });

  it('keeps Home compact and moves authority explanation behind progressive disclosure', () => {
    expect(dashboardSource).toContain('Cosa vuoi fare?');
    expect(dashboardSource).toContain('Dettagli sul contesto');
    expect(dashboardSource).toContain('<details');
  });

  it('uses one teacher-facing surface contract across primary workspaces', () => {
    expect(appViewsSource).toContain('data-teacher-surface="curriculum"');
    expect(appViewsSource).toContain('data-teacher-surface="revision"');
    expect(appViewsSource).toContain('data-teacher-surface="documents"');
    expect(appViewsSource).toContain('data-teacher-surface="knowledge"');
  });

  it('keeps teacher-facing curriculum entry language direct and action-oriented', () => {
    expect(appViewsSource).toContain('Prima di usare questo curricolo');
    expect(curriculumSource).toContain('Consulta Curricolo: Home d\'Area');
    expect(curriculumSource).toContain('Vista Strutturata (Albero)');
    expect(curriculumSource).toContain('Raccordo Diacronico (Mappa)');
  });

  it('makes revision a focused mobile flow with nearby context and actions', () => {
    expect(revisionSource).toContain('data-revision-flow="focused"');
    expect(revisionSource).toContain('data-revision-sticky-context');
    expect(revisionSource).toContain('data-revision-sticky-actions');
    expect(revisionSource).toContain('Scheda {safeIndex + 1} di {filtered.length}');
  });

  it('preserves structured proposal and institutional-decision boundaries in the focused revision flow', () => {
    expect(revisionSource).toContain('StructuredProposalStarter');
    expect(revisionSource).toContain('InstitutionalDecisionPanel');
    expect(revisionSource).toContain('Prepara per revisione');
    expect(revisionSource).toContain('Ammetti alla decisione');
    expect(revisionSource).toContain('Le tre scelte servono a preparare il lavoro. Non sono voti né approvazioni.');
  });

  it('keeps Documents inside the institutional curriculum scope', () => {
    expect(documentsSource).toContain('data-beta-documents-scope="institutional-curriculum"');
    expect(documentsSource).toContain('data-human-task="export-curriculum"');
    expect(documentsSource).toContain('Condividi il curricolo');
    expect(documentsSource).toContain('Continua il lavoro');
    expect(documentsSource).toContain('data-export-intent="share-readable-document"');
    expect(documentsSource).toContain('data-export-intent="continue-work"');
    expect(documentsSource).toContain('data-export-format-options');
    expect(documentsSource).not.toMatch(/Modelli con IA|Sicurezza e reset|Programmazione su Due Quadrimestri|Relazione Intermedia|Programma Svolto|Genera Programmazione Annuale|Genera Relazione Scolastica/i);
  });

  it('keeps export formats subordinate without changing the existing export capabilities', () => {
    for (const handler of [
      'handleDownloadWordDocx',
      'handleDownloadODF',
      'handleDownloadCurricoloPDF',
      'handleCopyToClipboardFormatted',
      'handleDownloadCml',
      'handleDownloadTxt',
    ]) {
      expect(documentsSource).toContain(handler);
    }

    expect(documentsSource).toContain('data-export-format-options');
    expect(documentsSource).toContain('Serve solo il testo?');
    expect(documentsSource).toContain('w-full sm:w-auto');
    expect(documentsSource).not.toContain('handleClearLocalStorageWithReset()');
  });

  it('emits /fonti as the canonical source route while retaining legacy /settings compatibility', () => {
    expect(routingSource).toContain("case 'fonti': return '/fonti'");
    expect(routingSource).toContain("pathname.startsWith('/settings')");
    expect(routingSource).not.toContain("case 'fonti': return '/settings'");
  });

  it('exposes only one navigation shell from the navigation package', () => {
    expect(navigationIndexSource).not.toMatch(/AppShell|TopBar|components\/Sidebar/);
    expect(appSource).toContain('AppHeader');
    expect(appSource).toContain('AppSidebar');
    expect(appSource).toContain('MobileBottomNav');
  });
});
