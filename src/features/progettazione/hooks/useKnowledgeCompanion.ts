import { useState, useMemo } from 'react';
import { volumesKB, getVolumeTitle } from '../../../data/volumesKB';

export type ReferenceCategory = 'Archivio storico' | 'Approfondimento archivio';

export interface KnowledgeReference {
  volumeId: string;
  category: ReferenceCategory;
  title: string;
  excerpt: string;
  relevance: string;
  main: boolean;
}

interface StepReferences {
  intro: string;
  references: KnowledgeReference[];
}

const STEP_REFS: Record<number, (discipline: string, order: string) => StepReferences> = {
  2: (_discipline, order) => ({
    intro: order === 'infanzia'
      ? 'Archivio storico non verificato su obiettivi per l\'Infanzia; consultazione facoltativa.'
      : 'Archivio storico non verificato sui traguardi; materiale dipendente dalle fonti e facoltativo.',
    references: [
      {
        volumeId: 'vol4',
        category: 'Archivio storico',
        title: getVolumeTitle('vol4'),
        excerpt: 'Fonte storica archiviata relativa a una precedente proposta curricolare verticale.',
        relevance: 'Consultazione non verificata: non descrive il curricolo attivo o l\'autorità corrente.',
        main: true,
      },
      {
        volumeId: 'vol8',
        category: 'Archivio storico',
        title: getVolumeTitle('vol8'),
        excerpt: 'Mappatura storica archiviata di discipline, traguardi e obiettivi.',
        relevance: 'Fonte dipendente dall\'archivio, non verificata e non rappresentativa della configurazione corrente.',
        main: false,
      },
      {
        volumeId: 'vol6',
        category: 'Approfondimento archivio',
        title: 'Traguardo di Competenza',
        excerpt: 'Il traguardo descrive la competenza attesa alla fine del ciclo scolastico. Si distingue dall\'obiettivo di apprendimento, che è più specifico e misurabile. Il traguardo è un punto di riferimento stabile, mentre gli obiettivi si adattano al contesto della classe.',
        relevance: 'Approfondisci se vuoi capire la differenza tra traguardo e obiettivo.',
        main: false,
      },
    ],
  }),

  3: () => ({
    intro: 'Materiale storico archiviato e non verificato sulle evidenze. Consultazione facoltativa.',
    references: [
      {
        volumeId: 'vol3',
        category: 'Archivio storico',
        title: 'Archivio storico — Evidenze e certificazione',
        excerpt: 'Sintesi storica archiviata relativa alle evidenze comportamentali e alla certificazione.',
        relevance: 'Non è una fonte normativa verificata: consulta il testo ufficiale applicabile.',
        main: true,
      },
      {
        volumeId: 'vol6',
        category: 'Approfondimento archivio',
        title: 'Evidenza Comportamentale',
        excerpt: 'Comportamento osservabile che dimostra il raggiungimento di un traguardo. Si distingue dall\'obiettivo di apprendimento per la sua natura integrativa: non misura un singolo task, ma la manifestazione concreta di una competenza matura.',
        relevance: 'Approfondisci se vuoi capire la differenza tra evidenza e obiettivo.',
        main: false,
      },
    ],
  }),

  4: () => ({
    intro: 'Materiale storico archiviato e non verificato per compiti di realtà e inclusione.',
    references: [
      {
        volumeId: 'vol6',
        category: 'Approfondimento archivio',
        title: 'Compito di Realtà',
        excerpt: 'Prodotto o servizio reale che l\'alunno produce utilizzando le competenze sviluppate nell\'Unità Didattica di Apprendimento. Caratteristiche: autenticità, complessità, contestualizzazione. Il compito di realtà si distingue dalla prova tradizionale perché richiede l\'integrazione di più competenze in un contesto significativo.',
        relevance: 'Può aiutarti a formulare un compito di realtà coerente con l\'UDA.',
        main: true,
      },
      {
        volumeId: 'vol3',
        category: 'Archivio storico',
        title: 'Archivio storico — PEI / PDP / UDL',
        excerpt: 'PEI (D.M. 182/2020): Piano Educativo Individualizzato per alunni con disabilità. PDP (L. 170/2010): Piano Didattico Personalizzato per disturbi specifici dell\'apprendimento. UDL: Universal Design for Learning — progettazione universale per l\'apprendimento con strumenti compensativi e misure dispensative.',
        relevance: 'Sintesi archiviata non verificata; consulta le fonti ufficiali applicabili.',
        main: false,
      },
      {
        volumeId: 'vol19',
        category: 'Approfondimento archivio',
        title: 'Ambiente Classe e Apprendimento Cooperativo',
        excerpt: 'Jigsaw, Peer Tutoring, Learning Station: metodologie per l\'inclusione attiva. Ogni studente contribuisce con un ruolo definito alla costruzione collettiva del sapere. Il lavoro cooperativo favorisce l\'integrazione e sviluppa competenze sociali insieme a quelle disciplinari.',
        relevance: 'Metodologie utili per la progettazione inclusiva della tua UDA.',
        main: false,
      },
    ],
  }),
};

export function useKnowledgeCompanion(
  wizardStep: number,
  discipline: string,
  order: string
) {
  const [expanded, setExpanded] = useState(false);
  const [overlayVolumeId, setOverlayVolumeId] = useState<string | null>(null);

  const stepData = useMemo(() => {
    if (wizardStep < 2 || wizardStep > 4) return null;
    const factory = STEP_REFS[wizardStep];
    if (!factory) return null;
    return factory(discipline, order);
  }, [wizardStep, discipline, order]);

  const mainRef = stepData?.references.find(r => r.main) ?? null;
  const additionalRefs = stepData?.references.filter(r => !r.main) ?? [];

  const openOverlay = (volumeId: string) => setOverlayVolumeId(volumeId);
  const closeOverlay = () => setOverlayVolumeId(null);
  const toggleExpand = () => setExpanded(prev => !prev);

  const overlayContent = overlayVolumeId
    ? {
        id: overlayVolumeId,
        title: `Archivio storico non verificato: ${getVolumeTitle(overlayVolumeId)}`,
        html: volumesKB[overlayVolumeId]?.html ?? '<p>Contenuto non disponibile.</p>',
      }
    : null;

  return {
    intro: stepData?.intro ?? '',
    mainRef,
    additionalRefs,
    expanded,
    overlayContent,
    openOverlay,
    closeOverlay,
    toggleExpand,
    visible: wizardStep >= 2 && wizardStep <= 4,
  };
}
