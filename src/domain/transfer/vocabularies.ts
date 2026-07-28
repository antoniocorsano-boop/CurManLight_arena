export type TransferArea = 'A11' | 'A02' | 'A03' | 'A04' | 'A07';

export const A11: TransferArea = 'A11';
export const A02: TransferArea = 'A02';
export const A03: TransferArea = 'A03';
export const A04: TransferArea = 'A04';
export const A07: TransferArea = 'A07';

export const VALID_AREAS: readonly TransferArea[] = [A11, A02, A03, A04, A07] as const;

export function isValidArea(value: string): value is TransferArea {
  return (VALID_AREAS as readonly string[]).includes(value);
}
