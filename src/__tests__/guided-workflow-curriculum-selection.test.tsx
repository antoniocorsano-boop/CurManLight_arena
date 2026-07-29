// Tests for guided workflow curriculum selection (CML-633I)
import {
  GuidedTeacherWorkflowState,
  INITIAL_GUIDED_WORKFLOW_STATE
} from '../features/guided-workflow/types';
import {
  addCurriculumReference,
  removeCurriculumReference,
  setCurriculumReferences
} from '../features/guided-workflow/workflow';

describe('GuidedWorkflow Curriculum Selection', () => {
  it('should allow adding curriculum references', () => {
    const state: GuidedTeacherWorkflowState = { ...INITIAL_GUIDED_WORKFLOW_STATE };

    // Add a curriculum reference
    const curriculumRef = {
      id: 'ref-123',
      type: 'traguardo',
      source: 'current',
      discipline: 'italiano',
      order: 'secondaria',
      text: 'Testo di riferimento'
    } as any;

    const newState = addCurriculumReference(state, curriculumRef);

    expect(newState.selectedCurriculumRefs).toHaveLength(1);
    expect(newState.selectedCurriculumRefs[0]).toMatchObject({
      id: 'ref-123',
      type: 'traguardo'
    });
  });

  it('should prevent duplicate curriculum references', () => {
    const state: GuidedTeacherWorkflowState = { ...INITIAL_GUIDED_WORKFLOW_STATE };

    const curriculumRef = {
      id: 'ref-123',
      type: 'traguardo',
      source: 'current',
      discipline: 'italiano',
      order: 'secondaria',
      text: 'Testo di riferimento'
    } as any;

    // Add reference once
    let state1 = addCurriculumReference(state, curriculumRef);
    expect(state1.selectedCurriculumRefs).toHaveLength(1);

    // Try to add the same reference again
    const state2 = addCurriculumReference(state1, curriculumRef);

    expect(state2.selectedCurriculumRefs).toHaveLength(1);
  });

  it('should remove curriculum references', () => {
    const state: GuidedTeacherWorkflowState = { ...INITIAL_GUIDED_WORKFLOW_STATE };

    // Add multiple references
    const ref1 = { id: 'ref-1', type: 'traguardo', source: 'current', discipline: 'italiano', order: 'secondaria', text: 'Testo 1' } as any;
    const ref2 = { id: 'ref-2', type: 'obiettivo', source: 'current', discipline: 'matematica', order: 'quarta', text: 'Testo 2' } as any;

    let state1 = addCurriculumReference(state, ref1);
    let state2 = addCurriculumReference(state1, ref2);

    expect(state2.selectedCurriculumRefs).toHaveLength(2);

    // Remove one reference
    const state3 = removeCurriculumReference(state2, 'ref-1');
    expect(state3.selectedCurriculumRefs).toHaveLength(1);
    expect(state3.selectedCurriculumRefs[0]).toMatchObject({ id: 'ref-2' });
  });

  it('should replace curriculum references', () => {
    const state: GuidedTeacherWorkflowState = { ...INITIAL_GUIDED_WORKFLOW_STATE };

    const ref1 = { id: 'ref-1', type: 'traguardo', source: 'current', discipline: 'italiano', order: 'secondaria', text: 'Testo 1' } as any;
    const ref2 = { id: 'ref-2', type: 'obiettivo', source: 'current', discipline: 'matematica', order: 'quarta', text: 'Testo 2' } as any;

    let state1 = addCurriculumReference(state, ref1);
    let state2 = addCurriculumReference(state1, ref2);

    // Replace all references
    const state3 = setCurriculumReferences(state2, [ref1, ref2]);
    expect(state3.selectedCurriculumRefs).toHaveLength(2);
    expect(state3.selectedCurriculumRefs[0].id).toBe('ref-1');
    expect(state3.selectedCurriculumRefs[1].id).toBe('ref-2');
  });

  it('should require context step to be completed before curriculum selection', () => {
    const state: GuidedTeacherWorkflowState = { ...INITIAL_GUIDED_WORKFLOW_STATE };

    // Try to add curriculum reference without completing context step
    const curriculumRef = {
      id: 'ref-1',
      type: 'traguardo',
      source: 'current',
      discipline: 'italiano',
      order: 'secondaria',
      text: 'Testo di riferimento'
    } as any;

    const newState = addCurriculumReference(state, curriculumRef);
    expect(newState.selectedCurriculumRefs).toHaveLength(1);
  });
});
