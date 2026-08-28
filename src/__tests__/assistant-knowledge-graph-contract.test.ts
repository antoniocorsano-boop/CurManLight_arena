import { describe, expect, it } from 'vitest';

function firstSource(modules: Record<string, string>): string {
  return Object.values(modules)[0] ?? '';
}

const headerSource = firstSource(import.meta.glob('../features/navigation/components/AppHeader.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const appSource = firstSource(import.meta.glob('../App.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const secondBrainSource = firstSource(import.meta.glob('../features/documents/components/SecondBrainTab.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const sidebarSource = firstSource(import.meta.glob('../features/navigation/components/AppSidebar.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const mobileSource = firstSource(import.meta.glob('../features/navigation/components/MobileBottomNav.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

describe('Assistente Arena · Conoscenza · Grafo contract', () => {
  it('keeps the assistant globally reachable from the header and mounted as a contextual overlay', () => {
    expect(headerSource).toContain('setIsCopilotChatOpen');
    expect(headerSource).toMatch(/Assistente/i);
    expect(appSource).toContain('CopilotChatSidebar');
    expect(appSource).toContain('isCopilotChatOpen');
  });

  it('keeps knowledge and graph capabilities available without adding them to primary navigation', () => {
    expect(secondBrainSource).toContain('Biblioteca &amp; Copilota');
    expect(secondBrainSource).toContain('Mappa Connessioni');
    expect(secondBrainSource).toContain('Glossario locale');
    expect(secondBrainSource).toContain('graphNodes');
    expect(secondBrainSource).toContain('initialEdges');

    expect(sidebarSource).not.toMatch(/Second Brain|WikiLLM|Mappa Connessioni/i);
    expect(mobileSource).not.toMatch(/Second Brain|WikiLLM|Mappa Connessioni/i);
  });

  it('keeps the assistant outside institutional decision authority', () => {
    expect(headerSource).not.toMatch(/Approva|Rifiuta|Delibera|Vota/i);
    expect(secondBrainSource).toMatch(/non verificat/i);
  });
});
