export type CurriculumPersistenceMode =
  | 'legacy-only'
  | 'dual-read'
  | 'dual-write'
  | 'new-domain-primary';

export const CURRICULUM_PERSISTENCE_MODE: CurriculumPersistenceMode = 'legacy-only';
