import { describe, it, expect } from 'vitest';
import type { UdaModel } from '../types/curriculum';
import type { A07InstitutionalDocumentRead } from '../domain/institution';
import {
  buildA04ToA07PayloadFromUda,
  validateUdaForDocumentMapping,
  UdaMappingError,
} from '../features/documents/mappers/udaToA07Payload';
import { validateA04ToA07 } from '../domain/transfer/areaContracts';
import { createEmptyDocumentArchive } from '../domain/documents';
import { executeA04ToA07DocumentTransfer } from '../domain/documents/contracts';

const NOW = '2026-08-01T10:00:00.000Z';

const fullUda: UdaModel = {
  id: 'uda-001',
  title: 'Acqua e territorio',
  discipline: 'italiano',
  order: 'secondaria',
  period: 'Primo Quadrimestre',
  hours: 12,
  status: 'bozza',
  traguardi: ['Comprendere testi narrativi'],
  obiettivi: ['Organizzare informazioni'],
  evidenze: ['Argomenta in modo coerente'],
  realTask: 'Presentazione cooperativa',
  notes: 'Note didattiche',
  createdAt: '2026-07-27T08:00:00.000Z',
};

const institutionalRead: A07InstitutionalDocumentRead = {
  configured: true,
  instituteName: 'Istituto Tecnico Industriale',
  mechanicalCode: 'ITIT12345',
  siteName: 'Sede centrale',
  siteAddress: 'Via Roma 1, 00100 Roma (RM)',
  academicYearLabel: '2025-2026',
  declaredRole: 'insegnante',
  organizationId: 'institute-inst-1',
};

