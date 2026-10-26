# Implementation plan

Source: [prd.md](prd.md). Created 26 October 2026.

## Delivery approach

Implement a local, statically deployable application in small, verified commits. Each task owns one coherent change, its meaningful checks, and a progress update in this file. Commit completed tasks individually; do not combine unrelated tasks or push/deploy without a request.

The first implementation increment delivers a working P0 editor and its safety-critical pipeline. It is a development beta, not a declaration that all public-beta or v1 launch gates have passed. Physical device scans, screen-reader testing, measured performance, and voluntary research remain release gates even when automated checks pass.

P0 is the public-beta scope. P1 is required to call the advanced product v1. P2 stays outside this implementation plan. All released features remain free, with no account, tracking, watermark, or generation quota.

## Technical decisions

- **Frontend:** React and TypeScript with Vite, producing static files. No backend, database service, or remote generation API.
- **Encoding:** `qrcode`, using automatic mode segmentation/version selection and its reserved-module mask. Isolate this dependency behind a typed adapter.
- **Independent verification:** `jsQR`, comparing decoded UTF-8 bytes with the canonical serialized payload. Render the real artifact before checking it.
- **Rendering:** one matrix/layout model for canvas PNG and self-contained SVG. Preserve an opaque quiet zone, integer pixel cells, and protected patterns.
- **State:** in-memory drafts with revision-bound verification; persistent content is opt-in in a later task.
- **Checks:** TypeScript, Vitest for serializers/geometry/round trips, and Playwright for browser export, stale-result, scanning, accessibility, and privacy workflows.
- **Styling:** local CSS and system fonts; a calm, responsive workspace with clear content/design steps and a prominent output panel. No external assets or scripts.
- **Security:** local file processing, inert user content, file signature/dimension limits, safe SVG serialization, and hosting security-header guidance.

Dependency versions are pinned in the lockfile. Runtime dependencies must have suitable licenses. The owner explicitly approved MIT for the application on 26 October 2026; see LICENSE and the recorded license decision.

## Task ledger

| Task | Status | Commit-sized outcome | Dependencies |
| --- | --- | --- | --- |
| T01 | Complete | Record the PRD and this implementation plan | None |
| T02 | Complete | Scaffold the typed frontend and repeatable checks | T01 |
| T03 | Complete | Implement and test P0 content contracts | T02 |
| T04 | Complete | Implement safe QR rendering and independent verification | T03 |
| T05 | Complete | Build the responsive generator workspace and verified downloads | T04 |
| T06 | Complete | Add safe local QR-image scanning and editor handoff | T05 |
| T07 | Complete | Add browser regression checks, privacy/security hardening, and developer documentation | T06 |
| R01 | Complete | Redesign the existing app with a simpler premium interface and mobile creation flow | T07 |
| R02 | Complete | Replace all form dropdowns with a shared styled Select component | R01 |
| B00 | Complete | Apply the owner-approved MIT license and validate complete distribution notices | R02 |
| B01 | Complete | Add versioned automated Chrome/Firefox/WebKit beta compatibility evidence | B00 |
| T08 | Planned | Complete P1 content types and campaign URL controls | T07 |
| T09 | Planned | Add cancellable CSV bulk jobs and verified ZIP exports | T08 |
| T10 | Planned | Add PDF export, physical sizing, and print layouts | T07 |
| T11 | Planned | Add verified decorative presets, frames, and built-in templates | T10 |
| T12 | Planned | Add explicit local projects, design templates, and JSON backups | T11 |
| T13 | Planned | Add camera scanning and native sharing fallbacks | T06 |
| T14 | Planned | Add complete offline caching, safe updates, and theme preferences | T09–T13 |
| T15 | Planned | Complete the accessibility, physical scanning, performance, and operational launch gates | T14 |

Statuses: Planned → In progress → Complete. Use “Implemented; manual validation pending” when a task's code is complete but a required external/manual gate cannot be performed in this workspace. Record actual results rather than implying conformance.

## T02 — Application foundation

- Add package scripts for development, type checking, unit tests, production build, and browser checks.
- Configure strict TypeScript, React, Vite, Vitest, and Playwright. Ignore generated artifacts.
- Add a minimal accessible application entry point, local favicon, and no-JavaScript explanation.
- Keep the shell useful while feature tasks are developed; no placeholder feature buttons.
- **Validate:** dependency installation, type check, production build, and dependency audit.
- **Commit:** `chore: scaffold the typed QR generator application`.

