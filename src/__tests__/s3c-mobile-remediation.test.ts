import { describe, expect, it } from 'vitest';
import appViewsLayerRaw from '../features/session/components/AppViewsLayer.tsx?raw';
import fontiTabRaw from '../features/documents/components/FontiTab.tsx?raw';
import exportsTabRaw from '../features/documents/components/EsportazioniTab.tsx?raw';
import stylesRaw from '../index.css?raw';

describe('Arena S3C mobile remediation', () => {
  it('replaces the legacy Fonti information view with the canonical local source registry', () => {
    expect(appViewsLayerRaw).toContain("props.activeTab === 'fonti' && <FontiTab");
    expect(appViewsLayerRaw).toContain("props.activeTab !== 'fonti'");
    expect(fontiTabRaw).toContain('data-human-task="source-registry"');
    expect(fontiTabRaw).toContain('Una fonte caricata o verificata localmente non diventa automaticamente normativa o istituzionale');
    expect(fontiTabRaw).toContain('deriveKnowledgeSourcePresentation');
  });

  it('keeps proposal and institutional decision semantics explicit before the revision task', () => {
    expect(appViewsLayerRaw).toContain('Qui prepari una proposta. Non approvi il curricolo.');
    expect(appViewsLayerRaw).toContain('La decisione della scuola è un passaggio diverso');
    expect(appViewsLayerRaw).toContain('identità e autorità verificate');
  });

  it('prevents revision sticky regions from obscuring mobile content', () => {
    expect(stylesRaw).toContain('[data-revision-sticky-context],');
    expect(stylesRaw).toContain('[data-revision-sticky-actions]');
    expect(stylesRaw).toContain('position: static !important');
    expect(stylesRaw).toContain('padding-bottom: calc(var(--ui-mobile-gutter) + env(safe-area-inset-bottom))');
  });

  it('enforces readable mobile copy on the frozen human-task surfaces', () => {
    expect(stylesRaw).toContain('[data-teacher-surface="curriculum"] p');
    expect(stylesRaw).toContain('[data-teacher-surface="revision"] p');
    expect(stylesRaw).toContain('[data-teacher-surface="documents"] p');
    expect(stylesRaw).toContain('font-size: 0.875rem');
  });

  it('keeps Documents task-first and moves secondary formats behind disclosure', () => {
    expect(exportsTabRaw).toContain('Scegli cosa vuoi ottenere. Esportare un file non approva il curricolo');
    expect(exportsTabRaw).toContain('Scarica Word (.docx)');
    expect(exportsTabRaw).toContain('Salva copia di lavoro (.cml)');
    expect(exportsTabRaw).toContain('Altri formati');
    expect(exportsTabRaw).toContain('Cosa non fa questa pagina');
  });
});
