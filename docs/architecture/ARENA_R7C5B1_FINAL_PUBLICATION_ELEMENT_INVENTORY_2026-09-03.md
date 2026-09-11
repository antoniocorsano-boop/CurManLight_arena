# Arena R7C5B1 — contratto dell’inventario elementi della pubblicazione finale

## Scopo

R7C5B1 apre l’inventario completo delle Indicazioni nazionali 2025 sulla **pubblicazione finale MIM stampata nel marzo 2026**.

La tranche non dichiara completato R7C5B. Congela invece un contratto fail-closed: un capitolo possiede un conteggio soltanto quando gli elementi strutturali sono stati effettivamente ricontati sulla pubblicazione finale. In assenza di tale verifica, lo stato resta `COUNT_REQUIRED` e non è ammesso un conteggio stimato.

## Base

- R7C5A exact head: `5b49e7b044f6e1410c63d9f74a999bd9300cfb1b`
- paginazione finale già congelata in `finalPublicationManifest.ts`
- nessuna modifica a runtime, persistenza, P3, P7 o autorità istituzionale

## Inventario strutturale verificato in questa tranche

### Scuola dell’infanzia

I cinque campi restano identità native `FIELD_OF_EXPERIENCE`.

| Campo | Finalità | Suggerimenti metodologici narrativi | Competenze attese | Obiettivi specifici | Totale |
|---|---:|---:|---:|---:|---:|
| Il sé e l’altro | 1 | 1 | 4 | 6 | 12 |
| Il corpo e il movimento | 1 | 1 | 5 | 5 | 12 |
| Immagini, suoni, colori | 1 | 1 | 4 | 5 | 11 |
| I discorsi e le parole | 1 | 1 | 6 | 6 | 14 |
| La conoscenza del mondo | 1 | 1 | 5 | 5 | 12 |
| **Totale campi** | **5** | **5** | **24** | **27** | **61** |

Il profilo `Dalla scuola dell’infanzia alla scuola primaria` è censito come **un elemento separato**, a p. 67. Non costituisce un sesto campo né una disciplina.

I locator puntano all’intervallo stampato del campo. La pagina puntuale e il testo di ciascun elemento restano da verificare da una persona: `SOURCE_LOCATED_ONLY`.

### Tecnologia

Il conteggio di Tecnologia è stato ricontrollato sulla pubblicazione finale pp. 141-146:

- primaria: 8 competenze attese;
- primaria classe terza: 8 obiettivi;
- primaria classe quinta: 12 obiettivi;
- primaria: 3 conoscenze;
- secondaria: 8 competenze attese;
- secondaria: 18 obiettivi;
- secondaria: 4 conoscenze.

Totale: **61 elementi**.

Il conteggio strutturale non equivale a verifica del testo: `verifiedByHuman` resta `false`.

## Registro fail-closed

`finalPublicationElementInventoryLedger.ts` registra 22 ambiti di inventario:

- 5 campi dell’infanzia;
- 1 profilo di transizione;
- 1 quadro generale dell’infanzia;
- le discipline del primo ciclo;
- LEL;
- STEM;
- Strumento musicale;
- Educazione motoria primaria ed Educazione fisica secondaria come identità separate anche se condividono il capitolo finale.

In questa tranche:

- 7 voci sono `COUNT_VERIFIED` (5 campi + transizione + Tecnologia);
- 15 voci sono `COUNT_REQUIRED`;
- nessuna voce `COUNT_REQUIRED` contiene un numero stimato.

Il quadro generale dell’infanzia resta `COUNT_REQUIRED`: il futuro conteggio dovrà censire le sole sezioni narrative generali delle pp. 53-56 ed escludere i cinque campi già inventariati.

## Vincoli di autorità

R7C5B1 non:

- importa automaticamente testo nazionale;
- produce `SOURCE_VERIFIED`;
- produce `HUMAN_VERIFIED_SOURCE_TEXT`;
- attribuisce `NATIONAL_PRESCRIPTIVE` a contenuti d’istituto;
- esegue mapping semantico curricolo d’istituto ↔ Indicazioni;
- modifica il runtime;
- abilita persistenza canonica;
- dichiara adozione collegiale.

## Uscita

Il prossimo incremento deve ricontare i capitoli `COUNT_REQUIRED` direttamente sulla pubblicazione finale, per gruppi strutturali e ordine scolastico, aggiornando il registro soltanto quando il conteggio reale è verificato.
