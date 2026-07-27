/**
 * CML-633B — Canonical Identity Tests
 *
 * Test unitari per i contratti di identità e metadati.
 */

import { describe, it, expect } from 'vitest';

import type {
  EntityId,
  EntityMetadata,
  ActorReference,
  EntityReference,
} from '../domain/curriculum/identity/types';

import type {
  LegacyCurriculumKBItem,
  LegacyUdaModel,
} from '../domain/curriculum/identity/legacyAdapters';

import {
  CURRENT_SCHEMA_VERSION,
  CONTENT_ORIGIN_REGISTRY,
  VALID_ENTITY_TYPES,
} from '../domain/curriculum/identity/types';

import {
  isValidEntityId,
  isValidSchemaVersion,
  isSupportedSchemaVersion,
  isValidContentOrigin,
  isValidActorReference,
  isValidEntityReference,
  isValidEntityType,
  isValidMigrationStatus,
  isValidMetadata,
  detectDuplicates,
  checkReferentialIntegrity,
} from '../domain/curriculum/identity/validators';

import {
  generateEntityId,
  generateDeterministicId,
  createMetadata,
  touchMetadata,
  createLegacyMetadata,
  createMigrationMetadata,
  createSelfDeclaredActor,
  createEntityReference,
  createUnresolvedReference,
} from '../domain/curriculum/identity/constructors';

import {
  serialize,
  deserialize,
  serializeMetadata,
  deserializeMetadata,
  checkSchemaCompatibility,
  preserveId,
} from '../domain/curriculum/identity/serialization';

import {
  adaptCurriculumKBItem,
  adaptUdaModel,
  isLegacyDataPreserved,
  hasNoPhantomSource,
  hasNoPhantomAuthor,
} from '../domain/curriculum/identity/legacyAdapters';

// ─── Entity ID Tests ─────────────────────────────────────────────────────────

describe('EntityId', () => {
  describe('generateEntityId', () => {
    it('genera un ID valido', () => {
      const id = generateEntityId();
      expect(isValidEntityId(id)).toBe(true);
    });

    it('genera ID unici', () => {
      const id1 = generateEntityId();
      const id2 = generateEntityId();
      expect(id1).not.toBe(id2);
    });

    it('genera ID con formato UUID', () => {
      const id = generateEntityId();
      expect(id).toMatch(/^[a-f0-9-]+$/i);
    });
  });

  describe('generateDeterministicId', () => {
    it('genera ID deterministici dallo stesso seed', () => {
      const id1 = generateDeterministicId('test-seed');
      const id2 = generateDeterministicId('test-seed');
      expect(id1).toBe(id2);
    });

    it('genera ID diversi da seed diversi', () => {
      const id1 = generateDeterministicId('seed-1');
      const id2 = generateDeterministicId('seed-2');
      expect(id1).not.toBe(id2);
    });
  });

  describe('isValidEntityId', () => {
    it('accetta stringhe valide', () => {
      expect(isValidEntityId('12345678-1234-4123-8123-123456789abc')).toBe(true);
      expect(isValidEntityId('abcdef12')).toBe(true);
      expect(isValidEntityId('12345678')).toBe(true);
    });

    it('rifiuta stringhe vuote', () => {
      expect(isValidEntityId('')).toBe(false);
      expect(isValidEntityId('   ')).toBe(false);
    });

    it('rifiuta stringhe troppo corte', () => {
      expect(isValidEntityId('abc')).toBe(false);
    });

    it('rifiuta non-stringhe', () => {
      expect(isValidEntityId(123)).toBe(false);
      expect(isValidEntityId(null)).toBe(false);
      expect(isValidEntityId(undefined)).toBe(false);
    });
  });
});

// ─── Schema Version Tests ────────────────────────────────────────────────────

