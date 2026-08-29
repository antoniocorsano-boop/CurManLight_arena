import { describe, expect, it } from 'vitest';
import progettazioneSource from '../features/progettazione/components/ProgettazioneTab.tsx?raw';

const forbiddenPersonalOrClassroomCopy = [
  'Area di progettazione personale',
  'questo dispositivo d\'aula',
  'Area di progettazione personale e locale',
  'bozza UDA personale',
  'nella tua programmazione annuale',
  'Assistente Ergonomico d\'Aula',
  'schermo d\'aula',
  'criteri personali',
  'Quadro generale personale',
  'per la tua classe',
  'Non hai ancora pianificato Unità di Apprendimento per questa classe',
] as const;

describe('Arena S2C institutional planning language', () => {
  it('keeps the canonical planning surface institutional/curricular rather than personal/classroom-owned', () => {
    const violations = forbiddenPersonalOrClassroomCopy.filter((phrase) => progettazioneSource.includes(phrase));
    expect(violations, `Forbidden Arena planning copy still present: ${violations.join(' | ')}`).toEqual([]);
  });

  it('retains curriculum-design vocabulary in the canonical planning surface', () => {
    expect(progettazioneSource).toContain('Unità di Apprendimento');
    expect(progettazioneSource).toContain('traguardi');
    expect(progettazioneSource).toContain('obiettivi');
  });
});
