import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ContentItem } from '../../domain/curriculum/nationalCurriculumConsultation';
import {
  createNationalCurriculumComparisonService,
  type NationalCurriculumComparisonResult,
  type NationalCurriculumComparisonService,
} from '../../domain/curriculum/nationalCurriculumComparison';
import {
  createSemanticMappingCandidateService,
  type SemanticMappingCandidate,
  type SemanticMappingCandidateService,
} from '../../domain/curriculum/nationalCurriculumSemanticCandidates';
import {
  buildComparisonReviewModel,
  createReviewScope,
  type ReviewScope,
} from '../../features/curriculum/components/curriculumComparisonReviewModel';
import { CurriculumComparisonReviewView } from '../../features/curriculum/components/CurriculumComparisonReviewView';

const comparisonService = createNationalCurriculumComparisonService();
const candidateService = createSemanticMappingCandidateService(comparisonService);

const primaryItalianScope = createReviewScope({
  schoolOrder: 'primaria',
  disciplineCode: 'italiano',
});

const primaryItalianComparison = comparisonService.compare('IN2012', 'IN2025', primaryItalianScope);
const primaryItalianCandidates = candidateService.generateCandidates('IN2012', 'IN2025', primaryItalianScope);
const primaryItalianModel = buildComparisonReviewModel(primaryItalianComparison, primaryItalianCandidates);

type ReadOnlyReviewProps = Readonly<{
  comparisonService: NationalCurriculumComparisonService;
  candidateService: SemanticMappingCandidateService;
  scope: ReviewScope;
}>;

type ForbiddenReviewProp = 'onApprove' | 'onSave' | 'onCreateLink' | 'persist' | 'CurriculumLink';
type ReadOnlyReviewPropKeys = keyof ReadOnlyReviewProps;
type AssertExplicitReadOnlyReviewProps = Exclude<ReadOnlyReviewPropKeys, 'comparisonService' | 'candidateService' | 'scope'> extends never
  ? Exclude<'comparisonService' | 'candidateService' | 'scope', ReadOnlyReviewPropKeys> extends never
    ? true
    : never
  : never;
type AssertNoForbiddenReviewProps<Props> = Extract<keyof Props, ForbiddenReviewProp> extends never ? true : never;

const reviewViewMatchesReadOnlyContract: AssertExplicitReadOnlyReviewProps = true;
const reviewViewHasNoWriteBoundaryProps: AssertNoForbiddenReviewProps<
  ComponentProps<typeof CurriculumComparisonReviewView>
> = true;

function renderReview(scope: ReviewScope = primaryItalianScope) {
  const props: ReadOnlyReviewProps = Object.freeze({ comparisonService, candidateService, scope });
  return render(<CurriculumComparisonReviewView {...props} />);
}

function contentItem(
  id: string,
  text: string,
  framework: 'IN2012' | 'IN2025',
  normativeNodeKind?: ContentItem['normativeNodeKind'],
): ContentItem {
  return {
    id,
    text,
    nodeType: framework === 'IN2025' ? 'competenza' : 'traguardo',
    normativeCheckpoint: 'end-primary',
    normativeNodeKind,
    schoolOrder: 'primaria',
    disciplineCode: 'italiano',
    sourceAreaKind: 'discipline',
  };
}

function candidate(
  id: string,
  leftNodeId: string,
  rightNodeId: string,
  confidence: SemanticMappingCandidate['confidence'],
  rightNormativeNodeKind?: SemanticMappingCandidate['right']['normativeNodeKind'],
): SemanticMappingCandidate {
  return {
    id,
    left: {
      frameworkId: 'IN2012',
      nodeId: leftNodeId,
      schoolOrder: 'primaria',
      disciplineCode: 'italiano',
      normativeCheckpoint: 'end-primary',
      normativeNodeKind: 'objective-2012',
    },
    right: {
      frameworkId: 'IN2025',
      nodeId: rightNodeId,
      schoolOrder: 'primaria',
      disciplineCode: 'italiano',
      normativeCheckpoint: 'end-primary',
      normativeNodeKind: rightNormativeNodeKind,
    },
    relationKind: 'unclassified-correspondence',
    evidence: [],
    confidence,
    status: 'candidate',
    generatedBy: 'deterministic-structural-analysis',
  };
}

