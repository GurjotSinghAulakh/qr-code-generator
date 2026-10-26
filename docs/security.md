# Security and static hosting

The app handles content on the device and does not require secrets or remote APIs. Treat all payloads, decoded strings, uploaded files, captions, and imported data as untrusted input when extending it.

## Current controls

- Canonical serializers escape structured fields and reject unsafe URL schemes, URL credentials, invalid credential formats, and excessive byte counts.
- SVG contains generated geometry and a normalized embedded PNG only. Payloads, filenames, arbitrary markup, and remote logo URLs are excluded.
- PNG/JPEG/WebP uploads are checked by signature and decoded dimensions; byte and pixel caps apply before expensive allocations where possible.
- Decoded content is inert text. Navigation is available only for validated HTTP/HTTPS URLs and requires a click with `noopener noreferrer`.
- The independent decoder runs in a cancellable worker. Verification is tied to a draft/design revision, preventing stale-payload exports.
- No content persistence, session replay, analytics, remote fonts, camera, or automatic destination fetches exist in this increment.
- Lockfile versions are pinned. The build includes full installed production dependency license notices.

## Production response headers

`public/_headers` is a static-host rules file, copied to `dist/_headers`. It is not automatically honored by every host. Configure the equivalent policy in the selected host and verify its actual responses before launch. Vite preview uses equivalent response headers for browser checks.

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; worker-src 'self' blob:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Frame-Options: DENY
```

Inline styles are allowed for user-selected color swatches; inline scripts and evaluation are not allowed. Blob/data image sources and blob workers are required for local files and generated output. Outbound connections are blocked; fetching input destinations is deliberately absent.

Serve public deployments over HTTPS. Configure an appropriate HSTS policy only after the deployment's TLS/domain setup is established. Keep asset URLs independent of user content and configure host access/error logs to exclude content and use the PRD's maximum seven-day retention target.

When adding camera support in T13, change the camera permissions policy narrowly to the application's own origin and preserve explicit start/stop and lifecycle checks. When adding offline caching, cache application resources only. A new capability must update both the host rules and Vite preview policy, with corresponding browser checks.

## Verification

The Playwright suite observes outbound requests during sensitive-data generation, generates with the loaded page offline, checks session/local storage, decodes downloaded files, and exercises malicious decoded content. Automated accessibility checks and image guard tests complement these checks; they do not replace a security review.

Run `npm audit --audit-level=high` after dependency changes. Review actionable findings rather than applying unreviewed breaking upgrades. Installation/build artifacts and test output are ignored. Do not add real Wi-Fi credentials or other user content to fixtures or logs.
