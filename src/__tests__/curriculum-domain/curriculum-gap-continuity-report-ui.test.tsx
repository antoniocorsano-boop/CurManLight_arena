import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { CurriculumGapContinuityReport } from '../../domain/curriculum/curriculumGapContinuityReport';
import { CurriculumGapContinuityReportView } from '../../features/curriculum/components/CurriculumGapContinuityReportView';

const scope = {
  schoolOrder: 'primaria' as const,
  disciplineCode: 'italiano' as const,
  normativeCheckpoint: 'end-primary' as const,
  leftSourceAreaCode: 'area-2012',
  rightSourceAreaCode: 'area-2025',
};

const report: CurriculumGapContinuityReport = {
  scope,
  findings: [
    {
      type: 'candidate-continuity',
      frameworks: ['IN2012', 'IN2025'],
      references: { leftNodeId: 'left-1', rightNodeId: 'right-1' },
      relationKind: 'possible-continuity',
      evidence: [{ kind: 'same-discipline', disciplineCode: 'italiano' }],
      confidence: 'high',
      provenance: { sources: ['R4B'], method: 'deterministic' },
      scope,
    },
    {
      type: 'gap-2025-without-candidate',
      frameworks: ['IN2025'],
      references: { rightNodeId: 'right-new' },
      evidence: [],
      provenance: { sources: ['R4A', 'R4B'], method: 'deterministic' },
      scope,
    },
    {
      type: 'gap-2012-without-candidate',
      frameworks: ['IN2012'],
      references: { leftNodeId: 'left-old' },
      evidence: [],
      provenance: { sources: ['R4A', 'R4B'], method: 'deterministic' },
      scope,
    },
    {
      type: 'structural-fact',
      category: 'checkpoint-difference',
      frameworks: ['IN2025'],
      references: { rightAreaCode: 'area-2025' },
      evidence: [{ kind: 'checkpoint-only-right', description: 'checkpoint differs' }],
      provenance: { sources: ['R4A'], method: 'deterministic' },
      scope,
    },
    {
      type: 'structural-fact',
      category: 'nodeType-difference',
      frameworks: ['IN2012'],
      references: { leftAreaCode: 'area-2012' },
      evidence: [{ kind: 'node-type-only-left', description: 'node type differs' }],
      provenance: { sources: ['R4A'], method: 'deterministic' },
      scope,
    },
    {
      type: 'structural-fact',
      category: 'conditional-applicability',
      frameworks: ['IN2012', 'IN2025'],
      references: { leftAreaCode: 'area-2012', rightAreaCode: 'area-2025' },
      evidence: [{ kind: 'applicability-difference', description: 'conditional applicability' }],
      provenance: { sources: ['R4A'], method: 'deterministic' },
      scope,
    },
    {
      type: 'unresolved-structural-case',
      category: 'split',
      frameworks: ['IN2012', 'IN2025'],
      references: { leftNodeId: 'left-split', rightNodeIds: ['right-a', 'right-b'] },
      evidence: [],
      provenance: { sources: ['R4B'], method: 'deterministic' },
      scope,
    },
  ],
};

describe('CURR-R4D-B report UI', () => {
  it('renders aggregate sections and sourced finding details from the R4D-A report', () => {
    render(<CurriculumGapContinuityReportView report={report} />);

    expect(screen.getByRole('heading', { name: 'Gap / Continuity Report' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Continuità candidate' })).toHaveTextContent('1');
    expect(screen.getByRole('region', { name: 'Nuovi elementi 2025' })).toHaveTextContent('right-new');
    expect(screen.getByRole('region', { name: 'Elementi 2012 senza candidato' })).toHaveTextContent('left-old');
    expect(screen.getByRole('region', { name: 'Differenze strutturali' })).toHaveTextContent('checkpoint');
    expect(screen.getByRole('region', { name: 'Applicabilità condizionale' })).toHaveTextContent('conditional applicability');
    expect(screen.getByRole('region', { name: 'Casi split/merge da esaminare' })).toHaveTextContent('split');
    expect(screen.getByText('confidence: high')).toBeInTheDocument();
    expect(screen.getAllByText('provenienza: R4B').length).toBeGreaterThan(0);
  });

  it('shows a neutral empty state for every aggregate section without findings', () => {
    render(<CurriculumGapContinuityReportView report={{ scope: {}, findings: [] }} />);

    expect(screen.getAllByText('Nessun finding per questo scope.')).toHaveLength(6);
  });

  it('exposes the deterministic serialized artifact without decision controls', () => {
    render(<CurriculumGapContinuityReportView report={report} />);

    expect(screen.getByRole('button', { name: 'Mostra artefatto JSON' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /approva|salva|accetta|equivalenza|crea link/i })).not.toBeInTheDocument();
  });

  it('keeps the report readable on narrow layouts', () => {
    const { container } = render(<CurriculumGapContinuityReportView report={report} />);

    expect(container.firstElementChild?.className).toMatch(/space-y/);
    expect(screen.getByRole('region', { name: 'Continuità candidate' })).toBeVisible();
  });
  it('filters aggregate findings deterministically by accessible section control', () => {
    render(<CurriculumGapContinuityReportView report={report} />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Filtra per sezione' }), {
      target: { value: 'gap-2025-without-candidate' },
    });

    expect(screen.getByRole('region', { name: 'Nuovi elementi 2025' })).toHaveTextContent('right-new');
    expect(screen.queryByRole('region', { name: /Continuit/ })).not.toBeInTheDocument();
    expect(screen.queryByText('left-old')).not.toBeInTheDocument();
  });

  it('shows a neutral empty state when the selected finding kind has no results', () => {
    render(<CurriculumGapContinuityReportView report={{ scope: {}, findings: [] }} />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Filtra per sezione' }), {
      target: { value: 'structural-fact' },
    });

    expect(screen.getByText('Nessun finding per il filtro selezionato.')).toBeInTheDocument();
    expect(screen.queryByText('Nessun finding per questo scope.')).not.toBeInTheDocument();
  });
});
