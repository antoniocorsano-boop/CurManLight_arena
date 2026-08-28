import { describe, expect, it } from 'vitest';

function firstSource(modules: Record<string, string>): string {
  return Object.values(modules)[0] ?? '';
}

const sidebar = firstSource(import.meta.glob('../features/copilot/components/CopilotChatSidebar.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

describe('G5 assistant discoverability boundary', () => {
  it('keeps knowledge actions visible independently of local AI readiness', () => {
    expect(sidebar).toContain('data-assistant-knowledge-actions="always-visible"');
    expect(sidebar).toContain('Apri conoscenza');
    expect(sidebar).toContain('Mostra connessioni');
    expect(sidebar).toContain("openAssistantKnowledge(view)");
  });

  it('keeps assistant above onboarding modal priority without changing authority', () => {
    expect(sidebar).toContain('z-[170]');
    expect(sidebar).toContain('non approva, modifica o promuove contenuti istituzionali');
    expect(sidebar).not.toMatch(/Approva proposta|Rifiuta proposta|Delibera|Vota/);
  });
});
