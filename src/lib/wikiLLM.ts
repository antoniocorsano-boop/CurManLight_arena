import { escapeRegExp } from './semanticSearch';

// ─── Type ───────────────────────────────────────────────────────────────────

export interface WikiVolume {
 id: string;
 title: string;
 text: string;
}

export interface WikiCustomDoc {
 id: string;
 title: string;
 subtitle: string;
 content: string;
}

export interface BestVolumeMatch {
 bestVolId: string;
 matchedParagraph: string;
 maxScore: number;
}

export interface WikiResponseParams {
 query: string;
 discipline: string;
 order: string;
 customDocs: WikiCustomDoc[];
 volumes: WikiVolume[];
 getVolumeTitle: (id: string) => string;
}

// ─── Discipline detection ───────────────────────────────────────────────────

// Short keywords (< 4 chars, e.g. 'ia', 'lel') use word-boundary regex to
// avoid false positives like 'ia' matching inside 'storia' or 'galileiano'.
// Longer keywords use simple includes() which is correct at that length.
const SHORT_KEYWORD_THRESHOLD = 4;

const matchKeyword = (text: string, keyword: string): boolean => {
 if (keyword.length < SHORT_KEYWORD_THRESHOLD) {
  return new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i').test(text);
 }
 return text.includes(keyword);
};

const DISCIPLINE_KEYWORDS: [string[], string][] = [
 [['tecnologia', 'coding', 'ia', 'tecnologiche'], 'tecnologia'],
 [['scienze', 'scienza', 'esperiment'], 'scienze'],
 [['storia', 'storico'], 'storia'],
 [['geografia', 'territorio', 'mappa'], 'geografia'],
 [['latino', 'lel'], 'latino'],
 [['inglese'], 'inglese'],
 [['francese', 'seconda lingua'], 'secondaLingua'],
];

export const detectDiscipline = (q: string, defaultDisc: string): string => {
 const lower = q.toLowerCase();
 for (const [keywords, disc] of DISCIPLINE_KEYWORDS) {
  if (keywords.some(k => matchKeyword(lower, k))) return disc;
 }
 return defaultDisc;
};

// ─── Semantic search scoring ────────────────────────────────────────────────

export const scoreVolumeByTerms = (text: string, terms: string[]): number => {
 const lower = text.toLowerCase();
 let score = 0;
 for (const term of terms) {
  const regex = new RegExp(escapeRegExp(term), 'g');
  score += (lower.match(regex) || []).length;
 }
 return score;
};

// ─── Volume matching ────────────────────────────────────────────────────────

export const findBestVolumeMatch = (
 query: string,
 volumes: WikiVolume[],
 threshold = 2,
): BestVolumeMatch | null => {
 const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
 if (terms.length === 0) return null;

 let bestVolId = 'vol4';
 let maxScore = 0;
 let matchedParagraph = '';

 for (const vol of volumes) {
  const score = scoreVolumeByTerms(vol.text, terms);
  if (score > maxScore) {
   maxScore = score;
   bestVolId = vol.id;
   const paragraphs = vol.text.split('\n');
   const matchPara = paragraphs.find(p =>
    terms.some(t => p.toLowerCase().includes(t)),
   );
   matchedParagraph = matchPara
    ? matchPara.slice(0, 450) + '...'
    : vol.text.slice(0, 450) + '...';
  }
 }

 return maxScore >= threshold
  ? { bestVolId, matchedParagraph, maxScore }
  : null;
};

// ─── Response generation ────────────────────────────────────────────────────

const CUSTOM_DOC_RESPONSE = (doc: WikiCustomDoc) =>
 `[WikiLLM - Analisi del Documento Caricato: ${doc.title}]\n\n` +
 `Ho scansionato la base documentale locale e individuato informazioni pertinenti ` +
 `all'interno del documento "${doc.title}" (${doc.subtitle}):\n\n` +
 `"${doc.content.slice(0, 500)}${doc.content.length > 500 ? '...' : ''}"\n\n` +
 `Fonte caricata localmente e non verificata. Valuta il contenuto prima di usarlo ` +
 `nella progettazione personale; il caricamento non attribuisce autorità istituzionale.`;

