/**
 * A03→A07 document generation from revision proposals and decisions.
 *
 * Uses CML-633F document domain to generate structured canonical documents.
 * No HTML generation here — only structured DocumentContent.
 * No official record claims without verified process and authority.
 */

import type {
  RevisionArchive,
  RevisionProposal,
  RevisionProposalVersion,
  Decision,
  EntityReference,
  RevisionWarning,
} from './types';
import type {
  DocumentEntity,
  DocumentVersion,
  DocumentContent,
  DocumentSection,
} from '../documents/types';
import { generateEntityId, createMetadata, createEntityReference } from '../curriculum/identity';
import { getEventsByProposal } from './eventLog';

// ─── Document Generation ────────────────────────────────────────────────────

export interface ProposalDocumentInput {
  proposal: RevisionProposal;
  version?: RevisionProposalVersion;
  sources?: string[];
}

export function generateProposalSheet(input: ProposalDocumentInput): DocumentContent {
  const v = input.version;
  const p = input.proposal;
  const sections: DocumentSection[] = [];

  // Heading
  sections.push({
    type: 'heading',
    level: 1,
    text: `Proposta di revisione — ${p.targetNodeRef.snapshotLabel || p.targetNodeRef.id}`,
  });

  // Status
  sections.push({
    type: 'paragraph',
    text: `Stato: ${p.status} | Autore: ${p.author?.displayName ?? 'non dichiarato'} | Data: ${p.metadata.createdAt}`,
    format: 'normal',
  });

  // Rationale
  if (p.rationale) {
    sections.push({
      type: 'heading',
      level: 2,
      text: 'Motivazione',
    });
    sections.push({
      type: 'paragraph',
      text: p.rationale,
      format: 'normal',
    });
  }

  // Comparison: current vs proposed
  sections.push({
    type: 'heading',
    level: 2,
    text: 'Confronto testuale',
  });

  sections.push({
    type: 'heading',
    level: 3,
    text: 'Testo vigente',
  });
  sections.push({
    type: 'paragraph',
    text: v?.currentTextSnapshot ?? p.currentTextSnapshot,
    format: 'quote',
  });

  sections.push({
    type: 'heading',
    level: 3,
    text: 'Testo proposto',
  });
  sections.push({
    type: 'paragraph',
    text: v?.proposedText ?? p.proposedText,
    format: 'quote',
  });

  // Sources
  if (input.sources && input.sources.length > 0) {
    sections.push({
      type: 'heading',
      level: 2,
      text: 'Fonti',
    });
    sections.push({
      type: 'list',
      items: input.sources,
      ordered: false,
    });
  }

  return { sections };
}

export interface DecisionRecordInput {
  proposal: RevisionProposal;
  decision: Decision;
  version?: RevisionProposalVersion;
}

export function generateDecisionRecord(input: DecisionRecordInput): DocumentContent {
  const d = input.decision;
  const sections: DocumentSection[] = [];

  sections.push({
    type: 'heading',
    level: 1,
    text: `Registro locale della decisione — ${input.proposal.targetNodeRef.snapshotLabel || input.proposal.targetNodeRef.id}`,
  });

  sections.push({
    type: 'paragraph',
    text: `Esito: ${d.outcome} | Autorità: ${d.authority.declaredRole} | Data: ${d.decidedAt ?? 'non registrata'}`,
    format: 'normal',
  });

  if (d.rationale) {
    sections.push({
      type: 'heading',
      level: 2,
      text: 'Motivazione della decisione',
    });
    sections.push({
      type: 'paragraph',
      text: d.rationale,
      format: 'normal',
    });
  }

  if (d.authority.note) {
    sections.push({
      type: 'heading',
      level: 2,
      text: 'Note sull\'autorità',
    });
    sections.push({
      type: 'paragraph',
      text: d.authority.note,
      format: 'normal',
    });
  }

  // Disclaimer
  sections.push({
    type: 'paragraph',
    text: 'Questo documento è un registro locale delle attività e non costituisce verbale ufficiale, delibera certificata o atto approvato senza processo futuro verificato.',
    format: 'italic',
  });

  return { sections };
}

export interface SourceAttachmentInput {
  sources: EntityReference[];
  evidences: EntityReference[];
}

export function generateSourceAttachment(input: SourceAttachmentInput): DocumentContent {
  const sections: DocumentSection[] = [];

  sections.push({
    type: 'heading',
    level: 1,
    text: 'Riepilogo delle fonti',
  });

  if (input.sources.length > 0) {
    sections.push({
      type: 'heading',
      level: 2,
      text: 'Fonti documentali',
    });
    sections.push({
      type: 'list',
      items: input.sources.map(s => `${s.entityType}: ${s.snapshotLabel || s.id}`),
      ordered: false,
    });
  }

  if (input.evidences.length > 0) {
    sections.push({
      type: 'heading',
      level: 2,
      text: 'Evidenze',
    });
    sections.push({
      type: 'list',
      items: input.evidences.map(e => `${e.entityType}: ${e.snapshotLabel || e.id}`),
      ordered: false,
    });
  }

  return { sections };
}

