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
  { term: "UDA", definition: "Unit� di Apprendimento � Possibile percorso didattico interdisciplinare centrato su un tema e un prodotto finale.", source: "Glossario locale non verificato" },
  { term: "Competenza", definition: "Capacit� di utilizzare conoscenze e abilit� in contesti di vita e di studio.", source: "Glossario locale non verificato" },
  { term: "Diacronia Curricolare", definition: "Rappresentazione progressiva di saperi e obiettivi nel tempo.", source: "Glossario locale non verificato" },
  { term: "Evidenza Comportamentale", definition: "Comportamento osservabile associato localmente a un traguardo o a una competenza.", source: "Glossario locale non verificato" },
  { term: "Compito di Realt�", definition: "Situazione-problema reale o verosimile con un elaborato finale.", source: "Glossario locale non verificato" },
  { term: "Didattica Orientativa", definition: "Approccio educativo che sostiene la riflessione su interessi e possibili percorsi.", source: "Glossario locale non verificato" },
  { term: "PEI", definition: "Piano Educativo Individualizzato � Descrizione sintetica da verificare sulle fonti applicabili.", source: "Glossario locale non verificato" },
  { term: "PDP", definition: "Piano Didattico Personalizzato � Descrizione sintetica da verificare sulle fonti applicabili.", source: "Glossario locale non verificato" },
  { term: "UDL", definition: "Universal Design for Learning � Approccio metodologico orientato a percorsi flessibili.", source: "Glossario locale non verificato" },
  { term: "PTOF", definition: "Piano Triennale dell'Offerta Formativa � Definizione generale da verificare nel contesto effettivo.", source: "Glossario locale non verificato" },
  { term: "RAV", definition: "Rapporto di Autovalutazione � Definizione generale da verificare nel contesto effettivo.", source: "Glossario locale non verificato" },
  { term: "NIV", definition: "Nucleo Interno di Valutazione � Definizione generale da verificare nel contesto effettivo.", source: "Glossario locale non verificato" },
  { term: "PdM", definition: "Piano di Miglioramento � Definizione generale da verificare nel contesto effettivo.", source: "Glossario locale non verificato" },
  { term: "LEL", definition: "Lingua ed Elementi di Latino � Possibile laboratorio linguistico da verificare nel contesto effettivo.", source: "Glossario locale non verificato" }
 ];
 try {
  const saved = localStorage.getItem('curman_glossary');
  return saved ? JSON.parse(saved) : defaultGlossary;
 } catch (e) {
  console.warn("Storage read blocked by browser security policy in sandboxed preview:", e);
  return defaultGlossary;
 }
};


