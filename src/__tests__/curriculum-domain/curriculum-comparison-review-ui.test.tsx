import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createNationalCurriculumComparisonService } from '../../domain/curriculum/nationalCurriculumComparison';
import { createSemanticMappingCandidateService } from '../../domain/curriculum/nationalCurriculumSemanticCandidates';
import {
  buildComparisonReviewModel,
  createReviewScope,
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

function renderReview(initialScope = primaryItalianScope) {
  return render(
    <CurriculumComparisonReviewView
      comparisonService={comparisonService}
      candidateService={candidateService}
      initialScope={initialScope}
    />,
  );
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

    expect(first.left?.text).toBeTruthy();
    expect(screen.queryByText(first.left!.text)).toBeInTheDocument();
    expect(screen.queryByText(first.right!.text)).toBeInTheDocument();

    const candidateButton = screen.getByRole('button', { name: new RegExp(first.left!.text.slice(0, 24)) });
    fireEvent.click(candidateButton);

    expect(screen.getByText(first.left!.text)).toBeInTheDocument();
    expect(screen.getByText(first.right!.text)).toBeInTheDocument();
  });

  it('does not auto-select or rank candidates by confidence', () => {
    renderReview();

    expect(screen.getByText(/seleziona un candidato/i)).toBeInTheDocument();
    expect(screen.queryByText(/ordinati per confidenza|ranking|classifica/i)).not.toBeInTheDocument();
  });

  it('resets the inspector selection when the review scope changes', () => {
    renderReview();
    const first = primaryItalianModel.candidates[0];
    const candidateButton = screen.getByRole('button', { name: new RegExp(first.left!.text.slice(0, 24)) });
    fireEvent.click(candidateButton);
    expect(screen.getByText(first.right!.text)).toBeInTheDocument();

    const orderSelect = screen.getByRole('combobox', { name: /ordine/i });
    fireEvent.change(orderSelect, { target: { value: 'secondaria' } });

    expect(screen.getByText(/seleziona un candidato/i)).toBeInTheDocument();
  });

  it('highlights joined endpoints by node identity without exposing nodeId as content', () => {
    renderReview();
    const first = primaryItalianModel.candidates[0];
    const candidateButton = screen.getByRole('button', { name: new RegExp(first.left!.text.slice(0, 24)) });

    fireEvent.click(candidateButton);

    expect(candidateButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText(first.candidate.left.nodeId!)).not.toBeInTheDocument();
    expect(screen.queryByText(first.candidate.right.nodeId!)).not.toBeInTheDocument();
    expect(screen.getByText(first.left!.text)).toBeInTheDocument();
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

  it('exposes responsive labels and accessible controls', () => {
    renderReview();

    expect(screen.getByRole('combobox', { name: /ordine/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /disciplina|area/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /ispettore|inspector/i })).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: /ispettore|inspector/i })).getByText(/candidati semantici/i)).toBeInTheDocument();
  });

  it('does not expose approval, persistence, or CurriculumLink actions', () => {
    renderReview();

    expect(screen.queryByRole('button', { name: /approva/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /salva relazione/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /accetta mapping/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /crea link|curriculumlink/i })).not.toBeInTheDocument();
  });
});
