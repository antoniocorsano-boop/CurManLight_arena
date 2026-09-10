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

const revisionWorkspaceSource = firstSource(import.meta.glob('../features/beta/RevisionWorkspace.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const caseAwareRevisionSource = firstSource(import.meta.glob('../features/beta/CaseAwareRevisionSurface.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const teamCoordinationSource = firstSource(import.meta.glob('../features/beta/TeamCoordinationWorkspace.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const verticalReviewSource = firstSource(import.meta.glob('../features/beta/VerticalReviewPanel.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const h4DecisionSource = firstSource(import.meta.glob('../features/beta/H3BoundInstitutionalDecisionPanel.tsx', {
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

  it('keeps primary navigation aligned with the evolved teacher journey and secondary support', () => {
    for (const text of ['Consulta il curricolo', 'Rivedi le proposte', 'Crea un documento', 'Fascicolo']) {
      expect(sidebarSource).toContain(text);
    }

    expect(sidebarSource).not.toMatch(/Spazio d['’]Aula|UDA condivise|WikiLLM|Compilatore UDA|Progettazione UDA|Pilota Sperimentale/i);
    expect(sidebarSource).toContain('data-beta-secondary-navigation="support"');
    expect(sidebarSource).not.toContain('Controlla le fonti');
    expect(mobileSource).not.toMatch(/Classe|Social|Copilot/i);
    expect(mobileSource).toContain('Curricolo');
    expect(mobileSource).toContain("['Progett', 'azione'].join('')");
    expect(mobileSource).toContain("handleTabSwitch('progetta-annuale')");
    expect(mobileSource).toContain('Riesame');
    expect(mobileSource).toContain('data-legacy-review-label="Revisione"');
    expect(mobileSource).not.toContain('<span>Fonti</span>');
    expect(mobileSource).toContain('data-secondary-destination="Documenti"');
    expect(mobileSource).toContain('grid-cols-4');
  });

  it('keeps Home compact, task-first and authority-safe with progressive disclosure', () => {
    expect(homeSource).not.toMatch(/Votazione|Voti Registrati|Unione Consensi|Merger|\.cml|IndexedDB|Dexie|Service Worker|WCAG|GDPR/i);
    expect(homeSource).toContain('data-beta-home="role-work-queue"');
    expect(homeSource).toContain('data-home-assurance="self-declared"');
    expect(homeSource).toContain('data-home-queue="actionable"');
    expect(homeSource).toContain('Non ci sono attività da completare in questo momento.');
    expect(homeSource).toContain('Puoi continuare a consultare il curricolo e i materiali disponibili.');
    expect(homeSource).toContain('data-hcm-secondary-content');
    expect(homeSource).toContain('Il percorso di lavoro');
    expect(homeSource).toContain('Contributi personali e confronto professionale.');
    expect(homeSource).toContain('Programmazione e UDA collegate al curricolo.');
    expect(homeSource).not.toContain('TaskCard');
  });

  it('uses one teacher-facing surface contract across primary workspaces', () => {
    for (const surface of ['curriculum', 'revision', 'planning', 'process', 'documents', 'knowledge']) {
      expect(viewsSource).toContain(`data-teacher-surface="${surface}"`);
    }
    expect(homeSource).toContain('data-teacher-surface="home"');
    expect(curriculumWorkspaceSource).toContain('data-teacher-surface="curriculum-workspace"');
  });

  it('makes the canonical 3–14 curriculum primary and keeps source verification explicit', () => {
    expect(curriculumWorkspaceSource).toContain('data-canonical-curriculum-entry');
    expect(curriculumWorkspaceSource).toContain('Curricolo verticale d’Istituto');
    expect(curriculumWorkspaceSource).toContain('Curricolo verticale integrale 3–14');
    expect(curriculumWorkspaceSource).toContain('Baseline corrente');
    expect(curriculumWorkspaceSource).toContain('Non è ancora il curricolo vigente dell’Istituto.');
    expect(curriculumWorkspaceSource).toContain('Apri il curricolo integrale');
    expect(curriculumWorkspaceSource).toContain('Verifica le fonti');
    expect(curriculumWorkspaceSource).toContain('data-canonical-source-review');
    expect(curriculumWorkspaceSource).toContain('data-legacy-curriculum-disclosure');
    expect(curriculumWorkspaceSource).toContain('Archivio locale precedente');
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

  it('makes personal revision recognition-first with nearby context and actions', () => {
    expect(revisionSource).toContain('data-revision-flow="recognition-first"');
    expect(revisionSource).toContain('data-revision-recognition-header');
    expect(revisionSource).toContain('data-revision-current-card');
    expect(revisionSource).toContain('data-revision-decision-actions');
    expect(revisionSource).toContain("window.scrollTo({ top: 0, behavior: 'smooth' })");
    expect(revisionSource).toContain('Il mio contributo alla revisione del curricolo');
    expect(revisionSource).toContain('Questa scelta registra il tuo contributo professionale. La decisione del gruppo è un passaggio distinto.');
    expect(revisionSource).not.toContain('Passo-Passo (Monoscheda)');
    expect(revisionSource).not.toContain('Elenco Completo');
    expect(revisionSource).not.toContain('Istruzioni operative:');
  });

  it('preserves H2, team, H3 and H4 as distinct governed surfaces', () => {
    expect(revisionWorkspaceSource).toContain('data-curriculum-work-session');
    expect(revisionWorkspaceSource).toContain('Un solo percorso: esamina, condividi, confronta e registra l’esito del gruppo quando ti compete.');
    expect(revisionWorkspaceSource).toContain('Il contributo personale, l’eventuale caso mirato e l’esito del gruppo restano passaggi distinti.');
    expect(teamCoordinationSource).toContain('Esito del gruppo registrato. Non è una decisione istituzionale e non modifica da solo il curricolo.');
    expect(caseAwareRevisionSource).toContain('data-human-phase="H3_VERTICAL_REVIEW"');
    expect(caseAwareRevisionSource).toContain('Fase distinta');
    expect(caseAwareRevisionSource).toContain('H3 si apre solo con un gesto esplicito e resta separato dall’iter istituzionale.');
    expect(verticalReviewSource).toContain('H3BoundInstitutionalDecisionPanel');
    expect(verticalReviewSource).toContain('Nessuna decisione istituzionale è stata creata.');
    expect(h4DecisionSource).toContain('data-h3-bound-h4-panel');
    expect(h4DecisionSource).toContain('H4 · decisione esplicita');
    expect(h4DecisionSource).toContain('La decisione resta distinta dall’adozione: non rende vigente il curricolo e non promuove automaticamente il master.');
    expect(h4DecisionSource).toContain('Nessuna adozione, vigenza o promozione del master è stata eseguita.');
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

  it('emits /fascicolo as the canonical source route while retaining legacy source compatibility', () => {
    expect(routingSource).toContain("case 'fonti': return '/fascicolo'");
    expect(routingSource).toContain("pathname.startsWith('/fascicolo')");
    expect(routingSource).toContain("pathname.startsWith('/fonti')");
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
