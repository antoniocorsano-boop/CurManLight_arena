// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InfoViews } from '../features/session/components/InfoViews';

describe('S3C guide readability guard', () => {
  it('keeps the mobile guide body at 12px or above', () => {
    const { container } = render(
      <InfoViews
        activeTab="guida"
        activeGeneralSubtab="premessa"
        setActiveGeneralSubtab={vi.fn()}
      />,
    );

    const guide = container.querySelector('[data-hva-guide-readability]');
    expect(guide).not.toBeNull();

    const markup = guide?.innerHTML ?? '';
    expect(markup).not.toMatch(/text-\[(?:[0-9]|10|11)px\]/);

    const bodyBlocks = Array.from(guide?.querySelectorAll('p, ul') ?? []);
    expect(bodyBlocks.length).toBeGreaterThan(0);
    for (const block of bodyBlocks) {
      expect(block.classList.contains('text-sm')).toBe(true);
    }
  });
});
