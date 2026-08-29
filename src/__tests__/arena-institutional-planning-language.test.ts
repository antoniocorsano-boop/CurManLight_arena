import { describe, expect, it } from 'vitest';
import progettazioneSource from '../features/progettazione/components/ProgettazioneTab.tsx?raw';

const forbiddenPersonalOrClassroomCopy = [
  'Area di progettazione personale',
  'questo dispositivo d\'aula',
  'Area di progettazione personale e locale',
  'bozza UDA personale',
  'nella tua programmazione annuale',
] as const;

describe('Arena S2C institutional planning language', () => {
  it('keeps the canonical planning surface institutional/curricular rather than personal/classroom-owned', () => {
    for (const phrase of forbiddenPersonalOrClassroomCopy) {
      expect(progettazioneSource, `Forbidden Arena planning copy still present: ${phrase}`).not.toContain(phrase);
    }
  });

  it('retains curriculum-design vocabulary in the canonical planning surface', () => {
    expect(progettazioneSource).toContain('Unità di Apprendimento');
    expect(progettazioneSource).toContain('traguardi');
    expect(progettazioneSource).toContain('obiettivi');
  });
});
