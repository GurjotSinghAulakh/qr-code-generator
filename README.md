# QR Studio

A free, browser-based QR code generator. Content and image processing stay on the device. No account, watermark, redirect service, analytics, or scan quota.

This is the first development increment from the [PRD](prd.md), implemented task by task. See the [implementation plan](implementation-plan.md) for completed commits and the remaining v1 scope. It is not yet a claim of full WCAG conformance or production launch readiness.

## Run locally

Requires Node.js 22.12 or newer and npm. Development was verified with Node 25.5.0 and npm 11.8.0.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite. No environment variables, service credentials, account, or backend setup are required.

## Implemented

- Website, exact plain text/Unicode, Wi-Fi, and vCard 3.0 contact codes.
- Live preview with preserved per-type session drafts and a 150 ms debounce.
- Solid colors/presets, contrast checks, four-module minimum quiet zone, and all correction levels.
- Local PNG/JPEG/WebP logo normalization, H correction, and protected-pattern-aware placement.
- PNG and self-contained SVG exports, from 256 to 4096 pixels subject to density limits.
- Independent decoding of both rendered artifacts, with exact payload-byte comparison before enabling downloads.
- Local QR-image scanning, safe text display, explicit URL navigation, and confirmed draft replacement.
- Responsive layout, keyboard controls, status announcements, and help/privacy explanations.
- In-memory content only; production generation continues offline while the loaded page remains open.

Static codes have no generator-imposed expiry. A linked destination can still change or disappear. Editing a project produces a new image; it cannot change a printed code. QR codes are readable data, not encryption, including Wi-Fi credentials.

## Checks

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run check` runs the type check, unit suite, and production build. The browser suite builds the app, starts a temporary production preview on `127.0.0.1:4173`, and runs desktop/mobile Chromium cases. Keep that port free. The test server stops when the suite finishes. Screenshots, traces, and downloaded test files are ignored under `test-results/`.

Browser checks cover downloaded artifacts, Unicode, contact/Wi-Fi fields, logo output, stale revisions, invalid input, local scanning, malicious decoded content, upload limits, draft replacement, network privacy, loaded-page offline use, keyboard focus, 320-pixel reflow, and automated accessibility checks.

Physical phone scans, VoiceOver/NVDA journeys, Safari/Firefox/Edge compatibility, and reference-device performance measurements still require manual release validation. See the [release checklist](docs/release-checklist.md).

## Build and hosting

```sh
npm run build
npm run preview
```

Deploy `dist/` to an HTTPS static host when ready. No deployment is configured or performed by this implementation.

The build generates third-party notices and copies `public/_headers` into the output. Hosts that understand this file can apply the policy directly; other hosts must configure equivalent response headers. Vite production preview applies the same policy for browser tests. See [security and hosting](docs/security.md).

The production decoder is bundled into a local blob worker so generation does not need a new network request for each scan check. Vite's development worker loading uses its development server; test loaded-page offline behavior against the production build. Offline reload and an installable app are future work.

## Structure

```text
src/components/    Editor, preview, design controls, scanner, help
src/hooks/         Revision-bound generation and object-URL lifecycle
src/lib/           Content contracts, parser, matrix, image guards, workers, exports
tests/             Browser workflows against the production build
scripts/           Build-time dependency license notices
public/            Local assets and static-host header rules
docs/              Architecture, security, and release gates
```

Read the [architecture notes](docs/architecture.md) for data flow and safety boundaries.

## Remaining v1 work

Email/phone/SMS/location/event types and campaign parameters; CSV/ZIP bulk generation; PDF/print layouts; decorative presets/frames/templates; explicit local saved projects and JSON backups; camera/native sharing; complete offline caching and safe updates. These remain free features in the plan, not a paid tier.

The repository application source license is still a maintainer decision. Third-party code retains its own licenses; complete installed production dependency notices are generated at `public/third-party-notices.txt` and included in builds.
