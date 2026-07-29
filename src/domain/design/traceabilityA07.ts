import type { DesignCurriculumSelection } from './types';
import { DESIGN_QUALIFICATION_LABELS } from './types';
import type { DocumentSection, DocumentContent } from '../documents/types';

export function createDocumentSectionsFromDesignSelections(
  selections: readonly DesignCurriculumSelection[],
): DocumentSection[] {
  const sections: DocumentSection[] = [];

  sections.push({
    type: 'heading',
    level: 1,
    text: 'Selezioni curricolari',
  });

  sections.push({
    type: 'paragraph',
    text: 'Registro locale delle selezioni curricolari utilizzate nella progettazione. Non costituisce adozione ufficiale.',
    format: 'italic',
  });

  for (const s of selections) {
    sections.push({
      type: 'heading',
      level: 2,
      text: `${DESIGN_QUALIFICATION_LABELS[s.qualification]} — ${s.sourceArea}`,
    });

    sections.push({
      type: 'paragraph',
      text: s.selectedTextSnapshot,
      format: 'quote',
    });

    const meta: string[] = [
      `Qualificazione: ${DESIGN_QUALIFICATION_LABELS[s.qualification]}`,
      `Origine: ${s.sourceArea}`,
    ];
    if (s.curriculumNodeRef?.snapshotLabel) meta.push(`Nodo: ${s.curriculumNodeRef.snapshotLabel}`);
    if (s.sourceVersionRef?.id) meta.push(`Versione sorgente: ${s.sourceVersionRef.id}`);
    meta.push(`Trasferito: ${s.transferredAt}`);
    if (s.comparisonState) meta.push(`Stato sorgente: ${s.comparisonState}`);

    sections.push({ type: 'list', items: meta, ordered: false });

    if (s.sourceRefs.length > 0) {
      sections.push({
        type: 'heading',
        level: 3,
        text: 'Fonti',
      });
      sections.push({
        type: 'list',
        items: s.sourceRefs.map(r => r.snapshotLabel || String(r.id)),
        ordered: false,
      });
    }

    if (s.evidenceRefs.length > 0) {
      sections.push({
        type: 'heading',
        level: 3,
        text: 'Evidenze',
      });
      sections.push({
        type: 'list',
        items: s.evidenceRefs.map(r => r.snapshotLabel || String(r.id)),
        ordered: false,
      });
    }

    if (s.warnings.length > 0) {
      sections.push({
        type: 'heading',
        level: 3,
        text: 'Avvisi',
      });
      sections.push({
        type: 'list',
        items: s.warnings.map(w => `[${w.code}] ${w.message}`),
        ordered: false,
      });
    }
  }

  return sections;
}

export function enrichDocumentContentWithSelections(
  content: DocumentContent,
  selections: readonly DesignCurriculumSelection[],
): DocumentContent {
  const designSections = createDocumentSectionsFromDesignSelections(selections);
  return {
    sections: [...content.sections, ...designSections],
  };
}