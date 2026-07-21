import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useKnowledgeCompanion } from '../features/progettazione/hooks/useKnowledgeCompanion';
import { KnowledgeCompanionPanel, VolumeReaderOverlay } from '../features/progettazione/components/KnowledgeCompanionPanel';

// ─── useKnowledgeCompanion hook tests ───

function TestHook({ wizardStep, discipline, order }: { wizardStep: number; discipline: string; order: string }) {
  const kc = useKnowledgeCompanion(wizardStep, discipline, order);
  return (
    <div>
      <span data-testid="visible">{String(kc.visible)}</span>
      <span data-testid="has-main">{String(!!kc.mainRef)}</span>
      <span data-testid="additional-count">{kc.additionalRefs.length}</span>
      <span data-testid="main-title">{kc.mainRef?.title ?? ''}</span>
      <span data-testid="main-category">{kc.mainRef?.category ?? ''}</span>
      <span data-testid="main-volume">{kc.mainRef?.volumeId ?? ''}</span>
      <span data-testid="intro">{kc.intro}</span>
      <span data-testid="expanded">{String(kc.expanded)}</span>
      <button onClick={kc.toggleExpand}>toggle</button>
      <button onClick={() => kc.openOverlay('vol6')}>open</button>
      <button onClick={kc.closeOverlay}>close</button>
      {kc.overlayContent && <span data-testid="overlay-title">{kc.overlayContent.title}</span>}
    </div>
  );
}

describe('useKnowledgeCompanion', () => {
  it('returns visible=false at step 1', () => {
    render(<TestHook wizardStep={1} discipline="italiano" order="primaria" />);
    expect(screen.getByTestId('visible').textContent).toBe('false');
    expect(screen.getByTestId('has-main').textContent).toBe('false');
  });

  it('returns visible=false at step 5', () => {
    render(<TestHook wizardStep={5} discipline="italiano" order="primaria" />);
    expect(screen.getByTestId('visible').textContent).toBe('false');
  });

  it('returns visible=true at step 2', () => {
    render(<TestHook wizardStep={2} discipline="italiano" order="primaria" />);
    expect(screen.getByTestId('visible').textContent).toBe('true');
    expect(screen.getByTestId('has-main').textContent).toBe('true');
  });

  it('returns visible=true at step 3', () => {
    render(<TestHook wizardStep={3} discipline="scienze" order="secondaria" />);
    expect(screen.getByTestId('visible').textContent).toBe('true');
  });

  it('returns visible=true at step 4', () => {
    render(<TestHook wizardStep={4} discipline="matematica" order="primaria" />);
    expect(screen.getByTestId('visible').textContent).toBe('true');
  });

  it('returns correct main reference at step 2 (vol4)', () => {
    render(<TestHook wizardStep={2} discipline="italiano" order="primaria" />);
    expect(screen.getByTestId('main-volume').textContent).toBe('vol4');
    expect(screen.getByTestId('main-category').textContent).toBe('Curricolo');
  });

  it('returns correct main reference at step 3 (vol3)', () => {
    render(<TestHook wizardStep={3} discipline="scienze" order="secondaria" />);
    expect(screen.getByTestId('main-volume').textContent).toBe('vol3');
    expect(screen.getByTestId('main-category').textContent).toBe('Fonte normativa');
  });

  it('returns correct main reference at step 4 (vol6)', () => {
    render(<TestHook wizardStep={4} discipline="italiano" order="secondaria" />);
    expect(screen.getByTestId('main-volume').textContent).toBe('vol6');
    expect(screen.getByTestId('main-category').textContent).toBe('Approfondimento');
  });

  it('returns 2 additional references at step 2', () => {
    render(<TestHook wizardStep={2} discipline="italiano" order="primaria" />);
    expect(screen.getByTestId('additional-count').textContent).toBe('2');
  });

  it('returns 1 additional reference at step 3', () => {
    render(<TestHook wizardStep={3} discipline="scienze" order="secondaria" />);
    expect(screen.getByTestId('additional-count').textContent).toBe('1');
  });

  it('returns 2 additional references at step 4', () => {
    render(<TestHook wizardStep={4} discipline="matematica" order="primaria" />);
    expect(screen.getByTestId('additional-count').textContent).toBe('2');
  });

  it('shows infanzia-specific intro at step 2', () => {
    render(<TestHook wizardStep={2} discipline="italiano" order="infanzia" />);
    expect(screen.getByTestId('intro').textContent).toContain('Infanzia');
  });

  it('shows standard intro at step 2 for primaria', () => {
    render(<TestHook wizardStep={2} discipline="italiano" order="primaria" />);
    expect(screen.getByTestId('intro').textContent).toContain('traguardi');
  });

  it('toggleExpand works', () => {
    render(<TestHook wizardStep={2} discipline="italiano" order="primaria" />);
    expect(screen.getByTestId('expanded').textContent).toBe('false');
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('expanded').textContent).toBe('true');
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('expanded').textContent).toBe('false');
  });

  it('overlay opens and closes', () => {
    render(<TestHook wizardStep={2} discipline="italiano" order="primaria" />);
    expect(screen.queryByTestId('overlay-title')).toBeNull();
    fireEvent.click(screen.getByText('open'));
    expect(screen.getByTestId('overlay-title')).toBeTruthy();
    fireEvent.click(screen.getByText('close'));
    expect(screen.queryByTestId('overlay-title')).toBeNull();
  });

  it('does not use WikiLLM or Copilot', () => {
    render(<TestHook wizardStep={2} discipline="italiano" order="primaria" />);
    const intro = screen.getByTestId('intro').textContent;
    expect(intro).not.toContain('WikiLLM');
    expect(intro).not.toContain('Copilot');
    expect(intro).not.toContain('chat');
  });

  it('no unauthorized volumes', () => {
    const authorized = ['vol3', 'vol4', 'vol6', 'vol8', 'vol19'];
    render(<TestHook wizardStep={2} discipline="italiano" order="primaria" />);
    const mainVol = screen.getByTestId('main-volume').textContent;
    expect(authorized).toContain(mainVol);
  });

  it('preserves wizard step (does not modify it)', () => {
    render(<TestHook wizardStep={3} discipline="scienze" order="secondaria" />);
    // The hook only reads wizardStep, never sets it
    expect(screen.getByTestId('visible').textContent).toBe('true');
  });
});

