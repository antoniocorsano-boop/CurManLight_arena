import { describe, expect, it } from 'vitest';
import { appTabToPath, pathnameToAppTab } from '../features/navigation/appRouting';


describe('BETA-G4 revision routing contract', () => {
  it('risolve /revisione nella vista revisione e mantiene distinto /curriculum', () => {
    expect(pathnameToAppTab('/revisione')).toBe('revisione');
    expect(pathnameToAppTab('/revisione/proposta-1')).toBe('revisione');
    expect(pathnameToAppTab('/curriculum')).toBe('curricolo');
    expect(appTabToPath('revisione')).toBe('/revisione');
    expect(appTabToPath('curricolo')).toBe('/curriculum');
  });

  it('usa /fonti come destinazione canonica mantenendo leggibili i deep link legacy /settings', () => {
    expect(appTabToPath('fonti')).toBe('/fonti');
    expect(pathnameToAppTab('/fonti')).toBe('fonti');
    expect(pathnameToAppTab('/settings')).toBe('fonti');
  });

  it('mantiene stabili le altre destinazioni applicative principali', () => {
    expect(pathnameToAppTab('/planning')).toBe('progetta-annuale');
    expect(pathnameToAppTab('/documents')).toBe('esportazioni');
    expect(pathnameToAppTab('/knowledge')).toBe('second-brain');
    expect(appTabToPath('progetta-annuale')).toBe('/planning');
  });
});
