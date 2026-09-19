import { describe, expect, it } from 'vitest';
import operationsRunbook from '../../docs/architecture/ARENA_M4_OPERATIONS_RUNBOOK.md?raw';
import protectionRaw from '../../docs/architecture/ARENA_MAIN_PROTECTION_REQUIRED_M4S6.json?raw';
import limitationsRaw from '../../docs/architecture/ARENA_M4_KNOWN_LIMITATIONS_2026-09-19.json?raw';
import evidenceRegistry from '../../docs/architecture/ARENA_M4_EVIDENCE_REGISTRY_2026-09-19.md?raw';
import productCi from '../../.github/workflows/product-ci.yml?raw';
import betaRelease from '../../.github/workflows/beta-release-contract.yml?raw';
import betaDeploy from '../../.github/workflows/beta-deploy.yml?raw';
import fastConfig from '../../vitest.fast.config.ts?raw';
import humanInteraction from '../../.github/workflows/human-interaction-model.yml?raw';
import betaE2E from '../../.github/workflows/beta-e2e-workflow.yml?raw';
import criticalJourney from '../../.github/workflows/s3-critical-journey-browser.yml?raw';
import incidentTemplate from '../../.github/ISSUE_TEMPLATE/beta-incident.yml?raw';

describe('M4-S6 governance and operations contract', () => {
  const protection = JSON.parse(protectionRaw);
  const limitations = JSON.parse(limitationsRaw);

  it('requires PR governance and only universal hosting-level checks', () => {
    expect(protection.required.pull_request_before_merge).toBe(true);
    expect(protection.required.required_status_checks).toEqual([
      'product-gate',
      'beta-release-contract',
    ]);
    expect(protection.required.require_branch_up_to_date).toBe(true);
    expect(protection.required.require_conversation_resolution).toBe(true);
    expect(protection.required.allow_force_pushes).toBe(false);
    expect(protection.required.allow_deletions).toBe(false);
  });

  it('records the effective main-protection state after admin verification', () => {
    expect(protection.verified_after_admin_configuration).toMatchObject({
      status: 'PASS',
      issue_105: 'CLOSED',
    });
    expect(protection.verified_after_admin_configuration.ruleset).toMatchObject({
      id: 23698740,
      name: 'Protect main',
      enforcement: 'active',
      current_user_can_bypass: 'never',
    });
    expect(protection.verified_after_admin_configuration.effective).toMatchObject({
      main_protected: true,
      strict_required_status_checks_policy: true,
      require_conversation_resolution: true,
      allow_force_pushes: false,
      allow_deletions: false,
    });
  });

  it('binds required check names to workflows that run on every PR to main', () => {
    expect(productCi).toContain('pull_request:');
    expect(productCi).toContain('branches: [main]');
    expect(productCi).toContain('product-gate:');

    expect(betaRelease).toContain('pull_request:');
    expect(betaRelease).toContain('branches: [main]');
    expect(betaRelease).toContain('beta-release-contract:');
  });

  it('enforces immutable SHA deployment and executes this guard in universal CI', () => {
    expect(betaDeploy).toContain('Validate immutable release SHA');
    expect(betaDeploy).toContain('^[0-9a-f]{40}
    expect(humanInteraction).toContain('paths:');
    expect(betaE2E).toContain('paths:');
    expect(criticalJourney).toContain('paths:');
    expect(protection.required.required_status_checks).not.toContain('validate-him');
    expect(protection.required.required_status_checks).not.toContain('revision-journey');
    expect(protection.required.required_status_checks).not.toContain('critical-journey-evidence');
  });

  it('defines operational stop, rollback and evidence freshness rules', () => {
    expect(operationsRunbook).toContain('SEV-0 — stop immediately');
    expect(operationsRunbook).toContain('Deploy Arena Beta');
    expect(operationsRunbook).toContain('No manual editing of GitHub Pages artifacts is allowed.');
    expect(operationsRunbook).toContain('Any new commit makes prior head-specific evidence stale for promotion.');
    expect(operationsRunbook).toContain('Issue #121 is the canonical M4 tracker.');
  });

  it('makes incident severity and privacy requirements explicit', () => {
    expect(incidentTemplate).toContain('id: severity');
    expect(incidentTemplate).toContain('SEV-0 — stop immediately');
    expect(incidentTemplate).toContain('SEV-1 — core pilot blocked');
    expect(incidentTemplate).toContain('I did not include student personal data, credentials, tokens or secrets.');
  });

  it('keeps the open source finding distinct from the closed governance finding', () => {
    const a3 = limitations.items.find((item: { id: string }) => item.id === 'A3-SOURCES-REGISTRY');
    const a7 = limitations.items.find((item: { id: string }) => item.id === 'A7-LEGACY-ONLY-PERSISTENCE');
    const gov = limitations.items.find((item: { id: string }) => item.id === 'GOV-01-MAIN-PROTECTION');

    expect(a3).toMatchObject({ state: 'OPEN', classification: 'OPEN_MATURITY_FINDING' });
    expect(a7).toMatchObject({ state: 'GOVERNED', classification: 'ACCEPTED_BOUNDED_LIMITATION' });
    expect(gov).toMatchObject({
      state: 'CLOSED',
      classification: 'CLOSED_RELEASE_GOVERNANCE_FINDING',
      absorbed_by_m4s6: true,
    });
    expect(limitations.rules.blocker_cannot_be_relabelled_without_explicit_decision).toBe(true);
  });

  it('marks historical evidence as non-authoritative for current promotion', () => {
    expect(evidenceRegistry).toContain('Historical does not mean incorrect.');
    expect(evidenceRegistry).toContain('not sufficient as current-state authorization');
    expect(evidenceRegistry).toContain('No maturity percentage or historical acceptance receipt can override a current blocker.');
  });
});
);
    expect(betaDeploy).not.toContain('default: main');
    expect(fastConfig).toContain("'src/__tests__/operations-governance-m4s6.test.ts'");
  });

  it('keeps path-filtered checks outside universal branch protection', () => {
    expect(humanInteraction).toContain('paths:');
    expect(betaE2E).toContain('paths:');
    expect(criticalJourney).toContain('paths:');
    expect(protection.required.required_status_checks).not.toContain('validate-him');
    expect(protection.required.required_status_checks).not.toContain('revision-journey');
    expect(protection.required.required_status_checks).not.toContain('critical-journey-evidence');
  });

  it('defines operational stop, rollback and evidence freshness rules', () => {
    expect(operationsRunbook).toContain('SEV-0 — stop immediately');
    expect(operationsRunbook).toContain('Deploy Arena Beta');
    expect(operationsRunbook).toContain('No manual editing of GitHub Pages artifacts is allowed.');
    expect(operationsRunbook).toContain('Any new commit makes prior head-specific evidence stale for promotion.');
    expect(operationsRunbook).toContain('Issue #121 is the canonical M4 tracker.');
  });

  it('makes incident severity and privacy requirements explicit', () => {
    expect(incidentTemplate).toContain('id: severity');
    expect(incidentTemplate).toContain('SEV-0 — stop immediately');
    expect(incidentTemplate).toContain('SEV-1 — core pilot blocked');
    expect(incidentTemplate).toContain('I did not include student personal data, credentials, tokens or secrets.');
  });

  it('keeps the open source finding distinct from the closed governance finding', () => {
    const a3 = limitations.items.find((item: { id: string }) => item.id === 'A3-SOURCES-REGISTRY');
    const a7 = limitations.items.find((item: { id: string }) => item.id === 'A7-LEGACY-ONLY-PERSISTENCE');
    const gov = limitations.items.find((item: { id: string }) => item.id === 'GOV-01-MAIN-PROTECTION');

    expect(a3).toMatchObject({ state: 'OPEN', classification: 'OPEN_MATURITY_FINDING' });
    expect(a7).toMatchObject({ state: 'GOVERNED', classification: 'ACCEPTED_BOUNDED_LIMITATION' });
    expect(gov).toMatchObject({
      state: 'CLOSED',
      classification: 'CLOSED_RELEASE_GOVERNANCE_FINDING',
      absorbed_by_m4s6: true,
    });
    expect(limitations.rules.blocker_cannot_be_relabelled_without_explicit_decision).toBe(true);
  });

  it('marks historical evidence as non-authoritative for current promotion', () => {
    expect(evidenceRegistry).toContain('Historical does not mean incorrect.');
    expect(evidenceRegistry).toContain('not sufficient as current-state authorization');
    expect(evidenceRegistry).toContain('No maturity percentage or historical acceptance receipt can override a current blocker.');
  });
});
