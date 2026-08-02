import {
  createEmptyDocumentArchive,
  createDocumentInArchive,
  createInstitutionalSnapshot,
  createSectionHeading,
  createSectionParagraph,
  createSectionTeachingDesign,
} from '../../domain/documents';
import type { DocumentArchive, DocumentEntity } from '../../domain/documents';
import { createSelfDeclaredActor, generateEntityId } from '../../domain/curriculum/identity';

export const DOCUMENT_FIXTURE_TITLE = 'Progettazione: UDA-001';

export function createTeachingDesignFixture(
  archive: DocumentArchive = createEmptyDocumentArchive(),
  options: { withActor?: boolean; withSourceRef?: boolean } = {},
): { archive: DocumentArchive; document: DocumentEntity } {
  const withActor = options.withActor ?? false;
  const snapshot = createInstitutionalSnapshot('Liceo Classico', {
    configured: true,
    academicYearLabel: '2026-2027',
    ...(withActor ? { declaredRole: 'docente' as const } : {}),
  });
  const created = createDocumentInArchive(archive, {
    documentType: 'teaching-design',
    title: DOCUMENT_FIXTURE_TITLE,
    ...(withActor ? { author: createSelfDeclaredActor('Docente Test', 'docente') } : {}),
    ...(options.withSourceRef
      ? { sourceRefs: [{ id: generateEntityId(), entityType: 'source', snapshotLabel: 'UDA 1' }] }
      : {}),
  }, {
    sections: [
      createSectionHeading(1, DOCUMENT_FIXTURE_TITLE),
      createSectionParagraph('Contenuto della progettazione didattica'),
      createSectionTeachingDesign({ discipline: 'italiano', order: 'secondaria', class: '3A' }, 'Struttura progetto'),
    ],
  }, snapshot);
  if (!created.success) {
    throw new Error(`Fixture creation failed: ${created.errors.map(error => error.message).join('; ')}`);
  }
  return { archive: created.archive, document: created.document };
}
