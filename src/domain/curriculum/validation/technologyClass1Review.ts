import type { Proposal, SchoolOrder } from '../../../types/curriculum';

export const TECHNOLOGY_CLASS1_REVIEW = {
  pilotId: 'TEC-SEC1-2026-01',
  discipline: 'tecnologia',
  order: 'secondaria' as SchoolOrder,
  classLabel: 'Classe prima',
  status: 'READY_FOR_HUMAN_DISCIPLINE_REVIEW',
  humanOutcome: 'OPEN',
  canonicalPromotionAuthorized: false,
  source: {
    title: 'CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx',
    driveFileId: '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf',
  },
  proposal: {
    title: 'PROP-CURR-SEC1-TEC-1_Tecnologia_classe_prima_revisione_curricolare_da_validare_2026-2027.docx',
    driveFileId: '19nPCsAj_ItBscUwwcHwrVhxDbBy-MXIJ',
  },
  verticalMatrix: {
    title: 'MATR-CURR-TEC-T01_Raccordo_transitorio_Tecnologia_2026-2027.docx',
    driveFileId: '1CMSESN73HCi_2jM_tZYhN9hd6oWzyHgK',
  },
  validationGate: {
    title: 'VAL-CURR-SEC1-01_Scheda_validazione_Dipartimenti_Secondaria_Classe_Prima_2026-2027',
    driveFileId: '1rxKy2IDD5V7l4Nc1LfJeLr407ltfa_vbt_EFK54s7mU',
  },
  decisionRegister: {
    title: 'DEC-CURR-SEC1-00_Registro_decisioni_validazione_Secondaria_Classe_Prima_2026-2027',
    driveFileId: '1KmnrgWrNxVDUjOvdPo0oibqTvr1lQ72QepBE8KNsdZA',
  },
} as const;

const commonSourceRefs = [
  `${TECHNOLOGY_CLASS1_REVIEW.source.title} · Drive ${TECHNOLOGY_CLASS1_REVIEW.source.driveFileId}`,
  `${TECHNOLOGY_CLASS1_REVIEW.proposal.title} · Drive ${TECHNOLOGY_CLASS1_REVIEW.proposal.driveFileId}`,
  `${TECHNOLOGY_CLASS1_REVIEW.validationGate.title} · Drive ${TECHNOLOGY_CLASS1_REVIEW.validationGate.driveFileId}`,
];

