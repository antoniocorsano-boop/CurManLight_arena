#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateRegistroPlanningContext } from './validate-registro-planning-context.mjs';

const root = new URL('../', import.meta.url);
const schemaUrl = new URL('docs/contracts/ARENA_REGISTRO_PLANNING_CONTEXT_V1.schema.json', root);
const corpusUrl = new URL('docs/contracts/fixtures/arena-registro-planning-context-v1-negative-corpus.json', root);

const clone = value => JSON.parse(JSON.stringify(value));

function applyMutation(target, mutation) {
  const path = mutation.path ?? [];
  if (!Array.isArray(path) || path.length === 0) throw new Error('invalid mutation path');
  let cursor = target;
  for (let index = 0; index < path.length - 1; index += 1) {
    cursor = cursor[path[index]];
    if (cursor === undefined || cursor === null) throw new Error(`missing mutation parent: ${path.join('.')}`);
  }
  const key = path[path.length - 1];
  if (mutation.op === 'set') {
    cursor[key] = mutation.value;
    return;
  }
  if (mutation.op === 'delete') {
    delete cursor[key];
    return;
  }
  throw new Error(`unsupported mutation op: ${mutation.op}`);
}

function materializeCase(base, testCase) {
  const candidate = clone(base);
  for (const mutation of testCase.mutations ?? []) applyMutation(candidate, mutation);
  return candidate;
}

function findVigenteRule(schema) {
  return (schema.allOf ?? []).find(rule => rule?.if?.properties?.vigencyStatus?.const === 'VIGENTE');
}

function schemaConformanceErrors(schema) {
  const errors = [];
  const requireTrue = (condition, message) => {
    if (!condition) errors.push(message);
  };

  requireTrue(schema.additionalProperties === false, 'root additionalProperties must be false');
  requireTrue(schema.properties?.structuralFingerprint?.additionalProperties === false, 'fingerprint additionalProperties must be false');
  requireTrue(schema.properties?.structuralFingerprint?.properties?.algorithm?.const === 'fnv1a', 'fingerprint algorithm must be fnv1a');
  requireTrue(schema.properties?.structuralFingerprint?.properties?.version?.const === 1, 'fingerprint version must be 1');
  requireTrue(schema.properties?.structuralFingerprint?.properties?.hash?.pattern === '^[0-9a-f]{8}$', 'fingerprint hash must be lowercase 8-hex');
  requireTrue(schema.properties?.provenance?.additionalProperties === false, 'provenance additionalProperties must be false');
  requireTrue(schema.properties?.provenance?.properties?.repository?.const === 'antoniocorsano-boop/CurManLight_arena', 'provenance repository must be canonical Arena repo');
  requireTrue(schema.properties?.provenance?.properties?.sourceCommit?.pattern === '^[0-9a-f]{40}$', 'sourceCommit must be exact SHA-40');
  requireTrue(schema.properties?.curricoloItems?.items?.additionalProperties === false, 'curricolo item additionalProperties must be false');
  requireTrue(schema.properties?.curricoloItems?.items?.properties?.kind?.const === 'ANNUALITA_DISCIPLINARE', 'curricolo kind must be ANNUALITA_DISCIPLINARE');

  const vigenteRule = findVigenteRule(schema);
  const receiptSchema = vigenteRule?.then?.properties?.authorityReceiptRef;
  requireTrue(receiptSchema?.type === 'string' && receiptSchema?.minLength === 1, 'VIGENTE authorityReceiptRef must be a non-empty string');

  return errors;
}

const schema = JSON.parse(await readFile(schemaUrl, 'utf8'));
const corpus = JSON.parse(await readFile(corpusUrl, 'utf8'));
const failures = [];

if (corpus.contract !== 'ARENA_REGISTRO_PLANNING_CONTEXT_V1' || corpus.corpusVersion !== 1) {
  failures.push('negative corpus identity/version mismatch');
}

const baseErrors = validateRegistroPlanningContext(corpus.base);
if (baseErrors.length > 0) {
  failures.push(`base payload must be valid: ${baseErrors.join('; ')}`);
}

for (const error of schemaConformanceErrors(schema)) failures.push(`schema drift: ${error}`);

for (const testCase of corpus.cases ?? []) {
  const candidate = materializeCase(corpus.base, testCase);
  const errors = validateRegistroPlanningContext(candidate);
  if (errors.length === 0) failures.push(`validator accepted negative case: ${testCase.id}`);
}

if (failures.length > 0) {
  console.error('ARENA_REGISTRO_PLANNING_CONTEXT_V1 CONFORMANCE FAIL');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`ARENA_REGISTRO_PLANNING_CONTEXT_V1 CONFORMANCE PASS ${corpus.cases.length} negative cases`);
  console.log(`schema=${fileURLToPath(schemaUrl)}`);
  console.log(`corpus=${fileURLToPath(corpusUrl)}`);
}
