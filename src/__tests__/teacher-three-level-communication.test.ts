import { describe, expect, it } from 'vitest';

function firstSource(modules: Record<string, string>): string {
  return Object.values(modules)[0] ?? '';
}

function between(source: string, start: string, end: string): string {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) return '';
  return source.slice(startIndex, endIndex);
}

const homeSource = firstSource(import.meta.glob('../features/session/components/DashboardView.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const revisionSource = firstSource(import.meta.glob('../features/curriculum/components/RevisioneTab.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const technologyReviewSource = firstSource(import.meta.glob('../domain/curriculum/validation/technologyClass1Review.ts', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

describe('Teacher three-level institutional communication', () => {
  it('keeps Home level 1 institutional, actionable and free of system jargon', () => {
    const level1 = between(homeSource, 'data-hcm-level="1"', 'data-hcm-level="2"');
    expect(level1).not.toBe('');
    expect(homeSource).toContain("title: 'Il mio lavoro sul curricolo'");
    expect(level1).toContain('{orientation.title}');
    expect(level1).toContain('Attività che richiedono il tuo intervento.');
    expect(level1).toContain('Non ci sono attività da completare in questo momento.');
    expect(level1).not.toMatch(/membership|assurance|\bgate\b|\bsha\b|handoff|\bexport\b|blocker|esito locale|workflow interno/i);
  });

  it('treats the teacher personal review as work to do, not as a read-only authority item', () => {
    expect(homeSource).toContain("const teacherReview = props.role === 'insegnante'");
    expect(homeSource).toContain("requiredCapability: teacherReview ? 'CURRICULUM_PROPOSE' : 'REVISION_REVIEW'");
    expect(homeSource).toContain("nextActorRole: teacherReview ? 'docente' : 'dipartimento'");
    expect(homeSource).toContain('schede da esaminare');
    expect(homeSource).toContain('registra il tuo orientamento professionale');
  });

  it('keeps Home explanations and access governance below the primary level', () => {
    expect(homeSource).toContain('data-hcm-level="2"');
    expect(homeSource).toContain('Il percorso di lavoro');
    expect(homeSource).toContain('data-hcm-level="3"');
    expect(homeSource).toContain('Ruoli e condizioni di accesso');
  });

  it('keeps the revision primary level focused on comparison and professional choice', () => {
    const level1 = between(revisionSource, 'data-hcm-level="1"', 'data-hcm-level="2"');
    expect(level1).not.toBe('');
    expect(level1).toContain('Il mio contributo alla revisione del curricolo');
    expect(level1).toContain('Conferma la proposta');
    expect(level1).toContain('Proponi una modifica');
    expect(revisionSource).toContain("current.keepLabel || 'Mantieni testo precedente'");
    expect(level1).toContain('{keepActionLabel}');
    expect(level1).not.toMatch(/\bgate\b|Drive|audit|TECHNOLOGY_REWORK|NON_DUPLICATION_CHECK/i);
  });

  it('places explanation at level 2 and raw traceability at level 3', () => {
    expect(revisionSource).toContain('data-hcm-level="2"');
    expect(revisionSource).toContain('Motivazione e criteri di esame');
    expect(revisionSource).toContain('Criteri per il confronto');
    expect(revisionSource).toContain('data-hcm-level="3"');
    expect(revisionSource).toContain('Fonti e tracciabilità');
    expect(revisionSource).toContain('Identificativi tecnici');
    expect(revisionSource).toContain('current.gateId');
    expect(revisionSource).toContain('current.sourceRefs');
  });

  it('uses teacher-facing labels and explanations in the active Tecnologia R2 proposals', () => {
    const r2 = technologyReviewSource.slice(technologyReviewSource.indexOf('TECHNOLOGY_CLASS1_REVIEW_PROPOSALS:'));
    expect(r2).toContain("oldLabel: 'Testo precedente'");
    expect(r2).toContain("newLabel: 'Proposta da esaminare'");
    expect(r2).toContain("keepLabel: 'Mantieni testo precedente'");
    expect(r2).not.toMatch(/contextSummary: '.*audit/i);
  });
});
