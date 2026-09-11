# Arena R7C5A — Final publication locator rebind

Status: **IMPLEMENTED_AWAITING_EXACT_HEAD_GATES**

## Scopo

R7C5A apre il completamento dell'acquisizione IN2025 con un passaggio esclusivamente di provenienza: riallinea i locator nazionali al **volume finale MIM stampato a marzo 2026** e mantiene distinta l'autorità giuridica del D.M. 221/2025, pubblicato in Gazzetta Ufficiale.

La tranche non importa testi come canonici e non attribuisce `SOURCE_VERIFIED` a nessun elemento.

## Problema corretto

Il repository conservava locator derivati da una precedente impaginazione di lavoro. Il caso più evidente era Tecnologia, localizzata alle pagine 96-98. Nel volume finale MIM la sezione Tecnologia è invece alle pagine stampate 140-146.

R7C5A introduce `finalPublicationManifest.ts` come manifesto macchina della pubblicazione finale e riallinea i locator che dipendono dalla paginazione.

## Manifesto della pubblicazione finale

Il manifesto registra le sezioni stampate nel volume finale:

- infanzia: p. 53;
- cinque campi di esperienza: pp. 57-66;
- transizione infanzia → primaria: p. 67;
- Italiano: pp. 68-79;
- LEL: pp. 80-82;
- Lingua inglese: pp. 83-90;
- Seconda lingua comunitaria: pp. 91-95;
- Storia: pp. 96-104;
- Geografia: pp. 105-112;
- STEM: pp. 113-117;
- Matematica: pp. 118-129;
- Scienze: pp. 130-139;
- Tecnologia: pp. 140-146;
- Musica: pp. 147-151;
- Strumento musicale: pp. 152-157;
- Arte e immagine: pp. 158-167;
- Educazione motoria e fisica: pp. 168-181.

I numeri sono **pagine stampate nel volume MIM**, non indici PDF.

## Tecnologia

I gruppi dell'inventario Tecnologia sono riallineati alla prima pagina stampata nella quale compaiono:

- competenze attese primaria: p. 141;
- obiettivi primaria classe terza: p. 142;
- obiettivi primaria classe quinta: p. 143;
- conoscenze primaria: p. 143;
- competenze attese secondaria: p. 144;
- obiettivi secondaria classe terza: p. 144;
- conoscenze secondaria: p. 145.

Restano invariati i 61 placeholder strutturali già presenti; R7C5A corregge i locator ma non dichiara ancora verificati conteggi o testi rispetto al volume finale elemento per elemento.

## Discipline residue

Le undici discipline residue della `DM221_DISCIPLINE_SOURCE_WORK_QUEUE` passano da `LOCATOR_REQUIRED` a `SOURCE_LOCATED` perché il confine di sezione è ora identificato nel volume finale.

Restano però simultaneamente vere queste proprietà:

- `verifiedByHuman = false`;
- nessun testo canonico importato;
- nessun `SOURCE_VERIFIED`;
- nessun effetto sull'adozione istituzionale.

La fase successiva deve inventariare gli elementi reali di ciascuna sezione e sottoporli a verifica umana, non generare contenuti mancanti.

## Correzioni collaterali di locator

- Art. 2 del decreto nel volume finale: p. 6 stampata, non p. 34;
- rinvio IRC, art. 2, c. 6: p. 7 stampata;
- framework STEM: p. 113, non p. 83;
- campi di esperienza dell'infanzia: locator iniziali rispettivamente pp. 57, 59, 61, 63, 64.

La versione dell'identità canonica `dm221-structure-v1` non cambia: vengono corretti i riferimenti di provenienza, non la struttura semantica.

## Confine di autorità

R7C5A non modifica:

- runtime curricolare;
- `CURRICULUM_PERSISTENCE_MODE`;
- P3/P7;
- proposal/decision/adoption;
- contenuti del curricolo d'istituto;
- stato `SOURCE_VERIFIED`;
- verifica umana dei testi.

La Gazzetta Ufficiale resta il riferimento della fonte normativa. Il volume MIM di marzo 2026 viene registrato separatamente per la localizzazione editoriale dell'allegato curricolare.

## Gate

La tranche è valida soltanto se:

1. ogni disciplina universale possiede una sezione finale localizzata;
2. infanzia conserva cinque campi nativi;
3. LEL, STEM e Strumento musicale restano segmenti speciali/non universali;
4. Tecnologia non contiene più locator 96-98;
5. tutti gli elementi restano non verificati da persona;
6. fast suite, TypeScript e build passano sul medesimo SHA.

## Prossimo lavoro

**R7C5B — element inventory from final publication**, iniziando dalla verifica dei 61 elementi di Tecnologia rispetto al volume finale e proseguendo disciplina per disciplina e sui cinque campi dell'infanzia, senza mapping automatico al curricolo d'istituto.