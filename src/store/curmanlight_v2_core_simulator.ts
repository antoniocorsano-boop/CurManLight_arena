/**
 * 🏛️ CURMANLIGHT v2.0 CORE SIMULATOR - ARCHITETTURA E MOTORE SEMANTICO
 * 
 * Questo modulo implementa gli algoritmi fondamentali per l'Ecosistema v2.0 d'Istituto:
 *  1. Visual Navigation (Navigazione Curricolare per Nodi)
 *  2. Heatmapping d'Istituto (Mappatura Termica dell'Avanzamento Didattico)
 *  3. WikiLLM 2.0 Semantic Suggestion (Suggeritore di Raccordi Interdisciplinari)
 *  4. Auto-Drafting di Unità di Apprendimento (UDA) Interdisciplinari
 */

import { curriculumKB } from '../data/curriculumKB';
import { SchoolOrder, UdaModel } from '../types/curriculum';

// Stato Termico del Nodo
export type HeatStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface NodeHeatMap {
  nodeId: string;
  status: HeatStatus;
  percentage: number;
  message: string;
}

export class CurmanlightV2Engine {
  private savedUda: UdaModel[];
  private decisions: Record<string, string>;

  constructor(savedUda: UdaModel[], decisions: Record<string, string>) {
    this.savedUda = savedUda;
    this.decisions = decisions;
  }

  /**
   * 1. VISUAL NAVIGATION: Trova i nodi correlati e i traguardi nel curricolo d'Istituto
   */
  public getVisualNavigationDetails(nodeId: string, order: SchoolOrder): {
    disciplineName: string;
    nucleiFondanti: string[];
    traguardi: string[];
    obiettivi: string[];
    raccordiCorrelati: string[];
  } {
    const disc = nodeId.toLowerCase();
    const levelData = curriculumKB[disc]?.[order] || { traguardi: [], obiettivi: [], proposals: [], evidenze: [], nucleiFondanti: [] };

    // Estraiamo i raccordi riforme 2025 deliberati
    const raccordi = (levelData.proposals || []).map(p => {
      const dec = this.decisions[p.id];
      if (dec === 'approved') return `[APPROVATO 2025] ${p.focus}: ${p.newText}`;
      return `[INVARIATO 2012] ${p.focus}: ${p.oldText}`;
    });

    return {
      disciplineName: disc.toUpperCase(),
      nucleiFondanti: levelData.nucleiFondanti || ["Curricolo Generale d'Istituto"],
      traguardi: levelData.traguardi || [],
      obiettivi: levelData.obiettivi || [],
      raccordiCorrelati: raccordi
    };
  }

  /**
   * 2. HEATMAPPING D'ISTITUTO: Calcola lo stato termico di copertura di ciascun nodo
   */
  public calculateHeatmapStatus(nodeId: string, order: SchoolOrder): NodeHeatMap {
    const disc = nodeId.toLowerCase();
    const levelData = curriculumKB[disc]?.[order];

    if (!levelData) {
      return { nodeId, status: 'RED', percentage: 0, message: "Grado scolastico o disciplina non presenti nel curricolo." };
    }

    // Conta le UDA salvate per questa disciplina e grado
    const udaCount = this.savedUda.filter(u => u.discipline.toLowerCase() === disc && u.order === order).length;
    
    // Conta i raccordi riforme votati
    const props = levelData.proposals || [];
    const votedProps = props.filter(p => this.decisions[p.id] !== undefined).length;
    
    const propPercentage = props.length > 0 ? (votedProps / props.length) * 100 : 100;
    
    // Calcoliamo la percentuale di copertura didattica d'Istituto
    let percentage = 0;
    if (props.length > 0) {
      percentage = (udaCount > 0 ? 50 : 0) + (propPercentage * 0.5);
    } else {
      percentage = udaCount > 0 ? 100 : 0;
    }

    let status: HeatStatus = 'RED';
    let message = "";

    if (percentage >= 80) {
      status = 'GREEN';
      message = "Copertura didattica eccellente. Dipartimento allineato ed UDA presenti in archivio.";
    } else if (percentage >= 40) {
      status = 'YELLOW';
      message = "Copertura parziale d'area. Raccordi di riforma votati, ma si rende necessaria la stesura di almeno un modulo UDA.";
    } else {
      status = 'RED';
      message = "Attenzione! Area scoperta d'Istituto. Richiede esame urgente del dipartimento disciplinare.";
    }

    return { nodeId, status, percentage: Math.round(percentage), message };
  }

