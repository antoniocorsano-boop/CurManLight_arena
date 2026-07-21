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
 `[WikiLLM d'Istituto - Analisi del Documento Caricato: ${doc.title}]\n\n` +
 `Ho scansionato la KB d'Istituto ed ho individuato informazioni pertinenti ` +
 `all'interno del documento "${doc.title}" (${doc.subtitle}):\n\n` +
 `"${doc.content.slice(0, 500)}${doc.content.length > 500 ? '...' : ''}"\n\n` +
 `In conformità alle disposizioni organizzative caricate, l'Agente consiglia ` +
 `di integrare queste linee d'indirizzo all'interno del PTOF e delle ` +
 `programmazioni verticali dei dipartimenti.`;

const SEMANTIC_SEARCH_RESPONSE = (match: BestVolumeMatch, getVolumeTitle: (id: string) => string) =>
 `[WikiLLM d'Istituto - Analisi Semantica Real-time del Volume: ${getVolumeTitle(match.bestVolId)}]\n\n` +
 `Ho scansionato l'intera Banca Dati d'Istituto ed ho individuato corrispondenze ` +
 `ad alta densità nel volume "${getVolumeTitle(match.bestVolId)}":\n\n` +
 `"${match.matchedParagraph}"\n\n` +
 `L'Agente consiglia l'inserimento di questa specifica progettazione in un'Unità ` +
 `di Apprendimento (UDA) d'Istituto.`;

const FALLBACK_RESPONSE = (query: string, disc: string, ord: string) =>
 `La tua richiesta riguardante "${query}" è stata elaborata con successo ` +
 `dall'archivio semantico di CurManLight. In conformità con le linee guida ` +
 `d'Istituto (Codice Meccanografico AVIC849003) ed il Profilo dello Studente ` +
 `raccordato alle raccomandazioni UE, la disciplina ${disc.toUpperCase()} per ` +
 `l'ordine ${ord.toUpperCase()} integra questi riferimenti per promuovere un ` +
 `apprendimento continuo, basato su prove e raccordato con compiti autentici e ` +
 `livelli di padronanza chiari. L'agente consiglia l'inserimento di questa ` +
 `specifica progettazione in un'Unità di Apprendimento (UDA) d'Istituto.`;

