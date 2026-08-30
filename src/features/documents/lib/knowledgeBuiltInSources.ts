export type BuiltInKnowledgeSource = {
  id: string;
  title: string;
  description: string;
  group: string;
  technical?: boolean;
};

export const BUILT_IN_KNOWLEDGE_SOURCES: BuiltInKnowledgeSource[] = [
  { id: 'vol4', title: 'Curricolo della scuola', description: 'Il curricolo locale disponibile in Arena.', group: 'Curricolo' },
  { id: 'vol8', title: 'Curricolo per discipline', description: 'Traguardi, obiettivi e dettaglio disciplinare.', group: 'Curricolo' },
  { id: 'vol7', title: 'Passaggio alle Indicazioni 2025', description: 'Materiali per confrontare il quadro precedente con quello nuovo.', group: 'Curricolo' },
  { id: 'vol3', title: 'Normativa e riferimenti', description: 'Riferimenti normativi, inclusione, privacy e quadro generale.', group: 'Riferimenti' },
  { id: 'vol2', title: 'Scuola e miglioramento', description: 'Materiali RAV, NIV e Piano di miglioramento.', group: 'Scuola' },
  { id: 'vol1', title: 'Progetti e territorio', description: 'Raccolta di materiali, progetti e riferimenti territoriali.', group: 'Scuola' },
  { id: 'vol6', title: 'Termini e concetti', description: 'Repertorio locale per orientarsi nel lessico curricolare.', group: 'Riferimenti' },
  { id: 'vol10', title: 'Materiali per il Collegio', description: 'Bozze e materiali di supporto alla discussione collegiale.', group: 'Processo' },
  { id: 'vol9', title: 'Accessibilità e conformità', description: 'Materiali di verifica e documentazione storica.', group: 'Riferimenti' },
  { id: 'vol5', title: 'Guida tecnica di CurManLight', description: 'Documentazione interna del sistema.', group: 'Sistema', technical: true },
  { id: 'vol11', title: 'Stato dello sviluppo', description: 'Informazioni tecniche sullo stato dell’applicazione.', group: 'Sistema', technical: true },
  { id: 'vol12', title: 'Piano tecnico di completamento', description: 'Pianificazione interna dello sviluppo.', group: 'Sistema', technical: true },
];

export const USER_VISIBLE_BUILT_IN_KNOWLEDGE_SOURCES = BUILT_IN_KNOWLEDGE_SOURCES.filter((source) => !source.technical);