describe('CML-638B mapper A04→A07', () => {
  it('builds a complete payload from a full UDA', () => {
    const payload = buildA04ToA07PayloadFromUda(fullUda, institutionalRead, NOW);

    expect(payload.designId).toBe('uda-uda-001');
    expect(payload.sources).toEqual(['uda-001']);
    expect(payload.curriculumRefs).toEqual([
      'Comprendere testi narrativi',
      'Organizzare informazioni',
      'Argomenta in modo coerente',
    ]);
    expect(payload.assistedContentOrigin).toBe('teacher');
    expect(payload.versionOrSnapshot).toBe(fullUda.createdAt);
    expect(payload.metadata.sessionTimestamp).toBe(NOW);
  });

  it('produces a payload that passes A04→A07 validation', () => {
    const payload = buildA04ToA07PayloadFromUda(fullUda, institutionalRead, NOW);
    const validation = validateA04ToA07(payload);
    expect(validation.valid).toBe(true);
  });

  it('feeds executeA04ToA07DocumentTransfer and creates a canonical document', () => {
    const payload = buildA04ToA07PayloadFromUda(fullUda, institutionalRead, NOW);
    const result = executeA04ToA07DocumentTransfer(payload, createEmptyDocumentArchive());

    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.document.documentType).toBe('teaching-design');
    expect(result.document.title).toBe('Progettazione: uda-uda-001');
    expect(result.document.status).toBe('draft');
    expect(result.document.metadata.origin).toBe('teacher');
    expect(result.version.versionNumber).toBe(1);
    expect(result.version.institutionalSnapshot.instituteName).toBe('Istituto Tecnico Industriale');
    expect(result.version.institutionalSnapshot.academicYearLabel).toBe('2025-2026');
  });

  it('maps institutional context correctly', () => {
    const payload = buildA04ToA07PayloadFromUda(fullUda, institutionalRead, NOW);
    expect(payload.institutionalContext).toMatchObject({
      instituteName: 'Istituto Tecnico Industriale',
      mechanicalCode: 'ITIT12345',
      siteName: 'Sede centrale',
      academicYearLabel: '2025-2026',
      declaredRole: 'insegnante',
      configured: true,
    });
  });

  it('supports a minimal UDA (title, discipline, order only)', () => {
    const minimal: UdaModel = {
      id: 'uda-min',
      title: 'Geometria',
      discipline: 'matematica',
      order: 'primaria',
      period: '',
      hours: 0,
      status: 'bozza',
      traguardi: [],
      obiettivi: [],
      evidenze: [],
      realTask: '',
      notes: '',
      createdAt: NOW,
    };
    const payload = buildA04ToA07PayloadFromUda(minimal, institutionalRead, NOW);
    expect(payload.designId).toBe('uda-uda-min');
    expect(validateA04ToA07(payload).valid).toBe(true);
  });

  it('preserves provenance via sources and curriculum refs', () => {
    const payload = buildA04ToA07PayloadFromUda(fullUda, institutionalRead, NOW);
    expect(payload.sources).toContain(fullUda.id);
    expect(payload.curriculumRefs.length).toBeGreaterThan(0);
  });

  it('does not mutate the source UDA', () => {
    const snapshot = JSON.parse(JSON.stringify(fullUda)) as UdaModel;
    buildA04ToA07PayloadFromUda(fullUda, institutionalRead, NOW);
    expect(fullUda).toEqual(snapshot);
  });

  it('keeps the design id stable for the same UDA', () => {
    const a = buildA04ToA07PayloadFromUda(fullUda, institutionalRead, NOW);
    const b = buildA04ToA07PayloadFromUda(fullUda, institutionalRead, NOW);
    expect(a.designId).toBe(b.designId);
    expect(a.designId).toBe(`uda-${fullUda.id}`);
  });

  it('is deterministic for the same inputs', () => {
    const a = buildA04ToA07PayloadFromUda(fullUda, institutionalRead, NOW);
    const b = buildA04ToA07PayloadFromUda(fullUda, institutionalRead, NOW);
    expect(a).toEqual(b);
  });

  it('rejects a UDA without id with a typed error', () => {
    expect(() => buildA04ToA07PayloadFromUda({ ...fullUda, id: '' }, institutionalRead, NOW)).toThrow(UdaMappingError);
    const validation = validateUdaForDocumentMapping({ ...fullUda, id: '' });
    expect(validation.valid).toBe(false);
    if (validation.valid) return;
    expect(validation.errors.some(e => e.code === 'MISSING_ID')).toBe(true);
  });

  it('rejects a UDA without title', () => {
    expect(() => buildA04ToA07PayloadFromUda({ ...fullUda, title: '' }, institutionalRead, NOW)).toThrow(UdaMappingError);
  });

  it('rejects a UDA without discipline', () => {
    expect(() => buildA04ToA07PayloadFromUda({ ...fullUda, discipline: '' }, institutionalRead, NOW)).toThrow(UdaMappingError);
  });

  it('rejects a UDA without order', () => {
    expect(() => buildA04ToA07PayloadFromUda({ ...fullUda, order: '' as never }, institutionalRead, NOW)).toThrow(UdaMappingError);
  });

  it('maps a UDA with empty selections (title, discipline, order are enough)', () => {
    const empty: UdaModel = {
      id: 'uda-empty',
      title: 'Senza selezioni',
      discipline: 'italiano',
      order: 'secondaria',
      period: '',
      hours: 0,
      status: 'bozza',
      traguardi: [],
      obiettivi: [],
      evidenze: [],
      realTask: '',
      notes: '',
      createdAt: NOW,
    };
    const payload = buildA04ToA07PayloadFromUda(empty, institutionalRead, NOW);
    expect(payload.curriculumRefs).toEqual([]);
    expect(validateA04ToA07(payload).valid).toBe(true);
  });

  it('adds a warning when institutional profile is not configured', () => {
    const neutral: A07InstitutionalDocumentRead = {
      configured: false,
      instituteName: 'Istituto non configurato',
      organizationId: 'curmanlight-local',
      warning: 'Configurazione istituzionale incompleta.',
    };
    const payload = buildA04ToA07PayloadFromUda(fullUda, neutral, NOW);
    expect(payload.warnings.length).toBeGreaterThan(0);
    expect(payload.institutionalContext.configured).toBe(false);
  });
});
