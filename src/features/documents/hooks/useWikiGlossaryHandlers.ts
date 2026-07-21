import { useState } from 'react';
import type { SchoolOrder } from '../../../types/curriculum';
import { volumesKB } from '../../../data/volumesKB';
import { safeLocalStorageGetGlossary, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';
import type { CustomKbDoc } from './useKnowledgeBaseHandlers';

type GlossaryItem = { term: string; definition: string; source: string };

type UseWikiGlossaryHandlersArgs = {
 discipline: string;
 order: SchoolOrder;
 customKbDocs: CustomKbDoc[];
 getVolumeTitleWithCustom: (id: string) => string;
 showToast: (msg: string, success?: boolean) => void;
};

export function useWikiGlossaryHandlers({
 discipline,
 order,
 customKbDocs,
 getVolumeTitleWithCustom,
 showToast
}: UseWikiGlossaryHandlersArgs) {
 const [wikiQuery, setWikiQuery] = useState('');
 const [secondBrainTab, setSecondBrainTab] = useState<'brain' | 'graph' | 'glossary'>('brain');
 const [wikiWorkspaceTab, setWikiWorkspaceTab] = useState<'read' | 'chat'>('read');
 const [wikiResponse, setWikiResponse] = useState<string | null>(null);
 const [wikiLoading, setWikiLoading] = useState(false);

 // Glossary States with localStorage persistence
 const [glossary, setGlossary] = useState<GlossaryItem[]>(() => {
  return safeLocalStorageGetGlossary();
 });
 const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState('LEL');
 const [customGlossaryTerm, setCustomGlossaryTerm] = useState('');
 const [isGlossaryLoading, setIsGlossaryLoading] = useState(false);
 const [glossarySearch, setGlossarySearch] = useState('');

 // Simulated WikiLLM Query Processor
 const triggerWikiLLMQuery = (query: string) => {
  if (!query || !query.trim()) return;
  setWikiQuery(query);
  setWikiLoading(true);
  setWikiResponse(null);
  
  setTimeout(() => {
   let response = "";
   const q = query.toLowerCase();
   
   let detectedDisc = discipline;
   let detectedOrd = order;

   if (q.includes("tecnologia") || q.includes("coding") || q.includes("ia") || q.includes("tecnologiche")) {
    detectedDisc = "tecnologia";
   } else if (q.includes("scienze") || q.includes("scienza") || q.includes("esperiment")) {
    detectedDisc = "scienze";
   } else if (q.includes("storia") || q.includes("storico")) {
    detectedDisc = "storia";
   } else if (q.includes("geografia") || q.includes("territorio") || q.includes("mappa")) {
    detectedDisc = "geografia";
   } else if (q.includes("latino") || q.includes("lel")) {
    detectedDisc = "latino";
   } else if (q.includes("inglese")) {
    detectedDisc = "inglese";
   } else if (q.includes("francese") || q.includes("seconda lingua")) {
    detectedDisc = "secondaLingua";
   }

   const matchingCustomDoc = customKbDocs.find(doc => 
    q.includes(doc.title.toLowerCase()) || q.includes(doc.subtitle.toLowerCase())
   );

   if (matchingCustomDoc) {
    response = `[WikiLLM d'Istituto - Analisi del Documento Caricato: ${matchingCustomDoc.title}]\n\nHo scansionato la KB d'Istituto ed ho individuato informazioni pertinenti all'interno del documento "${matchingCustomDoc.title}" (${matchingCustomDoc.subtitle}):\n\n"${matchingCustomDoc.content.slice(0, 500)}${matchingCustomDoc.content.length > 500 ? '...' : ''}"\n\nIn conformitÃƒÂ  alle disposizioni organizzative caricate, l'Agente consiglia di integrare queste linee d'indirizzo all'interno del PTOF e delle programmazioni verticali dei dipartimenti.`;
   } else if (q.includes("roadmap") || q.includes("percentuali") || q.includes("allucinazione") || q.includes("volume 13") || q.includes("metric")) {
    response = "[WikiLLM d'Istituto - Analisi del Volume 13: Audit Metrico d'Istituto]\\n\\nIn conformitÃƒÂ  al Volume 13 dell'Indagine Critica sulle percentuali e la Roadmap Reale d'Istituto (v2.0), si attesta che:\\n\\n1. **Falsa Completezza del Curricolo:** Il curricolo standard di default copre appena il **5.8%** dei 1200 obiettivi previsti dal PTOF d'Istituto. Per raggiungere il **100%**, i dipartimenti devono utilizzare il modulo di importazione CSV o il Co-pilota IA d'Istituto.\\n\\n2. **Raccordo Milestones % della Roadmap v2.0:**\\n  - **Fase 1 (Settembre 2026 - Completamento 35%):** Rilascio della Sincronizzazione Cloud automatica Google Drive / OneDrive d'Istituto per prevenire al 100% la perdita accidentale di dati.\\n  - **Fase 2 (Ottobre 2026 - Completamento 55%):** Importazione CSV massiva dei fogli Excel dei dipartimenti nel PTOF Hub, raggiungendo il 100% della densitÃƒÂ  curricolare d'Istituto coincidente con l'approvazione del PTOF da parte del Collegio dei Docenti.\\n  - **Fase 3 (Novembre 2026 - Completamento 75%):** Rilascio del Copilota IA d'Istituto tramite Gateway API leggero per supportare i docenti nella stesura delle UDA del secondo trimestre.\\n  - **Fase 4 (Gennaio 2027 - Completamento 85%):** Allineamento al bilinguismo storico del Plesso Greci con traduzioni in lingua ArbÃƒÂ«reshÃƒÂ« dei nuclei di Storia ed Italiano (Legge 482/1999).\\n  - **Fase 5 (Marzo 2027 - Completamento 95%):** Integrazione della libreria WebLLM (WASM) per l'esecuzione di modelli offline su computer d'aula moderni, raccordato alla conformitÃƒÂ  AgID via validatore MAUVE++.\\n  - **Fase 6 (Maggio 2027 - Completamento 100%):** Consegna dell'opera e verifica di un punteggio medio di usabilitÃƒÂ  d'Istituto **SUS Score > 85/100**.\\n\\nQuesto raccordo rigido e metrico assicura la totale trasparenza e la soppressione di allucinazioni di comodo nel sistema.";
   } else if (q.includes("social") || q.includes("condiv") || q.includes("like") || q.includes("lessons learned") || q.includes("volume 14") || q.includes("bacheca")) {
    response = "[WikiLLM d'Istituto - Analisi del Volume 14: Audit di ConformitÃƒÂ  UDA Social d'Istituto]\\n\\nIn conformitÃƒÂ  al Volume 14 del Second Brain, si attesta che il modulo 'Bacheca Social delle UDA Condivise d'Istituto' segue rigorose linee d'indirizzo legali, etiche e tecnologiche d'Istituto:\\n\\n1. **Tutela della Privacy (ex Art. 9 GDPR):** ÃƒË† tassativamente vietato inserire nomi, iniziali, sigle o riferimenti indiretti a disabilitÃƒÂ , DSA o BES all'interno delle annotazioni e delle riflessioni sulle lezioni apprese (lessons learned). Tutte le annotazioni devono riguardare unicamente la metodologia e la didattica d'aula in forma interamente anonima d'Istituto.\\n\\n2. **Decostruzione della Like-Economy:** L'indice dei preferiti ('Mi Piace') funge esclusivamente da indicatore cooperativo d'utilitÃƒÂ  metodologica e predisposizione al riuso da parte dei colleghi, sradicato da logiche di popolaritÃƒÂ  o giudizio formale del docente d'area.\\n\\n3. **Principio del Riuso (Art. 68-69 CAD):** Il pulsante 'Riusa ed Importa' compie una duplicazione istantanea dell'UDA condivisa all'interno del proprio archivio personale del docente, raccordandola con lo store reattivo ed il database locale IndexedDB d'Istituto.\\n\\n4. **Architettura di Sincronizzazione:** Per tutelare il funzionamento offline-first, l'allineamento dei file condivisi della bacheca avviene tramite Sincronizzazione asincrona con la cartella condivisa di Google Drive / OneDrive d'Istituto.";
   } else if (q.includes("classe") || q.includes("banchi") || q.includes("gruppi") || q.includes("cooperative") || q.includes("seating") || q.includes("volume 19")) {
    response = "[WikiLLM d'Istituto - Analisi del Volume 19: Ambiente Classe Tematico e Apprendimento Cooperativo]\\n\\nIn conformitÃƒÂ  al Volume 19 del Second Brain d'Istituto, si attesta che il modulo 'Ambiente Classe' integra avanzate capacitÃƒÂ  spaziali e di partizione cooperativa:\\n\\n1. **De-personalizzazione Protettiva:** Gli studenti vengono rappresentati graficamente tramite pseudonimi culturali illustri (Scientists, Classico, Miti) e avatar per garantire l'anonimato assoluto davanti alla LIM d'aula scolastica, tutelando la privacy dei minori.\\n\\n2. **Seating Chart Spaziale:** Il docente puÃƒÂ² riorganizzare la disposizione fisica dei banchi simulando tre diversi asset: Lezione Frontale (File tradizionali), Isole di Lavoro (Cooperative) o Cerchio d'Ascolto (Circle Time).\\n\\n3. **Algoritmo di Apprendimento Cooperativo:** Il sistema analizza i livelli di competenza reali degli studenti (D.M. 14/2024 unificato) per ripartirli in modo eterogeneo e bilanciato in gruppi Jigsaw (con ruoli specifici come Scriba, Portavoce, Timekeeper) o coppie di Peer Tutoring (Tutor/Tutee).";
   } else if (q.includes("dm 14/2024") || q.includes("certificazione") || q.includes("evidenze") || q.includes("14/2024")) {
    response = "La certificazione delle competenze secondo il D.M. n. 14 del 30 gennaio 2024 introduce i nuovi modelli nazionali unificati per la Scuola Primaria e la Scuola Secondaria di Primo Grado. I descrittori sono raccordati direttamente con le 8 Competenze Chiave Europee (Raccomandazione 2018). Il nostro sistema CurManLight mappa i 4 livelli ministeriali (A - Avanzato, B - Intermedio, C - Base, D - Iniziale) collegando ciascun traguardo disciplinare a specifiche evidenze osservabili. Questo assicura che la valutazione del consiglio di classe sia ancorata a dati curricolari d'istituto solidi ed oggettivi.";
   } else if (q.includes("dm 183/2024") || q.includes("educazione civica") || q.includes("nuclei") || q.includes("civica")) {
    response = "Le nuove Linee Guida (D.M. 183/2024) stabiliscono la suddivisione rigida dell'insegnamento dell'Educazione Civica in 3 macro-aree: 1) Costituzione (legalitÃƒÂ , educazione finanziaria, cultura del risparmio), 2) Sviluppo Sostenibile (educazione alla salute, transizione ecologica), 3) Cittadinanza Digitale (rischi digitali, intelligenza artificiale, bullismo). CurManLight recepisce questa tripartizione collegando i traguardi trasversali di classe alle ore annuali previste (minimo 33 ore annue). Gli Agenti di conformitÃƒÂ  verificano che le UDA interdisciplinari coprano equilibratamente i 3 assi con compiti di realtÃƒÂ  autentici.";
   } else if (q.includes("latino") || q.includes("lel")) {
    response = "La riforma del D.M. 221/2025 valorizza il patrimonio linguistico storico attraverso l'introduzione sperimentale di elementi di Latino (LEL - Lingua e Elementi di Latino) a partire dalla Classe Seconda della scuola secondaria di primo grado. L'approccio stabilito nel curricolo non ÃƒÂ¨ grammaticale o mnemonico, ma focalizzato sul confronto interlinguistico (diacronia linguistica) con l'italiano per potenziare la competenza lessicale, la logica formale e la consapevolezza culturale dell'alunno.";
   } else if (q.includes("tecnologia") || q.includes("coding") || q.includes("ia") || q.includes("tecnologiche")) {
    response = "La riforma delle Nuove Indicazioni Nazionali 2025 (D.M. 221/2025) per la Tecnologia introduce due grandi pilastri operativi: 1) Lo studio etico ed algoritmico dell'Intelligenza Artificiale (I.A.), istruendo gli alunni a comprendere l'affidabilitÃƒÂ  dei dati, l'impatto sociale e i bias algoritmici (in allineamento con il DigComp 2.2); 2) Il potenziamento della progettazione e della prototipazione tridimensionale (disegno tecnico 3D e CAD) e del coding, raccordati al nostro modulo d'eccellenza regionale 'Il Fabl@b delle idee' (Scuola Viva Campania) della sede Covotta. Si integra inoltre lo studio della scienza dei materiali e della transizione energetica per la rigenerazione sostenibile.";
   } else if (q.includes("scienze") || q.includes("scienza") || q.includes("esperiment")) {
    response = "Nel D.M. 221/2025, le Scienze acquisiscono una forte dimensione sperimentale incentrata sul metodo galileiano e sull'apprendimento basato sulla ricerca (Inquiry-Based Science Education - IBSE). Gli alunni vengono stimolati ad analizzare i fatti e i dati della realtÃƒÂ  per formulare ipotesi e valutarne la coerenza scientifica. Si rafforza inoltre il raccordo trasversale con lo Sviluppo Sostenibile dell'Educazione Civica (D.M. 183/2024) attraverso il progetto 'Green Cross Corner' per lo studio della biodiversitÃƒÂ , della tutela ambientale e dell'educazione alla salute e corretti stili di vita.";
   } else if (q.includes("storia") || q.includes("storico")) {
    response = "La disciplina della Storia con le Nuove Indicazioni 2025 (D.M. 221/2025) focalizza lo studio della secondaria a partire dal Basso Medioevo e dalla crisi dell'Impero Romano fino alla contemporaneitÃƒÂ . La grande novitÃƒÂ  risiede nella richiesta di sviluppare un'alfabetizzazione critica mediatica d'istituto: gli studenti devono imparare ad analizzare e verificare l'attendibilitÃƒÂ  delle fonti (cartacee e digitali), riconoscendo attivamente i fenomeni di disinformazione, manipolazione storica e fake news presenti sul web e nei social media, raccordando il pensiero critico storico con la cittadinanza digitale.";
   } else if (q.includes("geografia") || q.includes("territorio") || q.includes("mappa")) {
    response = "La Geografia nel D.M. 221/2025 supera la diamesione descrittiva ed enciclopedica per concentrarsi sulla geografia dei sistemi e sul rapporto uomo-ambiente. Introduce l'uso di tecnologie digitali applicate, come i sistemi di telerilevamento cartografico, GIS e mappe satellitari, per analizzare le trasformazioni territoriali. Si raccorda strettamente con la transizione ecologica d'istituto (Agenda 2030) e con l'integrazione interculturale (Plesso Greci), studiando le migrazioni, i flussi antropici e lo sviluppo sostenibile del territorio locale e globale.";
   } else if (q.includes("verticale") || q.includes("diacronico") || q.includes("allineamento") || q.includes("continuitÃƒÂ ")) {
    response = "L'allineamento verticale d'istituto assicura la continuitÃƒÂ  educativa tra la Scuola dell'Infanzia (Mappe di senso e campi d'esperienza), la Scuola Primaria (inizio consolidamento e saperi di base) e la Scuola Secondaria di Primo Grado (rigore critico e connessioni disciplinari). CurManLight garantisce questa verticalizzazione strutturando le 14 materie in un continuum evolutivo, in modo che ogni obiettivo della scuola media poggi sulle fondamenta gettate nella primaria.";
   } else if (q.includes("delibera") || q.includes("collegio") || q.includes("approvazione") || q.includes("deliberazione")) {
    response = "La delibera consiliare d'Istituto per l'adozione del Curricolo Verticale v1.5.3 e del sistema CurManLight (formalizzata nel Volume 10) costituisce l'atto formale sovrano del Collegio dei Docenti. Esso sancisce l'adozione obbligatoria della piattaforma per la programmazione annuale a decorrere dall'a.s. 2026/2027, approva lo Schema di Transizione Graduale (con l'Infanzia a regime e la Primaria/Secondaria graduale a partire dalle classi prime), e autorizza il Dirigente Scolastico ad inviare la Dichiarazione di AccessibilitÃƒÂ  AgID annuale, allegando stabilmente l'intero pacchetto formativo al PTOF d'Istituto.";
   } else {
    // Declare and check custom loaded documents in real-time
    const matchingCustomDoc = customKbDocs.find(doc => 
     q.includes(doc.title.toLowerCase()) || q.includes(doc.subtitle.toLowerCase())
    );

    if (matchingCustomDoc) {
     response = `[WikiLLM d'Istituto - Analisi del Documento Caricato: ${matchingCustomDoc.title}]\n\nHo scansionato la KB d'Istituto ed ho individuato informazioni pertinenti all'interno del documento "${matchingCustomDoc.title}" (${matchingCustomDoc.subtitle}):\n\n"${matchingCustomDoc.content.slice(0, 500)}${matchingCustomDoc.content.length > 500 ? '...' : ''}"\n\nIn conformitÃƒÂ  alle disposizioni organizzative caricate, l'Agente consiglia di integrare queste linee d'indirizzo all'interno del PTOF e delle programmazioni verticali dei dipartimenti.`;
    } else {
     // Real In-Browser Semantic Search Fallback Engine
     const searchTerms = q.split(/\s+/).filter(t => t.length > 2);
     let bestVolId = 'vol4';
     let maxScore = 0;
     let matchedParagraph = "";

     const allVols = [
      ...Object.values(volumesKB),
      ...customKbDocs.map(d => ({ id: d.id, title: d.title, text: d.content }))
     ];

     allVols.forEach(vol => {
      const text = vol.text.toLowerCase();
      let score = 0;
      searchTerms.forEach(term => {
       const regex = new RegExp(term, 'g');
       const count = (text.match(regex) || []).length;
       score += count;
      });

      if (score > maxScore) {
       maxScore = score;
       bestVolId = vol.id;
       const paragraphs = vol.text.split('\n');
       const matchPara = paragraphs.find(p => 
        searchTerms.some(t => p.toLowerCase().includes(t))
       );
       matchedParagraph = matchPara ? matchPara.slice(0, 450) + "..." : vol.text.slice(0, 450) + "...";
      }
     });

     if (maxScore > 1) {
      response = `[WikiLLM d'Istituto - Analisi Semantica Real-time del Volume: ${getVolumeTitleWithCustom(bestVolId)}]\n\nHo scansionato l'intera Banca Dati d'Istituto ed ho individuato corrispondenze ad alta densitÃƒÂ  nel volume "${getVolumeTitleWithCustom(bestVolId)}":\n\n"${matchedParagraph}"\n\nL'Agente consiglia l'inserimento di questa specifica progettazione in un'UnitÃƒÂ  di Apprendimento (UDA) d'Istituto.`;
     } else {
      response = `La tua richiesta riguardante "${query}" ÃƒÂ¨ stata elaborata con successo dall'archivio semantico di CurManLight. In conformitÃƒÂ  con le linee guida d'Istituto (Codice Meccanografico AVIC849003) ed il Profilo dello Studente raccordato alle raccomandazioni UE, la disciplina ${detectedDisc.toUpperCase()} per l'ordine ${detectedOrd.toUpperCase()} integra questi riferimenti per promuovere un apprendimento continuo, basato su prove e raccordato con compiti autentici e livelli di padronanza chiari. L'agente consiglia l'inserimento di questa specifica progettazione in un'UnitÃƒÂ  di Apprendimento (UDA) d'Istituto.`;
     }
    }
   }
   
   setWikiResponse(response);
   setWikiLoading(false);
   showToast("Risposta WikiLLM generata!");
  }, 1500);
 };

 // AI Glossary Agent Processor
 const handleGlossaryAgentPopulate = (term: string) => {
  const t = term.trim();
  if (!t) return;
  
  // Check if term already exists
  if (glossary.some(g => g.term.toLowerCase() === t.toLowerCase())) {
   showToast(`Il termine "${t}" ÃƒÂ¨ giÃƒÂ  presente nel glossario!`, false);
   return;
  }

  setIsGlossaryLoading(true);
  showToast(" L'Agente Pedagogico sta analizzando e formulando la definizione...");

  setTimeout(() => {
   let definition = "";
   let source = "Agente Pedagogico d'Istituto";
   const q = t.toLowerCase();

   if (q === "lel" || q.includes("latino")) {
    definition = "Lingua ed Elementi di Latino Ã¢â‚¬â€ Laboratorio di avvicinamento al latino introdotto in classe seconda, volto a favorire la consapevolezza linguistica diacronica attraverso il confronto lessicale e semantico con l'italiano.";
    source = "D.M. 221/2025 d'Istituto";
   } else if (q.includes("digitale") || q.includes("cittadinanza")) {
    definition = "Cittadinanza Digitale Ã¢â‚¬â€ Asse dell'Educazione Civica focalizzato sull'uso consapevole e responsabile delle tecnologie digitali, sulla tutela dei dati personali, e sull'analisi critica ed etica degli algoritmi e dell'I.A.";
    source = "D.M. 183/2024 d'Istituto";
   } else if (q.includes("verticale") || q.includes("curricolo")) {
    definition = "Curricolo Verticale Ã¢â‚¬â€ Mappa continua degli obiettivi d'apprendimento e dei traguardi dai 3 ai 14 anni d'etÃƒÂ , che assicura la coerenza formativa tra i plessi d'infanzia, primaria e secondaria.";
    source = "Commissione Curricolo AVIC849003";
   } else if (q.includes("orientat") || q.includes("didattica")) {
    definition = "Didattica Orientativa Ã¢â‚¬â€ Approccio educativo trasversale che aiuta l'alunno a scoprire le proprie attitudini, passioni e potenzialitÃƒÂ , guidandolo nella scelta consapevole del proprio percorso scolastico e di vita.";
    source = "Linee Guida Orientamento 2022";
   } else if (q === "pei" || q.includes("individualizzato")) {
    definition = "Piano Educativo Individualizzato Ã¢â‚¬â€ Documento programmatorio d'inclusione redatto collegialmente per alunni con disabilitÃƒÂ  certificata (Legge 104/1992), strutturato su base ICF per valorizzare le potenzialitÃƒÂ  dell'alunno.";
    source = "D.M. 182/2020";
   } else if (q === "pdp" || q.includes("personalizzato")) {
    definition = "Piano Didattico Personalizzato Ã¢â‚¬â€ Strumento di personalizzazione didattica redatto per alunni con DSA (Legge 170/2010) o altri BES, che definisce gli strumenti compensativi e le misure dispensative necessarie.";
    source = "Legge 170/2010";
   } else if (q.includes("udl") || q.includes("universale")) {
    definition = "Universal Design for Learning (Progettazione Universale per l'Apprendimento) Ã¢â‚¬â€ Approccio metodologico che prevede percorsi flessibili fin dall'inizio per rispondere alle diverse esigenze di tutti gli alunni, senza barriere cognitive o fisiche.";
    source = "Linee Guida Europee UDL";
   } else {
    definition = `Definizione formulata dall'Agente Pedagogico: "${t}" ÃƒÂ¨ inteso nel curricolo d'Istituto (Codice Meccanografico AVIC849003) come concetto o mediatore didattico atto a promuovere l'allineamento formativo, raccordandosi con compiti autentici di realtÃƒÂ  e livelli di padronanza chiari in conformitÃƒÂ  con le direttive ministeriali.`;
   }

   const updated = [...glossary, { term: t, definition, source }];
   setGlossary(updated);
   safeLocalStorageSetItem('curman_glossary', JSON.stringify(updated));
   setIsGlossaryLoading(false);
   setCustomGlossaryTerm('');
   showToast(`Termine "${t}" aggiunto con successo dal Co-Pilota d'Istituto!`, true);
  }, 1500);
 };


 return {
  wikiQuery,
  setWikiQuery,
  secondBrainTab,
  setSecondBrainTab,
  wikiWorkspaceTab,
  setWikiWorkspaceTab,
  wikiResponse,
  wikiLoading,
  glossary,
  selectedGlossaryTerm,
  setSelectedGlossaryTerm,
  customGlossaryTerm,
  setCustomGlossaryTerm,
  isGlossaryLoading,
  glossarySearch,
  setGlossarySearch,
  triggerWikiLLMQuery,
  handleGlossaryAgentPopulate
 };
}