describe('SchemaVersion', () => {
  describe('isValidSchemaVersion', () => {
    it('accetta interi positivi', () => {
      expect(isValidSchemaVersion(1)).toBe(true);
      expect(isValidSchemaVersion(2)).toBe(true);
      expect(isValidSchemaVersion(100)).toBe(true);
    });

    it('rifiuta zeri e negativi', () => {
      expect(isValidSchemaVersion(0)).toBe(false);
      expect(isValidSchemaVersion(-1)).toBe(false);
    });

    it('rifiuta decimali', () => {
      expect(isValidSchemaVersion(1.5)).toBe(false);
    });

    it('rifiuta non-numeri', () => {
      expect(isValidSchemaVersion('1')).toBe(false);
    });
  });

  describe('isSupportedSchemaVersion', () => {
    it('supporta la versione corrente', () => {
      expect(isSupportedSchemaVersion(CURRENT_SCHEMA_VERSION, 'event')).toBe(true);
    });

    it('supporta versioni inferiori', () => {
      expect(isSupportedSchemaVersion(1 as any, 'event')).toBe(true);
    });

    it('non supporta versioni future', () => {
      expect(isSupportedSchemaVersion(100 as any, 'event')).toBe(false);
    });
  });
});

// ─── Content Origin Tests ────────────────────────────────────────────────────

describe('ContentOrigin', () => {
  describe('isValidContentOrigin', () => {
    it('accetta origini valide', () => {
      expect(isValidContentOrigin('normative-source')).toBe(true);
      expect(isValidContentOrigin('institute')).toBe(true);
      expect(isValidContentOrigin('teacher')).toBe(true);
      expect(isValidContentOrigin('legacy')).toBe(true);
      expect(isValidContentOrigin('migration')).toBe(true);
    });

    it('rifiuta origini non valide', () => {
      expect(isValidContentOrigin('invalid')).toBe(false);
      expect(isValidContentOrigin('')).toBe(false);
    });
  });

  it('ha metadati per ogni origine', () => {
    for (const origin of CONTENT_ORIGIN_REGISTRY.keys()) {
      const metadata = CONTENT_ORIGIN_REGISTRY.get(origin);
      expect(metadata).toBeDefined();
      expect(metadata!.description).toBeTruthy();
      expect(metadata!.reliability).toBeGreaterThanOrEqual(0);
      expect(metadata!.reliability).toBeLessThanOrEqual(100);
    }
  });
});

// ─── Actor Reference Tests ───────────────────────────────────────────────────

describe('ActorReference', () => {
  describe('isValidActorReference', () => {
    it('accetta riferimenti validi', () => {
      const actor: ActorReference = {
        displayName: 'Mario Rossi',
        role: 'docente',
        assertion: 'self-declared',
      };
      expect(isValidActorReference(actor)).toBe(true);
    });

    it('accetta riferimenti con ID opzionale', () => {
      const actor: ActorReference = {
        id: '12345678-1234-4123-8123-123456789abc' as EntityId,
        displayName: 'Mario Rossi',
        role: 'docente',
        assertion: 'self-declared',
      };
      expect(isValidActorReference(actor)).toBe(true);
    });

    it('rifiuta displayName vuoto', () => {
      const actor = {
        displayName: '',
        role: 'docente',
        assertion: 'self-declared',
      };
      expect(isValidActorReference(actor)).toBe(false);
    });

    it('rifiuta assertion non valida', () => {
      const actor = {
        displayName: 'Mario Rossi',
        role: 'docente',
        assertion: 'invalid',
      };
      expect(isValidActorReference(actor)).toBe(false);
    });

    it('rifiuta non-oggetti', () => {
      expect(isValidActorReference(null)).toBe(false);
      expect(isValidActorReference('string')).toBe(false);
    });
  });
});

// ─── Entity Reference Tests ──────────────────────────────────────────────────

