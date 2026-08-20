import { useMemo, useState } from 'react';
import type {
  CurriculumGapContinuityFinding,
  CurriculumGapContinuityReport,
  StructuralFactFinding,
} from '../../../domain/curriculum/curriculumGapContinuityReport';
import { serializeCurriculumGapContinuityReport } from '../../../domain/curriculum/curriculumGapContinuityReportExport';

export interface CurriculumGapContinuityReportViewProps {
  report: CurriculumGapContinuityReport;
}

type ReportSection = {
  label: string;
  filter: ReportFilter;
  findings: CurriculumGapContinuityFinding[];
};

type ReportFilter =
  | 'all'
  | 'candidate-continuity'
  | 'gap-2025-without-candidate'
  | 'gap-2012-without-candidate'
  | 'structural-fact'
  | 'conditional-applicability'
  | 'unresolved-structural-case';

function evidenceLabel(evidence: unknown): string {
  if (typeof evidence !== 'object' || evidence === null) return String(evidence);
  const value = evidence as { kind?: string; description?: string };
  return value.description ? `${value.kind ?? 'evidenza'}: ${value.description}` : value.kind ?? 'evidenza';
}

function findingReference(finding: CurriculumGapContinuityFinding): string {
  const references = finding.references;
  return Object.entries(references)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join(' · ');
}

function sectionsFor(report: CurriculumGapContinuityReport): ReportSection[] {
  const structuralFacts = report.findings.filter((finding): finding is StructuralFactFinding => finding.type === 'structural-fact');
  return [
    {
      label: 'Continuità candidate',
      filter: 'candidate-continuity',
      findings: report.findings.filter(finding => finding.type === 'candidate-continuity'),
    },
    {
      label: 'Nuovi elementi 2025',
      filter: 'gap-2025-without-candidate',
      findings: report.findings.filter(finding => finding.type === 'gap-2025-without-candidate'),
    },
    {
      label: 'Elementi 2012 senza candidato',
      filter: 'gap-2012-without-candidate',
      findings: report.findings.filter(finding => finding.type === 'gap-2012-without-candidate'),
    },
    {
      label: 'Differenze strutturali',
      filter: 'structural-fact',
      findings: structuralFacts.filter(finding => finding.category !== 'conditional-applicability'),
    },
    {
      label: 'Applicabilità condizionale',
      filter: 'conditional-applicability',
      findings: structuralFacts.filter(finding => finding.category === 'conditional-applicability'),
    },
    {
      label: 'Casi split/merge da esaminare',
      filter: 'unresolved-structural-case',
      findings: report.findings.filter(finding => finding.type === 'unresolved-structural-case'),
    },
  ];
}

function FindingCard({ finding }: { finding: CurriculumGapContinuityFinding }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wide text-slate-700">
        <span>{finding.type}</span>
        {'category' in finding ? <span className="rounded bg-slate-100 px-2 py-0.5">{finding.category}</span> : null}
        {'relationKind' in finding ? <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-800">{finding.relationKind}</span> : null}
      </div>
      <p className="text-xs text-slate-700 break-words">{findingReference(finding) || 'Riferimento non disponibile'}</p>
      {'confidence' in finding && finding.confidence ? <p className="text-xs text-slate-600">confidence: {finding.confidence}</p> : null}
      <p className="text-xs text-slate-600">provenienza: {finding.provenance.sources.join(', ')}</p>
      {finding.evidence.length > 0 ? (
        <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
          {finding.evidence.map((evidence, index) => <li key={`${finding.type}-${index}`}>{evidenceLabel(evidence)}</li>)}
        </ul>
      ) : <p className="text-xs text-slate-500">Nessuna evidenza associata.</p>}
    </article>
  );
}

function ReportSectionView({ section }: { section: ReportSection }) {
  return (
    <section role="region" aria-label={section.label} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-slate-800">{section.label}</h2>
        <span aria-label={`Conteggio ${section.label}`} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{section.findings.length}</span>
      </div>
      {section.findings.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500">Nessun finding per questo scope.</p>
      ) : (
        <div className="space-y-2">{section.findings.map((finding, index) => <FindingCard key={`${finding.type}-${index}`} finding={finding} />)}</div>
      )}
    </section>
  );
}

export function CurriculumGapContinuityReportView({ report }: Readonly<CurriculumGapContinuityReportViewProps>) {
  const [showArtifact, setShowArtifact] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ReportFilter>('all');
  const sections = useMemo(() => sectionsFor(report), [report]);
  const artifact = useMemo(() => serializeCurriculumGapContinuityReport(report), [report]);
  const visibleSections = selectedFilter === 'all'
    ? sections
    : sections.filter(section => section.filter === selectedFilter);
  const filteredFindingCount = visibleSections.reduce((count, section) => count + section.findings.length, 0);

  return (
    <main className="space-y-5 text-left" data-testid="curriculum-gap-continuity-report">
      <header className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-black text-slate-900">Gap / Continuity Report</h1>
            <p className="text-xs text-slate-600">Sintesi read-only derivata dal report R4D-A.</p>
          </div>
          <button type="button" onClick={() => setShowArtifact(value => !value)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">
            Mostra artefatto JSON
          </button>
        </div>
        <p className="text-xs text-slate-600" aria-label="Scope report">Scope: {JSON.stringify(report.scope)}</p>
      </header>
      {showArtifact ? <pre aria-label="Artefatto JSON report" className="max-h-80 overflow-auto rounded-xl bg-slate-950 p-3 text-[11px] text-slate-100">{artifact}</pre> : null}
      <div className="space-y-3">
        <label className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
          <span>Filtra per sezione</span>
          <select
            aria-label="Filtra per sezione"
            value={selectedFilter}
            onChange={event => setSelectedFilter(event.target.value as ReportFilter)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-normal"
          >
            <option value="all">Tutte</option>
            <option value="candidate-continuity">Continuità candidate</option>
            <option value="gap-2025-without-candidate">Nuovi elementi 2025</option>
            <option value="gap-2012-without-candidate">Elementi 2012 senza candidato</option>
            <option value="structural-fact">Differenze strutturali</option>
            <option value="conditional-applicability">Applicabilità condizionale</option>
            <option value="unresolved-structural-case">Casi split/merge da esaminare</option>
          </select>
        </label>
        {selectedFilter !== 'all' && filteredFindingCount === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500">
            Nessun finding per il filtro selezionato.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {visibleSections.map(section => <ReportSectionView key={section.label} section={section} />)}
          </div>
        )}
      </div>
    </main>
  );
}
