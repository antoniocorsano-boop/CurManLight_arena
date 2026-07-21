import type { AppViewsLayerProps } from '../../features/session';

type PickKeys<T, K extends keyof T> = Pick<T, K>;

export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): PickKeys<T, K> {
 const result = {} as PickKeys<T, K>;
 for (const key of keys) {
  result[key] = obj[key];
 }
 return result;
}

export type { AppViewsLayerProps };
