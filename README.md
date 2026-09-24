# CurManLight Arena

> **Governare il curricolo, renderlo verificabile e trasferirlo alla pratica senza confondere autorità e operatività.**

CurManLight Arena è il livello di **governance curricolare istituzionale** dell'ecosistema TRAMA.

- **Arena governa** fonti, provenienza, applicabilità, baseline, proposte, riesame, decisioni e handoff versionati.
- **Curriculum Atlas** rende il curricolo pubblico, intelligibile e navigabile e ospita risorse/learning objects secondo i relativi contratti.
- **Docente OS** rende il curricolo operativo nel lavoro del docente.

Arena non è il workspace quotidiano del docente e non è il repository operativo dei materiali di lezione.

## Stato e autorità

Questa README è una home di orientamento. **Non è una fonte di maturità, promozione o autorizzazione runtime.**

Per stato corrente, gate e decisioni usare nell'ordine:
1. `AGENTS.md`;
2. `docs/architecture/INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md`;
3. tracker, PR e ricevute exact-head correnti;
4. contratti architetturali pertinenti;
5. implementazione e test sulla revisione corrente.

## Confini essenziali

Arena possiede:
- autorità e provenienza curricolare;
- applicabilità e versioni;
- proposte, riesame e decisioni istituzionali;
- handoff espliciti e versionati;
- intake di evidenze professionali come input non autoritativo.

Arena non possiede:
- dati operativi individuali degli studenti;
- esecuzione quotidiana delle lezioni;
- authoring operativo delle UDA;
- archivio materiali didattici;
- authority di Atlas o Docente OS;
- scritture automatiche cross-product.

## Ecosistema

```text
Arena (GOVERN)
  ├─> Atlas (NAVIGATE / PUBLISH)
  └─> Docente OS (OPERATE)

Atlas -> Docente OS: riferimenti/materiali secondo contratti governati
Docente OS -> Arena: evidenze professionali per revisione, mai mutazione automatica
```

Nessun database canonico mutabile è condiviso tra i tre prodotti.

## Documenti da leggere

- [AGENTS.md](AGENTS.md)
- [Memoria governata integrata](docs/architecture/INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md)
- [Arena / Atlas / Docente OS boundary](docs/architecture/ARENA_ATLAS_DOCENTE_OS_SURFACE_BOUNDARY_M4S4.md)
- [ECO-00 Ecosystem Role & Handoff](docs/architecture/ECO00_ECOSYSTEM_ROLE_AND_HANDOFF.md)
- [Adoption & Validation Development Guide](docs/architecture/CURRICULUM_ADOPTION_VALIDATION_DEVELOPMENT_GUIDE_V1.md)
- [M4 Operations Runbook](docs/architecture/ARENA_M4_OPERATIONS_RUNBOOK.md)
- [Indice documentale](docs/README.md)
- [Struttura del repository](docs/REPOSITORY_STRUCTURE.md)

## Contribuire

Vedi [CONTRIBUTING.md](CONTRIBUTING.md) e [SECURITY.md](SECURITY.md).

## Esecuzione locale

```bash
npm ci
npm run dev
```

Verifiche ordinarie:

```bash
npm run test:fast
npm run build
```

## Principio

> **Arena non decide al posto delle persone. Conserva confini, provenienza, evidenze e storia delle decisioni curricolari.**
