export type TechnologyDraftGrade = 'prima' | 'seconda' | 'terza';

export type TechnologyDraftNucleusId =
  | 'CULTURA_TECNICA_SISTEMI'
  | 'METODO_PROGETTUALE'
  | 'MATERIALI_CICLO_VITA'
  | 'DISEGNO_MODELLAZIONE'
  | 'ENERGIA_SOSTENIBILITA'
  | 'ABITARE_TERRITORIO'
  | 'ALIMENTAZIONE_FILIERE'
  | 'DIGITALE_DATI_IA'
  | 'ORIENTAMENTO_PROFESSIONI';

export interface TechnologyDraftNucleus {
  id: TechnologyDraftNucleusId;
  label: string;
  summary: string;
  progression: Readonly<Record<TechnologyDraftGrade, string>>;
  framework: {
    knowledge: string;
    skills: string;
    expectedCompetence: string;
    evidence: string;
  };
}

export interface TechnologyExitProfileArea {
  id: string;
  label: string;
  expectedOutcome: string;
}

export const TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE = {
  sourceRef: 'technology-curriculum-working-draft-2026-2027',
  title: 'Curricolo verticale di Tecnologia — Bozza operativa aggiornata a Indicazioni Nazionali 2025, PTOF, RAV/PdM, framework europei e contesto territoriale',
  academicYear: '2026/2027',
  schoolOrder: 'secondaria' as const,
  disciplineId: 'TECNOLOGIA' as const,
  authorityStatus: 'WORKING_DRAFT_NOT_ADOPTED' as const,
  sourceNote:
    'La fonte dichiara esplicitamente che il curricolo è una bozza operativa da sottoporre al gruppo disciplinare e al Collegio. R7C2 non la promuove a curricolo adottato.',
} as const;

export const TECHNOLOGY_INSTITUTIONAL_DRAFT_FINALITIES: readonly string[] = [
  'Sviluppare la capacità di osservare, comprendere e valutare oggetti, ambienti, sistemi, dati e processi tecnici.',
  'Promuovere il metodo progettuale come forma di pensiero: problema, vincoli, soluzione, realizzazione, verifica, miglioramento.',
  'Costruire alfabetizzazione tecnica, grafica, digitale, ambientale e orientativa.',
  'Collegare saperi disciplinari, educazione civica, sostenibilità, cittadinanza digitale, sicurezza e lavoro.',
  'Favorire inclusione, partecipazione, autonomia, collaborazione e successo formativo, in raccordo con la missione dell’Istituto.',
] as const;

export const TECHNOLOGY_INSTITUTIONAL_DRAFT_EXIT_PROFILE: readonly TechnologyExitProfileArea[] = [
  {
    id: 'COMPRENSIONE_TECNICA',
    label: 'Comprensione tecnica',
    expectedOutcome: 'Riconosce bisogni, funzioni, risorse, vincoli, materiali, energia, informazioni e sistemi tecnici nel mondo naturale e artificiale.',
  },
  {
    id: 'PROGETTAZIONE',
    label: 'Progettazione',
    expectedOutcome: 'Applica il metodo tecnologico per immaginare, progettare, realizzare, verificare e migliorare soluzioni semplici e motivate.',
  },
  {
    id: 'RAPPRESENTAZIONE',
    label: 'Rappresentazione',
    expectedOutcome: 'Comunica idee tecniche attraverso disegno, schemi, tabelle, grafici, modelli e strumenti digitali.',
  },
  {
    id: 'SOSTENIBILITA',
    label: 'Sostenibilità',
    expectedOutcome: 'Valuta l’impatto di materiali, energia, consumi, produzioni e scelte tecnologiche su ambiente, società e salute.',
  },
  {
    id: 'DIGITALE_IA',
    label: 'Digitale e IA',
    expectedOutcome: 'Usa dati, strumenti digitali e sistemi di IA in modo prudente, critico, sicuro, rispettoso della privacy e orientato a scopi formativi.',
  },
  {
    id: 'ORIENTAMENTO',
    label: 'Orientamento',
    expectedOutcome: 'Riconosce il rapporto tra tecnologie, professioni, territorio, talenti personali e scelte future.',
  },
] as const;