## T03 — P0 payload contracts

- Define typed URL/text/Wi-Fi/contact drafts, field metadata, defaults, and structured validation errors.
- Preserve exact text and confirmed URL content; offer HTTPS correction explicitly in the UI.
- Serialize Wi-Fi with escaped delimiters, valid SSID/credential limits, and explicit hidden-network handling.
- Serialize a documented vCard 3.0 profile with required name fields, CRLF, escaping, and safe line folding.
- Enforce UTF-8 byte limits and prevent property/header injection; return user-safe errors without logging values.
- **Traceability:** GEN-02, GEN-05, GEN-07, GEN-08, GEN-10; PRD section 9.
- **Validate:** valid/invalid fixtures, Unicode, significant whitespace, Wi-Fi reserved characters, URL credentials/unsafe schemes, contact injection, byte boundaries.
- **Commit:** `feat: add validated URL text Wi-Fi and contact payloads`.

## T04 — Rendering and verification engine

- Adapt `qrcode` into a shared matrix with version, correction level, and reserved-module information.
- Validate colors, darker foreground, 4.5:1 product contrast rule, ≥4-module quiet zone, export sizes, and ≥4 raster pixels per module.
- Render SVG/canvas from the same geometry; create opaque, self-contained exports.
- Validate and locally normalize PNG/JPEG/WebP logos; cap bytes/dimensions before large rasterization.
- Use H correction with a centered logo box ≤15% of symbol width; shrink/reject anything touching protected modules.
- Verify exact decoded bytes using the independent decoder, including the actual PNG and rasterized SVG.
- **Traceability:** GEN-01, DES-01–06, EXP-01–02, EXP-05–06, EXP-09; PRD sections 10–11.
- **Validate:** round trips for all P0 types/Unicode/correction levels, capacity errors, protected regions, size and contrast failures, safe filenames/SVG.
- **Commit:** `feat: add safe QR rendering and independent artifact checks`.

## T05 — Generator workspace

- Build responsive content selection, labeled forms, preserved per-type drafts, and relevant validation.
- Add styling controls, logo handling, explicit resets, quiet-zone/correction settings, export dimensions, and filename.
- Use a 150 ms debounce and revision-bound async results; changing content/design immediately disables stale exports.
- Show a live verified preview, QR diagnostics, optional raw payload, and actionable errors.
- Mask Wi-Fi credentials and raw payload by default; disclose that the QR itself exposes the password.
- Enable PNG/SVG downloads only for the currently verified revision, checking the exact export before initiating the download.
- Add concise help/privacy content explaining static lifetime, local processing, and printing guidance.
- **Traceability:** GEN-04–07, DES-01–06, EXP-01–02, EXP-05–06, EXP-08; PRD sections 7 and 12–14.
- **Validate:** build/type checks plus real-browser URL → verified preview → download, draft switching, reset, and invalid/stale-export behavior.
- **Commit:** `feat: build the responsive QR creation workspace`.

## T06 — Local image decoder

- Add image upload and optional clipboard-image paste with byte/signature/dimension limits.
- Decode on device; render decoded content as inert text and identify URL/text/Wi-Fi/contact where possible.
- Offer explicit copy, safe HTTP/HTTPS navigation, and editor loading; confirm before replacing a nonempty draft.
- Keep unrecognized content intact in the text editor and never open a decoded destination automatically.
- **Traceability:** SCAN-01–03, SCAN-05, GEN-07, SEC-03/05/06.
- **Validate:** scan a generated export, Unicode/credential round trip, malformed/oversized images, malicious decoded schemes/markup, and draft-replacement confirmation.
- **Commit:** `feat: decode local QR images safely`.

## T07 — Beta hardening and handoff

- Add browser tests for all P0 types, PNG/SVG files, invalid/unsafe content, stale previews, mobile layout, keyboard flow, and scanning.
- Intercept browser traffic and prove entered payloads/uploads are not sent out; test offline use while the application remains loaded.
- Add automated accessibility checks and document manual checks still required.
- Add static-host security headers/CSP guidance, dependency notices, setup commands, a concise architecture description, and an honest feature/status list.
- Update the task ledger with commands/results and known remaining P0 release gates.
- **Validate:** type check, unit suite, production build, browser suite, dependency audit, and visual desktop/mobile review. Record unavailable checks explicitly.
- **Commit:** `test: harden the QR beta workflows and document setup`.

