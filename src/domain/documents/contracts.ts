import type { EntityId } from '../curriculum/identity';
import type { ContentOrigin } from '../curriculum/identity';
import type { DocumentArchive, DocumentSection, A04ToA07DocumentResult } from './types';
import { createDocumentInArchive } from './repository';
import { createInstitutionalSnapshot, createSectionHeading, createSectionParagraph, createSectionCurriculumReference, createSectionSourceReference, createSectionTeachingDesign } from './constructors';
import { validateA04ToA07, executeA04ToA07, type A04ToA07Payload } from '../transfer/areaContracts';
import { createTransferEventLog } from '../transfer/eventLog';

export function executeA04ToA07DocumentTransfer(
  payload: A04ToA07Payload,
  archive: DocumentArchive,
): A04ToA07DocumentResult {
  const log = createTransferEventLog();

  const validation = validateA04ToA07(payload);
  if (!validation.valid) {
    const transferResult = executeA04ToA07(payload, log);
    return {
      status: 'failed',
      errors: validation.errors.map(e => ({
        code: e.code,
        message: e.message,
        field: e.field,
      })),
      transferId: transferResult.transferId as string,
    };
  }

  const snapshot = createInstitutionalSnapshot(
    (payload.institutionalContext.instituteName as string) ?? 'Istituto non configurato',
    {
      mechanicalCode: payload.institutionalContext.mechanicalCode as string | undefined,
      siteName: payload.institutionalContext.siteName as string | undefined,
      academicYearLabel: payload.institutionalContext.academicYearLabel as string | undefined,
      declaredRole: payload.institutionalContext.declaredRole as string | undefined,
      configured: Object.keys(payload.institutionalContext).length > 0,
    },
  );

  const designId = payload.designId;
  const documentInput = {
    documentType: 'teaching-design' as const,
    title: `Progettazione: ${designId}`,
    sourceRefs: payload.sources.map(s => ({
      id: s as EntityId,
      entityType: 'source' as const,
      snapshotLabel: s,
    })),
    originRefs: payload.curriculumRefs.map(c => ({
      id: c as EntityId,
      entityType: 'curriculum-node' as const,
      snapshotLabel: c,
    })),
    origin: (payload.assistedContentOrigin as ContentOrigin) ?? 'teacher',
  };

  const sections: DocumentSection[] = [
    createSectionHeading(1, documentInput.title),
    createSectionParagraph('Documento generato dal trasferimento A04 → A07', 'italic'),
    createSectionCurriculumReference(
      payload.curriculumRefs.map(c => ({
        id: c as EntityId,
        entityType: 'curriculum-node' as const,
        snapshotLabel: c,
      })),
      'Riferimenti curricolari',
    ),
    createSectionSourceReference(
      payload.sources.map(s => ({
        id: s as EntityId,
        entityType: 'source' as const,
        snapshotLabel: s,
      })),
      'Fonti',
    ),
    createSectionTeachingDesign(
      payload.teachingStructure as Record<string, unknown>,
      'Struttura della progettazione didattica',
    ),
  ];

  if (payload.warnings.length > 0) {
    sections.push(
      createSectionHeading(2, 'Avvisi'),
      createSectionParagraph(payload.warnings.join('; '), 'quote'),
    );
  }

  const transferResult = executeA04ToA07(payload, log);

  const created = createDocumentInArchive(archive, documentInput, { sections }, snapshot);
  if (!created.success) {
    return {
      status: 'failed',
      errors: created.errors,
      transferId: transferResult.transferId as string,
    };
  }

  return {
    status: 'completed',
    document: created.document,
    version: created.version,
    archive: created.archive,
    transferId: transferResult.transferId as string,
    warnings: payload.warnings.map(w => ({ code: 'LEGACY_WARNING', message: w })),
  };
}