const genericFramework = {
  knowledge: 'Lessico essenziale, elementi, processi, funzioni, vincoli e impatti del nucleo.',
  skills: 'Osservare, classificare, rappresentare, confrontare, argomentare e documentare.',
  expectedCompetence: 'Comprende il nucleo e lo usa per interpretare problemi e produrre soluzioni motivate.',
  evidence: 'Scheda analisi, mappa, elaborato, presentazione, compito autentico.',
} as const;

export const TECHNOLOGY_INSTITUTIONAL_DRAFT_NUCLEI: readonly TechnologyDraftNucleus[] = [
  {
    id: 'CULTURA_TECNICA_SISTEMI',
    label: 'Cultura tecnica, bisogni, oggetti e sistemi',
    summary: 'Riconoscere oggetti, sistemi, bisogni, funzioni, risorse, vincoli e conseguenze dell’agire tecnico.',
    progression: {
      prima: 'Oggetti, bisogni, funzioni, sicurezza d’uso.',
      seconda: 'Sistemi semplici, servizi, filiere, territorio.',
      terza: 'Sistemi complessi, automazione, impatti sociali.',
    },
    framework: genericFramework,
  },
  {
    id: 'METODO_PROGETTUALE',
    label: 'Metodo progettuale e problem solving tecnologico',
    summary: 'Usare un ciclo intenzionale: problema, analisi, requisiti, ipotesi, progetto, prototipo, verifica, miglioramento.',
    progression: {
      prima: 'Osservare e descrivere un problema semplice.',
      seconda: 'Confrontare soluzioni e rispettare vincoli.',
      terza: 'Progettare, documentare, verificare e migliorare.',
    },
    framework: {
      knowledge: 'Bisogno, problema, funzione, requisito, vincolo, soluzione, prototipo, verifica, miglioramento.',
      skills: 'Analizzare bisogni, formulare ipotesi, scegliere strumenti/materiali, pianificare fasi, testare e correggere.',
      expectedCompetence: 'Affronta problemi concreti con un processo progettuale documentato e riflessivo.',
      evidence: 'Brief, scheda progetto, prototipo, relazione, revisione del progetto.',
    },
  },
  {
    id: 'MATERIALI_CICLO_VITA',
    label: 'Materiali, risorse, trasformazioni e ciclo di vita',
    summary: 'Comprendere proprietà, lavorazioni, filiere, impatti, riuso, riciclo ed economia circolare.',
    progression: {
      prima: 'Materiali comuni, proprietà, raccolta differenziata.',
      seconda: 'Lavorazioni, filiere, imballaggi, sprechi.',
      terza: 'Ciclo di vita, impatti, scelte responsabili.',
    },
    framework: genericFramework,
  },
  {
    id: 'DISEGNO_MODELLAZIONE',
    label: 'Disegno tecnico, rappresentazione, modellazione e comunicazione grafica',
    summary: 'Rappresentare con strumenti manuali e digitali: misurare, schematizzare, quotare, modellare e comunicare.',
    progression: {
      prima: 'Strumenti, costruzioni geometriche, precisione.',
      seconda: 'Scale, viste, quotature, schemi funzionali.',
      terza: 'Assonometrie, prospettiva/CAD, modellazione.',
    },
    framework: {
      knowledge: 'Strumenti, norme grafiche di base, scala, quota, vista, pianta, prospetto, assonometria, schema.',
      skills: 'Disegnare con precisione, interpretare rappresentazioni, passare da oggetto a schema e viceversa.',
      expectedCompetence: 'Comunica idee tecniche con rappresentazioni manuali e digitali chiare e funzionali.',
      evidence: 'Tavola, disegno quotato, schema tecnico, modello digitale.',
    },
  },
  {
    id: 'ENERGIA_SOSTENIBILITA',
    label: 'Energia, elettricità, macchine e sostenibilità',
    summary: 'Leggere fonti, trasformazioni, consumi, sistemi, circuiti, sicurezza ed effetti ambientali/sociali.',
    progression: {
      prima: 'Forme e usi quotidiani dell’energia.',
      seconda: 'Consumi, efficienza, sicurezza domestica.',
      terza: 'Fonti, centrali, elettricità, transizione ecologica.',
    },
    framework: {
      knowledge: 'Energia, fonte, trasformazione, rendimento, consumo, circuito, sicurezza, rinnovabile/non rinnovabile.',
      skills: 'Leggere consumi, confrontare fonti, individuare sprechi, rappresentare circuiti, proporre miglioramenti.',
      expectedCompetence: 'Valuta l’uso dell’energia rispetto a sostenibilità, sicurezza e responsabilità personale.',
      evidence: 'Audit energetico, schema circuito, confronto fonti, proposta di risparmio.',
    },
  },
  {
    id: 'ABITARE_TERRITORIO',
    label: 'Abitare, territorio, infrastrutture e sicurezza',
    summary: 'Analizzare spazi, reti, servizi, mobilità, accessibilità, rischio, qualità della vita e sostenibilità urbana.',
    progression: {
      prima: 'Aula, casa, scuola, sicurezza degli spazi.',
      seconda: 'Abitazione, città, reti, servizi.',
      terza: 'Mobilità, rischio, accessibilità, qualità urbana.',
    },
    framework: genericFramework,
  },
  {
    id: 'ALIMENTAZIONE_FILIERE',
    label: 'Alimentazione, filiere, produzione e consumo consapevole',
    summary: 'Riconoscere filiere, trasformazioni, conservazione, imballaggi, etichette, sprechi e sicurezza alimentare.',
    progression: {
      prima: 'Origine e trasformazione semplice degli alimenti.',
      seconda: 'Filiere, etichette, conservazione, sprechi.',
      terza: 'Impatti globali, sicurezza, consumo sostenibile.',
    },
    framework: genericFramework,
  },
  {
    id: 'DIGITALE_DATI_IA',
    label: 'Digitale, dati, informatica, IA e cittadinanza tecnologica',
    summary: 'Comprendere dati, algoritmi, automazione, reti, privacy, sicurezza, IA e responsabilità umana.',
    progression: {
      prima: 'Uso guidato, sicurezza, prime procedure.',
      seconda: 'Tabelle, grafici, coding, dati.',
      terza: 'IA, automazione, privacy, bias, attendibilità.',
    },
    framework: {
      knowledge: 'Dato, informazione, algoritmo, procedura, rete, privacy, sicurezza, IA, automazione, attendibilità, bias.',
      skills: 'Raccogliere dati, organizzarli, leggere grafici, usare strumenti digitali, riconoscere rischi, documentare fonti e decisioni.',
      expectedCompetence: 'Usa il digitale per risolvere problemi, comunicare, interpretare dati e agire in modo sicuro e critico.',
      evidence: 'Tabella/grafico, prodotto digitale, scheda privacy, analisi fonte, protocollo di uso IA.',
    },
  },
  {
    id: 'ORIENTAMENTO_PROFESSIONI',
    label: 'Tecnologia, lavoro, orientamento e professioni tecnico-scientifiche',
    summary: 'Collegare conoscenze tecniche, attitudini, professioni, automazione, territorio e scelte future.',
    progression: {
      prima: 'Mestieri e strumenti del quotidiano.',
      seconda: 'Tecnologie nei settori produttivi e nei servizi.',
      terza: 'Professioni STEM, scelte future, competenze tecniche.',
    },
    framework: genericFramework,
  },
] as const;
