/** CML-633C canonical domain serialization boundary. */

import type { AdaptedCurriculumKB } from './adapters';
import { CURRICULUM_SCHEMA_VERSION } from './model/types';

export interface CanonicalDomainDeserializationResult {
  success: boolean;
  data?: AdaptedCurriculumKB;
  errors: string[];
}

interface SerializedCanonicalDomain {
  schemaVersion: number;
  data: AdaptedCurriculumKB;
}

/** Serializes the complete read model without changing legacy authority. */
export function serializeCanonicalCurriculumDomain(data: AdaptedCurriculumKB): string {
  return JSON.stringify({ schemaVersion: CURRICULUM_SCHEMA_VERSION, data } satisfies SerializedCanonicalDomain);
}

/**
 * Deserializes only the supported domain schema. A future schema is rejected
 * before any caller can replace an in-memory read model.
 */
export function deserializeCanonicalCurriculumDomain(json: string): CanonicalDomainDeserializationResult {
  try {
    const parsed = JSON.parse(json) as Partial<SerializedCanonicalDomain>;
    if (parsed.schemaVersion !== CURRICULUM_SCHEMA_VERSION) {
      return {
        success: false,
        errors: [`Versione schema ${String(parsed.schemaVersion)} non supportata (corrente: ${CURRICULUM_SCHEMA_VERSION})`],
      };
    }
    if (!parsed.data || !Array.isArray(parsed.data.sources) || !Array.isArray(parsed.data.nodes)) {
      return { success: false, errors: ['Payload del dominio canonico non valido'] };
    }
    return { success: true, data: parsed.data as AdaptedCurriculumKB, errors: [] };
  } catch (error) {
    return { success: false, errors: [`Parsing JSON fallito: ${error instanceof Error ? error.message : 'errore sconosciuto'}`] };
  }
}