## P1 implementation details

| Task | Scope and required checks | PRD mapping |
| --- | --- | --- |
| T08 | Email/phone/SMS/geo/event serializers, IANA zone/DST handling, parser handoff, and explicit campaign-parameter replacement; test action formats/Unicode/time boundaries. | GEN-03/09; section 9 |
| T09 | Robust UTF-8 CSV import and mapping, all-type row validation, selected-row preview, worker jobs, cancellation/partial results, exact manifest reconciliation, ZIP limits/formula safety. Test 500/501 rows and failure/cancellation boundaries. | BULK-01–09 |
| T10 | Vector PDF with local font policy, rasterized final-PDF verification, A4/Letter sizing, repeated labels, fit validation, physical-size warnings. Compare exported formats and printed samples. | EXP-03–05; section 10.2 |
| T11 | Tested rounded/dot data modules, protected function patterns, six built-in templates, captions/frames outside quiet zone. Run visual/decode/physical preset matrix before exposing each preset. | DES-07–09 |
| T12 | IndexedDB explicit project saves, sensitive-data acknowledgment, design-only templates, schema validation/migrations, readable JSON backups, storage limits/deletion, and quota/private-mode fallbacks. | DES-10; SAVE-01–05/07 |
| T13 | Explicit camera start/stop, selection, permission fallback, release tracks on background/exit, native file sharing with download fallback. Validate camera lifecycle and denied capabilities. | SCAN-04; EXP-07 |
| T14 | Versioned precache of every offline feature chunk, readiness acknowledgment, all-tools offline reload, safe update during jobs, clear-all including caches, independent theme preference. | SAVE-05–08; NFR-08 |
| T15 | Named-device scan matrix, VoiceOver/NVDA journeys, performance benchmarks, usability study, hosting budget/security headers/monitoring/rollback, documented supported versions. | G-01–06; NFR-01–11; PRD sections 17–19 |

## Commit and validation rules

1. Run the checks relevant to a task before its commit; fix failures before proceeding.
2. Keep serializers/rendering pure where possible. Write tests for payload correctness, security boundaries, and race conditions rather than cosmetic implementation details.
3. Stage only files belonging to the task. Preserve unrelated user changes. Include the corresponding ledger update in the same commit.
4. Use the task's suggested conventional commit or an equally precise description. Keep history additive; do not amend user commits.
5. Do not include generated files, test output, secrets, user payloads, or installed dependencies in commits.
6. No push, hosted registration, or deployment is part of this local implementation request.

## Progress and evidence

