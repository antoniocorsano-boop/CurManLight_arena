import { useState } from 'react';
import type { SchoolOrder } from '../../../types/curriculum';
import { volumesKB } from '../../../data/volumesKB';
import { safeLocalStorageGetGlossary, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';
import type { CustomKbDoc } from './useKnowledgeBaseHandlers';
import { generateWikiResponse } from '../../../lib/wikiLLM';

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
   const response = generateWikiResponse({
    query,
    discipline,
    order,
    customDocs: customKbDocs,
    volumes: Object.values(volumesKB),
    getVolumeTitle: getVolumeTitleWithCustom,
   });
   
   setWikiResponse(response);
   setWikiLoading(false);
  showToast("Risposta locale generata; contenuto non verificato.");
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
  showToast("Generazione locale di una definizione non verificata...");

  setTimeout(() => {
   let definition = "";
     const source = "Fonte locale generata, non verificata";
   const q = t.toLowerCase();

   if (q === "lel" || q.includes("latino")) {
    definition = "Lingua ed Elementi di Latino Ã¢â‚¬â€ Laboratorio di avvicinamento al latino introdotto in classe seconda, volto a favorire la consapevolezza linguistica diacronica attraverso il confronto lessicale e semantico con l'italiano.";
   } else if (q.includes("digitale") || q.includes("cittadinanza")) {
    definition = "Cittadinanza Digitale Ã¢â‚¬â€ Asse dell'Educazione Civica focalizzato sull'uso consapevole e responsabile delle tecnologie digitali, sulla tutela dei dati personali, e sull'analisi critica ed etica degli algoritmi e dell'I.A.";
   } else if (q.includes("verticale") || q.includes("curricolo")) {
     definition = "Curricolo Verticale Ã¢â‚¬â€ Possibile rappresentazione continua di obiettivi e traguardi tra ordini scolastici, da verificare nel contesto effettivo.";
   } else if (q.includes("orientat") || q.includes("didattica")) {
    definition = "Didattica Orientativa Ã¢â‚¬â€ Approccio educativo trasversale che aiuta l'alunno a scoprire le proprie attitudini, passioni e potenzialitÃƒÂ , guidandolo nella scelta consapevole del proprio percorso scolastico e di vita.";
   } else if (q === "pei" || q.includes("individualizzato")) {
    definition = "Piano Educativo Individualizzato Ã¢â‚¬â€ Documento programmatorio d'inclusione redatto collegialmente per alunni con disabilitÃƒÂ  certificata (Legge 104/1992), strutturato su base ICF per valorizzare le potenzialitÃƒÂ  dell'alunno.";
   } else if (q === "pdp" || q.includes("personalizzato")) {
    definition = "Piano Didattico Personalizzato Ã¢â‚¬â€ Strumento di personalizzazione didattica redatto per alunni con DSA (Legge 170/2010) o altri BES, che definisce gli strumenti compensativi e le misure dispensative necessarie.";
   } else if (q.includes("udl") || q.includes("universale")) {
    definition = "Universal Design for Learning (Progettazione Universale per l'Apprendimento) Ã¢â‚¬â€ Approccio metodologico che prevede percorsi flessibili fin dall'inizio per rispondere alle diverse esigenze di tutti gli alunni, senza barriere cognitive o fisiche.";
   } else {
     definition = `Definizione formulata dall'assistente pedagogico: "${t}" ÃƒÂ¨ un concetto o mediatore didattico utile a promuovere l'allineamento formativo, raccordandosi con compiti autentici di realtÃƒÂ  e livelli di padronanza chiari.`;
   }

   const updated = [...glossary, { term: t, definition, source }];
   setGlossary(updated);
   safeLocalStorageSetItem('curman_glossary', JSON.stringify(updated));
   setIsGlossaryLoading(false);
   setCustomGlossaryTerm('');
   showToast(`Termine "${t}" aggiunto localmente con definizione non verificata.`, true);
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
