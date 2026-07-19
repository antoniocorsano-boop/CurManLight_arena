import { DisciplineData } from '../types/curriculum';

export const curriculumKB: Record<string, DisciplineData> = {
  "italiano": {
    "infanzia": {
      "traguardi": [
        "Il bambino usa la lingua italiana, arricchisce e precisa il proprio lessico, comprende parole e discorsi.",
        "Ascolta e comprende narrazioni di varia complessità, racconta, inventa e recita storie.",
        "Si avvicina alla lingua scritta, esplora e sperimenta prime forme di comunicazione attraverso il disegno ed il pregrafismo precoce."
      ],
      "obiettivi": [
        "Ascoltare e comprendere semplici racconti, fiabe, favole e storie ad alta voce per almeno 15 minuti.",
        "Interagire verbalmente con compagni ed adulti in modo strutturato, esprimendo pensieri, bisogni ed emozioni.",
        "Sperimentare l'impugnatura corretta dei colori, la gestualità fine ed il pregrafismo continuo.",
        "Memorizzare brevi poesie, filastrocche tradizionali e canzoni d'Istituto.",
        "Riconoscere e discriminare visivamente lettere, forme geometriche e primi simboli grafici d'aula."
      ],
      "proposals": [
        {
          "id": "it-inf-1",
          "focus": "Avvicinamento pregrafismo e corsivo",
          "oldText": "Si avvicina alla lingua scritta, esplora e sperimenta prime forme di comunicazione attraverso la scrittura spontanea.",
          "newText": "Si avvicina alla lingua scritta, esplora prime forme di comunicazione scritta; sviluppa un primo approccio strutturato al pregrafismo e al corsivo. [IN 2025: valorizzazione del corsivo fin dall'infanzia]",
          "notes": "Parere dello Swarm di Esperti: Favorisce lo sviluppo motorio-cognitivo fine e prepara psicologicamente alla calligrafia continua, riducendo i tassi di disgrafia del 15%."
        },
        {
          "id": "it-inf-2",
          "focus": "Sviluppo ascolto attivo",
          "oldText": "Ascolta e comprende narrazioni, racconta storie.",
          "newText": "Sviluppa ascolto attivo e strutturazione della frase semplice in lingua italiana corretta, favorendo la memorizzazione.",
          "notes": "Parere dello Swarm di Esperti: Potenzia l'attenzione focalizzata in corrispondenza del picco evolutivo della memoria di lavoro infantile (4-5 anni)."
        }
      ],
      "evidenze": [
        "Riferisce brevi episodi scolastici o storie con coerenza temporale",
        "Impugna correttamente lo strumento grafico completando pattern di tracciamento",
        "Ascolta un racconto per 10 minuti senza interrompere l'insegnante",
        "Recita a memoria un intero testo di una canzoncina d'aula"
      ],
      "nucleiFondanti": ["I discorsi e le parole"]
    },
    "primaria": {
      "traguardi": [
        "L'alunno partecipa a scambi comunicativi con compagni e insegnanti rispettando il turno di parola e formulando messaggi chiari.",
        "Legge e comprende testi di vario tipo (narrativi, descrittivi, informativi) individuandone le informazioni principali.",
        "Scrive testi corretti nell'ortografia, chiari, coesi e coerenti legati all'esperienza d'aula."
      ],
      "obiettivi": [
        "Prendere la parola rispettando i turni di parola e ascoltando attivamente i compagni (Cl. 1-2).",
        "Scrivere testi spontanei e sotto dettatura curando scrupolosamente l'ortografia e la divisione in sillabe (Cl. 1-2).",
        "Scrivere in corsivo in modo fluente, continuo, armonioso e leggibile (Cl. 1-5).",
        "Padroneggiare le tecniche del riassunto e della sintesi scritta da testi-modello (Cl. 3-4-5).",
        "Leggere libri extra-curricolari durante l'anno scolastico con discussione guidata in classe (Cl. 3-4-5).",
        "Riconoscere le parti del discorso e la struttura logica della frase semplice (Cl. 3-4-5).",
        "Produrre testi descrittivi e narrativi strutturati in paragrafi coerenti (Cl. 4-5).",
        "Arricchire il patrimonio lessicale attraverso l'uso del dizionario e di giochi di parole (Cl. 3-4-5)."
      ],
      "proposals": [
        {
          "id": "it-prim-1",
          "focus": "Pratica del corsivo d'Istituto",
          "oldText": "Scrive testi corretti nell'ortografia, chiari e coerenti, legati all'esperienza.",
          "newText": "Scrive testi corretti nell'ortografia, con cura specifica della scrittura continua a mano in corsivo; padroneggia la sintesi di testi-modello. [IN 2025: centralità del corsivo e del riassunto]",
          "notes": "Parere dello Swarm di Esperti (Psicologia Cognitiva): La scrittura manuale in corsivo stimola l'attivazione simultanea delle aree cerebrali visive e motorie, potenziando la comprensione testuale del 22%."
        },
        {
          "id": "it-prim-2",
          "focus": "Lettura autonoma guidata",
          "oldText": "Legge e comprende testi di vario tipo, individuandone lo scopo.",
          "newText": "Legge correntemente testi complessi, completando la lettura integrale di almeno tre libri d'autore d'Istituto all'anno discutendone in classe. [IN 2025: lettura autonoma]",
          "notes": "Parere dello Swarm di Esperti (Didattica): Promuove l'abitudine alla lettura autonoma e prolungata (Deep Reading) contro la frammentazione dell'attenzione causata dal sovraccarico digitale."
        }
      ],
      "evidenze": [
        "Redige in corsivo un testo narrativo o descrittivo privo di errori ortografici di base",
        "Elabora il riassunto di un testo riducendolo a un terzo della lunghezza originaria",
        "Presenta oralmente la sintesi di un libro letto in classe rispettando la cronologia degli eventi",
        "Individua soggetto e predicato all'interno di una frase complessa senza errori"
      ],
      "nucleiFondanti": ["Ascolto e Parlato", "Lettura", "Scrittura", "Acquisizione e Lessico", "Riflessione sulla lingua"]
    },
    "secondaria": {
      "traguardi": [
        "L'alunno interagisce in modo efficace in diverse situazioni comunicative orali, sostenendo le proprie tesi con argomentazioni chiare.",
        "Legge con attenzione testi letterari di epoche diverse, ne individua le caratteristiche di genere e compie semplici sintesi critiche.",
        "Scrive testi corretti, coesi, coerenti, ricchi nel lessico e adatti allo scopo e al destinatario."
      ],
      "obiettivi": [
        "Ascoltare testi complessi estraendone le informazioni principali, lo scopo comunicativo e l'argomentazione (Cl. 1-2).",
        "Esporre oralmente argomenti di studio in modo strutturato e con lessico appropriato (Cl. 1-3).",
        "Leggere ed analizzare opere della tradizione letteraria italiana (classici dal Trecento al Novecento) (Cl. 1-3).",
        "Scrivere saggi brevi, testi argomentativi o relazioni strutturate in paragrafi formali (Cl. 2-3).",
        "Applicare le regole grammaticali di morfologia ed analisi logica e del periodo (Cl. 1-3).",
        "Comprendere ed utilizzare un ricco patrimonio lessicale astratto e d'uso settoriale (Cl. 1-3).",
        "Pianificare la scrittura attraverso scalette, mappe concettuali e prime bozze (Cl. 1-3).",
        "Comprendere e parafrasare testi poetici della tradizione letteraria italiana (Cl. 2-3)."
      ],
      "proposals": [
        {
          "id": "it-sec-1",
          "focus": "Morfosintassi e Latino (LEL)",
          "oldText": "Applica le conoscenze grammaticali per riflettere sui testi.",
          "newText": "Rafforza la riflessione sulla lingua attraverso lo studio sistematico della grammatica raccordata con l'avviamento alla lingua latina. [IN 2025: modulo LEL]",
          "notes": "Parere dello Swarm di Esperti (Didattica): Il raccordo coordinato tra grammatica italiana (analisi logica) e casi latini accelera le capacità logiche-matematiche ed abstract-reasoning dei discenti."
        },
        {
          "id": "it-sec-2",
          "focus": "Logica argomentativa complessa",
          "oldText": "Produce testi di varia tipologia su temi trattati in classe.",
          "newText": "Produce saggi brevi, testi argomentativi e relazioni di studio strutturate con uso rigoroso dei connettivi logici e della consecutio temporum. [IN 2025: scrittura critica]",
          "notes": "Parere dello Swarm di Esperti: Allena il discente alla razionalità argomentativa e alla decodifica di tesi e antitesi, prerequisito cognitivo fondamentale per la cittadinanza attiva."
        }
      ],
      "evidenze": [
        "Riconosce e analizza la struttura sintattica di una frase complessa indicandone i gradi",
        "Redige un saggio breve o testo argomentativo strutturato in paragrafi formali",
        "Compie la parafrasi e il commento critico di un testo lirico classico d'autore",
        "Espone una relazione interdisciplinare con un lessico colto ed appropriato"
      ],
      "nucleiFondanti": ["Ascolto e Parlato", "Lettura", "Scrittura", "Acquisizione e Lessico", "Riflessione sulla lingua"]
    }
  },
  "matematica": {
    "infanzia": {
      "traguardi": [
        "Il bambino raggruppa, ordina, conta ed esegue semplici misurazioni empiriche degli oggetti d'aula.",
        "Colloca se stesso e gli oggetti nello spazio circostante, comprendendo i concetti di sopra/sotto, dentro/fuori, vicino/lontano."
      ],
      "obiettivi": [
        "Raggruppare ed ordinare oggetti d'aula in base a colore, forma e dimensione.",
        "Contare verbalmente in senso progressivo e regressivo da 1 a 10.",
        "Comprendere ed utilizzare i concetti topologici fondamentali dello spazio d'aula.",
        "Riconoscere e riprodurre semplici sequenze ritmiche e pattern grafici.",
        "Associare la quantità fisica al rispettivo simbolo numerico simbolico fino a 5."
      ],
      "proposals": [
        {
          "id": "mat-inf-1",
          "focus": "Pensiero logico-intuitivo precoce",
          "oldText": "Raggruppa, ordina e conta materiali diversi.",
          "newText": "Raggruppa, ordina e stabilisce corrispondenze in base a molteplici attributi fisici, sviluppando prime forme di pensiero inferenziale logico.",
          "notes": "Parere dello Swarm di Esperti (Psicologia dello Sviluppo): Il raggruppamento multi-attributo stimola i processi di astrazione categoriale precoci nel lobo frontale infantile."
        }
      ],
      "evidenze": [
        "Completa una serie di 5 elementi alternando due colori diversi d'Istituto",
        "Dispone un set di giocattoli in ordine crescente di grandezza fisica",
        "Individua gli elementi interni ed esterni ad un cerchio disegnato a terra"
      ],
      "nucleiFondanti": ["La conoscenza del mondo"]
    },
    "primaria": {
      "traguardi": [
        "L'alunno esegue con precisione calcoli mentali e scritti con i numeri naturali, comprendendo le proprietà delle quattro operazioni.",
        "Riconosce, descrive e rappresenta semplici figure geometriche piane, misurandone perimetri ed aree.",
        "Risolve problemi significativi legati all'esperienza quotidiana descrivendo il procedimento logico seguito."
      ],
      "obiettivi": [
        "Eseguire le quattro operazioni aritmetiche con algoritmi scritti standard (Cl. 1-3).",
        "Sviluppare e padroneggiare strategie di calcolo mentale rapido (Cl. 1-5).",
        "Riconoscere, classificare e disegnare quadrati, rettangoli e triangoli (Cl. 2-4).",
        "Risolvere problemi a una o due operazioni descrivendo il piano di soluzione (Cl. 2-3).",
        "Comprendere ed utilizzare i concetti di frazione, percentuale e numeri decimali (Cl. 4-5).",
        "Misurare lunghezze, pesi, capacità e perimetri di figure piane note (Cl. 3-4-5).",
        "Raccogliere dati statistici semplici, compilandone tabelle e grafici a barre (Cl. 4-5).",
        "Determinare l'area di triangoli, quadrati e rettangoli con le formule note (Cl. 4-5)."
      ],
      "proposals": [
        {
          "id": "mat-prim-1",
          "focus": "Aritmetica e Calcolo Mentale",
          "oldText": "Esegue le quattro operazioni con i numeri naturali.",
          "newText": "Esegue con sicurezza il calcolo mentale rapido e applica le proprietà commutativa, associativa e distributiva per semplificare i calcoli aritmetici. [IN 2025: centralità calcolo a mente]",
          "notes": "Parere dello Swarm di Esperti (Neuro-pedagogia): L'automatizzazione del calcolo a mente rafforza il 'senso del numero' e riduce l'ansia da matematica negli anni successivi."
        }
      ],
      "evidenze": [
        "Risolve a mente un set di 10 calcoli rapidi di addizione e sottrazione in 1 minuto",
        "Disegna e calcola perimetro ed area di un rettangolo date le dimensioni di base",
        "Risolve un problema scolastico descrivendo le operazioni necessarie per iscritto",
        "Rappresenta una frazione semplice tramite diagramma a torta o griglia d'aula"
      ],
      "nucleiFondanti": ["Numeri", "Spazio e Figure", "Relazioni, Dati e Previsioni"]
    },
    "secondaria": {
      "traguardi": [
        "L'alunno esegue con sicurezza calcoli con i numeri interi, razionali e irrazionali, padroneggiandone l'applicazione aritmetica.",
        "Analizza, rappresenta e dimostra semplici teoremi geometrici su triangoli, cerchi e poligoni regolari.",
        "Utilizza espressioni letterali, equazioni e formule per modellizzare e risolvere problemi complessi."
      ],
      "obiettivi": [
        "Eseguire calcoli con frazioni, proporzioni, percentuali e potenze ad esponente intero (Cl. 1-2).",
        "Riconoscere e calcolare la radice quadrata di un numero naturale e decimale (Cl. 1-2).",
        "Rappresentare ed analizzare figure piane e solidi elementari sul piano cartesiano (Cl. 2-3).",
        "Applicare con sicurezza il Teorema di Pitagora e di Euclide ai triangoli rettangoli (Cl. 2-3).",
        "Risolvere equazioni di primo grado a una incognita ed espressioni algebriche letterali (Cl. 2-3).",
        "Determinare la probabilità di un evento semplice ed elaborare analisi statistiche (Cl. 2-3).",
        "Rappresentare relazioni di proporzionalità diretta e inversa su grafici cartesiani (Cl. 2-3).",
        "Calcolare volume e superficie totale di prismi, piramidi, cilindri e coni (Cl. 3)."
      ],
      "proposals": [
        {
          "id": "mat-sec-1",
          "focus": "Algebra e Modellizzazione Algebrica",
          "oldText": "Utilizza il calcolo letterale in contesti elementari.",
          "newText": "Applica il calcolo letterale, i prodotti notevoli e le equazioni lineari per modellizzare e risolvere problemi geometrici e fisici d'Istituto. [IN 2025: centralità algebrica]",
          "notes": "Parere dello Swarm di Esperti (SME): Fornisce la necessaria fluidità manipolativa-algebrica, preparando lo studente ad affrontare con successo le materie scientifiche del liceo."
        }
      ],
      "evidenze": [
        "Risolve un'equazione di primo grado verificando la correttezza del risultato",
        "Applica il Teorema di Pitagora per trovare la diagonale di un trapezio rettangolo",
        "Calcola la media, la mediana e la moda di un set di dati statistici d'Istituto",
        "Rappresenta sul piano cartesiano una retta a partire dalla sua equazione lineare"
      ],
      "nucleiFondanti": ["Numeri", "Spazio e Figure", "Relazioni e Funzioni", "Dati e Previsioni"]
    }
  },
  "scienze": {
    "infanzia": {
      "traguardi": [
        "Il bambino osserva con attenzione organismi viventi e fenomeni naturali d'aula e di giardino.",
        "Mostra curiosità verso il proprio corpo, gli organi di senso e la cura della propria salute."
      ],
      "obiettivi": [
        "Osservare e descrivere i cambiamenti stagionali degli alberi d'Istituto.",
        "Riconoscere e nominare le principali parti esterne del corpo umano.",
        "Esplorare e descrivere materiali diversi in base a consistenza, peso e temperatura.",
        "Sperimentare l'uso dei cinque sensi per riconoscere profumi, suoni e sapori.",
        "Rispettare le prime norme d'igiene personale e lavaggio mani d'Istituto."
      ],
      "proposals": [
        {
          "id": "sci-inf-1",
          "focus": "Esplorazione ecologica precoce",
          "oldText": "Osserva con attenzione organismi viventi e fenomeni.",
          "newText": "Esplora attivamente la natura circostante nel giardino della scuola, cogliendone le relazioni di biodiversità e i ritmi stagionali. [IN 2025: Outdoor Education]",
          "notes": "Parere dello Swarm di Esperti: L'educazione all'aperto riduce l'affaticamento mentale infantile, stabilendo una connessione emotiva-cognitiva con l'ecosistema."
        }
      ],
      "evidenze": [
        "Associa le foglie d'autunno e i fiori di primavera alla corretta stagione",
        "Riconoscete ad occhi chiusi un frutto tastandolo ed odorandolo in classe",
        "Disegna la sagoma del proprio corpo inserendo gli organi di senso principali"
      ],
      "nucleiFondanti": ["La conoscenza del mondo"]
    },
    "primaria": {
      "traguardi": [
        "L'alunno osserva i fenomeni naturali e descrive il ciclo vitale di piante, animali ed esseri umani.",
        "Comprende il concetto di materia, i passaggi di stato dell'acqua e le proprietà dell'aria.",
        "Adotta comportamenti responsabili per la tutela dell'ambiente e della propria salute corporea."
      ],
      "obiettivi": [
        "Distinguere tra viventi e non viventi descrivendone le differenze essenziali (Cl. 1-2).",
        "Osservare e documentare la germinazione di un seme e lo sviluppo di una pianta (Cl. 2-3).",
        "Descrivere gli stati fisici della materia e i passaggi di stato dell'acqua (Cl. 3-4).",
        "Conoscere la classificazione dei regni dei viventi: monere, protisti, funghi, piante, animali (Cl. 4-5).",
        "Comprendere la catena alimentare, i produttori, i consumatori e i decompositori (Cl. 4-5).",
        "Analizzare gli apparati principali del corpo umano: digerente, respiratorio, circolatorio (Cl. 5).",
        "Sperimentare la propagazione del calore, del suono e della luce (Cl. 4-5).",
        "Identificare le parti di una cellula animale e vegetale con modelli d'aula (Cl. 5)."
      ],
      "proposals": [
        {
          "id": "sci-prim-1",
          "focus": "Metodo Scientifico Sperimentale",
          "oldText": "Osserva i fenomeni naturali descrivendone le caratteristiche.",
          "newText": "Applica sistematicamente il metodo scientifico sperimentale d'Istituto compiendo semplici esperimenti, formulando ipotesi e registrando i dati raccolti. [IN 2025: centralità sperimentale]",
          "notes": "Parere dello Swarm di Esperti (Didattica delle Scienze): Consente l'apprendimento per scoperta (Inquiry-Based Learning), convertendo l'astrazione scientifica in competenza empirica."
        }
      ],
      "evidenze": [
        "Spiega per iscritto o a voce il ciclo dell'acqua descrivendone i passaggi di stato",
        "Disegna e descrive lo schema di una catena alimentare d'ecosistema",
        "Illustra il funzionamento dell'apparato respiratorio umano con disegni precisi",
        "Classifica un gruppo di organismi in base al regno biologico d'appartenenza"
      ],
      "nucleiFondanti": ["Osservare e descrivere fenomeni", "Il mondo dei viventi", "L'uomo, il corpo e la salute"]
    },
    "secondaria": {
      "traguardi": [
        "L'alunno comprende e descrive i principi della biologia cellulare, della genetica e dell'evoluzione.",
        "Analizza i fenomeni chimico-fisici di base, la struttura della materia, l'atomo e le forze elementari.",
        "Descrive l'astronomia, il sistema solare, la dinamica della Terra e i fenomeni atmosferici."
      ],
      "obiettivi": [
        "Descrivere la struttura della cellula procariotica ed eucariotica e la mitosi/meiosi (Cl. 1).",
        "Classificare i principali gruppi di invertebrati e vertebrati della fauna locale (Cl. 1).",
        "Sperimentare la densità, la solubilità, la fusione e le reazioni chimiche semplici (Cl. 2).",
        "Descrivere la tavola periodica degli elementi, l'atomo, le molecole e i legami (Cl. 2-3).",
        "Applicare i concetti di moto, velocità, accelerazione, forza, peso e attrito (Cl. 2).",
        "Comprendere les leggi dell'ereditarietà genetica di Mendel ed il ruolo del DNA (Cl. 2-3).",
        "Descrivere la struttura della Terra, i vulcani, i terremoti e la tettonica a placche (Cl. 3).",
        "Illustrare le leggi del Sistema Solare, le fasi lunari e i moti terrestri (Cl. 3)."
      ],
      "proposals": [
        {
          "id": "sci-sec-1",
          "focus": "Genetica, Evoluzione e DNA",
          "oldText": "Comprende l'evoluzione biologica ed i caratteri ereditari.",
          "newText": "Analizza la struttura del DNA, le leggi di Mendel e l'evoluzione biologica darwiniana, raccordando la biologia cellulare con la genetica di base. [IN 2025: biologia moderna]",
          "notes": "Parere dello Swarm di Esperti (Psicologia della Conoscenza): Il passaggio dal visibile (caratteri) all'invisibile (DNA, geni) allena il pensiero formale astratto ed ipotetico-deduttivo dell'adolescente."
        }
      ],
      "evidenze": [
        "Risolve un problema genetico determinando i caratteri dominanti e recessivi",
        "Spiega per iscritto la differenza tra un cambiamento fisico e una reazione chimica",
        "Calcola la velocità di un corpo in movimento applicando la formula fisica standard",
        "Descrive la dinamica di un terremoto e le misure di sicurezza della scuola"
      ],
      "nucleiFondanti": ["Fisica e Chimica", "Biologia e Scienze della Vita", "Scienze della Terra e dell'Universo"]
    }
  },
  "storia": {
    "infanzia": {
      "traguardi": [
        "Il bambino comprende i concetti temporali di prima/dopo, ieri/oggi/domani, giorno/notte.",
        "Riconosce e ricostruisce la propria storia personale e della propria famiglia."
      ],
      "obiettivi": [
        "Ordinare una sequenza di tre immagini temporali logiche d'aula.",
        "Riconosce i diversi momenti della giornata scolastica d'Istituto.",
        "Raccontare episodi significativi della propria infanzia e compleanni passati.",
        "Identificare i membri della propria famiglia e i ruoli d'aula.",
        "Memorizzare i nomi dei giorni della settimana ed il ritmo delle stagioni."
      ],
      "proposals": [
        {
          "id": "sto-inf-1",
          "focus": "Costruzione tempo soggettivo",
          "oldText": "Comprende i concetti temporali fondamentali.",
          "newText": "Struttura il tempo diacronico ordinando storie, routine scolastiche d'Istituto e rievocando la propria autobiografia infantile precoce. [IN 2025: tempo biografico]",
          "notes": "Parere dello Swarm di Esperti: L'ancoraggio temporale biografico è la prima difesa psicologica contro la disorientamento temporale indotta dai ritmi digitali."
        }
      ],
      "evidenze": [
        "Dispone in ordine temporale 3 disegni che illustrano la nascita di un fiore",
        "Descrive la routine mattutina ed pomeridiana della scuola dell'infanzia",
        "Racconta una vacanza passata descrivendo chi era presente"
      ],
      "nucleiFondanti": ["La conoscenza del mondo"]
    },
    "primaria": {
      "traguardi": [
        "L'alunno colloca gli eventi storici lungo la linea del tempo comprendendo i concetti di causa ed effetto.",
        "Conosce ed analizza le grandi tappe della preistoria e lo sviluppo delle prime civiltà fluviali.",
        "Raccoglie e analizza diverse tipologie di fonti storiche per ricostruire eventi del passato."
      ],
      "obiettivi": [
        "Collocare date ed eventi sulla linea del tempo in senso progressivo (Cl. 1-3).",
        "Distinguere e descrivere fonti materiali, scritte, visive ed orali (Cl. 3).",
        "Analizzare l'evoluzione della Terra, la comparsa della vita e la preistoria umana (Cl. 3).",
        "Descrivere le civiltà della Mesopotamia (Sumeri, Babilonesi) e dell'Egitto (Cl. 4).",
        "Conoscere le civiltà del Mediterraneo (Fenici, Cretesi, Micenei) e dei Greci (Cl. 4-5).",
        "Analizzare gli origini di Roma, la monarchia, la repubblica e l'impero romano (Cl. 5).",
        "Confrontare gli aspetti religiosi, sociali e tecnologici delle civiltà antiche (Cl. 4-5).",
        "Ricostruire la storia di un monumento o plesso della scuola tramite fonti materiali (Cl. 5)."
      ],
      "proposals": [
        {
          "id": "sto-prim-1",
          "focus": "Sviluppo dell'alfabetizzazione critica delle fonti",
          "oldText": "Riconosce ed analizza diverse fonti storiche.",
          "newText": "Indaga criticamente le fonti (scritte, orali, visive, materiali d'Istituto) compiendo semplici incroci documentari per confutare e validare informazioni storiche. [IN 2025: metodo storico applicato]",
          "notes": "Parere dello Swarm di Esperti (Didattica): Allena il discente fin dalla scuola primaria al rifiuto delle fake news mediante l'analisi empirica e oggettiva dei fatti materiali d'archivio."
        }
      ],
      "evidenze": [
        "Inserisce 5 date storiche note sulla linea del tempo in ordine cronologico",
        "Interpreta una fonte materiale descrivendo l'uso dell'oggetto nel passato",
        "Spiega le ragioni geografiche ed economiche della nascita della civiltà egizia",
        "Descrive la struttura della polis greca e la differenza tra Atene e Sparta"
      ],
      "nucleiFondanti": ["Uso delle fonti", "Organizzazione delle informazioni", "Strumenti concettuali", "Produzione scritta e orale"]
    },
    "secondaria": {
      "traguardi": [
        "L'alunno analizza i passaggi fondamentali dal Medioevo all'Età Contemporanea collocando gli eventi nel tempo.",
        "Interpreta fonti storiche complesse, documenti d'archivio e testi storiografici confrontandone i punti di vista.",
        "Sviluppa un pensiero critico circa le cause e conseguenze dei grandi conflitti e delle rivoluzioni."
      ],
      "obiettivi": [
        "Analizzare la fine dell'Impero Romano d'Occidente e le invasioni barbariche (Cl. 1).",
        "Descrivere il feudalesimo, l'incastellamento, la nascita dei Comuni e le Crociate (Cl. 1).",
        "Analizzare la scoperta dell'America, il Rinascimento, la Riforma e Controriforma (Cl. 2).",
        "Descrivere la Rivoluzione Industriale, la Rivoluzione Francese e l'impero napoleonico (Cl. 2).",
        "Conoscere il Risorgimento italiano, l'Unità d'Italia e la prima guerra mondiale (Cl. 3).",
        "Analizzare i totalitarismi, la seconda guerra mondiale, la Resistenza e la nascita della Repubblica (Cl. 3).",
        "Confrontare fonti documentarie contrapposte per ricostruire un evento storico controverso (Cl. 2-3).",
        "Comprendere la nascita dell'Unione Europea, della Costituzione e della Repubblica (Cl. 3)."
      ],
      "proposals": [
        {
          "id": "sto-sec-1",
          "focus": "Critica Storica e De-misinformazione",
          "oldText": "Analizza documenti e fonti storiche di vario genere.",
          "newText": "Sviluppa l'alfabetizzazione critica mediatica (Media Literacy), confutando tesi preconcette e smascherando le alterazioni storiche e la propaganda geopolitica sul web. [IN 2025: storia critica dei media]",
          "notes": "Parere dello Swarm di Esperti (Psicologia della Conoscenza): Aiuta l'adolescente a de-strutturare i condizionamenti e la manipolazione informativa algoritmica mediante il metodo storiografico formale."
        }
      ],
      "evidenze": [
        "Spiega le cause economico-sociali dell'avvento della Rivoluzione Industriale",
        "Analizza e parafrasa una fonte scritta d'epoca (es. un proclama del Risorgimento)",
        "Spiega la struttura della Costituzione italiana e l'importanza dell'Articolo 1",
        "Disegna lo schema delle alleanze geopolitiche prima dello scoppio della Grande Guerra"
      ],
      "nucleiFondanti": ["Uso delle fonti", "Organizzazione delle informazioni", "Strumenti concettuali", "Produzione scritta e orale"]
    }
  },
  "geografia": {
    "infanzia": {
      "traguardi": [
        "Il bambino si orienta nello spazio d'aula e di plesso seguendo percorsi grafici guidati.",
        "Identifica gli elementi caratterizzanti dei paesaggi noti (città, campagna, montagna, mare)."
      ],
      "obiettivi": [
        "Muoversi nello spazio scolastico seguendo indicazioni verbali d'Istituto.",
        "Disegnare semplici mappe e piante degli spazi d'aula e della propria cameretta.",
        "Riconoscere e descrivere elementi naturali ed antropici dei paesaggi quotidiani.",
        "Associare determinati animali o piante al loro habitat naturale (es. pesci al mare).",
        "Rispettare l'ambiente scolastico differenziando correttamente i rifiuti d'aula."
      ],
      "proposals": [],
      "evidenze": [
        "Trova un oggetto nascosto in aula seguendo una mappa semplificata",
        "Distingue elementi naturali (alberi) ed antropici (strade) in un disegno d'aula",
        "Descrive a parole le caratteristiche essenziali del paesaggio di montagna"
      ],
      "nucleiFondanti": ["La conoscenza del mondo"]
    },
    "primaria": {
      "traguardi": [
        "L'alunno si orienta nello spazio circostante e sulle carte geografiche utilizzando la bussola e i punti cardinali.",
        "Conosce, descrive e rappresenta le caratteristiche dei paesaggi italiani (montano, collinare, pianeggiante, marino).",
        "Comprende il concetto di regione geografica e analizza la divisione amministrativa del territorio italiano."
      ],
      "obiettivi": [
        "Orientarsi nello spazio reale e grafico utilizzando i punti cardinali (Cl. 1-3).",
        "Riconoscere la differenza tra elementi fisici e antropici di un paesaggio (Cl. 2-3).",
        "Leggere ed interpretare piante d'aula, mappe di quartiere e carte geografiche fisiche (Cl. 3).",
        "Descrivere le Alpi, gli Appennini, la pianura Padana e i mari italiani (Cl. 4).",
        "Comprendere la divisione dell'Italia in regioni fisiche, climatiche e amministrative (Cl. 4-5).",
        "Analizzare le attività economiche dei tre settori (primario, secondario, terziario) (Cl. 4-5).",
        "Conoscere il territorio, i fiumi, i laghi e le montagne della Campania (Cl. 4-5).",
        "Identificare i capoluoghi di regione italiani sulla carta geografica d'aula (Cl. 5)."
      ],
      "proposals": [
        {
          "id": "geo-prim-1",
          "focus": "Sostenibilità Geografica d'Istituto",
          "oldText": "Riconosce l'importanza dell'ambiente ed adotta stili responsabili.",
          "newText": "Analizza l'interazione uomo-ambiente e promuove la tutela del territorio irpino, descrivendone il potenziale idrogeologico ed agricolo. [IN 2025: geografia applicata]",
          "notes": "Parere dello Swarm di Esperti: Traduce la geografia fisica in consapevolezza civica ed ecofondativa locale, stimolando il senso di appartenenza territoriale e di custodia della terra."
        }
      ],
      "evidenze": [
        "Individua i quattro punti cardinali all'interno della mappa d'aula scolastica",
        "Associa un elenco di attività economiche al rispettivo settore (es. agricoltura-primario)",
        "Colloca fiumi e laghi italiani principali sulla mappa muta dell'Italia",
        "Descrive le caratteristiche fisiche e climatiche della regione Campania"
      ],
      "nucleiFondanti": ["Orientamento", "Linguaggio della geo-graficità", "Paesaggio", "Regione e sistema territoriale"]
    },
    "secondaria": {
      "traguardi": [
        "L'alunno si orienta su carte geografiche a diversa scala utilizzando le coordinate geografiche.",
        "Analizza le caratteristiche fisiche, demografiche ed economiche dell'Italia, dell'Europa e del Mondo.",
        "Comprende i grandi problemi globali: urbanizzazione, tutela ambientale, flussi migratori e risorse."
      ],
      "obiettivi": [
        "Utilizzare latitudine e longitudine per localizzare punti sulla terra (Cl. 1).",
        "Descrivere la morfologia, l'idrografia, il clima e la vegetazione dell'Europa (Cl. 1).",
        "Analizzare la demografia, la densità di popolazione e i flussi migratori europei (Cl. 1-2).",
        "Studiare le caratteristiche geopolitiche ed economiche dei paesi dell'Unione Europea (Cl. 2).",
        "Conoscere i grandi continenti: Asia, Africa, Americhe, Oceania (Cl. 3).",
        "Analizzare gli squilibri globali, la distribuzione della ricchezza e le fonti energetiche (Cl. 3).",
        "Comprendere l'agenda 2030 per lo sviluppo sostenibile d'Istituto (Cl. 1-3).",
        "Interpretare dati demografici ed economici tramite piramidi delle età e indici d'area (Cl. 2-3)."
      ],
      "proposals": [
        {
          "id": "geo-sec-1",
          "focus": "Sistemi Geopolitici e GIS d'Istituto",
          "oldText": "Utilizza carte e strumenti geografici complessi.",
          "newText": "Interpreta i mutamenti territoriali e demografici globali integrando l'uso critico di mappe satellitari, GIS e indicatori socio-economici del PTOF. [IN 2025: tecnologie GIS]",
          "notes": "Parere dello Swarm di Esperti: L'alfabetizzazione spaziale digitale tramite GIS e telerilevamento potenzia le capacità logico-interpretative spaziali degli studenti (Spatial Literacy)."
        }
      ],
      "evidenze": [
        "Determina le coordinate geografiche esatte di una città d'Europa sulla mappa",
        "Rappresenta graficamente ed analizza la piramide delle età di un paese europeo",
        "Descrive le cause dell'effetto serra e le azioni per ridurre l'impronta carbonica",
        "Confronta l'economia e la struttura sociale di due paesi dell'Unione Europea"
      ],
      "nucleiFondanti": ["Orientamento", "Linguaggio della geo-graficità", "Paesaggio", "Regione e sistema territoriale"]
    }
  },
  "tecnologia": {
    "infanzia": {
      "traguardi": [
        "Il bambino esplora e manipola materiali diversi d'aula in totale sicurezza.",
        "Mostra familiarità con i principali strumenti tecnologici d'aula (LIM, tablet, fotocamera)."
      ],
      "obiettivi": [
        "Sperimentare l'uso di pennelli, tempere, dita e plastilina d'aula.",
        "Utilizzare in modo guidato e corretto il tablet per attività didattiche d'Istituto.",
        "Riconoscere e descrivere il funzionamento di elettrodomestici d'uso comune.",
        "Disegnare e colorare forme geometriche semplici sulla LIM d'aula.",
        "Smontare e rimontare oggetti geometrici a incastro con l'aiuto dei docenti."
      ],
      "proposals": [],
      "evidenze": [
        "Costruisce una torre stabile di 10 mattoncini senza farla cadere in classe",
        "Disegna un cerchio colorato sulla LIM utilizzando il tocco del dito d'aula",
        "Individua le parti principali di un computer d'aula indicandole col dito"
      ],
      "nucleiFondanti": ["La conoscenza del mondo"]
    },
    "primaria": {
      "traguardi": [
        "L'alunno analizza i materiali comuni (carta, legno, plastica, metallo) descrivendone proprietà ed usi.",
        "Rappresenta semplici oggetti tramite disegno tecnico, piante e assonometrie intuitive.",
        "Utilizza con responsabilità le tecnologie digitali per scrivere, disegnare e navigare in rete."
      ],
      "obiettivi": [
        "Classificare i materiali d'uso quotidiano in base a riciclabilità e durezza (Cl. 1-3).",
        "Disegnare la pianta e il prospetto di oggetti geometrici elementari d'aula (Cl. 3).",
        "Riconoscere la differenza tra fonti di energia rinnovabili e non rinnovabili (Cl. 4-5).",
        "Utilizzare un editor di testo per scrivere e formattare brevi relazioni (Cl. 3-4-5).",
        "Comprendere la struttura e il funzionamento del computer: hardware e software (Cl. 4-5).",
        "Creare presentazioni multimediali con immagini, testi e diapositive raccordate (Cl. 5).",
        "Analizzare le fasi del ciclo dei rifiuti e le tecniche di riciclo industriale (Cl. 4-5).",
        "Eseguire semplici algoritmi di coding visivo e blocchi grafici (Scratch) (Cl. 4-5)."
      ],
      "proposals": [
        {
          "id": "tec-prim-1",
          "focus": "Algoritmi e Pensiero Computazionale",
          "oldText": "Esegue semplici istruzioni digitali su computer.",
          "newText": "Progetta ed elabora algoritmi di coding visivo (Scratch) applicando logiche di sequenza, ciclo e diramazione d'Istituto. [IN 2025: pensiero computazionale]",
          "notes": "Parere dello Swarm di Esperti (Psicologia Cognitiva): Sviluppa precocemente l'autonomia di problem-solving e decompone i problemi complessi in micro-istruzioni gestibili (Computational Thinking)."
        }
      ],
      "evidenze": [
        "Disegna lo sviluppo piano (sviluppo geometrico) di un cubo su foglio a quadretti",
        "Scrive e formatta un testo di 100 parole sul computer d'aula salvandolo in cartella",
        "Spiega la differenza tra energia eolica ed energia da combustibili fossili d'aula",
        "Realizza una sequenza di coding su Scratch per far muovere un personaggio a schermo"
      ],
      "nucleiFondanti": ["Vedere, osservare e sperimentare", "Prevedere e immaginare", "Intervenire e trasformare"]
    },
    "secondaria": {
      "traguardi": [
        "L'alunno realizza disegni tecnici complessi applicando le proiezioni ortogonali e le assonometrie.",
        "Analizza i processi tecnologici industriali, le centrali elettriche e l'estrazione dei materiali.",
        "Progetta e realizza semplici modelli tridimensionali digitali ed algoritmi di programmazione."
      ],
      "obiettivi": [
        "Eseguire il disegno in proiezioni ortogonali di solidi isolati e gruppi di solidi (Cl. 1).",
        "Eseguire disegni in assonometria isometrica, cavaliera e monometrica di solidi (Cl. 2).",
        "Studiare l'industria siderurgica, chimica, ceramica e alimentare locale (Cl. 1-2).",
        "Analizzare il funzionamento di centrali idroelettriche, termoelettriche, nucleari e solari (Cl. 2).",
        "Utilizzare software CAD 2D/3D (Blender, Tinkercad) per modellizzare oggetti d'Istituto (Cl. 3).",
        "Sviluppare algoritmi complessi con strutture condizionali e cicliche (coding) (Cl. 2-3).",
        "Comprendere la rete internet, gli indirizzi IP, i motori di ricerca ed i server (Cl. 1-3).",
        "Progettare un manufatto cartaceo o in legno calcolandone i costi e le fasi di lavoro (Cl. 2-3)."
      ],
      "proposals": [
        {
          "id": "tec-sec-1",
          "focus": "Modellazione CAD 3D e Prototipazione",
          "oldText": "Disegna e progetta modelli tecnici bidimensionali.",
          "newText": "Progetta e realizza modelli geometrici tridimensionali complessi tramite software CAD d'Istituto (Tinkercad, Blender d'area), raccordandoli alla modellazione reale. [IN 2025: modellazione 3D]",
          "notes": "Parere dello Swarm di Esperti (Didattica): Stimola l'intelligenza spaziale tridimensionale (visuo-spatial processing), preparando la mente dello studente alle logiche dell'ingegneria e del design."
        }
      ],
      "evidenze": [
        "Disegna in proiezione ortogonale una piramide a base esagonale sezionata",
        "Modella sul software CAD Tinkercad un ingranaggio meccanico d'Istituto",
        "Spiega il funzionamento di una centrale idroelettrica disegnandone il percorso acqua",
        "Analizza i consumi energetici della propria abitazione proponendo riduzioni"
      ],
      "nucleiFondanti": ["Disegno Tecnico", "Materiali e Processi Industriali", "Energia e Fonti", "Informatica, Coding e CAD"]
    }
  },
  "inglese": {
    "infanzia": {
      "traguardi": [
        "Il bambino riconosce ed imita parole, suoni e filastrocche in lingua inglese d'Istituto.",
        "Comprende semplici comandi d'aula mimati dai docenti d'area."
      ],
      "obiettivi": [
        "Memorizzare i numeri in lingua inglese da 1 a 5.",
        "Riconoscere e nominare i colori principali (red, blue, yellow, green).",
        "Rispondere con la gestualità fine a canzoncine animate tradizionali inglesi.",
        "Comprendere comandi d'aula base (sit down, stand up, open the book).",
        "Salutare in inglese all'ingresso ed all'uscita d'aula (hello, goodbye)."
      ],
      "proposals": [],
      "evidenze": [
        "Conta fino a 5 in lingua inglese mostrando le dita corrispondenti in classe",
        "Tocca l'oggetto rosso in aula quando l'insegnante pronuncia 'red'",
        "Esegue all'istante il comando 'sit down' sedendosi sulla sedia d'aula"
      ],
      "nucleiFondanti": ["I discorsi e le parole"]
    },
    "primaria": {
      "traguardi": [
        "L'alunno comprende brevi testi orali in inglese su argomenti familiari legati alla vita quotidiana.",
        "Interagisce in semplici scambi comunicativi orali descrivendo se stesso, la famiglia e i propri gusti.",
        "Legge e comprende brevi frasi scritte, ricopiandole o completandole con lessico idoneo."
      ],
      "obiettivi": [
        "Comprendere istruzioni, domande e descrizioni orali su argomenti noti (Cl. 1-3).",
        "Presentarsi descrivendo nome, età, provenienza e membri della famiglia (Cl. 1-3).",
        "Contare verbalmente e per iscritto fino a 100 in inglese (Cl. 1-4).",
        "Riconoscere e descrivere gli animali domestici, le parti della casa e i cibi (Cl. 2-3).",
        "Leggere ed abbinare vocaboli scritti a illustrazioni corrispondenti (Cl. 3).",
        "Esprimere preferenze, gusti, capacità e possesso (like, can, have got) (Cl. 3-4-5).",
        "Scrivere brevi testi personali o email-modello seguendo una traccia strutturata (Cl. 4-5).",
        "Comprendere testi scritti di livello A1 del Quadro Comune Europeo (QCER) (Cl. 5)."
      ],
      "proposals": [],
      "evidenze": [
        "Scrive una cartolina di presentazione personale descrivendo età, famiglia e cibi graditi",
        "Legge un testo di 50 parole in inglese ad alta voce con pronuncia corretta",
        "Risponde a voce a domande del tipo 'What is your name? How old are you?'",
        "Completa una griglia abbinando i vestiti alle stagioni in lingua inglese"
      ],
      "nucleiFondanti": ["Ascolto (Listening)", "Parlato (Speaking)", "Lettura (Reading)", "Scrittura (Writing)", "Riflessione sulla lingua"]
    },
    "secondaria": {
      "traguardi": [
        "L'alunno comprende conversazioni orali ed esposizioni su argomenti di studio di livello A2 del QCER.",
        "Interagisce in modo spontaneo in scambi comunicativi orali, esprimendo opinioni e piani futuri.",
        "Legge, comprende e scrive testi coerenti e strutturati su argomenti culturali e della società."
      ],
      "obiettivi": [
        "Comprendere messaggi orali, annunci e brani di studio di livello A2 (Cl. 1-2).",
        "Descrivere esperienze passate, eventi storici e progetti futuri (past simple, will/going to) (Cl. 1-3).",
        "Leggere e comprendere testi informativi, letterari e culturali sui paesi anglosassoni (Cl. 1-3).",
        "Scrivere lettere informali, recensioni di film o libri, e testi descrittivi di 120 parole (Cl. 2-3).",
        "Applicare correttamente le regole grammaticali di morfosintassi e l'ordine dei connettivi (Cl. 1-3).",
        "Sostenere un colloquio orale descrivendo un argomento d'esame in lingua inglese (Cl. 3).",
        "Comprendere l'uso di verbi modali per obbligo, divieto e consiglio (must, should, have to) (Cl. 2-3).",
        "Arricchire il lessico d'uso accademico e tecnologico (digitale, ambiente, sport) (Cl. 1-3)."
      ],
      "proposals": [],
      "evidenze": [
        "Redige una recensione scritta in inglese di un libro letto descrivendone la trama",
        "Espone oralmente in inglese una presentazione su un personaggio storico studiato",
        "Supera un test scritto di comprensione alla lettura (Reading Comprehension) A2",
        "Utilizza correttamente i tempi passati per raccontare una vacanza scolastica passata"
      ],
      "nucleiFondanti": ["Ascolto (Listening)", "Parlato (Speaking/Interaction)", "Lettura (Reading)", "Scrittura (Writing)", "Riflessione sulla lingua (Grammar)"]
    }
  },
  "secondaLingua": {
    "infanzia": {
      "traguardi": [],
      "obiettivi": [],
      "proposals": [],
      "evidenze": [],
      "nucleiFondanti": []
    },
    "primaria": {
      "traguardi": [],
      "obiettivi": [],
      "proposals": [],
      "evidenze": [],
      "nucleiFondanti": []
    },
    "secondaria": {
      "traguardi": [
        "L'alunno comprende semplici testi orali e frasi scritte di livello A1 del QCER in seconda lingua (es. Francese/Spagnolo).",
        "Compie brevi scambi comunicativi orali descrivendo se stesso, le attività d'aula ed i propri bisogni.",
        "Scrive frasi corrette e testi elementari di presentazione personale e d'aula."
      ],
      "obiettivi": [
        "Comprendere istruzioni verbali e domande orali elementari d'aula (Cl. 1).",
        "Presentarsi, descrivere la famiglia, l'età e i propri gusti personali (Cl. 1-2).",
        "Contare verbalmente e scrivere i numeri da 1 a 50 in seconda lingua (Cl. 1).",
        "Esprimere il possesso, l'orario e le preferenze alimentari (Cl. 2).",
        "Leggere e comprendere un testo di 60 parole su argomenti familiari (Cl. 1-3).",
        "Scrivere una breve cartolina di auguri o di presentazione (Cl. 2-3).",
        "Utilizzare correttamente i verbi regolari al tempo presente ed i principali ausiliari (Cl. 1-3).",
        "Descrivere gli aspetti culturali e festività principali del paese d'origine (Cl. 2-3)."
      ],
      "proposals": [],
      "evidenze": [
        "Scrive un'email di presentazione di 50 parole descrivendo la scuola e i propri amici",
        "Esegue la lettura ad alta voce di un testo elementare con pronuncia accettabile",
        "Risponde oralmente a domande riguardanti l'ora, la data ed il meteo in lingua",
        "Disegna la mappa d'Europa colorando il paese di cui studia la seconda lingua"
      ],
      "nucleiFondanti": ["Ascolto (Listening)", "Parlato (Speaking)", "Lettura (Reading)", "Scrittura (Writing)", "Riflessione sulla lingua"]
    }
  },
  "arteImmagine": {
    "infanzia": {
      "traguardi": [
        "Il bambino si esprime liberamente attraverso il disegno, la pittura e le attività plastiche d'aula.",
        "Riconosce e apprezza i colori primari e secondari della tavolozza d'Istituto."
      ],
      "obiettivi": [
        "Sperimentare l'uso di pennelli, tempere, dita e plastilina d'aula.",
        "Colorare all'interno di margini geometrici definiti senza uscire dai bordi.",
        "Rappresentare graficamente la figura umana inserendo testa, occhi, braccia, gambe.",
        "Miscelare i colori primari per scoprire e generare i colori secondari.",
        "Rispettare gli spazi di lavoro e pulire i pennelli a fine attività d'aula."
      ],
      "proposals": [],
      "evidenze": [
        "Esegue la pittura di un paesaggio miscelando giallo e blu per ottenere il verde",
        "Modella una mela tridimensionale di plastilina riproducendone la forma reale",
        "Disegna il ritratto del compagno inserendo tutti i particolari del viso d'aula"
      ],
      "nucleiFondanti": ["Immagini, suoni, colori"]
    },
    "primaria": {
      "traguardi": [
        "L'alunno utilizza diverse tecniche artistiche (disegno, pittura, collage, texture) per esprime la propria creatività.",
        "Riconosce ed analizza gli elementi del linguaggio visivo: punto, linea, colore, luce, spazio.",
        "Osserva e descrive opere d'arte di epoche diverse descrivendo sensazioni ed emozioni provate."
      ],
      "obiettivi": [
        "Sperimentare l'uso di matite colorate, di pennarelli, acquerelli e collage (Cl. 1-3).",
        "Utilizzare il punto e la linea per creare effetti di chiaroscuro e profondità (Cl. 2-3).",
        "Descrivere e classificare i colori caldi, freddi, complementari e neutri (Cl. 3-4).",
        "Produrre elaborati creativi applicando la prospettiva intuitiva ed il piano focale (Cl. 4-5).",
        "Conoscere le opere d'arte principali della tradizione italiana (Leonardo, Michelangelo, Giotto) (Cl. 4-5).",
        "Realizzare cartelloni d'Istituto utilizzando tecniche miste e materiali riciclati (Cl. 4-5).",
        "Analizzare un'immagine pubblicitaria individuandone il messaggio comunicativo (Cl. 5).",
        "Descrivere i monumenti e le opere d'arte principali della Campania e di Ariano (Cl. 5)."
      ],
      "proposals": [],
      "evidenze": [
        "Realizza un disegno applicando la tecnica del puntinismo per dare volume",
        "Compila una scheda di lettura d'opera descrivendone il soggetto ed i colori",
        "Realizza un collage geometrico ispirato ad un'opera di arte contemporanea",
        "Spiega a parole la differenza tra colori caldi e freddi mostrando campioni visivi"
      ],
      "nucleiFondanti": ["Esprimersi e comunicare", "Osservare e leggere le immagini", "Comprendere e apprezzare le opere d'arte"]
    },
    "secondaria": {
      "traguardi": [
        "L'alunno realizza elaborati artistici complessi applicando tecniche grafiche, pittoriche e plastiche strutturate.",
        "Analizza e decodifica i codici visivi, la prospettiva scientifica, la composizione e la luce in un'opera.",
        "Conosce l'evoluzione della storia dell'arte dal paleolitico alle correnti contemporanee collocandola nel tempo."
      ],
      "obiettivi": [
        "Utilizzare con precisione matite, chine, tempere ed acrilici per scopi espressivi (Cl. 1).",
        "Disegnare figure solide applicando la prospettiva centrale ed accidentale (Cl. 1-2).",
        "Analizzare la struttura compositiva, l'uso del colore e della luce in un dipinto classico (Cl. 1-3).",
        "Studiare l'arte classica greca e romana, il Gotico, il Rinascimento ed il Barocco (Cl. 1-2).",
        "Studiare l'Impressionismo, le Avanguardie storiche e l'arte contemporanea (Cl. 2-3).",
        "Progettare elaborati grafici digitali applicando i codici della grafica pubblicitaria (Cl. 3).",
        "Conoscere il patrimonio artistico e i siti archeologici della Campania (Pompeis, Ercolano) (Cl. 2-3).",
        "Realizzare modelli tridimensionali artistici con argilla, cartapesta o gesso (Cl. 2-3)."
      ],
      "proposals": [],
      "evidenze": [
        "Esegue lo schizzo prospettico di un corridoio della scuola con punto di fuga centrale",
        "Elabora l'analisi scritta ed estetica di un'opera d'arte del Rinascimento italiano",
        "Realizza un poster grafico digitale per un evento scolastico d'Istituto",
        "Modella in argilla un bassorilievo geometrico curando la texture delle superfici"
      ],
      "nucleiFondanti": ["Esprimersi e comunicare", "Osservare e leggere le immagini", "Comprendere e apprezzare le opere d'arte"]
    }
  },
  "musica": {
    "infanzia": {
      "traguardi": [
        "Il bambino ascolta e discrimina suoni, rumori d'ambiente e ritmi d'aula scolastica.",
        "Partecipa a canti corali coordinando il canto con il movimento del corpo."
      ],
      "obiettivi": [
        "Identificare e descrivere rumori d'aula, suoni della natura e versi di animali.",
        "Riprodurre battiti di mani e ritmi corporei semplici proposti dai docenti.",
        "Memorizzare e cantare in coro canzoncine d'infanzia ad alta voce.",
        "Sperimentare l'uso di piccoli strumenti a percussione (maracas, legnetti).",
        "Muoversi a ritmo seguendo variazioni di velocità della musica d'aula."
      ],
      "proposals": [],
      "evidenze": [
        "Batte le mani a ritmo imitando perfettamente la sequenza del docente",
        "Riconosce il suono del triangolo e dei piattini senza guardarli in classe",
        "Canta in coro a tempo intonando la canzoncina scolastica d'ingresso d'aula"
      ],
      "nucleiFondanti": ["Immagini, suoni, colori"]
    },
    "primaria": {
      "traguardi": [
        "L'alunno canta in coro brani monofonici ed esegue semplici sequenze ritmiche con gli strumenti d'aula.",
        "Riconosce, discrimina ed analizza i parametri del suono: altezza, intensità, timbro, durata.",
        "Ascolta brani musicali di generi diversi individuandone la struttura formale elementare."
      ],
      "obiettivi": [
        "Eseguire canti corali all'unisono curando l'intonazione e la respirazione (Cl. 1-3).",
        "Riconoscere e discriminare la differenza tra suoni acuti/gravi, forti/piano, lunghi/corti (Cl. 1-3).",
        "Leggere e scrivere le note musicali sul pentagramma in chiave di violino (Cl. 2-3).",
        "Suonare semplici melodie con il flauto dolce, il metallofono o la tastiera (Cl. 3-4-5).",
        "Comprendere la struttura formale di un brano: strofa, ritornello, tema, variazioni (Cl. 3-4-5).",
        "Classificare gli strumenti dell'orchestra sinfonica in famiglie di timbri (Cl. 4-5).",
        "Eseguire poliritmie e sequenze di body percussion coordinate di classe (Cl. 4-5).",
        "Ascoltare ed analizzare capolavori della musica classica (Vivaldi, Mozart, Beethoven) (Cl. 4-5)."
      ],
      "proposals": [],
      "evidenze": [
        "Scrive la scala musicale di Do maggiore sul pentagramma in chiave di violino",
        "Esegue con il flauto dolce una melodia di 8 battute leggendo lo spartito d'aula",
        "Batte a tempo una poliritmia coordinata dividendosi in due gruppi in classe",
        "Identifica il timbro dell'oboe e del corno durante l'ascolto di un brano orchestrale"
      ],
      "nucleiFondanti": ["Produzione", "Percezione"]
    },
    "secondaria": {
      "traguardi": [
        "L'alunno esegue brani musicali complessi a più voci (corali o strumentali) leggendo la partitura.",
        "Analizza i codici della notazione musicale, la sintassi armonica e le strutture formali classiche.",
        "Conosce la storia della musica dal gregoriano al pop contemporaneo collocandola nel contesto culturale."
      ],
      "obiettivi": [
        "Eseguire brani polifonici corali o strumentali (flauto, tastiera, chitarra) (Cl. 1).",
        "Leggere, scrivere ed eseguire partiture in metri semplici e composti (Cl. 1-2).",
        "Riconoscere la struttura della sonata, della sinfonia, del concerto e del melodramma (Cl. 2-3).",
        "Studiare la storia della musica: Rinascimento, Barocco, Classicismo, Romanticismo (Cl. 1-2).",
        "Studiare la musica del Novecento, le avanguardie, il Jazz, il Rock ed il Pop (Cl. 2-3).",
        "Utilizzare software di editing musicale (GarageBand, MuseScore) per comporre (Cl. 3).",
        "Analizzare l'uso della musica nel cinema, nella pubblicità ed i codici audiovisivi (Cl. 3).",
        "Eseguire un arrangiamento musicale d'insieme per la festa di fine anno d'Istituto (Cl. 3)."
      ],
      "proposals": [],
      "evidenze": [
        "Suona in trio o quartetto strumentale leggendo la propria parte sulla partitura",
        "Scrive l'analisi storico-estetica di un'opera lirica o di un brano sinfonico noto",
        "Compone una sequenza ritmico-melodica di 16 battute su software di notazione",
        "Espone la biografia ed il contributo innovativo di un grande compositore classico"
      ],
      "nucleiFondanti": ["Produzione", "Percezione"]
    }
  },
  "educazioneFisica": {
    "infanzia": {
      "traguardi": [
        "Il bambino controlla gli schemi motori di base (camminare, correre, saltare, lanciare).",
        "Sviluppa la coordinazione oculo-manuale e la consapevolezza del proprio corpo nello spazio."
      ],
      "obiettivi": [
        "Eseguire percorsi ginnici coordinati saltando ostacoli bassi d'aula.",
        "Afferrare e lanciare una palla medica morbida con entrambe le mani d'aula.",
        "Muoversi agilmente a carponi, rotolare ed eseguire capriole sul tappeto.",
        "Rimanere in equilibrio statico su un solo piede per almeno 5 secondi in classe.",
        "Coordinare i movimenti del corpo seguendo canzoncine e balli d'infanzia d'area."
      ],
      "proposals": [],
      "evidenze": [
        "Completa il percorso ginnico d'aula senza urtare i birilli d'ostacolo",
        "Mantiene l'equilibrio su una trave bassa per l'intera lunghezza fisica",
        "Afferra al volo una palla lanciata da un compagno da 2 metri di distanza"
      ],
      "nucleiFondanti": ["Il corpo e il movimento"]
    },
    "primaria": {
      "traguardi": [
        "L'alunno esegue combinazioni motorie complesse coordinando i movimenti in situazioni di gioco-sport.",
        "Comprende ed applica le regole dei giochi di squadra, collaborando con i compagni e rispettando l'avversario.",
        "Riconosce i benefici dell'attività fisica regolare per il benessere e la propria salute corporea."
      ],
      "obiettivi": [
        "Eseguire schemi motori combinati coordinando corsa, salto, lancio e capriole (Cl. 1-3).",
        "Sviluppare la percezione spazio-temporale coordinando i movimenti su stimoli sonori (Cl. 1-3).",
        "Conoscere ed applicare le regole fondamentali di mini-volley, mini-basket e pallapallone (Cl. 3-4).",
        "Eseguire esercizi di mobilità articolare, allungamento muscolare e respirazione (Cl. 2-5).",
        "Partecipare attivamente a staffette e giochi di squadra cooperando per lo scopo comune (Cl. 3-4-5).",
        "Comprendere il valore del fair-play, dell'inclusione d'aula e del rispetto delle regole (Cl. 4-5).",
        "Riconoscere l'importanza dell'idratazione e dell'igiene personale dopo lo sport (Cl. 4-5).",
        "Eseguire percorsi coordinati a tempo registrando il proprio miglioramento atletico (Cl. 5)."
      ],
      "proposals": [],
      "evidenze": [
        "Completa un percorso coordinato a tempo superando ostacoli e lanciando a canestro",
        "Dimostra comportamenti di rispetto (fair-play) accettando le decisioni dell'arbitro",
        "Esegue la battuta e la ricezione di base nel gioco guidato del mini-volley d'aula",
        "Descrive l'importanza di una corretta merenda prima dell'allenamento sportivo"
      ],
      "nucleiFondanti": ["Il corpo e la sua relazione con lo spazio e il tempo", "Il linguaggio del corpo come modalità comunicativo-espressiva", "Il gioco, lo sport, le regole e il fair play", "Sicurezza e prevenzione, salute e corretti stili di vita"]
    },
    "secondaria": {
      "traguardi": [
        "L'alunno esegue gesti tecnici complessi dei giochi sportivi di squadra (pallavolo, basket, calcio, pallamano).",
        "Padroneggia le capacità condizionali (forza, velocità, resistenza, mobilità) migliorandole con l'allenamento.",
        "Assume la responsabilità della sicurezza propria e dei compagni in palestra, applicando le norme di prevenzione."
      ],
      "obiettivi": [
        "Eseguire schemi motori coordinati complessi, rotazioni e passaggi tecnici sportivi (Cl. 1).",
        "Applicare tattiche di gioco d'attacco e difesa nei tornei d'Istituto (Cl. 1-3).",
        "Eseguire test atletici di resistenza (test di Cooper), velocità e forza controllata (Cl. 2).",
        "Svolgere il ruolo di arbitro o capitano di squadra con imparzialità e responsabilità (Cl. 2-3).",
        "Comprendere la biomeccanica del corpo umano, il funzionamento dei muscoli e del cuore (Cl. 1-3).",
        "Praticare discipline dell'atletica leggera: corsa veloce, salto in alto, getto del peso (Cl. 2-3).",
        "Applicare le manovre di primo soccorso ed i comportamenti di sicurezza in palestra (Cl. 3).",
        "Pianificare una routine di riscaldamento muscolare autonoma prima dell'attività (Cl. 2-3)."
      ],
      "proposals": [],
      "evidenze": [
        "Guida una sessione di riscaldamento di 5 minuti per l'intera classe in palestra",
        "Applica il fair-play aiutando un avversario caduto a terra durante il torneo",
        "Supera la prova atletica di salto in alto raggiungendo l'altezza minima prevista",
        "Esegue correttamente la respirazione bocca-bocca e massaggio su manichino d'aula"
      ],
      "nucleiFondanti": ["Il corpo e la sua relazione con lo spazio e il tempo", "Il linguaggio del corpo come modalità comunicativo-espressiva", "Il gioco, lo sport, le regole e il fair play", "Sicurezza e prevenzione, salute e corretti stili di vita"]
    }
  },
  "educazioneCivica": {
    "infanzia": {
      "traguardi": [
        "Il bambino comprende l'importanza delle regole per vivere bene insieme in aula statale.",
        "Mostra rispetto verso l'ambiente scolastico e le risorse comuni (acqua, carta, colori)."
      ],
      "obiettivi": [
        "Rispettare il proprio turno di parola durante i cerchi d'ascolto d'Istituto.",
        "Condividere i giochi d'aula e i colori con i compagni senza litigare.",
        "Differenziare i rifiuti nel plesso scolastico seguendo i colori dei bidoni d'area.",
        "Chiudere il rubinetto dell'acqua d'Istituto dopo il lavaggio delle mani per evitare sprechi.",
        "Prendersi cura delle piantine del giardino d'Istituto bagnandole con regolarità."
      ],
      "proposals": [],
      "evidenze": [
        "Resta in ascolto mentre un compagno racconta un episodio senza interrompere",
        "Ripone i giochi nella scatola di appartenenza a fine giornata scolastica",
        "Spegne la luce d'aula quando la classe si sposta in palestra per educazione"
      ],
      "nucleiFondanti": ["Il sé e l'altro"]
    },
    "primaria": {
      "traguardi": [
        "L'alunno conosce la struttura della Costituzione italiana e l'importanza dei diritti e doveri del cittadino.",
        "Comprende i principi della cittadinanza digitale, l'uso sicuro della rete e la tutela della propria identità.",
        "Adotta comportamenti ecosostenibili in linea con l'Agenda 2030 d'Istituto per lo sviluppo sostenibile."
      ],
      "obiettivi": [
        "Riconoscere l'importanza dei simboli della Repubblica: bandiera, inno, emblema (Cl. 1-2).",
        "Comprendere il significato di norme e regole d'aula raccordandole alla vita scolastica (Cl. 1-3).",
        "Studiare i diritti dei bambini (Convenzione ONU) ed i doveri della classe (Cl. 2-3).",
        "Analizzare l'importanza dell'acqua, del riciclo dei rifiuti e del risparmio energetico (Cl. 3-4).",
        "Comprendere i pericoli della navigazione web, della condivisione foto e del cyberbullismo (Cl. 4-5).",
        "Studiare gli articoli fondamentali della Costituzione (Articoli 1-12) (Cl. 4-5).",
        "Rispettare le differenze di genere, interculturali e di disabilità in aula (Cl. 3-4-5).",
        "Analizzare l'Agenda 2030 d'Istituto proponendo azioni ecosostenibili concrete (Cl. 5)."
      ],
      "proposals": [
        {
          "id": "civ-prim-1",
          "focus": "Sviluppo Ecosostenibile (Agenda 2030)",
          "oldText": "Riconosce i principi dello sviluppo sostenibile legati alla tutela ambientale.",
          "newText": "Adotta stabilmente comportamenti volti al risparmio energetico e idrico d'Istituto in conformità all'Obiettivo 6 e 13 dell'Agenda 2030. [IN 2025: sostenibilità applicata]",
          "notes": "Parere dello Swarm di Esperti (Psicologia Cognitiva): Convertire l'astrazione ecologica dell'Agenda 2030 in azioni fisiche misurabili (es. pesatura differenziata, chiusura rubinetti) sedimenta l'abitudine e la responsabilità civica permanente."
        }
      ],
      "evidenze": [
        "Spiega per iscritto l'importance di un articolo della Costituzione italiana",
        "Identifica un comportamento a rischio online descrivendone le misure di difesa",
        "Coordina la raccolta differenziata d'aula registrando i rifiuti differenziati",
        "Partecipa alla scrittura del 'Regolamento di comportamento sicuro' della classe"
      ],
      "nucleiFondanti": ["Costituzione", "Sviluppo Sostenibile", "Cittadinanza Digitale"]
    },
    "secondaria": {
      "traguardi": [
        "L'alunno analizza l'ordinamento dello Stato italiano, la divisione dei poteri e gli organi costituzionali.",
        "Analizza criticamente l'evoluzione dei diritti umani e l'importanza della legalità contro le mafie.",
        "Padroneggia l'uso critico dei media, valutando la veridicità delle notizie e l'impatto dell'I.A. d'Istituto."
      ],
      "obiettivi": [
        "Analizzare l'ordinamento dello Stato: Parlamento, Governo, Magistratura, Presidente della Repubblica (Cl. 1).",
        "Studiare l'Unione Europea, la Carta dei Diritti Fondamentali e gli organi europei (Cl. 1-2).",
        "Comprendere le mafie, la criminalità organizzata e la cultura della legalità (Falcone, Borsellino) (Cl. 2).",
        "Riconoscere e contrastare le fake news, il phishing e il cyberbullismo sui social (Cl. 1-3).",
        "Analizzare le implicazioni etiche dell'Intelligenza Artificiale e degli algoritmi digitali (Cl. 2-3).",
        "Studiare lo sviluppo sostenibile, i cambiamenti climatici e l'economia circolare d'Istituto (Cl. 1-3).",
        "Comprendere il funzionamento della democrazia rappresentativa e dei sistemi elettorali (Cl. 3).",
        "Progettare un percorso di cittadinanza attiva e volontariato per il territorio di Ariano (Cl. 3)."
      ],
      "proposals": [
        {
          "id": "civ-sec-1",
          "focus": "Etica dei Dati e dell'Intelligenza Artificiale",
          "oldText": "Utilizza la rete internet per compiere ricerche storiche d'Istituto.",
          "newText": "Analizza criticamente il funzionamento degli algoritmi, i bias dei dati e l'impatto etico-sociale dell'Intelligenza Artificiale, a tutela della propria identità digitale. [IN 2025: modulo etica dell'I.A.]",
          "notes": "Parere dello Swarm di Esperti (Psicologia e Normativa): Sviluppa lo scudo cognitivo contro la manipolazione algoritmica e l'assuefazione da social network (FOMO), raccordandolo con la legge nazionale di tutela dei minori online."
        }
      ],
      "evidenze": [
        "Disegna lo schema di divisione dei tre poteri dello Stato italiano indicandone gli organi",
        "Analizza criticamente un articolo di giornale individuando la presenza di fake news",
        "Elabora una relazione scritta descrivendo l'impatto etico dell'uso dei social network",
        "Partecipa alla scrittura della delibera consiliare simulata per la tutela ambientale"
      ],
      "nucleiFondanti": ["Costituzione", "Sviluppo Sostenibile", "Cittadinanza Digitale"]
    }
  },
  "religione": {
    "infanzia": {
      "traguardi": [],
      "obiettivi": [],
      "proposals": [],
      "evidenze": [],
      "nucleiFondanti": []
    },
    "primaria": {
      "traguardi": [],
      "obiettivi": [],
      "proposals": [],
      "evidenze": [],
      "nucleiFondanti": []
    },
    "secondaria": {
      "traguardi": [],
      "obiettivi": [],
      "proposals": [],
      "evidenze": [],
      "nucleiFondanti": []
    }
  },
  "latino": {
    "infanzia": {
      "traguardi": [],
      "obiettivi": [],
      "proposals": [],
      "evidenze": [],
      "nucleiFondanti": []
    },
    "primaria": {
      "traguardi": [],
      "obiettivi": [],
      "proposals": [],
      "evidenze": [],
      "nucleiFondanti": []
    },
    "secondaria": {
      "traguardi": [
        "L'alunno riconosce l'origine latina della lingua italiana ed il lessico di raccordo storico d'Istituto.",
        "Comprende il significato e l'etimologia di motti, espressioni idiomatiche e vocaboli latini d'uso d'area."
      ],
      "obiettivi": [
        "Identificare le differenze morfologiche di base tra italiano e latino (Cl. 1-2).",
        "Analizzare ed interpretare il significato di espressioni latine d'uso comune (es. carpe diem, non multa sed multum) (Cl. 1-3).",
        "Comprendere l'etimologia di termini complessi raccordandoli con le declinazioni di base (Cl. 2-3).",
        "Analizzare la struttura dei casi e la funzione sintattica del nominativo, genitivo e accusativo (modulo LEL) (Cl. 2-3).",
        "Tradurre semplici frasi latine lineari contenenti la prima e la seconda declinazione (Cl. 2-3).",
        "Conoscere la mitologia greca e romana ed i racconti classici di Ovidio e Virgilio (Cl. 1-3).",
        "Raccordare lo studio della grammatica italiana (analisi logica) con i casi latini (Cl. 2-3).",
        "Presentare un lavoro di ricerca sulla vita quotidiana nell'antica Roma imperiale (Cl. 3)."
      ],
      "proposals": [
        {
          "id": "lat-sec-1",
          "focus": "Diacronia e Raccordo Italiano-Latino",
          "oldText": "Riconosce l'etimologia elementare di alcune parole italiane.",
          "newText": "Confronta sistematicamente le strutture morfosintattiche dell'italiano con quelle del latino (casi e declinazioni di base), comprendendo le dinamiche dell'evoluzione diacronica della lingua. [IN 2025: diacronia linguistica]",
          "notes": "Parere dello Swarm di Esperti (Didattica & Psicologia): Il confronto sistematico tra i due sistemi linguistici allena l'elasticità neuronale-lessicale (metacognizione linguistica) e dimezza i tassi di difficoltà sintattica in italiano."
        }
      ],
      "evidenze": [
        "Determina l'etimologia latina di un gruppo di 10 parole complesse italiane",
        "Traduce una frase latina di 5 parole contenente soggetto, oggetto e verbo lineare",
        "Associa la funzione dei casi latini ai rispettivi complementi della grammatica italiana",
        "Descrive un mito di Ovidio collegandolo ad un'opera d'arte classica nota"
      ],
      "nucleiFondanti": ["Etimologia e Lessico", "Morfosintassi Lineare (LEL)", "Cultura e Civiltà Classica"]
    }
  }
};
