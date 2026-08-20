import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createEntityReference } from '../../domain/curriculum/identity';
import type { InstituteCurriculumVersion } from '../../domain/curriculum/version';
import {
  addProposal,
  createEmptyRevisionArchive,
  recordDecision,
  transitionProposalStatus,
  type InstitutionalDecisionQualification,
  type RevisionArchive,
} from '../../domain/revision';
import { InstitutionalRevisionWorkflowPanel } from '../../features/curriculum/components/InstitutionalRevisionWorkflowPanel';
import { RevisioneTab } from '../../features/curriculum/components/RevisioneTab';
import { useCurriculumStore } from '../../store/useCurriculumStore';

const ref = (id: string, entityType: string) => createEntityReference(id as never, entityType as never);

function makeArchive(options: {
  proposal?: boolean;
  proposalStatus?: 'under-review' | 'accepted-for-decision';
  decision?: boolean;
  decisionStatus?: 'recorded-local';
} = {}): RevisionArchive {
  let archive = createEmptyRevisionArchive('2026-08-20T00:00:00.000Z');
  if (!options.proposal) return archive;
  const created = addProposal(archive, {
    targetNodeRef: ref('node-1', 'curriculum-node'),
    curriculumVersionRef: ref('version-1', 'curriculum-version'),
    currentTextSnapshot: 'Testo vigente',
    proposedText: 'Testo proposto',
    rationale: 'Motivazione verificabile',
  }, '2026-08-20T00:00:00.000Z');
  if (!created.success) throw new Error('fixture proposal failed');
  archive = created.archive;
  if (options.proposalStatus) {
    const path = options.proposalStatus === 'under-review'
      ? ['ready-for-review', 'submitted', 'under-review'] as const
      : ['ready-for-review', 'submitted', 'under-review', 'accepted-for-decision'] as const;
    for (const status of path) {
      const transitioned = transitionProposalStatus(archive, created.proposal.id, status, undefined, 'fixture');
      if (!transitioned.success) throw new Error('fixture transition failed');
      archive = transitioned.archive;
    }
  }
  if (!options.decision) return archive;
  const decision = recordDecision(archive, {
    proposalRef: ref(created.proposal.id, 'revision-proposal'),
    proposalVersionRef: ref(created.version.id, 'revision-proposal-version'),
    outcome: 'approve',
    authority: { declaredRole: 'dipartimento' },
    rationale: 'Decisione locale registrata',
  }, '2026-08-20T00:00:00.000Z');
  if (!decision.success) throw new Error('fixture decision failed');
  archive = {
    ...decision.archive,
    decisions: decision.archive.decisions.map(value => ({ ...value, status: options.decisionStatus ?? 'recorded-local' })),
  };
  return archive;
}

function makeVersion(status: InstituteCurriculumVersion['status'], overrides: Partial<InstituteCurriculumVersion> = {}): InstituteCurriculumVersion {
  return {
    id: 'version-2',
    institutionId: 'institute-1',
    title: 'Curricolo 2.0',
    versionNumber: '2.0',
    status,
    previousVersionId: 'version-1',
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z',
    ...overrides,
  };
}

const qualification = (archive: RevisionArchive, status: InstitutionalDecisionQualification['status']): InstitutionalDecisionQualification => ({
  decisionRef: ref(archive.decisions[0]?.id ?? 'decision-1', 'decision'),
  authorityRef: ref('authority-1', 'institutional-authority'),
  status,
  validationRef: ref('validation-1', 'institutional-validation'),
  validatedAt: '2026-08-20',
});

