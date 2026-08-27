export const HUMAN_COMMUNICATION_MODEL_VERSION = '1.0.0' as const;

export type HcmTaskPhase =
  | 'ORIENT'
  | 'EXPLORE'
  | 'ACT'
  | 'REVIEW'
  | 'DECIDE'
  | 'RECOVER'
  | 'COMPLETE';

export type HcmDetailLevel = 'PRIMARY' | 'SECONDARY' | 'TECHNICAL';
export type HcmConsequenceLevel = 'NONE' | 'LOCAL' | 'INSTITUTIONAL';
export type HcmAuthorityState = 'NOT_REQUIRED' | 'UNVERIFIED' | 'VERIFIED';
export type HcmAuthoritySource = 'NONE' | 'EXTERNAL_DOMAIN';

export type HcmRoleTone = 'plain' | 'operational' | 'facilitative' | 'formal' | 'technical';
export type HcmTone =
  | HcmRoleTone
  | 'descriptive'
  | 'precise'
  | 'recovery'
  | 'confirmatory';

export type HcmAdaptiveMemoryCategory =
  | 'WORKING_CONTEXT'
  | 'DISPLAY_PREFERENCE'
  | 'RESUME_POINT'
  | 'ROLE_CONTEXT'
  | 'MEMBERSHIP'
  | 'DECISION_AUTHORITY'
  | 'INSTITUTIONAL_DECISION'
  | 'RECEIPT';

export type HcmMemoryPolicy = 'ADAPTIVE_CONTEXT' | 'CANONICAL_SOURCE_REQUIRED';

export interface HcmAuthorityContext {
  state: HcmAuthorityState;
  source: HcmAuthoritySource;
}

export interface HcmContext {
  roleId: string;
  roleTone?: HcmRoleTone;
  phase: HcmTaskPhase;
  detailLevel: HcmDetailLevel;
  consequence: HcmConsequenceLevel;
  authority: HcmAuthorityContext;
}

export interface HcmTermSpec {
  id: string;
  human: string;
  technical?: string;
  roleVariants?: Readonly<Record<string, string>>;
  phaseVariants?: Partial<Record<HcmTaskPhase, string>>;
}

export interface HcmProjection {
  text: string;
  tone: HcmTone;
  detailLevel: HcmDetailLevel;
  authorityState: HcmAuthorityState;
  authoritySource: HcmAuthoritySource;
  memoryIsNonAuthoritative: true;
}

export interface HcmValidationResult {
  valid: boolean;
  errors: string[];
}

const adaptiveMemoryCategories = new Set<HcmAdaptiveMemoryCategory>([
  'WORKING_CONTEXT',
  'DISPLAY_PREFERENCE',
  'RESUME_POINT',
  'ROLE_CONTEXT',
]);

const primaryTechnicalPatterns: ReadonlyArray<{ label: string; pattern: RegExp }> = [
  { label: 'UUID', pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i },
  { label: 'CML_*', pattern: /\bCML_[A-Z0-9_]+\b/ },
  { label: 'SHA-256', pattern: /\bSHA-?256\b/i },
  { label: 'RPC', pattern: /\bRPC\b/ },
  { label: 'RLS', pattern: /\bRLS\b/ },
  { label: 'database table', pattern: /\b(?:database|tabella)\s+(?:table|db|database)\b/i },
];

export function resolveHcmTone(context: HcmContext): HcmTone {
  switch (context.phase) {
    case 'ORIENT':
      return 'plain';
    case 'EXPLORE':
      return 'descriptive';
    case 'ACT':
      return context.roleTone ?? 'operational';
    case 'REVIEW':
      return 'precise';
    case 'DECIDE':
      return 'formal';
    case 'RECOVER':
      return 'recovery';
    case 'COMPLETE':
      return 'confirmatory';
  }
}

export function projectHcmTerm(spec: HcmTermSpec, context: HcmContext): HcmProjection {
  let text = spec.human;

  if (context.detailLevel === 'TECHNICAL' && spec.technical) {
    text = spec.technical;
  } else if (spec.phaseVariants?.[context.phase]) {
    text = spec.phaseVariants[context.phase] as string;
  } else if (spec.roleVariants?.[context.roleId]) {
    text = spec.roleVariants[context.roleId];
  }

  return {
    text,
    tone: resolveHcmTone(context),
    detailLevel: context.detailLevel,
    authorityState: context.authority.state,
    authoritySource: context.authority.source,
    memoryIsNonAuthoritative: true,
  };
}

export function getHcmMemoryPolicy(category: HcmAdaptiveMemoryCategory): HcmMemoryPolicy {
  return adaptiveMemoryCategories.has(category) ? 'ADAPTIVE_CONTEXT' : 'CANONICAL_SOURCE_REQUIRED';
}

export function canUseAdaptiveHcmMemory(category: HcmAdaptiveMemoryCategory): boolean {
  return getHcmMemoryPolicy(category) === 'ADAPTIVE_CONTEXT';
}

export function detectPrimaryTechnicalLeak(text: string): string[] {
  return primaryTechnicalPatterns
    .filter(({ pattern }) => pattern.test(text))
    .map(({ label }) => label);
}

export function validateHcmContext(context: HcmContext): HcmValidationResult {
  const errors: string[] = [];

  if (!context.roleId.trim()) {
    errors.push('roleId is required as communication context');
  }

  if (context.authority.state === 'VERIFIED' && context.authority.source !== 'EXTERNAL_DOMAIN') {
    errors.push('verified authority must come from the external domain');
  }

  if (context.authority.state === 'NOT_REQUIRED' && context.authority.source !== 'NONE') {
    errors.push('not-required authority cannot claim an external authority source');
  }

  if (context.consequence === 'INSTITUTIONAL' && context.authority.state === 'NOT_REQUIRED') {
    errors.push('institutional consequence requires an explicit authority state');
  }

  return { valid: errors.length === 0, errors };
}

export function hcmAuthorityDisclosure(context: HcmContext):
  | 'AUTHORITY_NOT_REQUIRED'
  | 'AUTHORITY_UNVERIFIED'
  | 'AUTHORITY_VERIFIED_BY_DOMAIN' {
  if (context.authority.state === 'NOT_REQUIRED') return 'AUTHORITY_NOT_REQUIRED';
  if (context.authority.state === 'UNVERIFIED') return 'AUTHORITY_UNVERIFIED';
  return 'AUTHORITY_VERIFIED_BY_DOMAIN';
}
