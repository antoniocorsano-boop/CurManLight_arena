// Escapes RegExp special chars so user input can be embedded in new RegExp() safely.
export const escapeRegExp = (s: string): string =>
 s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
