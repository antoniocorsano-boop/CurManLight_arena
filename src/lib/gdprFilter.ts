export function filterGdpr(text: string): string {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(\+39\s?)?(\d{3}\s?\d{3}\s?\d{4}|\d{10})/g;
  const cfRegex = /[A-Z]{6}\d{2}[A-EHLMPR-T]\d{2}[A-Z]\d{3}[A-Z]/g;

  return text
    .replace(emailRegex, '[EMAIL REDATTA]')
    .replace(phoneRegex, '[TELEFONO REDATTO]')
    .replace(cfRegex, '[CF REDATTO]');
}

export function containsPersonalData(text: string): boolean {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+39\s?)?(\d{3}\s?\d{3}\s?\d{4}|\d{10})/;
  const cfRegex = /[A-Z]{6}\d{2}[A-EHLMPR-T]\d{2}[A-Z]\d{3}[A-Z]/;

  return emailRegex.test(text) || phoneRegex.test(text) || cfRegex.test(text);
}
const INCLUSIVE_SENSITIVE_PATTERNS = [
  /\b(104)\b/gi,
  /\b(dsa)\b/gi,
  /\b(bes)\b/gi,
  /\b(pei)\b/gi,
  /\b(pdp)\b/gi,
  /\b(disabilit(?:a|\u00e0))\b/gi,
  /\b(clinica)\b/gi,
  /\b(medica)\b/gi,
  /\b(psicolog\w*)\b/gi,
  /\b(neuro\w*)\b/gi,
  /\b(diagnostic\w*)\b/gi,
  /\b(terapi\w*)\b/gi,
  /\b(sanitari\w*)\b/gi,
  /\b(sindrome)\b/gi,
  /\b(certificazion[ei])\b/gi
];

export function sanitizeInclusiveSensitiveTerms(text: string): string {
  return INCLUSIVE_SENSITIVE_PATTERNS.reduce(
    (sanitized, pattern) => sanitized.replace(pattern, '[misura inclusiva]'),
    text
  );
}

export function containsInclusiveSensitiveTerms(text: string): boolean {
  return INCLUSIVE_SENSITIVE_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}
