import departmentManifest from './departmentCurriculumV31.json';

export type CurriculumAreaAvailability = 'available-pilot' | 'not-acquired';

export type CurriculumDisciplineRegistryItem = {
  id: string;
  label: string;
};

export type CurriculumAreaRegistryItem = {
  id: string;
  label: string;
  scopeLabel: string;
  description: string;
  availability: CurriculumAreaAvailability;
  disciplines: CurriculumDisciplineRegistryItem[];
  sourceInstitutionName?: string;
  sourceVersionLabel?: string;
  academicYear?: string;
  driveFileId?: string;
  sourceSha256?: string;
};

export const CURRICULUM_AREA_REGISTRY: CurriculumAreaRegistryItem[] = [
  {
    id: 'scientific-mathematical-technological',
    label: departmentManifest.institution.department,
    scopeLabel: 'Area disponibile',
    description: 'Fascicolo verticale attualmente acquisito e tracciato nella Beta. Comprende le progressioni disciplinari disponibili per Matematica, Scienze, Tecnologia e Informatica; STEM è trattato come asse trasversale.',
    availability: 'available-pilot',
    disciplines: [
      { id: 'matematica', label: 'Matematica' },
      { id: 'scienze', label: 'Scienze' },
      { id: 'tecnologia', label: 'Tecnologia' },
      { id: 'informatica', label: 'Informatica' },
    ],
    sourceInstitutionName: departmentManifest.institution.name,
    sourceVersionLabel: departmentManifest.source.versionLabel,
    academicYear: departmentManifest.institution.academicYear,
    driveFileId: departmentManifest.source.driveFileId,
    sourceSha256: departmentManifest.source.sha256,
  },
  {
    id: 'humanities-languages',
    label: 'Area umanistico-linguistica',
    scopeLabel: 'Copertura da acquisire',
    description: 'Il modello di prodotto prevede questa area, ma la Beta non dispone ancora di un fascicolo sorgente equivalente, versionato e verificabile. Nessun contenuto viene simulato.',
    availability: 'not-acquired',
    disciplines: [],
  },
  {
    id: 'arts-expression',
    label: 'Area artistico-espressiva',
    scopeLabel: 'Copertura da acquisire',
    description: 'Area prevista nell’architettura curricolare, non ancora acquisita nella nuova pubblicazione professionale. Resta esplicitamente distinta dal fascicolo scientifico.',
    availability: 'not-acquired',
    disciplines: [],
  },
  {
    id: 'early-childhood',
    label: 'Infanzia · campi di esperienza',
    scopeLabel: 'Copertura da acquisire',
    description: 'La verticalità 3–14 richiede anche il raccordo con i campi di esperienza. Il fascicolo dedicato non è ancora presente nella Beta corrente e non viene ricostruito da dati legacy.',
    availability: 'not-acquired',
    disciplines: [],
  },
];

export const AVAILABLE_DEPARTMENT_PUBLICATION = CURRICULUM_AREA_REGISTRY.find(
  (area) => area.availability === 'available-pilot',
) as CurriculumAreaRegistryItem;
