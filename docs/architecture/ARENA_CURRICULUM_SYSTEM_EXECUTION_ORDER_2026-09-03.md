# Arena — Ordine di esecuzione per la convergenza curricolare

Questo documento accompagna l'audit del 2026-09-03 e impedisce di trattare i finding come un invito a modifiche parallele non governate.

## Ordine vincolante proposto

1. **R7B3 — Infanzia foundation**: completare la PR #174; nessuna espansione P3.
2. **R7C1 — Canonical operational aggregate**: congelare schema e invarianti del curricolo operativo unico.
3. **R7C2 — Technology end-to-end pilot**: usare Tecnologia, il curricolo verticale reale e gli allegati A–H come prova di integrazione.
4. **R7C3 — Element-semantic P3**: analisi a livello di elemento nazionale verificato.
5. **R7C4 — Native infanzia runtime**: sostituire la proiezione disciplinare legacy con i cinque campi.
6. **R7C5 — Complete IN2025 acquisition**: completare tutte le discipline e i segmenti previsti.
7. **R7C6 — Runtime migration**: `legacy-only → dual-read → dual-write → new-domain-primary` con backup, rollback e validazione umana.

## Regole di sicurezza architetturale

- Nessuna tranche può trasformare `ADOPTION_FLOW_VALIDATED` in una dichiarazione di completezza semantica nazionale.
- Nessun testo legacy può ricevere autorità `NATIONAL_PRESCRIPTIVE` senza binding verificato alla fonte nazionale nel modello convergente.
- Nessun contenuto dell'infanzia può essere promosso dai vecchi alias disciplinari senza migrazione semantica esplicita.
- Nessun allegato operativo può diventare una seconda fonte di verità del curricolo: deve riferire versione/segmento/nodi del curricolo canonico.
- Nessun passaggio a `dual-write` o `new-domain-primary` deve avvenire senza confronto deterministico dei dati, backup e rollback verificati.
- R7 resta l'unico percorso di autorità istituzionale; il nuovo dominio operativo deve esserne l'oggetto governato, non un percorso parallelo.

## Primo criterio di uscita

R7C1 è pronto solo quando esiste un contratto unico che possa rappresentare, senza perdita:

- i cinque campi di esperienza dell'infanzia;
- le discipline del primo ciclo;
- la progressione per ordine/classe;
- elementi nazionali verificati;
- elementi e scelte d'istituto;
- nuclei, conoscenze, abilità, competenze, evidenze;
- relazioni verticali;
- provenienza e versionamento;
- stato di revisione/adozione;
- riferimenti da UDA, rubriche, griglie, portfolio, monitoraggio e verbali.

Fino a quel punto il lavoro successivo deve restare preparatorio e fail-closed.
