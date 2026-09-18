export interface TechnologyMethodologyEntry {
  method: string;
  useInTechnology: string;
  inclusionAttention: string;
}

export interface TechnologyCrossCurricularEntry {
  area: string;
  curriculumConnection: string;
}

export interface TechnologyAssessmentEntry {
  assessedObject: string;
  instrument: string;
  periodicity: string;
}

export const TECHNOLOGY_INSTITUTIONAL_GUIDING_PRINCIPLE =
  'Tecnologia non è semplice uso di strumenti: è cultura del progetto, dei sistemi tecnici, dei materiali, dell’energia, delle informazioni e della responsabilità sociale e ambientale.' as const;

export const TECHNOLOGY_INSTITUTIONAL_METHODOLOGIES: readonly TechnologyMethodologyEntry[] = [
  {
    method: 'Laboratorio',
    useInTechnology: 'Manipolazione, disegno, prototipazione, misure, prove, test.',
    inclusionAttention: 'Fasi brevi, ruoli chiari, strumenti graduati.',
  },
  {
    method: 'Project Based Learning',
    useInTechnology: 'UDA e compiti autentici legati a bisogni reali.',
    inclusionAttention: 'Prodotti diversificabili e criteri espliciti.',
  },
  {
    method: 'Inquiry e problem solving',
    useInTechnology: 'Domande, osservazioni, ipotesi, prove, revisione.',
    inclusionAttention: 'Scaffold, esempi, mappe, checklist.',
  },
  {
    method: 'Cooperative learning',
    useInTechnology: 'Ruoli di gruppo: progettista, tecnico, relatore, verificatore.',
    inclusionAttention: 'Responsabilità distribuita e osservazione delle competenze sociali.',
  },
  {
    method: 'UDL',
    useInTechnology: 'Più modalità di accesso, espressione e coinvolgimento.',
    inclusionAttention: 'Riduce barriere e non abbassa l’ambizione.',
  },
  {
    method: 'Didattica digitale e IA prudente',
    useInTechnology: 'Dati, simulazioni, documentazione, prompt guidati e verifica umana.',
    inclusionAttention: 'Privacy, fonti, tracciabilità e supervisione docente.',
  },
] as const;

export const TECHNOLOGY_INSTITUTIONAL_CROSS_CURRICULAR: readonly TechnologyCrossCurricularEntry[] = [
  {
    area: 'Educazione civica',
    curriculumConnection: 'Legalità tecnologica, sicurezza, sostenibilità, cittadinanza digitale, rispetto del bene comune, consumo responsabile.',
  },
  {
    area: 'Orientamento',
    curriculumConnection: 'Professioni tecnico-scientifiche, settori produttivi, artigianato, digitale, energia, ambiente, competenze future.',
  },
  {
    area: 'Inclusione',
    curriculumConnection: 'Consegne leggibili, livelli essenziali, strumenti compensativi, ruoli cooperativi, prodotti alternativi, criteri trasparenti.',
  },
  {
    area: 'Territorio',
    curriculumConnection: 'Ceramica, materiali, patrimonio culturale, reti locali, mobilità, ambiente urbano e rurale, musei e biblioteche.',
  },
  {
    area: 'Continuità',
    curriculumConnection: 'Raccordo con primaria su osservazione, materiali, coding, ambienti; raccordo in uscita con orientamento STEM e digitale.',
  },
] as const;

export const TECHNOLOGY_INSTITUTIONAL_ASSESSMENT_PRINCIPLE =
  'La valutazione deve osservare insieme conoscenze, abilità, competenze, processo e prodotto. Le prove tradizionali restano utili, ma non bastano: il curricolo richiede compiti di prestazione, rubriche, portfolio, autovalutazione e indicatori comuni.' as const;

export const TECHNOLOGY_INSTITUTIONAL_ASSESSMENT: readonly TechnologyAssessmentEntry[] = [
  {
    assessedObject: 'Conoscenze essenziali',
    instrument: 'Verifiche brevi, colloqui, mappe, quiz ragionati.',
    periodicity: 'Per nucleo/UDA',
  },
  {
    assessedObject: 'Disegno e rappresentazione',
    instrument: 'Rubrica tavola tecnica, precisione, pulizia, norme grafiche.',
    periodicity: 'Mensile o per unità',
  },
  {
    assessedObject: 'Metodo progettuale',
    instrument: 'Scheda progetto, diario di bordo, prototipo, relazione.',
    periodicity: 'Per compito autentico',
  },
  {
    assessedObject: 'Digitale e IA',
    instrument: 'Prodotto digitale, checklist privacy/fonti, riflessione sull’uso dello strumento.',
    periodicity: 'Per attività digitale',
  },
  {
    assessedObject: 'Competenze sociali e civiche',
    instrument: 'Griglia osservativa laboratorio/gruppo.',
    periodicity: 'Continuativa',
  },
  {
    assessedObject: 'Esiti e miglioramento',
    instrument: 'Dashboard di classe, livelli, fragilità, recupero/potenziamento.',
    periodicity: 'Trimestrale/quadrimestrale',
  },
] as const;

export const TECHNOLOGY_INSTITUTIONAL_GOVERNANCE_RULES: readonly string[] = [
  'Revisione annuale in dipartimento con evidenze di classe, rubriche e criticità emerse.',
  'Allineamento periodico con RAV/PdM, educazione civica, orientamento e continuità primaria-secondaria.',
  'Aggiornamento delle UDA e degli allegati senza modificare ogni anno la struttura dei nuclei fondanti.',
  'Versionamento del documento e tracciamento delle decisioni collegiali.',
] as const;
