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
import { createReviewScope, type ReviewScope } from '../../features/curriculum/components/curriculumComparisonReviewModel';
import { CurriculumComparisonReviewView } from '../../features/curriculum/components/CurriculumComparisonReviewView';

const comparisonService = createNationalCurriculumComparisonService();
const candidateService = createSemanticMappingCandidateService(comparisonService);

const primaryItalianScope = createReviewScope({
  schoolOrder: 'primaria',
  disciplineCode: 'italiano',
});

type ReadOnlyReviewProps = Readonly<{
  comparisonService: NationalCurriculumComparisonService;
  candidateService: SemanticMappingCandidateService;
  scope: ReviewScope;
}>;

type ForbiddenReviewProp = 'onApprove' | 'onSave' | 'onCreateLink' | 'persist' | 'CurriculumLink';
type AssertExactProps<Actual, Expected> = string extends keyof Actual
  ? true
  : [keyof Actual] extends [never]
    ? true
  : [Exclude<keyof Actual, keyof Expected>] extends [never]
    ? [Exclude<keyof Expected, keyof Actual>] extends [never]
      ? [Actual] extends [Expected]
        ? [Expected] extends [Actual]
          ? true
          : never
        : never
      : never
    : never;
type AssertNoForbiddenReviewProps<Props> = Extract<keyof Props, ForbiddenReviewProp> extends never ? true : never;

const reviewViewMatchesReadOnlyContract: AssertExactProps<
  ComponentProps<typeof CurriculumComparisonReviewView>,
  ReadOnlyReviewProps
> = true;
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

type ReviewItems = { left: ContentItem[]; right: ContentItem[] };

const customReviewItems: ReviewItems = {
  left: [
    contentItem('opaque-left-node-17', 'Testo sinistro non identificativo', 'IN2012', 'objective-2012'),
    contentItem('opaque-left-node-18', 'Secondo testo sinistro', 'IN2012', 'objective-2012'),
  ],
  right: [
    contentItem('opaque-right-node-42', 'Testo destro non identificativo', 'IN2025', 'osa-2025'),
    contentItem('opaque-right-node-43', 'Secondo testo destro', 'IN2025', 'osa-2025'),
  ],
};

const deterministicInstrumentReviewItems: ReviewItems = {
  left: [contentItem('instrument-left-node', 'Strumento musicale', 'IN2012', 'objective-2012')],
  right: [contentItem('instrument-right-node', 'Strumento musicale', 'IN2025', 'osa-2025')],
};

function candidate(
  id: string,
  leftNodeId: string,
  rightNodeId: string,
  confidence: SemanticMappingCandidate['confidence'],
  rightNormativeNodeKind?: SemanticMappingCandidate['right']['normativeNodeKind'],
  options: Readonly<{
    relationKind?: SemanticMappingCandidate['relationKind'];
    evidence?: SemanticMappingCandidate['evidence'];
    leftNodeType?: SemanticMappingCandidate['left']['nodeType'];
    rightNodeType?: SemanticMappingCandidate['right']['nodeType'];
    leftSourceAreaCode?: string;
    rightSourceAreaCode?: string;
    leftFrameworkApplicability?: {
      framework: 'IN2012' | 'IN2025' | null;
      resolutionStatus: 'resolved' | 'requires-context-confirmation';
      resolutionReason: string;
      cohortEntryYear?: number;
    };
    rightFrameworkApplicability?: {
      framework: 'IN2012' | 'IN2025' | null;
      resolutionStatus: 'resolved' | 'requires-context-confirmation';
      resolutionReason: string;
      cohortEntryYear?: number;
    };
  }> = {},
): SemanticMappingCandidate {
  const value: SemanticMappingCandidate = {
    id,
    left: {
      frameworkId: 'IN2012',
      nodeId: leftNodeId,
      schoolOrder: 'primaria',
      disciplineCode: 'italiano',
      normativeCheckpoint: 'end-primary',
      normativeNodeKind: 'objective-2012',
      nodeType: options.leftNodeType ?? 'obiettivo',
      sourceAreaCode: options.leftSourceAreaCode,
    },
    right: {
      frameworkId: 'IN2025',
      nodeId: rightNodeId,
      schoolOrder: 'primaria',
      disciplineCode: 'italiano',
      normativeCheckpoint: 'end-primary',
      normativeNodeKind: rightNormativeNodeKind,
      nodeType: options.rightNodeType ?? 'competenza',
      sourceAreaCode: options.rightSourceAreaCode,
    },
    relationKind: options.relationKind ?? 'unclassified-correspondence',
    evidence: options.evidence ?? [],
    confidence,
    status: 'candidate',
    generatedBy: 'deterministic-structural-analysis',
  };

  if (options.leftFrameworkApplicability) {
    Object.assign(value.left, { frameworkApplicability: options.leftFrameworkApplicability });
  }
  if (options.rightFrameworkApplicability) {
    Object.assign(value.right, { frameworkApplicability: options.rightFrameworkApplicability });
  }
  return value;
}

