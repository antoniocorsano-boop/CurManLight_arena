import type { Plugin } from 'vite';
import { createRequire } from 'node:module';

const requireCjs = createRequire(import.meta.url);

function isMapLike(val: unknown): val is { entries(): IterableIterator<unknown> } {
  return typeof val === 'object' && val !== null && typeof (val as any).entries === 'function';
}

function serializeMapLike(val: { entries(): Iterable<unknown> }): string {
  const entries = [...val.entries()];
  const serializedEntries = entries.map(([k, v]) => `[${serializeCjsValue(k)},${serializeCjsValue(v)}]`);
  return `new Map([${serializedEntries.join(',')}])`;
}

function serializeCjsValue(val: unknown): string {
  if (val instanceof Map) return `new Map(${JSON.stringify([...val])})`;
  if (val instanceof Set) return `new Set(${JSON.stringify([...val])})`;
  if (typeof val === 'function') return '(function(){})';
  if (Array.isArray(val)) return '[' + val.map(serializeCjsValue).join(',') + ']';
  if (typeof val === 'object' && val !== null) {
    if (isMapLike(val)) return serializeMapLike(val);
    const entries = Object.entries(val).map(([k, v]) => `${JSON.stringify(k)}:${serializeCjsValue(v)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(val);
}

export function cjsEsmBridge(): Plugin {
  const resolved = new Map<string, string>();

  return {
    name: 'cjs-esm-bridge',
    enforce: 'pre',
    config() {
      return {
        optimizeDeps: {
          include: ['aria-query', 'lz-string', 'pretty-format'],
        },
      };
    },
    resolveId(source) {
      if (source === 'aria-query' || source === 'lz-string') return `\0cjs-bridge:${source}`;
    },
    load(id) {
      if (!id.startsWith('\0cjs-bridge:')) return null;
      const pkgName = id.slice('\0cjs-bridge:'.length);
      if (resolved.has(id)) return resolved.get(id)!;

      const mod = requireCjs(pkgName);
      const keys = Object.keys(mod).filter(k => k !== '__esModule' && k !== 'module.exports');
      const lines: string[] = [];
      for (const k of keys) lines.push(`export const ${k} = ${serializeCjsValue(mod[k])};`);
      lines.push(`export default ${serializeCjsValue(mod)};`);
      const code = lines.join('\n');
      resolved.set(id, code);
      return code;
    },
  };
}