const KWL_RESPONSES: [string[], string][] = [
 [['roadmap', 'percentuali', 'allucinazione', 'volume 13', 'metric'],
  "[WikiLLM d'Istituto - Analisi del Volume 13: Audit Metrico d'Istituto]\\n\\nIn conformità al Volume 13 dell'Indagine Critica sulle percentuali e la Roadmap Reale d'Istituto (v2.0), si attesta che:\\n\\n1. **Falsa Completezza del Curricolo:** Il curricolo standard di default copre appena il **5.8%** dei 1200 obiettivi previsti dal PTOF d'Istituto. Per raggiungere il **100%**, i dipartimenti devono utilizzare il modulo di importazione CSV o il Co-pilota IA d'Istituto.\\n\\n2. **Raccordo Milestones % della Roadmap v2.0:**\\n  - **Fase 1 (Settembre 2026 - Completamento 35%):** Rilascio della Sincronizzazione Cloud automatica Google Drive / OneDrive d'Istituto per prevenire al 100% la perdita accidentale di dati.\\n  - **Fase 2 (Ottobre 2026 - Completamento 55%):** Importazione CSV massiva dei fogli Excel dei dipartimenti nel PTOF Hub, raggiungendo il 100% della densità curricolare d'Istituto coincidente con l'approvazione del PTOF da parte del Collegio dei Docenti.\\n  - **Fase 3 (Novembre 2026 - Completamento 75%):** Rilascio del Copilota IA d'Istituto tramite Gateway API leggero per supportare i docenti nella stesura delle UDA del secondo trimestre.\\n  - **Fase 4 (Gennaio 2027 - Completamento 85%):** Allineamento al bilinguismo storico del Plesso Greci con traduzioni in lingua Arbëreshë dei nuclei di Storia ed Italiano (Legge 482/1999).\\n  - **Fase 5 (Marzo 2027 - Completamento 95%):** Integrazione della libreria WebLLM (WASM) per l'esecuzione di modelli offline su computer d'aula moderni, raccordato alla conformità AgID via validatore MAUVE++.\\n  - **Fase 6 (Maggio 2027 - Completamento 100%):** Consegna dell'opera e verifica di un punteggio medio di usabilità d'Istituto **SUS Score > 85/100**.\\n\\nQuesto raccordo rigido e metrico assicura la totale trasparenza e la soppressione di allucinazioni di comodo nel sistema."],

 [['social', 'condiv', 'like', 'lessons learned', 'volume 14', 'bacheca'],
  "[WikiLLM d'Istituto - Analisi del Volume 14: Audit di Conformità UDA Social d'Istituto]\\n\\nIn conformità al Volume 14 del Second Brain, si attesta che il modulo 'Bacheca Social delle UDA Condivise d'Istituto' segue rigorose linee d'indirizzo legali, etiche e tecnologiche d'Istituto:\\n\\n1. **Tutela della Privacy (ex Art. 9 GDPR):** È tassativamente vietato inserire nomi, iniziali, sigle o riferimenti indiretti a disabilità, DSA o BES all'interno delle annotazioni e delle riflessioni sulle lezioni apprese (lessons learned). Tutte le annotazioni devono riguardare unicamente la metodologia e la didattica d'aula in forma interamente anonima d'Istituto.\\n\\n2. **Decostruzione della Like-Economy:** L'indice dei preferiti ('Mi Piace') funge esclusivamente da indicatore cooperativo d'utilità metodologica e predisposizione al riuso da parte dei colleghi, sradicato da logiche di popolarità o giudizio formale del docente d'area.\\n\\n3. **Principio del Riuso (Art. 68-69 CAD):** Il pulsante 'Riusa ed Importa' compie una duplicazione istantanea dell'UDA condivisa all'interno del proprio archivio personale del docente, raccordandola con lo store reattivo ed il database locale IndexedDB d'Istituto.\\n\\n4. **Architettura di Sincronizzazione:** Per tutelare il funzionamento offline-first, l'allineamento dei file condivisi della bacheca avviene tramite Sincronizzazione asincrona con la cartella condivisa di Google Drive / OneDrive d'Istituto."],

 [['classe', 'banchi', 'gruppi', 'cooperative', 'seating', 'volume 19'],
  "[WikiLLM d'Istituto - Analisi del Volume 19: Ambiente Classe Tematico e Apprendimento Cooperativo]\\n\\nIn conformità al Volume 19 del Second Brain d'Istituto, si attesta che il modulo 'Ambiente Classe' integra avanzate capacità spaziali e di partizione cooperativa:\\n\\n1. **De-personalizzazione Protettiva:** Gli studenti vengono rappresentati graficamente tramite pseudonimi culturali illustri (Scientists, Classico, Miti) e avatar per garantire l'anonimato assoluto davanti alla LIM d'aula scolastica, tutelando la privacy dei minori.\\n\\n2. **Seating Chart Spaziale:** Il docente può riorganizzare la disposizione fisica dei banchi simulando tre diversi asset: Lezione Frontale (File tradizionali), Isole di Lavoro (Cooperative) o Cerchio d'Ascolto (Circle Time).\\n\\n3. **Algoritmo di Apprendimento Cooperativo:** Il sistema analizza i livelli di competenza reali degli studenti (D.M. 14/2024 unificato) per ripartirli in modo eterogeneo e bilanciato in gruppi Jigsaw (con ruoli specifici come Scriba, Portavoce, Timekeeper) o coppie di Peer Tutoring (Tutor/Tutee)."],

 [['dm 14/2024', 'certificazione', 'evidenze', '14/2024'],
  "La certificazione delle competenze secondo il D.M. n. 14 del 30 gennaio 2024 introduce i nuovi modelli nazionali unificati per la Scuola Primaria e la Scuola Secondaria di Primo Grado. I descrittori sono raccordati direttamente con le 8 Competenze Chiave Europee (Raccomandazione 2018). Il nostro sistema CurManLight mappa i 4 livelli ministeriali (A - Avanzato, B - Intermedio, C - Base, D - Iniziale) collegando ciascun traguardo disciplinare a specifiche evidenze osservabili. Questo assicura che la valutazione del consiglio di classe sia ancorata a dati curricolari d'istituto solidi ed oggettivi."],

 [['dm 183/2024', 'educazione civica', 'nuclei', 'civica'],
  "Le nuove Linee Guida (D.M. 183/2024) stabiliscono la suddivisione rigida dell'insegnamento dell'Educazione Civica in 3 macro-aree: 1) Costituzione (legalità, educazione finanziaria, cultura del risparmio), 2) Sviluppo Sostenibile (educazione alla salute, transizione ecologica), 3) Cittadinanza Digitale (rischi digitali, intelligenza artificiale, bullismo). CurManLight recepisce questa tripartizione collegando i traguardi trasversali di classe alle ore annuali previste (minimo 33 ore annue). Gli Agenti di conformità verificano che le UDA interdisciplinari coprano equilibratamente i 3 assi con compiti di realtà autentici."],

 [['latino', 'lel'],
  "La riforma del D.M. 221/2025 valorizza il patrimonio linguistico storico attraverso l'introduzione sperimentale di elementi di Latino (LEL - Lingua e Elementi di Latino) a partire dalla Classe Seconda della scuola secondaria di primo grado. L'approccio stabilito nel curricolo non è grammaticale o mnemonico, ma focalizzato sul confronto interlinguistico (diacronia linguistica) con l'italiano per potenziare la competenza lessicale, la logica formale e la consapevolezza culturale dell'alunno."],

 [['tecnologia', 'coding', 'ia', 'tecnologiche'],
  "La riforma delle Nuove Indicazioni Nazionali 2025 (D.M. 221/2025) per la Tecnologia introduce due grandi pilastri operativi: 1) Lo studio etico ed algoritmico dell'Intelligenza Artificiale (I.A.), istruendo gli alunni a comprendere l'affidabilità dei dati, l'impatto sociale e i bias algoritmici (in allineamento con il DigComp 2.2); 2) Il potenziamento della progettazione e della prototipazione tridimensionale (disegno tecnico 3D e CAD) e del coding, raccordati al nostro modulo d'eccellenza regionale 'Il Fabl@b delle idee' (Scuola Viva Campania) della sede Covotta. Si integra inoltre lo studio della scienza dei materiali e della transizione energetica per la rigenerazione sostenibile."],

 [['scienze', 'scienza', 'esperiment'],
  "Nel D.M. 221/2025, le Scienze acquisiscono una forte dimensione sperimentale incentrata sul metodo galileiano e sull'apprendimento basato sulla ricerca (Inquiry-Based Science Education - IBSE). Gli alunni vengono stimolati ad analizzare i fatti e i dati della realtà per formulare ipotesi e valutarne la coerenza scientifica. Si rafforza inoltre il raccordo trasversale con lo Sviluppo Sostenibile dell'Educazione Civica (D.M. 183/2024) attraverso il progetto 'Green Cross Corner' per lo studio della biodiversità, della tutela ambientale e dell'educazione alla salute e corretti stili di vita."],

 [['storia', 'storico'],
  "La disciplina della Storia con le Nuove Indicazioni 2025 (D.M. 221/2025) focalizza lo studio della secondaria a partire dal Basso Medioevo e dalla crisi dell'Impero Romano fino alla contemporaneità. La grande novità risiede nella richiesta di sviluppare un'alfabetizzazione critica mediatica d'istituto: gli studenti devono imparare ad analizzare e verificare l'attendibilità delle fonti (cartacee e digitali), riconoscendo attivamente i fenomeni di disinformazione, manipolazione storica e fake news presenti sul web e nei social media, raccordando il pensiero critico storico con la cittadinanza digitale."],

 [['geografia', 'territorio', 'mappa'],
  "La Geografia nel D.M. 221/2025 supera la diamesione descrittiva ed enciclopedica per concentrarsi sulla geografia dei sistemi e sul rapporto uomo-ambiente. Introduce l'uso di tecnologie digitali applicate, come i sistemi di telerilevamento cartografico, GIS e mappe satellitari, per analizzare le trasformazioni territoriali. Si raccorda strettamente con la transizione ecologica d'istituto (Agenda 2030) e con l'integrazione interculturale (Plesso Greci), studiando le migrazioni, i flussi antropici e lo sviluppo sostenibile del territorio locale e globale."],

 [['verticale', 'diacronico', 'allineamento', 'continuità'],
  "L'allineamento verticale d'istituto assicura la continuità educativa tra la Scuola dell'Infanzia (Mappe di senso e campi d'esperienza), la Scuola Primaria (inizio consolidamento e saperi di base) e la Scuola Secondaria di Primo Grado (rigore critico e connessioni disciplinari). CurManLight garantisce questa verticalizzazione strutturando le 14 materie in un continuum evolutivo, in modo che ogni obiettivo della scuola media poggi sulle fondamenta gettate nella primaria."],

 [['delibera', 'collegio', 'approvazione', 'deliberazione'],
  "La delibera consiliare d'Istituto per l'adozione del Curricolo Verticale v1.5.3 e del sistema CurManLight (formalizzata nel Volume 10) costituisce l'atto formale sovrano del Collegio dei Docenti. Esso sancisce l'adozione obbligatoria della piattaforma per la programmazione annuale a decorrere dall'a.s. 2026/2027, approva lo Schema di Transizione Graduale (con l'Infanzia a regime e la Primaria/Secondaria graduale a partire dalle classi prime), e autorizza il Dirigente Scolastico ad inviare la Dichiarazione di Accessibilità AgID annuale, allegando stabilmente l'intero pacchetto formativo al PTOF d'Istituto."],
];

