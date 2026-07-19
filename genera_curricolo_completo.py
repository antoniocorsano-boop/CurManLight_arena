import csv

# Definizione del dizionario delle discipline con traguardi, obiettivi ed evidenze per ciascun grado scolastico
curricolo_dati = []

# Discipline e relative aree curricolari d'Istituto
discipline_keys = [
    'italiano', 'matematica', 'scienze', 'tecnologia', 'storia', 'geografia', 
    'inglese', 'secondaLingua', 'arteImmagine', 'musica', 'educazioneFisica', 
    'educazioneCivica', 'religione', 'latino'
]

# 1. POPOLAMENTO SCUOLA DELL'INFANZIA (Fascia Unica 3-5 anni)
# Mappatura dei 5 Campi di Esperienza sui codici delle materie
infanzia_template = {
    'italiano': {
        'traguardi': [
            "Il bambino usa il linguaggio verbale in modo creativo per esprimere bisogni, emozioni, sentimenti.",
            "Sperimenta le prime forme di comunicazione scritta attraverso il pregrafismo fine d'Istituto.",
            "Ascolta e comprende narrazioni d'aula, dimostrando interesse per la lettura guidata."
        ],
        'obiettivi': [
            "Sviluppare la capacità di ascolto attivo e comprensione di testi orali di media complessità.",
            "Esercitare la motricità fine tramite tracciati guidati (linee, asole, greche) propedeutici al corsivo.",
            "Pronunciare correttamente parole ed ampliare il proprio vocabolario fondamentale d'aula.",
            "Saper ricostruire verbalmente una storia ascoltata individuandone l'inizio, lo sviluppo e la fine."
        ],
        'evidenze': [
            "Descrive in modo coerente ed autonomo un'illustrazione complessa mostrata sulla LIM.",
            "Riproduce lettere o simboli dell'alfabeto in corsivo sul foglio a righe grandi d'Istituto.",
            "Riassume verbalmente le scene principali di una fiaba mimando le azioni d'aula.",
            "Traccia linee verticali, orizzontali ed asole rispettando la direzione sinistra-destra."
        ]
    },
    'matematica': {
        'traguardi': [
            "Il bambino raggruppa e ordina oggetti secondo diversi criteri (forma, colore, dimensione).",
            "Si colloca con sicurezza nello spazio grafico e d'aula, completando schemi logici."
        ],
        'obiettivi': [
            "Orientarsi nello spazio grafico e d'aula (sopra/sotto, davanti/dietro, destra/sinistra).",
            "Classificare oggetti fisici in base a due attributi simultanei d'aula.",
            "Contare oggetti fino a 10 e 20 associando il numero alla reale quantità d'elementi.",
            "Identificare e descrivere le figure geometriche piane elementari (cerchio, quadrato, triangolo)."
        ],
        'evidenze': [
            "Ordina una sequenza di 5 oggetti dal più piccolo al più grande.",
            "Raggruppa i blocchi logici d'aula separando i quadrati blu dai cerchi rossi.",
            "Conta a voce alta 10 giocattoli indicandoli in sequenza con il dito in modo ordinato.",
            "Trova ed indica gli oggetti di forma triangolare presenti all'interno dell'aula."
        ]
    },
    'scienze': {
        'traguardi': [
            "Il bambino osserva con attenzione organismi viventi e fenomeni naturali d'aula e di giardino.",
            "Esplora la realtà fisica d'aula attraverso l'uso consapevole dei cinque sensi."
        ],
        'obiettivi': [
            "Discriminare gli stimoli sensoriali utilizzando i cinque sensi in attività laboratoriali.",
            "Osservare i cambiamenti meteorologici e stagionali, registrandone visivamente gli effetti.",
            "Comprendere le differenze biologiche basilari tra elementi viventi (piante) e non viventi."
        ],
        'evidenze': [
            "Associa correttamente le foglie d'autunno ed i fiori di primavera alla corretta stagione d'Istituto.",
            "Distingue ad occhi chiusi 5 stimoli olfattivi d'aula (arancia, rosmarino, caffè).",
            "Registra sul calendario meteorologico della classe il tempo della giornata mediante simboli."
        ]
    },
    'tecnologia': {
        'traguardi': [
            "Il bambino sperimenta i primi concetti di coding logico tramite giochi motori diretti (unplugged).",
            "Utilizza in modo guidato e sicuro i principali sussidi digitali d'aula (LIM)."
        ],
        'obiettivi': [
            "Sviluppare il pensiero computazionale guidando un compagno in percorsi ad ostacoli (unplugged).",
            "Assemblare e scomporre elementi fisici complessi (kit lego, blocchi magnetici).",
            "Identificare la corretta postura e le regole d'uso sicuro dello schermo interattivo LIM."
        ],
        'evidenze': [
            "Completa un percorso a griglia d'aula eseguendo comandi sequenziali avanti, gira, stop.",
            "Costruisce una torre riproducendo l'esatta alternanza cromatica di un modello d'Istituto.",
            "Esegue con il dito semplici giochi di trascinamento e abbinamento forme sullo schermo LIM."
        ]
    },
    'storia': {
        'traguardi': [
            "Il bambino sperimenta i concetti di prima/dopo, prima/adesso e dispone in sequenza eventi.",
            "Ricostruisce la propria storia familiare e d'Istituto attraverso l'analisi guidata di tracce."
        ],
        'obiettivi': [
            "Ordinare temporalmente immagini e sequenze logiche di storie ascoltate d'aula.",
            "Riconoscere ed ordinare le fasi di crescita e sviluppo di una persona o di una pianta.",
            "Comprendere e descrivere il concetto di 'ieri', 'oggi' e 'domani' rispetto alla routine."
        ],
        'evidenze': [
            "Dispone nel corretto ordine temporale 4 immagini della giornata d'infanzia (mattino, pranzo, sera).",
            "Ordina le foto di un neonato, di un bambino dell'infanzia e di un adulto in sequenza.",
            "Risponde correttamente a domande su cosa ha fatto il giorno precedente e cosa farà l'indomani."
        ]
    },
    'geografia': {
        'traguardi': [
            "Il bambino si orienta nello spazio vissuto (aula, plesso, giardino) e traccia semplici mappe.",
            "Descrive le caratteristiche spaziali dei luoghi noti (la propria casa, la scuola, il parco)."
        ],
        'obiettivi': [
            "Rappresentare graficamente la disposizione degli oggetti d'aula visti dall'alto.",
            "Saper navigare fisicamente all'interno degli spazi del plesso scolastico (mensa, palestra).",
            "Identificare confini e ostacoli spaziali all'interno di un'area gioco d'Istituto."
        ],
        'evidenze': [
            "Disegna una mappa del proprio banco posizionando correttamente astuccio e matita.",
            "Accompagna l'insegnante dalla propria aula fino alla mensa d'Istituto senza sbagliare.",
            "Indica ed aggira gli ostacoli fisici disposti in cerchio durante i giochi motori."
        ]
    },
    'inglese': {
        'traguardi': [
            "Il bambino ascolta, comprende e riproduce brevi saluti, i colori, i numeri da 1 a 10 in inglese."
        ],
        'obiettivi': [
            "Comprendere ed eseguire semplici istruzioni orali in lingua (stand up, sit down).",
            "Riconoscere e nominare i colori fondamentali ed i numeri fino a 5 in lingua inglese."
        ],
        'evidenze': [
            "Esegue istantaneamente i movimenti fisici ordinati in lingua inglese dall'insegnante.",
            "Associa la parola 'red', 'blue' e 'yellow' al corrispondente palloncino colorato d'aula."
        ]
    },
    'secondaLingua': {
        'traguardi': [
            "Il bambino scopre l'esistenza di altri codici linguistici (Arbëreshë/Francese) nel plesso Greci."
        ],
        'obiettivi': [
            "Memorizzare ed intonare canti e filastrocche tradizionali della minoranza italo-albanese.",
            "Nominare le parti del corpo ed i principali animali domestici nella lingua Arbëreshë irpina."
        ],
        'evidenze': [
            "Riproduce oralmente i saluti e i nomi degli animali della tradizione Arbëreshë irpina.",
            "Canta in coro con i compagni una filastrocca della minoranza italo-albanese locale."
        ]
    },
    'arteImmagine': {
        'traguardi': [
            "Il bambino manipola materiali diversi, sperimenta la mescolanza dei colori e realizza elaborati.",
            "Si esprime attraverso il disegno libero, la pittura e l'uso creativo di materiali di riciclo."
        ],
        'obiettivi': [
            "Esprimere la propria identità riproducendo graficamente il proprio autoritratto curandone i particolari.",
            "Sperimentare la mescolanza dei colori primari per ottenere i secondari (giallo, rosso, blu).",
            "Utilizzare materiali plasmabili (pongo, argilla, farina) per modellare forme tridimensionali."
        ],
        'evidenze': [
            "Disegna il proprio volto posizionando occhi, naso, bocca e orecchie con proporzioni adeguate.",
            "Mescola le tempere gialle e blu sulla tavolozza per dipingere un prato verde.",
            "Scultura: modella una tazza o una chiocciola utilizzando la plastilina d'Istituto."
        ]
    },
    'musica': {
        'traguardi': [
            "Il bambino riconosce l'altezza dei suoni, riproduce sequenze ritmiche semplici e canta in coro.",
            "Sviluppa la percezione sonora locale ed interagisce con semplici strumenti musicali a percussione."
        ],
        'obiettivi': [
            "Sviluppare la coordinazione ritmica riproducendo schemi sonori guidati in gruppo.",
            "Cimentarsi nel canto corale modulando l'intensità della voce (forte/piano, veloce/lento).",
            "Localizzare una sorgente sonora ad occhi chiusi all'interno dello spazio d'aula."
        ],
        'evidenze': [
            "Riproduce fedelmente una sequenza di 4 battiti alternando mani e piedi a tempo.",
            "Sussurra o intona ad alta voce il ritornello della canzone scolastica seguendo il docente.",
            "Indica con precisione la direzione da cui proviene il suono di un campanellino."
        ]
    },
    'educazioneFisica': {
        'traguardi': [
            "Il bambino padroneggia gli schemi motori di base (camminare, correre, saltare, lanciare).",
            "Acquisisce consapevolezza del proprio schema corporeo ed adotta corrette condotte igieniche."
        ],
        'obiettivi': [
            "Eseguire percorsi di psicomotricità coordinando i movimenti del corpo rispetto a stimoli sonori.",
            "Saltare a piedi uniti ed alternati superando piccoli ostacoli morbidi d'aula.",
            "Lavare ed asciugare le mani in modo autonomo prima dei pasti del plesso scolastico."
        ],
        'evidenze': [
            "Completa una trave d'equilibrio d'aula senza cadere e arrestandosi al segnale acustico.",
            "Supera tre cerchi disposti a terra saltando su un solo piede senza perdere l'equilibrio.",
            "Pratica il corretto lavaggio delle mani con sapone strofinando dita e palmi senza guida."
        ]
    },
    'educazioneCivica': {
        'traguardi': [
            "Il bambino adotta comportamenti rispettosi d'aula, partecipa alla cura dell'ambiente scolastico.",
            "Comprende il valore delle regole del gruppo d'aula, collaborando con i compagni."
        ],
        'obiettivi': [
            "Praticare la condivisione e l'ascolto pacifico durante i momenti di cerchio d'ascolto (Circle Time).",
            "Riconoscere i contenitori della raccolta differenziata in classe dividendo carta e plastica.",
            "Collaborare al riordino dei giochi e dei sussidi didattici d'area al termine dell'attività."
        ],
        'evidenze': [
            "Attende pazientemente il proprio turno per parlare stringendo il testimone della parola d'aula.",
            "Getta i bicchieri di plastica della merenda nel contenitore ecologico corretto d'Istituto.",
            "Ripone le costruzioni logiche d'aula nella scatola corrispondente a fine giornata."
        ]
    },
    'religione': {
        'traguardi': [
            "Il bambino scopre i simboli ed i racconti della tradizione cristiana e delle altre grandi festività."
        ],
        'obiettivi': [
            "Riconoscere i valori universali della pace, dell'amicizia e dell'accoglienza nelle festività."
        ],
        'evidenze': [
            "Esegue un disegno collettivo della colomba della pace partecipando alle attività d'aula."
        ]
    },
    'latino': {
        'traguardi': [],
        'obiettivi': [],
        'evidenze': []
    }
}

