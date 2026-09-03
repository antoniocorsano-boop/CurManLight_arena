# Arena — ricostruzione strutturata del curricolo verticale v3

Data: 2026-09-03  
Fonte: `CURRICOLO VERTICALE .docx`  
SHA-256 fonte: `187bc12a771a29331c0d6638abe9e74788a2554af2735e3b9f43321d8f2ae57b`  
Base audit: PR #181 / `693113fd28e6466a663cf6150209a96e22f29882`  
Base R7C4: `a20b062e49d972fff083d0d5c6d2f12635c81ecc`  
Stato: **SOURCE RECONSTRUCTION ONLY — NO AUTHORITY MUTATION**

## 1. Scopo

Questa tranche prosegue il cell-aware audit di PR #181 e ricostruisce il contenuto del documento d'istituto in blocchi ed elementi sorgente governati, senza eseguire ancora il confronto semantico con i singoli elementi nazionali D.M. 221/2025.

La ricostruzione conserva contemporaneamente:

- struttura tabellare reale del DOCX;
- ruolo semantico della cella;
- ordine scolastico;
- campo di esperienza o disciplina;
- raccordo verticale dell'infanzia;
- classe/età;
- nucleo fondante e sottotitoli locali;
- testo sorgente e fingerprint;
- autorità e stato semantico separati.

## 2. Verifica della lettura tabellare

La base v2 è stata ricontrollata direttamente su `word/document.xml` e sui rendering delle pagine.

Dati confermati:

- 37 tabelle;
- 900 celle OOXML fisiche;
- 225 continuazioni `vMerge`;
- 675 celle semantiche di ancoraggio;
- 32 presentazioni curricolari effettive;
- 554 blocchi semantici appartenenti alle tabelle curricolari;
- 741 elementi sorgente derivati conservativamente;
- 27 identità canoniche target/ordine;
- 13 associazioni di razionale disciplinare.

### Correzione v3 della risoluzione di colonna

La sola intersezione fra indici logici di colonna non è sufficiente in alcune tabelle: sette celle sembravano attraversare `OBIETTIVI` e `CONOSCENZE` a causa di una colonna OOXML intermedia larga soltanto 92 twip.

V3 usa quindi le **larghezze reali della griglia OOXML** e assegna il ruolo alla banda semantica con maggiore sovrapposizione geometrica. Nei sette casi, il contenuto ricade per il 98,19% nella banda `CONOSCENZE`; non viene più classificato come contenuto misto.

È stata inoltre corretta la riga della Matematica secondaria `Al termine della classe prima della scuola secondaria I grado`: è metadato di `scope`, non una competenza.

## 3. Relazione con il registro canonico R7

La fonte d'istituto conserva sempre la propria etichetta. La destinazione semantica usa invece le identità già congelate in `src/domain/curriculum/national/canonicalStructure.ts` sul baseline R7C4.

Regole applicate:

- i cinque campi dell'infanzia restano `FIELD_OF_EXPERIENCE` nativi;
- le discipline accostate alle schede dell'infanzia restano `verticalLink` e non diventano identità di campo;
- `FRANCESE` è conservato come variante di fonte e destinato a `SECONDA_LINGUA_COMUNITARIA` / `dm221-disc-seconda-lingua`;
- `LATINO` non è trattato come disciplina universale del primo ciclo: è destinato al `SPECIAL_SEGMENT` `dm221-offering-lel`;
- `EDUCAZIONE_MOTORIA` primaria e `EDUCAZIONE_FISICA` secondaria restano identità canoniche distinte.

Queste associazioni sono **normalizzazione di identità**, non affermazioni di conformità del contenuto locale alla fonte nazionale.

## 4. Stato delle 32 presentazioni curricolari

La ricostruzione registra:

- 27 `SOURCE_READY_FOR_SEMANTIC_REVIEW`;
- 3 `BLOCKED_SOURCE_DEFECT`;
- 1 `BLOCKED_HEADER_REPAIR`;
- 1 `REVIEW_REQUIRED_IDENTITY_LABEL`.

I tre blocchi `BLOCKED_SOURCE_DEFECT` riguardano le due presentazioni `I DISCORSI E LE PAROLE` collegate a Italiano/Inglese e la tabella LEL/Latino. Il blocco di intestazione riguarda Educazione fisica secondaria; il riesame di identità riguarda la variante `IL CORPO IN MOVIMENTO` / `IL CORPO E IL MOVIMENTO`.

I due difetti di razionale disciplinare già ricertificati da PR #181 — Musica che duplica Tecnologia e Educazione motoria/fisica che duplica Arte e immagine — sono registrati a livello di `rationale`, non contati come ulteriori presentazioni tabellari bloccate.

`SOURCE_READY_FOR_SEMANTIC_REVIEW` significa soltanto che la fonte è stata strutturata con provenienza sufficiente per il controllo successivo. Non significa `COVERAGE`, conformità a IN2025, né adozione.

## 5. Confine di autorità

Per l'intera ricostruzione:

- `authority = LOCAL_WORKING`;
- `semanticStatus = UNASSESSED`;
- `automaticCanonicalPromotion = false`;
- `automaticNationalAttribution = false`.

Nessun elemento derivato viene promosso a `NATIONAL_PRESCRIPTIVE`; tale autorità resta subordinata al binding con un elemento nazionale verificato da persona e al fingerprint coerente richiesto da R7C1/R7C3.

## 6. Artefatti esterni vincolati

Gli artefatti completi restano esterni al repository e sono vincolati per SHA-256:

- `ARENA_CURRICOLO_VERTICALE_SOURCE_RECONSTRUCTION_v3.xlsx` — `94fd82e4460f42c5b15395b204553d41be4462f342f37b74a121ed61f1690627`;
- `CURRICOLO_VERTICALE_ARENA_SOURCE_RECONSTRUCTION_v3.json` — `ce1668c6155831d195fd8579562506138aaac3d5772e752e2f0957b0fe416080`;
- `CURRICOLO_VERTICALE_ARENA_SOURCE_BLOCKS_v3.csv` — `eb74d038d945c34702afb5d5f72cf416bba89df403f363c8b1af0de4e497cd84`;
- `CURRICOLO_VERTICALE_ARENA_SOURCE_ITEMS_v3.csv` — `2ba092cedb7c70557e51c42ae0583246fa11403dd1756e7a2fdd49c009958cd6`;
- `ARENA_CURRICOLO_VERTICALE_SOURCE_RECONSTRUCTION_v3.md` — `a2c3fa642f23589b4eb9f79a916ece12efbdaa8a9b24a4c64a1d522b4b28c107`.

## 7. Conseguenze R7

Questa tranche non modifica runtime, persistenza, P3, P7, proposal, decisioni o autorità canonica.

Il nuovo punto di ingresso per il lavoro successivo è:

`fonte d'istituto -> blocco sorgente -> elemento sorgente -> binding nazionale verificato -> revisione semantica umana -> eventuale proposta/decisione/adozione`.

Il prossimo lavoro previsto resta **R7C5 — complete IN2025 acquisition**. La ricostruzione v3 fornisce il lato d'istituto affidabile da confrontare con il registro nazionale verificato, senza anticiparne l'esito.