// ─── KnowledgeCompanionPanel tests ───

function mockRef(overrides = {}) {
  return {
    volumeId: 'vol4',
    category: 'Curricolo' as const,
    title: 'Curricolo Fondativo',
    excerpt: 'Test excerpt',
    relevance: 'Test relevance',
    main: true,
    ...overrides,
  };
}

describe('KnowledgeCompanionPanel', () => {
  const defaultProps = {
    intro: 'Test intro',
    mainRef: mockRef(),
    additionalRefs: [],
    expanded: false,
    onToggleExpand: vi.fn(),
    onOpenVolume: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no refs', () => {
    const { container } = render(
      <KnowledgeCompanionPanel {...defaultProps} mainRef={null} additionalRefs={[]} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders main reference', () => {
    render(<KnowledgeCompanionPanel {...defaultProps} />);
    expect(screen.getByText('Curricolo Fondativo')).toBeTruthy();
    expect(screen.getByText('Test excerpt')).toBeTruthy();
  });

  it('renders intro', () => {
    render(<KnowledgeCompanionPanel {...defaultProps} />);
    expect(screen.getByText('Test intro')).toBeTruthy();
  });

  it('renders category badge', () => {
    render(<KnowledgeCompanionPanel {...defaultProps} />);
    expect(screen.getByText('Curricolo')).toBeTruthy();
  });

  it('shows expand button when additional refs exist', () => {
    render(
      <KnowledgeCompanionPanel
        {...defaultProps}
        additionalRefs={[mockRef({ volumeId: 'vol8', main: false })]}
      />
    );
    expect(screen.getByText('Mostra altre 1 fonti')).toBeTruthy();
  });

  it('does not show expand button when no additional refs', () => {
    render(<KnowledgeCompanionPanel {...defaultProps} />);
    expect(screen.queryByText(/Mostra altre/)).toBeNull();
  });

  it('shows additional refs when expanded', () => {
    render(
      <KnowledgeCompanionPanel
        {...defaultProps}
        additionalRefs={[mockRef({ volumeId: 'vol8', title: 'Vol 8', main: false })]}
        expanded={true}
      />
    );
    expect(screen.getByText('Vol 8')).toBeTruthy();
  });

  it('calls onToggleExpand', () => {
    const onToggle = vi.fn();
    render(
      <KnowledgeCompanionPanel
        {...defaultProps}
        additionalRefs={[mockRef({ volumeId: 'vol8', main: false })]}
        onToggleExpand={onToggle}
      />
    );
    fireEvent.click(screen.getByText(/Mostra altre/));
    expect(onToggle).toHaveBeenCalled();
  });

  it('calls onOpenVolume', () => {
    const onOpen = vi.fn();
    render(<KnowledgeCompanionPanel {...defaultProps} onOpenVolume={onOpen} />);
    fireEvent.click(screen.getByText('Apri riferimento'));
    expect(onOpen).toHaveBeenCalledWith('vol4');
  });

  it('shows optionality hint', () => {
    render(<KnowledgeCompanionPanel {...defaultProps} />);
    expect(screen.getByText('Puoi continuare anche senza consultare i riferimenti.')).toBeTruthy();
  });

  it('does not use prescriptive language', () => {
    render(<KnowledgeCompanionPanel {...defaultProps} />);
    const allText = document.body.textContent || '';
    expect(allText).not.toContain('devi');
    expect(allText).not.toContain('scegli');
    expect(allText).not.toContain('obbligatoriamente');
    expect(allText).not.toContain('necessario selezionare');
  });

  it('shows volume ID', () => {
    render(<KnowledgeCompanionPanel {...defaultProps} />);
    expect(screen.getByText('Vol. 4')).toBeTruthy();
  });

  it('shows relevance text', () => {
    render(<KnowledgeCompanionPanel {...defaultProps} />);
    expect(screen.getByText('Test relevance')).toBeTruthy();
  });
});

