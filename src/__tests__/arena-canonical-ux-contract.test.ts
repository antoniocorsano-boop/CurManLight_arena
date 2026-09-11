import { describe, expect, it } from 'vitest';
import uxContractRaw from '../../.human/arena-ux.contract.json?raw';
import uxDocRaw from '../../docs/04_product_experience/12_CANONICAL_UX_CONTRACT.md?raw';
import visionRaw from '../../docs/04_product_experience/00_VISION.md?raw';
import navigationRaw from '../../docs/04_product_experience/02_NAVIGATION_MODEL.md?raw';

const ux = JSON.parse(uxContractRaw) as {
  contract_id: string;
  version: string;
  status: string;
  primary_navigation: Array<{ id: string; label: string }>;
  global_invariants: Record<string, boolean>;
  curriculum: {
    default_projection: string;
    projections: string[];
    annuality_selector_semantics: string;
    review_state_must_not_select_annuality: boolean;
    review_availability_must_not_disable_annuality: boolean;
    selectors_must_derive_from_canonical_curriculum_data: boolean;
    hardcoded_discipline_to_section_mapping_forbidden_as_target_architecture: boolean;
    ordinary_mobile_consultation_must_not_depend_on_horizontal_tables: boolean;
    contextual_actions: Record<string, string>;
  };
  trama: {
    relations_must_be_typed_and_traceable: boolean;
    unknown_relations_fail_closed: boolean;
    mobile_requires_pan_zoom: boolean;
    mobile_vertical_fallback_required: boolean;
  };
  review: {
    separate_from_curriculum_consultation: boolean;
    entry_requires_explicit_intent: boolean;
    review_case_availability_must_not_change_curriculum_readability: boolean;
  };
  mobile: {
    primary_navigation: string[];
    curriculum_explore_uses_semantic_cards: boolean;
    page_level_horizontal_overflow_forbidden: boolean;
    touch_target_min_px: number;
  };
  implementation_prohibitions: string[];
};

describe('Arena canonical UX contract', () => {
  it('freezes the four primary professional environments and keeps Fascicolo secondary', () => {
    expect(ux.contract_id).toBe('ARENA_UX_CONTRACT');
    expect(ux.version).toBe('1.0.0');
    expect(ux.status).toBe('CANONICAL_UX_CONTRACT');
    expect(ux.primary_navigation.map((item) => item.id)).toEqual([
      'my_work',
      'curriculum',
      'planning',
      'review',
    ]);
    expect(ux.primary_navigation.map((item) => item.label)).toEqual([
      'Il mio lavoro',
      'Curricolo',
      'Progettazione',
      'Riesame',
    ]);
    expect(navigationRaw).toContain('IL MIO LAVORO · CURRICOLO · PROGETTAZIONE · RIESAME');
    expect(visionRaw).toContain('IL MIO LAVORO · CURRICOLO · PROGETTAZIONE · RIESAME');
  });

  it('keeps curriculum consultation independent from review availability and review target state', () => {
    expect(ux.curriculum.default_projection).toBe('explore');
    expect(ux.curriculum.projections).toEqual(['explore', 'trama', 'document']);
    expect(ux.curriculum.annuality_selector_semantics).toBe('changes_only_the_consulted_annuality');
    expect(ux.curriculum.review_state_must_not_select_annuality).toBe(true);
    expect(ux.curriculum.review_availability_must_not_disable_annuality).toBe(true);
    expect(ux.review.separate_from_curriculum_consultation).toBe(true);
    expect(ux.review.entry_requires_explicit_intent).toBe(true);
    expect(ux.review.review_case_availability_must_not_change_curriculum_readability).toBe(true);
    expect(ux.implementation_prohibitions).toContain('do_not_use_review_target_class_to_choose_curriculum_annuality');
    expect(ux.implementation_prohibitions).toContain('do_not_disable_curriculum_annuality_because_review_is_unavailable');
  });

  it('requires data-driven curriculum selectors and semantic mobile reading', () => {
    expect(ux.curriculum.selectors_must_derive_from_canonical_curriculum_data).toBe(true);
    expect(ux.curriculum.hardcoded_discipline_to_section_mapping_forbidden_as_target_architecture).toBe(true);
    expect(ux.curriculum.ordinary_mobile_consultation_must_not_depend_on_horizontal_tables).toBe(true);
    expect(ux.mobile.curriculum_explore_uses_semantic_cards).toBe(true);
    expect(ux.mobile.page_level_horizontal_overflow_forbidden).toBe(true);
    expect(ux.mobile.touch_target_min_px).toBeGreaterThanOrEqual(44);
    expect(ux.mobile.primary_navigation).toEqual(['my_work', 'curriculum', 'planning', 'review']);
  });

  it('keeps Trama fail-closed and does not turn it into an inference canvas', () => {
    expect(ux.trama.relations_must_be_typed_and_traceable).toBe(true);
    expect(ux.trama.unknown_relations_fail_closed).toBe(true);
    expect(ux.trama.mobile_requires_pan_zoom).toBe(false);
    expect(ux.trama.mobile_vertical_fallback_required).toBe(true);
    expect(ux.implementation_prohibitions).toContain('do_not_create_graph_edges_without_recorded_or_validated_relation_evidence');
  });

  it('documents the five distinct contextual actions from a curriculum unit', () => {
    expect(ux.curriculum.contextual_actions).toEqual({
      trama: 'Vedi nella Trama',
      planning: 'Usa in Progettazione',
      review: 'Segnala per il Riesame',
      source: 'Vedi fonte',
      document: 'Apri Documento',
    });
    for (const label of Object.values(ux.curriculum.contextual_actions)) {
      expect(uxDocRaw).toContain(label);
    }
  });

  it('keeps the key interaction invariants machine-readable', () => {
    expect(ux.global_invariants.one_environment_one_intent).toBe(true);
    expect(ux.global_invariants.one_control_one_meaning).toBe(true);
    expect(ux.global_invariants.one_dominant_object_per_context).toBe(true);
    expect(ux.global_invariants.one_primary_action_per_task_context).toBe(true);
    expect(ux.global_invariants.preserve_context_across_handoffs).toBe(true);
    expect(ux.global_invariants.technical_traceability_not_level_1).toBe(true);
    expect(ux.global_invariants.authority_fails_closed).toBe(true);
    expect(ux.global_invariants.no_duplicate_user_facing_surface_for_same_task).toBe(true);
  });
});
