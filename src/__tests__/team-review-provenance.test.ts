import { describe, expect, it } from 'vitest';
import type { Proposal } from '../types/curriculum';
import type { TeamReviewItemSummary } from '../domain/revision/teamReview';
import {
  buildTeamReviewProvenance,
  deriveTeamDiscussionReason,
  teamReviewContextLabel,
  teamReviewVersionStatusLabel,
} from '../domain/revision/teamReviewProvenance';

const fingerprint = 'a'.repeat(64);

const baseItem = (overrides: Partial<TeamReviewItemSummary> = {}): TeamReviewItemSummary => ({
  academicYear: '2026/2027',
  order: 'secondaria',
  groupCode: 'S-G01',
  discipline: 'italiano',
  proposalRef: 'it-sec-1',
  focus: 'Morfosintassi e Latino (LEL)',
  proposalFingerprint: fingerprint,
  bucket: 'needs-clarification',
  contributionCount: 1,
  expectedContributorCount: 2,
  coverageComplete: false,
  staleContributionCount: 0,
  counts: {
    'confirm-proposal': 1,
    'propose-change': 0,
    'keep-previous': 0,
  },
  proposedTexts: [],
  contributions: [],
  ...overrides,
});

const proposal: Proposal = {
  id: 'it-sec-1',
  focus: 'Morfosintassi e Latino (LEL)',
  oldText: 'Testo precedente',
  newText: 'Testo proposto',
  notes: '',
};

describe('Arena team review provenance', () => {
  it('explains incomplete coverage as the reason a point enters the meeting queue', () => {
    const reason = deriveTeamDiscussionReason(baseItem());
    expect(reason.code).toBe('coverage-incomplete');
    expect(reason.title).toBe('Copertura incompleta');
    expect(reason.detail).toContain('1/2');
  });

  it('prioritizes stale version evidence over the current aggregate state', () => {
    const reason = deriveTeamDiscussionReason(baseItem({ staleContributionCount: 1 }));
    expect(reason.code).toBe('stale-contributions');
    expect(reason.detail).toContain('versione precedente');
  });

  it('explains divergent orientations explicitly', () => {
    const reason = deriveTeamDiscussionReason(baseItem({
      bucket: 'divergent',
      contributionCount: 2,
      counts: {
        'confirm-proposal': 1,
        'propose-change': 0,
        'keep-previous': 1,
      },
    }));
    expect(reason.code).toBe('divergent-orientations');
    expect(reason.title).toBe('Orientamenti diversi');
  });

  it('keeps technical version identity separate from human-readable document provenance', () => {
    const provenance = buildTeamReviewProvenance(proposal, 'italiano', 'secondaria', fingerprint);
    expect(provenance.technicalVersionRef).toBe(fingerprint);
    expect(provenance.versionLabel).toContain('Versione corrente');
    expect(provenance.sourceStatus).toBe('unlinked');
    expect(provenance.previousSource.status).toBe('unlinked');
    expect(provenance.proposedSource.status).toBe('unlinked');
  });

  it('produces a readable curricular context without claiming institutional source linkage', () => {
    expect(teamReviewContextLabel('italiano', 'secondaria')).toBe('Italiano · Scuola secondaria di primo grado');
  });

  it('keeps the technical fingerprint out of the human-readable version status', () => {
    expect(teamReviewVersionStatusLabel(0)).toBe('Versione corrente · contributi validi per questa versione');
    expect(teamReviewVersionStatusLabel(2)).toBe('Versione corrente · alcuni contributi devono essere riallineati');
  });
});
