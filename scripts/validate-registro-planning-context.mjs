#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const CONTRACT = 'ARENA_REGISTRO_PLANNING_CONTEXT_V1';

const nonEmpty = value => typeof value === 'string' && value.trim().length > 0;
const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
const hasOnlyKeys = (value, allowed) => isObject(value) && Object.keys(value).every(key => allowed.has(key));

const ROOT_KEYS = new Set([
  'contract',
  'contractVersion',
  'sourceProduct',
  'targetProduct',
  'importMode',
  'acceptanceRequired',
  'automaticWriteAllowed',
  'instituteName',
  'schoolYear',
  'sourceSchoolYear',
  'schoolOrder',
  'subjectCode',
  'gradeLevel',
  'cohortRef',
  'cohortRefKind',
  'normativeRegime',
  'applicabilityStatus',
  'authorityState',
  'vigencyStatus',
  'authorityReceiptRef',
  'masterId',
  'masterVersion',
  'structuralFingerprint',
  'provenance',
  'curricoloItems',
  'privacyClass'
]);
const FINGERPRINT_KEYS = new Set(['scope', 'algorithm', 'version', 'hash']);
const PROVENANCE_KEYS = new Set(['repository', 'sourceCommit', 'sourceDocumentId', 'sourceRevisionId']);
const CURRICOLO_ITEM_KEYS = new Set(['id', 'kind', 'schoolStage', 'gradeLabel', 'sourceSection', 'text']);

export function validateRegistroPlanningContext(value) {
  const errors = [];
  if (!isObject(value)) return ['payload must be an object'];
  if (!hasOnlyKeys(value, ROOT_KEYS)) errors.push('payload contains unexpected properties');

  if (value.contract !== CONTRACT) errors.push(`contract must be ${CONTRACT}`);
  if (value.contractVersion !== 1) errors.push('contractVersion must be 1');
  if (value.sourceProduct !== 'ARENA') errors.push('sourceProduct must be ARENA');
  if (value.targetProduct !== 'REGISTRO_DOCENTE') errors.push('targetProduct must be REGISTRO_DOCENTE');
  if (value.importMode !== 'PREVIEW_ONLY') errors.push('importMode must be PREVIEW_ONLY');
  if (value.acceptanceRequired !== true) errors.push('acceptanceRequired must be true');
  if (value.automaticWriteAllowed !== false) errors.push('automaticWriteAllowed must be false');

  ['instituteName', 'schoolYear', 'sourceSchoolYear', 'subjectCode', 'cohortRef', 'normativeRegime', 'masterId', 'masterVersion'].forEach(field => {
    if (!nonEmpty(value[field])) errors.push(`${field} is required`);
  });
  if (!['primaria', 'secondaria'].includes(value.schoolOrder)) errors.push('invalid schoolOrder');
  if (!Number.isInteger(value.gradeLevel) || value.gradeLevel < 1 || value.gradeLevel > 5) errors.push('gradeLevel must be an integer from 1 to 5');
  if (value.cohortRefKind !== 'DERIVED_APPLICABILITY_KEY') errors.push('cohortRefKind must be DERIVED_APPLICABILITY_KEY');
  if (!['APPLICABLE', 'TRANSITIONAL'].includes(value.applicabilityStatus)) errors.push('invalid applicabilityStatus');
  if (!['APPROVED', 'PROVISIONAL_COMPLETE'].includes(value.authorityState)) errors.push('invalid authorityState');
  if (!['VIGENTE', 'NON_VIGENTE'].includes(value.vigencyStatus)) errors.push('invalid vigencyStatus');

  if (value.authorityState === 'PROVISIONAL_COMPLETE' && value.vigencyStatus !== 'NON_VIGENTE') {
    errors.push('PROVISIONAL_COMPLETE must remain NON_VIGENTE');
  }
  if (value.vigencyStatus === 'VIGENTE') {
    if (value.authorityState !== 'APPROVED') errors.push('VIGENTE requires APPROVED');
    if (!nonEmpty(value.authorityReceiptRef)) errors.push('VIGENTE requires authorityReceiptRef');
  } else if (value.authorityReceiptRef !== undefined && value.authorityReceiptRef !== null && typeof value.authorityReceiptRef !== 'string') {
    errors.push('authorityReceiptRef must be a string or null');
  }

  const fingerprint = value.structuralFingerprint;
  if (
    !isObject(fingerprint) ||
    !hasOnlyKeys(fingerprint, FINGERPRINT_KEYS) ||
    fingerprint.scope !== 'MASTER' ||
    fingerprint.algorithm !== 'fnv1a' ||
    fingerprint.version !== 1 ||
    !/^[0-9a-f]{8}$/.test(fingerprint.hash ?? '')
  ) {
    errors.push('invalid MASTER structuralFingerprint');
  }

  const provenance = value.provenance;
  if (
    !isObject(provenance) ||
    !hasOnlyKeys(provenance, PROVENANCE_KEYS) ||
    provenance.repository !== 'antoniocorsano-boop/CurManLight_arena' ||
    !/^[0-9a-f]{40}$/.test(provenance.sourceCommit ?? '') ||
    !nonEmpty(provenance.sourceDocumentId) ||
    !nonEmpty(provenance.sourceRevisionId)
  ) {
    errors.push('complete Arena provenance is required');
  }

  if (!Array.isArray(value.curricoloItems) || value.curricoloItems.length === 0) {
    errors.push('curricoloItems must be non-empty');
  } else {
    value.curricoloItems.forEach((item, index) => {
      if (
        !isObject(item) ||
        !hasOnlyKeys(item, CURRICOLO_ITEM_KEYS) ||
        !nonEmpty(item.id) ||
        item.kind !== 'ANNUALITA_DISCIPLINARE' ||
        !nonEmpty(item.schoolStage) ||
        !nonEmpty(item.gradeLabel) ||
        !nonEmpty(item.sourceSection) ||
        !nonEmpty(item.text)
      ) {
        errors.push(`curricoloItems[${index}] is incomplete or non-canonical`);
      }
    });
  }

  if (value.privacyClass !== 'PROFESSIONAL_NON_PERSONAL') errors.push('privacyClass must be PROFESSIONAL_NON_PERSONAL');
  return errors;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error(`Usage: node scripts/validate-registro-planning-context.mjs <${CONTRACT}.json>`);
    process.exitCode = 2;
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    console.error(`${CONTRACT} FAIL unreadable payload: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
    return;
  }

  const errors = validateRegistroPlanningContext(payload);
  if (errors.length > 0) {
    console.error(`${CONTRACT} FAIL`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log(`${CONTRACT} PASS ${file}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
