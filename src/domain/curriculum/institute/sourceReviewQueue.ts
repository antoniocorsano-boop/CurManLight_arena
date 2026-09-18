import { INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3 } from './sourceReconstructionReadiness';

export type InstituteSourceReviewTaskId =
  | 'CV-AUD-001-ITALIANO'
  | 'CV-AUD-001-INGLESE'
  | 'CV-AUD-002-MUSICA-RATIONALE'
  | 'CV-AUD-003-MOTORIA-RATIONALE'
  | 'CV-AUD-004-LATINO-SCOPE'
  | 'CV-AUD-005-EDUCAZIONE-FISICA-HEADER'
  | 'CV-AUD-006-CORPO-IDENTITY';

export type InstituteSourceReviewFindingId =
  | 'CV-AUD-001'
  | 'CV-AUD-002'
  | 'CV-AUD-003'
  | 'CV-AUD-004'
  | 'CV-AUD-005'
  | 'CV-AUD-006';

export type InstituteSourceResolutionPolicy =
  | 'CORRECTED_SOURCE_VERSION_REQUIRED'
  | 'HUMAN_SCOPE_DECISION_REQUIRED'
  | 'HUMAN_IDENTITY_DECISION_REQUIRED';

export type InstituteSourceReviewDecision =
  | 'ACKNOWLEDGED_REQUIRES_CORRECTED_SOURCE'
  | 'CORRECTED_SOURCE_VERSION_LINKED'
  | 'SCOPE_SECOND_YEAR_AND_LATER'
  | 'SCOPE_CLASS_ONE'
  | 'SCOPE_DEFERRED'
  | 'IDENTITY_NORMALIZE_CANONICAL_PRESERVE_SOURCE_LABEL'
  | 'IDENTITY_KEEP_SOURCE_LABEL_PENDING_REPAIR';

export interface InstituteSourceReviewTask {
  taskId: InstituteSourceReviewTaskId;
  findingId: InstituteSourceReviewFindingId;
  target: string;
  category: string;
  priority: 'P0' | 'P1';
  pages: readonly number[];
  tableRefs: readonly number[];
  summary: string;
  evidenceStatus:
    | 'CONFIRMED_SOURCE_DEFECT'
    | 'CONFIRMED_SOURCE_CONFLICT'
    | 'CONFIRMED_STRUCTURAL_DEFECT'
    | 'CONFIRMED_LABEL_INCONSISTENCY';
  resolutionPolicy: InstituteSourceResolutionPolicy;
  allowedDecisions: readonly InstituteSourceReviewDecision[];
  status: 'AWAITING_HUMAN_REMEDIATION';
}

export interface InstituteSourceReviewReceipt {
  schemaVersion: 'arena-institute-source-review-receipt-v1';
  sourceSha256: string;
  taskId: InstituteSourceReviewTaskId;
  findingId: InstituteSourceReviewFindingId;
  decision: InstituteSourceReviewDecision;
  reviewerAttestation: true;
  reviewedAt: string;
  notes?: string;
  replacementSourceSha256?: string;
}

export interface InstituteSourceReviewReceiptPack {
  schemaVersion: 'arena-institute-source-review-receipt-pack-v1';
  sourceSha256: string;
  exportedAt: string;
  receipts: readonly InstituteSourceReviewReceipt[];
}

export interface InstituteSourceReviewAssessment {
  state: 'BLOCKED' | 'SOURCE_REMEDIATION_COMPLETE';
  totalTaskCount: number;
  resolvedTaskCount: number;
  unresolvedTaskCount: number;
  acknowledgedButUnresolvedTaskCount: number;
  invalidReceiptCount: number;
  conflictingTaskIds: readonly InstituteSourceReviewTaskId[];
  resolvedTaskIds: readonly InstituteSourceReviewTaskId[];
  unresolvedTaskIds: readonly InstituteSourceReviewTaskId[];
  sourceAuthorityMutationAuthorized: false;
  semanticReviewComplete: false;
  automaticCanonicalPromotionAuthorized: false;
}

const SOURCE_SHA256 = INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3.sourceSha256;
const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

const correctedSourceDecisions = [
  'ACKNOWLEDGED_REQUIRES_CORRECTED_SOURCE',
  'CORRECTED_SOURCE_VERSION_LINKED',
] as const satisfies readonly InstituteSourceReviewDecision[];

