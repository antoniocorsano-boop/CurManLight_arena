import { describe, expect, it } from 'vitest';
import {
  CML_ORDINARY_CLOUD_COST_POLICY,
  assertCmlOutboundPackageWithinCostGuard,
} from '../domain/backup';
import backupSinkSource from '../infrastructure/googleDrive/googleDriveBackupSink.ts?raw';
import backupActionSource from '../features/documents/components/SourceRegistryDriveBackupAction.tsx?raw';
import tokenProviderSource from '../infrastructure/googleDrive/googleIdentityAccessToken.ts?raw';
import contractSource from '../../docs/architecture/CML_DRIVE_SOURCE_BOUNDARY.md?raw';

const MIB = 1024 * 1024;

describe('CML-DRIVE-01 zero-cost-by-design guard', () => {
  it('freezes ordinary cloud behavior to explicit, one-shot, outbound-only use', () => {
    expect(CML_ORDINARY_CLOUD_COST_POLICY).toEqual({
      mode: 'zero-cost-by-design',
      networkTrigger: 'explicit-human-action',
      backgroundNetworkAllowed: false,
      automaticBackupAllowed: false,
      pollingAllowed: false,
      bidirectionalSyncAllowed: false,
      maxConcurrentOutboundBackups: 1,
      maxOutboundPackageBytes: 25 * MIB,
    });
  });

  it('blocks invalid and oversized packages deterministically', () => {
    expect(() => assertCmlOutboundPackageWithinCostGuard(0))
      .toThrow('CLOUD_COST_GUARD_PACKAGE_SIZE_INVALID');
    expect(() => assertCmlOutboundPackageWithinCostGuard(25 * MIB))
      .not.toThrow();
    expect(() => assertCmlOutboundPackageWithinCostGuard((25 * MIB) + 1))
      .toThrow('CLOUD_COST_GUARD_PACKAGE_TOO_LARGE');
  });

  it('enforces the package cap before OAuth and before provider traffic', () => {
    const guardIndex = backupSinkSource.indexOf('assertCmlOutboundPackageWithinCostGuard(packageBytes.byteLength)');
    const tokenIndex = backupSinkSource.indexOf('await this.accessTokenProvider()');
    const networkIndex = backupSinkSource.indexOf('await this.fetchImpl(DRIVE_RESUMABLE_CREATE_URL');

    expect(guardIndex).toBeGreaterThan(-1);
    expect(tokenIndex).toBeGreaterThan(guardIndex);
    expect(networkIndex).toBeGreaterThan(tokenIndex);
  });

  it('contains no autonomous backup loop, polling or inbound Drive capability', () => {
    for (const source of [backupSinkSource, backupActionSource, tokenProviderSource]) {
      expect(source).not.toContain('setInterval(');
      expect(source).not.toContain('watch(');
      expect(source).not.toContain('polling');
    }
    expect(backupSinkSource).not.toContain('listFiles');
    expect(backupSinkSource).not.toContain('downloadFromDrive');
    expect(backupActionSource).toContain('state !== \'working\'');
    expect(backupActionSource).toContain('data-cloud-cost-policy="zero-cost-by-design"');
  });

  it('makes the cost rule part of the canonical CML-DRIVE-01 contract', () => {
    expect(contractSource).toContain('zero-cost-by-design');
    expect(contractSource).toContain('polling, scansioni periodiche di Drive, backup automatici e sincronizzazione bidirezionale sono vietati');
    expect(contractSource).toContain('25 MiB');
    expect(contractSource).toContain('prima di OAuth e prima della rete');
  });
});
