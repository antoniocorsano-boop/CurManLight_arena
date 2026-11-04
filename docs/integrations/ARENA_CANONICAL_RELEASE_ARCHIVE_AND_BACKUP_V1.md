# ARENA-RELEASE-ARCHIVE-01 — conservazione senza dipendenza da Drive

**Stato:** progettazione e codice in PR, non attivazione operativa.
**Dipendenze:** Arena #350, Docente OS #786–#788, TRAMA #302.

## Architettura delle copie

1. **Sorgente autorevole:** master curricolare canonico governato da Arena. Il master originale è distinto dalla release.
2. **Release operativa immutabile:** JSON qualificato, depositato in Storage privato e autorizzato, nel percorso previsto da Docente OS #788. Docente OS legge solo questa copia, verificando identità, anno, struttura, stato provvisorio e impronta SHA-256, **senza invocare Google Drive**.
3. **Backup Drive di recupero:** seconda copia **identica byte per byte** del JSON in un archivio Drive privato. Non è la fonte runtime e non determina approvazione, vigenza o autorizzazione.

La cartella privata verificata è «Arena — Archivio artefatti / Backup release curricolari Arena», ID Drive: **1puDUgasO6NaLA8qsO4hYPQHjjLMZ7QE5**. La creazione della cartella non equivale alla disponibilità del file.

## Release qualificata nota

Dalla PR Arena #350 risultano:
- master CAN-CURR-MASTER-00, versione 1.3, revisione 27, non vigente;
- file integrale emesso: **725.968 byte**;
- SHA-256: **de58f418b4d1fe0be449895736d6267f6c5a58c1b1a476b1f36558579a200809**;
- 113 segmenti, 566 nodi, 103 collegamenti;
- impronte sorgente e struttura rispettivamente **99c4ccc3** e **8588371c**.

Il file reale risulta generato in un'esecuzione locale precedente ma non ancora reso disponibile in GitHub, Actions, Drive o Storage. **Non rigenerarlo o sostituirlo tacitamente.** Se non recuperabile, è obbligatoria una nuova emissione esplicita con nuova ricevuta e nuova qualifica dell'impronta, senza attribuire al nuovo file la vecchia identità di byte.

## Archiviazione di una release già emessa

Lo strumento scripts/archive-canonical-vertical-release-v1.mjs richiede il **file già disponibile**, non ricostruisce il curricolo. Esempio:

    node scripts/archive-canonical-vertical-release-v1.mjs \
      --input /private/inbox/release-originale.json \
      --archive-dir /private/durable/arena-release-archive \
      --expected-sha256 de58f418b4d1fe0be449895736d6267f6c5a58c1b1a476b1f36558579a200809

La directory scelta è **esterna al repository Git e a Drive**, deve essere privata e persistente. I file sono conservati come:
- [archivio]/[sha256]/release.json — **byte originali**, senza conversione o nuova serializzazione;
- [archivio]/[sha256]/receipt.json — ricevuta descrittiva priva del contenuto integrale.

Il comando verifica SHA-256, byte e marcatori provvisori; non sovrascrive contenuto già esistente; in una nuova esecuzione accetta soltanto file identici; rilegge e confronta dopo la copia. Non richiede credenziali Google o servizi a pagamento.

**Nuove emissioni:** l'emettitore scripts/emit-canonical-vertical-release-v1.mjs richiede ora anche il parametro --archive-dir. Prima viene conservata la release nell'archivio indipendente e verificata, poi viene scritta nel percorso output. La ricevuta dell'emissione contiene sha256, byte, archiveStatus=IMMUTABLE_PRIMARY_VERIFIED e driveBackupStatus=OPTIONAL_NOT_CONFIRMED. Nessuna sincronizzazione in rete viene presunta.

**Riuso senza rigenerazione:** ogni emissione conserva anche un indice immutabile per la combinazione di istituto, anno scolastico, versione e revisione del master. Ripetere l'emettitore sullo stesso master e sullo stesso archivio **recupera gli esatti byte già emessi**, inclusa la data di emissione originale: la ricevuta espone `PROVISIONAL_RELEASE_REUSED`, non una nuova emissione. Se il contenuto sorgente è cambiato mantenendo la stessa revisione, il comando si arresta senza generare un nuovo JSON. Una richiesta di archiviazione autonoma con impronta diversa per la stessa revisione viene bloccata prima di scrivere nuovi file, evitando residui non qualificati. L'indice vive nella directory primaria privata, non su Drive.

**Limite determinante:** il riuso funziona **solo se l'archivio primario contiene già una release verificata**. La ricevuta storica della rev.27 da sola non permette di ricostruire i byte della precedente emissione. Questo incremento non riporta in vita il file del 03/11/2026 se era stato conservato in una sessione di lavoro non persistente.

**Persistenza:** se la directory indicata appartiene a un ambiente di esecuzione effimero, il salvataggio non è duraturo. Usare uno spazio persistente e con autorizzazione esplicita. La copia operativa finale rimane lo Storage privato separato in Docente OS.

## Copia Drive facoltativa

Quando i byte dell'originale qualificato saranno accessibili tramite un contesto autorizzato:

1. Leggere e verificare dimensione e SHA-256 sull'originale in archivio.
2. Caricare il JSON come **file originale** (non Google Docs) nella cartella Drive privata indicata.
3. Verificare le autorizzazioni Drive e la mancata esposizione pubblica.
4. Eseguire una lettura di ritorno del file caricato e confrontare **SHA-256 e byte**. Dichiarare BACKUP_VERIFIED solo dopo tale controllo.
5. In caso di assenza del file, errore Drive o impossibilità di confronto: BACKUP_PENDING, senza attribuire a un segnaposto il valore di una copia.
6. In caso di recupero, scaricare dal backup, verificare l'impronta originale e ripristinare nell'archivio primario, senza rigenerazione.

L'eventuale mancato funzionamento di Drive **non blocca** Docente OS, il suo accesso al curricolo già autorizzato o il controllo dell'artefatto in Storage.

## Confini di governance

L'archivio contiene il testo integrale privato del master. Ogni trasferimento nel deposito operativo e ogni estensione di accesso richiedono autorizzazione documentata; il semplice backup non certifica l'identità dell'istituto o la vigenza. Non modificare il percorso storico 2C/P7, non approvare il curricolo, non pubblicare contenuti nel repository e non abilitare policy Storage sulla base di questa sola procedura.
