# Stato del Progetto — CurManLight

**Stato formale:** `MAINTENANCE_MODE` (feature-complete rispetto allo scope dichiarato)
**Baseline:** `main@82691b4`
**Versione pubblica:** https://antoniocorsano-boop.github.io/curmanlight/
**Ultimo aggiornamento di stato:** 2026-09-19

---

## Scope completato

| Area | Stato |
|---|---|
| Curriculum 14/14 discipline normalizzate | ✅ |
| Workflow proposte docenti `.cml` | ✅ |
| Import/validazione dipartimenti e referenti | ✅ |
| Evidence panel | ✅ |
| UDA draft (preview/copia/download Markdown) | ✅ |
| PWA installabile | ✅ |
| Accessibilità interna | 88/100 — audit-ready, non certificazione WCAG |

Validazione riproducibile:

```bash
node tools/validate-cml-normalized-curriculum.mjs
node tools/test-runtime-mappa-dati-shape.mjs
```

## Non-goals (fuori scope permanente)

- Nessun backend: tutto resta locale nel browser, per scelta di privacy by design
- Nessuna persistenza delle UDA (bozze da rigenerare a ogni sessione)
- Nessuna integrazione SchoolKB
- Non sostituisce la delibera del Collegio Docenti né la validazione umana
- Nessuna certificazione WCAG formale

## Debito residuo (visibile, non pianificato)

| Elemento | Note |
|---|---|
| Accessibilità P3 (naming/microcopy) | In backlog |
| VoiceOver/macOS | Non testato |
| UDA non esportabili come `.cml` | Limite noto |
| Delta 88→100 accessibilità | Fuori scope corrente |

## Trigger di riapertura dello sviluppo

- La scuola richiede persistenza UDA → nuova milestone dedicata
- Bug critici o rottura su browser correnti → branch hotfix + PR
- Richiesta istituzionale di integrazione SchoolKB → rivalutazione scope

## Manutenzione

- **Controllo periodico:** ogni 6 mesi verificare funzionamento PWA e service worker sui browser correnti
- **Bugfix:** solo via branch dedicati + Pull Request verso `main`; nessuna scrittura diretta su `main`
- **Hotfix critici:** tag di patch (`v1.x.y`) dopo merge e validazione

## Relazione con gli altri repository

| Repo | Relazione |
|---|---|
| [Curriculum-Atlas](https://github.com/antoniocorsano-boop/Curriculum-Atlas) | Successore canonico dichiarato (visualizzazione "Spatial"); attualmente in fase iniziale |
| [docente-os-2026-27](https://github.com/antoniocorsano-boop/docente-os-2026-27) | Piattaforma di nuova generazione (Next.js + Supabase); architettura diversa, scope più ampio |
| [Curriculum-Manager](https://github.com/antoniocorsano-boop/Curriculum-Manager) | Strumento complementare per gestione/export documentale istituzionale |

CurManLight resta lo strumento operativo pubblicato per la consultazione del curricolo verticale finché un successore non raggiunge parità funzionale verificata.
