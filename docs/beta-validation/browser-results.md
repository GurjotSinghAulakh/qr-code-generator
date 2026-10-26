# Browser validation — 26 October 2026

This is automated compatibility evidence for the current P0 application. It does not close the manual browser or accessibility release gates.

Host: MacBookPro18,3, Apple M1 Pro, 16 GiB RAM, macOS 26.3.1 (25D2128), ARM64. Playwright 1.64.1. Production build, local preview at `127.0.0.1:4173`, two workers, no retries.

| Project | Actual runtime | Viewport | Result |
| --- | --- | --- | --- |
| chrome-installed | Installed Google Chrome 156.0.8078.48; isolated automated session | 1280 × 720 | 19/19 passed |
| firefox-engine | Playwright Firefox 157.0, revision 1555 | 1280 × 720 | 19/19 passed |
| webkit-engine | Playwright WebKit 27.2, revision 2370 | 1280 × 720 | 19/19 passed |
| iphone-webkit-emulated | Same WebKit runtime with the iPhone 13 device preset | 390 × 664 | 19/19 passed |

**76 passed; zero skipped, unexpected failures, or retries.** Strict TypeScript, production build, and all 53 unit tests also pass. Runtime versions are read from `browser.version()`, not inferred from device preset user-agent strings. Desktop projects retain their runtime user agents. The iPhone preset is emulation; its user agent does not establish a tested iOS version.

## Scope and investigation

Each project runs 18 existing workflow cases plus an environment-recording case. Coverage includes actual PNG/SVG downloads and independent decoding, local logo output, content preservation and stale revisions, offline use of the loaded production page, network/storage privacy assertions, local image scanning and unsafe decoded content, file limits/drops, styled dropdown selection/typeahead/Escape/outside dismissal, keyboard download focus, 320px reflow, and automated Axe checks in the shipped views and open dropdown.

The first expanded run passed 73/76. Two keyboard checks assumed Tab includes links in WebKit on macOS. The test now uses Option-Tab for that runtime, consistent with [Apple's documented keyboard behavior](https://support.apple.com/en-gb/guide/safari/cpsh003/mac). No system keyboard setting was changed. Chrome's immediate synthetic outside click intermittently raced dropdown setup. The test now waits for the selected option to gain focus and explicitly moves the pointer outside before clicking; five consecutive targeted Chrome runs passed before the complete run. No application behavior was changed to accommodate these test issues.

## Reproduce

Install Google Chrome separately if it is unavailable, then run:

```sh
npm ci
npx playwright install firefox webkit
npm run test:beta
```

Keep port 4173 free. The suite starts and stops its own production preview. JSON results and environment attachments are written to ignored `beta-results/results.json`; screenshots, traces, and downloads go under `beta-results/artifacts/`. Synthetic fixtures contain no real credentials. Tests neither use nor stop the user's development server on port 5173.

## Remaining manual evidence

The installed Safari 26.3.1 and Firefox 146.0 versions were inventoried, not validated by this suite. Edge is unavailable on this host. Actual Safari, retail Firefox, Edge, physical iOS Safari, and Android Chrome still need versioned workflow results. Playwright uses its own Firefox/WebKit builds; [its browser documentation](https://playwright.dev/docs/browsers) explains why WebKit is not the Safari application.

VoiceOver/Safari, NVDA/Firefox or Chrome, full WCAG 2.2 AA assessment, touch/zoom behavior on real devices, native QR actions, physical prints, reference-device timing/memory, and usability sessions remain pending. Axe results do not establish WCAG conformance. Build size (about 173 KiB gzip initial JavaScript) does not establish interactive performance.
