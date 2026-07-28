import type {
  DocumentContent,
  DocumentEntity,
  DocumentSection,
  DocumentVersion,
  InstitutionalSnapshot,
} from './types';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderSection(section: DocumentSection): string {
  switch (section.type) {
    case 'heading':
      return `<h${section.level}>${escapeHtml(section.text)}</h${section.level}>`;

    case 'paragraph': {
      const text = escapeHtml(section.text);
      switch (section.format) {
        case 'bold': return `<p><strong>${text}</strong></p>`;
        case 'italic': return `<p><em>${text}</em></p>`;
        case 'quote': return `<blockquote><p>${text}</p></blockquote>`;
        default: return `<p>${text}</p>`;
      }
    }

    case 'list': {
      const tag = section.ordered ? 'ol' : 'ul';
      const items = section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('\n');
      return `<${tag}>\n${items}\n</${tag}>`;
    }

    case 'table': {
      const headerCells = section.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
      const headerRow = `<thead><tr>${headerCells}</tr></thead>`;
      const bodyRows = section.rows.map(
        row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`,
      ).join('\n');
      return `<table>\n${headerRow}\n<tbody>\n${bodyRows}\n</tbody>\n</table>`;
    }

    case 'curriculum-reference': {
      const refs = section.refs.map(
        r => `<li>${escapeHtml(r.snapshotLabel ?? r.id)} (${r.entityType})</li>`,
      ).join('\n');
      const desc = section.description ? `<p>${escapeHtml(section.description)}</p>` : '';
      return `<div class="curriculum-refs">\n${desc}\n<ul>\n${refs}\n</ul>\n</div>`;
    }

    case 'source-reference': {
      const refs = section.refs.map(
        r => `<li>${escapeHtml(r.snapshotLabel ?? r.id)}</li>`,
      ).join('\n');
      const desc = section.description ? `<p>${escapeHtml(section.description)}</p>` : '';
      return `<div class="source-refs">\n${desc}\n<ul>\n${refs}\n</ul>\n</div>`;
    }

    case 'teaching-design': {
      const desc = section.description ? `<p>${escapeHtml(section.description)}</p>` : '';
      return `<div class="teaching-design-snapshot">\n${desc}\n<pre>${escapeHtml(JSON.stringify(section.snapshot, null, 2))}</pre>\n</div>`;
    }

    case 'metadata': {
      const rows = Object.entries(section.data).map(
        ([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`,
      ).join('\n');
      return `<table class="metadata-section">\n<tbody>\n${rows}\n</tbody>\n</table>`;
    }

    default:
      return '';
  }
}

export function renderDocumentContent(content: DocumentContent): string {
  return content.sections.map(s => renderSection(s)).join('\n\n');
}

export function renderSnapshotHeader(snapshot: InstitutionalSnapshot): string {
  const lines: string[] = [`<p class="institute-name">${escapeHtml(snapshot.instituteName)}</p>`];
  if (snapshot.mechanicalCode) {
    lines.push(`<p class="mechanical-code">${escapeHtml(snapshot.mechanicalCode)}</p>`);
  }
  if (snapshot.siteName) {
    lines.push(`<p class="site-name">${escapeHtml(snapshot.siteName)}</p>`);
  }
  if (snapshot.academicYearLabel) {
    lines.push(`<p class="academic-year">Anno scolastico: ${escapeHtml(snapshot.academicYearLabel)}</p>`);
  }
  return lines.join('\n');
}

export interface RenderOptions {
  title?: string;
  includeHeader?: boolean;
  css?: string;
}

export function renderDocument(
  document: DocumentEntity,
  version: DocumentVersion,
  options?: RenderOptions,
): string {
  const title = escapeHtml(options?.title ?? document.title);
  const css = options?.css ?? '';
  const header = options?.includeHeader !== false
    ? renderSnapshotHeader(version.institutionalSnapshot)
    : '';

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeAttr(title)}</title>
${css ? `<style>${css}</style>` : ''}
</head>
<body>
<article>
${header ? `<header>\n${header}\n</header>` : ''}
<h1>${title}</h1>
${renderDocumentContent(version.content)}
</article>
</body>
</html>`;
}