function customReviewServices(
  candidates: SemanticMappingCandidate[],
  items: { left: ContentItem[]; right: ContentItem[] } = {
    left: [contentItem('opaque-left-node-17', 'Testo sinistro non identificativo', 'IN2012', 'objective-2012')],
    right: [contentItem('opaque-right-node-42', 'Testo destro non identificativo', 'IN2025', 'osa-2025')],
  },
) {
  const comparison: NationalCurriculumComparisonResult = {
    left: { frameworkId: 'IN2012', areas: [], items: items.left },
    right: { frameworkId: 'IN2025', areas: [], items: items.right },
    structuralDifferences: [],
  };
  const customComparisonService: NationalCurriculumComparisonService = {
    compare: vi.fn(() => comparison),
  };
  const customCandidateService: SemanticMappingCandidateService = {
    generateCandidates: vi.fn(() => candidates),
  };
  return { comparison, customComparisonService, customCandidateService, left: items.left[0], right: items.right[0] };
}

function renderCustomReview(
  candidates: SemanticMappingCandidate[] = [
    candidate('candidate-opaque', 'opaque-left-node-17', 'opaque-right-node-42', 'medium', 'osa-2025'),
  ],
  items?: { left: ContentItem[]; right: ContentItem[] },
) {
  const services = customReviewServices(candidates, items);
  const props: ReadOnlyReviewProps = Object.freeze({
    comparisonService: services.customComparisonService,
    candidateService: services.customCandidateService,
    scope: primaryItalianScope,
  });
  render(<CurriculumComparisonReviewView {...props} />);
  return services;
}

