import { describe, expect, it } from 'vitest';

function firstSource(modules: Record<string, string>): string {
  return Object.values(modules)[0] ?? '';
}

const responseDraftSource = firstSource(import.meta.glob('../features/ai/components/LocalAiResponseDraft.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const navigationSource = firstSource(import.meta.glob('../features/copilot/assistantKnowledgeNavigation.ts', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const wikiHandlersSource = firstSource(import.meta.glob('../features/documents/hooks/useWikiGlossaryHandlers.ts', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const secondBrainSource = firstSource(import.meta.glob('../features/documents/components/SecondBrainTab.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

describe('Assistant → knowledge → graph continuity', () => {
  it('offers explicit verification routes from an assistant response', () => {
    expect(responseDraftSource).toContain('Apri conoscenza');
    expect(responseDraftSource).toContain('Mostra connessioni');
    expect(responseDraftSource).toContain("openAssistantKnowledge('source')");
    expect(responseDraftSource).toContain("openAssistantKnowledge('graph')");
    expect(responseDraftSource).toContain('Non trasformano la risposta dell\'assistente in proposta o decisione istituzionale.');
  });

  it('uses the canonical knowledge route without adding a primary navigation destination', () => {
    expect(navigationSource).toContain('/knowledge');
    expect(navigationSource).toContain('assistantView=graph');
    expect(navigationSource).toContain('assistantView=source');
    expect(navigationSource).toContain("window.dispatchEvent(new PopStateEvent('popstate'))");
  });

  it('maps assistant deep links onto the existing knowledge and graph states', () => {
    expect(wikiHandlersSource).toContain("requestedKnowledgeView === 'graph'");
    expect(wikiHandlersSource).toContain("setSecondBrainTab('graph')");
    expect(wikiHandlersSource).toContain("setSecondBrainTab('brain')");
    expect(wikiHandlersSource).toContain("setWikiWorkspaceTab('read')");
  });

  it('reuses the existing semantic views instead of creating a parallel graph', () => {
    expect(secondBrainSource).toContain('Biblioteca &amp; Copilota');
    expect(secondBrainSource).toContain('Mappa Connessioni');
    expect(secondBrainSource).toContain('Glossario locale');
  });
});