- **T01:** Reviewed the empty application repository and the complete PRD; recorded phased tasks, requirement traceability, validation, and commit boundaries.
- **T02:** Added React/TypeScript/Vite, pinned dependencies and lockfile, Vitest/Playwright configuration, local app assets, and build/type-check scripts. Production build and type checking pass. Installation audit reports zero known vulnerabilities. Selected Vitest 4 because Vitest 5 excludes the machine's Node 25 runtime.
- **T03:** Implemented URL/text/Wi-Fi/vCard serializers, field definitions, per-type defaults, UTF-8 limits, credential validation, escaping, and byte-safe content-line folding. All 18 serializer checks pass; type check and production build pass. International phone validation is syntactic and does not contact a number-lookup service.
- **T04:** Added a shared matrix/SVG layout, integer module sizing, contrast/quiet-zone checks, reserved-pattern logo placement, bounded image normalization, independent worker decoding, and PNG/SVG artifact creation. All 48 unit checks pass, including 16 cross-library round trips; type check/build pass. Actual browser artifact round trips will be exercised with the T05 workspace and T07 browser suite. Physical logo/print compatibility remains a release gate.
- **T05:** Built the responsive editor, preserved drafts, masked credential inspection, design/logo controls, revision-bound verification, PNG/SVG downloads, and help/privacy content. Production build/type checks and six desktop/mobile Playwright cases pass; downloaded PNG bytes were independently decoded, and SVG safety was inspected. Reviewed desktop/mobile screenshots and preserved download-button focus. Interactive preview connection was unavailable, so screenshots came from the automated test browser.
- **T06:** Added local image scanning/paste, a multiple-code check, inert decoded text, Wi-Fi disclosure controls, deliberate safe navigation, and loss-aware editor handoff. Unsupported contact/Wi-Fi profiles stay intact as plain text rather than silently dropping fields. All 53 unit tests and 14 desktop/mobile browser cases pass; type check/build pass. Camera scanning remains T13.
- **T07:** Final run: **53 unit tests and 26 desktop/mobile Chromium browser cases pass**, together with strict TypeScript and production build. Added actual PNG/logo checks, rapid-input/stale-export coverage, privacy/network/storage checks, production response-header assertions, loaded-page offline generation, multi-code crop recovery, keyboard/download focus, 320px reflow, and automated AA checks for empty/ready editor, Wi-Fi/contact forms, scanner, and help. Fixed observed helper-text contrast failures and bundled workers inline so production offline generation does not fetch worker scripts. Reset/edits release obsolete payload/artifact references. Initial production JavaScript is approximately **140 KiB gzip**, below the proposed 300 KiB budget; this is a build-size observation, not a reference-device performance result. Added build-generated dependency notices, hosting rules, architecture/security docs, setup commands, and an explicit manual release checklist. `git diff --check` passes. Physical scanning, screen-reader testing, other browser engines, performance benchmarks, usability research, and actual hosting checks remain pending.
- **R01 — requested interface redesign:** Replaced the separate cards and small-text treatment with a unified workspace, warm neutral canvas, refined typography, consistent Lucide icons, clear navigation, and one prominent download action. Quick color themes stay visible; custom colors, technical settings, and encoded details use native disclosures. Mobile follows content → preview/download → optional styling, with accessible jump links. Added local drag-and-drop scanning and invalid multi-file handling; reorganized help into readable FAQ disclosures. Preserved the QR engine and privacy policy. Compared before/after desktop/mobile captures and reviewed scanner/help screenshots. **53 unit tests and 30 desktop/mobile browser cases pass**, including keyboard access, 320px reflow, expanded help accessibility, mobile task ordering, file drops, and all existing artifact/privacy checks. Strict TypeScript, production build, and whitespace checks pass; initial JavaScript is approximately **143 KiB gzip**. The existing local preview on port 5173 responds successfully; no server owned by the user was stopped. Manual release gates remain unchanged.

### Current implementation boundary

**B01 — browser compatibility evidence:** Added an opt-in production-build suite with installed Chrome, Playwright Firefox/WebKit, and iPhone WebKit emulation; recorded runtime/host metadata and retained machine-readable local evidence. All 76 cases pass without retries or skips, together with 53 unit tests, TypeScript, and build. Adapted macOS WebKit link navigation and synchronized the dropdown outside-click test with focus/pointer movement; five targeted Chrome repetitions passed. See the browser evidence for exact versions and boundaries. Retail Safari/Firefox/Edge, physical phones, and screen readers remain manual gates.

**B00 — approved application license:** The owner chose “Apply MIT” after reviewing the full proposal. Added the root LICENSE, package/lockfile metadata, README/PRD decision, and full application text in generated distribution notices. The existing dependency licenses/supplement are preserved. Build/type checking and notice generation pass; a current registry audit reports zero known vulnerabilities. This does not complete maintenance, browser, assistive-technology, physical-device, or deployment gates.

**R02 — reusable dropdowns:** Added a typed, controlled `Select` component using Radix primitives and migrated export size, Wi-Fi security, and error correction. Menus match the interface, render outside clipped panels, stay within the viewport, support typeahead and keyboard selection, and restore focus after selection/Escape. Background inertness and cleanup are verified while menus are open/closed. Added a reviewed MIT license supplement for the pinned transitive package that omits a full license in its npm archive. **53 unit checks and 36 desktop/mobile browser cases pass**, including popup accessibility, actual 512px PNG decoding, controlled reset, and logo-forced disabled correction. Type checking/build and whitespace checks pass; reviewed desktop/mobile open-menu screenshots. Initial JavaScript is approximately **173 KiB gzip**, within the proposed 300 KiB budget. Vite reports its default advisory for the uncompressed main chunk exceeding 500 kB; no threshold was raised or warning suppressed.

T01–T07 form the first working development increment and are committed separately; R01 and R02 apply the subsequent interface requests as their own task commits. Start the app with `npm run dev`; run the full automated checks with `npm run check` and `npm run test:e2e`. Test-generated screenshots/downloads/traces and generated dependency notices remain ignored; the notices are recreated in every production build.

The next implementation task is **T08**. T08–T15 remain planned; this increment does not implement bulk/PDF/projects/camera/offline reload or satisfy the PRD's external/manual public-launch gates. No code has been pushed or deployed.