describe('CURR-R4C Task 2 — comparison review UI contract', () => {
  it('renders a split view with separate framework and review sections', () => {
    renderReview();

    expect(screen.getByRole('heading', { name: 'IN2012' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IN2025' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Differenze strutturali' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Candidati semantici' })).toBeInTheDocument();
  });

  it('shows an empty inspector when candidates are absent', () => {
    renderReview(createReviewScope({
      schoolOrder: 'secondaria',
      disciplineCode: 'musica',
      leftSourceAreaCode: 'in2025-strumento-musicale',
      rightSourceAreaCode: 'in2025-strumento-musicale',
    }));

    expect(screen.getByText(/nessun candidato semantico/i)).toBeInTheDocument();
  });

  it('shows the candidate list and selection prompt without an initial selection', () => {
    renderReview();

    expect(primaryItalianModel.candidates.length).toBeGreaterThan(0);
    expect(screen.getByText(/seleziona un candidato/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('opens candidate details only after the user selects a candidate', () => {
    renderReview();
    const first = primaryItalianModel.candidates[0];
    const candidateButton = screen.getByRole('button', { name: new RegExp(first.left!.text.slice(0, 24)) });

    expect(screen.getByText(/seleziona un candidato/i)).toBeInTheDocument();
    fireEvent.click(candidateButton);

    expect(screen.getByText(first.left!.text)).toBeInTheDocument();
    expect(screen.getByText(first.right!.text)).toBeInTheDocument();
  });

  it('preserves input order for high and low candidates and never auto-selects one', () => {
    const high = candidate('candidate-high', 'opaque-left-node-17', 'opaque-right-node-42', 'high');
    const low = candidate('candidate-low', 'opaque-left-node-17', 'opaque-right-node-42', 'low');
    renderCustomReview([high, low]);

    const buttons = screen.getAllByRole('button', { name: /candidate-(high|low)/i });
    expect(buttons.map(button => button.getAttribute('data-candidate-id'))).toEqual(['candidate-high', 'candidate-low']);
    expect(buttons.every(button => button.getAttribute('aria-pressed') !== 'true')).toBe(true);
    expect(screen.getByText(/seleziona un candidato/i)).toBeInTheDocument();
    expect(screen.queryByText(/ranking|classifica|ordinati per confidenza/i)).not.toBeInTheDocument();
  });

  it('resets the inspector selection when the review scope changes', () => {
    renderReview();
    const first = primaryItalianModel.candidates[0];
    fireEvent.click(screen.getByRole('button', { name: new RegExp(first.left!.text.slice(0, 24)) }));
    expect(screen.getByText(first.right!.text)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: /ordine/i }), { target: { value: 'secondaria' } });

    expect(screen.getByText(/seleziona un candidato/i)).toBeInTheDocument();
  });

  it('joins and highlights endpoints by opaque nodeId, not by candidate id or visible text', () => {
    const services = renderCustomReview();
    const button = screen.getByRole('button', { name: /candidate-opaque/i });

    expect(button).toHaveAttribute('data-candidate-id', 'candidate-opaque');
    expect(screen.queryByText('opaque-left-node-17')).not.toBeInTheDocument();
    expect(screen.queryByText('opaque-right-node-42')).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(services.left.text)).toHaveAttribute('data-node-id', services.left.id);
    expect(screen.getByText(services.right.text)).toHaveAttribute('data-node-id', services.right.id);
    expect(screen.getByText(services.left.text)).toHaveAttribute('data-framework-id', 'IN2012');
    expect(screen.getByText(services.right.text)).toHaveAttribute('data-framework-id', 'IN2025');
    expect(screen.getByText(services.left.text)).toHaveAttribute('data-highlighted', 'true');
    expect(screen.getByText(services.right.text)).toHaveAttribute('data-highlighted', 'true');
  });

  it('joins and highlights the selected candidate endpoints when each side has multiple items in a different order', () => {
    const candidates = [
      candidate('candidate-crossed', 'left-node-b', 'right-node-a', 'high'),
      candidate('candidate-second', 'left-node-a', 'right-node-b', 'medium'),
    ];
    const leftItems = [
      contentItem('left-node-a', 'Sinistro A', 'IN2012', 'objective-2012'),
      contentItem('left-node-b', 'Sinistro B', 'IN2012', 'objective-2012'),
    ];
    const rightItems = [
      contentItem('right-node-a', 'Destro A', 'IN2025', 'osa-2025'),
      contentItem('right-node-b', 'Destro B', 'IN2025', 'osa-2025'),
    ];
    renderCustomReview(candidates, { left: leftItems, right: rightItems });

    fireEvent.click(screen.getByRole('button', { name: /candidate-crossed/i }));

    expect(screen.getByText('Sinistro B')).toHaveAttribute('data-node-id', 'left-node-b');
    expect(screen.getByText('Sinistro B')).toHaveAttribute('data-highlighted', 'true');
    expect(screen.getByText('Destro A')).toHaveAttribute('data-node-id', 'right-node-a');
    expect(screen.getByText('Destro A')).toHaveAttribute('data-highlighted', 'true');
    expect(screen.getByText('Sinistro A')).not.toHaveAttribute('data-highlighted', 'true');
    expect(screen.getByText('Destro B')).not.toHaveAttribute('data-highlighted', 'true');
  });

  it('renders normativeNodeKind osa-2025 as normative metadata, not only as text', () => {
    const services = renderCustomReview();
    fireEvent.click(screen.getByRole('button', { name: /candidate-opaque/i }));

    const rightEndpoint = screen.getByText(services.right.text);
    expect(rightEndpoint).toHaveAttribute('data-normative-node-kind', 'osa-2025');
    expect(within(rightEndpoint.parentElement as HTMLElement).getByText(/OSA 2025/i)).toBeInTheDocument();
  });

  it('keeps Strumento musicale structural-only and marks 2025 normative nodes explicitly as OSA', () => {
    renderReview(createReviewScope({
      schoolOrder: 'secondaria',
      disciplineCode: 'musica',
      rightSourceAreaCode: 'in2025-strumento-musicale',
    }));

    expect(screen.getByText(/Strumento musicale/i)).toBeInTheDocument();
    expect(screen.getByText(/OSA 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/nessun candidato semantico/i)).toBeInTheDocument();
    expect(screen.queryByText(/candidato fabbricato|corrispondenza proposta/i)).not.toBeInTheDocument();
  });

  it('shows an empty comparison without inventing structural differences', () => {
    renderReview(createReviewScope({
      schoolOrder: 'primaria',
      leftSourceAreaCode: 'does-not-exist',
      rightSourceAreaCode: 'does-not-exist',
    }));

    expect(screen.getByText(/nessun contenuto/i)).toBeInTheDocument();
    expect(screen.getByText(/nessuna differenza strutturale/i)).toBeInTheDocument();
  });

  it('switches between wide two-column and narrow sequential layout at the responsive boundary', () => {
    const originalMatchMedia = window.matchMedia;
    let viewportWidth = 1024;
    window.matchMedia = vi.fn((query: string) => ({
      matches:
        (query === '(min-width: 768px)' && viewportWidth >= 768)
        || (query === '(max-width: 767px)' && viewportWidth <= 767),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as typeof window.matchMedia;

    try {
      renderReview();
      const layout = screen.getByTestId('curriculum-comparison-review-layout');
      expect(layout).toHaveAttribute('data-layout', 'wide-two-column');
      expect(layout).toHaveAttribute('role', 'main');
      expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');

      viewportWidth = 767;
      fireEvent(window, new Event('resize'));
      expect(layout).toHaveAttribute('data-layout', 'narrow-sequential');
      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('exposes responsive labels and accessible controls', () => {
    renderReview();

    expect(screen.getByRole('combobox', { name: /ordine/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /disciplina|area/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /ispettore|inspector/i })).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: /ispettore|inspector/i })).getByText(/candidati semantici/i)).toBeInTheDocument();
  });

  it('declares only readonly comparison inputs at the component boundary', () => {
    expect(reviewViewMatchesReadOnlyContract).toBe(true);
    expect(reviewViewHasNoWriteBoundaryProps).toBe(true);
  });
});
