# CML-DRIVE-01 — Confine canonico tra CurManLight, fonti e Google Drive

**Stato:** foundation contract per analisi e sviluppo  
**Ambito:** CurManLight Arena 2026–2027  
**Decorrenza tecnica:** dal primo slice `source-registry-drive-boundary`

## Regola canonica

> CurManLight conserva e governa il dato operativo, le fonti utilizzabili, la loro validità e provenienza, il lavoro umano e gli stati di autorità. Google Drive non partecipa al runtime e non determina lo stato canonico: è utilizzato esclusivamente per analisi/sviluppo, esportazione documentale e backup versionato con ripristino esplicito.

## 1. Responsabilità

CurManLight deve poter funzionare normalmente senza Google Drive. Nessuna funzione essenziale può dipendere da:

- percorso o nome di una cartella Drive;
- nome di un file Drive;
- disponibilità della connessione Drive;
- ultima modifica di un oggetto Drive;
- sincronizzazione automatica Drive → Arena.

La presenza di un documento su Drive non lo rende verificato, istituzionale, normativo o vigente.

## 2. Riutilizzo del dominio fonte esistente

Il contratto non introduce una seconda entità `Source`. Restano canonici `Source` e `SourceVersion` del dominio curricolare CML-633C.

Sopra tali entità vengono registrate, separatamente:

1. **verificationStatus** — cosa è stato verificato dall'umano/processo;
2. **authorityLevel** — quale autorità può essere attribuita alla fonte;
3. **validFor** — per quali utenti, istituti, ordini, discipline e intervalli temporali la fonte è utilizzabile;
4. **provenance** — da dove proviene la versione e chi ne ha attestato la verifica.

Queste dimensioni non possono essere inferite dal `SourceLocator`, dal provider di backup o dal percorso fisico del documento.

## 3. Stati distinti

### Verifica

`imported → identified → verified` oppure `rejected`.

### Autorità

- `personal`
- `internal`
- `institutional`
- `normative`

Una fonte può essere `verified` e `personal`. La verifica non promuove automaticamente l'autorità.

### Validità contestuale

La validità è una proprietà esplicita, valutata rispetto a:

- utente;
- istituto;
- ordine scolastico;
- disciplina;
- data di utilizzo.

`verified` non significa automaticamente `validFor` qualunque contesto.

## 4. Provenienza e conoscenza derivata

Ogni elemento di conoscenza derivata deve poter risalire almeno a:

`DerivedKnowledge → SourceVersion → Source`.

Una sintesi, un'indicizzazione, un'estrazione o un output AI non diventa mai fonte primaria e non può perdere il riferimento alla versione da cui deriva.

## 5. Drive

Google Drive ha tre soli ruoli ammessi:

1. **analisi e sviluppo** del progetto;
2. **export documentale** destinato al fascicolo umano;
3. **backup** di uno snapshot CurManLight.

Il backup è unidirezionale:

`CurManLight → provider di backup`.

Non esiste sincronizzazione bidirezionale e non esiste promozione automatica da Drive verso lo stato canonico.

## 6. Backup receipt

Ogni backup deve produrre una ricevuta contenente almeno:

- identificativo backup;
- schema del manifest;
- data di esportazione;
- hash del contenuto;
- provider;
- identificativo remoto opzionale;
- direzione `outbound-backup`;
- `authorityEffect = none`.

L'identificativo remoto Drive non diventa l'identità dell'oggetto CurManLight.

## 7. Ripristino

Un backup può essere importato solo attraverso un'operazione esplicita:

`seleziona backup → valida schema → verifica hash → mostra contenuto → conferma umana → ripristina`.

Nessun backup può essere applicato automaticamente perché più recente di uno stato locale o condiviso.

## 8. Vincolo di costo cloud ordinario

CurManLight adotta un criterio **zero-cost-by-design** per l'uso ordinario del cloud.

Questo criterio significa che:

- il funzionamento normale di Arena non richiede un piano cloud a pagamento;
- Arena non genera traffico cloud autonomo o ricorrente;
- ogni backup remoto nasce da un gesto umano esplicito;
- polling, scansioni periodiche di Drive, backup automatici e sincronizzazione bidirezionale sono vietati;
- può esistere un solo upload di backup alla volta nella superficie utente;
- ogni package outbound è soggetto a un limite tecnico di **25 MiB** prima dell'autorizzazione OAuth e prima di qualsiasi chiamata al provider;
- il superamento del limite blocca il backup senza consumare traffico Google;
- la mancata disponibilità o configurazione di Drive non degrada il funzionamento locale.

`zero-cost-by-design` è un vincolo di architettura e comportamento del prodotto, non una promessa sulle future condizioni economiche stabilite da provider terzi. Se un provider introducesse tariffe incompatibili con questo criterio, la funzione deve poter essere disabilitata senza compromettere Arena.

## 9. Invarianti bloccanti

1. La posizione fisica non determina autorità.
2. `verified ≠ institutional`.
3. `validFor(user/context)` deve essere verificabile in modo deterministico.
4. Una fonte personale deve dichiarare almeno un utente destinatario.
5. Una fonte interna/istituzionale deve dichiarare almeno un istituto destinatario.
6. La conoscenza derivata deve riferire una `SourceVersion`.
7. Il backup non modifica stato, autorità o validità delle fonti.
8. Il restore richiede conferma umana esplicita.
9. Drive non è un repository runtime e non è una fonte di verità applicativa.
10. Il sistema deve restare utilizzabile senza Drive.
11. Nessun componente Drive può introdurre polling, backup automatico o sincronizzazione in background.
12. Il limite outbound deve essere verificato prima di OAuth e prima della rete.
13. L'operatività ordinaria deve restare compatibile con il criterio `zero-cost-by-design`.

## 10. Sequenza di sviluppo

- **Slice A:** contratto, governance delle fonti, validità contestuale, contratto backup/restore e test invarianti.
- **Slice B:** persistenza del Source Registry e UI “Fonti valide per me/questo contesto”.
- **Slice C:** adapter di backup Google Drive in sola uscita con ricevuta.
- **Slice D:** import/ripristino esplicito con preview e conferma umana.
- **Slice E:** cost guard ordinario: niente traffico autonomo, package cap e gate CI dedicato.

Nessuno slice successivo può introdurre sincronizzazione Drive ↔ Arena, derivare autorità dal provider o aggirare il cost guard senza una nuova decisione architetturale esplicita.