const KWL_KEYWORDS: [string[], string][] = [
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
 tecnologia: "La riforma delle Nuove Indicazioni Nazionali 2025 (D.M. 221/2025) per la Tecnologia introduce due grandi pilastri operativi: 1) Lo studio etico ed algoritmico dell'Intelligenza Artificiale (I.A.), istruendo gli alunni a comprendere l'affidabilità dei dati, l'impatto sociale e i bias algoritmici (in allineamento con il DigComp 2.2); 2) Il potenziamento della progettazione e della prototipazione tridimensionale (disegno tecnico 3D e CAD) e del coding, raccordati al nostro modulo d'eccellenza regionale 'Il Fabl@b delle idee' (Scuola Viva Campania) della sede Covotta. Si integra inoltre lo studio della scienza dei materiali e della transizione energetica per la rigenerazione sostenibile.",
 scienze: "Nel D.M. 221/2025, le Scienze acquisiscono una forte dimensione sperimentale incentrata sul metodo galileiano e sull'apprendimento basato sulla ricerca (Inquiry-Based Science Education - IBSE). Gli alunni vengono stimolati ad analizzare i fatti e i dati della realtà per formulare ipotesi e valutarne la coerenza scientifica. Si rafforza inoltre il raccordo trasversale con lo Sviluppo Sostenibile dell'Educazione Civica (D.M. 183/2024) attraverso il progetto 'Green Cross Corner' per lo studio della biodiversità, della tutela ambientale e dell'educazione alla salute e corretti stili di vita.",
 storia: "La disciplina della Storia con le Nuove Indicazioni 2025 (D.M. 221/2025) focalizza lo studio della secondaria a partire dal Basso Medioevo e dalla crisi dell'Impero Romano fino alla contemporaneità. La grande novità risiede nella richiesta di sviluppare un'alfabetizzazione critica mediatica d'istituto: gli studenti devono imparare ad analizzare e verificare l'attendibilità delle fonti (cartacee e digitali), riconoscendo attivamente i fenomeni di disinformazione, manipolazione storica e fake news presenti sul web e nei social media, raccordando il pensiero critico storico con la cittadinanza digitale.",
 geografia: "La Geografia nel D.M. 221/2025 supera la diamesione descrittiva ed enciclopedica per concentrarsi sulla geografia dei sistemi e sul rapporto uomo-ambiente. Introduce l'uso di tecnologie digitali applicate, come i sistemi di telerilevamento cartografico, GIS e mappe satellitari, per analizzare le trasformazioni territoriali. Si raccorda strettamente con la transizione ecologica d'istituto (Agenda 2030) e con l'integrazione interculturale (Plesso Greci), studiando le migrazioni, i flussi antropici e lo sviluppo sostenibile del territorio locale e globale.",
};

const VERTICAL_RESPONSE =
 "L'allineamento verticale d'istituto assicura la continuità educativa tra la Scuola dell'Infanzia (Mappe di senso e campi d'esperienza), la Scuola Primaria (inizio consolidamento e saperi di base) e la Scuola Secondaria di Primo Grado (rigore critico e connessioni disciplinari). CurManLight garantisce questa verticalizzazione strutturando le 14 materie in un continuum evolutivo, in modo che ogni obiettivo della scuola media poggi sulle fondamenta gettate nella primaria.";

const generateDisciplineResponse = (q: string): string | null => {
 // Check vertical keywords first (not discipline-specific)
 if (q.includes('verticale') || q.includes('diacronico') || q.includes('allineamento') || q.includes('continuità'))
  return VERTICAL_RESPONSE;

 const disc = detectDiscipline(q, '');
 return DISCIPLINE_RESPONSES[disc] ?? null;
};
