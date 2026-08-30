# Arena S3C — Mobile human transcript evidence

Status: `HUMAN_SUPPLIED_TRANSCRIPT`
Release SHA: `e957c7f7074e9a18da4fe9a8085dfc23be3a3ac9`
Capture session: `5280a450-155d-40da-8947-2e93d8e24fea`
Device class: mobile
Viewport: `406x791`

This file records the human-supplied transcription of the mobile HVA audio capture. It is evidence of the reviewer's reported observations; it does not add observations that were not spoken.

## Transcript

> Modellazione CAD 3D e prototipazione è una scheda tagliata. Un po' superiormente e poi inferiormente.
>
> Qui non capisco bene la scelta locale alla proposta, ancora quel ciclo della simulazione, l'approvazione, non so che fine deve fare.
>
> Sono in revisione. Vado in Fonti.
>
> Fonti è rimasto come prima, non è cambiato nulla. Bisogna aggiornarlo, bisogna capire questo Fonti che fine deve fare.
>
> Documenti del curriculum, configurazioni istruzioni completate, informazioni troppo prolisse, non so se l'insegnante poi ne ha bisogno in modo così prolisso. Informazioni più chiare, frasi veloci. Ma se si tratta di UI, se si deve spiegare, bisogna espandere.
>
> Vado nell'assistente locale e leggo: "Assistente locale non verificato". Ok.
>
> Controlla modelli disponibili e mi dice che non ce ne sono. Riprova: "Non è raggiungibile il server locale". È chiaro, sono sul mobile.
>
> Informazioni sull'accessibilità: non viene fuori nulla. Manuale d'uso: non viene fuori nulla.
>
> Ma, apriamo Conoscenza. Apriamo Conoscenza e vedo che c'è l'ultimo file caricato.
>
> Sembra tutto ok, anche se questa finestra Conoscenza è così lunga che non si riesce a capire. Bisogna trovare per Fonti una organizzazione della pagina che non costringa a scorrimenti troppo lunghi.
>
> Tab Relazioni: c'è scritto "Relazioni in preparazione", quindi bisogna sistemarlo.
>
> Nella scheda Termini leggo alcuni termini e leggo "Vedi la fonte, vedi la fonte". E c'è scritto "Glossario locale non verificato". È assurdo.
>
> Sono termini che dobbiamo verificare, dobbiamo rendere consistente questo tipo di informazioni. Ma è un discorso che vedo pochi... glossario proprio scarno, non so se è il caso di implementarne un'estensione e comunque renderlo meglio fruibile anche questo.
>
> Ed è circa abbastanza semplice, dovrebbe essere ok. Torno a Home, apro Curriculum. Prima di usare questo curriculum sarei... "Stai consultando una copia locale". E vabbè.
>
> Tecnologia ma te che curriculare, ok. Vedo i margini che sono ben fatti, però io ancora ho dubbi sulla sulla fruizione di questa vista per l'utente, perché vede un elenco di cose e deve leggere per capirci, ma i testi sono eccessivamente piccoli su mobile.
>
> Che revisione ho detto? La parte alta risulta no, i margini non vanno.
>
> La parte Documenti anche qui ci sono... è molto prolisso, non si capisce, molti testi scritti piccoli, non si riesce a capire.

## Evidence interpretation

The transcript directly supports the following current-release conclusions:

- `HVA-S3C-01` remains open: clipped content and excessive scrolling are still perceived on mobile.
- `HVA-S3C-02` remains open: spacing/margins are inconsistent across surfaces; Curriculum is perceived as better aligned while the upper Revision area is not.
- `HVA-S3C-03` remains open: teacher-facing copy is repeatedly described as too verbose, too small, and cognitively difficult to scan.
- `HVA-S3C-04` remains open: the local proposal/simulation/approval cycle remains unclear to the reviewer.

Additional human observations to track separately:

- Fonti has no clear perceived purpose/current destination and is reported as unchanged.
- Knowledge is too vertically long on mobile.
- Relazioni is visibly incomplete (`Relazioni in preparazione`).
- Termini/glossary presentation is inconsistent and considered insufficiently useful.
- Accessibility information and user manual actions appear non-responsive in the tested path.
- Local assistant unavailable-server state is understandable on mobile; this is a positive recovery/error-state observation.

Because at least one required mobile item is BLOCK and all four inherited severity-2 findings remain open, this release cannot receive `BETA_HIA_PASS` under the canonical protocol.