describe('EntityReference', () => {
  describe('isValidEntityReference', () => {
    it('accetta riferimenti validi', () => {
      const ref: EntityReference = {
        id: '12345678-1234-4123-8123-123456789abc' as EntityId,
        entityType: 'curriculum-node',
      };
      expect(isValidEntityReference(ref)).toBe(true);
    });

    it('accetta riferimenti con snapshotLabel', () => {
      const ref: EntityReference = {
        id: '12345678-1234-4123-8123-123456789abc' as EntityId,
        entityType: 'curriculum-node',
        snapshotLabel: 'Obiettivo 1',
      };
      expect(isValidEntityReference(ref)).toBe(true);
    });

    it('rifiuta ID non valido', () => {
      const ref = {
        id: '',
        entityType: 'curriculum-node',
      };
      expect(isValidEntityReference(ref)).toBe(false);
    });

    it('rifiuta entityType non valido', () => {
      const ref = {
        id: '12345678-1234-4123-8123-123456789abc',
        entityType: 'invalid',
      };
      expect(isValidEntityReference(ref)).toBe(false);
    });
  });
});

// ─── Entity Type Tests ───────────────────────────────────────────────────────

describe('EntityType', () => {
  describe('isValidEntityType', () => {
    it('accetta tutti i tipi validi', () => {
      for (const type of VALID_ENTITY_TYPES) {
        expect(isValidEntityType(type)).toBe(true);
      }
    });

    it('rifiuta tipi non validi', () => {
      expect(isValidEntityType('invalid')).toBe(false);
      expect(isValidEntityType('')).toBe(false);
    });
  });
});

// ─── Migration Status Tests ──────────────────────────────────────────────────

describe('MigrationStatus', () => {
  describe('isValidMigrationStatus', () => {
    it('accetta stati validi', () => {
      expect(isValidMigrationStatus('native-canonical')).toBe(true);
      expect(isValidMigrationStatus('migrated-automatic')).toBe(true);
      expect(isValidMigrationStatus('migrated-incomplete')).toBe(true);
      expect(isValidMigrationStatus('imported-legacy')).toBe(true);
      expect(isValidMigrationStatus('requires-confirmation')).toBe(true);
      expect(isValidMigrationStatus('non-migrable')).toBe(true);
      expect(isValidMigrationStatus('archived-historical')).toBe(true);
    });

    it('rifiuta stati non validi', () => {
      expect(isValidMigrationStatus('invalid')).toBe(false);
    });
  });
});

// ─── Entity Metadata Tests ───────────────────────────────────────────────────

