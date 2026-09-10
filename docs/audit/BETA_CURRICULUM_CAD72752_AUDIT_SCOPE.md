# Beta curriculum cad72752 — audit scope

Questo controllo tecnico riguarda esclusivamente la release Beta pubblica identificata da:

`cad72752c70a90c448fd05eb16a55c1ad83bb0f1`

Verifica automatizzata:
- raggiungibilità della Beta pubblica;
- corrispondenza di `beta-release.json` con lo SHA atteso;
- disponibilità del comando mobile `Curricolo`;
- visibilità della superficie canonica `Curricolo verticale d’Istituto`;
- visibilità del titolo `Curricolo verticale integrale 3–14`;
- presenza dello stato `Baseline corrente` e dell'avviso di non vigenza;
- copertura infanzia, primaria e secondaria di primo grado nella superficie primaria;
- assenza di apertura automatica della superficie `Archivio locale precedente`;
- assenza di errori pagina non gestiti.

Il controllo produce una schermata mobile e un rapporto JSON come artefatti di GitHub Actions.

**Confine:** `humanVerdictIssued=false`. Il superamento del controllo non equivale a `BETA_HIA_PASS`, approvazione umana, decisione istituzionale o promozione del master.