export function generateEventHistory(archive: RevisionArchive, proposalId: string): DocumentContent {
  const events = getEventsByProposal(archive, proposalId);
  const sections: DocumentSection[] = [];

  sections.push({
    type: 'heading',
    level: 1,
    text: 'Cronologia degli eventi',
  });

  sections.push({
    type: 'paragraph',
    text: 'Registro locale delle attività, non protocollo ufficiale.',
    format: 'italic',
  });

  const eventItems = events.map(e =>
    `[${e.timestamp}] ${e.eventType}${e.previousStatus ? ` (${e.previousStatus} → ${e.newStatus || '—'})` : ''}${e.rationale ? ` — ${e.rationale}` : ''}${e.actor ? ` — ${e.actor.displayName || 'attore non specificato'}` : ''}`,
  );

  sections.push({
    type: 'list',
    items: eventItems,
    ordered: false,
  });

  return { sections };
}

// ─── Full Document Creation ─────────────────────────────────────────────────

export interface RevisionDocumentCreationResult {
  success: boolean;
  document?: DocumentEntity;
  version?: DocumentVersion;
  warnings: RevisionWarning[];
}

export function generateProposalDocument(
  proposal: RevisionProposal,
  archive: RevisionArchive,
): RevisionDocumentCreationResult {
  const warnings: RevisionWarning[] = [];
  const version = archive.versions.find(v => v.id === proposal.currentVersionRef);

  const content = generateProposalSheet({
    proposal,
    version,
    sources: proposal.sourceRefs.map(s => s.snapshotLabel || s.id),
  });

  const documentId = generateEntityId();
  const versionId = generateEntityId();
  const now = new Date().toISOString();

  const document: DocumentEntity = {
    id: documentId,
    metadata: createMetadata('teacher', proposal.author, now),
    documentType: 'revision-proposal',
    title: `Proposta: ${proposal.targetNodeRef.snapshotLabel || proposal.targetNodeRef.id}`,
    status: 'draft',
    currentVersionRef: versionId,
    author: proposal.author,
    sourceRefs: [...proposal.sourceRefs],
    originRefs: [createEntityReference(proposal.id, 'revision-proposal')],
  };

  const docVersion: DocumentVersion = {
    id: versionId,
    documentRef: documentId,
    versionNumber: 1,
    content,
    createdAt: now,
    author: proposal.author,
    reason: 'Generato da proposta di revisione',
    sourceRefs: [...proposal.sourceRefs],
    institutionalSnapshot: {
      instituteName: proposal.institutionalContext?.instituteRef?.snapshotLabel ?? 'Istituto non configurato',
      configured: !!proposal.institutionalContext?.instituteRef,
    },
    previousVersionRef: undefined,
    frozen: true,
    metadata: createMetadata('teacher', proposal.author, now),
  };

  return {
    success: true,
    document,
    version: docVersion,
    warnings,
  };
}

export function generateDecisionDocument(
  proposal: RevisionProposal,
  decision: Decision,
  archive: RevisionArchive,
): RevisionDocumentCreationResult {
  const warnings: RevisionWarning[] = [];
  const version = archive.versions.find(v => v.id === decision.proposalVersionRef.id);

  const content = generateDecisionRecord({ proposal, decision, version });

  const documentId = generateEntityId();
  const versionId = generateEntityId();
  const now = new Date().toISOString();

  const document: DocumentEntity = {
    id: documentId,
    metadata: createMetadata('teacher', decision.decidedBy, now),
    documentType: 'decision-record',
    title: `Decisione: ${proposal.targetNodeRef.snapshotLabel || proposal.targetNodeRef.id} — ${decision.outcome}`,
    status: 'draft',
    currentVersionRef: versionId,
    author: decision.decidedBy,
    sourceRefs: [...decision.sourceRefs],
    originRefs: [
      createEntityReference(proposal.id, 'revision-proposal'),
      createEntityReference(decision.id, 'decision'),
    ],
  };

  const docVersion: DocumentVersion = {
    id: versionId,
    documentRef: documentId,
    versionNumber: 1,
    content,
    createdAt: now,
    author: decision.decidedBy,
    reason: 'Registro locale della decisione',
    sourceRefs: [...decision.sourceRefs],
    institutionalSnapshot: {
      instituteName: decision.institutionalContext?.instituteRef?.snapshotLabel ?? 'Istituto non configurato',
      configured: !!decision.institutionalContext?.instituteRef,
      declaredRole: decision.authority.declaredRole,
    },
    previousVersionRef: undefined,
    frozen: true,
    metadata: createMetadata('teacher', decision.decidedBy, now),
  };

  return {
    success: true,
    document,
    version: docVersion,
    warnings,
  };
}