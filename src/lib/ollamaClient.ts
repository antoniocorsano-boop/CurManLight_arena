interface OllamaStatus {
  connected: boolean;
  model: string | null;
  endpoint: string;
}

export async function testOllamaConnection(endpoint = 'http://localhost:11434'): Promise<OllamaStatus> {
  try {
    const response = await fetch(`${endpoint}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const data = await response.json();
      const model = data.models?.[0]?.name || null;
      return { connected: true, model, endpoint };
    }
    return { connected: false, model: null, endpoint };
  } catch {
    return { connected: false, model: null, endpoint };
  }
}

export async function generateWithOllama(prompt: string, model = 'llama3', endpoint = 'http://localhost:11434'): Promise<string> {
  try {
    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
      signal: AbortSignal.timeout(30000),
    });
    if (response.ok) {
      const data = await response.json();
      return data.response || '';
    }
    return '';
  } catch {
    return '';
  }
}
