import { describe, expect, it } from 'vitest';
import productCiSource from '../../.github/workflows/product-ci.yml?raw';

describe('TRAMA-TERM-01 — Product CI vocabulary wiring', () => {
  it('checks out full history so the guard can compare the real base and head', () => {
    expect(productCiSource).toContain('fetch-depth: 0');
  });

  it('runs the curricolo vocabulary validator on the real PR/push range', () => {
    expect(productCiSource).toContain('Validate curricolo vocabulary');
    expect(productCiSource).toContain('CURRICOLO_BASE_SHA: ${{ github.event.pull_request.base.sha || github.event.before }}');
    expect(productCiSource).toContain('CURRICOLO_HEAD_SHA: ${{ github.event.pull_request.head.sha || github.sha }}');
    expect(productCiSource).toContain('node scripts/validate-curricolo-vocabulary.mjs "$CURRICOLO_BASE_SHA" "$CURRICOLO_HEAD_SHA"');
  });
});
