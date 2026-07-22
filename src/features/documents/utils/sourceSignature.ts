import type { UdaModel } from '../../../types/curriculum';

export function computeUdaSignature(uda: UdaModel): string {
  const parts = [
    uda.title,
    uda.discipline,
    uda.order,
    uda.period,
    String(uda.hours),
    uda.status,
    uda.traguardi.join('|'),
    uda.obiettivi.join('|'),
    uda.evidenze.join('|'),
    uda.realTask,
    uda.notes,
  ];
  return parts.join('::');
}

export function computeCurriculumSignature(
  discipline: string,
  order: string,
  decisions: Record<string, string>,
  customTexts: Record<string, string>,
  selectedTraguardi: number[],
  selectedObiettivi: number[]
): string {
  const parts = [
    discipline,
    order,
    JSON.stringify(decisions),
    JSON.stringify(customTexts),
    selectedTraguardi.join(','),
    selectedObiettivi.join(','),
  ];
  return parts.join('::');
}

export function hasSignatureChanged(
  currentSignature: string,
  recordedSignature: string
): boolean {
  return currentSignature !== recordedSignature;
}
