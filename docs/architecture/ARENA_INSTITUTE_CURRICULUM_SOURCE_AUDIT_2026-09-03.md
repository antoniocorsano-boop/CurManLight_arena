# Audit di acquisizione — Curricolo verticale d'Istituto

**Fonte:** `CURRICOLO VERTICALE .docx` — 89 pagine  
**Stato iniziale Arena:** `LOCAL_WORKING / UNASSESSED`  
**Promozione canonica automatica:** vietata  
**Attribuzione nazionale automatica:** vietata

## Sintesi

- Unità informative estratte: **1156**.
- Anomalie registrate: **10** — P0: 4, P1: 4, P2: 2.
- Ordini/ambiti preservati separatamente: infanzia, primaria, secondaria, profilo del primo ciclo, contesto generale e rationale verticali di disciplina.
- L'infanzia viene normalizzata per **campo di esperienza nativo**; i collegamenti alle discipline restano relazioni verticali, non identità disciplinari.

## Anomalie

| ID | Priorità | Pagine | Area | Rilievo | Azione richiesta |
|---|---|---:|---|---|---|
| A001 | P0 | 22, 32 | Infanzia · I discorsi e le parole | Obiettivi specifici e conoscenze per 3/4/5 anni sono di ambito identità-relazioni-cittadinanza e coincidono con la progressione usata per «Il sé e l'altro», mentre le competenze attese della scheda sono linguistiche. | Bloccare promozione automatica; revisione umana e sostituzione/correzione delle celle prima della migrazione. |
| A002 | P0 | 72 | Musica · Perché si studia? | Il testo è una duplicazione esatta della motivazione disciplinare di Tecnologia a pagina 66. | Sostituire con motivazione propria di Musica; non importare come rationale di Musica. |
| A003 | P0 | 83 | Educazione motoria e fisica · Perché si studia? | Il testo è una duplicazione esatta della motivazione disciplinare di Arte e immagine a pagina 77. | Sostituire con motivazione propria della disciplina; non importare come rationale. |
| A004 | P0 | 4, 27-30 | Latino per l'educazione linguistica | Il documento dichiara l'avvio per classi seconde e terze / dal secondo anno, ma la tabella curricolare è intestata «CLASSE PRIMA». | Correggere l'ambito di classe e vincolare il segmento al regime/applicabilità corretti. |
| A005 | P1 | 88-89 | Educazione fisica · secondaria | La testata della tabella è malformata: la riga che dovrebbe identificare la classe riporta «OBIETTIVI SPECIFICI DI APPRENDIMENTO» e la prima colonna della riga successiva non ha intestazione. | Ripristinare «CLASSE PRIMA» e «COMPETENZE ATTESE» (se questa è l'intenzione redazionale) mediante validazione umana. |
| A006 | P1 | 22, 32, 41, 46, 53, 60, 67, 73, 78 | Infanzia · identità canonica | Uno stesso campo di esperienza è replicato sotto più collegamenti disciplinari. La ripetizione è utile come raccordo editoriale ma non deve generare segmenti canonici distinti per disciplina. | Deduplicare su FIELD_OF_EXPERIENCE e conservare le discipline come VERTICAL_LINK. |
| A007 | P1 | 19, 84 | Infanzia · denominazione campo | Nel raccordo di pagina 19 compare «IL CORPO IN MOVIMENTO», mentre la scheda curricolare usa «IL CORPO E IL MOVIMENTO». | Normalizzare l'identità al campo canonico e mantenere l'etichetta errata solo come alias di fonte non autorevole. |
| A008 | P1 | 16, 19, 20-89 | Copertura disciplinare | Il raccordo e la mappatura citano Religione/IRC-AA, ma nel blocco curricolare disciplinare non è presente una sezione autonoma corrispondente. | Verificare se l'assenza è intenzionale; in caso contrario acquisire la sezione mancante senza inventarne il contenuto. |
| A009 | P2 | 23-89 | Scansione per classi | Le tabelle disciplinari del primo ciclo riportano solo la classe prima; non risultano sezioni «CLASSE SECONDA» o «CLASSE TERZA». | Non classificare automaticamente come errore: verificare se il documento è deliberatamente riferito all'avvio 2026/27 e modellare coorte/regime normativo. |
| A010 | P2 | 4, 17 e varie | Qualità redazionale | Sono presenti refusi ricorrenti: «AMPARARE» (32 occorrenze), «SECONDARARIA» (4), «CURRICULO» (1). | Correzione editoriale prima della versione da sottoporre ad adozione. |

## Canonicalizzazione dell'infanzia

| Campo canonico | Pagine fonte | Collegamenti disciplinari | Copie editoriali | Azione Arena |
|---|---:|---|---:|---|
| I DISCORSI E LE PAROLE | 22, 32 | Italiano; Lingua inglese | 2 | 1 campo nativo; 2 VERTICAL_LINK; contenuti 3/4/5 anni da rivedere per A001. |
| IL SÉ E L’ALTRO | 41, 46 | Storia; Geografia | 2 | 1 campo nativo; 2 VERTICAL_LINK; preservare progressione locale 3/4/5 anni. |
| LA CONOSCENZA DEL MONDO | 53, 60, 67 | Matematica; Scienze; Tecnologia | 3 | 1 campo nativo; 3 VERTICAL_LINK; non creare discipline nell'infanzia. |
| IMMAGINI, SUONI, COLORI | 73, 78 | Musica; Arte e immagine | 2 | 1 campo nativo; 2 VERTICAL_LINK. |
| IL CORPO E IL MOVIMENTO | 84-85 | Educazione motoria e fisica | 1 | 1 campo nativo; normalizzare alias «IL CORPO IN MOVIMENTO» di pagina 19. |

## Sezioni disciplinari

| Sezione | Pagine | Ordini presenti | Unità estratte | Ambito del primo ciclo rilevato |
|---|---:|---|---:|---|
| Italiano | 21-26 | Infanzia, Primaria, Secondaria | 75 | CLASSE PRIMA |
| Latino | 27-30 | Secondaria | 44 | CLASSE PRIMA |
| Lingua inglese | 31-35 | Infanzia, Primaria, Secondaria | 73 | CLASSE PRIMA |
| Seconda lingua comunitaria: Francese | 37-39 | Secondaria | 24 | CLASSE PRIMA |
| Storia | 40-44 | Infanzia, Primaria, Secondaria | 65 | CLASSE PRIMA |
| Geografia | 45-51 | Infanzia, Primaria, Secondaria | 118 | CLASSE PRIMA |
| Matematica | 52-57 | Infanzia, Primaria, Secondaria | 128 | CLASSE PRIMA |
| Scienze | 59-65 | Infanzia, Primaria, Secondaria | 116 | CLASSE PRIMA |
| Tecnologia | 66-70 | Infanzia, Primaria, Secondaria | 86 | CLASSE PRIMA |
| Musica | 72-76 | Infanzia, Primaria, Secondaria | 76 | CLASSE PRIMA |
| Arte e immagine | 77-81 | Infanzia, Primaria, Secondaria | 97 | CLASSE PRIMA |
| Educazione motoria e fisica | 83-89 | Infanzia, Primaria, Secondaria | 78 | CLASSE PRIMA |

## Regola di ingestione

```text
INSTITUTE_DOCUMENT
  -> LOCAL_WORKING
  -> estrazione strutturata
  -> verifica identità/target
  -> confronto con fonte nazionale verificata
  -> revisione umana
  -> decisione/adozione
  -> ACTIVE solo dopo authority receipt
```

L'inventario esterno conserva il testo estratto senza promuoverlo a prescrizione nazionale e associa a ogni unità pagina, ordine, target, ambito, tipo di elemento, nucleo, stato iniziale, anomalia e destinazione R7. Le impronte degli artefatti di inventario sono registrate nel file di stato della tranche.