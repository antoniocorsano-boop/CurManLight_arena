import { useEffect, useState } from 'react';
import type { SchoolOrder } from '../../../types/curriculum';
import { volumesKB } from '../../../data/volumesKB';
import { safeLocalStorageGetGlossary, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';
import type { CustomKbDoc } from './useKnowledgeBaseHandlers';
import { generateWikiResponse } from '../../../lib/wikiLLM';
import { readAssistantKnowledgeView } from '../../copilot/assistantKnowledgeNavigation';
import { applyLocalRetrievalContract } from '../lib/localRetrievalContract';
import { RETRIEVAL_ELIGIBLE_BUILT_IN_SOURCE_IDS } from '../lib/knowledgeBuiltInSources';
import { isLocalKnowledgeEvidenceEligible } from '../lib/localKnowledgeStore';

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
 const requestedKnowledgeView = readAssistantKnowledgeView();
 const [wikiQuery, setWikiQuery] = useState('');
 const [secondBrainTab, setSecondBrainTab] = useState<'brain' | 'graph' | 'glossary'>(requestedKnowledgeView === 'graph' ? 'graph' : 'brain');
 const [wikiWorkspaceTab, setWikiWorkspaceTab] = useState<'read' | 'chat'>('read');
 const [wikiResponse, setWikiResponse] = useState<string | null>(null);
 const [wikiLoading, setWikiLoading] = useState(false);

 useEffect(() => {
  if (requestedKnowledgeView === 'graph') {
   setSecondBrainTab('graph');
  } else if (requestedKnowledgeView === 'source') {
   setSecondBrainTab('brain');
   setWikiWorkspaceTab('read');
  }
 }, [requestedKnowledgeView]);

 const [glossary, setGlossary] = useState<GlossaryItem[]>(() => {
  return safeLocalStorageGetGlossary();
 });
 const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState('LEL');
 const [customGlossaryTerm, setCustomGlossaryTerm] = useState('');
 const [isGlossaryLoading, setIsGlossaryLoading] = useState(false);
 const [glossarySearch, setGlossarySearch] = useState('');

 // Local retrieval processor. User uploads are evidence only after explicit local verification
 // and when extraction is complete enough for governed retrieval. Bundled material is also
 // filtered through the explicit Source Authority policy before it can participate.
 const triggerWikiLLMQuery = (query: string) => {
  if (!query || !query.trim()) return;
  setWikiQuery(query);
  setWikiLoading(true);
  setWikiResponse(null);

  setTimeout(() => {
   const evidenceEligibleCustomDocs = customKbDocs.filter(isLocalKnowledgeEvidenceEligible);
   const evidenceEligibleBuiltIns = Object.values(volumesKB)
    .filter((volume) => RETRIEVAL_ELIGIBLE_BUILT_IN_SOURCE_IDS.has(volume.id));
   const legacyResponse = generateWikiResponse({
    query,
    discipline,
    order,
    customDocs: evidenceEligibleCustomDocs,
    volumes: evidenceEligibleBuiltIns,
    getVolumeTitle: getVolumeTitleWithCustom,
   });
   const outcome = applyLocalRetrievalContract(query, legacyResponse);

   setWikiResponse(outcome.text);
   setWikiLoading(false);
   showToast(outcome.kind === 'EVIDENCE_FOUND'
    ? 'Ricerca locale completata: controlla il passaggio nella fonte.'
    : 'Nessuna evidenza sufficientemente pertinente trovata.');
  }, 1500);
 };

 const handleGlossaryAgentPopulate = (term: string) => {
  const t = term.trim();
  if (!t) return;

  if (glossary.some(g => g.term.toLowerCase() === t.toLowerCase())) {
   showToast(`Il termine "${t}" è già presente nel glossario!`, false);
   return;
  }

  setIsGlossaryLoading(true);
  showToast('Generazione locale di una definizione non verificata...');

  setTimeout(() => {
   let definition = '';
   const source = 'Fonte locale generata, non verificata';
   const q = t.toLowerCase();

   if (q === 'lel' || q.includes('latino')) {
    definition = 'Lingua ed Elementi di Latino — Laboratorio di avvicinamento al latino introdotto in classe seconda, volto a favorire la consapevolezza linguistica diacronica attraverso il confronto lessicale e semantico con l’italiano.';
   } else if (q.includes('digitale') || q.includes('cittadinanza')) {
    definition = 'Cittadinanza Digitale — Asse dell’Educazione Civica focalizzato sull’uso consapevole e responsabile delle tecnologie digitali, sulla tutela dei dati personali, e sull’analisi critica ed etica degli algoritmi e dell’I.A.';
   } else if (q.includes('verticale') || q.includes('curricolo')) {
    definition = 'Curricolo Verticale — Possibile rappresentazione continua di obiettivi e traguardi tra ordini scolastici, da verificare nel contesto effettivo.';
   } else if (q.includes('orientat') || q.includes('didattica')) {
    definition = 'Didattica Orientativa — Approccio educativo trasversale che aiuta l’alunno a scoprire le proprie attitudini, passioni e potenzialità, guidandolo nella scelta consapevole del proprio percorso scolastico e di vita.';
   } else if (q === 'pei' || q.includes('individualizzato')) {
    definition = 'Piano Educativo Individualizzato — Documento programmatorio d’inclusione redatto collegialmente per alunni con disabilità certificata (Legge 104/1992), strutturato su base ICF per valorizzare le potenzialità dell’alunno.';
   } else if (q === 'pdp' || q.includes('personalizzato')) {
    definition = 'Piano Didattico Personalizzato — Strumento di personalizzazione didattica redatto per alunni con DSA (Legge 170/2010) o altri BES, che definisce gli strumenti compensativi e le misure dispensative necessarie.';
   } else if (q.includes('udl') || q.includes('universale')) {
    definition = 'Universal Design for Learning (Progettazione Universale per l’Apprendimento) — Approccio metodologico che prevede percorsi flessibili fin dall’inizio per rispondere alle diverse esigenze di tutti gli alunni, senza barriere cognitive o fisiche.';
   } else {
    definition = `Definizione formulata dall'assistente pedagogico: "${t}" è un concetto o mediatore didattico utile a promuovere l'allineamento formativo, raccordandosi con compiti autentici di realtà e livelli di padronanza chiari.`;
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
