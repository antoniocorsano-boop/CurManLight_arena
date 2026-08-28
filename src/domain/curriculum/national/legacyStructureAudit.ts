import type { CurriculumMap } from '../../../features/session/types/appViewContracts';
import { DM221_FIRST_CYCLE_DISCIPLINES, DM221_INFANZIA_FIELDS } from './canonicalStructure';

export type LegacyStructureFindingCode =
  | 'LEGACY_DISCIPLINE_PROJECTION_FOR_INFANZIA'
  | 'FIRST_CYCLE_DISCIPLINE_PRESENT_UNVERIFIED'
  | 'CANONICAL_DISCIPLINE_MISSING'
  | 'INFANZIA_FIELDS_NOT_MODELED_CANONICALLY';

export interface LegacyStructureFinding {
  code: LegacyStructureFindingCode;
  severity: 'BLOCKING' | 'REVIEW';
  discipline?: string;
  schoolOrder?: 'infanzia' | 'primaria' | 'secondaria';
  message: string;
}

const LEGACY_DISCIPLINE_ALIASES: Readonly<Record<string, readonly string[]>> = {
  ITALIANO: ['italiano'],
  LINGUA_INGLESE: ['inglese', 'lingua_inglese'],
  SECONDA_LINGUA_COMUNITARIA: ['seconda_lingua', 'seconda_lingua_comunitaria'],
  STORIA: ['storia'],
  GEOGRAFIA: ['geografia'],
  MATEMATICA: ['matematica'],
  TECNOLOGIA: ['tecnologia'],
  SCIENZE: ['scienze'],
  MUSICA: ['musica'],
  ARTE_E_IMMAGINE: ['arte', 'arte_immagine'],
  EDUCAZIONE_MOTORIA: ['educazione_motoria', 'motoria'],
  EDUCAZIONE_FISICA: ['educazione_fisica', 'motoria'],
};

function hasContent(cell: { traguardi?: string[]; obiettivi?: string[] } | undefined): boolean {
  return Boolean((cell?.traguardi?.length ?? 0) > 0 || (cell?.obiettivi?.length ?? 0) > 0);
}

function findLegacyKey(curriculum: CurriculumMap, aliases: readonly string[]): string | undefined {
  return aliases.find((alias) => alias in curriculum);
}

/**
 * Audit strutturale della vecchia CurriculumMap rispetto al D.M. 221/2025.
 *
 * Non verifica la correttezza semantica dei testi. Evidenzia soltanto i punti
 * in cui il modello legacy non puo' essere assunto come rappresentazione
 * canonica della struttura normativa.
 */
export function auditLegacyStructureAgainstDm221(curriculum: CurriculumMap): LegacyStructureFinding[] {
  const findings: LegacyStructureFinding[] = [];

  for (const [legacyKey, orders] of Object.entries(curriculum)) {
    if (hasContent(orders?.infanzia)) {
      findings.push({
        code: 'LEGACY_DISCIPLINE_PROJECTION_FOR_INFANZIA',
        severity: 'BLOCKING',
        discipline: legacyKey,
        schoolOrder: 'infanzia',
        message: `La voce legacy “${legacyKey}” contiene dati disciplinari per l’infanzia. Il D.M. 221/2025 struttura l’infanzia per campi di esperienza: serve una migrazione semantica, non una promozione diretta.`,
      });
    }
  }

  findings.push({
    code: 'INFANZIA_FIELDS_NOT_MODELED_CANONICALLY',
    severity: 'BLOCKING',
    message: `La CurriculumMap legacy non rappresenta come entità canoniche i ${Object.keys(DM221_INFANZIA_FIELDS).length} campi di esperienza dell’infanzia.`,
  });

  for (const [disciplineId, segment] of Object.entries(DM221_FIRST_CYCLE_DISCIPLINES)) {
    const aliases = LEGACY_DISCIPLINE_ALIASES[disciplineId] ?? [];
    const legacyKey = findLegacyKey(curriculum, aliases);

    for (const schoolOrder of segment.schoolOrders) {
      const cell = legacyKey ? curriculum[legacyKey]?.[schoolOrder] : undefined;
      if (!hasContent(cell)) {
        findings.push({
          code: 'CANONICAL_DISCIPLINE_MISSING',
          severity: 'BLOCKING',
          discipline: segment.label,
          schoolOrder,
          message: `Manca contenuto strutturale per ${segment.label} — ${schoolOrder}; la lacuna non può essere colmata senza binding alla fonte ufficiale.`,
        });
      } else {
        findings.push({
          code: 'FIRST_CYCLE_DISCIPLINE_PRESENT_UNVERIFIED',
          severity: 'REVIEW',
          discipline: legacyKey,
          schoolOrder,
          message: `Il contenuto legacy per ${segment.label} — ${schoolOrder} è presente ma resta non verificato finché non viene collegato elemento per elemento alla fonte ufficiale.`,
        });
      }
    }
  }

  return findings;
}
