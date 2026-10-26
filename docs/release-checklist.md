# Release checklist

This file distinguishes implemented development functionality from the external validation required by the PRD. Do not label the product advanced v1 until all P0 and P1 work is complete.

## Automated checks for this increment

- [x] Strict TypeScript and production build.
- [x] Canonical serializer, parser, geometry, image-header, and cross-library byte tests.
- [x] Real PNG/SVG artifact verification and download checks in desktop/mobile Chromium.
- [x] Unsafe content/design, stale revisions, upload limits, and confirmed draft-replacement checks.
- [x] Keyboard entry/download focus and 320-pixel reflow checks.
- [x] Automated accessibility, privacy, production-header, and loaded-page offline checks (final counts recorded in the implementation ledger).

## Public-beta manual gates still pending

Use the [manual execution protocol and reproducible physical test pack](beta-validation/manual-test-protocol.md) to collect evidence. Preparing test materials does not complete the gates below.

- [ ] Record actual tested versions of Chrome, Edge, Firefox, Safari, iOS Safari, and Android Chrome. Partial: installed Chrome plus Firefox/WebKit test runtimes pass; see [browser evidence](beta-validation/browser-results.md) for versions, scope, and outstanding retail/device checks.
- [ ] Test all workflows with VoiceOver/Safari and NVDA/Firefox or Chrome.
- [ ] Assess every applicable WCAG 2.2 AA criterion, including zoom, reflow, focus, non-text contrast, errors, and touch interaction.
- [ ] Complete the PRD's physical scan matrix on one iPhone and two Android phones from different vendors.
- [ ] Verify Unicode and Wi-Fi/contact action behavior on the target scanners, including compatibility limits.
- [ ] Test print materials/sizes, protected-center logo rejection, and dense codes at recommended size.
- [ ] Measure preview/export performance and memory recovery on named reference devices under the specified conditions.
- [ ] Run voluntary usability sessions; record task success and free-use/lifetime comprehension.
- [ ] Finish dependency maintenance/security review. The current npm advisory audit reports zero known vulnerabilities; maintenance and upgrade risks still need recorded review.
- [x] Apply the owner-approved MIT application license. See [license decision](beta-validation/license-decision.md).
- [x] Confirm generated build notices include the full application license and all production dependency licenses, including the reviewed supplement.
- [ ] Select an HTTPS static host; verify actual headers, logging/redaction/retention, cost budget, monitoring, ownership, and rollback.

## Advanced v1 gates

- [ ] Complete T08–T14 with their own verified task commits.
- [ ] Add bulk/PDF/project/camera/offline-reload acceptance cases and physical preset validation.
- [ ] Complete T15 and the full definition of done in PRD section 18.4.

No deployment or publishing is part of the current local implementation work.
