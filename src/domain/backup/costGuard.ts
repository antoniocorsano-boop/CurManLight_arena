export const CML_ORDINARY_CLOUD_COST_POLICY = {
  mode: 'zero-cost-by-design',
  networkTrigger: 'explicit-human-action',
  backgroundNetworkAllowed: false,
  automaticBackupAllowed: false,
  pollingAllowed: false,
  bidirectionalSyncAllowed: false,
  maxConcurrentOutboundBackups: 1,
  maxOutboundPackageBytes: 25 * 1024 * 1024,
} as const;

export type CmlOrdinaryCloudCostPolicy = typeof CML_ORDINARY_CLOUD_COST_POLICY;

/**
 * CML-DRIVE-01 cost guard.
 *
 * “Zero-cost-by-design” is a product invariant, not a guarantee about future
 * third-party pricing. Arena must not require a paid cloud tier for ordinary
 * operation and must not autonomously generate recurring provider traffic.
 */
export function assertCmlOutboundPackageWithinCostGuard(packageByteLength: number): void {
  if (!Number.isSafeInteger(packageByteLength) || packageByteLength <= 0) {
    throw new Error('CLOUD_COST_GUARD_PACKAGE_SIZE_INVALID');
  }
  if (packageByteLength > CML_ORDINARY_CLOUD_COST_POLICY.maxOutboundPackageBytes) {
    throw new Error('CLOUD_COST_GUARD_PACKAGE_TOO_LARGE');
  }
}
