# Architecture

## Local data flow

```text
Content draft → canonical serializer → validated payload
                                         ↓
Design settings → matrix + reserved mask → shared SVG geometry
                                         ↓
                         SVG rasterization + PNG encoding
                                         ↓
                       independent worker decode of both artifacts
                                         ↓
                      exact UTF-8 bytes match → enabled download
```

The deployed product needs only static files. There is no API, application server, cloud database, redirect path, or payload transmission. Asset requests are the only normal HTTP activity. No third-party fonts, CDN scripts, analytics, or remote images are loaded.

## Module boundaries

- `content.ts`: supported types, fields/defaults, byte counts, validation, Wi-Fi/vCard escaping, and byte-safe folding. Text and confirmed URLs are preserved. The encoder enforces the real capacity after serialization; the 16 KiB guard is not a promise of capacity.
- `parse.ts`: conservative scanner-to-editor mapping. Supported profiles become structured drafts; unknown/repeated/parameterized contact properties and unsupported Wi-Fi formats remain raw text to prevent silent loss.
- `qr.ts`: isolates the `qrcode` encoder and its `reservedBit` mask. Uses automatic segmentation/version selection; enforces contrast, quiet zone, integral raster sizing, safe center logo placement, and self-contained SVG generation.
- `images.ts`: checks file bytes, signatures, and dimensions before bitmap allocation, checks decoded dimensions again, normalizes logos through a canvas, and releases intermediate canvases/object URLs.
- `decode.ts` / `decode.worker.ts`: independent `jsQR` decoding, optional second-symbol check, and byte comparison. The worker is terminated on completion, cancellation, failure, or timeout.
- `artifacts.ts`: rasterizes the actual SVG, encodes PNG, independently checks both artifacts, and owns download URL lifetime/focus restoration.
- `useGeneration.ts`: debounces work and binds results to the exact draft/design object identities. Old async results cannot enable downloads for new input. Aborts terminate in-flight decoder workers.
- Components: own UI state and labeled controls; render payloads only through React text/textarea bindings. No injected HTML is used.

## State and sensitive content

The interface follows content → preview/export → optional customization in DOM order. The desktop grid places personalization below content and the preview beside both sections; the mobile layout follows DOM order so a basic download does not require scrolling through design controls. Native disclosures expose custom colors, technical settings, payload inspection, and help answers. The scanner accepts a local picker, paste, or a single dropped file through the same guarded decode pipeline.

Drafts and generated artifacts live in memory. There is no automatic persistence, content in app URLs, request logging, telemetry, or provider credential. Reset discards a draft but is not secure memory erasure. Browser back/forward cache and downloaded files remain under browser/user control.

Wi-Fi fields and raw encoded details are masked until deliberate reveal; the code image itself still exposes the password. Structured import/scanning requires confirmation before overwriting an existing draft. Opening an HTTP/HTTPS destination is an explicit user action; unsafe schemes never receive a navigation action.

Uploaded logo pixels are normalized to PNG, with a maximum longest side of 1024 pixels. SVG source uploads are rejected. Embedded output logo data must match the normalized PNG data-URL contract; names and payloads are not interpolated into SVG markup.

## Geometry and logo constraints

The square image includes the quiet zone. Cell width is an integer number of pixels; leftover pixels extend the background symmetrically. At least four pixels per module are required. Some lower output sizes cannot accommodate dense payloads and are rejected without truncation or silent resizing.

A logo forces H correction. Its complete opaque padding box is at most 15% of symbol width and cannot intersect any reserved module. Center alignment patterns in some versions make a logo impossible; the application reports this rather than covering the pattern. Physical testing remains necessary even when software decoding passes.

The 4.5:1 module contrast threshold is a product heuristic. It is separate from UI accessibility conformance and is not a QR certification criterion.

## Worker and offline behavior

The production build embeds the decoder worker as a blob-backed module. Each operation gets an independently cancellable worker, without another network fetch. This allows newly created artifacts to be checked after the loaded page loses network access.

The non-worker fallback dynamically loads the same decoder on browsers without Worker support. The supported modern browsers have workers; capability fallback is provided without claiming exhaustive compatibility testing.

A service worker is not installed yet. Closing/reloading offline is not supported until T14 caches and verifies every required feature chunk. Vite development mode fetches development worker modules from the dev server, so offline browser tests use the production preview.

## Validation boundaries

Unit checks establish serializer correctness, reserved-region behavior, byte-level cross-library round trips, and guard behavior. Browser tests establish actual SVG/PNG rasterization, local image handling, downloads, reactive state, CSP compatibility, request behavior, and accessible interaction basics.

The image scanner supports one code per image. A best-effort second-symbol check masks the first detected rectangle and looks again. Some multi-code images cannot be decoded at all; the UI asks the user to crop. This is not a general multi-code detector.

Raw scanning supports UTF-8 text payloads. Binary/unsupported text encodings are rejected explicitly; the app does not silently replace invalid bytes. The encoder's UTF-8 output is independently compared with decoded bytes, while action recognition and Unicode display in native cameras remain device-test requirements.
