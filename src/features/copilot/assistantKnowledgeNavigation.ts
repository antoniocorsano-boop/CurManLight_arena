import { resolveRouterBasename } from '../navigation/routerBasename';

export type AssistantKnowledgeView = 'source' | 'graph';

export function buildAssistantKnowledgePath(view: AssistantKnowledgeView): string {
  const basename = resolveRouterBasename(import.meta.env.MODE);
  const base = basename === '/' ? '' : basename.replace(/\/$/, '');
  const query = view === 'graph' ? '?assistantView=graph' : '?assistantView=source';
  return `${base}/knowledge${query}`;
}

export function openAssistantKnowledge(view: AssistantKnowledgeView): void {
  if (typeof window === 'undefined') return;
  window.history.pushState({ assistantKnowledgeView: view }, '', buildAssistantKnowledgePath(view));
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function readAssistantKnowledgeView(search = typeof window === 'undefined' ? '' : window.location.search): AssistantKnowledgeView | null {
  const requested = new URLSearchParams(search).get('assistantView');
  if (requested === 'graph') return 'graph';
  if (requested === 'source') return 'source';
  return null;
}
