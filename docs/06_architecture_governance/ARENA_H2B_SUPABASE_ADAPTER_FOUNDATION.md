# ARENA H2B — Supabase Adapter Foundation

Stato: IMPLEMENTATION BASELINE  
Data: 2026-08-24

## Scopo

H2B prepara CurManLight Arena al workspace condiviso senza trasformare Supabase nella dipendenza obbligatoria dell'applicazione e senza modificare il comportamento local-first già consolidato.

La modalità locale continua a funzionare con Dexie anche quando Supabase non è configurato.

## Configurazione pubblica

Sono riconosciute esclusivamente:

- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_PUBLISHABLE_KEY`.

Regole:

1. entrambe assenti → modalità Supabase `disabled`;
2. una sola presente → configurazione `invalid`, nessun client creato;
3. URL non HTTPS → configurazione `invalid`;
4. entrambe valide → client browser disponibile;
5. nessuna service-role key può essere esposta tramite `VITE_*`.

Il template `.env.example` contiene soltanto campi pubblici e non contiene credenziali reali.

## Confine infrastrutturale

Il client Supabase vive in `src/infrastructure/supabase/` e non viene importato nei domini curricolari.

```text
Domain: institution / Human Task
              │
              ▼
     SharedWorkspaceRepository
              │
              ▼
Infrastructure adapter Supabase
              │
              ▼
       PostgreSQL + RLS
```

`SupabaseSharedWorkspaceRepository` esegue in H2B soltanto letture di membership.

Prima di valutare una capability, il repository rilegge la membership dal backend. Un ruolo presente nel contesto client non è sufficiente.

## Schema database H2B

La migrazione `20260824070000_h2b_workspace_foundation.sql` introduce:

- `workspaces`;
- `workspace_memberships`;
- vincoli canonici su ruolo e stato;
- indici per utente/workspace;
- RLS abilitata su entrambe le tabelle.

### Policy deliberate

In H2B un utente autenticato può:

- leggere **la propria membership**;
- leggere un workspace soltanto se possiede una membership `active` nello stesso workspace.

In H2B un utente browser **non può**:

- creare workspace;
- creare membership;
- cambiare il proprio ruolo;
- cambiare lo stato della membership;
- revocare altri utenti;
- autoattribuirsi `collegio`, `dirigente` o `amministratore`.

Non esistono policy `INSERT`, `UPDATE` o `DELETE` per il client. La futura amministrazione richiederà una slice separata con policy/RPC esplicite, capability e audit.

## Relazione con il vecchio Workspace Google

Il codice storico Google/Drive in `features/workspace` non viene utilizzato come sorgente di autenticazione Supabase.

In particolare:

- `workspaceAccessToken` locale non diventa una sessione Supabase;
- `workspaceUserEmail` non costituisce membership;
- `isWorkspaceLoggedIn` non concede capability H2;
- i due flussi restano separati finché non verrà definita una migrazione esplicita.

## Gate CI

La Product CI viene rafforzata con due livelli:

1. suite veloce storica;
2. test Human Governance dedicati H0–H2B.

Il secondo gate copre:

- cognitive gate;
- Human Task della revisione;
- role/capability boundary;
- configurazione Supabase opzionale;
- membership backend e fail-closed authorization.

Seguono TypeScript e build di produzione.

## Non incluso in H2B

- creazione del progetto Supabase remoto;
- applicazione della migrazione a un progetto reale;
- login UI;
- onboarding membri;
- scritture condivise;
- sincronizzazione dati curricolari;
- amministrazione membership;
- realtime.

Questi elementi vengono autorizzati soltanto dopo che l'infrastruttura H2B ha superato i gate e viene scelto esplicitamente il progetto/organizzazione Supabase da usare.