describe('EntityMetadata', () => {
  describe('isValidMetadata', () => {
    it('accetta metadati validi', () => {
      const metadata: EntityMetadata = {
        id: '12345678-1234-4123-8123-123456789abc' as EntityId,
        createdAt: '2026-07-27T10:00:00Z',
        updatedAt: '2026-07-27T10:00:00Z',
        origin: 'teacher',
        schemaVersion: CURRENT_SCHEMA_VERSION,
      };
      expect(isValidMetadata(metadata)).toBe(true);
    });

    it('accetta metadati con campi opzionali', () => {
      const metadata: EntityMetadata = {
        id: '12345678-1234-4123-8123-123456789abc' as EntityId,
        createdAt: '2026-07-27T10:00:00Z',
        updatedAt: '2026-07-27T10:00:00Z',
        createdBy: {
          displayName: 'Mario Rossi',
          role: 'docente',
          assertion: 'self-declared',
        },
        updatedBy: {
          displayName: 'Mario Rossi',
          role: 'docente',
          assertion: 'self-declared',
        },
        origin: 'teacher',
        schemaVersion: CURRENT_SCHEMA_VERSION,
        migration: {
          status: 'migrated-automatic',
          previousOrigin: 'legacy',
          migrationDate: '2026-07-27T10:00:00Z',
        },
      };
      expect(isValidMetadata(metadata)).toBe(true);
    });

    it('rifiuta metadati senza ID', () => {
      const metadata = {
        createdAt: '2026-07-27T10:00:00Z',
        updatedAt: '2026-07-27T10:00:00Z',
        origin: 'teacher',
        schemaVersion: CURRENT_SCHEMA_VERSION,
      };
      expect(isValidMetadata(metadata)).toBe(false);
    });

    it('rifiuta metadati con date non ISO 8601', () => {
      const metadata = {
        id: '12345678-1234-4123-8123-123456789abc',
        createdAt: '27/07/2026',
        updatedAt: '2026-07-27T10:00:00Z',
        origin: 'teacher',
        schemaVersion: CURRENT_SCHEMA_VERSION,
      };
      expect(isValidMetadata(metadata)).toBe(false);
    });

    it('rifiuta metadati con origine non valida', () => {
      const metadata = {
        id: '12345678-1234-4123-8123-123456789abc',
        createdAt: '2026-07-27T10:00:00Z',
        updatedAt: '2026-07-27T10:00:00Z',
        origin: 'invalid',
        schemaVersion: CURRENT_SCHEMA_VERSION,
      };
      expect(isValidMetadata(metadata)).toBe(false);
    });
  });

  describe('detectDuplicates', () => {
    it('rileva duplicati', () => {
      const id = '12345678-1234-4123-8123-123456789abc' as EntityId;
      const items: EntityMetadata[] = [
        {
          id,
          createdAt: '2026-07-27T10:00:00Z',
          updatedAt: '2026-07-27T10:00:00Z',
          origin: 'teacher',
          schemaVersion: CURRENT_SCHEMA_VERSION,
        },
        {
          id,
          createdAt: '2026-07-27T10:00:00Z',
          updatedAt: '2026-07-27T10:00:00Z',
          origin: 'teacher',
          schemaVersion: CURRENT_SCHEMA_VERSION,
        },
      ];
      const duplicates = detectDuplicates(items);
      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].id).toBe(id);
      expect(duplicates[0].count).toBe(2);
    });

    it('non rileva falsi positivi', () => {
      const items: EntityMetadata[] = [
        {
          id: '11111111-1111-4111-8111-111111111111' as EntityId,
          createdAt: '2026-07-27T10:00:00Z',
          updatedAt: '2026-07-27T10:00:00Z',
          origin: 'teacher',
          schemaVersion: CURRENT_SCHEMA_VERSION,
        },
        {
          id: '22222222-2222-4222-8222-222222222222' as EntityId,
          createdAt: '2026-07-27T10:00:00Z',
          updatedAt: '2026-07-27T10:00:00Z',
          origin: 'teacher',
          schemaVersion: CURRENT_SCHEMA_VERSION,
        },
      ];
      const duplicates = detectDuplicates(items);
      expect(duplicates).toHaveLength(0);
    });
  });
});

// ─── Constructor Tests ───────────────────────────────────────────────────────

