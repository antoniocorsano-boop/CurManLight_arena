# CML-606 — Audit UI

## Data
22 Luglio 2026

## Scope
Analisi completa dell'interfaccia utente di CurManLight per identificare problemi di coerenza, accessibilità e progettazione.

## Metriche rilevate

### Font-size arbitrario
| Valore | Occorrenze | Problema |
|---|---|---|
| text-[10px] | 301 | Sotto la soglia WCAG per testo piccolo |
| text-[9px] | 248 | Sotto 12px |
| text-[8px] | 116 | Sotto 12px |
| text-[11px] | 82 | Accettabile ma non standard |
| text-[7px] | 15 | In-leggibile |
| text-[9.5px] | 5 | Non standard |
| text-[8.5px] | 1 | Non standard |

**Totale:** 757 usi di font-size arbitrario

### font-black (peso 900)
**Occorrenze:** 464
**Problema:** Eccessivamente pesante per label, badge e testo descrittivo. Crea un'interfaccia "urlante".

### Palette cromatica
| Colore | Occorrenze |
|---|---|
| indigo-* | 451 |
| purple-* | 21 |
| violet-* | 6 |

**Problema:** Triplice palette non intenzionale. Alias `primary` dal config ignorato.

### Border-radius
| Valore | Occorrenze |
|---|---|
| rounded-xl | 301 |
| rounded-lg | 178 |
| rounded-2xl | 119 |
| rounded-full | 71 |
| rounded-3xl | 8 |

**Problema:** Incoerenza sistematica. Stessi elementi usano raggi diversi.

### Ombre
| Valore | Occorrenze |
|---|---|
| shadow-sm | 181 |
| shadow-md | 69 |
| shadow-2xl | 21 |
| shadow-indigo-600/* | 18 |
| shadow-emerald-500/* | 5 |

**Problema:** Ombre colorate non standard. `shadow-sm` sovraccaricato.

### Uppercase
**Occorrenze:** 525
**Problema:** Riduce la leggibilità del 10-15%.

### Pattern card inline
**Occorrenze:** 263
**Problema:** Il componente Card esiste ma non è usato. Ogni feature ricrea card ad hoc.

### Badge
**Occorrenze:** ~15
**Problema:** Componente Badge esistente ma quasi mai importato.

### Modal
**Occorrenze:** ~404 riferimenti
**Problema:** 10+ modali gestiti da store diversi, costruiti da zero senza pattern unificato.

## Problemi confermati

1. **Font-size sotto 10px** — Critico per accessibilità
2. **font-black usato ovunque** — Interfaccia aggressiva
3. **Triplice palette** — Non intenzionale
4. **Border-radius incoerenti** — Stessi elementi con raggi diversi
5. **Componenti esistenti ignorati** — Card, Badge non adottati
6. **Ombre colorate** — Non standard
7. **Uppercase eccessivo** — Riduce leggibilità

## Problemi parziali

1. **Modal frammentati** — 10+ store diversi
2. **Indigo-150 non standard** — 17 occorrenze
3. **EsportazioniTab monolitico** — 430 righe, 7 colori diversi

## Problemi non riscontrati

1. Nessun uso eccessivo di `animate-pulse`
2. Il sistema di toast è presente e strutturato
3. Lo stato vuoto è gestito bene in DocumentExportHistory
4. La media query per stampa PDF è ben pensata

## Decisioni adottate in CML-606

1. Token CSS semantici al posto di colori diretti
2. Scala tipografica con minimi 12px
3. Pesi font limitati a medium/semibold/bold
4. Border-radius standardizzati (6/8/12px)
5. Gerarchia azioni (primary/secondary/quiet/danger)
6. Nessuna ombra colorata
7. Uppercase limitato a etichette e badge
