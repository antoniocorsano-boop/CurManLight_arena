// Knowledge Companion Mock — Data (v2)
// All data is fittitious, non-reproducible to real students/classes/institutions

const JOURNEY_STEPS = [
  {
    id: "step2",
    step: 2,
    stepLabel: "Scegli i traguardi",
    stepTitle: "Passo 2 — Selezione Traguardi",
    progress: 40,
    discipline: "Italiano",
    order: "Primaria",
    udaTitle: "La poesia e l'emozione: composizione e lettura ad alta voce",
    traguardi: [
      { id: "T1", text: "Il bambino usa la lingua italiana, arricchisce e precisa il proprio lessico, comprende parole e discorsi." },
      { id: "T2", text: "Esprime con efficacia idee e sentimenti in forma orale e scritta." }
    ],
    evidenze: [],
    realTask: "",
    notesBES: "",
    refIntro: "Riferimenti per la coerenza dei traguardi con disciplina e ordine. Consultazione facoltativa.",
    references: [
      {
        category: "Curricolo",
        source: "Vol. 4",
        title: "Traguardi Italiano / Primaria",
        text: "Il bambino usa la lingua italiana, arricchisce e precisa il proprio lessico, comprende parole e discorsi. Esprime con efficacia idee e sentimenti in forma orale e scritta.",
        relevance: "Può aiutarti a verificare la coerenza dei traguardi selezionati.",
        main: true
      },
      {
        category: "Curricolo",
        source: "Vol. 8",
        title: "Dettaglio 14 Discipline",
        text: "Mappatura classe per classe delle 14 discipline del curricolo fondativo, con obiettivi specifici per ogni ordine e livello.",
        relevance: "Utile per confrontare traguardi con obiettivi specifici della disciplina.",
        main: false
      },
      {
        category: "Approfondimento",
        source: "Vol. 6",
        title: '"Traguardo di Competenza"',
        text: "Il traguardo descrive la competenza attesa alla fine del ciclo scolastico. Si distingue dall'obiettivo di apprendimento, che è più specifico e misurabile.",
        relevance: "Approfondisci se vuoi capire la differenza tra traguardo e obiettivo.",
        main: false
      }
    ],
    stepFields: "traguardi"
  },
  {
    id: "step3",
    step: 3,
    stepLabel: "Collega le evidenze",
    stepTitle: "Passo 3 — Evidenze e Valutazione",
    progress: 60,
    discipline: "Scienze",
    order: "Secondaria",
   udaTitle: "Osservazione e classificazione degli organismi in ambiente naturale",
    traguardi: [],
    evidenze: [
      { id: "E1", text: "Osserva e descrive caratteristiche degli organismi" },
      { id: "E2", text: "Classifica gli organismi secondo criteri scientifici" }
    ],
    realTask: "",
    notesBES: "",
    refIntro: "Le evidenze collegano le attività osservabili ai traguardi. Consultazione facoltativa.",
    references: [
      {
        category: "Fonte normativa",
        source: "Vol. 3",
        title: "DM 14/2024: evidenze",
        text: "Le evidenze comportamentali, ai sensi del DM 14/2024, sono osservabili e misurabili. Collegate ai traguardi di competenza, documentano il processo di certificazione.",
        relevance: "La fonte normativa spiega cosa sono le evidenze e come si collegano ai traguardi.",
        main: true
      },
      {
        category: "Approfondimento",
        source: "Vol. 6",
        title: '"Evidenza Comportamentale"',
        text: "Comportamento osservabile che dimostra il raggiungimento di un traguardo. Si distingue dall'obiettivo di apprendimento per la sua natura integrativa.",
        relevance: "Approfondisci se vuoi capire la differenza tra evidenza e obiettivo.",
        main: false
      }
    ],
    stepFields: "evidenze"
  },
  {
    id: "step4",
    step: 4,
    stepLabel: "Definisci compito e inclusione",
    stepTitle: "Passo 4 — Compito di Realtà e Note BES",
    progress: 80,
    discipline: "Italiano",
    order: "Secondaria",
    udaTitle: "Analisi di un testo letterario del Novecento",
    traguardi: [],
    evidenze: [],
    realTask: "Analisi guidata di un racconto di Calvino",
    notesBES: "Supporto visivo, mappe concettuali",
    refIntro: "Riferimenti per compito di realtà e note di inclusione. Consultazione facoltativa.",
    references: [
      {
        category: "Approfondimento",
        source: "Vol. 6",
        title: '"Compito di Realtà"',
        text: "Prodotto o servizio reale che l'alunno produce utilizzando le competenze sviluppate nell'Unità Didattica di Apprendimento. Caratteristiche: autenticità, complessità, contestualizzazione.",
        relevance: "Può aiutarti a definire un compito di realtà coerente con l'UDA.",
        main: true
      },
      {
        category: "Fonte normativa",
        source: "Vol. 3",
        title: "PEI/PDP/UDL",
        text: "PEI (Legge 104/1992), PDP (D.Lgs. 62/2017), UDL (Universal Design for Learning): strumenti compensativi, misure dispensative, valutazione personalizzata.",
        relevance: "Riferimento normativo per le note di inclusione BES/DSA.",
        main: false
      },
      {
        category: "Approfondimento",
        source: "Vol. 19",
        title: "Metodologie Cooperative",
        text: "Jigsaw, Peer Tutoring, Learning Station: metodologie per l'inclusione attiva. Ogni studente contribuisce con un ruolo definito alla costruzione collettiva del sapere.",
        relevance: "Metodologie utili per la progettazione inclusiva.",
        main: false
      }
    ],
    stepFields: "realTask"
  }
];

