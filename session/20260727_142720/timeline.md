# Timeline

## 2026-07-27 14:27:20 +02:00
- Session created.
- Goal: Implement CML-633D Task 6 institutional archive store and backup integration with strict TDD

## 2026-07-27 14:30:12 +02:00
- RED confirmed: institution integration test has 9 expected failures. Implementing active store aggregate, hydration normalization, backup validation/wiring; no schema changes.

## 2026-07-27 14:34:52 +02:00
- Implementation green in integration/domain/schema/backup continuity tests; tsc clean. Final combined verification next. Modified only active store, App wiring, two backup hooks, and new integration test.

## 2026-07-27 14:36:05 +02:00
- DONE: CML-633D Task 6 implemented without commit. Final verification: 5 files/128 tests passed; npx tsc --noEmit exit 0; git diff --check only existing CRLF warnings. Unrelated dirty files preserved.

## 2026-07-27 14:43:24 +02:00
- Review RED confirmed: 3 failures reproduce hydration action injection, void restore status, and false cloud success. Emergency valid/invalid/future/legacy tests pass. Implementing explicit data whitelist and discriminated restore result.

## 2026-07-27 14:47:35 +02:00
- CHANGES_REQUIRED fixes complete, no commit. TDD RED: 3 failures for action injection, void result, false cloud success. GREEN: 5 relevant files/136 tests; tsc clean. Added whitelist sanitizer, discriminated restore result, caller result handling, emergency/cloud tests.

## 2026-07-27 15:06:08 +02:00
- Implemented CML-633D Task 7 via accessible InstitutionConfigPanel in SaveSettingsModal; strict TDD red missing component, green 70 institution tests; tsc and diff check clean; no commit.

## 2026-07-27 15:18:41 +02:00
- Fixed all CML-633D Task 7 findings with TDD: confirmed edits demote to draft preserving provenance; separate accessible multi-year add/select/switch; invalid focus; settings and confirm dialog semantics/focus; actor clearing. Red 6 failing findings, green 112 targeted tests; tsc/diff check clean; no commit.

## 2026-07-27 15:45:46 +02:00
- Fixed Task 7 quality findings with TDD: confirmed-only active authority and atomic authority cleanup on demotion; planned years preserve confirmed identity; modal focus trap/Escape/return; cleared sites archived; dirty save-first gates; complete backup callback only; test setup optimized. Red domain/integration findings incl 2 timeouts; green 117 targeted tests in 5.46s test time, tsc/diff check clean; no commit.

## 2026-07-27 16:00:51 +02:00
- Fixed nested UiConfirmDialog Escape propagation with TDD: keydown/native cancel stop propagation, close only confirmation, restore trigger focus; parent SaveSettingsModal remains open. Red parent closed; green 68 targeted tests, tsc/diff check clean; no commit.

## 2026-07-27 20:22:54 +02:00
- CML-633D Task 8 A04 complete: pure institution read facade wired to preview/generation/certification; 90 targeted tests and tsc pass; no commit.

## 2026-07-27 20:38:48 +02:00
- CML-633D A04 quality fix: no order fallback/index reinterpretation; direct facade coherence/immutability tests and generation block added; 97 targeted tests plus tsc pass; no commit.
