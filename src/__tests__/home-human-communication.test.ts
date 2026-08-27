import { describe, expect, it } from 'vitest';
import type { UserRole } from '../types/curriculum';
import {
  auditHomePrimaryCommunication,
  getHomeRoleCommunication,
} from '../features/session/communication/homeCommunication';

const roles: UserRole[] = [
  'non-dichiarato',
  'insegnante',
  'dipartimento',
  'referente',
  'dirigente',
  'collegio',
  'amministratore',
];

describe('Home HCM projection', () => {
  it.each(roles)('keeps %s primary Home communication free from technical leakage and simulated authority', (role) => {
    expect(auditHomePrimaryCommunication(role)).toEqual([]);
  });

  it('projects technical terminology only into secondary technical detail', () => {
    const dirigente = getHomeRoleCommunication('dirigente');
    const primary = `${dirigente.eyebrow} ${dirigente.title} ${dirigente.summary}`;

    expect(primary).not.toMatch(/WCAG|AgID|GDPR/i);
    expect(dirigente.details.map((detail) => detail.label).join(' ')).toMatch(/WCAG \/ AgID/);
    expect(dirigente.details.map((detail) => detail.label).join(' ')).toMatch(/GDPR/);
  });

  it('uses role language without converting role context into institutional authority', () => {
    const department = getHomeRoleCommunication('dipartimento');
    const collegio = getHomeRoleCommunication('collegio');

    expect(department.title).toBe('Confronta il lavoro del dipartimento');
    expect(department.summary).toMatch(/preparatorie/);
    expect(department.summary).toMatch(/non producono effetti istituzionali/);
    expect(collegio.title).toBe('Materiali per il lavoro collegiale');
    expect(collegio.summary).toMatch(/percorso autenticato/);
  });

  it('keeps implementation-specific storage vocabulary out of administrator primary language', () => {
    const admin = getHomeRoleCommunication('amministratore');
    const primary = `${admin.eyebrow} ${admin.title} ${admin.summary}`;
    const technical = admin.details.map((detail) => detail.label).join(' ');

    expect(primary).not.toMatch(/IndexedDB|Dexie|Service Worker|PWA|JSON/i);
    expect(technical).toMatch(/IndexedDB \/ Dexie\.js/);
    expect(technical).toMatch(/Service Worker \/ cache PWA/);
    expect(technical).toMatch(/JSON/);
  });
});
