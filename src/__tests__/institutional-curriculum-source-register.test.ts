import { describe, expect, it } from 'vitest';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from '../domain/curriculum/institute/currentSource';
import {
  INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCE_COUNT,
  INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES,
  INSTITUTE_CURRICULUM_SOURCE_CHAIN,
  INSTITUTE_CURRICULUM_SOURCE_REPERTORY,
} from '../domain/curriculum/institute/sourceRegister';
import currentPanelSource from '../features/documents/components/InstituteCurrentSourcePanel.tsx?raw';
import panelSource from '../features/documents/components/InstituteCurriculumSourceRegisterPanel.tsx?raw';
import localRegistrySource from '../features/documents/components/FontiTab.tsx?raw';
import workspaceSource from '../features/documents/components/FontiWorkspace.tsx?raw';

describe('institutional curriculum source register', () => {
  it('binds ALL-CURR-A 1.1 to the current master 1.3 without creating a competing baseline', () => {
    expect(INSTITUTE_CURRICULUM_SOURCE_REPERTORY.repertoryId).toBe('ALL-CURR-A');
    expect(INSTITUTE_CURRICULUM_SOURCE_REPERTORY.driveFileId).toBe(
      '1MBZKbis6i6xg50z6fKgbh9yUianJXdhZ5jsK4r852PQ',
    );
    expect(INSTITUTE_CURRICULUM_SOURCE_REPERTORY.version).toBe('1.1');
    expect(INSTITUTE_CURRICULUM_SOURCE_REPERTORY.authorityInferenceFromPresence).toBe(false);
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceRepertory.driveFileId).toBe(
      INSTITUTE_CURRICULUM_SOURCE_REPERTORY.driveFileId,
    );
    expect(INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceRepertory.alignmentState).toBe(
      'ALIGNED_TO_MASTER_1_3',
    );
  });

  it('preserves one explicit document chain for baseline, control, repertory and provenance', () => {
    expect(INSTITUTE_CURRICULUM_SOURCE_CHAIN).toHaveLength(4);
    expect(INSTITUTE_CURRICULUM_SOURCE_CHAIN.map((item) => item.id)).toEqual([
      'CAN-CURR-MASTER-00',
      'MATR-CURR-MASTER-01',
      'ALL-CURR-A',
      'PRIMARY-CORRECTED-PROVENANCE',
    ]);
    expect(INSTITUTE_CURRICULUM_SOURCE_CHAIN[0].driveFileId).toBe(
      '12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4',
    );
    expect(INSTITUTE_CURRICULUM_SOURCE_CHAIN[0].version).toBe('1.3');
    expect(INSTITUTE_CURRICULUM_SOURCE_CHAIN[1].role).toBe('CONTROL_ATTACHMENT_NOT_CURRICULUM_BASELINE');
    expect(INSTITUTE_CURRICULUM_SOURCE_CHAIN[3].role).toBe('PRIMARY_CORRECTED_PROVENANCE');
  });

  it('registers the authoritative sources used by master 1.3 with unique codes and verifiable locators', () => {
    expect(INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCE_COUNT).toBe(11);
    const codes = INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES.map((source) => source.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toEqual(['N2', 'N4', 'N5', 'N6', 'N10', 'N11', 'N13', 'N17', 'N18', 'N19', 'N20']);

    for (const source of INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES) {
      expect(source.locator).toMatch(/^https:\/\//);
      expect(source.issuer.length).toBeGreaterThan(0);
      expect(source.roleInMaster.length).toBeGreaterThan(0);
      expect(source.applicability.length).toBeGreaterThan(0);
      expect(source.verifiedAt).toBe('2026-09-06');
    }
  });

  it('distinguishes official locators from the institutional transmission copy used for Nota 1312', () => {
    const note1312 = INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES.find((source) => source.code === 'N17');
    expect(note1312?.locatorKind).toBe('INSTITUTIONAL_MIRROR');
    expect(note1312?.verificationState).toBe('ACT_VERIFIED_INSTITUTIONAL_MIRROR');
    expect(note1312?.locator).toContain('icgigiproietti.edu.it');

    const otherSources = INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES.filter((source) => source.code !== 'N17');
    expect(otherSources.every((source) => source.locatorKind === 'OFFICIAL')).toBe(true);
    expect(otherSources.every((source) => source.verificationState === 'OFFICIAL_SOURCE_VERIFIED')).toBe(true);
  });

  it('places master, institutional sources and local archive in the intended hierarchy', () => {
    const currentMasterIndex = workspaceSource.indexOf('<InstituteCurrentSourcePanel />');
    const sourceRegisterIndex = workspaceSource.indexOf('<InstituteCurriculumSourceRegisterPanel />');
    const localRegistryIndex = workspaceSource.indexOf('<SourceRegistry {...props} />');
    expect(currentMasterIndex).toBeGreaterThan(-1);
    expect(sourceRegisterIndex).toBeGreaterThan(currentMasterIndex);
    expect(localRegistryIndex).toBeGreaterThan(sourceRegisterIndex);
    expect(workspaceSource).not.toContain('data-source-authority-entry');
    expect(workspaceSource).toContain('Controlli tecnici');
    expect(workspaceSource).toContain('data-hcm-level="3"');
  });

  it('keeps one dominant level 1 and demotes source interpretation and traceability', () => {
    expect(currentPanelSource).toContain('data-hcm-level="1"');
    expect(currentPanelSource).toContain('Baseline corrente');
    expect(currentPanelSource).toContain('Materializzazione 3–14 completa · Validazione professionale aperta');

    expect(panelSource).not.toContain('data-hcm-level="1"');
    expect(panelSource).toContain('data-hcm-level="2"');
    expect(panelSource).toContain('data-hcm-level="3"');
    expect(panelSource).toContain('Consulta le {INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCE_COUNT} fonti');
    expect(panelSource).toContain('Dati di tracciabilità');
    expect(panelSource).toContain('Verifica la catena documentale');
  });

  it('keeps source authority and technical traceability available without showing every field by default', () => {
    expect(panelSource).toContain('Fonti normative e istituzionali del curricolo');
    expect(panelSource).toContain('data-source-locator-kind');
    expect(panelSource).toContain('data-source-verification');
    expect(panelSource).toContain('Uso nel master:');
    expect(panelSource).toContain('Applicabilità:');
    expect(panelSource).toContain('Ultima verifica:');
    expect(panelSource).toContain('Apri la fonte ufficiale');
    expect(panelSource).toContain('Apri la copia istituzionale di trasmissione');
    expect(panelSource).toContain('Verifica della fonte ≠ validazione del contenuto curricolare ≠ decisione istituzionale ≠ curricolo vigente.');
  });

  it('demotes the legacy/local registry to one collapsed tertiary surface and removes the duplicate Fonti header', () => {
    const localStart = localRegistrySource.indexOf('data-local-source-registry');
    const localOpening = localRegistrySource.slice(localStart, localStart + 300);
    expect(localStart).toBeGreaterThan(-1);
    expect(localOpening).toContain('data-hcm-level="3"');
    expect(localRegistrySource).toContain('Archivio locale e fonti personali');
    expect(localRegistrySource).toContain('Materiali inclusi in Arena');
    expect(localRegistrySource).toContain('Fonti personali');
    expect(localRegistrySource).not.toContain('<h1 className="text-lg font-black text-slate-900">Fonti</h1>');
    expect(localRegistrySource).not.toContain('Fonti incluse nella copia locale');
  });
});
