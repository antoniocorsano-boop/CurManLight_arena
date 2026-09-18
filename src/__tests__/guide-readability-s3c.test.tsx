// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SupportGuideView } from '../features/session/components/SupportGuideView';

describe('canonical support guide readability guard', () => {
  it('keeps task-first guide content readable and free of legacy UDA-manual framing', () => {
    const { container } = render(
      <SupportGuideView
        handleTabSwitch={vi.fn()}
        institutionalProfile={{
          configured: false,
          instituteName: 'Istituto non configurato',
          organizationId: 'curmanlight-local',
        }}
      />,
    );

    const guide = container.querySelector('[data-teacher-surface="support-guide"]');
    expect(guide).not.toBeNull();

    const markup = guide?.innerHTML ?? '';
    expect(markup).not.toMatch(/text-\[(?:[0-9]|10|11)px\]/);
    expect(markup).not.toContain('Progettazione Guidata Unità di Apprendimento');
    expect(markup).not.toContain('Traduzione Olistica');
    expect(markup).not.toContain('Carousel Monoscheda');

    const taskHeadings = Array.from(guide?.querySelectorAll('article h2') ?? []);
    expect(taskHeadings.length).toBeGreaterThanOrEqual(5);

    const bodyBlocks = Array.from(guide?.querySelectorAll('p') ?? []);
    expect(bodyBlocks.length).toBeGreaterThan(0);
    for (const block of bodyBlocks) {
      expect(block.classList.contains('text-sm')).toBe(true);
    }
  });
});