function customReviewServices(
  candidates: SemanticMappingCandidate[],
  items: ReviewItems = customReviewItems,
) {
  const left = items.left[0];
  const right = items.right[0];
  if (!left || !right) {
    throw new Error('custom review fixtures must contain at least one item per side');
  }

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
  return { comparison, customComparisonService, customCandidateService, left, right };
}

const selectionCandidates = [
  candidate('candidate-selection', 'opaque-left-node-17', 'opaque-right-node-42', 'medium', 'osa-2025'),
  candidate('candidate-selection-second', 'opaque-left-node-18', 'opaque-right-node-43', 'low', 'osa-2025'),
];

function renderCustomReview(
  candidates: SemanticMappingCandidate[] = [
    candidate('candidate-opaque', 'opaque-left-node-17', 'opaque-right-node-42', 'medium', 'osa-2025'),
  ],
  items?: { left: ContentItem[]; right: ContentItem[] },
  scope: ReviewScope = primaryItalianScope,
) {
  const services = customReviewServices(candidates, items);
  const props: ReadOnlyReviewProps = Object.freeze({
    comparisonService: services.customComparisonService,
    candidateService: services.customCandidateService,
    scope,
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
    renderCustomReview([], deterministicInstrumentReviewItems);

    expect(screen.getByText(/nessun candidato semantico/i)).toBeInTheDocument();
  });

  it('shows the candidate list and selection prompt without an initial selection', () => {
    renderCustomReview(selectionCandidates);

    const candidateButtons = screen.getAllByRole('button', { name: /candidate-selection/i });
    expect(candidateButtons).toHaveLength(selectionCandidates.length);
    expect(candidateButtons.map(button => button.getAttribute('data-candidate-id'))).toEqual(
      selectionCandidates.map(item => item.id),
    );
    expect(screen.getByText(/seleziona un candidato/i)).toBeInTheDocument();
  });

  it('opens candidate details only after the user selects a candidate', () => {
    const services = renderCustomReview(selectionCandidates);
    const candidateButton = screen.getByRole('button', { name: /candidate-selection$/i });

    expect(screen.getByText(/seleziona un candidato/i)).toBeInTheDocument();
    fireEvent.click(candidateButton);

    expect(screen.getByText(services.left.text)).toBeInTheDocument();
    expect(screen.getByText(services.right.text)).toBeInTheDocument();
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
    const services = renderCustomReview(selectionCandidates);
    fireEvent.click(screen.getByRole('button', { name: /candidate-selection$/i }));
    expect(screen.getByText(services.right.text)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: /ordine/i }), { target: { value: 'secondaria' } });

    expect(screen.getByText(/seleziona un candidato/i)).toBeInTheDocument();
  });

  it('propagates shared schoolOrder, disciplineCode, and normativeCheckpoint to both read-only services', () => {
    const services = renderCustomReview([], deterministicInstrumentReviewItems, createReviewScope({
      schoolOrder: 'primaria',
      disciplineCode: 'italiano',
      normativeCheckpoint: 'end-primary',
      leftSourceAreaCode: 'strumento-musicale',
      rightSourceAreaCode: 'musica',
    }));

    fireEvent.change(screen.getByRole('combobox', { name: /ordine/i }), { target: { value: 'secondaria' } });
    fireEvent.change(screen.getByRole('combobox', { name: /disciplina|area/i }), { target: { value: 'musica' } });
    fireEvent.change(screen.getByRole('combobox', { name: /checkpoint|traguardo/i }), {
      target: { value: 'end-primary-grade-3' },
    });

    expect(services.customComparisonService.compare).toHaveBeenCalled();
    expect(services.customCandidateService.generateCandidates).toHaveBeenCalled();
    for (const [, , scope] of vi.mocked(services.customComparisonService.compare).mock.calls) {
      expect(scope).toMatchObject({
        schoolOrder: 'secondaria',
        disciplineCode: 'musica',
        normativeCheckpoint: 'end-primary-grade-3',
        sourceAreaCode: 'strumento-musicale',
      });
      expect(scope).not.toMatchObject({ sourceAreaCode: 'musica' });
    }
    for (const [, , scope] of vi.mocked(services.customCandidateService.generateCandidates).mock.calls) {
      expect(scope).toMatchObject({
        schoolOrder: 'secondaria',
        disciplineCode: 'musica',
        normativeCheckpoint: 'end-primary-grade-3',
        sourceAreaCode: 'musica',
      });
      expect(scope).not.toMatchObject({ sourceAreaCode: 'strumento-musicale' });
    }
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

  it('keeps source-native area codes on their originating framework side', () => {
    const sourceNativeCandidate = candidate(
      'candidate-source-native-areas',
      'opaque-left-node-17',
      'opaque-right-node-42',
      'medium',
      'osa-2025',
      {
        leftSourceAreaCode: 'strumento-musicale',
        rightSourceAreaCode: 'musica',
      },
    );
    const services = renderCustomReview([sourceNativeCandidate]);
    fireEvent.click(screen.getByRole('button', { name: /candidate-source-native-areas/i }));

    const leftEndpoint = screen.getByText(services.left.text);
    const rightEndpoint = screen.getByText(services.right.text);
    expect(leftEndpoint).toHaveAttribute('data-source-area-code', 'strumento-musicale');
    expect(rightEndpoint).toHaveAttribute('data-source-area-code', 'musica');
    expect(leftEndpoint).not.toHaveAttribute('data-source-area-code', 'musica');
    expect(rightEndpoint).not.toHaveAttribute('data-source-area-code', 'strumento-musicale');
    expect(screen.queryByText('IN2012:musica')).not.toBeInTheDocument();
    expect(screen.queryByText('IN2025:strumento-musicale')).not.toBeInTheDocument();
  });

  it('shows the selected relation inspector as descriptive and non-editable', () => {
    const inspectedCandidate = candidate(
      'candidate-inspector-contract',
      'opaque-left-node-17',
      'opaque-right-node-42',
      'high',
      'osa-2025',
      {
        relationKind: 'possible-continuity',
        evidence: [
          { kind: 'same-discipline', disciplineCode: 'italiano' },
          { kind: 'same-school-order', schoolOrder: 'primaria' },
          { kind: 'same-checkpoint', checkpoint: 'end-primary' },
        ],
        leftNodeType: 'obiettivo',
        rightNodeType: 'competenza',
        leftFrameworkApplicability: {
          framework: 'IN2012',
          resolutionStatus: 'resolved',
          resolutionReason: 'BEFORE_TRANSITION',
        },
        rightFrameworkApplicability: {
          framework: 'IN2025',
          resolutionStatus: 'resolved',
          resolutionReason: 'ENTRY_COHORT_2026_OR_LATER',
          cohortEntryYear: 2026,
        },
      },
    );
    const services = renderCustomReview([inspectedCandidate]);
    fireEvent.click(screen.getByRole('button', { name: /candidate-inspector-contract/i }));

    expect(screen.getByText('possible-continuity')).toBeInTheDocument();
    expect(screen.getByText(/same-discipline/i)).toBeInTheDocument();
    expect(screen.getByText(/same-school-order/i)).toBeInTheDocument();
    expect(screen.getByText(/same-checkpoint/i)).toBeInTheDocument();
    expect(screen.getByText(/high|alta/i)).toBeInTheDocument();
    expect(screen.getByText(/obiettivo/i)).toBeInTheDocument();
    expect(screen.getByText(/competenza/i)).toBeInTheDocument();
    expect(screen.getByText(/objective-2012/i)).toBeInTheDocument();
    expect(screen.getByText(/osa-2025/i)).toBeInTheDocument();
    expect(screen.getByText(/BEFORE_TRANSITION/i)).toBeInTheDocument();
    expect(screen.getByText(/ENTRY_COHORT_2026_OR_LATER/i)).toBeInTheDocument();
    expect(screen.getByText('Candidato')).toBeInTheDocument();
    expect(screen.getByText('Candidato').closest('button')).toBeNull();
    expect(screen.getByText(services.left.text)).toHaveAttribute('data-node-type', 'obiettivo');
    expect(screen.getByText(services.right.text)).toHaveAttribute('data-node-type', 'competenza');

    for (const forbiddenText of [
      /Approva/i,
      /Conferma equivalenza/i,
      /Sostituisci/i,
      /Accetta mapping/i,
      /Salva relazione/i,
      /equivalente/i,
      /approvato/i,
      /CurriculumLink/i,
    ]) {
      expect(screen.queryByText(forbiddenText)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: forbiddenText })).not.toBeInTheDocument();
    }
  });

  it('covers all confidence values without exposing an editable relation state', () => {
    const candidates = (['low', 'medium', 'high'] as const).map(confidence =>
      candidate(`candidate-confidence-${confidence}`, 'opaque-left-node-17', 'opaque-right-node-42', confidence),
    );
    renderCustomReview(candidates);

    for (const confidence of ['low', 'medium', 'high']) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`candidate-confidence-${confidence}`, 'i') }));
      expect(screen.getByText(new RegExp(confidence, 'i'))).toBeInTheDocument();
    }
  });

  it('has an explicit UI blacklist for write or equivalence actions', () => {
    renderCustomReview(selectionCandidates);

    for (const forbiddenText of [
      /Approva/i,
      /Conferma equivalenza/i,
      /Sostituisci/i,
      /Accetta mapping/i,
      /Salva relazione/i,
      /equivalente/i,
      /approvato/i,
      /CurriculumLink/i,
    ]) {
      expect(screen.queryByText(forbiddenText)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: forbiddenText })).not.toBeInTheDocument();
    }
  });

  it('keeps Strumento musicale structural-only and marks 2025 normative nodes explicitly as OSA', () => {
    renderCustomReview([], deterministicInstrumentReviewItems);

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

      viewportWidth = 768;
      fireEvent(window, new Event('resize'));
      expect(layout).toHaveAttribute('data-layout', 'wide-two-column');

      viewportWidth = 767;
      fireEvent(window, new Event('resize'));
      expect(layout).toHaveAttribute('data-layout', 'narrow-sequential');
      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');

      const leftPanel = screen.getByRole('region', { name: /IN2012/i });
      const rightPanel = screen.getByRole('region', { name: /IN2025/i });
      expect(within(leftPanel).getByRole('heading', { name: 'IN2012' })).toBeInTheDocument();
      expect(within(rightPanel).getByRole('heading', { name: 'IN2025' })).toBeInTheDocument();
      expect(leftPanel.compareDocumentPosition(rightPanel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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
