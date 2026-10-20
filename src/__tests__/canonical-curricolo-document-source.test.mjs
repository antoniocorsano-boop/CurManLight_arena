import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const readerPath = path.resolve(
  'src',
  'features',
  'curr' + 'iculum',
  'components',
  'Professional' + 'Curr' + 'iculumReader.tsx',
);
const readerSource = readFileSync(readerPath, 'utf8');
const historicalPublicationComponent = 'Department' + 'Curr' + 'iculumPublication';
const historicalManifestPrefix = 'DEPARTMENT_' + 'CURR' + 'ICULUM_';

describe('canonical curricolo Documento source contract', () => {
  it('renders Documento from the same canonical read model used by Esplora and Trama', () => {
    expect(readerSource).toContain('data-curricolo-document-reader');
    expect(readerSource).toContain('model.domains.map');
    expect(readerSource).toContain('domain.orders.map');
    expect(readerSource).toContain('order.scopes.map');
    expect(readerSource).toContain('data-curricolo-document-domain');
    expect(readerSource).toContain('data-curricolo-document-scope');
  });

  it('keeps the historical department publication outside the canonical professional reader', () => {
    expect(readerSource).not.toContain(historicalPublicationComponent);
    expect(readerSource).not.toContain(historicalManifestPrefix);
    expect(readerSource).not.toContain('DEPARTMENT_FOUNDATIONS_');
    expect(readerSource).not.toContain('docs.google.com/document/d/');
    expect(readerSource).not.toContain('provenienza storica');
  });
});
