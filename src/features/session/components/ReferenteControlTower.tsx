import { AlertCircle, ArrowRight, BookOpenCheck, Layers, ShieldCheck } from 'lucide-react';
import { deriveReferenteControlTowerSnapshot } from '../../../domain/institution/referenteControlTower';
import { getCurriculumBaseline } from '../../../lib';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type { CustomKbDoc } from '../../documents/lib/localKnowledgeStore';

interface ReferenteControlTowerProps {
  sources: readonly CustomKbDoc[];
  onOpenSources: () => void;
  onOpenRevision: () => void;
}

interface MetricCardProps {
  label: string;
  value: number | string;
  note: string;
}

function MetricCard({ label, value, note }: MetricCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3" data-referente-metric={label}>
      <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>
      <strong className="mt-1 block text-2xl font-black text-slate-900">{value}</strong>
      <p className="mt-1 text-xs leading-5 text-slate-600">{note}</p>
    </article>
  );
}

export function ReferenteControlTower({ sources, onOpenSources, onOpenRevision }: ReferenteControlTowerProps) {
  const revisionArchive = useCurriculumStore((state) => state.revisionArchive);
  const snapshot = deriveReferenteControlTowerSnapshot(sources, revisionArchive, null, getCurriculumBaseline());
  const decisionReadinessValue = snapshot.proposalReadyForDecision ?? '—';
  const decisionReadinessNote = snapshot.decisionReceiptCoverageAvailable
    ? `${snapshot.decisionsRecordedLocal} decisioni locali registrate`
    : 'Da verificare nel workspace: le ricevute istituzionali non sono state lette da questa vista.';

  return (
    <section
      className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 sm:p-5"
      aria-labelledby="referente-control-tower-title"
      data-referente-control-tower="process-readiness"
      data-discipline-coverage={snapshot.disciplineCoverageAvailable ? 'available' : 'unavailable'}
      data-decision-receipt-coverage={snapshot.decisionReceiptCoverageAvailable ? 'available' : 'unavailable'}
    >
      <div className="flex items-start gap-3">
        <Layers className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-black uppercase tracking-wide text-indigo-700">Cabina di regia</span>
          <h2 id="referente-control-tower-title" className="mt-1 text-base font-extrabold text-slate-900">Readiness del processo curricolare</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Una vista sintetica dei registri che Arena possiede davvero adesso. Nessuna percentuale viene stimata da titoli, testo libero o IA.</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <MetricCard label="Fonti da verificare" value={snapshot.sourcePendingVerification} note={`${snapshot.sourceTotal} fonti locali registrate`} />
        <MetricCard label="Evidenze locali" value={snapshot.sourceLocalEvidence} note="Fonti locali già ammesse al retrieval come evidenza" />
        <MetricCard label="Proposte in revisione" value={snapshot.proposalInReview} note={`${snapshot.proposalActive} proposte attive nell’archivio`} />
        <MetricCard label="Pronte per decisione" value={decisionReadinessValue} note={decisionReadinessNote} />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {snapshot.sourcePendingVerification > 0 && (
          <button type="button" onClick={onOpenSources} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-600">
            <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
            Controlla le fonti
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {(snapshot.proposalInReview > 0 || snapshot.proposalAcceptedForDecision > 0) && (
          <button type="button" onClick={onOpenRevision} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-800 hover:bg-indigo-50">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Apri le revisioni
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {!snapshot.decisionReceiptCoverageAvailable && snapshot.proposalAcceptedForDecision > 0 && (
        <div className="mt-3 flex gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700" data-referente-decision-readiness-limit>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p><strong>Readiness decisionale non confermata.</strong> Una proposta può avere già una ricevuta istituzionale terminale nel workspace anche se il suo stato locale resta <code>accepted-for-decision</code>.</p>
        </div>
      )}

      {snapshot.disciplineCoverageAvailable ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3" data-referente-discipline-coverage>
          <strong className="block text-xs font-extrabold text-slate-900">Copertura strutturale per disciplina e ordine</strong>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetricCard label="Ambiti" value={snapshot.curriculumTargetTotal ?? '—'} note="Target canonici analizzati" />
            <MetricCard label="Coperti" value={snapshot.curriculumCoverageTargets ?? '—'} note="Traguardi e obiettivi presenti" />
            <MetricCard label="Lacune" value={snapshot.curriculumGapTargets ?? '—'} note="Contenuto strutturale assente" />
            <MetricCard label="Da riesaminare" value={(snapshot.curriculumDiscontinuityTargets ?? 0) + (snapshot.curriculumOverlapTargets ?? 0)} note="Parzialità o sovrapposizioni" />
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">{snapshot.scopeNote}</p>
        </div>
      ) : (
        <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950" data-referente-scope-limit>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <strong className="block">Copertura per disciplina: non calcolabile</strong>
            <p className="mt-1">{snapshot.scopeNote}</p>
          </div>
        </div>
      )}
    </section>
  );
}