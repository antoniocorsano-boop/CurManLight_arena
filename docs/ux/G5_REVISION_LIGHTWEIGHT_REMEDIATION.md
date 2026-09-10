# G5 — Remediation Riesame: leggerezza e guida esecutiva

Origine: evidenza umana mobile sulla release `cad72752c70a90c448fd05eb16a55c1ad83bb0f1`.

## Finding
Il docente comprende disciplina e annualità, ma la schermata usa troppo presto lessico di processo (`H2`, `H3`, `unità curricolare`, `validazione professionale`, `fase distinta`) e presenta più livelli decisionali mentre il compito immediato è soltanto iniziare il proprio riesame.

## Regola UX
La schermata deve rispondere, nell'ordine, a tre domande:
1. Dove sono e su quale classe sto lavorando?
2. Cosa devo fare adesso?
3. Cosa succede dopo?

Il lessico tecnico di governo resta nei contratti e nei metadati, non deve essere necessario per completare il compito docente ordinario.

## Remediation
- `Unità curricolare del riesame` → `Scegli la classe`.
- spiegazione H2 → frase naturale sulla separazione del lavoro per annualità.
- `Validazione professionale` → `Il tuo percorso`.
- prima azione → `Esprimi il tuo parere`, con istruzione concreta sulle schede.
- percorso a quattro passi con verbi semplici.
- riesame verticale spostato dietro divulgazione progressiva come passaggio successivo.
- H3 non compare nel testo primario; il confine istituzionale è espresso in linguaggio naturale.

## Invarianti
La semplificazione non modifica autorità, persistenza, ordine dei gate, separazione contributo personale → esito del gruppo → riesame verticale → decisione istituzionale. Nessuna decisione viene automatizzata.
