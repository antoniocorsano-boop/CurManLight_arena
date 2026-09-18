import { describe, expect, it } from 'vitest';
import { createCurriculumDatabase } from '../domain/curriculum/persistence/backend';
import {
  CURRICULUM_STATE_STORAGE_KEY,
  hasPersistedCurriculumState,
  useCurriculumStore,
} from '../store/useCurriculumStore';

type PersistedStateRecord = { key: string; value: string };

async function waitForPersistedRecord(timeoutMs = 3000): Promise<PersistedStateRecord> {
  const database = createCurriculumDatabase();
  const deadline = Date.now() + timeoutMs;

  try {
    while (Date.now() < deadline) {
      const record = (await database.table('state').get(CURRICULUM_STATE_STORAGE_KEY)) as PersistedStateRecord | undefined;
      if (record) return record;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  } finally {
    database.close();
  }

  throw new Error('Timed out waiting for the Zustand state to reach IndexedDB');
}

describe('persisted curriculum state authority', () => {
  it('proves the Zustand state is durably written to IndexedDB rather than localStorage', async () => {
    await useCurriculumStore.persist.clearStorage();
    localStorage.removeItem(CURRICULUM_STATE_STORAGE_KEY);
    expect(await hasPersistedCurriculumState()).toBe(false);

    useCurriculumStore.getState().setSchoolYear('2026/2027');

    const record = await waitForPersistedRecord();
    const payload = JSON.parse(record.value) as { state?: { schoolYear?: string } };

    expect(localStorage.getItem(CURRICULUM_STATE_STORAGE_KEY)).toBeNull();
    expect(payload.state?.schoolYear).toBe('2026/2027');
    expect(await hasPersistedCurriculumState()).toBe(true);

    await useCurriculumStore.persist.clearStorage();
  });
});
