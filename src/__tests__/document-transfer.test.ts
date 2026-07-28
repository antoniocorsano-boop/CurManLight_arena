import { describe, it, expect } from 'vitest';
import { createEmptyDocumentArchive } from '../domain/documents';
import type { A04ToA07Payload } from '../domain/transfer/areaContracts';
import { executeA04ToA07DocumentTransfer } from '../domain/documents/contracts';

function validPayload(): A04ToA07Payload {
  return {
    designId: 'design-001',
    curriculumRefs: ['node-1', 'node-2'],
    sources: ['src-legge-107'],
    institutionalContext: {
      instituteName: 'Istituto Tecnico Industriale',
      mechanicalCode: 'ITIT12345',
      academicYearLabel: '2024-2025',
    },
    teachingStructure: { discipline: 'matematica', hours: 90 },
    assistedContentOrigin: 'teacher',
    versionOrSnapshot: 'v1',
    warnings: [],
    metadata: { sessionTimestamp: new Date().toISOString() },
  };
}

describe('A04→A07 Document Transfer', () => {
  it('completes transfer with valid payload', () => {
    const archive = createEmptyDocumentArchive();
    const result = executeA04ToA07DocumentTransfer(validPayload(), archive);

    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.document.documentType).toBe('teaching-design');
    expect(result.document.title).toContain('design-001');
    expect(result.version.versionNumber).toBe(1);
    expect(result.version.institutionalSnapshot.instituteName).toBe('Istituto Tecnico Industriale');
    expect(result.archive.documents).toHaveLength(1);
    expect(result.archive.versions).toHaveLength(1);
  });

  it('preserves curriculum refs in document', () => {
    const archive = createEmptyDocumentArchive();
    const result = executeA04ToA07DocumentTransfer(validPayload(), archive);
    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.document.originRefs.length).toBe(2);
  });

  it('preserves sources in document', () => {
    const archive = createEmptyDocumentArchive();
    const result = executeA04ToA07DocumentTransfer(validPayload(), archive);
    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.document.sourceRefs.length).toBe(1);
  });

  it('preserves assisted content origin', () => {
    const archive = createEmptyDocumentArchive();
    const result = executeA04ToA07DocumentTransfer(validPayload(), archive);
    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.document.metadata.origin).toBe('teacher');
  });

  it('captures institutional snapshot in version', () => {
    const archive = createEmptyDocumentArchive();
    const result = executeA04ToA07DocumentTransfer(validPayload(), archive);
    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.version.institutionalSnapshot.mechanicalCode).toBe('ITIT12345');
    expect(result.version.institutionalSnapshot.academicYearLabel).toBe('2024-2025');
  });

  it('forbids auto-approval - status is draft', () => {
    const archive = createEmptyDocumentArchive();
    const result = executeA04ToA07DocumentTransfer(validPayload(), archive);
    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.document.status).toBe('draft');
  });

  it('fails with empty designId', () => {
    const archive = createEmptyDocumentArchive();
    const payload = { ...validPayload(), designId: '' };
    const result = executeA04ToA07DocumentTransfer(payload, archive);
    expect(result.status).toBe('failed');
  });

  it('no document created when validation fails', () => {
    const archive = createEmptyDocumentArchive();
    const payload = { ...validPayload(), designId: '' };
    executeA04ToA07DocumentTransfer(payload, archive);
    expect(archive.documents).toHaveLength(0);
  });

  it('includes warnings from payload', () => {
    const archive = createEmptyDocumentArchive();
    const payload = { ...validPayload(), warnings: ['Dato non verificato', 'Fonte mancante'] };
    const result = executeA04ToA07DocumentTransfer(payload, archive);
    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.warnings.length).toBe(2);
  });

  it('handles empty institutional context gracefully', () => {
    const archive = createEmptyDocumentArchive();
    const payload = { ...validPayload(), institutionalContext: {} };
    const result = executeA04ToA07DocumentTransfer(payload, archive);
    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.version.institutionalSnapshot.instituteName).toBe('Istituto non configurato');
    expect(result.version.institutionalSnapshot.configured).toBe(false);
  });

  it('produces transfer ID', () => {
    const archive = createEmptyDocumentArchive();
    const result = executeA04ToA07DocumentTransfer(validPayload(), archive);
    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(typeof result.transferId).toBe('string');
    expect(result.transferId.length).toBeGreaterThan(0);
  });
});