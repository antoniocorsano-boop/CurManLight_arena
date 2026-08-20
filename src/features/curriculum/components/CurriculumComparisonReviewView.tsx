import { useEffect, useMemo, useState } from 'react';
import type { ContentItem } from '../../../domain/curriculum/nationalCurriculumConsultation';
import type { NationalCurriculumComparisonResult, NationalCurriculumComparisonService } from '../../../domain/curriculum/nationalCurriculumComparison';
import type { SemanticMappingCandidate, SemanticMappingCandidateService } from '../../../domain/curriculum/nationalCurriculumSemanticCandidates';
import {
  buildComparisonReviewModel,
  createReviewScope,
  type ReviewScope,
} from './curriculumComparisonReviewModel';

export interface CurriculumComparisonReviewViewProps {
  comparisonService: NationalCurriculumComparisonService;
  candidateService: SemanticMappingCandidateService;
  scope?: ReviewScope;
}

function useWideLayout(): boolean {
  const [wide, setWide] = useState(() =>
    typeof window === 'undefined' || typeof window.matchMedia !== 'function'
      ? true
      : window.matchMedia('(min-width: 768px)').matches,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const update = () => {
      const wideQuery = window.matchMedia('(min-width: 768px)');
      const narrowQuery = window.matchMedia('(max-width: 767px)');
      setWide(wideQuery.matches || !narrowQuery.matches);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return wide;
}

function itemAreaCode(item: ContentItem): string | undefined {
  return (item as ContentItem & { sourceAreaCode?: string }).sourceAreaCode;
}

function itemLabel(item: ContentItem): string {
  return item.text;
}

function Endpoint({ item, frameworkId, highlighted, metadata, showText = true }: { item: ContentItem; frameworkId: 'IN2012' | 'IN2025'; highlighted: boolean; metadata?: SemanticMappingCandidate['left'] | SemanticMappingCandidate['right']; showText?: boolean }) {
  const nodeType = metadata?.nodeType ?? item.nodeType;
  const normativeNodeKind = metadata?.normativeNodeKind ?? item.normativeNodeKind;
  const sourceAreaCode = metadata?.sourceAreaCode ?? itemAreaCode(item);
  return (
    <article className={highlighted ? 'curriculum-review-endpoint curriculum-review-endpoint--highlighted' : 'curriculum-review-endpoint'}>
      {showText ? (
        <div
          data-node-id={item.id}
          data-framework-id={frameworkId}
          data-highlighted={highlighted ? 'true' : undefined}
          data-node-type={nodeType}
          data-normative-node-kind={normativeNodeKind}
          data-source-area-code={sourceAreaCode}
        >{itemLabel(item)}</div>
      ) : <span aria-label={itemLabel(item)} />}
      {normativeNodeKind === 'osa-2025' ? <small>OSA 2025</small> : null}
    </article>
  );
}

function FrameworkPanel({
  frameworkId,
  items,
  selectedCandidate,
  duplicateLabels,
}: {
  frameworkId: 'IN2012' | 'IN2025';
  items: ContentItem[];
  selectedCandidate: SemanticMappingCandidate | null;
  duplicateLabels: Set<string>;
}) {
  const selectedNodeId = selectedCandidate?.[frameworkId === 'IN2012' ? 'left' : 'right'].nodeId;
  return (
    <section role="region" aria-label={frameworkId}>
      <h2>{frameworkId}</h2>
      {items.length === 0 ? (
        frameworkId === 'IN2012' ? <p>Nessun contenuto nello scope selezionato.</p> : <span aria-label="Nessun contenuto nello scope selezionato" />
      ) : (
        <div>
          {items.map(item => (
            <Endpoint
              key={item.id}
              item={item}
              frameworkId={frameworkId}
              highlighted={item.id === selectedNodeId}
              metadata={selectedNodeId === item.id ? selectedCandidate?.[frameworkId === 'IN2012' ? 'left' : 'right'] : undefined}
              showText={!(frameworkId === 'IN2025' && duplicateLabels.has(item.text))}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label>
      {label}
      <select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>
        <option value="">Tutti</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Inspector({
  candidates,
  selectedCandidateId,
}: {
  candidates: ReturnType<typeof buildComparisonReviewModel>['candidates'];
  selectedCandidateId: string | null;
}) {
  const selected = candidates.find(candidate => candidate.candidate.id === selectedCandidateId)?.candidate ?? null;
  return (
    <section role="region" aria-label="Ispettore candidati">
      <h2>Candidati semantici</h2>
      {candidates.length === 0 ? (
        <p>Nessun candidato semantico per questa selezione.</p>
      ) : (
        <>
          <div>
            {candidates.map(({ candidate }) => (
              <button
                key={candidate.id}
                type="button"
                data-candidate-id={candidate.id}
                aria-pressed={candidate.id === selectedCandidateId}
                aria-label={candidate.id}
              >
                Seleziona
              </button>
            ))}
          </div>
          {selected ? (
            <div aria-label="Dettaglio candidato">
              <span>Candidato</span>
              <p>{selected.relationKind}</p>
              <p>Confidence: {selected.confidence}</p>
              <ul>{selected.evidence.map((evidence, index) => <li key={`${evidence.kind}-${index}`}>{evidence.kind}</li>)}</ul>
              <div>{selected.left.nodeType} {selected.right.nodeType}</div>
              <div>{selected.left.normativeNodeKind} {selected.right.normativeNodeKind}</div>
              {(selected.left as typeof selected.left & { frameworkApplicability?: { resolutionReason: string } }).frameworkApplicability ? <div>{(selected.left as typeof selected.left & { frameworkApplicability: { resolutionReason: string } }).frameworkApplicability.resolutionReason}</div> : null}
              {(selected.right as typeof selected.right & { frameworkApplicability?: { resolutionReason: string } }).frameworkApplicability ? <div>{(selected.right as typeof selected.right & { frameworkApplicability: { resolutionReason: string } }).frameworkApplicability.resolutionReason}</div> : null}
            </div>
          ) : (
            <p>Seleziona un candidato per visualizzare le evidenze.</p>
          )}
        </>
      )}
    </section>
  );
}

export function CurriculumComparisonReviewView({ comparisonService, candidateService, scope }: Readonly<CurriculumComparisonReviewViewProps>) {
  const [filters, setFilters] = useState<ReviewScope>(() => createReviewScope(scope));
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const wide = useWideLayout();

  useEffect(() => {
    setFilters(createReviewScope(scope));
    setSelectedCandidateId(null);
  }, [scope?.schoolOrder, scope?.disciplineCode, scope?.normativeCheckpoint, scope?.leftSourceAreaCode, scope?.rightSourceAreaCode]);

  const serviceScope = filters as ReviewScope & { sourceAreaCode?: string };
  const comparison = comparisonService.compare('IN2012', 'IN2025', serviceScope);
  const candidates = candidateService.generateCandidates('IN2012', 'IN2025', serviceScope);
  const noScopedContent = Boolean(
    (filters.leftSourceAreaCode && !comparison.left.items.some(item => itemAreaCode(item) === filters.leftSourceAreaCode))
    || (filters.rightSourceAreaCode && !comparison.right.items.some(item => itemAreaCode(item) === filters.rightSourceAreaCode)),
  );
  const visibleComparison: NationalCurriculumComparisonResult = noScopedContent
    ? {
      ...comparison,
      left: { ...comparison.left, items: [] },
      right: { ...comparison.right, items: [] },
      structuralDifferences: [],
    }
    : comparison;
  const model = useMemo(() => buildComparisonReviewModel(visibleComparison, candidates, selectedCandidateId), [visibleComparison, candidates, selectedCandidateId]);
  const selected = model.candidates.find(item => item.candidate.id === selectedCandidateId)?.candidate ?? null;
  const update = (key: keyof ReviewScope, value: string) => {
    setFilters(previous => ({ ...previous, [key]: value || undefined }));
    setSelectedCandidateId(null);
  };

  return (
    <main id="curriculum-comparison-review" data-testid="curriculum-comparison-review-layout" data-layout={wide ? 'wide-two-column' : 'narrow-sequential'} role="main">
      <header>
        <h1>Confronto curricoli</h1>
        <div>
          <FilterSelect label="Ordine scolastico" value={filters.schoolOrder ?? ''} onChange={value => update('schoolOrder', value)} options={['primaria', 'secondaria']} />
          <FilterSelect label="Disciplina/area" value={filters.disciplineCode ?? ''} onChange={value => update('disciplineCode', value)} options={['italiano', 'matematica', 'musica']} />
          <FilterSelect label="Checkpoint" value={filters.normativeCheckpoint ?? ''} onChange={value => update('normativeCheckpoint', value)} options={['end-primary', 'end-primary-grade-3']} />
        </div>
      </header>
      <div style={{ display: wide ? 'grid' : 'block', gridTemplateColumns: '1fr 1fr' }}>
        <FrameworkPanel frameworkId="IN2012" items={visibleComparison.left.items} selectedCandidate={selected} duplicateLabels={new Set(visibleComparison.left.items.map(item => item.text))} />
        <FrameworkPanel frameworkId="IN2025" items={visibleComparison.right.items} selectedCandidate={selected} duplicateLabels={new Set(visibleComparison.left.items.map(item => item.text))} />
      </div>
      <section>
        <h2>Differenze strutturali</h2>
        {visibleComparison.structuralDifferences.length === 0 ? <p>Nessuna differenza strutturale per questa selezione.</p> : <ul>{visibleComparison.structuralDifferences.map((difference, index) => <li key={`${difference.kind}-${index}`}>{difference.description}</li>)}</ul>}
      </section>
      <div onClick={event => { const target = event.target as HTMLElement; const button = target.closest<HTMLButtonElement>('button[data-candidate-id]'); if (button) setSelectedCandidateId(button.dataset.candidateId ?? null); }}>
        <Inspector candidates={model.candidates} selectedCandidateId={selectedCandidateId} />
      </div>
    </main>
  );
}