export const INSTITUTE_SOURCE_REVIEW_QUEUE: readonly InstituteSourceReviewTask[] = [
  {
    taskId: 'CV-AUD-001-ITALIANO',
    findingId: 'CV-AUD-001',
    target: 'I DISCORSI E LE PAROLE — raccordo Italiano',
    category: 'CONTENT_TARGET_MISMATCH',
    priority: 'P0',
    pages: [22, 41],
    tableRefs: [6, 14],
    summary: 'La presentazione collegata a Italiano contiene competenze attese linguistiche ma obiettivi/conoscenze 3-5 anni riconducibili alla progressione de «Il sé e l’altro».',
    evidenceStatus: 'CONFIRMED_SOURCE_DEFECT',
    resolutionPolicy: 'CORRECTED_SOURCE_VERSION_REQUIRED',
    allowedDecisions: correctedSourceDecisions,
    status: 'AWAITING_HUMAN_REMEDIATION',
  },
  {
    taskId: 'CV-AUD-001-INGLESE',
    findingId: 'CV-AUD-001',
    target: 'I DISCORSI E LE PAROLE — raccordo Lingua inglese',
    category: 'CONTENT_TARGET_MISMATCH',
    priority: 'P0',
    pages: [32, 41],
    tableRefs: [10, 14],
    summary: 'La presentazione collegata a Lingua inglese contiene competenze attese linguistiche ma obiettivi/conoscenze 3-5 anni riconducibili alla progressione de «Il sé e l’altro».',
    evidenceStatus: 'CONFIRMED_SOURCE_DEFECT',
    resolutionPolicy: 'CORRECTED_SOURCE_VERSION_REQUIRED',
    allowedDecisions: correctedSourceDecisions,
    status: 'AWAITING_HUMAN_REMEDIATION',
  },
  {
    taskId: 'CV-AUD-002-MUSICA-RATIONALE',
    findingId: 'CV-AUD-002',
    target: 'MUSICA — Perché si studia?',
    category: 'DUPLICATED_DISCIPLINE_RATIONALE',
    priority: 'P0',
    pages: [66, 72],
    tableRefs: [],
    summary: 'Il razionale di Musica riproduce il corpo testuale della motivazione di Tecnologia.',
    evidenceStatus: 'CONFIRMED_SOURCE_DEFECT',
    resolutionPolicy: 'CORRECTED_SOURCE_VERSION_REQUIRED',
    allowedDecisions: correctedSourceDecisions,
    status: 'AWAITING_HUMAN_REMEDIATION',
  },
  {
    taskId: 'CV-AUD-003-MOTORIA-RATIONALE',
    findingId: 'CV-AUD-003',
    target: 'EDUCAZIONE MOTORIA E FISICA — Perché si studia?',
    category: 'DUPLICATED_DISCIPLINE_RATIONALE',
    priority: 'P0',
    pages: [77, 83],
    tableRefs: [],
    summary: 'Il razionale di Educazione motoria e fisica riproduce il corpo testuale di Arte e immagine.',
    evidenceStatus: 'CONFIRMED_SOURCE_DEFECT',
    resolutionPolicy: 'CORRECTED_SOURCE_VERSION_REQUIRED',
    allowedDecisions: correctedSourceDecisions,
    status: 'AWAITING_HUMAN_REMEDIATION',
  },
  {
    taskId: 'CV-AUD-004-LATINO-SCOPE',
    findingId: 'CV-AUD-004',
    target: 'LATINO / LEL — ambito di classe',
    category: 'APPLICABILITY_SCOPE_CONFLICT',
    priority: 'P0',
    pages: [4, 27, 28],
    tableRefs: [9],
    summary: 'Il documento colloca il Latino dal secondo anno/classi seconde-terze, mentre la tabella curricolare è intestata «CLASSE PRIMA».',
    evidenceStatus: 'CONFIRMED_SOURCE_CONFLICT',
    resolutionPolicy: 'HUMAN_SCOPE_DECISION_REQUIRED',
    allowedDecisions: [
      'CORRECTED_SOURCE_VERSION_LINKED',
      'SCOPE_SECOND_YEAR_AND_LATER',
      'SCOPE_CLASS_ONE',
      'SCOPE_DEFERRED',
    ],
    status: 'AWAITING_HUMAN_REMEDIATION',
  },
  {
    taskId: 'CV-AUD-005-EDUCAZIONE-FISICA-HEADER',
    findingId: 'CV-AUD-005',
    target: 'EDUCAZIONE FISICA — secondaria — intestazione tabella',
    category: 'TABLE_HEADER_STRUCTURE_MISMATCH',
    priority: 'P1',
    pages: [88, 89],
    tableRefs: [37],
    summary: 'La tabella secondaria non espone correttamente l’intestazione della prima colonna di competenza e incorpora «CLASSE PRIMA» nella cella verticale.',
    evidenceStatus: 'CONFIRMED_STRUCTURAL_DEFECT',
    resolutionPolicy: 'CORRECTED_SOURCE_VERSION_REQUIRED',
    allowedDecisions: correctedSourceDecisions,
    status: 'AWAITING_HUMAN_REMEDIATION',
  },
  {
    taskId: 'CV-AUD-006-CORPO-IDENTITY',
    findingId: 'CV-AUD-006',
    target: 'IL CORPO E IL MOVIMENTO — identità del campo',
    category: 'FIELD_IDENTITY_LABEL_INCONSISTENCY',
    priority: 'P1',
    pages: [19, 84],
    tableRefs: [5, 35],
    summary: 'Il raccordo usa «IL CORPO IN MOVIMENTO», mentre la scheda del campo usa «IL CORPO E IL MOVIMENTO».',
    evidenceStatus: 'CONFIRMED_LABEL_INCONSISTENCY',
    resolutionPolicy: 'HUMAN_IDENTITY_DECISION_REQUIRED',
    allowedDecisions: [
      'CORRECTED_SOURCE_VERSION_LINKED',
      'IDENTITY_NORMALIZE_CANONICAL_PRESERVE_SOURCE_LABEL',
      'IDENTITY_KEEP_SOURCE_LABEL_PENDING_REPAIR',
    ],
    status: 'AWAITING_HUMAN_REMEDIATION',
  },
] as const;

