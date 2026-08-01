import { describe, it, expect } from 'vitest';
import type { UdaModel } from '../types/curriculum';
import type { A07InstitutionalDocumentRead } from '../domain/institution';
import type { DocumentArchive } from '../domain/documents';
import {
  createEmptyDocumentArchive,
  createDocument,
} from '../domain/documents';
import { buildA04ToA07PayloadFromUda } from '../features/documents/mappers/udaToA07Payload';
import {
  produceCanonicalDocumentFromUda,
  produceCanonicalDocumentFromPayload,
  findCanonicalDocumentByUda,
} from '../features/documents/services/documentProduction';
import { getDocumentList, getDocumentHistory } from '../domain/documents/selectors';

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

function corruptArchive(): DocumentArchive {
  const phantom = createDocument({ documentType: 'report', title: 'Fantasmatico', origin: 'teacher' });
  return {
    ...createEmptyDocumentArchive(),
    documents: [phantom],
  };
}

describe('CML-638B document production service', () => {
  it('creates a canonical document from a complete UDA', () => {
    const result = produceCanonicalDocumentFromUda(fullUda, institutionalRead, createEmptyDocumentArchive());

    expect(result.status).toBe('created');
    if (result.status !== 'created') return;

    expect(result.document.documentType).toBe('teaching-design');
    expect(result.document.status).toBe('draft');
    expect(result.document.metadata.origin).toBe('teacher');
    expect(result.document.sourceRefs).toEqual([{ id: 'uda-001', entityType: 'source', snapshotLabel: 'uda-001' }]);

    expect(result.version.versionNumber).toBe(1);
    expect(result.version.frozen).toBe(true);
    expect(result.version.institutionalSnapshot.instituteName).toBe('Istituto Tecnico Industriale');
    expect(result.version.institutionalSnapshot.academicYearLabel).toBe('2025-2026');

    expect(getDocumentList(result.archive).length).toBe(1);
  });

  it('is idempotent: a second create returns already-exists without duplicates', () => {
    const first = produceCanonicalDocumentFromUda(fullUda, institutionalRead, createEmptyDocumentArchive());
    if (first.status !== 'created') throw new Error('first create failed');

    const second = produceCanonicalDocumentFromUda(fullUda, institutionalRead, first.archive);
    expect(second.status).toBe('already-exists');
    if (second.status !== 'already-exists') return;

    expect(second.document.id).toBe(first.document.id);
    expect(getDocumentList(first.archive).length).toBe(1);
  });

  it('returns mapping-invalid with typed errors for an incomplete UDA', () => {
    const result = produceCanonicalDocumentFromUda(
      { ...fullUda, title: '' },
      institutionalRead,
      createEmptyDocumentArchive(),
    );

    expect(result.status).toBe('mapping-invalid');
    if (result.status !== 'mapping-invalid') return;
    expect(result.errors.some((e) => e.code === 'MISSING_TITLE')).toBe(true);
  });

  it('returns transfer-failed for an invalid payload', () => {
    const valid = buildA04ToA07PayloadFromUda(fullUda, institutionalRead);
    const result = produceCanonicalDocumentFromPayload(
      { ...valid, designId: '' },
      createEmptyDocumentArchive(),
    );

    expect(result.status).toBe('transfer-failed');
    if (result.status !== 'transfer-failed') return;
    expect(result.errors.some((e) => e.code === 'REFERENCE_MISSING')).toBe(true);
  });

  it('returns archive-invalid when the resulting archive fails integrity', () => {
    const result = produceCanonicalDocumentFromPayload(
      buildA04ToA07PayloadFromUda(fullUda, institutionalRead),
      corruptArchive(),
    );

    expect(result.status).toBe('archive-invalid');
    if (result.status !== 'archive-invalid') return;
    expect(result.errors.some((e) => e.code === 'ORPHAN_VERSION_REF')).toBe(true);
  });

  it('does not mutate the source UDA or the input archive on failure', () => {
    const udaSnapshot = JSON.parse(JSON.stringify(fullUda)) as UdaModel;
    const empty = createEmptyDocumentArchive();
    const emptySnapshot = JSON.parse(JSON.stringify(empty)) as DocumentArchive;

    produceCanonicalDocumentFromUda({ ...fullUda, title: '' }, institutionalRead, empty);
    expect(fullUda).toEqual(udaSnapshot);
    expect(empty).toEqual(emptySnapshot);

    const corrupt = corruptArchive();
    const corruptSnapshot = JSON.parse(JSON.stringify(corrupt)) as DocumentArchive;
    produceCanonicalDocumentFromPayload(buildA04ToA07PayloadFromUda(fullUda, institutionalRead), corrupt);
    expect(corrupt).toEqual(corruptSnapshot);
  });

  it('produces deterministic identity and full provenance', () => {
    const a = produceCanonicalDocumentFromUda(fullUda, institutionalRead, createEmptyDocumentArchive());
    const b = produceCanonicalDocumentFromUda(fullUda, institutionalRead, createEmptyDocumentArchive());
    if (a.status !== 'created' || b.status !== 'created') throw new Error('create failed');

    expect(a.document.title).toBe(b.document.title);
    expect(a.document.sourceRefs).toEqual(b.document.sourceRefs);
    expect(a.version.content.sections).toEqual(b.version.content.sections);

    const found = findCanonicalDocumentByUda(a.archive, fullUda.id);
    expect(found).toBeDefined();
    expect(found?.document.id).toBe(a.document.id);
    expect(getDocumentHistory(a.archive, a.document.id).length).toBe(1);
  });
});
