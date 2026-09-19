import { describe, expect, it } from 'vitest';
import localAgentSetupSource from '../features/copilot/hooks/useLocalAgentSetup.ts?raw';

describe('M4-S2 local-agent security regression', () => {
  it('keeps browser-human parity independent from credentials or privilege changes', () => {
    expect(localAgentSetupSource).not.toContain('navigator.webdriver');
    expect(localAgentSetupSource).not.toContain('Authorization');
    expect(localAgentSetupSource).not.toMatch(/api[_-]?key/i);
    expect(localAgentSetupSource).not.toMatch(/secret/i);

    expect(localAgentSetupSource).toContain("method: 'GET'");
    expect(localAgentSetupSource).toContain("${ollamaServerUrl}/api/tags");
    expect(localAgentSetupSource).toContain("safeLocalStorageGetItem('curman_localAgentStatus', '') === ''");
  });

  it('does not introduce credential persistence while preserving local configuration only', () => {
    const persistedKeys = [...localAgentSetupSource.matchAll(/safeLocalStorageSetItem\('([^']+)'/g)]
      .map((match) => match[1]);

    expect(persistedKeys.sort()).toEqual([
      'curman_localAgentSize',
      'curman_localAgentStatus',
      'curman_ollamaModelName',
      'curman_ollamaServerUrl',
    ].sort());
  });
});