const SEMANTIC_SEARCH_RESPONSE = (match: BestVolumeMatch, getVolumeTitle: (id: string) => string) =>
 `[WikiLLM - Analisi della fonte storica archiviata: ${getVolumeTitle(match.bestVolId)}]\n\n` +
 `Questa risposta cita una fonte storica archiviata, non un'autorità istituzionale attiva. Ho individuato corrispondenze ` +
 `ad alta densità nel volume "${getVolumeTitle(match.bestVolId)}":\n\n` +
 `"${match.matchedParagraph}"\n\n` +
 `Usa il contenuto come riferimento storico da verificare prima di inserirlo nella progettazione personale.`;

const FALLBACK_RESPONSE = (query: string, disc: string, ord: string) =>
 `La richiesta "${query}" è stata elaborata con successo come risposta locale non verificata. I riferimenti disponibili ` +
 `per la disciplina ${disc.toUpperCase()} e per ` +
 `l'ordine ${ord.toUpperCase()} integra questi riferimenti per promuovere un ` +
 `apprendimento continuo, basato su prove e raccordato con compiti autentici e ` +
 `livelli di padronanza chiari. L'agente consiglia l'inserimento di questa ` +
 `specifica progettazione personale in un'Unità di Apprendimento (UDA).`;

const KWL_RESPONSES: [string[], string][] = [
 [['green cross corner'],
  "[WikiLLM - Fonte storica archiviata: progetto Green Cross Corner]\\n\\nIl progetto Green Cross Corner è citato esclusivamente come iniziativa storica conservata nell'archivio. Non prova che il progetto sia attivo o adottato dalla scuola corrente."],
 [['roadmap', 'percentuali', 'allucinazione', 'volume 13', 'metric'],
  "[WikiLLM - Fonte storica archiviata: Volume 13]\\n\\nIl Volume 13 riporta una precedente analisi metrica, incluso il valore storico del 5.8%. Il contenuto è conservato per consultazione e non descrive l'autorità, la configurazione o la roadmap attiva della scuola corrente."],

 [['social', 'condiv', 'like', 'lessons learned', 'volume 14', 'bacheca'],
  "[WikiLLM - Fonte storica archiviata: Volume 14]\\n\\nIl Volume 14 conserva una precedente analisi della condivisione UDA. La salvaguardia storica richiama l'Articolo 9 GDPR: prevenire l'inserimento o la diffusione di dati sensibili dei minori, inclusi riferimenti sanitari o indiretti, nelle annotazioni condivise. Questo richiamo non è una regola vigente della scuola corrente: verifica sempre le policy locali."],

 [['classe', 'banchi', 'gruppi', 'cooperative', 'seating', 'volume 19'],
  "[WikiLLM - Fonte storica archiviata: Volume 19]\\n\\nIl Volume 19 descrive una precedente proposta per pseudonimi, disposizione dei banchi e gruppi cooperativi. È un riferimento storico da adattare al contesto della classe, non una configurazione o disposizione attiva della scuola corrente."],

 [['dm 14/2024', 'certificazione', 'evidenze', '14/2024'],
  "La certificazione delle competenze secondo il D.M. n. 14 del 30 gennaio 2024 introduce i modelli nazionali per la Scuola Primaria e la Scuola Secondaria di Primo Grado, raccordati alle 8 Competenze Chiave Europee. CurManLight può rappresentare i 4 livelli ministeriali e collegarli alle evidenze inserite localmente. I dati restano non verificati e la valutazione compete al consiglio di classe."],

 [['dm 183/2024', 'educazione civica', 'nuclei', 'civica'],
  "Le Linee Guida del D.M. 183/2024 sono un riferimento normativo per Costituzione, Sviluppo Sostenibile e Cittadinanza Digitale. CurManLight può registrare collegamenti e ore inseriti localmente, ma non verifica copertura, conformità o adozione da parte della scuola."],

 [['latino', 'lel'],
  "La riforma del D.M. 221/2025 valorizza il patrimonio linguistico storico attraverso l'introduzione sperimentale di elementi di Latino (LEL - Lingua e Elementi di Latino) a partire dalla Classe Seconda della scuola secondaria di primo grado. L'approccio stabilito nel curricolo non è grammaticale o mnemonico, ma focalizzato sul confronto interlinguistico (diacronia linguistica) con l'italiano per potenziare la competenza lessicale, la logica formale e la consapevolezza culturale dell'alunno."],

 [['tecnologia', 'coding', 'ia', 'tecnologiche'],
  "La riforma delle Nuove Indicazioni Nazionali 2025 (D.M. 221/2025) per la Tecnologia valorizza lo studio etico e algoritmico dell'Intelligenza Artificiale, la progettazione tridimensionale, il CAD e il coding. Le attività possono essere raccordate ai laboratori e ai progetti disponibili nel contesto locale."],

 [['scienze', 'scienza', 'esperiment'],
  "Nel D.M. 221/2025, le Scienze acquisiscono una forte dimensione sperimentale incentrata sul metodo galileiano e sull'apprendimento basato sulla ricerca (Inquiry-Based Science Education - IBSE). Gli alunni analizzano fatti e dati della realtà per formulare ipotesi e valutarne la coerenza scientifica. Le attività su biodiversità, tutela ambientale e salute vanno raccordate alle risorse disponibili nel contesto locale."],

 [['storia', 'storico'],
  "La disciplina della Storia nelle Nuove Indicazioni 2025 (D.M. 221/2025), dal Basso Medioevo alla contemporaneità, valorizza l'analisi critica delle fonti cartacee e digitali, il riconoscimento della disinformazione e il raccordo con la cittadinanza digitale. È un riferimento generale da adattare alla progettazione locale non verificata."],

 [['geografia', 'territorio', 'mappa'],
  "La Geografia nel D.M. 221/2025 si concentra sulla geografia dei sistemi e sul rapporto uomo-ambiente. Introduce telerilevamento, GIS e mappe satellitari per analizzare trasformazioni territoriali, migrazioni, flussi antropici e sviluppo sostenibile nel contesto locale e globale."],

 [['verticale', 'diacronico', 'allineamento', 'continuità'],
  "La continuità verticale è un riferimento pedagogico tra Infanzia, Primaria e Secondaria. CurManLight può rappresentare collegamenti inseriti localmente, ma l'allineamento effettivo dipende dai contenuti configurati e resta non verificato."],

 [['delibera', 'collegio', 'approvazione', 'deliberazione'],
  "Il Volume 10 è una fonte storica archiviata relativa a una precedente proposta di delibera. Non costituisce un atto vigente né prova l'adozione di CurManLight; ogni scuola deve fare riferimento alle proprie deliberazioni configurate e verificabili."],
];

