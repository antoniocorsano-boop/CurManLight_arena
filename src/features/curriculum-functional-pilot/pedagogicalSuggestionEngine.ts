/**
 * CML-631I — Pedagogical Suggestion Engine
 *
 * Local, deterministic suggestion engine for pedagogical relation types.
 * Analyzes source and target CurriculumNode to generate 1–3 motivated suggestions.
 * No external services, no randomness, no network calls.
 */

import type { CurriculumNode, VerticalCurriculumRelationType } from '../../domain/curriculum';

export interface PedagogicalSuggestion {
  relationType: VerticalCurriculumRelationType;
  motivation: string;
  confidence: 'high' | 'medium' | 'low';
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function keywordOverlapCount(a: string, b: string): number {
  const wordsA = new Set(a.split(' ').filter(w => w.length > 3));
  const wordsB = new Set(b.split(' ').filter(w => w.length > 3));
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  return overlap;
}

function containsTerm(text: string, terms: string[]): boolean {
  return terms.some(t => text.includes(t));
}

export function generatePedagogicalSuggestions(
  source: CurriculumNode,
  target: CurriculumNode
): PedagogicalSuggestion[] {
  if (!source || !target) return [];
  if (!source.title || !target.title) return [];

  const srcText = normalizeText(`${source.title} ${source.description || ''}`);
  const tgtText = normalizeText(`${target.title} ${target.description || ''}`);
  const overlap = keywordOverlapCount(srcText, tgtText);
  const hasOverlap = overlap >= 1;
  const sameType = source.type === target.type;
  const sameSegment = source.segmentId === target.segmentId;

  const suggestions: PedagogicalSuggestion[] = [];
  const added = new Set<VerticalCurriculumRelationType>();

  function add(type: VerticalCurriculumRelationType, motivation: string, confidence: 'high' | 'medium' | 'low') {
    if (!added.has(type)) {
      added.add(type);
      suggestions.push({ relationType: type, motivation, confidence });
    }
  }

  // ── CROSS-LEVEL DISCONTINUITY (highest priority for unrelated cross-level) ──
  if (!sameSegment && !hasOverlap) {
    add('discontinuity',
      `I due nodi appartengono a livelli diversi e non condividono elementi formativi evidenti. La discontinuità indica l'assenza di un collegamento pedagogico diretto.`,
      'low');
  }

  // ── CROSS-LEVEL WITH OVERLAP → development ──
  if (!sameSegment && hasOverlap) {
    add('development',
      `I nodi appartengono a livelli scolastici diversi e condividono temi formativi. Lo sviluppo descrive come "${source.title}" si amplia in "${target.title}" nel passaggio di livello.`,
      'medium');
  }

  // ── SAME-TYPE RULES ──
  if (sameType && hasOverlap) {
    add('continuity',
      `I due nodi condividono lo stesso tipo (${source.type}) e temi collegati. La relazione di continuità evidenzia come il percorso formativo si mantenga coerente nel passaggio da "${source.title}" a "${target.title}".`,
      'high');
  }

  if (sameType && !hasOverlap) {
    add('development',
      `Entrambi i nodi sono di tipo "${source.type}", ma affrontano temi diversi. Lo sviluppo indica che "${source.title}" si amplia in "${target.title}" con contenuti nuovi.`,
      'high');
  }

  // ── CROSS-TYPE RULES ──
  if (source.type === 'objective' && target.type === 'competence') {
    add('integration',
      `L'obiettivo "${source.title}" si integra con la competenza "${target.title}", contribuendo al suo sviluppo in modo congiunto.`,
      'medium');
  }

  if (source.type === 'competence' && target.type === 'objective') {
    add('development',
      `La competenza "${source.title}" si sviluppa nell'obiettivo "${target.title}" con un approccio più specifico e articolato.`,
      'medium');
  }

  if (source.type !== target.type && hasOverlap) {
    add('integration',
      `Nonostante i diversi tipi (${source.type} → ${target.type}), "${source.title}" e "${target.title}" condividono elementi formativi che ne favoriscono l'integrazione in un percorso congiunto.`,
      'medium');
  }

  // ── TOPIC-SPECIFIC RULES ──
  if (containsTerm(srcText, ['statistica', 'dati', 'analisi']) &&
      containsTerm(tgtText, ['statistica', 'dati', 'analisi'])) {
    add('deepening',
      `Entrambi i nodi trattano temi di analisi dei dati. L'approfondimento descrive come "${source.title}" viene ripreso e ampliato in "${target.title}" con maggiore profondità.`,
      'high');
  }

  if (containsTerm(srcText, ['geometria', 'figure', 'piano']) &&
      containsTerm(tgtText, ['geometria', 'figure', 'spazio'])) {
    add('prerequisite',
      `La conoscenza di "${source.title}" (geometria piana) è prerequisito per affrontare "${target.title}" (geometria nello spazio). La padronanza delle figure piane facilita la comprensione tridimensionale.`,
      'high');
  }

  // ── MILESTONE PREREQUISITE ──
  if (source.type === 'milestone' && target.type === 'milestone' && hasOverlap) {
    add('prerequisite',
      `Il traguardo "${source.title}" costituisce un prerequisito per affrontare "${target.title}". La padronanza del primo facilita l'approccio al secondo.`,
      'medium');
  }

  // ── SAME-SEGMENT FALLBACK ──
  if (sameSegment && sameType && suggestions.length === 0) {
    add('continuity',
      `I due nodi appartengono allo stesso segmento e hanno lo stesso tipo. La continuità descrive un percorso formativo coerente tra "${source.title}" e "${target.title}".`,
      'low');
  }

  // ── ABSOLUTE FALLBACK ──
  if (suggestions.length === 0) {
    add('integration',
      `I due nodi condividono elementi formativi. L'integrazione descrive come "${source.title}" e "${target.title}" possano essere connessi in un percorso formativo congiunto.`,
      'low');
  }

  // Sort by confidence, limit to 3
  const confidenceOrder = { high: 0, medium: 1, low: 2 };
  return suggestions
    .sort((a, b) => confidenceOrder[a.confidence] - confidenceOrder[b.confidence])
    .slice(0, 3);
}