// ─── VolumeReaderOverlay tests ───

describe('VolumeReaderOverlay', () => {
  it('renders nothing when content is null', () => {
    const { container } = render(<VolumeReaderOverlay content={null} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders overlay with title', () => {
    render(
      <VolumeReaderOverlay
        content={{ id: 'vol6', title: 'Repertorio', html: '<p>test</p>' }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Repertorio')).toBeTruthy();
  });

  it('renders HTML content', () => {
    render(
      <VolumeReaderOverlay
        content={{ id: 'vol6', title: 'Repertorio', html: '<p>Hello world</p>' }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('calls onClose on backdrop click', () => {
    const onClose = vi.fn();
    render(
      <VolumeReaderOverlay
        content={{ id: 'vol6', title: 'Repertorio', html: '<p>test</p>' }}
        onClose={onClose}
      />
    );
    // Click the backdrop (the fixed overlay div)
    const backdrop = document.querySelector('.fixed.inset-0');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose on X button click', () => {
    const onClose = vi.fn();
    render(
      <VolumeReaderOverlay
        content={{ id: 'vol6', title: 'Repertorio', html: '<p>test</p>' }}
        onClose={onClose}
      />
    );
    // Find the close button (X icon)
    const closeBtn = document.querySelector('button');
    if (closeBtn) fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not close on content click (stopPropagation)', () => {
    const onClose = vi.fn();
    render(
      <VolumeReaderOverlay
        content={{ id: 'vol6', title: 'Repertorio', html: '<p>test</p>' }}
        onClose={onClose}
      />
    );
    // Click inside the content area
    const contentArea = document.querySelector('.overflow-y-auto');
    if (contentArea) fireEvent.click(contentArea);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('has max-height constraint for long content', () => {
    render(
      <VolumeReaderOverlay
        content={{ id: 'vol6', title: 'Repertorio', html: '<p>Long content</p>' }}
        onClose={vi.fn()}
      />
    );
    const box = document.querySelector('.max-h-\\[80vh\\]');
    expect(box).toBeTruthy();
  });

  it('has overflow-y-auto for scrollable content', () => {
    render(
      <VolumeReaderOverlay
        content={{ id: 'vol6', title: 'Repertorio', html: '<p>Content</p>' }}
        onClose={vi.fn()}
      />
    );
    const scrollable = document.querySelector('.overflow-y-auto');
    expect(scrollable).toBeTruthy();
  });
});