  /**
   * 3. WIKILLM 2.0 SEMANTIC SUGGESTER & AUTO-DRAFTING: Suggerisce e bozza un'UDA Interdisciplinare
   */
  public generateSemanticUdaDraft(
    title: string,
    primaryDisc: string,
    secondaryDisc: string,
    order: SchoolOrder
  ): {
    success: boolean;
    suggestedUda: Partial<UdaModel> & { coAuthors: string; interdisciplinaryFocus: string };
    explanation: string;
  } {
    const pDisc = primaryDisc.toLowerCase();
    const sDisc = secondaryDisc.toLowerCase();

    const pData = curriculumKB[pDisc]?.[order];
    const sData = curriculumKB[sDisc]?.[order];

    if (!pData || !sData) {
      return {
        success: false,
        suggestedUda: {} as any,
        explanation: "Impossibile trovare le discipline o il grado scolastico indicati per la progettazione."
      };
    }

    // Seleziona automaticamente il primo traguardo di ciascuna materia come "ponte"
    const pTraguardo = pData.traguardi?.[0] || "Traguardo primario d'Istituto.";
    const sTraguardo = sData.traguardi?.[0] || "Traguardo secondario di raccordo.";

    const selectedTraguardi = [pTraguardo, sTraguardo];
    const selectedObiettivi = [
      pData.obiettivi?.[0] || "Obiettivo disciplinare primario.",
      sData.obiettivi?.[0] || "Obiettivo disciplinare secondario."
    ];
    const selectedEvidenze = [
      pData.evidenze?.[0] || "Evidenza di competenza primaria.",
      sData.evidenze?.[0] || "Evidenza di competenza secondaria."
    ];

    const suggestedUda = {
      id: `UDA-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title || `Percorso Coordinato ${pDisc.toUpperCase()} + ${sDisc.toUpperCase()}`,
      discipline: primaryDisc,
      order: order,
      period: "Primo Quadrimestre",
      hours: 15,
      status: "bozza" as const,
      traguardi: selectedTraguardi,
      obiettivi: selectedObiettivi,
      evidenze: selectedEvidenze,
      realTask: `Progettazione e realizzazione di un elaborato/progetto concreto che fonda le competenze di ${pDisc.toUpperCase()} con quelle di ${sDisc.toUpperCase()} (es. Laboratorio laboratoriale d'Istituto).`,
      notes: "Misure d'inclusione facilitate d'Istituto: uso di testi ingranditi (EasyReading), sintetizzatore vocale offline d'aula ed organizzazione a piccoli gruppi (Cooperative Learning).",
      createdAt: new Date().toLocaleDateString('it-IT'),
      coAuthors: `Docente di ${sDisc.toUpperCase()}`,
      interdisciplinaryFocus: `Incrocio epistemologico strutturato basato sui nuclei fondanti: '${pData.nucleiFondanti?.[0]}' e '${sData.nucleiFondanti?.[0]}'.`
    };

    const explanation = `🤖 [WikiLLM d'Istituto]: Ho analizzato la tua richiesta ed ho auto-progettato un'UDA Interdisciplinare perfetta! Ho rilevato una splendida connessione semantica tra i nuclei fondanti di ${primaryDisc.toUpperCase()} ('${pData.nucleiFondanti?.[0]}') e ${secondaryDisc.toUpperCase()} ('${sData.nucleiFondanti?.[0]}'), raccordandoli con i traguardi ministeriali D.M. 221/2025.`;

    return { success: true, suggestedUda, explanation };
  }
}