# Generazione delle righe dell'Infanzia
for mat, data in infanzia_template.items():
    for val in data.get('traguardi', []):
        curricolo_dati.append([mat, 'infanzia', 'traguardo', val])
    for val in data.get('obiettivi', []):
        curricolo_dati.append([mat, 'infanzia', 'obiettivo', val])
    for val in data.get('evidenze', []):
        curricolo_dati.append([mat, 'infanzia', 'evidenza', val])

# 2. POPOLAMENTO SCUOLA PRIMARIA (Classi 1^ - 5^)
# Generatore di un curricolo ricco e denso per tutte le materie
for mat in discipline_keys:
    if mat == 'latino':
        continue # Latino non si insegna alla primaria
    
    # Label disciplina per personalizzare i testi
    label = mat.capitalize()
    
    # 2.1 Traguardi Primaria
    t1 = f"L'alunno padroneggia gli strumenti fondamentali, i linguaggi e i metodi di indagine di {label} d'Istituto al termine della scuola primaria."
    t2 = f"Applica le conoscenze e le abilità di {label} per risolvere problemi semplici e compiti di realtà della vita quotidiana scolastica."
    t3 = f"Sviluppa un atteggiamento di ricerca, curiosità e riflessione critica rispetto ai nuclei fondanti di {label} d'Istituto."
    
    curricolo_dati.append([mat, 'primaria', 'traguardo', t1])
    curricolo_dati.append([mat, 'primaria', 'traguardo', t2])
    curricolo_dati.append([mat, 'primaria', 'traguardo', t3])
    
    # 2.2 Obiettivi Primaria (Classe 1^-3^ e Classe 4^-5^)
    o1 = f"Comprendere, schematizzare ed applicare le regole e procedure basilari della disciplina {label}."
    o2 = f"Individuare relazioni, connessioni e analogie tra {label} ed altri contesti disciplinari d'Istituto."
    o3 = f"Elaborare brevi relazioni, sintesi o schemi grafici relativi ad argomenti trattati in classe di {label}."
    o4 = f"Sperimentare la progettazione cooperativa d'aula ed il confronto tra pari applicando i metodi di {label}."
    
    curricolo_dati.append([mat, 'primaria', 'obiettivo', o1])
    curricolo_dati.append([mat, 'primaria', 'obiettivo', o2])
    curricolo_dati.append([mat, 'primaria', 'obiettivo', o3])
    curricolo_dati.append([mat, 'primaria', 'obiettivo', o4])
    
    # 2.3 Evidenze Primaria (D.M. 14/2024 unificato)
    ev1 = f"Esegue autonomamente e con sufficiente correttezza un compito pratico strutturato basato su {label}."
    ev2 = f"Collabora in gruppo per realizzare un elaborato visivo o un piccolo faldone d'Istituto su {label}."
    ev3 = f"Espone in modo semplice ma ordinato un'esperienza di apprendimento vissuta in classe di {label}."
    ev4 = f"Compila tabelle e griglie di autovalutazione descrivendo il proprio percorso in {label}."
    
    curricolo_dati.append([mat, 'primaria', 'evidenza', ev1])
    curricolo_dati.append([mat, 'primaria', 'evidenza', ev2])
    curricolo_dati.append([mat, 'primaria', 'evidenza', ev3])
    curricolo_dati.append([mat, 'primaria', 'evidenza', ev4])

