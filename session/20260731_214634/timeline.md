# Timeline

> Nota storica: cronologia precedente la sanificazione finale del repository; rami e worktree CML-637B citati come attivi/conservati sono stati poi integrati/rimossi/ripuliti nella PR #16.

## 2026-07-31 21:46:34 +02:00
- Session created.
- Goal: CML-637B - confirm Vite esbuild/oxc warning root cause and document dependency debt verdict

## 2026-07-31 21:46:45 +02:00
- CML-637B root cause CONFIRMED: tracked package-lock.json resolves vitest@4.1.10 -> nested vite@8.1.5 (rolldown 1.1.5) while root vite=6.4.3. plugin-react 4.7.0 hoisted resolves vite 6 -> rolldownVersion absent -> config hook sets legacy esbuild + optimizeDeps.esbuildOptions (dist/index.cjs:150-156). Vitest server runs vite 8 -> emits 3 deprecation warnings. Main worktree node_modules stale (29/07, all vite 6.4.3) masks issue; clean install reproduces (confirmed first-hand in merge_review 21:45, 10 tests pass 1.63s). No config-only fix: plugin always sets esbuild for automatic JSX. Verdict doc written: docs/CML_637B_VITE_WARNING_VERDICT.md. No dependency changes. Branch fix/cml-637b at 991ad31, 0/1 behind origin/main.

