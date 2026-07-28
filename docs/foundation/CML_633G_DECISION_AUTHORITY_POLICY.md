# CML-633G — Decision Authority Policy

## DecisionAuthority
```typescript
interface DecisionAuthority {
  declaredRole: DecisionAuthorityRole;
  otherDescription?: string;
  note?: string;
}
```

## DecisionAuthorityRole
`docente`, `dipartimento`, `coordinatore`, `referente-curricolo`, `dirigente-scolastico`, `collegio-docenti`, `consiglio-istituto`, `altro`.

## Principi
- **Dichiarato, non autenticato.** Il ruolo è auto-dichiarato, non verificato da sistema di autenticazione.
- **Non equivale a firma.** La presenza di authority non costituisce firma digitale né prova di deliberazione.
- **Deve essere accompagnato da data e motivazione.** `decidedAt` e `rationale` sono obbligatori per `recorded-local`.
- **Distinto dall'autore materiale.** `decidedBy` (chi registra) è separato da `authority.declaredRole` (chi decide).
- **Non prova la validità della deliberazione.** `recorded-local` è un registro locale, non un protocollo ufficiale.

## DecisionStatus
`draft` → `recorded-local` → `superseded` | `revoked` | `archived`. `legacy` → `draft` | `archived`.

## recorded-local
Significato: la decisione è stata registrata localmente nel sistema. Non implica:
- adozione istituzionale
- validità formale
- protocollazione
- approvazione collegiale
- modifica del curricolo

## Vincoli
- Nessuna autenticazione
- Nessuna firma digitale
- Nessuna simulazione di voto collegiale
- Nessuna autorità verificata
- I ruoli dichiarati non vengono promossi a ruoli istituzionali verificati