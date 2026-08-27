import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8');

describe('BETA-G4 revision routing and human-workflow binding', () => {
  it('risolve /revisione nella vista revisione e non nella vista curricolo', () => {
    const app = read('src/App.tsx');

    expect(app).toContain("if (pathname.startsWith('/revisione')) return 'revisione';");
    expect(app).toContain("if (pathname.startsWith('/curriculum')) return 'curricolo';");
    expect(app).toContain("case 'revisione': return '/revisione';");
    expect(app).not.toContain("pathname.startsWith('/curriculum') || pathname.startsWith('/revisione')");
  });

  it('collega il bridge proposta locale e il pannello di decisione autenticata alla vista reale', () => {
    const revisionView = read('src/features/curriculum/components/RevisioneTab.tsx');

    expect(revisionView).toContain('StructuredProposalStarter');
    expect(revisionView).toContain('InstitutionalDecisionPanel');
    expect(revisionView).toContain('proposals={currentDisciplineProps}');
    expect(revisionView).toContain('<InstitutionalDecisionPanel proposal={proposal} version={version} />');
  });
});
