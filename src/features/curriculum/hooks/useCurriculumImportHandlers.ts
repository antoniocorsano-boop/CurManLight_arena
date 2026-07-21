import { useState } from 'react';
import type React from 'react';
import type { SchoolOrder } from '../../../types/curriculum';
import type { CurriculumMap, GeneratedKnowledgeOutput } from '../../session';
import { curriculumKB } from '../../../data/curriculumKB';

type UseCurriculumImportHandlersArgs = {
 localCurriculum: CurriculumMap;
 setLocalCurriculum: (newKB: CurriculumMap) => void;
 discipline: string;
 order: SchoolOrder;
 showToast: (msg: string, success?: boolean) => void;
};

export function useCurriculumImportHandlers({
 localCurriculum,
 setLocalCurriculum,
 discipline,
 order,
 showToast
}: UseCurriculumImportHandlersArgs) {
 const updateLocalCurriculum = (newKB: CurriculumMap) => {
  setLocalCurriculum(newKB);
  localStorage.setItem('curmanlight-custom-curriculum-v2', JSON.stringify(newKB));
 }; // States for Curriculum Management and AI Generator (Option 2 and Option 1 Hybrid)
 const [importTopicInput, setImportTopicInput] = useState("");
 const [isGeneratingKB, setIsGeneratingKb] = useState(false);
 const [generatedKBOuput, setGeneratedKbOutput] = useState<GeneratedKnowledgeOutput | null>(null);
 const [, setCsvUploadFeedback] = useState<string | null>(null);
 
 const handleAiGenerateCurriculum = () => {
  if (!importTopicInput.trim()) {
   showToast(" Inserisci un argomento o nucleo scolastico da pianificare!");
   return;
  }
  setIsGeneratingKb(true);
  setGeneratedKbOutput(null);
  setTimeout(() => {
   const topic = importTopicInput.trim();
   const newTraguardo = `L'alunno padroneggia le conoscenze essenziali e i nuclei fondanti di "${topic}", applicandoli in contesti scolastici reali d'Istituto.`;
   const newObiettivo1 = `Esplorare, definire e schematizzare i concetti chiave relativi a "${topic}" nell'anno di riferimento.`;
   const newObiettivo2 = `Analizzare in modo critico i dati e le connessioni logiche riguardanti "${topic}", elaborando semplici relazioni orali o scritti.`;
   const newEvidenza = `Espone in modo autonomo, elabora una sintesi visiva o risponde a domande complesse su "${topic}".`;
   
   setGeneratedKbOutput({
    traguardi: [newTraguardo],
    obiettivi: [newObiettivo1, newObiettivo2],
    evidenze: [newEvidenza]
   });
   setIsGeneratingKb(false);
   showToast(" Generazione completata dal Co-pilota d'Istituto!");
  }, 1200);
 };

 const handleSaveGeneratedToKB = () => {
  if (!generatedKBOuput) return;
  const updatedKB = { ...localCurriculum };
  if (!updatedKB[discipline]) {
   updatedKB[discipline] = {
    infanzia: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
    primaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] },
    secondaria: { traguardi: [], obiettivi: [], evidenze: [], proposals: [] }
   };
  }
  if (!updatedKB[discipline][order]) {
   updatedKB[discipline][order] = { traguardi: [], obiettivi: [], evidenze: [], proposals: [] };
  }
  
  updatedKB[discipline][order].traguardi.push(...generatedKBOuput.traguardi);
  updatedKB[discipline][order].obiettivi.push(...generatedKBOuput.obiettivi);
  if (!updatedKB[discipline][order].evidenze) updatedKB[discipline][order].evidenze = [];
  updatedKB[discipline][order].evidenze.push(...generatedKBOuput.evidenze);
  
  updateLocalCurriculum(updatedKB);
  setGeneratedKbOutput(null);
  setImportTopicInput("");
  showToast(" Integrazione avvenuta nel database curricolare!");
 };

 const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
   const text = event.target?.result as string;
   if (!text) return;
   try {
    const lines = text.split('\n');
    const updatedKB = { ...localCurriculum };
    let count = 0;
    const errorsList: string[] = [];

    lines.forEach((line, idx) => {
     const riga = idx + 1;
     if (idx === 0) return; // skip header
     if (!line.trim()) return; // skip empty lines

     // Implement robust RFC 4180 tokenizer to handle commas in quotes
     const parts: string[] = [];
     let currentPart = "";
     let inQuotes = false;
     for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
       inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
       parts.push(currentPart.trim());
       currentPart = "";
      } else {
       currentPart += char;
      }
     }
     parts.push(currentPart.trim());

     if (parts.length < 4) {
      errorsList.push(`Riga ${riga}: Formato non valido. Numero di colonne insufficiente (trovate ${parts.length}, attese 4).`);
      return;
     }

     const rawMat = parts[0];
     const rawOrd = parts[1];
     const rawType = parts[2];
     const rawVal = parts.slice(3).join(',').trim().replace(/^"(.*)"$/, '$1'); // Clean quotes

     const mat = rawMat.toLowerCase().trim();
     const ord = rawOrd.toLowerCase().trim() as SchoolOrder;
     const type = rawType.toLowerCase().trim();

     // Validate discipline
     if (!updatedKB[mat]) {
      errorsList.push(`Riga ${riga}: Disciplina '${rawMat}' non riconosciuta nel curricolo verticale.`);
      return;
     }

     // Validate grade order
     if (ord !== 'infanzia' && ord !== 'primaria' && ord !== 'secondaria') {
      errorsList.push(`Riga ${riga}: Grado scolastico '${rawOrd}' non valido (inserire: infanzia, primaria, secondaria).`);
      return;
     }

     // Validate type
     if (type !== 'traguardo' && type !== 'obiettivo' && type !== 'evidenza') {
      errorsList.push(`Riga ${riga}: Tipo '${rawType}' non valido (inserire: traguardo, obiettivo, evidenza).`);
      return;
     }

     // Validate non-empty value
     if (!rawVal) {
      errorsList.push(`Riga ${riga}: Contenuto della riga vuoto.`);
      return;
     }

     // Ingest with Deduplication Check (Azione II)
     const normalizeString = (str: string): string => {
      return str.toLowerCase().replace(/\s+/g, ' ').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
     };

     const listToSearch = type === 'traguardo' ? updatedKB[mat][ord].traguardi :
                type === 'obiettivo' ? updatedKB[mat][ord].obiettivi :
                (updatedKB[mat][ord].evidenze || []);
     
     const existingNormalized = listToSearch.map((item: string) => normalizeString(item));

     if (existingNormalized.includes(normalizeString(rawVal))) {
      errorsList.push(`Riga ${riga}: Duplicato sintattico rilevato e saltato nel database (Elemento giÃƒÂ  presente).`);
      return;
     }

     if (type === 'traguardo') {
      updatedKB[mat][ord].traguardi.push(rawVal);
      count++;
     } else if (type === 'obiettivo') {
      updatedKB[mat][ord].obiettivi.push(rawVal);
      count++;
     } else if (type === 'evidenza') {
      if (!updatedKB[mat][ord].evidenze) updatedKB[mat][ord].evidenze = [];
      updatedKB[mat][ord].evidenze.push(rawVal);
      count++;
     }
    });
    
    if (count > 0) {
     updateLocalCurriculum(updatedKB);
     let feedback = ` Caricamento completato con successo: integrati +${count} elementi curricolari d'Istituto.`;
     if (errorsList.length > 0) {
      feedback += `\n\n Rilevate ${errorsList.length} incongruenze scartate nel file:\n` + errorsList.join('\n');
     }
     setCsvUploadFeedback(feedback);
     showToast(`Importazione completata: +${count} elementi.`, true);
    } else {
     setCsvUploadFeedback(` Caricamento fallito. Nessun dato valido importato.\n\nErrori rilevati:\n` + (errorsList.length > 0 ? errorsList.join('\n') : "File vuoto o privo di dati formattati correttamente."));
     showToast("Importazione fallita. Controlla il faldone.", false);
    }
   } catch(err) {
    setCsvUploadFeedback(" Errore irreversibile durante la decodifica ed il parsing del file CSV.");
    showToast("Errore di decodifica CSV.", false);
   }
  };
  reader.readAsText(file);
 };

 const handleResetCurriculumToBaseline = () => {
  if (confirm("Sei sicuro di voler ripristinare il curricolo al baseline nazionale di default? Questo eliminerÃƒÂ  tutte le personalizzazioni, gli obiettivi generati con IA e i file importati.")) {
   setLocalCurriculum(curriculumKB);
   localStorage.removeItem('curmanlight-custom-curriculum-v2');
   setGeneratedKbOutput(null);
   setCsvUploadFeedback(null);
   showToast("Curricolo d'Istituto ripristinato al baseline nazionale.");
  }
 };


 return {
  importTopicInput,
  setImportTopicInput,
  isGeneratingKB,
  generatedKBOuput,
  handleAiGenerateCurriculum,
  handleSaveGeneratedToKB,
  handleCSVUpload,
  handleResetCurriculumToBaseline
 };
}