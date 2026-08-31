import { describe, expect, it } from 'vitest';

function firstSource(modules: Record<string, string>): string {
  return Object.values(modules)[0] ?? '';
}

const sidebar = firstSource(import.meta.glob('../features/copilot/components/CopilotChatSidebar.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const localAiConfiguration = firstSource(import.meta.glob('../features/ai/components/LocalAiConfiguration.tsx', {
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

  it('makes mobile assistant local-first and keeps Ollama optional', () => {
    expect(localAiConfiguration).toContain('data-mobile-local-assistant="primary"');
    expect(localAiConfiguration).toContain('Assistente mobile locale');
    expect(localAiConfiguration).toContain('senza configurare Ollama o altri modelli');
    expect(localAiConfiguration).toContain('data-mobile-model-optional="collapsed"');
    expect(localAiConfiguration).toContain('Aggiungi un modello (facoltativo)');
    expect(localAiConfiguration).toContain('Provider opzionale');
    expect(localAiConfiguration).toContain('non approvano, modificano o promuovono contenuti istituzionali');
  });

  it('does not present generative prompts as executable local-only capabilities', () => {
    expect(sidebar).toContain('data-assistant-local-context-actions="available-only"');
    expect(sidebar).toContain('Azioni disponibili qui:');
    expect(sidebar).toContain('Nessuna risposta AI viene simulata.');
    expect(sidebar).toContain('data-assistant-model-suggestions="model-required"');
    expect(sidebar).toContain('Suggerimenti per il modello:');
    expect(sidebar).toContain('!isAiConfigured ?');
    expect(sidebar).not.toContain('handleSelectCopilotChip(c)');
  });

  it('uses only real local navigation targets while no model is configured', () => {
    expect(sidebar).toContain("{ label: 'Controlla le fonti del curricolo', view: 'source' }");
    expect(sidebar).toContain("{ label: 'Esplora le relazioni', view: 'graph' }");
    expect(sidebar).toContain("{ label: 'Controlla le evidenze', view: 'source' }");
    expect(sidebar).toContain('onClick={() => handleOpenKnowledge(action.view)}');
  });
});
