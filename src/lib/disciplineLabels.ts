import { useCurriculumStore } from '../store/useCurriculumStore';
import type { SchoolOrder } from '../types/curriculum';

// Order Labels mapping
export const orderLabelsForMap: Record<string, string> = {
 infanzia: "Scuola dell'Infanzia (Mappe di Senso & Campi d'Esperienza)",
 primaria: "Scuola Primaria (Inizio Consolidamento & Saperi di Base)",
 secondaria: "Scuola Sec. di I Grado (Rigore Critico & Connessioni)"
};

// Discipline Accordion Icon Helper (Defined at file level)
export const getDisciplineIcon = (_disc: string) => {
 return ""; // Rimozione completa delle emoji dall'intera applicazione per un'estetica sobria ed istituzionale
};

// Discipline Label Helper (Defined at file level)
export const getDisciplineLabel = (disc: string, ord?: SchoolOrder) => {
 const finalOrd = ord || useCurriculumStore.getState().order;
 if (finalOrd === 'infanzia') {
  const infanziaLabels: Record<string, string> = {
   italiano: "I discorsi e le parole (Linguaggio, Comunicazione, Pregrafismo)",
   inglese: "I discorsi e le parole (L2)",
   secondaLingua: "I discorsi e le parole (L3)",
   matematica: "La conoscenza del mondo (Logica, Spazio, Tempo, Numeri, Natura)",
   scienze: "La conoscenza del mondo (Natura/Scienze)",
   tecnologia: "La conoscenza del mondo (Tecnologia/Coding)",
   arteImmagine: "Immagini, suoni, colori (Arte, Musica, Teatro)",
   musica: "Immagini, suoni, colori (Musica)",
   educazioneFisica: "Il corpo e il movimento (Schemi motori, CorporalitÃ , Salute)",
   educazioneCivica: "Il sÃ© e l'altro (Relazioni, Regole, Cittadinanza, IdentitÃ )",
   religione: "Il sÃ© e l'altro (IRC)",
   storia: "La conoscenza del mondo (Tempo)",
   geografia: "La conoscenza del mondo (Spazio)",
   latino: "La conoscenza del mondo (Origini)"
  };
  return infanziaLabels[disc] || disc;
 }

 const labels: Record<string, string> = {
  italiano: "Italiano", matematica: "Matematica", scienze: "Scienze", tecnologia: "Tecnologia",
  storia: "Storia", geografia: "Geografia", inglese: "Inglese", secondaLingua: "Seconda Lingua Comunitaria",
  arteImmagine: "Arte e Immagine", musica: "Musica", educazioneFisica: "Educazione Fisica",
  educazioneCivica: "Educazione Civica", religione: "Religione / Alt.", latino: "Latino (LEL)"
 };
 return labels[disc] || disc;
};


