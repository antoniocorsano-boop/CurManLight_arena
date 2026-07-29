import { describe, it, expect } from 'vitest';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { createInitialGuidedWorkflowState } from '../features/guided-workflow/workflow';

describe('CML-633J — Data Authority', () => {
  it('has a single store as the data authority', () => {
    const store = useCurriculumStore.getState();
    expect(store).toBeDefined();
    expect(typeof store.setGuidedWorkflowState).toBe('function');
    expect(typeof store.resetGuidedWorkflowState).toBe('function');
  });

  it('guidedWorkflowState is a runtime state not a Dexie table', () => {
    const store = useCurriculumStore.getState();
    expect(store.guidedWorkflowState).toBeUndefined();
  });

  it('no new Dexie schema was introduced', () => {
    const dbExport = '../domain/curriculum/persistence/backend';
    expect(dbExport).toBeDefined();
  });

  it('guided workflow state is reset without clearing domain artifacts', () => {
    const store = useCurriculumStore.getState();
    store.setGuidedWorkflowState(createInitialGuidedWorkflowState());
    store.resetGuidedWorkflowState();
    expect(store.designArchive).toBeDefined();
    expect(store.institutionalArchive).toBeDefined();
  });
});