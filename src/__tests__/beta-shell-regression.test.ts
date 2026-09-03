import { describe, expect, it } from 'vitest';

function firstSource(modules: Record<string, string>): string {
  return Object.values(modules)[0] ?? '';
}

const headerSource = firstSource(import.meta.glob('../features/navigation/components/AppHeader.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const sidebarSource = firstSource(import.meta.glob('../features/navigation/components/AppSidebar.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const mobileSource = firstSource(import.meta.glob('../features/navigation/components/MobileBottomNav.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const homeSource = firstSource(import.meta.glob('../features/session/components/DashboardView.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const viewsSource = firstSource(import.meta.glob('../features/session/components/AppViewsLayer.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const curriculumWorkspaceSource = firstSource(import.meta.glob('../features/curriculum/CurriculumWorkspace.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const technologySourceReviewTaskSource = firstSource(import.meta.glob('../features/curriculum/components/TechnologySourceReviewTask.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const finalPublicationSourceReviewTaskSource = firstSource(import.meta.glob('../features/curriculum/components/FinalPublicationSourceReviewTask.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const finalPublicationSourceReviewWorkbenchSource = firstSource(import.meta.glob('../features/curriculum/components/FinalPublicationSourceReviewWorkbench.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const revisionSource = firstSource(import.meta.glob('../features/curriculum/components/RevisioneTab.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const documentsSource = firstSource(import.meta.glob('../features/documents/components/EsportazioniTab.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const routingSource = firstSource(import.meta.glob('../features/navigation/appRouting.ts', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const navigationIndexSource = firstSource(import.meta.glob('../features/navigation/index.ts', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const appSource = firstSource(import.meta.glob('../App.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

describe('Arena Beta canonical shell regression guard', () => {
  it('keeps a stable vector brand mark without returning to the fragile image asset', () => {
    expect(headerSource).not.toContain('curmanlight_v20_logo.png');
    expect(headerSource).not.toContain('<img');
    expect(headerSource).toContain('data-brand-mark="curmanlight"');
    expect(headerSource).toContain('Layers3');
    expect(headerSource).not.toMatch(/Co-pilota Chat|Baseline d['’]Aula|Connettore LLM|Pubblicazione SCORM|Importazione studenti/i);
    expect(headerSource).toContain('data-beta-shell="canonical"');
    expect(headerSource).toContain('Curricolo d’istituto');
  });

  it('keeps primary navigation aligned with the institutional Beta journey', () => {
    for (const text of ['Consulta il curricolo', 'Rivedi le proposte', 'Controlla le fonti', 'Crea un documento']) {
      expect(sidebarSource).toContain(text);
    }

    expect(sidebarSource).not.toMatch(/Spazio d['’]Aula|UDA condivise|WikiLLM|Compilatore UDA|Progettazione UDA|Pilota Sperimentale/i);
    expect(mobileSource).not.toMatch(/Progetta|Classe|Social|Copilot/i);
    expect(mobileSource).toContain('Curricolo');
    expect(mobileSource).toContain('Revisione');
    expect(mobileSource).toContain('Fonti');
    expect(mobileSource).toContain('Documenti');
  });

  it('keeps Home compact, task-first and authority-safe with progressive disclosure', () => {
    expect(homeSource).not.toMatch(/Votazione|Voti Registrati|Unione Consensi|Merger|\.cml|IndexedDB|Dexie|Service Worker|WCAG|GDPR/i);
    expect(homeSource).toContain('data-beta-home="role-work-queue"');
    expect(homeSource).toContain('data-home-queue="actionable"');
    expect(homeSource).toContain('Nessuna attività azionabile rilevata adesso.');
    expect(homeSource).toContain('Arena non crea attività artificiali');
    expect(homeSource).toContain('data-hcm-secondary-content');
    expect(homeSource).toContain('Come funziona il processo');
    expect(homeSource).toContain('Preparare una proposta non significa approvarla');
    expect(homeSource).not.toContain('TaskCard');
  });

  it('uses one teacher-facing surface contract across primary workspaces', () => {
    for (const surface of ['curriculum', 'revision', 'planning', 'process', 'documents', 'knowledge']) {
      expect(viewsSource).toContain(`data-teacher-surface="${surface}"`);
    }
    expect(homeSource).toContain('data-teacher-surface="home"');
    expect(curriculumWorkspaceSource).toContain('data-teacher-surface="curriculum-workspace"');
  });

  it('gives curriculum context one explicit human next action', () => {
    expect(viewsSource).toContain('Adesso: controlla se puoi usare questo curricolo');
    expect(viewsSource).toContain('verifica Fonti, Applicabilità e Stato');
    expect(viewsSource).toContain('data-human-next-action="verify-curriculum-validity"');
    expect(viewsSource).toContain('Verifica se puoi usarlo');
    expect(viewsSource).toContain("safeHandleTabSwitch('fonti')");
    expect(viewsSource).toContain('Se vuoi solo leggerlo, puoi continuare a consultare i contenuti qui sotto.');
    expect(curriculumWorkspaceSource).toContain('Indicazioni nazionali 2025 · pubblicazione finale');
    expect(curriculumWorkspaceSource).toContain('Verifica una scheda alla volta tra infanzia, primaria e secondaria di I grado');
    expect(curriculumWorkspaceSource).toContain('Controlla la fonte');
    expect(curriculumWorkspaceSource).toContain('FinalPublicationSourceReviewWorkbench');
    expect(finalPublicationSourceReviewWorkbenchSource).toContain('data-source-review-roundtrip');
    expect(finalPublicationSourceReviewWorkbenchSource).toContain('Esporta pacchetto');
    expect(finalPublicationSourceReviewWorkbenchSource).toContain('Importa verifiche');
    expect(finalPublicationSourceReviewWorkbenchSource).toContain('FinalPublicationSourceReviewTask');
    expect(finalPublicationSourceReviewTaskSource).toContain('Scuola dell’infanzia');
    expect(finalPublicationSourceReviewTaskSource).toContain('Scuola primaria');
    expect(finalPublicationSourceReviewTaskSource).toContain('Secondaria di I grado');
    expect(finalPublicationSourceReviewTaskSource).toContain('Filtra per ordine scolastico');
    expect(finalPublicationSourceReviewTaskSource).toContain('Filtra per campo o disciplina');
    expect(finalPublicationSourceReviewTaskSource).toContain('Apri la pubblicazione finale MIM');
    expect(finalPublicationSourceReviewTaskSource).toContain('DM221_2025_SOURCE.officialCurriculumVolume.url');
    expect(finalPublicationSourceReviewTaskSource).not.toContain('DM221_2025_SOURCE.officialLocator.pdfUrl');
    expect(technologySourceReviewTaskSource).toContain('DM221_2025_SOURCE.officialCurriculumVolume.url');
    expect(technologySourceReviewTaskSource).not.toContain('DM221_2025_SOURCE.officialLocator.pdfUrl');
  });

  it('makes revision a focused mobile flow with nearby context and actions', () => {
    expect(revisionSource).toContain('data-revision-flow="focused"');
    expect(revisionSource).toContain('data-revision-sticky-context');
    expect(revisionSource).toContain('data-revision-current-card');
    expect(revisionSource).toContain('data-revision-sticky-actions');
    expect(revisionSource).toContain("window.scrollTo({ top: 0, behavior: 'smooth' })");
    expect(revisionSource).toContain('Confronta una scheda alla volta');
    expect(revisionSource).not.toContain('Passo-Passo (Monoscheda)');
    expect(revisionSource).not.toContain('Elenco Completo');
    expect(revisionSource).not.toContain('Istruzioni operative:');
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