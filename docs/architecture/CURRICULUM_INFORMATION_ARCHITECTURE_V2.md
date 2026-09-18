# Curriculum Information Architecture v2

Status: `G5_RESTRUCTURE_CANDIDATE`  
Finding: #252  
Baseline: `495904cc1d7cf85e99cdcb954aeebf6f8b0bd430`

## 1. Problema corretto

La Beta S3 esponeva la voce globale **Curricolo** ma apriva direttamente un singolo fascicolo: il Curricolo verticale del Dipartimento Scientifico-Matematico-Tecnologico. Questa scelta produceva tre ambiguità:

1. fascicolo dipartimentale presentato come se coincidesse con il curricolo complessivo;
2. discipline presenti nel documento ma non trattate come primi oggetti di navigazione;
3. contesto locale `Istituto non configurato` mostrato insieme a una fonte documentale specifica senza separare identità locale e provenienza del fascicolo.

## 2. Gerarchia canonica

La navigazione viene consolidata in:

`contesto istituzionale → catalogo curricolare → area/fascicolo → disciplina → ordine → annualità → nucleo → fonte/azioni`

Quando l'istituto è configurato, il catalogo può essere presentato come **Curricolo d’Istituto**. Quando non è configurato resta **Catalogo curricolare** e non assume un'identità istituzionale.

## 3. Regola fonte ≠ contesto

La fonte di un fascicolo non definisce automaticamente l'istituto attivo.

Ogni pubblicazione deve conservare almeno:

- identificativo del fascicolo;
- area/dipartimento;
- discipline realmente navigabili;
- versione;
- anno scolastico;
- riferimento alla fonte;
- hash della fonte quando disponibile;
- stato di disponibilità.

L'interfaccia deve distinguere:

- **contesto locale**: configurato / non configurato;
- **fonte del fascicolo**: identità riportata dal documento sorgente;
- **stato del fascicolo**: disponibile, in lavorazione, non acquisito;
- **stato istituzionale**: non inferito dal semplice fatto che il fascicolo esista.

## 4. Registro di pubblicazione

Il codice introduce `curriculumPublicationRegistry.ts`.

La prima voce disponibile resta il fascicolo scientifico-matematico-tecnologico v3.1, senza modificarne contenuti o provenienza.

Le altre aree sono rappresentate soltanto come **copertura da acquisire**. Non vengono riempite tramite legacy, inferenze o testi sintetici.

## 5. Discipline come oggetti di primo livello

Le discipline effettivamente estraibili dal fascicolo corrente diventano accessi diretti:

- Matematica;
- Scienze;
- Tecnologia;
- Informatica.

STEM resta asse trasversale del fascicolo e non viene trasformato artificialmente in disciplina.

L'accesso diretto a una disciplina apre lo stesso fascicolo e la stessa sorgente, preselezionando soltanto il ramo disciplinare.

## 6. Regole di consolidamento future

Per aggiungere un nuovo fascicolo:

1. acquisire una fonte identificabile;
2. produrre manifest/versione/hash;
3. estrarre sezioni e discipline senza cambiare semantica;
4. registrare la pubblicazione;
5. aggiungere test di parità fonte-vista;
6. solo dopo renderla azionabile nel catalogo.

Un documento legacy può restare consultabile come archivio, ma non può diventare curricolo corrente per semplice fallback.

## 7. Gate G5

La correzione è idonea al nuovo collaudo G5 solo se l'utente, entrando da **Curricolo**, riesce a distinguere senza conoscenze tecniche:

- se l'istituto è configurato;
- quali fascicoli sono realmente disponibili;
- quali aree mancano;
- quali discipline può aprire direttamente;
- quale fonte sta leggendo;
- come tornare al catalogo;
- che la fonte non equivale automaticamente a un'adozione istituzionale.

G6 resta un gate separato.
