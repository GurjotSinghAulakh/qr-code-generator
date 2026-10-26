# Public-beta manual execution protocol

Status: prepared, not executed. Record observations and failures before changing any release checkbox. This protocol covers the shipped P0 features; future P1 content types, presets, PDF, bulk, camera, storage, and offline reload need additional cases.

## Physical scan and print pack

```sh
npm ci
npm run beta:pack
```

Open `beta-results/physical-pack/print.html`. The generator uses the application's actual matrix/layout/SVG functions and serializers, writes twelve synthetic PNG/SVG fixtures, independently checks the PNG bytes with jsQR, and creates a manifest plus **108 distinct combinations with three attempts each (324 blank trial rows)**. Generated files stay ignored; store completed research evidence deliberately after removing identifying data. Generation proves neither physical scanning nor native action compatibility.

Preparation validation on 26 October 2026: the generator completed with all twelve independent PNG byte checks; all twelve final SVGs were also rasterized in installed Chrome 156.0.8078.48 and independently decoded to their exact expected bytes. The print layout screenshot was reviewed and the calibration line's CSS width checked. This does not verify printer scaling or physical readability. Local screenshot: `beta-results/physical-pack/print-review.png`.

The fixtures cover all four P0 types, all four shipped color themes, every correction level, Unicode, escaped Wi-Fi delimiters, contact accents, logos/no logos, 495-byte medium text, a 1,250-byte H-correction dense payload, and #767676 on white (the nearest permitted neutral 8-bit gray to the 4.5:1 cutoff). The manifest includes the exact expected payload and a separate protected-center logo rejection case. Rejecting that case is expected software behavior; exclude it from valid physical-scan denominators.

Each combination names a fixture, device slot, stock, lighting/view condition, and eligible size. It uses the proposed 0.4 mm/module heuristic to include 20, 30, and 50 mm where permitted, plus 100 mm for dense content. Size includes the quiet zone. The heuristic requires calibration from real results; it is not a universal safety guarantee. Do not shrink the dense fixture to force it into a smaller size.

Recommended borrowed hardware, pending availability:

| Slot | Suggested device | Actual model / OS / scanner |
| --- | --- | --- |
| iPhone | iPhone 13 | Pending |
| Android vendor A | Samsung Galaxy A55 5G | Pending |
| Android vendor B | Google Pixel 7a | Pending |

