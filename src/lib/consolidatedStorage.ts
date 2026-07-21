// Consolidated State Key d'Istituto
export const CONSOLIDATED_STATE_KEY = 'curmanlight_stato_consolidato';

export const safeLocalStorageGetItem = (key: string, defaultValue: string): string => {
 try {
  const consolidated = localStorage.getItem(CONSOLIDATED_STATE_KEY);
  if (consolidated) {
   const state = JSON.parse(consolidated);
   if (state && state[key] !== undefined) {
    return state[key];
   }
  }
  return localStorage.getItem(key) || defaultValue;
 } catch (e) {
  console.warn("Storage read blocked by browser security policy in sandboxed preview:", e);
  return defaultValue;
 }
};

// Safe LocalStorage Set Item helper
export const safeLocalStorageSetItem = (key: string, value: string): void => {
 try {
  let state: Record<string, string> = {};
  const consolidated = localStorage.getItem(CONSOLIDATED_STATE_KEY);
  if (consolidated) {
   try {
    state = JSON.parse(consolidated);
   } catch(err) {
    state = {};
   }
  }
  state[key] = value;
  localStorage.setItem(CONSOLIDATED_STATE_KEY, JSON.stringify(state));
  localStorage.setItem(key, value);
 } catch (e) {
  console.warn("Storage write blocked by browser security policy in sandboxed preview:", e);
 }
};

// Safe LocalStorage Remove Item helper
export const safeLocalStorageRemoveItem = (key: string): void => {
 try {
  const consolidated = localStorage.getItem(CONSOLIDATED_STATE_KEY);
  if (consolidated) {
   try {
    const state = JSON.parse(consolidated);
    if (state) {
     delete state[key];
     localStorage.setItem(CONSOLIDATED_STATE_KEY, JSON.stringify(state));
    }
   } catch(err) {}
  }
  localStorage.removeItem(key);
 } catch (e) {
  console.warn("Storage delete blocked by browser security policy in sandboxed preview:", e);
 }
};

// Safe LocalStorage Get Glossary helper
export const safeLocalStorageGetGlossary = (): { term: string; definition: string; source: string }[] => {
 const defaultGlossary = [
  { term: "UDA", definition: "Unità di Apprendimento — Un percorso didattico interdisciplinare centrato su un tema reale, che culmina in un compito di realtà (prodotto concreto) e mira allo sviluppo di competenze specifiche, raccordate con prove osservabili.", source: "Insegnamento d'Istituto" },
  { term: "Competenza", definition: "Capacità dimostrata dall'alunno di utilizzare le proprie conoscenze, abilità e doti personali in contesti reali di vita e di studio, sia in autonomia che in collaborazione.", source: "Raccomandazione UE 2018" },
  { term: "Diacronia Curricolare", definition: "L'allineamento continuo e progressivo dei saperi e degli obiettivi nel tempo (verticalizzazione), assicurando che il percorso educativo dai 3 ai 14 anni sia coerente e senza salti cognitivi.", source: "D.M. 221/2025" },
  { term: "Evidenza Comportamentale", definition: "Un comportamento concreto, misurabile e osservabile manifestato dall'alunno durante lo svolgimento delle attività scolastiche, utilizzato come prova oggettiva per certificare il raggiungimento di un livello di competenza.", source: "D.M. 14/2024" },
  { term: "Compito di Realtà", definition: "Una situazione-problema reale o verosimile che gli studenti sono chiamati a risolvere applicando le conoscenze e abilità acquisite, producendo un elaborato finale concreto.", source: "D. Lgs. 62/2017" },
  { term: "Didattica Orientativa", definition: "Approccio educativo trasversale che aiuta l'alunno a scoprire le proprie attitudini, interessi, passioni e limiti, guidandolo nella scelta consapevole del proprio percorso di vita.", source: "Linee Guida Orientamento" },
  { term: "PEI", definition: "Piano Educativo Individualizzato — Documento programmatorio d'inclusione redatto collegialmente per alunni con disabilità certificata (Legge 104/1992) strutturato su base ICF.", source: "D.M. 182/2020" },
  { term: "PDP", definition: "Piano Didattico Personalizzato — Strumento di personalizzazione didattica redatto per alunni con DSA (Legge 170/2010) o altri BES, che definisce gli strumenti compensativi e dispensativi necessari.", source: "Legge 170/2010" },
  { term: "UDL", definition: "Universal Design for Learning (Progettazione Universale per l'Apprendimento) — Approccio metodologico che prevede la progettazione di percorsi flessibili fin dall'inizio per rispondere a tutti gli alunni.", source: "Linee Guida UDL" },
  { term: "PTOF", definition: "Piano Triennale dell'Offerta Formativa — Il documento fondamentale costitutivo dell'identità culturale e progettuale d'Istituto che esplicita la pianificazione curricolare ed organizzativa.", source: "Legge 107/2015" },
  { term: "RAV", definition: "Rapporto di Autovalutazione — Il rapporto elettronico compilato dal NIV che fornisce una fotografia oggettiva d'Istituto, individuando punti di forza e debolezza su esiti e processi.", source: "D.P.R. 80/2013" },
  { term: "NIV", definition: "Nucleo Interno di Valutazione — Il gruppo di lavoro d'Istituto presieduto dal DS, responsabile dell'autovalutazione, elaborazione del PdM e della Rendicontazione Sociale.", source: "Insegnamento d'Istituto" },
  { term: "PdM", definition: "Piano di Miglioramento — Il documento di pianificazione strategica triennale correlato al RAV in cui si esplicitano le priorità e gli obiettivi di processo d'Istituto.", source: "D.P.R. 80/2013" },
  { term: "LEL", definition: "Lingua ed Elementi di Latino — Modulo sperimentale di avviamento linguistico introdotto in Classe Seconda della secondaria di primo grado, focalizzato sulla diacronia linguistica.", source: "D.M. 221/2025 d'Istituto" }
 ];
 try {
  const saved = localStorage.getItem('curman_glossary');
  return saved ? JSON.parse(saved) : defaultGlossary;
 } catch (e) {
  console.warn("Storage read blocked by browser security policy in sandboxed preview:", e);
  return defaultGlossary;
 }
};