// Facilitator-only test variants
const TEST_VARIANTS = [
  {
    id: "no-ref",
    label: "Nessun riferimento",
    description: "Combinazione senza riferimenti disponibili",
    step: 2,
    discipline: "Filosofia",
    order: "Secondaria",
    udaTitle: "UDA di test — nessun riferimento",
    refIntro: "",
    references: []
  },
  {
    id: "incomplete",
    label: "Contesto incompleto",
    description: "Solo disciplina selezionata, senza ordine",
    step: 2,
    discipline: "Italiano",
    order: "",
    udaTitle: "",
    refIntro: "Servono disciplina e ordine per mostrare riferimenti pertinenti.",
    references: [
      {
        category: "Curricolo",
        source: "Vol. 4",
        title: "Traguardi Italiano",
        text: "Seleziona un ordine scolastico per affinare i riferimenti.",
        relevance: "Incompletezza del contesto.",
        main: true
      }
    ]
  },
  {
    id: "expanded",
    label: "Pannello espanso",
    description: "Tutti i riferimenti visibili dall'inizio",
    step: 2,
    discipline: "Italiano",
    order: "Primaria",
    udaTitle: "La poesia e l'emozione",
    refIntro: "Riferimenti mostrati nella loro interezza (stato espanso).",
    references: [
      {
        category: "Curricolo",
        source: "Vol. 4",
        title: "Traguardi Italiano / Primaria",
        text: "Il bambino usa la lingua italiana, arricchisce e precisa il proprio lessico, comprende parole e discorsi.",
        relevance: "Riferimento principale.",
        main: true
      },
      {
        category: "Curricolo",
        source: "Vol. 8",
        title: "Dettaglio 14 Discipline",
        text: "Mappatura classe per classe delle 14 discipline del curricolo fondativo.",
        relevance: "Dettaglio curricolare.",
        main: false
      },
      {
        category: "Approfondimento",
        source: "Vol. 6",
        title: '"Traguardo di Competenza"',
        text: "Il traguardo descrive la competenza attesa alla fine del ciclo scolastico.",
        relevance: "Approfondimento lessicale.",
        main: false
      }
    ],
    forceExpand: true
  },
  {
    id: "overlay",
    label: "Approfondimento aperto",
    description: "Reader del volume aperto sul primo riferimento",
    step: 2,
    discipline: "Italiano",
    order: "Primaria",
    udaTitle: "La poesia e l'emozione",
    refIntro: "Stato con reader aperto (overlay).",
    references: [
      {
        category: "Curricolo",
        source: "Vol. 4",
        title: "Traguardi Italiano / Primaria",
        text: "Il bambino usa la lingua italiana, arricchisce e precisa il proprio lessico, comprende parole e discorsi.",
        relevance: "Riferimento principale.",
        main: true
      }
    ],
    forceOverlay: true
  }
];
