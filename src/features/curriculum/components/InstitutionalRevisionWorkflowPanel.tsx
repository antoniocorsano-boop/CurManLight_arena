import { CheckCircle2, CircleAlert, GitBranch, Milestone } from 'lucide-react';
import type { InstituteCurriculumVersion } from '../../../domain/curriculum/version';
import type {
  InstitutionalDecisionQualification,
  RevisionArchive,
  RevisionProposalStatus,
} from '../../../domain/revision';
import { validateInstitutionalDecisionQualification } from '../../../domain/revision';

export interface InstitutionalRevisionWorkflowPanelProps {
  revisionArchive: RevisionArchive;
  qualification?: InstitutionalDecisionQualification;
  versions: InstituteCurriculumVersion[];
}

const proposalLabels: Record<RevisionProposalStatus, string> = {
  draft: 'Bozza',
  'ready-for-review': 'Pronta per revisione',
  submitted: 'Inviata',
  'under-review': 'In revisione',
  'changes-requested': 'Modifiche richieste',
  withdrawn: 'Ritirata',
  'accepted-for-decision': 'Ammessa alla decisione',
  rejected: 'Respinta',
  archived: 'Archiviata',
  legacy: 'Storica',
};

function isCanonicalDate(value: string | undefined): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function hasValidEffectivePeriod(version: InstituteCurriculumVersion): boolean {
  if (!isCanonicalDate(version.effectiveFrom)) return false;
  if (!version.effectiveTo) return true;
  return isCanonicalDate(version.effectiveTo) && version.effectiveFrom! < version.effectiveTo;
}

function Step({ title, detail, state }: { title: string; detail: string; state: 'complete' | 'blocked' | 'pending' }) {
  const Icon = state === 'complete' ? CheckCircle2 : state === 'blocked' ? CircleAlert : Milestone;
  const tone = state === 'complete' ? 'border-emerald-200 bg-emerald-50' : state === 'blocked' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50';
  const iconTone = state === 'complete' ? 'text-emerald-600' : state === 'blocked' ? 'text-amber-600' : 'text-slate-400';
  return (
    <li className={`min-w-0 rounded-lg border p-3 ${tone}`}>
      <div className="flex items-start gap-2">
        <Icon aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${iconTone}`} />
        <div className="min-w-0">
          <h3 className="text-xs font-extrabold text-slate-800">{title}</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{detail}</p>
        </div>
      </div>
    </li>
  );
}

export function InstitutionalRevisionWorkflowPanel({ revisionArchive, qualification, versions }: InstitutionalRevisionWorkflowPanelProps) {
  const proposal = revisionArchive.proposals.find(value => value.status !== 'legacy' && value.status !== 'archived');
  const decision = proposal ? revisionArchive.decisions.find(value => value.proposalRef.id === proposal.id) : undefined;
  const preparedVersion = proposal ? versions.find(value => value.previousVersionId === proposal.curriculumVersionRef.id) : undefined;
  const qualificationValidation = qualification && decision
    ? validateInstitutionalDecisionQualification(qualification, { id: decision.id, entityType: 'decision' })
    : undefined;
  const qualificationState = !qualification || !decision
    ? 'missing'
    : qualificationValidation?.valid
      ? 'qualified'
      : qualification.status;
  const qualificationDetail = qualificationState === 'qualified'
    ? 'Decisione qualificata secondo il boundary R5-C.'
    : qualificationState === 'unverified'
      ? 'Qualificazione non verificata: preparazione della nuova versione bloccata.'
      : qualificationState === 'rejected'
        ? 'Qualificazione rifiutata: preparazione della nuova versione bloccata.'
        : 'Non qualificata istituzionalmente: preparazione della nuova versione bloccata.';
  const versionDetail = preparedVersion
    ? preparedVersion.status === 'draft' || preparedVersion.status === 'proposed-to-collegio'
      ? 'Versione preparata in bozza'
      : `Versione ${preparedVersion.status}`
    : qualificationState === 'qualified'
      ? 'Nessuna nuova versione preparata.'
      : 'Bloccata finché la decisione non è qualificata.';
  const effectiveDetail = !preparedVersion
    ? 'Nessuna versione effettiva disponibile.'
    : !preparedVersion.effectiveFrom
        ? 'Non effettiva: manca un periodo di efficacia valido.'
        : !hasValidEffectivePeriod(preparedVersion)
          ? 'Periodo di efficacia non valido.'
          : preparedVersion.status !== 'approved'
            ? 'Non effettiva: la versione non è approvata.'
            : `Effettiva dal ${preparedVersion.effectiveFrom}${preparedVersion.effectiveTo ? ` al ${preparedVersion.effectiveTo}` : ''}.`;

  return (
    <section
      aria-label="Workflow revisionale istituzionale"
      data-responsive="stack-on-narrow"
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <GitBranch aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">Workflow revisionale istituzionale</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Stato informativo del registro locale; la qualificazione non viene eseguita da questa vista.</p>
        </div>
      </div>

      <ol className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3" aria-label="Sequenza del workflow">
        <Step title="Proposta" state={proposal ? 'complete' : 'pending'} detail={proposal ? proposalLabels[proposal.status] : 'Nessuna proposta nel registro revisionale.'} />
        <Step title="Revisione" state={proposal?.status === 'under-review' || proposal?.status === 'accepted-for-decision' ? 'complete' : proposal ? 'pending' : 'pending'} detail={proposal ? proposalLabels[proposal.status] : 'In attesa di proposta.'} />
        <Step title="Decisione registrata" state={decision?.status === 'recorded-local' ? 'complete' : decision ? 'pending' : 'blocked'} detail={decision?.status === 'recorded-local' ? 'Decisione locale registrata' : decision ? `Stato decisione: ${decision.status}` : 'Nessuna decisione registrata.'} />
        <Step title="Qualificazione istituzionale" state={qualificationState === 'qualified' ? 'complete' : 'blocked'} detail={qualificationState === 'qualified' ? 'Decisione istituzionale qualificata' : qualificationDetail} />
        <Step title="Nuova versione" state={preparedVersion ? 'complete' : 'blocked'} detail={versionDetail} />
        <Step title="Entrata in vigore" state={preparedVersion?.status === 'approved' && hasValidEffectivePeriod(preparedVersion) ? 'complete' : 'blocked'} detail={effectiveDetail} />
      </ol>
    </section>
  );
}
