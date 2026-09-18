# Arena R7B3 — Curricolo canonico della scuola dell'infanzia

## Scopo

R7B3 introduce la rappresentazione nazionale nativa della scuola dell'infanzia necessaria prima di poter estendere il runtime di analisi curricolare oltre `DM221_FIRST_CYCLE_ONLY`.

La scuola dell'infanzia non viene modellata tramite le discipline del primo ciclo. Il D.M. 221/2025 organizza questa parte del curricolo attraverso cinque campi di esperienza:

1. Il sé e l'altro
2. Il corpo e il movimento
3. Immagini, suoni, colori
4. I discorsi e le parole
5. La conoscenza del mondo

La sezione `Dalla scuola dell'infanzia alla scuola primaria` è registrata separatamente come profilo di transizione e non diventa un sesto campo di esperienza.

## Inventario nazionale localizzato

Le Indicazioni dichiarano per ciascun campo un quadro aperto composto da finalità, competenze attese, obiettivi specifici e suggerimenti metodologici. R7B3 registra quindi, senza importare automaticamente il testo normativo:

- una sezione `FINALITY`;
- una sezione narrativa `METHODOLOGICAL_GUIDANCE`, senza trasformarla artificialmente in un elenco di obiettivi;
- ogni `EXPECTED_COMPETENCE` come elemento distinto;
- ogni `LEARNING_OBJECTIVE` come elemento distinto;
- il locator alla sezione della fonte ufficiale;
- `SOURCE_LOCATED` come stato iniziale;
- `verifiedByHuman = false`;
- `canonicalTextStatus = SOURCE_LOCATED_ONLY`.

Conteggi degli elementi discreti localizzati nell'allegato ufficiale:

| Campo di esperienza | Competenze attese | Obiettivi specifici |
| --- | ---: | ---: |
| Il sé e l'altro | 4 | 6 |
| Il corpo e il movimento | 5 | 5 |
| Immagini, suoni, colori | 4 | 5 |
| I discorsi e le parole | 6 | 6 |
| La conoscenza del mondo | 5 | 5 |

L'inventario dei cinque campi contiene quindi 61 elementi strutturali: 5 sezioni di finalità, 5 sezioni di suggerimenti metodologici, 24 competenze attese e 27 obiettivi specifici. Il profilo di transizione infanzia → primaria è un elemento ulteriore e separato.

## Autorità della fonte

La localizzazione non equivale a verifica normativa del testo. Nessun elemento di questo inventario può essere usato come testo canonico finché non soddisfa il contratto già vigente:

`SOURCE_VERIFIED + verifiedByHuman = true + HUMAN_VERIFIED_SOURCE_TEXT`.

Il dataset storico/legacy può essere collegato soltanto come candidato per confronto o migrazione. Non può attribuire autorità alla struttura dell'infanzia.

## Rapporto con R7B2

R7B2 resta corretto nel dichiarare:

- `curriculumScope = DM221_FIRST_CYCLE_ONLY`;
- `excludedSchoolOrders = ['infanzia']`.

R7B3 rimuove il primo blocco strutturale — l'assenza di un inventario nazionale nativo — ma non autorizza ancora a cambiare il verdetto R7B2. Prima di includere l'infanzia nel medesimo gate occorrono ancora:

- un modello istituzionale del curricolo dell'infanzia basato sui campi di esperienza;
- una migrazione semantica esplicita dai dati legacy, senza promozione automatica delle celle disciplinari;
- il collegamento elemento-per-elemento alla fonte ufficiale;
- test di copertura, lacuna, discontinuità e sovrapposizione specifici per i campi di esperienza;
- validazione umana rappresentativa.

## Direzione del modello Arena

Il modello completo deve mantenere tre livelli distinti:

`Fonte nazionale D.M. 221/2025 → Curricolo verticale d'Istituto → strumenti operativi/evidenze`.

Per l'infanzia il secondo livello deve restare centrato sui campi di esperienza; per primaria e secondaria il secondo livello può essere articolato per discipline. La continuità verticale viene costruita tra strutture diverse senza appiattirle in un'unica griglia disciplinare.

La stessa regola vale per l'acquisizione completa delle Indicazioni: Arena deve censire anche le sezioni generali dell'infanzia (contesto pedagogico, gioco, professionalità docente, curricolo del quotidiano, cittadinanza e continuità), mantenendole distinte dagli elementi valutabili dei singoli campi. R7B3 costituisce la base semantica per tale acquisizione, non una dichiarazione di completezza dell'intero allegato nazionale.

## Non-obiettivi della tranche

R7B3 non:

- copia automaticamente il testo normativo;
- dichiara `SOURCE_VERIFIED` senza verifica umana;
- converte discipline legacy in campi di esperienza;
- modifica il runtime P3 per dichiarare copertura dell'infanzia;
- approva, adotta o promuove un curricolo d'Istituto;
- modifica l'autorità istituzionale già congelata in R7.