const KWL_KEYWORDS: [string[], string][] = [
 [['green cross corner'], 'greenCrossHistorical'],
 [['roadmap', 'percentuali', 'allucinazione', 'volume 13', 'metric'], 'volume13'],
 [['social', 'condiv', 'like', 'lessons learned', 'volume 14', 'bacheca'], 'volume14'],
 [['classe', 'banchi', 'gruppi', 'cooperative', 'seating', 'volume 19'], 'volume19'],
 [['dm 14/2024', 'certificazione', 'evidenze', '14/2024'], 'dm14'],
 [['dm 183/2024', 'educazione civica', 'nuclei', 'civica'], 'dm183'],
 [['latino', 'lel'], 'latino'],
 [['tecnologia', 'coding', 'ia', 'tecnologiche'], 'tech'],
 [['scienze', 'scienza', 'esperiment'], 'scienze'],
 [['storia', 'storico'], 'storia'],
 [['geografia', 'territorio', 'mappa'], 'geo'],
 [['verticale', 'diacronico', 'allineamento', 'continuità'], 'verticale'],
 [['delibera', 'collegio', 'approvazione', 'deliberazione'], 'delibera'],
];

const KWL_RESPONSE_MAP: Record<string, string> = Object.fromEntries(
 KWL_KEYWORDS.map(([_kw, id], i) => [id, KWL_RESPONSES[i][1]]),
);

