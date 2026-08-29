import { describe, expect, it } from 'vitest';
import curriculumContextTaskRaw from '../../.human/tasks/HT-BETA-CURRICULUM-CONTEXT.json?raw';
import revisionPrepareTaskRaw from '../../.human/tasks/HT-BETA-REVISION-PREPARE.json?raw';
import revisionDecisionTaskRaw from '../../.human/tasks/HT-REVISION-DECISION.json?raw';
import planningHandoffTaskRaw from '../../.human/tasks/HT-BETA-PLANNING-HANDOFF.json?raw';
import protocolRaw from '../../docs/evidence/BETA_G5_HUMAN_ACCEPTANCE_PROTOCOL_v2.md?raw';
import receiptRaw from '../../docs/evidence/BETA_G5_HUMAN_ACCEPTANCE_RECEIPT_TEMPLATE_v2.json?raw';

const expectedTaskIds = [
  'HT-BETA-CURRICULUM-CONTEXT',
  'HT-BETA-REVISION-PREPARE',
  'HT-REVISION-DECISION',
  'HT-BETA-PLANNING-HANDOFF',
] as const;

const taskSources = [
  curriculumContextTaskRaw,
  revisionPrepareTaskRaw,
  revisionDecisionTaskRaw,
  planningHandoffTaskRaw,
];

describe('Arena S3 human-validation contract', () => {
  it('keeps exactly the four G5 Human Task contracts aligned with the protocol', () => {
    const taskIds = taskSources.map((source) => JSON.parse(source).id).sort();
    expect(taskIds).toEqual([...expectedTaskIds].sort());

    for (const taskId of expectedTaskIds) {
      expect(protocolRaw, `G5 protocol is missing ${taskId}`).toContain(taskId);
    }
  });

  it('keeps the receipt template release-neutral and pending human execution', () => {
    const receipt = JSON.parse(receiptRaw) as {
      schema: string;
      status: string;
      releaseSha: string | null;
      releaseIdentityVerified: boolean;
      verdict: string;
      tasks: Record<string, unknown>;
      reviewerAttestation: Record<string, boolean>;
    };

    expect(receipt.schema).toBe('CML_ARENA_BETA_G5_HUMAN_ACCEPTANCE_V2');
    expect(receipt.status).toBe('PENDING_HUMAN');
    expect(receipt.releaseSha).toBeNull();
    expect(receipt.releaseIdentityVerified).toBe(false);
    expect(receipt.verdict).toBe('PENDING_HUMAN');
    expect(Object.keys(receipt.tasks).sort()).toEqual([...expectedTaskIds].sort());
    expect(Object.values(receipt.reviewerAttestation).every((value) => value === false)).toBe(true);
  });

  it('requires immutable deployed release identity before a human PASS can exist', () => {
    expect(protocolRaw).toContain('published `beta-release.json` `releaseSha`');
    expect(protocolRaw).toContain('the completed human-acceptance receipt `releaseSha`');
    expect(protocolRaw).toContain('Automated browser evidence does not substitute for human review.');
  });
});