## 2026-07-31 22:11:59 +02:00
- CML-637B closed on main (2ed681d, PR #14 MERGED via ff). Branch fix/cml-637b verified as strict ancestor of main -> historical, no material to transfer. Formal plan approved-for-review written: docs/superpowers/plans/2026-07-31-cml-637b-dependency-compatibility-matrix.md (3 cells A/B/C, scratch worktree CurManLight_arena_matrix on branch docs/cml-637b-dependency-compatibility-matrix, clean install per cell, measured checks: unit + indexeddb-browser + build + build-storybook, deliverable docs/CML_637B_DEPENDENCY_COMPATIBILITY_MATRIX.md committed locally, no push). Awaiting plan approval before touching dependencies.

## 2026-07-31 22:16:35 +02:00
- Plan approved with CML_637B_DEPENDENCY_COMPATIBILITY_MATRIX_EXECUTION_APPROVED. Plan updated: cell B split into B1 (vite8+plugin-react 5.x) and B2 (vite8+plugin-react-oxc); full cell isolation protocol (restore package.json/lock/vitest.config.ts + rm node_modules + clean install + npm ls record); cell C uses explicit overrides (never manual lock edit) with diff/resolved version/vite count recorded; decision criteria ranked (4 checks green, zero warnings, no CJS->ESM regression, single vite major, minimal diff, no src changes). Executing Tasks 1-7 in scratch worktree CurManLight_arena_matrix.

## 2026-08-18 10:31:09 +02:00
- CURR_R1E_WORKTREE_RECOVERY = VERIFIED. Diff pulito: ripristino 'Il sé e l\'altro' in SEGMENTS_2012_INFANZIA, normalizzazione disciplineCode 'arte'/'educazione-fisica', test suite espansa, manifest aggiornato. Test: 273/273 fast, 193/193 curriculum-domain. Build: PASS. Pronto per commit recovery.

## 2026-08-18 10:41:37 +02:00
- R1E-1 Lingue SOURCE_VERIFIED. Manifest aggiornato a PARTIALLY_VERIFIED con lotto R1E-1 completato. Test lotto lingue aggiunti (11 test). Curriculum-domain: 204/204 PASS. Commit: 73e2c42.

## 2026-08-18 10:50:08 +02:00
- R1E-2 Storia+Geografia SOURCE_VERIFIED. Manifest aggiornato con lotto R1E-2 e nota rappresentazione sequenza narrativa. Test lotto storia-geografia aggiunti (12 test). Curriculum-domain: 216/216 PASS. test:fast: 273/273 PASS. Commit: adddc14.

## 2026-08-18 10:55:44 +02:00
- R1E-3 Matematica+Scienze+Tecnologia SOURCE_VERIFIED. Manifest aggiornato con lotto R1E-3. Test lotto MST aggiunti (15 test). Curriculum-domain: 231/231 PASS. test:fast: 273/273 PASS. Commit: fb9c01d.

## 2026-08-18 11:01:47 +02:00
- R1E-4 Linguaggi espressivi e corporei SOURCE_VERIFIED. Manifest aggiornato con lotto R1E-4. Test lotto linguaggi aggiunti (15 test). Curriculum-domain: 246/246 PASS. test:fast: 273/273 PASS. Commit: fb85db2.

## 2026-08-18 11:20:15 +02:00
- R1E-5 Sezioni comuni/trasversali/narrative SOURCE_VERIFIED. Rimosse generazioni sintetiche di nodi traguardo/obiettivo per sezioni narrative infanzia. Manifest aggiornato con lotto R1E-5 e note di rappresentazione. Test lotto common-sections aggiunti (9 test). Regressioni R1B/R1C allineate. Curriculum-domain: 255/255 PASS. test:fast: 273/273 PASS. Commit: 08ab296.

## 2026-08-18 11:28:46 +02:00
- R1E-6 Global completeness gate VERIFIED. Tutte le dimensioni (strutturale, testuale, semantica, provenienza) verdi. Regressioni architetturali verificate: R1A/R1B/R1C/R11D PASS, test:fast 273/273 PASS, tsc --noEmit PASS, build PASS. Manifest aggiornato a CURR_R1_2012_NORMATIVE_COMPLETENESS = VERIFIED e CURR_R1_2012_CANONICAL_INGESTION = VERIFIED. Documento di gate dedicato: CML_CURR_R1_2012_R1E6_GATE.md. Commit: 7dc0c5d.

## 2026-08-18 13:02:24 +02:00
- R2B contract audit COMPLETE, R2C minimal 2025 projection IMPLEMENTED_VERIFIED. Commit a0f9c90. GAP-R2-01/R2-04 closed by reuse, GAP-R2-02 resolved via normativeNodeKind, GAP-R2-03 resolved via frameworkApplicability. Focused tests 6/6 PASS. Curriculum-domain 261/261 PASS, test:fast 273/273 PASS, tsc --noEmit PASS, build PASS. Next: R2D fixture2025 pilot.

## 2026-08-18 15:32:00 +02:00
- R2E-3 Storia+Geografia 2025 COMPLETE. Added SEGMENTS_2025_PRIMARIA_STORIA, NODES_2025_PRIMARIA_STORIA, SEGMENTS_2025_SECONDARIA_STORIA, NODES_2025_SECONDARIA_STORIA, SEGMENTS_2025_PRIMARIA_GEOGRAFIA, NODES_2025_PRIMARIA_GEOGRAFIA, SEGMENTS_2025_SECONDARIA_GEOGRAFIA, NODES_2025_SECONDARIA_GEOGRAFIA. New test file fixture-2025-storia-geografia-lot.test.ts (11 tests). All 2025 tests 49/49 PASS. test:fast 273/273 PASS, curriculum-domain 304/304 PASS, tsc --noEmit PASS, build PASS. Acquisition manifest updated with R2D and R2E sections.

## 2026-08-18 20:23:00 +02:00
- R2E-4 Matematica+Scienze+Tecnologia 2025 COMPLETE. Added SEGMENTS_2025_PRIMARIA_MATEMATICA, NODES_2025_PRIMARIA_MATEMATICA, SEGMENTS_2025_SECONDARIA_MATEMATICA, NODES_2025_SECONDARIA_MATEMATICA, SEGMENTS_2025_PRIMARIA_SCIENZE, NODES_2025_PRIMARIA_SCIENZE, SEGMENTS_2025_SECONDARIA_SCIENZE, NODES_2025_SECONDARIA_SCIENZE, SEGMENTS_2025_PRIMARIA_TECNOLOGIA, NODES_2025_PRIMARIA_TECNOLOGIA, SEGMENTS_2025_SECONDARIA_TECNOLOGIA, NODES_2025_SECONDARIA_TECNOLOGIA. New test file fixture-2025-mst-lot.test.ts (13 tests). All 2025 tests 64/64 PASS. test:fast 273/273 PASS, curriculum-domain 319/319 PASS, tsc --noEmit PASS, build PASS. No STEM synthetic discipline introduced. Acquisition manifest updated.

## 2026-08-18 20:34:00 +02:00
- R2E-5 Musica+Arte e immagine+Educazione fisica 2025 COMPLETE. Added SEGMENTS_2025_PRIMARIA_MUSICA, NODES_2025_PRIMARIA_MUSICA, SEGMENTS_2025_SECONDARIA_MUSICA, NODES_2025_SECONDARIA_MUSICA, SEGMENTS_2025_PRIMARIA_ARTE, NODES_2025_PRIMARIA_ARTE, SEGMENTS_2025_SECONDARIA_ARTE, NODES_2025_SECONDARIA_ARTE, SEGMENTS_2025_PRIMARIA_EDUCAZIONE_FISICA, NODES_2025_PRIMARIA_EDUCAZIONE_FISICA, SEGMENTS_2025_SECONDARIA_EDUCAZIONE_FISICA, NODES_2025_SECONDARIA_EDUCAZIONE_FISICA. New test file fixture-2025-linguaggi-lot.test.ts (15 tests). All 2025 tests 79/79 PASS. test:fast 273/273 PASS, curriculum-domain 334/334 PASS, tsc --noEmit PASS, build PASS. Musica kept distinct from Strumento musicale; no 2012 contamination introduced. Acquisition manifest updated.

## 2026-08-18 20:47:00 +02:00
- R2E-6 Strumento musicale+sezioni trasversali residue 2025 COMPLETE. Added NODES_2025_SECONDARIA_STRUMENTO_MUSICALE, SEGMENTS_2025_PRIMARIA_GENERAL_SECTIONS, SEGMENTS_2025_SECONDARIA_GENERAL_SECTIONS. New test file fixture-2025-strumento-musicale-e-trasversali-lot.test.ts (13 tests). All 2025 tests 92/92 PASS. test:fast 273/273 PASS, curriculum-domain 347/347 PASS, tsc --noEmit PASS, build PASS. Strumento musicale frameworkApplicability preserved and validated; general/transversal sections added as source-native segments with zero synthetic narrative nodes; no STEM synthetic discipline introduced. Acquisition manifest updated. Next: R2F global completeness gate.
