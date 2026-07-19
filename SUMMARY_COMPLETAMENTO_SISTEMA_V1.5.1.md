# 🏆 RILASCIO INCREMENTALE v1.5.1 — COLLAUDO E DELIBERA COLLEGIO DOCENTI
### Verbale di Integrazione e Pubblicazione della Bozza di Delibera d'Istituto
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data di Rilascio: 14 Luglio 2026*  
*Stato del Sistema: 100% CERTIFICATO, INTEGRIZZATO E PRONTO ALL'USO*

---

## 🗺️ INDICE DELL'AGGIORNAMENTO v1.5.1
1. [Integrazione Volume 10: Proposta di Delibera d'Istituto](#-1-integrazione-volume-10-proposta-di-delibera-distituto)
2. [Allineamento dei Grafici e della Wiki in App.tsx](#-2-allineamento-dei-grafici-e-della-wiki-in-apptsx)
3. [Allineamento Semantico del WikiLLM (Interrogazione d'Istituto)](#-3-allineamento-semantico-del-wikillm-interrogazione-distituto)
4. [Compilazione, ZIP e Rilascio su Canali Pubblici Surge.sh](#-4-compilazione-zip-e-rilascio-su-canali-pubblici-surgesh)

---

## 🏛️ 1. INTEGRAZIONE VOLUME 10: PROPOSTA DI DELIBERA D'ISTITUTO

È stato creato il nuovo documento ufficiale **Volume 10 della Knowledge Base d'Istituto** (`second-brain/10_PROPOSTA_DELIBERA_COLLEGIO_DOCENTI.md`). Questo file funge da "fonte certa" per il Dirigente Scolastico e i suoi collaboratori, fornendo il testo normativo ed ordinamentale necessario per deliberare l'adozione del Curricolo Verticale v1.5.0 e del sistema CurManLight in sede di Collegio dei Docenti.

### Elementi chiave del testo di delibera integrato:
* **Inquadramento Normativo**: Citazione delle leggi nazionali ed europee rilevanti (D.M. 221/2025, D.M. 183/2024, D.M. 14/2024, D.Lgs. 62/17, DPR 275/99 e Artt. 68-69 del CAD).
* **Motto Didattico d'Istituto**: Consolidamento formale del precetto **"Non multa, sed multum"** come asse portante del PTOF per focalizzare gli apprendimenti disciplinari.
* **Schema di Transizione Graduale**: 
  * *Infanzia (Plesso Calvario)*: A regime immediato su 5 Campi di Esperienza con pregrafismo in corsivo continuo.
  * *Primaria (Plesso Greci)*: Solo classi prime (1^) con educazione finanziaria, minoranze linguistiche arbëreshë.
  * *Secondaria (Sede Covotta)*: Solo classi prime (1^), attivazione progressiva del Latino (LEL) dal 2027/2028 in classe seconda, e curvatura STEM (36h con Blender 3D CAD).
* **Dispositivo di Delibera**: Formula formale di voto per adozione ed integrazione al PTOF.

Inoltre, il **Volume 0 (`second-brain/00_INDICE_GENERALE.md`)** è stato aggiornato per registrare e mappare in modo coerente tutti gli 11 volumi (da 0 a 10), coprendo anche il precedentemente escluso *Volume 6 (Repertorio Pedagogico)*.

---

## 🎨 2. ALLINEAMENTO DEI GRAFICI E DELLA WIKI IN `APP.TSX`

Il codice del frontend React in `src/App.tsx` è stato ampliato ed allineato a questa nuova aggiunta:

1. **Architecture Graph (Matrice Applicazione):** Aggiunto il nodo `vol10` (`10_PROPOSTA_DELIBERA.md`) con coordinate bilanciate ed i relativi link relazionali che collegano `brain` a `vol10` ("raccorda").
2. **Didactic Knowledge Graph (Didattica per Competenze):** Aggiunto il nodo `vol10` nella mappa interattiva collegato al nodo `vol8` (Volume del Curricolo) con l'azione relazionale "approva".
3. **Side-by-Side Wiki (Interfaccia Utente):**
  * Esteso lo stato `selectedBrainDoc` per accogliere il tipo `'vol10'`.
  * Integrato il pulsante di selezione visiva per `10_PROPOSTA_DELIBERA.md` dotato di icona istituzionale (`🏛️`).
  * Inserito il pannello di riassunto dinamico per presentare i contenuti chiave della delibera al clic del docente.

---

## 🤖 3. ALLINEAMENTO SEMANTICO DEL WIKILLM (INTERROGAZIONE D'ISTITUTO)

Per consentire l'interrogazione libera da parte dei docenti, il processore di query del copilota pedagogico **WikiLLM** è stato potenziato:
* Aggiunto il matching semantico per query contenenti termini quali *"delibera"*, *"collegio"*, *"approvazione"* o *"deliberazione"*. Il sistema risponde ora fornendo la spiegazione formale dell'atto di adozione d'Istituto e del cronoprogramma di transizione graduale.
* Inserito un pulsante di scelta rapida con la domanda precompilata: **"Qual è l'atto formale di adozione del Curricolo e di CurManLight?"** nel pannello delle domande pedagogiche frequenti d'Istituto.

---

## 🚀 4. COMPILAZIONE, ZIP E RILASCIO SU CANALI PUBBLICI SURGE.SH

Il sistema è stato sottoposto a test di compilazione locale e a pubblicazione:
1. **Compilazione Single-File (`npm run build`)**: Vite ha ottimizzato e compilato l'intera codebase in un unico file autonomo inlined di **620.22 KB** esente da dipendenze esterne.
2. **Aggiornamento ZIP Consolidato (`CurManLight_Ecosystem_Completo.zip`)**: Ricostruito l'archivio ZIP comprensivo del nuovo volume, dei sorgenti aggiornati, delle configurazioni e della suite di test Playwright.
3. **Rilascio Pubblico Online**: 
   * **[http://curmanlight-donmilani.surge.sh](http://curmanlight-donmilani.surge.sh)** (Canale Classico Aggiornato)
   * **[http://curmanlight-milani-v15.surge.sh](http://curmanlight-milani-v15.surge.sh)** (Nuovo Canale Pulito v1.5)

---
*Rapporto di completamento v1.5.1 certificato per l'Istituto.*  
**I.C. Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino, 14 Luglio 2026*