These suggestions satisfy the intended vendor spread; they are not a purchase requirement or a claim of tested support. Use existing equivalent devices if available, including a mid-range Android with at least 4 GB RAM. Specifications: [Apple](https://support.apple.com/en-us/111872), [Samsung](https://news.samsung.com/global/samsung-galaxy-a55-5g-and-galaxy-a35-5g-awesome-innovations-and-security-engineered-for-everyone), [Google](https://support.google.com/pixelphone/answer/7158570).

1. Record the printer model, driver, print quality, stock details, actual phone models, OS builds, and scanner app/version. Print at **100% / actual size**, with fit-to-page and headers/footers off. Measure every sheet's 50 mm calibration line and at least one QR image before scanning. Reprint mis-scaled sheets; do not silently exclude failed valid scans.
2. Use plain paper and coated stock. Record measured light level if possible, or a repeatable description of the room/light source. Use face-on indoor normal light, approximately 30° angled indoor viewing, and lower-light face-on viewing as assigned. Record the actual distance and conditions; do not report an unspecified "low light" guarantee.
3. For each attempt start with the scanner reset and code out of view. Start timing when the entire code is visible in the viewfinder; stop at recognition. Record elapsed milliseconds, read success, exact content, and action outcome in `scan-trials.csv`. A timeout or nonrecognition is a failure, not a blank row. Preserve all three attempts.
4. Compare decoded content with `manifest.json`, including Unicode, line breaks, Wi-Fi delimiters, and contact fields. Distinguish correct text decoding from Wi-Fi/contact action recognition. Record unsupported actions and scanner limitations even when text is correct. Never dial, message, or submit data as part of testing.
5. The synthetic Wi-Fi network does not prove a real join. Separately use an owner-controlled disposable guest network with matching fixture settings to verify joining. Keep actual credentials and contact records out of source control and shared evidence; remove temporary contacts afterward. Verify hidden/open network variants as additional action checks.
6. Reproduce the manifest's protected-center case in the app: with the square logo uploaded, generation must reject it and disable downloads; removing the logo or shortening the content must recover. Treat unsafe acceptance as a blocker. Record dense-code readability at its assigned large size.

Required result: ≥95% of all scheduled valid attempts read within two seconds, 100% exact content on successful reads, and no repeatable default black-on-white failure at recommended size in normal conditions. Also report success per combination, device, fixture, stock, size, and condition so aggregates cannot hide failures. Link defects and rerun affected cases after fixes; retain original failures. No physical result has been recorded yet.

## Browser and assistive technology journeys

Run all shipped workflows in actual Chrome, Edge, Firefox, Safari, iOS Safari, and Android Chrome. Record browser/OS builds and input mode; installation inventory is not validation. The [automated browser evidence](browser-results.md) is a separate baseline.

Use VoiceOver with Safari on macOS and NVDA with Firefox or Chrome on Windows. Record actual spoken labels/status/errors, focus order and restoration, keyboard commands, versions, expected versus observed behavior, severity, and retest evidence. Do not infer screen-reader behavior from the DOM or Axe alone.

Required journeys: create each content type; encounter and recover from validation errors; explicitly correct a schemeless URL; change color/correction/size with the shared dropdowns; upload/remove a logo; download PNG/SVG; reveal/conceal Wi-Fi details; scan safe and malicious images; inspect results; confirm/cancel replacing an existing draft; navigate help and return. Verify Enter/Space, arrows/typeahead, Escape, Tab/Shift-Tab, announcements during generation, disabled stale downloads, and focus after download/cancel/error. On default macOS Safari settings, Option-Tab includes links; also test the user's preferred full keyboard navigation mode.

Assess every applicable A/AA success criterion in [WCAG 2.2](https://www.w3.org/TR/WCAG22/), using one row per criterion: ID, applicability/rationale, test method, device/browser/AT, expected, observed, evidence, defect, and retest result. Mark not applicable only with a reason; leave untested criteria pending. Required focused sessions include:

- 200% browser zoom, 400% zoom yielding approximately 320 CSS px, landscape/portrait, and no two-dimensional scrolling or lost controls/content.
- Text-spacing overrides: line height 1.5×, paragraph spacing 2× font size, letter spacing 0.12×, word spacing 0.16×; check open dropdowns, help, forms, and scanner results for clipping.
- Text and non-text contrast, focus visibility/obscuration, error identification and suggestions, name/role/value, status messages, meaningful sequence, and touch target sizing/spacing.
- Pointer cancellation, dragging alternatives, reduced motion, file-input fallback, no keyboard traps, secret masking descriptions, and no loss of entered data during navigation/reset cancellation.

## Performance and memory

Name both actual reference devices: a laptop with ≥8 GB RAM and a physical mid-range Android with ≥4 GB RAM. Available laptop inventory: MacBookPro18,3, M1 Pro, 16 GiB, macOS 26.3.1; timing tests remain pending. Record build/commit, browser version, power/thermal state, dataset, cold/warm state, sample count, and raw timings. No payload values belong in performance logs.

Follow PRD NFR-01–04: cold-load tests at 1.6 Mbps down / 750 Kbps up / 150 ms RTT; measure the specified load/responsiveness metrics rather than substituting transfer size. For preview, collect ≥100 valid input/style changes up to 500 UTF-8 bytes at 1024 px and measure matrix/render after the 150 ms debounce separately from full verification. Target p95 ≤300 ms after debounce. Measure end-to-end ready-to-download p95 ≤2 s at 1024 px and ≤5 s for 4096 px PNG. Report sample distributions and the percentile method. A Playwright-emulated phone on the laptop cannot satisfy the mobile target.

Exercise repeat 4096px exports, rapid revisions, reset during processing, malformed/oversized uploads, cancellation/unmount, and safely simulated allocation/decode failure. Record whether stale downloads remain blocked, controls recover, obsolete workers/object URLs are released, and a small valid code succeeds afterward. Capture memory trends with explicit tooling and limitations; releasing references does not prove immediate garbage collection or secure erasure. P1 batch/cancellation benchmarks stay pending until implemented.

## Voluntary usability sessions

Recruit at least ten consenting participants spanning casual and advanced users. Use anonymous IDs; do not collect real contact details or Wi-Fi passwords. Start from the loaded generator and ask, without coaching: "Create and download a PNG for https://example.com/menu." Record time to download initiation, independent success, any assistance, errors, and observations. Count assistance as non-independent completion; retain withdrawals/failures with an explanation rather than silently removing them.

Afterward ask participants to explain whether an account is needed, where processing happens, whether a static code expires, whether the linked website can disappear, and whether editing the app changes an already printed code. Use the same rubric for everyone. Targets: ≥90% independent success, median ≤30 seconds, ≥90% correct free-use/local-processing/static-lifetime comprehension. Report denominator, individual anonymized results, comprehension errors, and resulting fixes. No participants or metrics have been fabricated or recorded yet.

## Operational gate

Hosting remains undecided; no deployment is authorized by this local task. Before release, name the host, accountable owner, monthly cost ceiling, and rollback operator. Verify actual HTTPS response headers on HTML/assets/errors, no payload-bearing logs, redaction, ≤7-day retention, monitoring without product telemetry, dependency update ownership, and a rehearsed rollback to a known build. Record evidence and dates. Local preview headers do not establish production hosting controls.
