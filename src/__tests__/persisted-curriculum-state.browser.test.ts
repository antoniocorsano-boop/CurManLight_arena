import { describe, expect, it } from 'vitest';
import {
  CURRICULUM_STATE_STORAGE_KEY,
  hasPersistedCurriculumState,
  useCurriculumStore,
} from '../store/useCurriculumStore';

describe('persisted curriculum state authority', () => {
  it('detects the Zustand state in IndexedDB rather than localStorage', async () => {
    await useCurriculumStore.persist.clearStorage();
    localStorage.removeItem(CURRICULUM_STATE_STORAGE_KEY);
    expect(await hasPersistedCurriculumState()).toBe(false);

    useCurriculumStore.getState().setSchoolYear('2026/2027');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(localStorage.getItem(CURRICULUM_STATE_STORAGE_KEY)).toBeNull();
    expect(await hasPersistedCurriculumState()).toBe(true);

    await useCurriculumStore.persist.clearStorage();
  });
});
