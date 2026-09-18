import type { Proposal, SchoolOrder } from '../../../types/curriculum';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from '../institute/currentSource';
import {
  TECHNOLOGY_CLASS1_REVIEW,
  TECHNOLOGY_CLASS1_REVIEW_PROPOSALS,
} from './technologyClass1Review';

export const TECHNOLOGY_CLASS2_REVIEW = {
  pilotId: 'TEC-SEC2-2026-01',
  revision: 1,
  discipline: 'tecnologia',
  order: 'secondaria' as SchoolOrder,
  targetClass: '2',
  classLabel: 'Classe seconda',
  status: 'READY_FOR_TARGETED_H2_VERTICAL_PILOT',
  humanOutcome: 'OPEN',
  canonicalPromotionAuthorized: false,
  decisionCarryForwardAuthorized: false,
  master: {
    id: 'CAN-CURR-MASTER-00',
    driveFileId: INSTITUTE_CURRICULUM_CURRENT_SOURCE.driveFileId,
    version: INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion,
  },
  annualizationSource: {
    title: 'BOZZA-CURR-TEC-01_Curricolo_verticale_Tecnologia_3-14_per_annualita_2026-2027',
    revision: '1.2',
    driveFileId: '1cCRWwvRT5Hl51DgR8SmjJb5pM-whlL1tA9xfRAwPf4Y',
  },
} as const;

const CLASS2_PRIOR_VERTICAL_LINK = 'Classe seconda: analizzare sistemi e proporre soluzioni, consolidando disegno, filiere, abitare e territorio e usando dati e modellazione in forma introduttiva.';

const CLASS2_CANONICAL_ANNUALIZATION = 'Classe II — Regime 2012 transitorio. Identità formativa: ANALIZZARE SISTEMI E PROPORRE; consolidare disegno tecnico e rappresentazione; leggere materiali, filiere, sistemi dell’abitare e del territorio; passare dall’analisi di processi/dati alla proposta di soluzioni motivate. Competenze: consolidare misura/disegno/scala; analizzare materiali e processi; leggere sistemi dell’abitare/territorio; organizzare dati; formulare proposte. Obiettivi: produrre rappresentazioni più rigorose; analizzare proprietà/cicli dei materiali; leggere processi produttivi; interpretare elementi di territorio/abitare; organizzare informazioni; progettare semplici soluzioni. Conoscenze: disegno/scala; materiali/filiere; abitare/territorio; processi; dati; sicurezza/sostenibilità. Evidenze: elaborato tecnico; analisi comparativa; schema di filiera/processo; proposta motivata. Raccordo: valutazione/progetto responsabile in III.';

const class2SourceRefs = [
  `${INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceFile} · versione ${INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion} · Drive ${INSTITUTE_CURRICULUM_CURRENT_SOURCE.driveFileId}`,
  `${TECHNOLOGY_CLASS2_REVIEW.annualizationSource.title} · revisione ${TECHNOLOGY_CLASS2_REVIEW.annualizationSource.revision} · Drive ${TECHNOLOGY_CLASS2_REVIEW.annualizationSource.driveFileId}`,
  `${TECHNOLOGY_CLASS1_REVIEW.verticalMatrix.title} · revisione ${TECHNOLOGY_CLASS1_REVIEW.verticalMatrix.revision} · Drive ${TECHNOLOGY_CLASS1_REVIEW.verticalMatrix.driveFileId}`,
];

/**
 * Primo perimetro H2 della classe seconda materializzato per il pilota verticale.
 * Non rappresenta l'approvazione dell'intera annualità: serve a produrre un secondo
 * esito professionale reale su un'unità curricolare distinta e confrontabile con
 * la classe prima, mantenendo immutato il master canonico.
 */
export const TECHNOLOGY_CLASS2_REVIEW_PROPOSALS: Proposal[] = [
  {
    id: 'tec-sec2-2026-r1-n1',
    focus: 'Analizzare sistemi e proporre: consolidare misura, disegno tecnico e scala',
    scopeLabel: 'Tecnologia · Secondaria di primo grado · Classe seconda · Pilota verticale H2',
    oldLabel: 'Formulazione di raccordo già disponibile',
    newLabel: 'Annualità canonica classe seconda da esaminare',
    keepLabel: 'Mantieni la formulazione di raccordo',
    oldText: CLASS2_PRIOR_VERTICAL_LINK,
    newText: CLASS2_CANONICAL_ANNUALIZATION,
    contextSummary: 'La scheda rende riesaminabile in H2 la classe seconda del master 1.3 senza riutilizzare schede della classe prima. Il confronto professionale riguarda il passaggio dal raccordo sintetico già documentato all’annualità canonica completa della classe seconda.',
    sourceRefs: class2SourceRefs,
    gateId: 'SEC2-TEC-VERTICAL-PILOT / ANALYZE_SYSTEMS_AND_PROPOSE',
    notes: 'Perimetro pilota mirato. Nessun carry-forward delle decisioni della classe prima, nessuna promozione automatica del master e nessun effetto sulla vigenza del curricolo.',
  },
];

export type TechnologySecondaryTargetClass = '1' | '2' | '3';

export function normalizeTechnologySecondaryTargetClass(value: string): TechnologySecondaryTargetClass | null {
  const normalized = value
    .trim()
    .toLocaleLowerCase('it-IT')
    .replace(/^classe\s+/, '')
    .replace(/\^/g, '');

  if (['1', 'i', 'prima'].includes(normalized)) return '1';
  if (['2', 'ii', 'seconda'].includes(normalized)) return '2';
  if (['3', 'iii', 'terza'].includes(normalized)) return '3';
  return null;
}

/**
 * Risolutore fail-closed delle schede H2 per Tecnologia nella secondaria.
 * Una classe non materializzata non eredita mai le schede di un'altra annualità.
 */
export function resolveClassAwareOperationalReviewProposals(
  discipline: string,
  order: SchoolOrder,
  targetClass: string,
  fallback: Proposal[],
): Proposal[] {
  const normalizedDiscipline = discipline.trim().toLocaleLowerCase('it-IT');
  if (normalizedDiscipline !== 'tecnologia' || order !== 'secondaria') return fallback;

  const normalizedClass = normalizeTechnologySecondaryTargetClass(targetClass);
  if (normalizedClass === '1') return TECHNOLOGY_CLASS1_REVIEW_PROPOSALS;
  if (normalizedClass === '2') return TECHNOLOGY_CLASS2_REVIEW_PROPOSALS;

  // Classe III non è ancora materializzata come superficie H2 in Arena.
  // Restituire [] impedisce qualunque contaminazione silenziosa con la classe I.
  return [];
}
