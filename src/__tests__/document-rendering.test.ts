import { describe, it, expect } from 'vitest';
import {
  renderSection,
  renderDocumentContent,
  renderSnapshotHeader,
  renderDocument,
  createSectionHeading,
  createSectionParagraph,
  createSectionList,
  createSectionTable,
  createSectionCurriculumReference,
  createSectionSourceReference,
  createSectionTeachingDesign,
  createSectionMetadata,
  createInstitutionalSnapshot,
  createDocument,
  createInitialVersion,
} from '../domain/documents';

describe('renderSection', () => {
  it('renders heading', () => {
    const html = renderSection(createSectionHeading(1, 'Titolo Principale'));
    expect(html).toBe('<h1>Titolo Principale</h1>');
  });

  it('renders sub-heading', () => {
    const html = renderSection(createSectionHeading(3, 'Sottotitolo'));
    expect(html).toBe('<h3>Sottotitolo</h3>');
  });

  it('renders paragraph', () => {
    const html = renderSection(createSectionParagraph('Testo normale'));
    expect(html).toBe('<p>Testo normale</p>');
  });

  it('renders bold paragraph', () => {
    const html = renderSection(createSectionParagraph('Grassetto', 'bold'));
    expect(html).toBe('<p><strong>Grassetto</strong></p>');
  });

  it('renders italic paragraph', () => {
    const html = renderSection(createSectionParagraph('Corsivo', 'italic'));
    expect(html).toBe('<p><em>Corsivo</em></p>');
  });

  it('renders quote paragraph', () => {
    const html = renderSection(createSectionParagraph('Citazione', 'quote'));
    expect(html).toBe('<blockquote><p>Citazione</p></blockquote>');
  });

  it('renders ordered list', () => {
    const html = renderSection(createSectionList(['Uno', 'Due', 'Tre'], true));
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>Uno</li>');
    expect(html).toContain('<li>Tre</li>');
    expect(html).toContain('</ol>');
  });

  it('renders unordered list', () => {
    const html = renderSection(createSectionList(['A', 'B'], false));
    expect(html).toContain('<ul>');
    expect(html).toContain('</ul>');
  });

  it('renders table', () => {
    const section = createSectionTable(['Nome', 'Valore'], [['A', '1'], ['B', '2']]);
    const html = renderSection(section);
    expect(html).toContain('<table>');
    expect(html).toContain('<th>Nome</th>');
    expect(html).toContain('<td>1</td>');
  });

  it('renders curriculum reference', () => {
    const refs = [{ id: 'node-1' as never, entityType: 'curriculum-node' as const, snapshotLabel: 'Competenza 1' }];
    const html = renderSection(createSectionCurriculumReference(refs, 'Rif'));
    expect(html).toContain('curriculum-refs');
    expect(html).toContain('Competenza 1');
  });

  it('renders source reference', () => {
    const refs = [{ id: 'src-1' as never, entityType: 'source' as const, snapshotLabel: 'DPR 89/2010' }];
    const html = renderSection(createSectionSourceReference(refs, 'Fonti'));
    expect(html).toContain('source-refs');
    expect(html).toContain('DPR 89/2010');
  });

  it('renders teaching design section', () => {
    const html = renderSection(createSectionTeachingDesign({ discipline: 'matematica' }, 'Progettazione'));
    expect(html).toContain('teaching-design-snapshot');
    expect(html).toContain('matematica');
  });

  it('renders metadata section', () => {
    const html = renderSection(createSectionMetadata({ autore: 'Mario Rossi', classe: '3A' }));
    expect(html).toContain('metadata-section');
    expect(html).toContain('Mario Rossi');
  });
});

describe('escapeHtml - no script injection', () => {
  it('escapes <script> tags', () => {
    const section = createSectionParagraph('<script>alert("x")</script>');
    const html = renderSection(section);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes HTML in headings', () => {
    const html = renderSection(createSectionHeading(1, '<script>alert("x")</script>'));
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes HTML in list items', () => {
    const html = renderSection(createSectionList(['<script>alert("x")</script>', '<img src=x onerror=alert(1)>'], false));
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes HTML in table cells', () => {
    const section = createSectionTable(['<script>'], [['<img src=x>']]);
    const html = renderSection(section);
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img');
  });

  it('renders text with ampersands correctly', () => {
    const html = renderSection(createSectionParagraph('A & B'));
    expect(html).toContain('A &amp; B');
  });

  it('renders text with quotes correctly', () => {
    const html = renderSection(createSectionParagraph('"citazione"'));
    expect(html).toContain('&quot;citazione&quot;');
  });
});

describe('renderDocumentContent', () => {
  it('renders multiple sections separated by newlines', () => {
    const content = {
      sections: [
        createSectionHeading(1, 'Titolo'),
        createSectionParagraph('Testo'),
      ],
    };
    const html = renderDocumentContent(content);
    expect(html).toContain('<h1>Titolo</h1>');
    expect(html).toContain('<p>Testo</p>');
  });
});

describe('renderSnapshotHeader', () => {
  it('renders institute name', () => {
    const snapshot = createInstitutionalSnapshot('Liceo Classico', { configured: true });
    const html = renderSnapshotHeader(snapshot);
    expect(html).toContain('Liceo Classico');
    expect(html).toContain('institute-name');
  });

  it('includes optional fields when present', () => {
    const snapshot = createInstitutionalSnapshot('ITIS', {
      configured: true,
      mechanicalCode: 'ITIS123',
      siteName: 'Sede Centrale',
      academicYearLabel: '2024-2025',
    });
    const html = renderSnapshotHeader(snapshot);
    expect(html).toContain('ITIS123');
    expect(html).toContain('Sede Centrale');
    expect(html).toContain('2024-2025');
  });
});

describe('renderDocument', () => {
  it('produces complete HTML document', () => {
    const doc = createDocument({ documentType: 'report', title: 'Documento di Test' });
    const snapshot = createInstitutionalSnapshot('Istituto Test', { configured: true });
    const content = { sections: [createSectionParagraph('Contenuto del documento')] };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const html = renderDocument(doc, version);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="it">');
    expect(html).toContain('Documento di Test');
    expect(html).toContain('Istituto Test');
    expect(html).toContain('Contenuto del documento');
    expect(html).toContain('</html>');
  });

  it('uses custom title and CSS', () => {
    const doc = createDocument({ documentType: 'report', title: 'Report' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const content = { sections: [createSectionParagraph('Body')] };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const html = renderDocument(doc, version, {
      title: 'Custom Title',
      css: 'body { font-family: serif; }',
    });
    expect(html).toContain('Custom Title');
    expect(html).toContain('font-family: serif');
  });

  it('can omit header', () => {
    const doc = createDocument({ documentType: 'report', title: 'No Header' });
    const snapshot = createInstitutionalSnapshot('Istituto');
    const content = { sections: [createSectionParagraph('Body')] };
    const version = createInitialVersion(doc, content, { institutionalSnapshot: snapshot });

    const html = renderDocument(doc, version, { includeHeader: false });
    expect(html).not.toContain('<header>');
  });
});

describe('output consistency', () => {
  it('same content produces same output', () => {
    const section = createSectionParagraph('Testo identico');
    const a = renderSection(section);
    const b = renderSection(section);
    expect(a).toBe(b);
  });

  it('Italian characters are preserved', () => {
    const html = renderSection(createSectionParagraph('àèìòù ÀÈÌÒÙ é ó'));
    expect(html).toContain('àèìòù');
    expect(html).toContain('ÀÈÌÒÙ');
  });
});