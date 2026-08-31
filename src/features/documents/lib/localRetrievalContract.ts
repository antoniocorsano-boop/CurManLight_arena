export type LocalRetrievalOutcome =
  | { kind: 'EVIDENCE_FOUND'; text: string }
  | { kind: 'INSUFFICIENT_EVIDENCE'; text: string };

const QUERY_STOPWORDS = new Set([
  'a', 'ad', 'ai', 'al', 'alla', 'alle', 'allo', 'anche', 'che', 'chi', 'ci', 'come', 'con',
  'cosa', 'da', 'dal', 'dalla', 'delle', 'di', 'e', 'ed', 'fare', 'gli', 'il', 'in', 'la',
  'le', 'lo', 'mi', 'nel', 'nella', 'non', 'occorre', 'per', 'puoi', 'relazione', 'serve',
  'si', 'su', 'tra', 'un', 'una', 'uno', 'va', 'voglio', 'vorrei',
]);

const normalize = (value: string) => value
  .toLocaleLowerCase('it')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9/]+/g, ' ')
  .trim();

const informativeTerms = (query: string) => normalize(query)
  .split(/\s+/)
  .filter(Boolean)
  .filter((term) => term.length > 1 && !QUERY_STOPWORDS.has(term));

const isActionSeekingQuestion = (query: string) => {
  const q = normalize(query);
  return /\b(cosa|che cosa)\b.*\b(fare|occorre|serve)\b/.test(q)
    || /\bcosa devo\b/.test(q)
    || /\bcome devo\b/.test(q);
};

const abstention = (): LocalRetrievalOutcome => ({
  kind: 'INSUFFICIENT_EVIDENCE',
  text: 'Non trovo nelle fonti disponibili elementi sufficientemente pertinenti per rispondere a questa domanda. Posso cercare passaggi più specifici se indichi un tema, una fonte o un riferimento preciso.',
});

const extractQuotedPassage = (response: string): string | null => {
  const match = response.match(/\n\n"([\s\S]*?)"\n\n/);
  const passage = match?.[1]?.trim();
  return passage ? passage : null;
};

export function applyLocalRetrievalContract(query: string, legacyResponse: string): LocalRetrievalOutcome {
  const terms = informativeTerms(query);

  // An operational question with only one weak topic token is not enough to infer
  // a supported action. Prefer abstention over a coincidental archive match.
  if (isActionSeekingQuestion(query) && terms.length <= 1) {
    return abstention();
  }

  // The legacy fallback explicitly claimed success without evidence. It must never
  // cross the user-facing boundary.
  if (/elaborata con successo come risposta locale non verificata/i.test(legacyResponse)) {
    return abstention();
  }

  const isExplicitEvidenceResult = /^\[WikiLLM - Analisi (?:del Documento Caricato|della fonte storica archiviata):/i.test(legacyResponse);
  if (!isExplicitEvidenceResult) {
    // Canned or inferred legacy answers have no source binding in this path.
    return abstention();
  }

  const passage = extractQuotedPassage(legacyResponse);
  if (!passage || terms.length === 0) {
    return abstention();
  }

  return {
    kind: 'EVIDENCE_FOUND',
    text: `Ho trovato un passaggio in una fonte locale. Questo passaggio non costituisce una risposta alla domanda.\n\n«${passage}»\n\nApri la fonte e verificane contesto, pertinenza e autorità prima di usarlo.`,
  };
}
