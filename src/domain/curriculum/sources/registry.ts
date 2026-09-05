import type { Source, SourceVersion } from './types';
import {
  isSourceUsableForContext,
  type SourceGovernanceRecord,
  type SourceUsageContext,
} from './governance';

/**
 * Provider-neutral registry projection. It does not replace SourceRepository or
 * SourceVersionRepository: it combines their canonical entities with the
 * governance record needed to decide contextual usability.
 */
export interface GovernedSourceVersion {
  source: Source;
  version: SourceVersion;
  governance: SourceGovernanceRecord;
}

export function listUsableSourcesForContext(
  entries: readonly GovernedSourceVersion[],
  context: SourceUsageContext,
): GovernedSourceVersion[] {
  return entries.filter(({ source, version, governance }) =>
    isSourceUsableForContext(source, version, governance, context)
  );
}

export function findGovernedSourceVersion(
  entries: readonly GovernedSourceVersion[],
  sourceId: Source['id'],
  sourceVersionId: SourceVersion['id'],
): GovernedSourceVersion | undefined {
  return entries.find(({ source, version }) =>
    source.id === sourceId && version.id === sourceVersionId
  );
}
