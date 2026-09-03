# Arena — audit cell-aware del curricolo verticale

Data: 2026-09-03  
Fonte: `CURRICOLO VERTICALE .docx`  
SHA-256 fonte: `187bc12a771a29331c0d6638abe9e74788a2554af2735e3b9f43321d8f2ae57b`  
Base R7C4: `a20b062e49d972fff083d0d5c6d2f12635c81ecc`  
Stato: **SOURCE REVIEW ONLY — NO AUTHORITY MUTATION**

## 1. Perché l'audit precedente è stato invalidato

La PR #180 e gli inventari derivati dalla prima estrazione non sono una base autorevole. Il DOCX usa estensivamente tabelle con celle unite e la lettura ad alto livello aveva linearizzato la griglia, perdendo la relazione fra colonna semantica e contenuto.

La nuova estrazione legge direttamente `word/document.xml` e conserva la geometria OOXML della tabella.

Dati strutturali ricertificati:

- 37 tabelle;
- 33 tabelle con almeno una cella unita;
- 900 celle OOXML fisiche;
- 225 celle sono continuazioni `vMerge` e non costituiscono nuove celle semantiche;
- 675 celle semantiche di ancoraggio;
- 235 celle usano `gridSpan` per estendersi su più colonne logiche.

Per ogni cella vengono conservati almeno:

`tableIndex + row + logicalColumnStart/End + gridSpan + vMerge + anchorId + role + schoolOrder + discipline/field + verticalLink + scope + age + text`.

Le anomalie vengono promosse a finding solo dopo controllo congiunto **OOXML cell-aware + rendering della pagina**.

## 2. Confine di autorità

Il documento è classificato come fonte curricolare d'istituto in revisione:

- `sourceAuthority = LOCAL_WORKING`;
- `semanticStatus = UNASSESSED`;
- `automaticCanonicalPromotion = false`;
- `automaticNationalAttribution = false`.

Nessun testo del documento diventa `NATIONAL_PRESCRIPTIVE` per il solo fatto di richiamare le Indicazioni 2025. L'autorità nazionale resta subordinata a binding con elementi nazionali verificati e provenienza/fingerprint coerenti con il contratto R7C1/R7C3.

## 3. Finding ricertificati

### CV-AUD-001 — P0 — `CONTENT_TARGET_MISMATCH`

**Pagine:** 22 e 32, confrontate con pagina 41.  
**Tabelle:** 6 e 10, confrontate con tabella 14.

