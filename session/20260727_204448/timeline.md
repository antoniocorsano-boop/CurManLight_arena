# Timeline

## 2026-07-27 20:44:48 +02:00
- Session created.
- Goal: Implement CML-633D Task 9 A07 institutional integration with strict TDD, no commit

## 2026-07-27 20:45:08 +02:00
- Mapped Task 9 call graph. Design: derive one A07 selector read in App and pass through existing document/view/modal contracts; tests first for selector, exports, packages, previews, warnings.

## 2026-07-27 21:01:57 +02:00
- A07 selector and all active Task 9 consumers implemented. Red tests observed for missing facade (2), six integration boundaries, and direct PDF identity; selector/integration tests and tsc now green. Starting regression verification.

## 2026-07-27 21:16:13 +02:00
- Task 9 complete without commit. Final verification: 170/170 focused tests in 6 files passed; npx tsc --noEmit exit 0; git diff --check exit 0 with only pre-existing CRLF warnings. Added A07 facade, all export/package/template/modal wiring, persistent warnings, neutral SCORM IDs. Unrelated dirty files preserved.

## 2026-07-28 04:04:48 +02:00
- Follow-up A07 findings fixed with TDD. Added shared full header projection plus optional declared role, escaped HTML/XML profile interpolation, neutralized authority wording and SCORM LMS/author/package claims, removed duplicate years, expanded clipboard/UDA/SCORM/neutral regression tests. Final focused tests 174/174 green using threads/maxWorkers=1; tsc and diff check green. No commit.

## 2026-07-28 04:08:46 +02:00
- Starting final A07 gaps: TDD for canonical site template labels and body-only generated documents with single modal/PDF projection framing. No commit.

## 2026-07-28 04:11:55 +02:00
- Final A07 gaps implemented with TDD: bilingual template now uses canonical site/fallback; generated docs are body-only; integration suite 47/47 green. Starting regression, type, build, and diff verification.

## 2026-07-28 04:16:14 +02:00
- CML-633D A07 final gaps complete without commit. Bilingual template labels use canonical siteName or exact Sede non configurata; generated programmazione/relazione/grade-specific text is body-only, with modal and print applying canonical heading/footer once. TDD red observed (5 failures), then green. Verification: targeted integration 47/47; affected 5-file set 139/139; document continuity 55/55; full suite 996/996; npx tsc --noEmit exit 0; npm run build exit 0; git diff --check exit 0 with CRLF warnings only. Unrelated dirty files preserved.

## 2026-07-28 04:21:03 +02:00
- Final A07 clipboard gap fixed with TDD, no commit. Root cause: DocumentViewModal preview projected canonical identity but clipboard passed raw body. Clipboard now composes projection headerLines + body + optional footer once, preserving body-only generators and print behavior. Neutral/configured regression tests observed red (2 failures) then green. Focused institution integration 49/49 passed; npx tsc --noEmit passed; scoped git diff --check passed with CRLF notice only.

## 2026-07-28 04:25:36 +02:00
- A07 useTemplateEngine stale identity fixed with TDD, no commit. Root cause: initial assistant text captured institutionalProfile in useState initializer. Initial assistant message is now derived on each render while user/assistant conversation entries remain separate state, so archive profile changes update display identity without replacing real chat history. Neutral-to-configured rerender regression observed red (stale neutral), then green with conversation preserved. Focused institution integration 50/50 passed; npx tsc --noEmit passed; scoped diff check passed with CRLF notice only.

## 2026-07-28 04:43:17 +02:00
- All requested A07 quality findings fixed with TDD, no commit. Red run: 9 failures covering structured projection, escaping, rapid template updates, timer cleanup, and final warning toast. Projection now exposes primaryHeading/displayName/secondaryLines/footer and all consumers use named fields. Active A07 HTML/document.write and SCORM HTML/XML boundaries escape imported/institutional/curriculum/UDA/title/label/identifier values with safe formatter-owned newline breaks. Template engine uses atomic reducer completions against latest state, functional conversation accumulation, tracked timer removal and unmount cleanup. Export/UDA package actions emit one final warning-aware toast; generators retain standalone warning. Final focused institution suites 116/116 passed; npx tsc --noEmit passed; scoped diff check passed with CRLF notices only. Source curriculum data untouched.

## 2026-07-28 05:09:12 +02:00
- CML-633D Task 10 complete without commit. Strict TDD red: hardcode scan found 45 active violations; neutral Wiki fallback and historical-source tests failed; narrowed demo allowlist produced expected failure; Volume 14/19 historical tests failed. Green: 7 files/177 tests, npx tsc --noEmit, npm run build, and git diff --check (CRLF warnings only). Added recursive Vite raw-source scan with sole exact allowlist src/data/volumesKB.ts. Neutralized classroom report via A07, workspace/session identity defaults, Wiki/Copilot/dashboard/process/header/info copy, social demos, and stale store years. Preserved curriculumKB, volumesKB, package/deps/schema/governance. No commit.

## 2026-07-28 05:24:49 +02:00
- CML-633D Task 10 compliance follow-up complete without commit. Strict TDD red: 7 expected failures covering fake classroom import mutation/success, report role, source scan categories, neutral workspace state, Volume 14 Article 9 safeguard, and Green Cross historical isolation. Green: 9 relevant files/184 tests; source scan included; npx tsc --noEmit exit 0; git diff --check clean except CRLF warnings. New tests: classroom-task10 and workspace-neutral-state; expanded institution-hardcodes. Active fake classroom records/import claims removed, report uses canonical declaredRoleLine or neutral compiler label, workspace defaults personal with empty emails, Volume 14 safeguards sensitive minor data under Article 9 as historical guidance, Green Cross only historical.
