# Arena curriculum system — matrice rischi

| ID | Severità | Rischio | Effetto se non chiuso | Tranche |
| --- | --- | --- | --- | --- |
| CURR-SYS-001 | P1 | Runtime operativo ancora `CurriculumMap` legacy | Il nuovo modello canonico resta parallelo a UI/UDA/import | R7C1/R7C6 |
| CURR-SYS-002 | P1 | Infanzia proiettata su chiavi disciplinari | Identità semantica falsa dietro etichette corrette | R7C4 |
| CURR-SYS-003 | P1 | Inventario IN2025 incompleto | Impossibile dimostrare copertura nazionale completa | R7C5 |
| CURR-SYS-004 | P1 | P3 solo strutturale | `COVERAGE` non equivale a copertura semantica IN2025 | R7C3 |
| CURR-SYS-005 | P1 | Handoff proietta legacy come nazionale prescrittivo | Provenienza normativa non dimostrabile a livello elemento | R7C1/R7C2 |
| CURR-SYS-006 | P1 | Payload canonico interno opaco al gate SQL | Autorità forte su struttura curricolare non sufficientemente tipizzata | R7C1 |
| CURR-SYS-007 | P2 | UDA con snapshot testuali e indici | Perdita di legame stabile dopo revisioni | R7C2 |
| CURR-SYS-008 | P2 | Allegati/strumenti non nel grafo curricolare | Frammentazione tra curricolo, documenti e monitoraggio | R7C2 |

## Regola di promozione

Nessun P1 viene chiuso per dichiarazione documentale. La chiusura richiede codice, test di regressione, gate exact-head e, quando cambia il significato istituzionale o l'esperienza umana, validazione rappresentativa.
