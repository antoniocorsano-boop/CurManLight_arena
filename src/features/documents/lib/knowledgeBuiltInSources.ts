import type { KnowledgeAuthorityClass } from './localKnowledgeStore';

export type BuiltInKnowledgeSource = {
  id: string;
  title: string;
  description: string;
  group: string;
  authorityClass: KnowledgeAuthorityClass;
  retrievalEligible: boolean;
  technical?: boolean;
};

export const BUILT_IN_KNOWLEDGE_SOURCES: BuiltInKnowledgeSource[] = [
  { id: 'vol4', title: 'Curricolo della scuola', description: 'Il curricolo locale disponibile in Arena.', group: 'Curricolo', authorityClass: 'ARCHIVED_REFERENCE', retrievalEligible: true },
  { id: 'vol8', title: 'Curricolo per discipline', description: 'Traguardi, obiettivi e dettaglio disciplinare.', group: 'Curricolo', authorityClass: 'ARCHIVED_REFERENCE', retrievalEligible: true },
  { id: 'vol7', title: 'Passaggio alle Indicazioni 2025', description: 'Materiali per confrontare il quadro precedente con quello nuovo.', group: 'Curricolo', authorityClass: 'ARCHIVED_REFERENCE', retrievalEligible: true },
  { id: 'vol3', title: 'Normativa e riferimenti', description: 'Riferimenti normativi, inclusione, privacy e quadro generale.', group: 'Riferimenti', authorityClass: 'ARCHIVED_REFERENCE', retrievalEligible: true },
  { id: 'vol2', title: 'Scuola e miglioramento', description: "Materiali RAV, NIV e Piano di miglioramento d'Istituto (PdM).", group: 'Scuola', authorityClass: 'ARCHIVED_REFERENCE', retrievalEligible: true },
  { id: 'vol1', title: 'Progetti e territorio', description: 'Raccolta di materiali, progetti e riferimenti territoriali.', group: 'Scuola', authorityClass: 'ARCHIVED_REFERENCE', retrievalEligible: true },
  { id: 'vol6', title: 'Termini e concetti', description: 'Repertorio locale per orientarsi nel lessico curricolare.', group: 'Riferimenti', authorityClass: 'DERIVED', retrievalEligible: false },
  { id: 'vol10', title: 'Materiali per il Collegio', description: 'Bozze e materiali di supporto alla discussione collegiale.', group: 'Processo', authorityClass: 'DERIVED', retrievalEligible: false },
  { id: 'vol9', title: 'Accessibilità e conformità', description: 'Materiali di verifica e documentazione storica.', group: 'Riferimenti', authorityClass: 'ARCHIVED_REFERENCE', retrievalEligible: true },
  { id: 'vol5', title: 'Guida tecnica di CurManLight', description: 'Documentazione interna del sistema.', group: 'Sistema', authorityClass: 'DERIVED', retrievalEligible: false, technical: true },
  { id: 'vol11', title: 'Stato dello sviluppo', description: 'Informazioni tecniche sullo stato dell’applicazione.', group: 'Sistema', authorityClass: 'DERIVED', retrievalEligible: false, technical: true },
  { id: 'vol12', title: 'Piano tecnico di completamento', description: 'Pianificazione interna dello sviluppo.', group: 'Sistema', authorityClass: 'DERIVED', retrievalEligible: false, technical: true },
];

export const USER_VISIBLE_BUILT_IN_KNOWLEDGE_SOURCES = BUILT_IN_KNOWLEDGE_SOURCES.filter((source) => !source.technical);

export const RETRIEVAL_ELIGIBLE_BUILT_IN_SOURCE_IDS = new Set(
  BUILT_IN_KNOWLEDGE_SOURCES.filter((source) => source.retrievalEligible).map((source) => source.id),
);

export function getBuiltInKnowledgeSource(id: string): BuiltInKnowledgeSource | undefined {
  return BUILT_IN_KNOWLEDGE_SOURCES.find((source) => source.id === id);
}

export function describeKnowledgeAuthorityClass(authorityClass: KnowledgeAuthorityClass): string {
  switch (authorityClass) {
    case 'NORMATIVE': return 'normativa verificata';
    case 'INSTITUTIONAL': return 'istituzionale verificata';
    case 'LOCAL': return 'locale';
    case 'ARCHIVED_REFERENCE': return 'archivio di riferimento';
    case 'DERIVED': return 'materiale derivato';
  }
}
