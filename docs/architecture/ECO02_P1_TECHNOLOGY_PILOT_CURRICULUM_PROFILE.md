# ECO-02/P1 — profilo curricolare del pilota teacher-first

Status: **AUTHORIZED / PILOT_REQUIRED / TEACHER_CONTROLLED**  
Data: 2026-09-20  
Caso: **Tecnologia · classe 2C · Agricoltura come sistema tecnologico**

## Scopo

Fornire al pilota un riferimento curricolare governato senza trasformare Arena in uno spazio operativo di classe.

## Fonte autorevole

- Proiezione curricolare: `src/features/curriculum/data/departmentCurriculumV31.section-09.json`
- Regime: **Indicazioni 2012 — transizione**
- Nucleo: **Cultura tecnica e sistemi**
- Traguardo pertinente: analizzare sistemi, servizi e filiere con più componenti.
- Obiettivo annualizzato: individuare relazioni, flussi e criticità; confrontare alternative.

La progettazione `ACT-B01-2 / CAN-PACK-2A` resta evidenza didattica. Non sostituisce né modifica il curricolo Arena.

## Contratto di ingresso al pilota

Prima dell'uso in Docente OS devono essere visibili:

1. identità/versione del curricolo;
2. stato di autorità;
3. riferimento alla fonte;
4. regime e applicabilità alla classe seconda;
5. impronta strutturale capace di rilevare variazioni significative;
6. esito richiesto: accettazione o rivalidazione del docente.

Se l'impronta non è materializzata, lo stato resta **NON PRONTO ALL'ESECUZIONE**.

## Variazione controllata

Il collaudo di rivalidazione deve usare una variazione simulata e non canonica dell'impronta, senza mutare il curricolo approvato. L'esito atteso in Docente OS è:

- proposta precedente preservata;
- materiali e scelte del docente preservati;
- stato portato a **RIVALIDAZIONE RICHIESTA**;
- nessuna pubblicazione o accettazione automatica.

## Confini

- Arena non riceve dati personali o osservazioni sugli alunni.
- Atlas non intermedia l'autorità curricolare.
- Docente OS non promuove né riscrive il curricolo.
- `DOS-A1` resta `RUNTIME_DEFERRED`.
- L'evidenza del pilota non apre ECO-01/S4.
