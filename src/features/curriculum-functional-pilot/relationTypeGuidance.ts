/**
 * CML-631C — Relation Type Guidance
 *
 * Descrizioni e esempi per i tipi di relazione verticale.
 * File tipizzato per evitare stringhe non tipizzate.
 */

import type { VerticalCurriculumRelationType } from '../../domain/curriculum';

export interface RelationTypeGuidance {
  description: string;
  example: string;
}

export const RELATION_TYPE_GUIDANCE: Record<VerticalCurriculumRelationType, RelationTypeGuidance> = {
  continuity: {
    description: 'Il contenuto del nodo sorgente continua logicamente nel nodo destinazione.',
    example: 'Numeri naturali (primaria) → Numeri relativi (secondaria)',
  },
  development: {
    description: 'Il contenuto del nodo sorgente si sviluppa e amplia nel nodo destinazione.',
    example: 'Calcolo con frazioni → Equazioni algebriche',
  },
  prerequisite: {
    description: 'Il nodo sorgente è un prerequisito necessario per affrontare il nodo destinazione.',
    example: 'Geometria piana → Geometria nello spazio',
  },
  integration: {
    description: 'Il contenuto del nodo sorgente si integra con il nodo destinazione in un percorso congiunto.',
    example: 'Frazioni → Funzioni lineari (proporzionalità)',
  },
  deepening: {
    description: 'Il contenuto del nodo sorgente viene approfondito nel nodo destinazione.',
    example: 'Statistica descrittiva → Statistica inferenziale',
  },
  discontinuity: {
    description: 'Non esiste un collegamento pedagogico diretto tra i due nodi.',
    example: 'Geometria piana → Statistica descrittiva',
  },
};

export function getRelationTypeGuidance(type: VerticalCurriculumRelationType): RelationTypeGuidance {
  return RELATION_TYPE_GUIDANCE[type] || { description: '', example: '' };
}