const detectKwlCategory = (q: string): string | null => {
 for (const [keywords, id] of KWL_KEYWORDS) {
  if (keywords.some(k => matchKeyword(q, k))) return id;
 }
 return null;
};

// ─── Main entry point ───────────────────────────────────────────────────────

export const generateWikiResponse = (p: WikiResponseParams): string => {
 const q = p.query.toLowerCase();
 const disc = detectDiscipline(q, p.discipline);

 // 1. Custom uploaded document
 const matchingDoc = p.customDocs.find(d =>
  q.includes(d.title.toLowerCase()) || q.includes(d.subtitle.toLowerCase()),
 );
 if (matchingDoc) return CUSTOM_DOC_RESPONSE(matchingDoc);

 // 2. Knowledge-base keyword responses
 const kwlId = detectKwlCategory(q);
 if (kwlId) return KWL_RESPONSE_MAP[kwlId];

 // 3. Discipline-specific canned responses
 const discResponse = generateDisciplineResponse(q);
 if (discResponse) return discResponse;

 // 4. Semantic search fallback across all volumes
 const match = findBestVolumeMatch(p.query, p.volumes);
 if (match) return SEMANTIC_SEARCH_RESPONSE(match, p.getVolumeTitle);

 return FALLBACK_RESPONSE(p.query, disc, p.order);
};

// ─── Discipline-specific responses ──────────────────────────────────────────

const DISCIPLINE_RESPONSES: Record<string, string> = {
 latino: "La riforma del D.M. 221/2025 valorizza il patrimonio linguistico storico attraverso l'introduzione sperimentale di elementi di Latino (LEL - Lingua e Elementi di Latino) a partire dalla Classe Seconda della scuola secondaria di primo grado. L'approccio stabilito nel curricolo non è grammaticale o mnemonico, ma focalizzato sul confronto interlinguistico (diacronia linguistica) con l'italiano per potenziare la competenza lessicale, la logica formale e la consapevolezza culturale dell'alunno.",
 tecnologia: "La riforma delle Nuove Indicazioni Nazionali 2025 (D.M. 221/2025) per la Tecnologia valorizza lo studio etico e algoritmico dell'Intelligenza Artificiale, la progettazione tridimensionale, il CAD e il coding, raccordandoli ai laboratori disponibili nel contesto locale.",
 scienze: "Nel D.M. 221/2025, le Scienze acquisiscono una forte dimensione sperimentale incentrata sul metodo galileiano e sull'apprendimento basato sulla ricerca (Inquiry-Based Science Education - IBSE). Gli alunni analizzano fatti e dati della realtà per formulare ipotesi e valutarne la coerenza scientifica. Le attività su biodiversità, tutela ambientale e salute vanno raccordate alle risorse disponibili nel contesto locale.",
 storia: "La disciplina della Storia nelle Nuove Indicazioni 2025 (D.M. 221/2025), dal Basso Medioevo alla contemporaneità, valorizza l'analisi critica delle fonti cartacee e digitali, il riconoscimento della disinformazione e il raccordo con la cittadinanza digitale. È un riferimento generale da adattare alla progettazione locale non verificata.",
 geografia: "La Geografia nel D.M. 221/2025 si concentra sulla geografia dei sistemi e sul rapporto uomo-ambiente. Integra telerilevamento, GIS e mappe satellitari per analizzare le trasformazioni territoriali e lo sviluppo sostenibile nel contesto locale e globale.",
};

const VERTICAL_RESPONSE =
 "La continuità verticale è un riferimento pedagogico tra Infanzia, Primaria e Secondaria. CurManLight può rappresentare collegamenti inseriti localmente, ma l'allineamento effettivo dipende dai contenuti configurati e resta non verificato.";

const generateDisciplineResponse = (q: string): string | null => {
 // Check vertical keywords first (not discipline-specific)
 if (q.includes('verticale') || q.includes('diacronico') || q.includes('allineamento') || q.includes('continuità'))
  return VERTICAL_RESPONSE;

 const disc = detectDiscipline(q, '');
 return DISCIPLINE_RESPONSES[disc] ?? null;
};