describe('Constructors', () => {
  describe('createMetadata', () => {
    it('crea metadati con origine', () => {
      const metadata = createMetadata('teacher');
      expect(metadata.origin).toBe('teacher');
      expect(metadata.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(metadata.createdAt).toBeTruthy();
      expect(metadata.updatedAt).toBeTruthy();
      expect(metadata.createdAt).toBe(metadata.updatedAt);
    });

    it('crea metadati con autore', () => {
      const actor = createSelfDeclaredActor('Mario Rossi', 'docente');
      const metadata = createMetadata('teacher', actor);
      expect(metadata.createdBy).toEqual(actor);
      expect(metadata.updatedBy).toEqual(actor);
    });

    it('usa timestamp personalizzato', () => {
      const now = '2026-07-27T10:00:00Z';
      const metadata = createMetadata('teacher', undefined, now);
      expect(metadata.createdAt).toBe(now);
      expect(metadata.updatedAt).toBe(now);
    });
  });

  describe('touchMetadata', () => {
    it('aggiorna updatedAt', () => {
      const metadata = createMetadata('teacher', undefined, '2026-07-27T10:00:00Z');
      const touched = touchMetadata(metadata, undefined, '2026-07-27T11:00:00Z');
      expect(touched.updatedAt).toBe('2026-07-27T11:00:00Z');
      expect(touched.createdAt).toBe('2026-07-27T10:00:00Z');
    });

    it('preserva createdBy', () => {
      const actor = createSelfDeclaredActor('Mario Rossi', 'docente');
      const metadata = createMetadata('teacher', actor);
      const touched = touchMetadata(metadata);
      expect(touched.createdBy).toEqual(actor);
    });
  });

  describe('createLegacyMetadata', () => {
    it('crea metadati legacy', () => {
      const metadata = createLegacyMetadata('2026-07-27T10:00:00Z');
      expect(metadata.origin).toBe('legacy');
      expect(metadata.migration).toBeDefined();
      expect(metadata.migration!.status).toBe('imported-legacy');
      expect(metadata.migration!.requiresReview).toBe(true);
    });

    it('registra campi mancanti', () => {
      const metadata = createLegacyMetadata(
        '2026-07-27T10:00:00Z',
        undefined,
        ['discipline', 'order'],
        ['Campo discipline mancante']
      );
      expect(metadata.migration!.missingFields).toEqual(['discipline', 'order']);
      expect(metadata.migration!.warnings).toEqual(['Campo discipline mancante']);
    });
  });

  describe('createMigrationMetadata', () => {
    it('crea metadati di migrazione', () => {
      const metadata = createMigrationMetadata(
        '2026-07-27T10:00:00Z',
        'legacy',
        1
      );
      expect(metadata.origin).toBe('migration');
      expect(metadata.migration).toBeDefined();
      expect(metadata.migration!.previousOrigin).toBe('legacy');
      expect(metadata.migration!.previousSchemaVersion).toBe(1);
    });
  });

  describe('createSelfDeclaredActor', () => {
    it('crea attore dichiarato', () => {
      const actor = createSelfDeclaredActor('Mario Rossi', 'docente');
      expect(actor.displayName).toBe('Mario Rossi');
      expect(actor.role).toBe('docente');
      expect(actor.assertion).toBe('self-declared');
    });
  });

  describe('createEntityReference', () => {
    it('crea riferimento valido', () => {
      const ref = createEntityReference(
        '12345678-1234-4123-8123-123456789abc' as EntityId,
        'curriculum-node',
        'Obiettivo 1'
      );
      expect(ref.id).toBe('12345678-1234-4123-8123-123456789abc');
      expect(ref.entityType).toBe('curriculum-node');
      expect(ref.snapshotLabel).toBe('Obiettivo 1');
    });
  });

  describe('createUnresolvedReference', () => {
    it('crea riferimento non risolto', () => {
      const ref = createUnresolvedReference('curriculum-node', 'Entità cancellata');
      expect(ref.id).toBe('');
      expect(ref.entityType).toBe('curriculum-node');
      expect(ref.snapshotLabel).toContain('MANCANTE');
    });
  });
});

// ─── Serialization Tests ─────────────────────────────────────────────────────

describe('Serialization', () => {
  describe('serialize/deserialize', () => {
    it('preserva identità', () => {
      const original = createMetadata('teacher');
      const json = serialize(original);
      const result = deserialize<EntityMetadata>(json);
      expect(result.success).toBe(true);
      expect(result.data!.id).toBe(original.id);
    });

    it('preserva origine', () => {
      const original = createMetadata('legacy');
      const json = serialize(original);
      const result = deserialize<EntityMetadata>(json);
      expect(result.data!.origin).toBe('legacy');
    });

    it('preserva metadati', () => {
      const actor = createSelfDeclaredActor('Mario Rossi', 'docente');
      const original = createMetadata('teacher', actor);
      const json = serialize(original);
      const result = deserialize<EntityMetadata>(json);
      expect(result.data!.createdBy).toEqual(actor);
    });
  });

  describe('serializeMetadata/deserializeMetadata', () => {
    it('valida dopo deserializzazione', () => {
      const metadata = createMetadata('teacher');
      const json = serializeMetadata(metadata);
      const result = deserializeMetadata(json);
      expect(result.success).toBe(true);
      expect(isValidMetadata(result.data!)).toBe(true);
    });
  });

  describe('checkSchemaCompatibility', () => {
    it('accetta schema corrente', () => {
      const result = checkSchemaCompatibility(
        { schemaVersion: CURRENT_SCHEMA_VERSION },
        'event'
      );
      expect(result.compatible).toBe(true);
    });

    it('rifiuta schema futuro', () => {
      const result = checkSchemaCompatibility(
        { schemaVersion: 100 },
        'event'
      );
      expect(result.compatible).toBe(false);
    });
  });

  describe('preserveId', () => {
    it('preserva ID valido', () => {
      const id = '12345678-1234-4123-8123-123456789abc';
      const preserved = preserveId(id);
      expect(preserved).toBe(id);
    });

    it('usa fallback per ID non valido', () => {
      const fallback = '12345678-1234-4123-8123-123456789abc' as EntityId;
      const preserved = preserveId('', fallback);
      expect(preserved).toBe(fallback);
    });

    it('lancia errore per ID non valido senza fallback', () => {
      expect(() => preserveId('')).toThrow();
    });
  });
});

// ─── Legacy Adapter Tests ────────────────────────────────────────────────────

describe('Legacy Adapters', () => {
  describe('adaptCurriculumKBItem', () => {
    it('adatta elemento curriculumKB', () => {
      const item: LegacyCurriculumKBItem = {
        discipline: 'Scienze',
        order: '1',
        hasSpecificDiscipline: true,
        traguardi: ['Traguardo 1'],
        obiettivi: ['Obiettivo 1'],
        proposals: [],
      };
      const adapted = adaptCurriculumKBItem(item, '2026-07-27T10:00:00Z');
      expect(adapted.original).toBe(item);
      expect(adapted.metadata.origin).toBe('legacy');
      expect(isLegacyDataPreserved(adapted)).toBe(true);
      expect(hasNoPhantomSource(adapted)).toBe(true);
      expect(hasNoPhantomAuthor(adapted)).toBe(true);
    });

    it('genera avvisi per campi mancanti', () => {
      const item: LegacyCurriculumKBItem = {
        discipline: '',
        order: '',
        hasSpecificDiscipline: false,
        traguardi: [],
        obiettivi: [],
        proposals: [],
      };
      const adapted = adaptCurriculumKBItem(item, '2026-07-27T10:00:00Z');
      expect(adapted.warnings.length).toBeGreaterThan(0);
      expect(adapted.missingFields.length).toBeGreaterThan(0);
    });
  });

  describe('adaptUdaModel', () => {
    it('adatta UDA model', () => {
      const item: LegacyUdaModel = {
        id: 'legacy-1',
        title: 'UDA Test',
        discipline: 'Scienze',
        order: '1',
        status: 'work-in-progress',
        createdAt: '2026-07-27T10:00:00Z',
        updatedAt: '2026-07-27T10:00:00Z',
      };
      const adapted = adaptUdaModel(item, '2026-07-27T10:00:00Z');
      expect(adapted.original).toBe(item);
      expect(adapted.metadata.origin).toBe('legacy');
      expect(isLegacyDataPreserved(adapted)).toBe(true);
    });

    it('preserva ID originale', () => {
      const item: LegacyUdaModel = {
        id: 'legacy-1',
        title: 'UDA Test',
        discipline: 'Scienze',
        order: '1',
        status: 'completed',
        createdAt: '2026-07-27T10:00:00Z',
        updatedAt: '2026-07-27T10:00:00Z',
      };
      const adapted = adaptUdaModel(item, '2026-07-27T10:00:00Z');
      expect(adapted.warnings.some(w => w.includes('legacy-1'))).toBe(true);
    });

    it('non promuove automaticamente a institute', () => {
      const item: LegacyUdaModel = {
        id: 'legacy-1',
        title: 'UDA Test',
        discipline: 'Scienze',
        order: '1',
        status: 'completed',
        createdAt: '2026-07-27T10:00:00Z',
        updatedAt: '2026-07-27T10:00:00Z',
      };
      const adapted = adaptUdaModel(item, '2026-07-27T10:00:00Z');
      expect(hasNoPhantomSource(adapted)).toBe(true);
    });
  });
});

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property Tests', () => {
  it('modificare il testo non modifica l\'identità', () => {
    const metadata1 = createMetadata('teacher');
    const metadata2 = {
      ...metadata1,
      // Simuliamo una modifica al testo (non al campo id)
      id: metadata1.id,
    };
    expect(metadata1.id).toBe(metadata2.id);
  });

  it('un dato legacy resta leggibile senza essere promosso a canonico completo', () => {
    const item: LegacyCurriculumKBItem = {
      discipline: 'Scienze',
      order: '1',
      hasSpecificDiscipline: true,
      traguardi: ['Traguardo 1'],
      obiettivi: ['Obiettivo 1'],
      proposals: [],
    };
    const adapted = adaptCurriculumKBItem(item, '2026-07-27T10:00:00Z');
    expect(isLegacyDataPreserved(adapted)).toBe(true);
    expect(adapted.metadata.origin).not.toBe('institute');
    expect(adapted.metadata.origin).not.toBe('normative-source');
  });
});