const TASK_BY_ID = new Map(INSTITUTE_SOURCE_REVIEW_QUEUE.map((task) => [task.taskId, task] as const));

function normalizeNotes(value: string | undefined): string {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function receiptIdentity(receipt: InstituteSourceReviewReceipt): string {
  return JSON.stringify({
    taskId: receipt.taskId,
    findingId: receipt.findingId,
    decision: receipt.decision,
    replacementSourceSha256: receipt.replacementSourceSha256 ?? null,
    notes: normalizeNotes(receipt.notes),
  });
}

export function validateInstituteSourceReviewReceipt(
  receipt: InstituteSourceReviewReceipt,
): { valid: true; task: InstituteSourceReviewTask } | { valid: false; reason: string } {
  if (receipt.schemaVersion !== 'arena-institute-source-review-receipt-v1') {
    return { valid: false, reason: 'Schema receipt non riconosciuto.' };
  }
  if (receipt.sourceSha256 !== SOURCE_SHA256) {
    return { valid: false, reason: 'La receipt non appartiene alla versione sorgente ricostruita v3.' };
  }
  const task = TASK_BY_ID.get(receipt.taskId);
  if (!task || task.findingId !== receipt.findingId) {
    return { valid: false, reason: 'Task o finding non appartengono alla coda sorgente certificata.' };
  }
  if (!task.allowedDecisions.includes(receipt.decision)) {
    return { valid: false, reason: 'La decisione non è ammessa per questo task.' };
  }
  if (receipt.reviewerAttestation !== true) {
    return { valid: false, reason: 'Manca l’attestazione esplicita del revisore umano.' };
  }
  if (!receipt.reviewedAt || Number.isNaN(Date.parse(receipt.reviewedAt))) {
    return { valid: false, reason: 'Data di revisione non valida.' };
  }
  if (receipt.decision === 'CORRECTED_SOURCE_VERSION_LINKED') {
    const replacement = receipt.replacementSourceSha256 ?? '';
    if (!SHA256_PATTERN.test(replacement)) {
      return { valid: false, reason: 'La nuova versione corretta richiede uno SHA-256 valido.' };
    }
    if (replacement.toLowerCase() === SOURCE_SHA256.toLowerCase()) {
      return { valid: false, reason: 'La nuova versione corretta deve avere un’identità diversa dalla fonte v3.' };
    }
    if (normalizeNotes(receipt.notes).length === 0) {
      return { valid: false, reason: 'Il collegamento a una nuova fonte richiede una nota di correzione.' };
    }
  }
  return { valid: true, task };
}

export function doesInstituteSourceReceiptResolveTask(receipt: InstituteSourceReviewReceipt): boolean {
  const validation = validateInstituteSourceReviewReceipt(receipt);
  if (!validation.valid) return false;
  switch (receipt.decision) {
    case 'CORRECTED_SOURCE_VERSION_LINKED':
    case 'SCOPE_SECOND_YEAR_AND_LATER':
    case 'SCOPE_CLASS_ONE':
    case 'IDENTITY_NORMALIZE_CANONICAL_PRESERVE_SOURCE_LABEL':
      return true;
    case 'ACKNOWLEDGED_REQUIRES_CORRECTED_SOURCE':
    case 'SCOPE_DEFERRED':
    case 'IDENTITY_KEEP_SOURCE_LABEL_PENDING_REPAIR':
      return false;
  }
}

export function assessInstituteSourceReview(
  receipts: readonly InstituteSourceReviewReceipt[],
): InstituteSourceReviewAssessment {
  const validByTask = new Map<InstituteSourceReviewTaskId, InstituteSourceReviewReceipt[]>();
  let invalidReceiptCount = 0;

  for (const receipt of receipts) {
    const validation = validateInstituteSourceReviewReceipt(receipt);
    if (!validation.valid) {
      invalidReceiptCount += 1;
      continue;
    }
    const existing = validByTask.get(receipt.taskId) ?? [];
    existing.push(receipt);
    validByTask.set(receipt.taskId, existing);
  }

  const conflictingTaskIds: InstituteSourceReviewTaskId[] = [];
  const resolvedTaskIds: InstituteSourceReviewTaskId[] = [];
  const unresolvedTaskIds: InstituteSourceReviewTaskId[] = [];
  let acknowledgedButUnresolvedTaskCount = 0;

  for (const task of INSTITUTE_SOURCE_REVIEW_QUEUE) {
    const taskReceipts = validByTask.get(task.taskId) ?? [];
    const identities = new Set(taskReceipts.map(receiptIdentity));
    if (identities.size > 1) {
      conflictingTaskIds.push(task.taskId);
      unresolvedTaskIds.push(task.taskId);
      continue;
    }
    const receipt = taskReceipts[taskReceipts.length - 1];
    if (!receipt) {
      unresolvedTaskIds.push(task.taskId);
      continue;
    }
    if (doesInstituteSourceReceiptResolveTask(receipt)) {
      resolvedTaskIds.push(task.taskId);
    } else {
      acknowledgedButUnresolvedTaskCount += 1;
      unresolvedTaskIds.push(task.taskId);
    }
  }

  const resolvedTaskCount = resolvedTaskIds.length;
  const unresolvedTaskCount = unresolvedTaskIds.length;
  return {
    state: unresolvedTaskCount === 0 && invalidReceiptCount === 0
      ? 'SOURCE_REMEDIATION_COMPLETE'
      : 'BLOCKED',
    totalTaskCount: INSTITUTE_SOURCE_REVIEW_QUEUE.length,
    resolvedTaskCount,
    unresolvedTaskCount,
    acknowledgedButUnresolvedTaskCount,
    invalidReceiptCount,
    conflictingTaskIds,
    resolvedTaskIds,
    unresolvedTaskIds,
    sourceAuthorityMutationAuthorized: false,
    semanticReviewComplete: false,
    automaticCanonicalPromotionAuthorized: false,
  };
}

export function createInstituteSourceReviewReceiptPack(
  receipts: readonly InstituteSourceReviewReceipt[],
  exportedAt = new Date().toISOString(),
): InstituteSourceReviewReceiptPack {
  return {
    schemaVersion: 'arena-institute-source-review-receipt-pack-v1',
    sourceSha256: SOURCE_SHA256,
    exportedAt,
    receipts: receipts.map((receipt) => ({ ...receipt })),
  };
}

export function validateInstituteSourceReviewReceiptPack(
  pack: InstituteSourceReviewReceiptPack,
): { valid: true } | { valid: false; reason: string } {
  if (pack.schemaVersion !== 'arena-institute-source-review-receipt-pack-v1') {
    return { valid: false, reason: 'Schema pacchetto non riconosciuto.' };
  }
  if (pack.sourceSha256 !== SOURCE_SHA256) {
    return { valid: false, reason: 'Il pacchetto appartiene a una diversa versione del curricolo d’istituto.' };
  }
  if (!pack.exportedAt || Number.isNaN(Date.parse(pack.exportedAt))) {
    return { valid: false, reason: 'Data di esportazione non valida.' };
  }
  for (const receipt of pack.receipts) {
    const validation = validateInstituteSourceReviewReceipt(receipt);
    if (!validation.valid) return { valid: false, reason: validation.reason };
  }
  return { valid: true };
}

export const CURRENT_INSTITUTE_SOURCE_REVIEW_ASSESSMENT = assessInstituteSourceReview([]);
