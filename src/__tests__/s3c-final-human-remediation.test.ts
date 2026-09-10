import { describe, expect, it } from 'vitest';

function firstSource(modules: Record<string, string>): string {
  return Object.values(modules)[0] ?? '';
}

const viewsSource = firstSource(import.meta.glob('../features/session/components/AppViewsLayer.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const curriculumWorkspaceSource = firstSource(import.meta.glob('../features/curriculum/CurriculumWorkspace.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const curriculumReaderSource = firstSource(import.meta.glob('../features/curriculum/components/ProfessionalCurriculumReader.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const curriculumPublicationSource = firstSource(import.meta.glob('../features/curriculum/components/DepartmentCurriculumPublication.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const globalCssSource = firstSource(import.meta.glob('../index.css', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const handoffSource = firstSource(import.meta.glob('../features/beta/PlanningHandoffPreview.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

describe('Arena S3C final human remediation', () => {
  it('keeps curriculum, review and planning as explicit distinct steps', () => {
    expect(curriculumWorkspaceSource).toContain('<ProfessionalCurriculumReader');
    expect(curriculumReaderSource).toContain('data-canonical-curriculum-entry');
    expect(curriculumReaderSource).toContain('data-open-technology-review-class');
    expect(curriculumReaderSource).toContain('La consultazione del curricolo resta separata dal Riesame.');
    expect(curriculumReaderSource).not.toContain('Riesame H2');
    expect(curriculumWorkspaceSource).toContain("props.handleTabSwitch('revisione')");
    expect(viewsSource).toContain("props.activeTab === 'revisione'");
    expect(viewsSource).toContain('<CaseAwareRevisionSurface');
    expect(viewsSource).toContain('data-teacher-surface="revision"');
    expect(viewsSource).toContain("props.activeTab === 'progetta-annuale'");
    expect(viewsSource).toContain('<ProgettazioneTab');
    expect(viewsSource).toContain('data-teacher-surface="planning"');
  });

  it('renders the planning handoff from the canonical Documents surface', () => {
    expect(viewsSource).toContain("props.activeTab === 'esportazioni'");
    expect(viewsSource).toContain('<PlanningHandoffPreview />');
    expect(viewsSource).toContain('data-teacher-surface="documents"');
  });

  it('keeps the planning handoff visible and understandable even when blocked', () => {
    expect(handoffSource).toContain('data-human-task="planning-handoff"');
    expect(handoffSource).toContain('data-human-handoff-status={preview.status}');
    expect(handoffSource).toContain('Passaggio alla progettazione');
    expect(handoffSource).toContain('Qui vedi cosa Arena prepara per Docente OS.');
    expect(handoffSource).toContain('Il passaggio non è ancora pronto');
    expect(handoffSource).toContain('Quando sarà pronto');
    expect(handoffSource).toContain('Docente OS dovrà controllarlo e accettarlo prima di usarlo.');
    expect(handoffSource).toContain('Nessuna classe, UDA o lezione viene modificata automaticamente.');
  });

  it('provides an explicit local handoff action without downstream writes', () => {
    expect(handoffSource).toContain('data-human-next-action="download-planning-handoff"');
    expect(handoffSource).toContain('Scarica passaggio per Docente OS');
    expect(handoffSource).toContain("new Blob([JSON.stringify(preview.handoff, null, 2)]");
    expect(handoffSource).toContain('Nessuna scrittura in Docente OS è stata eseguita.');
    expect(handoffSource).not.toContain('fetch(');
    expect(handoffSource).not.toContain('supabase');
    expect(handoffSource).not.toContain('text-[10px]');
  });

  it('assigns portrait mobile table scrolling to a dedicated curriculum wrapper', () => {
    expect(curriculumPublicationSource).toContain('data-curriculum-table-scroll');
    expect(curriculumPublicationSource).toContain('data-curriculum-publication-grid');
    expect(curriculumPublicationSource).toContain('overflow-x-auto');
    expect(curriculumPublicationSource).toContain('tabIndex={0}');
    expect(curriculumPublicationSource).toContain('scorri orizzontalmente per leggere tutte le colonne');
  });

  it('preserves native table layout while the curriculum wrapper owns touch scrolling', () => {
    expect(globalCssSource).toContain('#main-content [data-curriculum-table-scroll]');
    expect(globalCssSource).toContain('touch-action: pan-x pan-y;');
    expect(globalCssSource).toContain('#main-content [data-curriculum-table-scroll] > [data-curriculum-publication-grid]');
    expect(globalCssSource).toContain('display: table;');
    expect(globalCssSource).toContain('min-width: 720px;');
    expect(globalCssSource).toContain('max-width: none;');
  });
});
