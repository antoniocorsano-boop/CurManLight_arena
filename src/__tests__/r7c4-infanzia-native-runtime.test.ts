import { describe, expect, it } from 'vitest';
import {
  INFANZIA_LEGACY_CANDIDATE_KEYS,
  buildInfanziaNativeRuntimeView,
  assertNoLegacyInfanziaProjection,
} from '../domain/curriculum/infanzia/infanziaNativeRuntime';
import { DM221_INFANZIA_FIELDS } from '../domain/curriculum/national/canonicalStructure';

const legacy = {
  italiano: {
    infanzia: {
      traguardi: ['Testo legacy linguistico'],
      obiettivi: ['Obiettivo legacy linguistico'],
      evidenze: [],
    },
  },
  matematica: {
    infanzia: {
      traguardi: ['Testo legacy logico'],
      obiettivi: [],
      evidenze: ['Evidenza legacy'],
    },
  },
  arteImmagine: {
    infanzia: {
      traguardi: ['Testo legacy espressivo'],
      obiettivi: [],
      evidenze: [],
    },
  },
  educazioneFisica: {
    infanzia: {
      traguardi: ['Testo legacy motorio'],
      obiettivi: [],
      evidenze: [],
    },
  },
  educazioneCivica: {
    infanzia: {
      traguardi: ['Testo legacy sociale'],
      obiettivi: [],
      evidenze: [],
    },
  },
};

describe('R7C4 infanzia native runtime', () => {
  it('uses exactly the five D.M. 221 fields as runtime identities', () => {
    const view = buildInfanziaNativeRuntimeView(legacy);
    expect(view.fields).toHaveLength(5);
    expect(view.fields.map(field => field.fieldId).sort()).toEqual(Object.keys(DM221_INFANZIA_FIELDS).sort());
    expect(view.fields.every(field => field.identityKind === 'FIELD_OF_EXPERIENCE')).toBe(true);
    expect(() => assertNoLegacyInfanziaProjection(view)).not.toThrow();
  });

  it('never promotes discipline aliases into canonical field content', () => {
    const view = buildInfanziaNativeRuntimeView(legacy);
    expect(view.legacyProjectionAllowed).toBe(false);
    expect(view.legacyMutationAllowed).toBe(false);
    expect(view.fields.every(field => field.canonicalInstituteNodeRefs.length === 0)).toBe(true);
    expect(view.fields.every(field => field.contentStatus === 'NATIVE_IDENTITY_NO_CANONICAL_INSTITUTE_CONTENT')).toBe(true);

    const candidateKeys = view.fields.flatMap(field => field.legacyCandidates.map(candidate => candidate.legacyKey));
    expect(candidateKeys).toContain('italiano');
    expect(candidateKeys).toContain('matematica');
    expect(view.fields.flatMap(field => field.legacyCandidates).every(candidate =>
      candidate.migrationStatus === 'BLOCKED_PENDING_HUMAN_SEMANTIC_MIGRATION'
      && candidate.authorityEffect === 'NONE')).toBe(true);
  });

  it('preserves the old alias locations only as migration-candidate metadata', () => {
    expect(INFANZIA_LEGACY_CANDIDATE_KEYS.I_DISCORSI_E_LE_PAROLE).toEqual(['italiano', 'inglese']);
    expect(INFANZIA_LEGACY_CANDIDATE_KEYS.LA_CONOSCENZA_DEL_MONDO).toEqual([
      'matematica', 'scienze', 'tecnologia', 'storia', 'geografia',
    ]);

    const view = buildInfanziaNativeRuntimeView(legacy);
    const discorsi = view.fields.find(field => field.fieldId === 'I_DISCORSI_E_LE_PAROLE');
    expect(discorsi?.legacyCandidateCount).toBe(1);
    expect(discorsi?.legacyCandidates.find(candidate => candidate.legacyKey === 'italiano')).toMatchObject({
      populated: true,
      traguardiCount: 1,
      obiettiviCount: 1,
    });
  });

  it('fails closed for planning until native institute field nodes exist', () => {
    const view = buildInfanziaNativeRuntimeView(legacy);
    expect(view.planningAllowed).toBe(false);
    expect(view.planningBlockReason).toMatch(/nodi nativi/i);
    expect(view.authorityEffect).toBe('NONE');
  });

  it('does not silently rewrite or delete the legacy CurriculumMap in R7C4', () => {
    const view = buildInfanziaNativeRuntimeView(legacy);
    expect(legacy.italiano.infanzia.traguardi).toEqual(['Testo legacy linguistico']);
    expect(view.fields.some(field => field.segmentId.startsWith('dm221-infanzia-'))).toBe(true);
  });
});