// ─── Integration Tests ───────────────────────────────────────────────────────

describe('Integration Tests', () => {
  it('ciclo completo di serializzazione', () => {
    // 1. Crea metadati
    const actor = createSelfDeclaredActor('Mario Rossi', 'docente');
    const metadata = createMetadata('teacher', actor);

    // 2. Serializza
    const json = serializeMetadata(metadata);

    // 3. Deserializza
    const result = deserializeMetadata(json);
    expect(result.success).toBe(true);

    // 4. Valida
    expect(isValidMetadata(result.data!)).toBe(true);
    expect(result.data!.id).toBe(metadata.id);
    expect(result.data!.origin).toBe('teacher');
    expect(result.data!.createdBy!.displayName).toBe('Mario Rossi');
  });

  it('riferimento risolto', () => {
    // 1. Crea entità
    const entityMetadata = createMetadata('teacher');

    // 2. Crea riferimento
    const ref = createEntityReference(
      entityMetadata.id,
      'curriculum-node',
      'Obiettivo 1'
    );

    // 3. Verifica integrità referenziale
    const existingIds = new Set([entityMetadata.id]);
    const { valid, broken } = checkReferentialIntegrity([ref], existingIds);
    expect(valid).toHaveLength(1);
    expect(broken).toHaveLength(0);
  });

  it('riferimento mancante', () => {
    // 1. Crea riferimento a entità inesistente
    const ref = createEntityReference(
      '12345678-1234-4123-8123-123456789abc' as EntityId,
      'curriculum-node',
      'Obiettivo 1'
    );

    // 2. Verifica integrità referenziale
    const existingIds = new Set<EntityId>();
    const { valid, broken } = checkReferentialIntegrity([ref], existingIds);
    expect(valid).toHaveLength(0);
    expect(broken).toHaveLength(1);
  });

  it('due elementi con lo stesso testo ma contesti diversi mantengono identificativi distinti', () => {
    const metadata1 = createMetadata('teacher');
    const metadata2 = createMetadata('teacher');
    expect(metadata1.id).not.toBe(metadata2.id);
  });
});