describe('CURR-R5-D institutional revision workflow UI', () => {
  it('shows the canonical sequence and neutral empty state without proposals', () => {
    render(<InstitutionalRevisionWorkflowPanel revisionArchive={makeArchive()} versions={[]} />);
    expect(screen.getByRole('heading', { name: 'Workflow revisionale istituzionale' })).toBeInTheDocument();
    expect(screen.getByText('Proposta')).toBeInTheDocument();
    expect(screen.getByText('Revisione')).toBeInTheDocument();
    expect(screen.getByText('Decisione registrata')).toBeInTheDocument();
    expect(screen.getByText('Qualificazione istituzionale')).toBeInTheDocument();
    expect(screen.getByText('Nuova versione')).toBeInTheDocument();
    expect(screen.getByText('Entrata in vigore')).toBeInTheDocument();
    expect(screen.getByText('Nessuna proposta nel registro revisionale.')).toBeInTheDocument();
  });

  it('renders review and recorded-local states without calling them institutional qualification', () => {
    const archive = makeArchive({ proposal: true, proposalStatus: 'under-review', decision: true });
    render(<InstitutionalRevisionWorkflowPanel revisionArchive={archive} versions={[]} />);
    expect(screen.getAllByText('In revisione')).not.toHaveLength(0);
    expect(screen.getByText('Decisione locale registrata')).toBeInTheDocument();
    expect(screen.getByText(/Non qualificata istituzionalmente/)).toBeInTheDocument();
    expect(screen.queryByText('Decisione istituzionale qualificata')).not.toBeInTheDocument();
  });

  it.each([
    ['unverified', 'Qualificazione non verificata: preparazione della nuova versione bloccata.'],
    ['rejected', 'Qualificazione rifiutata: preparazione della nuova versione bloccata.'],
  ] as const)('shows a fail-closed block for qualification %s', (status, message) => {
    const archive = makeArchive({ proposal: true, proposalStatus: 'accepted-for-decision', decision: true });
    render(<InstitutionalRevisionWorkflowPanel revisionArchive={archive} qualification={qualification(archive, status)} versions={[]} />);
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /qualifica|approva|crea versione/i })).not.toBeInTheDocument();
  });

  it('shows qualified preparation, non-effective version, and missing or invalid effective period as distinct states', () => {
    const archive = makeArchive({ proposal: true, proposalStatus: 'accepted-for-decision', decision: true });
    const { rerender } = render(<InstitutionalRevisionWorkflowPanel revisionArchive={archive} qualification={qualification(archive, 'qualified')} versions={[makeVersion('draft')]} />);
    expect(screen.getByText('Decisione istituzionale qualificata')).toBeInTheDocument();
    expect(screen.getByText('Versione preparata in bozza')).toBeInTheDocument();
    expect(screen.getByText('Non effettiva: manca un periodo di efficacia valido.')).toBeInTheDocument();

    rerender(<InstitutionalRevisionWorkflowPanel revisionArchive={archive} qualification={qualification(archive, 'qualified')} versions={[makeVersion('approved', { effectiveFrom: '2026-08-20', effectiveTo: '2026-07-01' })]} />);
    expect(screen.getByText('Periodo di efficacia non valido.')).toBeInTheDocument();
  });

  it('keeps the panel responsive and exposes no qualification or persistence action', () => {
    const archive = makeArchive({ proposal: true, proposalStatus: 'under-review' });
    render(<InstitutionalRevisionWorkflowPanel revisionArchive={archive} versions={[]} />);
    const panel = screen.getByRole('region', { name: 'Workflow revisionale istituzionale' });
    expect(panel).toHaveAttribute('data-responsive', 'stack-on-narrow');
    expect(panel).toHaveTextContent('Stato informativo del registro locale');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/firma|protocollo|autenticazione|CurriculumLink/i)).not.toBeInTheDocument();
  });

  it('passes real curriculum versions through the RevisioneTab integration and keeps qualification missing', () => {
    const archive = makeArchive({ proposal: true, proposalStatus: 'accepted-for-decision', decision: true });
    useCurriculumStore.setState({ revisionArchive: archive });

    render(
      <RevisioneTab
        currentDisciplineProps={[]}
        currentDisciplineDecided={0}
        revisioneMode="list"
        setRevisioneMode={() => undefined}
        revisioneWizardIndex={0}
        setRevisioneWizardIndex={() => undefined}
        curriculumVersions={[makeVersion('draft')]}
      />,
    );

    expect(screen.getByText('Versione preparata in bozza')).toBeInTheDocument();
    expect(screen.getByText('Non qualificata istituzionalmente: preparazione della nuova versione bloccata.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /qualifica|approva|crea versione/i })).not.toBeInTheDocument();
  });
});
