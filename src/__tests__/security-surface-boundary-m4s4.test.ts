import { describe, expect, it } from 'vitest';
import planningWorkspaceSource from '../features/progettazione/PlanningWorkspace.tsx?raw';
import dashboardSource from '../features/session/components/DashboardView.tsx?raw';
import guideSource from '../features/session/components/SupportGuideView.tsx?raw';
import verificationSource from '../features/session/components/SupportVerificationView.tsx?raw';

describe('M4-S4 security boundary regression', () => {
  it('opens the fixed Atlas origin without opener authority', () => {
    expect(planningWorkspaceSource).toContain("const CURRICULUM_ATLAS_URL = 'https://antoniocorsano-boop.github.io/Curriculum-Atlas/'");
    expect(planningWorkspaceSource).toContain('target="_blank"');
    expect(planningWorkspaceSource).toContain('rel="noopener noreferrer"');
    expect(planningWorkspaceSource).not.toContain('window.open(');
    expect(planningWorkspaceSource).not.toContain('dangerouslySetInnerHTML');
    const atlasBuilder = planningWorkspaceSource.split('function buildAtlasContextUrl')[1]?.split('export function PlanningWorkspace')[0] ?? '';
    expect(atlasBuilder).toContain("sourceProduct: 'curmanlight-arena'");
    expect(atlasBuilder).toContain('masterId: CANONICAL_MASTER_ID');
    expect(atlasBuilder).toContain('classLevel: input.targetClass');
    expect(atlasBuilder).not.toContain('targetSection');
    expect(atlasBuilder).not.toContain('user');
    expect(atlasBuilder).not.toContain('email');
  });

  it('does not introduce automatic cross-product network writes', () => {
    for (const source of [planningWorkspaceSource, dashboardSource, guideSource, verificationSource]) {
      expect(source).not.toContain('fetch(');
      expect(source).not.toContain('supabase');
      expect(source).not.toContain('XMLHttpRequest');
      expect(source).not.toContain('localStorage.setItem');
      expect(source).not.toContain('sessionStorage.setItem');
    }
  });

  it('does not mutate roles, membership or authorization from support/navigation surfaces', () => {
    for (const source of [planningWorkspaceSource, dashboardSource, guideSource, verificationSource]) {
      expect(source).not.toContain('setRole(');
      expect(source).not.toContain('setMembership');
      expect(source).not.toContain('grant');
      expect(source).not.toContain('impersonat');
    }
  });

  it('keeps Docente OS transfer on the existing explicit handoff component', () => {
    expect(planningWorkspaceSource).toContain('<PlanningHandoffPreview />');
    expect(planningWorkspaceSource).not.toContain('postMessage(');
    expect(planningWorkspaceSource).not.toContain('WebSocket');
  });
});
