import type { UdaModel } from '../../../types/curriculum';
import type { A04ToA07Payload } from '../../../domain/transfer/areaContracts';
import type { A07InstitutionalDocumentRead } from '../../../domain/institution';
import type { ValidationError, ValidationResult } from '../../../domain/transfer/validators';

export class UdaMappingError extends Error {
  readonly code: string;
  readonly field: string;

  constructor(problem: ValidationError) {
    super(problem.message);
    this.name = 'UdaMappingError';
    this.code = problem.code;
    this.field = problem.field;
  }
}

export function validateUdaForDocumentMapping(uda: UdaModel): ValidationResult {
  const errors: ValidationError[] = [];

  if (!uda.id || uda.id.trim() === '') {
    errors.push({ code: 'REFERENCE_MISSING', message: 'La progettazione non ha un identificativo.', field: 'id' });
  }
  if (!uda.title || uda.title.trim() === '') {
    errors.push({ code: 'MISSING_TITLE', message: 'La progettazione non ha un titolo.', field: 'title' });
  }
  if (!uda.discipline || uda.discipline.trim() === '') {
    errors.push({ code: 'MISSING_DISCIPLINE', message: 'La progettazione non ha una disciplina.', field: 'discipline' });
  }
  if (!uda.order) {
    errors.push({ code: 'MISSING_ORDER', message: 'La progettazione non ha un ordine scolastico.', field: 'order' });
  }

  return errors.length > 0
    ? { valid: false, errors, warnings: [] }
    : { valid: true, errors: [], warnings: [] };
}

function curriculumRefsFrom(uda: UdaModel): string[] {
  const refs = [
    ...(Array.isArray(uda.traguardi) ? uda.traguardi : []),
    ...(Array.isArray(uda.obiettivi) ? uda.obiettivi : []),
    ...(Array.isArray(uda.evidenze) ? uda.evidenze : []),
  ];
  return refs.filter((r): r is string => typeof r === 'string' && r.trim() !== '');
}

function pickDefined<T extends Record<string, unknown>>(record: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (value !== undefined) out[key] = value;
  }
  return out as T;
}

export function buildA04ToA07PayloadFromUda(
  uda: UdaModel,
  institutionalRead: A07InstitutionalDocumentRead,
  now = new Date().toISOString(),
): A04ToA07Payload {
  const validation = validateUdaForDocumentMapping(uda);
  if (!validation.valid) {
    throw new UdaMappingError(validation.errors[0]);
  }

  const warnings: string[] = [];
  if (!institutionalRead.configured) {
    warnings.push('Configurazione istituzionale incompleta: verrà usata un\'intestazione neutra.');
  }

  return {
    designId: `uda-${uda.id}`,
    curriculumRefs: curriculumRefsFrom(uda),
    sources: [uda.id],
    institutionalContext: pickDefined({
      instituteName: institutionalRead.instituteName,
      mechanicalCode: institutionalRead.mechanicalCode,
      siteName: institutionalRead.siteName,
      academicYearLabel: institutionalRead.academicYearLabel,
      declaredRole: institutionalRead.declaredRole,
      configured: institutionalRead.configured,
    }),
    teachingStructure: pickDefined({
      id: uda.id,
      title: uda.title,
      discipline: uda.discipline,
      order: uda.order,
      period: uda.period,
      hours: uda.hours,
      status: uda.status,
      traguardi: [...(Array.isArray(uda.traguardi) ? uda.traguardi : [])],
      obiettivi: [...(Array.isArray(uda.obiettivi) ? uda.obiettivi : [])],
      evidenze: [...(Array.isArray(uda.evidenze) ? uda.evidenze : [])],
      realTask: uda.realTask,
      notes: uda.notes,
    }),
    assistedContentOrigin: 'teacher',
    versionOrSnapshot: uda.updatedAt ?? uda.createdAt,
    warnings,
    metadata: { sessionTimestamp: now },
  };
}
