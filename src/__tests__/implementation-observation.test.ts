import { describe, expect, it } from 'vitest';
import {
  buildImplementationObservation,
  countImplementationSignals,
} from '../domain/curriculum/implementationObservation';
import { buildDidacticBinding } from '../domain/curriculum/didacticBinding';
import type { UdaModel } from '../types/curriculum';
import observationPanelRaw from '../features/progettazione/components/ImplementationObservationPanel.tsx?raw';

const makeUda = (withBinding = true): UdaModel => ({
  id: 'uda-pratica-1',
  title: 'UDA di prova',
  discipline: 'tecnologia',
  order: 'secondaria',
  period: 'Ottobre',
  hours: 8,
  status: 'bozza',
  traguardi: ['Traguardo'],
  obiettivi: ['Obiettivo'],
  evidenze: ['Evidenza'],
  realTask: 'Compito',
  notes: '',
  curriculumBindings: withBinding ? [buildDidacticBinding({
    targetType: 'uda',
    order: 'secondaria',
    targetClass: '1',
    disciplineOrField: 'tecnologia',
    createdAt: '2026-09-07T03:00:00.000Z',
  })] : undefined,
  createdAt: '2026-09-07T03:00:00.000Z',
});

describe('ImplementationObservation', () => {
  it('records a professional signal against the same curriculum binding without changing the curriculum', () => {
    const observation = buildImplementationObservation({
      uda: makeUda(),
      signal: 'MISSING_PREREQUISITE',
      note: 'Il prerequisito va anticipato nella progressione.',
      personalDataAbsentConfirmed: true,
      createdAt: '2026-09-07T03:30:00.000Z',
    });

    expect(observation.kind).toBe('IMPLEMENTATION_OBSERVATION');
    expect(observation.signal).toBe('MISSING_PREREQUISITE');
    expect(observation.didacticBindingId).toContain('DB:uda:');
    expect(observation.curriculumUnit.masterId).toBe('CAN-CURR-MASTER-00');
    expect(observation.curriculumUnit.masterVersion).toBe('1.3');
    expect(observation.personalDataDeclaration).toBe('DECLARED_ABSENT');
    expect(observation.containsStudentPersonalData).toBe(false);
    expect(observation.automaticCurriculumChange).toBe(false);
    expect(observation.reviewState).toBe('RECORDED_FOR_AGGREGATION');
  });

  it('fails closed without a didactic binding or the personal-data absence confirmation', () => {
    expect(() => buildImplementationObservation({
      uda: makeUda(false),
      signal: 'TOO_EARLY',
      personalDataAbsentConfirmed: true,
    })).toThrow('MISSING_DIDACTIC_BINDING');

    expect(() => buildImplementationObservation({
      uda: makeUda(),
      signal: 'TOO_EARLY',
      personalDataAbsentConfirmed: false,
    })).toThrow('PERSONAL_DATA_ABSENCE_NOT_CONFIRMED');
  });

  it('requires a professional note for the generic OTHER signal', () => {
    expect(() => buildImplementationObservation({
      uda: makeUda(),
      signal: 'OTHER',
      personalDataAbsentConfirmed: true,
    })).toThrow('OTHER_SIGNAL_REQUIRES_NOTE');
  });

  it('aggregates signals without producing a score or an automatic review decision', () => {
    const first = buildImplementationObservation({
      uda: makeUda(),
      signal: 'DUPLICATED',
      personalDataAbsentConfirmed: true,
      createdAt: '2026-09-07T03:30:00.000Z',
    });
    const second = buildImplementationObservation({
      uda: makeUda(),
      signal: 'DUPLICATED',
      personalDataAbsentConfirmed: true,
      createdAt: '2026-09-07T03:31:00.000Z',
    });

    expect(countImplementationSignals([first, second])).toEqual({ DUPLICATED: 2 });
  });

  it('keeps the teacher-facing action explicit about privacy and non-automatic curriculum change', () => {
    expect(observationPanelRaw).toContain('Riesame dalla pratica');
    expect(observationPanelRaw).toContain('L’osservazione non modifica il curricolo e non valuta il docente.');
    expect(observationPanelRaw).toContain('non contiene nomi, voti, diagnosi o altri dati personali degli alunni');
    expect(observationPanelRaw).toContain('Registra per il riesame');
    expect(observationPanelRaw).toContain('non viene aperto automaticamente');
  });
});
