# Arena — Team Review Workspace

## Obiettivo
Rendere la fase di revisione del curricolo utilizzabile da docenti e team in difficoltà, riducendo letture, sigle e linguaggio tecnico.

## Problema osservato
La superficie Revisione espone correttamente confronti e stati, ma il docente deve ancora interpretare concetti di sistema e capire da solo cosa deve fare. Il lavoro istituzionale è rigoroso ma la complessità percepita resta alta.

## Decisione di prodotto
Principio guida: **Arena deve togliere lavoro ai team, non aggiungere un altro posto dove leggere documenti.**

Primo incremento:
- rendere evidente “Il mio lavoro nel curricolo”;
- mostrare cosa resta da esaminare;
- spiegare perché una scheda è in revisione;
- usare linguaggio semplice per provenienza e scelta;
- mantenere separata la scelta individuale dalla decisione del team;
- non introdurre nuove autorità, nuove route, nuovi state manager o un secondo processo di revisione.

## Confini
- Arena resta proprietaria della revisione curricolare istituzionale.
- Docente OS resta proprietario del lavoro quotidiano di classe.
- Nessuna scelta locale diventa approvazione istituzionale.
- Il percorso strutturato e i controlli di autorità esistenti restano invariati.

## Fonte di prodotto
Analisi salvata in Drive: `ARENA-UX-01_Dal_documento_al_lavoro_dei_team_2026-2027`.

## Base
Stacked base: `feature/r7c7c-institute-change-trace@529cf157139d4d77f00b8f3980df1b1fac329c89`.

## Prossimo passo
Migliorare `RevisioneTab.tsx` con orientamento, contesto e azioni in linguaggio docente; verificare build/test e aprire PR draft senza merge.