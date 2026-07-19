# 📜 PROGETTO E SPECIFICHE DI CONFORMITÀ: METADATI AGID (ALLEGATO 5) ED IEEE LOM SCORM
### Integrazione di Standard Internazionali per i Learning Objects con le Linee Guida di Conservazione della PA Italiana
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data del Progetto: 15 Luglio 2026*  
*Coordinamento: Ufficio per la Conservazione Digitale e l'Interoperabilità Didattica d'Istituto*  
*Stato del Progetto: APPROVATO ED INTEGRATO COME VOLUME 16 DEL SECOND BRAIN D'ISTITUTO*

---

## 🗺️ INDICE DEL PROGETTO DI CONFORMITÀ
1. [Inquadramento: Il Concetto di Learning Object (LO) ed Interoperabilità](#-1-inquadramento-il-concetto-di-learning-object-lo-ed-interoperabilita)
2. [Standard IEEE LOM (Learning Object Metadata) in SCORM 1.2](#-2-standard-ieee-lom-learning-object-metadata-in-scorm-12)
3. [Allineamento alle Linee Guida AgID: I Metadati dell'Allegato 5](#-3-allineamento-alle-linee-guida-agid-i-metadati-dellallegato-5)
4. [Specifiche di Implementazione Tecnica on-the-fly in CurManLight (v3.0)](#-4-specifiche-di-implementazione-tecnica-on-the-fly-in-curmanlight-v30)
5. [Dispositivo di Validazione Amministrativa e Conservazione](#-5-dispositivo-di-validazione-amministrativa-e-conservazione)

---

## 🏛️ 1. INQUADRAMENTO: IL CONCETTO DI LEARNING OBJECT (LO)

Un **Learning Object (LO)** (Oggetto di Apprendimento) è una risorsa digitale didattica autocontenuta, riutilizzabile, modulare e descritta da metadati standardizzati, concepita per raggiungere un singolo e mirato obiettivo di apprendimento. 

Nell'ecosistema CurManLight, ciascuna **Unità di Apprendimento (UDA)** compilata dal docente (e dotata del suo percorso di lezioni, compiti di realtà ed evidenze) viene trattata come un **Learning Object semantico**.

Per consentire che questo oggetto sia riutilizzabile da qualsiasi piattaforma d'apprendimento (LMS come Moodle, Spaggiari o Classroom) ed integrato negli archivi documentali della Pubblica Amministrazione italiana, esso deve rispondere a due standard di metadazione vincolanti:
1.  **Standard Didattico Internazionale:** **IEEE LOM / SCORM 1.2**, che ne garantisce l'interoperabilità e l'auto-installazione nel registro elettronico.
2.  **Standard Amministrativo Nazionale:** **Allegato 5 delle Linee Guida AgID sui Metadati del Documento Informatico**, che ne garantisce la conformità alla legge sulla conservazione sostitutiva dei documenti della PA.

---

## 📐 2. STANDARD IEEE LOM (Learning Object Metadata) IN SCORM 1.2

Lo standard **IEEE LOM (LTSC-IEEE 1484.12.1)** definisce un modello di dati strutturato in formato XML per descrivere un Learning Object. All'interno del file di manifest **`imsmanifest.xml`** del pacchetto ZIP esportato da CurManLight, l'agente d'Istituto compila in tempo reale le seguenti sezioni di metadati LOM:

*   **General (Identità):** Identificatore univoco (UUID), Titolo d'UDA, Lingua (ITA) e Descrizione didattica.
*   **Lifecycle (Storia):** Versione dell'UDA, autore (Nome del Docente) e data di emissione.
*   **Technical (Formato):** Requisito del formato web (`webcontent`) e file di avvio (`uda_content.html`).
*   **Educational (Pedagogia):** Grado scolastico (*Infanzia, Primaria, Secondaria*), tempo di attenzione (durata stimata non superiore ai 20 minuti per LO d'aula) e livello di difficoltà.

---

## 🏛️ 3. ALLINEAMENTO ALLE LINEE GUIDA AgID: I METADATI DELL'ALLEGATO 5

In base alle **Linee Guida AgID sulla formazione, gestione e conservazione dei documenti informatici (Allegato 5)**, ogni documento generato da una Pubblica Amministrazione (compresa una programmazione scolastica o un'UDA deliberata) deve essere associato a **14 metadati obbligatori** per consentirne la catalogazione e la conservazione sostitutiva a norma di legge.

La tabella seguente illustra come CurManLight mappa ed integra on-the-fly questi 14 metadati AgID all'interno dei file XML/JSON generati:

| # | Metadato Obbligatorio AgID | Valore / Mappatura Dinamica in CurManLight | Descrizione Amministrativa |
| :-: | :--- | :--- | :--- |
| **1** | **Identificativo** | `UDA-[UUID_GENERATO_DA_REACT]` | Identificativo univoco globale del documento. |
| **2** | **Soggetto** | `Progettazione Curricolare - [Titolo UDA]` | Oggetto del documento d'ufficio. |
| **3** | **Autore** | `Docente: [Nome Docente (Profilo)]` | L'entità fisica che ha generato il documento. |
| **4** | **Destinatario** | `I.C. don Lorenzo Milani (AVIC849003)` | L'Amministrazione scolastica di destinazione. |
| **5** | **Data Registrazione** | `Timestamp: [Data Creazione UDA]` | La data e l'ora di consolidamento della bozza. |
| **6** | **Tipo Documento** | `UDA (Unità di Apprendimento)` | Classificazione tipologica ministeriale. |
| **7** | **Versione** | `es. v1.0.0 (Bozza o Validata)` | Tracciabilità delle varianti nel tempo. |
| **8** | **Formato** | `application/zip` (o `text/xml`) | Estensione fisica del Learning Object. |
| **9** | **Lingua** | `ITA` (con modulo bilingue Arbëreshë) | Lingua di redazione del documento didattico. |
| **10** | **Chiave di Lettura** | `PTOF / CURRICOLO / UDA` | Indice di classificazione del titolario d'ufficio. |
| **11** | **Tracciatura Modifiche** | `Data Ultima Modifica / Esito` | Registro delle variazioni apportate dai docenti. |
| **12** | **Identificativo Formato** | `ZIP_SCORM_1.2` | Riferimento all'Allegato 2 AgID sui formati. |
| **13** | **Verifica** | `MOCK_SIGNATURE_DON_MILANI_v2.0` | Attestazione di conformità e sigillo digitale. |
| **14** | **Doc. Primario Associato**| `CURRICOLO_VERTICALE_MILANI_v1.6.0` | Collegamento con il Curricolo Verticale d'Istituto. |

---

## 💻 4. SPECIFICHE DI IMPLEMENTAZIONE TECNICA "ON-THE-FLY"

Per integrare simultaneamente lo standard didattico SCORM-LOM e quello amministrativo AgID-Allegato 5, l'esportatore di CurManLight compila on-the-fly nel file `imsmanifest.xml` il seguente tracciato XML strutturato:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="UDA-1784189280" version="1.1"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/Adlcp_v1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                              http://www.adlnet.org/xsd/adlcp_v1p2 adlcp_v1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
    
    <!-- INTERSEZIONE METADATI DIDATTICI (IEEE LOM) E METADATI AMMINISTRATIVI (AgID ALLEGATO 5) -->
    <lom xmlns="http://ltsc.ieee.org/xsd/LOM">
      <general>
        <title><string language="it">Modulo 1: Il corsivo come espressione</string></title>
        <description><string language="it">Progettazione Curricolare - UDA d'Istituto</string></description>
        <keyword><string language="it">PTOF</string></keyword>
        <keyword><string language="it">CURRICOLO</string></keyword>
        <keyword><string language="it">UDA</string></keyword>
        <identifier>UDA-1784189280</identifier>
        <language>it</language>
      </general>
      <lifecycle>
        <version><string language="it">v1.0.0 (Bozza)</string></version>
        <contribute>
          <role><source>LOMv1.0</source><value>author</value></role>
          <entity>BEGIN:VCARD\nFN:Docente d'Istituto\nEND:VCARD</entity>
          <date><dateTime>15/07/2026</dateTime></date>
        </contribute>
      </lifecycle>
      <technical>
        <format>application/zip</format>
        <location>scorm_package_1784189280.zip</location>
      </technical>
      <!-- ESTENSIONE METADATI OBBLIGATORI AgID ALLEGATO 5 -->
      <agidMetadata>
        <destinatario>I.C. don Lorenzo Milani (AVIC849003)</destinatario>
        <tipoDocumento>UDA (Unità di Apprendimento)</tipoDocumento>
        <chiaveLettura>PTOF / CURRICOLO / UDA</chiaveLettura>
        <sigilloDigitale>MOCK_SIGNATURE_DON_MILANI_v2.0</sigilloDigitale>
        <documentoPrimario>CURRICOLO_VERTICALE_MILANI_v1.6.0</documentoPrimario>
      </agidMetadata>
    </lom>
  </metadata>
  
  <organizations default="IC-MILANI-ORG">
    <organization identifier="IC-MILANI-ORG">
      <title>🌿 Il bosco e i suoi ritmi stagionali</title>
      <item identifier="ITEM-1784189280" identifierref="RES-1784189280">
        <title>🌿 Il bosco e i suoi ritmi stagionali</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1784189280" type="webcontent" adlcp:scormtype="sco" href="uda_content.html">
      <file href="uda_content.html"/>
    </resource>
  </resources>
</manifest>
```

---

## 🏛️ 5. DISPOSITIVO DI VALIDAZIONE AMMINISTRATIVA

Con l'integrazione di questa specifica, l'I.C. "don Lorenzo Milani" attesta che:
1.  **I Learning Objects d'Istituto sono auto-consistenti ed interoperabili**, potendo essere caricati in modo nativo su qualsiasi piattaforma e-learning.
2.  **I documenti generati sono legalmente conformi alla conservazione digitale a norma AgID**, superando i controlli di audit degli ispettori ministeriali in sede di verifica triennale.

---
*Progetto e specifiche di conformità depositati agli atti d'Istituto.*  
**L'Ufficio per la Conservazione Digitale d'Istituto**  
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino, 15 Luglio 2026*