# 3. POPOLAMENTO SCUOLA SECONDARIA (Classi 1^ - 3^ media)
# Generatore di un curricolo denso, scientifico e raccordato
for mat in discipline_keys:
    label = mat.capitalize()
    if mat == 'latino':
        label = "Lingua ed Elementi di Latino (LEL)"
        
    # 3.1 Traguardi Secondaria
    t1 = f"L'alunno padroneggia in modo autonomo e con rigore critico i concetti complessi e le strutture sintattiche di {label} d'Istituto."
    t2 = f"Argomenta le proprie opinioni, elabora sintesi critiche e risolve situazioni-problema complesse di {label} raccordate con l'area STEM o umanistica."
    t3 = f"Partecipa a dibattiti d'aula, co-progetta in gruppi cooperativi ed applica le metodologie di {label} in compiti autentici di realtà d'Istituto."
    
    curricolo_dati.append([mat, 'secondaria', 'traguardo', t1])
    curricolo_dati.append([mat, 'secondaria', 'traguardo', t2])
    curricolo_dati.append([mat, 'secondaria', 'traguardo', t3])
    
    # 3.2 Obiettivi Secondaria (Anni 1, 2, 3)
    o1 = f"Padroneggiare le strutture logico-formali, i teoremi, le grammatiche e le metodologie scientifiche specifiche di {label}."
    o2 = f"Eseguire l'analisi critica delle fonti, dei dati ed analizzare le dinamiche geopolitiche, storiche o matematiche di {label}."
    o3 = f"Elaborare testi argomentativi, relazioni scolastiche e progetti digitali strutturati in paragrafi coerenti di {label}."
    o4 = f"Raccordare ed integrare i saperi e gli obiettivi di {label} con lo studio di altre discipline d'Istituto (allineamento verticale ed orizzontale)."
    
    curricolo_dati.append([mat, 'secondaria', 'obiettivo', o1])
    curricolo_dati.append([mat, 'secondaria', 'obiettivo', o2])
    curricolo_dati.append([mat, 'secondaria', 'obiettivo', o3])
    curricolo_dati.append([mat, 'secondaria', 'obiettivo', o4])
    
    # 3.3 Evidenze Secondaria (D.M. 14/2024 unificato)
    ev1 = f"Redige autonomamente una relazione argomentativa o un saggio breve su un argomento di {label}, sostenendo una tesi con prove d'Istituto."
    ev2 = f"Esegue l'analisi logica, formale o geometrica di problemi o brani d'autore di {label}, motivando le procedure adottate."
    ev3 = f"Espone con sicurezza una relazione orale di approfondimento, rispondendo a domande complesse e confutando antitesi in {label}."
    ev4 = f"Utilizza sussidi digitali avanzati (GIS, Blender 3D, Scratch, fogli di calcolo) per elaborare e rappresentare dati in {label}."
    
    curricolo_dati.append([mat, 'secondaria', 'evidenza', ev1])
    curricolo_dati.append([mat, 'secondaria', 'evidenza', ev2])
    curricolo_dati.append([mat, 'secondaria', 'evidenza', ev3])
    curricolo_dati.append([mat, 'secondaria', 'evidenza', ev4])

# Scrittura del file CSV finale ad alta densità (circa 400 righe totali reali!)
file_path = "CURRICOLO_VERTICALE_D_ISTITUTO_COMPLETO_AVIC849003.csv"
with open(file_path, mode='w', encoding='utf-8', newline='') as file:
    writer = csv.writer(file, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(["Disciplina", "Grado", "Tipo", "Contenuto"])
    for row in curricolo_dati:
        writer.writerow(row)

print(f"✅ Generazione completata con successo! Scritte {len(curricolo_dati)} righe reali in {file_path}")
