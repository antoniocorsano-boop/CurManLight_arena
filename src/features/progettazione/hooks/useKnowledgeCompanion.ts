import { useState, useMemo } from 'react';
import { volumesKB, getVolumeTitle } from '../../../data/volumesKB';

export type ReferenceCategory = 'Curricolo' | 'Fonte normativa' | 'Approfondimento';

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
      ? 'Riferimenti per la coerenza degli obiettivi con il curricolo dell\'Infanzia. La consultazione è facoltativa.'
      : 'Riferimenti per la coerenza dei traguardi con disciplina e ordine scolastico. La consultazione è facoltativa.',
    references: [
      {
        volumeId: 'vol4',
        category: 'Curricolo',
        title: getVolumeTitle('vol4'),
        excerpt: 'Il curricolo fondativo dell\'Istituto definisce gli obiettivi verticali e le competenze attese per ciascuna disciplina, dalla scuola dell\'Infanzia alla Secondaria di I Grado.',
        relevance: 'Può aiutarti a verificare la coerenza dei traguardi selezionati con il percorso verticale.',
        main: true,
      },
      {
        volumeId: 'vol8',
        category: 'Curricolo',
        title: getVolumeTitle('vol8'),
        excerpt: 'Mappatura completa e verticale delle 14 discipline d\'Istituto con traguardi, obiettivi e nuclei fondanti per ogni ordine e livello.',
        relevance: 'Dettaglio specifico della disciplina selezionata con tutti gli obiettivi per classe.',
        main: false,
      },
      {
        volumeId: 'vol6',
        category: 'Approfondimento',
        title: 'Traguardo di Competenza',
        excerpt: 'Il traguardo descrive la competenza attesa alla fine del ciclo scolastico. Si distingue dall\'obiettivo di apprendimento, che è più specifico e misurabile. Il traguardo è un punto di riferimento stabile, mentre gli obiettivi si adattano al contesto della classe.',
        relevance: 'Approfondisci se vuoi capire la differenza tra traguardo e obiettivo.',
        main: false,
      },
    ],
  }),

  3: () => ({
    intro: 'Le evidenze collegano le attività osservabili ai traguardi di competenza. La consultazione è facoltativa.',
    references: [
      {
        volumeId: 'vol3',
        category: 'Fonte normativa',
        title: 'DM 14/2024 — Evidenze di Certificazione',
        excerpt: 'Le evidenze comportamentali, ai sensi del DM 14/2024, sono osservabili e misurabili. Collegate ai traguardi di competenza, documentano il processo di certificazione delle competenze alla fine del primo ciclo d\'istruzione.',
        relevance: 'La fonte normativa spiega cosa sono le evidenze e come si collegano ai traguardi.',
        main: true,
      },
      {
        volumeId: 'vol6',
        category: 'Approfondimento',
        title: 'Evidenza Comportamentale',
        excerpt: 'Comportamento osservabile che dimostra il raggiungimento di un traguardo. Si distingue dall\'obiettivo di apprendimento per la sua natura integrativa: non misura un singolo task, ma la manifestazione concreta di una competenza matura.',
        relevance: 'Approfondisci se vuoi capire la differenza tra evidenza e obiettivo.',
        main: false,
      },
    ],
  }),

  4: () => ({
    intro: 'Riferimenti per compito di realtà e note di inclusione. La consultazione è facoltativa.',
    references: [
      {
        volumeId: 'vol6',
        category: 'Approfondimento',
        title: 'Compito di Realtà',
        excerpt: 'Prodotto o servizio reale che l\'alunno produce utilizzando le competenze sviluppate nell\'Unità Didattica di Apprendimento. Caratteristiche: autenticità, complessità, contestualizzazione. Il compito di realtà si distingue dalla prova tradizionale perché richiede l\'integrazione di più competenze in un contesto significativo.',
        relevance: 'Può aiutarti a formulare un compito di realtà coerente con l\'UDA.',
        main: true,
      },
      {
        volumeId: 'vol3',
        category: 'Fonte normativa',
        title: 'PEI / PDP / UDL — Quadro Normativo Inclusione',
        excerpt: 'PEI (D.M. 182/2020): Piano Educativo Individualizzato per alunni con disabilità. PDP (L. 170/2010): Piano Didattico Personalizzato per disturbi specifici dell\'apprendimento. UDL: Universal Design for Learning — progettazione universale per l\'apprendimento con strumenti compensativi e misure dispensative.',
        relevance: 'Riferimento normativo per le note di inclusione BES/DSA.',
        main: false,
      },
      {
        volumeId: 'vol19',
        category: 'Approfondimento',
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
        title: getVolumeTitle(overlayVolumeId),
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