export const TECHNOLOGY_CLASS1_REVIEW_PROPOSALS: Proposal[] = [
  {
    id: 'tec-sec1-2026-n1',
    focus: 'Osservare, misurare e rappresentare',
    scopeLabel: 'Tecnologia · Secondaria di primo grado · Classe prima',
    oldLabel: 'Fonte corrente',
    newLabel: 'Proposta da validare',
    keepLabel: 'Mantieni fonte corrente',
    oldText: 'Osservare oggetti, materiali e strumenti presenti nell’ambiente scolastico e quotidiano, riconoscendone caratteristiche e funzioni; esplorare materiali con semplici attività e misurazioni; rappresentare oggetti, ambienti e percorsi mediante disegni, schemi e modelli elementari.',
    newText: 'Analizzare oggetti semplici riconoscendo bisogno, funzione, parti, materiali, uso e rischi; effettuare misure; svolgere semplici prove comparative; utilizzare gli strumenti del disegno tecnico e realizzare costruzioni geometriche di base; raccogliere e rappresentare informazioni tecniche elementari.',
    contextSummary: 'La fonte corretta conserva una formulazione molto elementare. La proposta porta la classe prima della secondaria verso osservazione tecnica, misura, prove e disegno tecnico, senza presentare l’annualizzazione come trascrizione letterale nazionale.',
    sourceRefs: commonSourceRefs,
    gateId: 'SEC1-05 / TECHNOLOGY_REWORK',
    notes: 'Da verificare anche l’ampiezza dei materiali e delle costruzioni geometriche adeguata alla classe prima.',
  },
  {
    id: 'tec-sec1-2026-n2',
    focus: 'Progettare con problema e vincoli',
    scopeLabel: 'Tecnologia · Secondaria di primo grado · Classe prima',
    oldLabel: 'Fonte corrente',
    newLabel: 'Proposta da validare',
    keepLabel: 'Mantieni fonte corrente',
    oldText: 'Utilizzare risorse e informazioni per progettare e realizzare semplici manufatti o prodotti, seguendo indicazioni e procedure guidate.',
    newText: 'Individuare un problema concreto; formulare requisiti e vincoli; confrontare alternative; rappresentare una soluzione; pianificare materiali, strumenti, fasi e tempi essenziali; prevedere criticità e criteri di verifica.',
    contextSummary: 'Il passaggio da una procedura soltanto guidata a un primo metodo progettuale esplicito è una scelta curricolare d’Istituto da sottoporre al riesame professionale.',
    sourceRefs: commonSourceRefs,
    gateId: 'SEC1-05 / TECHNOLOGY_REWORK',
    notes: 'Sequenza di riferimento: problema → vincoli → idea/alternative → piano → realizzazione → verifica.',
  },
  {
    id: 'tec-sec1-2026-n3',
    focus: 'Realizzare, verificare e considerare il ciclo di vita',
    scopeLabel: 'Tecnologia · Secondaria di primo grado · Classe prima',
    oldLabel: 'Fonte corrente',
    newLabel: 'Proposta da validare',
    keepLabel: 'Mantieni fonte corrente',
    oldText: 'Riconoscere semplici processi di trasformazione di materiali e risorse e comprendere che le scelte tecnologiche producono effetti sull’ambiente e sulle persone; realizzare semplici prodotti seguendo procedure guidate.',
    newText: 'Seguire e documentare procedure; lavorare e assemblare materiali in sicurezza; realizzare un semplice manufatto o modello; verificarlo rispetto allo scopo; riconoscere trasformazioni e fasi di produzione; valutare riuso, riparazione e riciclo.',
    contextSummary: 'La proposta rende operative trasformazione, produzione e sostenibilità attraverso prodotto/processo, verifica, ciclo di vita introduttivo, rifiuti, riuso, riciclo ed economia circolare.',
    sourceRefs: commonSourceRefs,
    gateId: 'SEC1-05 / TECHNOLOGY_REWORK',
    notes: 'La sostenibilità è parte del ragionamento tecnico e non un contenuto aggiunto separatamente.',
  },
  {
    id: 'tec-sec1-2026-n4',
    focus: 'Dati, procedure e sistemi digitali',
    scopeLabel: 'Tecnologia · Secondaria di primo grado · Classe prima',
    oldLabel: 'Fonte corrente',
    newLabel: 'Proposta da validare',
    keepLabel: 'Mantieni fonte corrente',
    oldText: 'Conoscere le principali componenti di un sistema informatico e le funzioni essenziali dei dispositivi digitali e di Internet; utilizzare semplici programmi e strumenti informatici per attività di studio e comunicazione in modo corretto e responsabile.',
    newText: 'Riconoscere componenti e funzioni essenziali di un sistema digitale; distinguere dato e informazione; seguire, descrivere e costruire semplici procedure o algoritmi; utilizzare applicazioni di base per produrre e organizzare contenuti; applicare regole di sicurezza, privacy, attendibilità e comportamento responsabile in rete.',
    contextSummary: 'Dati, algoritmi, Internet, Web, sicurezza e comportamento responsabile sono contenuti della proposta disciplinare d’Istituto: devono essere validati dal gruppo competente e non sono attribuiti automaticamente alla fonte nazionale.',
    sourceRefs: commonSourceRefs,
    gateId: 'SEC1-05 / TECHNOLOGY_REWORK',
    notes: 'Il livello resta introduttivo e coerente con una classe prima della secondaria di primo grado.',
  },
  {
    id: 'tec-sec1-2026-verticalita',
    focus: 'Raccordo dalla classe prima alle classi seconda e terza',
    scopeLabel: 'Tecnologia · Raccordo I → II → III',
    oldLabel: 'Stato corrente',
    newLabel: 'Raccordo da validare',
    keepLabel: 'Mantieni stato corrente',
    oldText: 'La classe prima applica il nuovo quadro 2025. Le classi seconda e terza proseguono nel regime transitorio riferito al quadro 2012: il nuovo impianto non deve essere applicato retroattivamente alle coorti già in prosecuzione.',
    newText: 'Classe prima: misurare, rappresentare, procedere con metodo tecnico. Classe seconda: analizzare sistemi e proporre soluzioni, consolidando disegno, filiere, abitare e territorio. Classe terza: valutare e progettare responsabilmente, integrando energia, sistemi produttivi e digitali, sostenibilità e orientamento.',
    contextSummary: 'La matrice MATR-CURR-TEC-T01 mantiene visibile la differenza di regime tra le coorti e usa programmazioni annuali soltanto come evidenza di sostenibilità didattica, non come fonte del curricolo.',
    sourceRefs: [
      `${TECHNOLOGY_CLASS1_REVIEW.verticalMatrix.title} · Drive ${TECHNOLOGY_CLASS1_REVIEW.verticalMatrix.driveFileId}`,
      `${TECHNOLOGY_CLASS1_REVIEW.decisionRegister.title} · Drive ${TECHNOLOGY_CLASS1_REVIEW.decisionRegister.driveFileId}`,
      `${TECHNOLOGY_CLASS1_REVIEW.validationGate.title} · Drive ${TECHNOLOGY_CLASS1_REVIEW.validationGate.driveFileId}`,
    ],
    gateId: 'PRIMARY_SECONDARY_VERTICALITY / TRANSITION_II_III',
    notes: 'NON_DUPLICATION_CHECK e validazione disciplinare restano aperti; nessuna promozione canonica è autorizzata.',
  },
];

export function resolveOperationalReviewProposals(
  discipline: string,
  order: SchoolOrder,
  fallback: Proposal[],
): Proposal[] {
  const normalizedDiscipline = discipline.trim().toLocaleLowerCase('it-IT');
  if (normalizedDiscipline === TECHNOLOGY_CLASS1_REVIEW.discipline && order === TECHNOLOGY_CLASS1_REVIEW.order) {
    return TECHNOLOGY_CLASS1_REVIEW_PROPOSALS;
  }
  return fallback;
}