Le due schede dell'infanzia `I DISCORSI E LE PAROLE`, collegate rispettivamente a Italiano e Lingua inglese, presentano competenze attese linguistiche. Tuttavia gli obiettivi specifici 3/4/5 anni e le conoscenze coincidono, salvo punteggiatura, con la progressione di `IL SÉ E L'ALTRO` relativa a emozioni, famiglia/comunità, differenze, bene comune, simboli di appartenenza e mediazione.

**Azione:** `BLOCK_AUTOMATIC_PROMOTION; HUMAN_CORRECTION_REQUIRED`.

### CV-AUD-002 — P0 — `DUPLICATED_DISCIPLINE_RATIONALE`

**Pagine:** 66 e 72.

Il corpo testuale di `MUSICA — Perché si studia?` è identico, dopo normalizzazione degli spazi, al corpo di `TECNOLOGIA — Perché si studia?`.

**Azione:** `BLOCK_AUTOMATIC_PROMOTION; HUMAN_CORRECTION_REQUIRED`.

### CV-AUD-003 — P0 — `DUPLICATED_DISCIPLINE_RATIONALE`

**Pagine:** 77 e 83.

Il corpo testuale di `EDUCAZIONE MOTORIA E FISICA — Perché si studia?` è identico, dopo normalizzazione degli spazi, al corpo di `ARTE E IMMAGINE — Perché si studia?`.

**Azione:** `BLOCK_AUTOMATIC_PROMOTION; HUMAN_CORRECTION_REQUIRED`.

### CV-AUD-004 — P0 — `APPLICABILITY_SCOPE_CONFLICT`

**Pagine:** 4, 27 e 28.  
**Tabella:** 9.

Il documento dichiara il Latino a partire dalle classi seconde/terze e, nella pagina introduttiva della disciplina, dal secondo anno della scuola secondaria di primo grado. La tabella curricolare successiva è invece intestata `CLASSE PRIMA`.

**Azione:** `BLOCK_SCOPE_BINDING; HUMAN_DECISION_REQUIRED`.

### CV-AUD-005 — P1 — `TABLE_HEADER_STRUCTURE_MISMATCH`

**Pagine:** 88-89.  
**Tabella:** 37, Educazione fisica secondaria.

La tabella presenta una riga a tutta larghezza `OBIETTIVI SPECIFICI DI APPRENDIMENTO`. La riga successiva lascia la prima colonna senza etichetta, ripete `OBIETTIVI SPECIFICI DI APPRENDIMENTO` nella seconda e usa `CONOSCENZE` nella terza. La prima colonna contiene invece enunciati di competenza. Inoltre il testo `CLASSE PRIMA` è incorporato nel fondo della grande cella verticale della prima colonna, non in una riga di intestazione autonoma.

**Azione:** `REQUIRE_HEADER_REPAIR_BEFORE_SEMANTIC_MAPPING`.

### CV-AUD-006 — P1 — `FIELD_IDENTITY_LABEL_INCONSISTENCY`

**Pagine:** 19 e 84.  
**Tabelle:** 5 e 35.

Il raccordo generale usa `IL CORPO IN MOVIMENTO`; la scheda del campo usa `IL CORPO E IL MOVIMENTO`.

**Azione:** preservare entrambe le etichette di fonte e normalizzare l'identità soltanto dopo conferma umana.

## 4. Regole di modellazione ricavate senza classificare il documento come errato

### Infanzia

Le ripetizioni del medesimo campo sotto discipline diverse sono trattate come presentazioni verticali, non come campi distinti:

- `I DISCORSI E LE PAROLE` → Italiano, Lingua inglese;
- `IL SÉ E L'ALTRO` → Storia, Geografia;
- `LA CONOSCENZA DEL MONDO` → Matematica, Scienze, Tecnologia;
- `IMMAGINI, SUONI, COLORI` → Musica, Arte e immagine;
- `IL CORPO E IL MOVIMENTO` → Educazione motoria e fisica.

Arena deve quindi mantenere **una sola identità `FIELD_OF_EXPERIENCE`** e rappresentare le discipline come `verticalLink`, coerentemente con R7C4. Non si deve deduplicare il testo cancellando la provenienza: si deduplica l'identità, preservando ogni presentazione di fonte.

### Classi del primo ciclo

Tutte le 22 tabelle disciplinari di primaria e secondaria risultano riferite alla classe prima. Il dato viene acquisito come metadato di applicabilità e **non** viene trasformato automaticamente in un finding di incompletezza: può essere coerente con la prima attuazione 2026/27. La completezza di un curricolo verticale definitivo resta una verifica distinta.

## 5. Conseguenze R7

- nessuna modifica a runtime, persistenza o autorità;
- nessuna riapertura della proiezione disciplinare dell'infanzia;
- nessuna migrazione automatica `discipline -> field`;
- nessun testo locale elevato ad autorità nazionale;
- i finding P0/P1 bloccano la promozione dei soli segmenti coinvolti;
- P3-v2 deve consumare celle/nodi con provenienza e ruolo tabellare corretti, non testo linearizzato;
- la successiva acquisizione IN2025 resta separata dalla correzione editoriale del documento d'istituto.

## 6. Artefatti esterni ricostruiti

Sono stati rigenerati localmente:

- `CURRICOLO_VERTICALE_ARENA_CELL_AWARE_v2.json` — inventario completo cell-aware + pagina/testo + finding;
- `CURRICOLO_VERTICALE_ARENA_SEMANTIC_CELLS_v2.csv` — 675 celle semantiche di ancoraggio;
- `ARENA_CURRICOLO_VERTICALE_AUDIT_CELL_AWARE_v2.xlsx` — cartella di lavoro di controllo;
- `ARENA_CURRICOLO_VERTICALE_SOURCE_AUDIT_CELL_AWARE_2026-09-03.md` — rapporto esportabile.

Gli hash degli artefatti sono registrati nel file status della tranche.
