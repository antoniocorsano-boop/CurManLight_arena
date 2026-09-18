import {
  INSTITUTE_SOURCE_REVIEW_QUEUE,
  assessInstituteSourceReview,
  doesInstituteSourceReceiptResolveTask,
  validateInstituteSourceReviewReceipt,
  type InstituteSourceReviewDecision,
  type InstituteSourceReviewReceipt,
  type InstituteSourceReviewTaskId,
} from './sourceReviewQueue';

export type InstituteSourceChangeTraceStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CONFLICT';

export interface InstituteSourceChangeTraceEntry {
  taskId: InstituteSourceReviewTaskId;
  findingId: string;
  target: string;
  problem: string;
  pages: readonly number[];
  decision: string;
  correctionNote: string | null;
  replacementSourceSha256: string | null;
  status: InstituteSourceChangeTraceStatus;
  authorityEffect: 'NONE';
}

export function buildInstituteSourceChangeTrace(
  receipts: readonly InstituteSourceReviewReceipt[],
): readonly InstituteSourceChangeTraceEntry[] {
  const assessment = assessInstituteSourceReview(receipts);
  const conflictingTaskIds = new Set(assessment.conflictingTaskIds);
  const latestValidReceiptByTask = new Map<InstituteSourceReviewTaskId, InstituteSourceReviewReceipt>();

  for (const receipt of receipts) {
    const validation = validateInstituteSourceReviewReceipt(receipt);
    if (!validation.valid) continue;
    const previous = latestValidReceiptByTask.get(receipt.taskId);
    if (!previous || previous.reviewedAt <= receipt.reviewedAt) {
      latestValidReceiptByTask.set(receipt.taskId, receipt);
    }
  }

  return INSTITUTE_SOURCE_REVIEW_QUEUE.map((task) => {
    const receipt = latestValidReceiptByTask.get(task.taskId) ?? null;
    const conflict = conflictingTaskIds.has(task.taskId);
    const resolved = !conflict && receipt ? doesInstituteSourceReceiptResolveTask(receipt) : false;
    return {
      taskId: task.taskId,
      findingId: task.findingId,
      target: task.target,
      problem: task.summary,
      pages: task.pages,
      decision: conflict
        ? 'Ricevute umane in conflitto: è necessaria una nuova decisione coerente'
        : receipt
          ? sourceDecisionLabel(receipt.decision)
          : 'Decisione umana non ancora registrata',
      correctionNote: conflict ? null : receipt?.notes?.trim() || null,
      replacementSourceSha256: conflict ? null : receipt?.replacementSourceSha256 ?? null,
      status: conflict ? 'CONFLICT' : resolved ? 'RESOLVED' : receipt ? 'ACKNOWLEDGED' : 'OPEN',
      authorityEffect: 'NONE',
    };
  });
}

export function sourceDecisionLabel(decision: InstituteSourceReviewDecision): string {
  switch (decision) {
    case 'ACKNOWLEDGED_REQUIRES_CORRECTED_SOURCE':
      return 'Problema preso in carico; serve una fonte corretta';
    case 'CORRECTED_SOURCE_VERSION_LINKED':
      return 'Correzione verificata su una nuova versione della fonte';
    case 'SCOPE_SECOND_YEAR_AND_LATER':
      return 'Latino/LEL dal secondo anno e successivi';
    case 'SCOPE_CLASS_ONE':
      return 'Latino/LEL applicabile alla classe prima';
    case 'SCOPE_DEFERRED':
      return 'Decisione sull’ambito rinviata';
    case 'IDENTITY_NORMALIZE_CANONICAL_PRESERVE_SOURCE_LABEL':
      return 'Identità normalizzata al campo canonico conservando l’etichetta sorgente';
    case 'IDENTITY_KEEP_SOURCE_LABEL_PENDING_REPAIR':
      return 'Etichetta sorgente mantenuta distinta in attesa di correzione';
  }
}
