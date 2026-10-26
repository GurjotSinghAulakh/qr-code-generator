# Advanced Free QR Code Generator

## Product Requirements Document

| Field | Value |
| --- | --- |
| Version | 1.0 |
| Status | Proposed implementation baseline |
| Created | 26 October 2026 |
| Product | Advanced Free QR Code Generator; final brand name to be decided |
| Platform | Responsive web application, with offline support in v1 |
| Primary audience | Individuals, small businesses, educators, designers, and event organizers |
| Product owner | Project maintainer |

This document expands the repository's existing README, which describes a responsive generator for links and text with PNG and SVG downloads. The repository currently contains no application implementation. Features and targets below are proposed requirements, not claims about an existing product or validated user research.

## 1. Product summary

Build a free QR code generator that lets anyone create, customize, verify, and download useful QR codes without creating an account. Support everyday uses such as sharing a website, joining a Wi-Fi network, saving contact details, and preparing printed materials, as well as advanced uses such as bulk generation and reusable designs.

Generation, customization, decoding, and exports run on the user's device. The product does not introduce a redirect between a QR code and its destination. This keeps the initial product inexpensive to operate and allows downloaded static codes to work independently of the generator.

The core promise is: **create as many static QR codes as needed, use every released feature for free, and download without watermarks or an account.**

## 2. Problem and product opportunity

The product addresses these user problems, which should be validated during beta:

- A user wants a usable QR image immediately, with a clear explanation of what scanning it will do.
- A business needs branded print assets without a subscription or an unexpected expiry condition.
- A user sharing Wi-Fi or contact information wants to avoid uploading that information to a third party.
- An organizer needs hundreds of codes without repeatedly completing the same form.
- A designer needs to know whether colors, logos, density, and output size have made a code difficult to scan.
- A returning user wants to reuse a design without recreating every setting.

The product should earn trust through a clear free-use policy, visible destination previews, useful validation, and predictable exports.

## 3. Goals and non-goals

### 3.1 Goals

| ID | Goal | Proposed success criterion |
| --- | --- | --- |
| G-01 | Make a first QR code quickly | At least 90% of beta participants complete a URL-to-PNG task unassisted; median completion time is at most 30 seconds after the app loads. |
| G-02 | Produce dependable output | Every supported default-style fixture passes an independent decode check; physical-device checks meet the launch gate in section 18. |
| G-03 | Keep advanced creation free | All P0 and P1 requirements ship without payments, watermarks, required registration, or lifetime generation quotas. |
| G-04 | Keep user content on the device | Network inspection finds no transmission of entered payloads, uploaded images, CSV content, or generated files. |
| G-05 | Support professional workflows | A user can export vector artwork and generate a validated batch of 500 codes within the published resource limits. |
| G-06 | Make the tool accessible | All shipped user journeys meet the WCAG 2.2 AA target and the manual accessibility checks in this document. |

### 3.2 Non-goals for v1

- Hosted dynamic QR redirects, destination changes after printing, or scan analytics.
- Cloud accounts, team workspaces, cloud backups, or synchronization across devices.
- Hosting menus, PDFs, images, landing pages, or digital business card websites.
- A public generation API or remotely executed bulk jobs.
- Payment processing, payment-specific QR standards, ticket redemption, or identity verification.
- AI-generated QR artwork, arbitrary image-shaped codes, animated codes, or decorative modifications that cannot meet verification requirements.
- General barcode generation, Micro QR, rMQR, or structured append.
- A promise that every scanner, print process, or future third-party destination will work indefinitely.

## 4. Users and jobs to be done

| Persona | Job to be done | Required outcome |
| --- | --- | --- |
| Casual user | Share a link or short piece of text | Create and download a code with minimal decisions. |
| Small business owner | Put a menu, website, or Wi-Fi code on a sign | Create a branded, readable asset and understand its lifetime. |
| Designer or marketer | Place a code in a campaign or print layout | Export SVG/PDF, set colors and a logo, and inspect scan warnings. |
| Educator or organizer | Create labels or resource links in bulk | Import a CSV, fix invalid rows, and download an organized ZIP. |
| Privacy-conscious user | Share information without server processing | Generate locally, use offline, and control local persistence. |
| Returning creator | Reuse a prior design | Save a template or local project and export an updated copy. |

## 5. Free-use and lifetime policy

1. Creating, styling, verifying, and downloading supported static QR codes is free, including bulk tools and vector exports.
2. No account, credit card, email address, trial activation, attribution, or watermark is required.
3. The generator imposes no daily or lifetime generation quota and no scan counter. Per-job limits protect browser memory and responsiveness; users can run additional jobs.
4. Codes contain the selected payload directly. The generator does not silently shorten, rewrite, track, or proxy destinations.
5. Static codes have no generator-imposed expiry. A linked destination can still disappear, change, require authentication, or depend on an external subscription.
6. Editing a local project creates a new QR image. It does not change codes already printed or distributed. Explain this before users rely on editability.
7. A Wi-Fi QR code shares the credential with anyone who can read the code. A contact or event QR code similarly exposes its encoded content; QR encoding is not encryption.
8. Optional future donations or sponsorship may support operations, but must not block features, interrupt exports, or receive payload data. Launch without advertising scripts or monetization flows.
9. Future hosted features require separate requirements and a credible operating budget. They must not be necessary to keep existing static codes usable.

## 6. Scope and priority

**P0** is required for the public beta. **P1** completes the advanced v1 launch and is also mandatory before calling the release v1. **P2** is a candidate for a later release, with no delivery commitment. P1 features are free features, not a paid tier.

| Capability | P0: public beta | P1: advanced v1 | P2: later candidates |
| --- | --- | --- | --- |
| Content types | URL, text, Wi-Fi, contact | Email, phone, SMS, location, event | Additional standards after compatibility research |
| Preview | Live preview, exact payload, validation | More print and template guidance | Advanced diagnostics |
| Styling | Solid colors, safe logo placement, square modules | Tested rounded/dot styles, frames, saved templates | Additional verified styles |
| Export | PNG, SVG | PDF, print layouts, native file sharing where supported | Other formats if demand is validated |
| Verification | Decode generated output and uploaded QR images locally | Camera scanning | Additional decoder integrations |
| Bulk | Architecture supports batch processing | CSV import, row validation, ZIP export | More import formats |
| Persistence | In-memory session | Explicit local saving, history, project backup/import | Optional cloud sync |
| Offline | Works while loaded without network-dependent generation | Offline reload after a complete cached load | Further install integrations |
| Other | Mobile, keyboard access, privacy/help | Theme preference, URL campaign parameters | Localization, API, hosted dynamic codes |

## 7. Main user journeys

### 7.1 Create a basic code

1. Open the generator; URL is the default type, with an empty input and an explanatory preview placeholder.
2. Enter a complete URL. If a scheme is missing, offer an explicit “Use HTTPS” correction.
3. See a code, the destination, and a verification result after validation completes.
4. Select PNG or SVG; PNG defaults to a 1024 × 1024 pixel QR image including its quiet zone.
5. Download immediately. Show a scan-before-printing reminder without adding another required step.

### 7.2 Create a branded sign

1. Select a content type and complete its fields.
2. Set colors, upload a logo, and optionally choose a frame.
3. See the effect on density, protected regions, and verification; restore safe defaults if necessary.
4. Choose a print size or export SVG/PDF.
5. Scan a sample with a separate phone before printing a large quantity.

### 7.3 Create a Wi-Fi code

1. Select Wi-Fi and enter the SSID, supported security type, and password if required.
2. Optionally mark the network as hidden.
3. Keep the password masked until the user explicitly reveals it; explain that the QR image contains the credential.
4. Generate and download locally. Do not automatically save the payload or expose it in analytics.

### 7.4 Generate a batch

1. Open Bulk and download a sample CSV, or select a local CSV.
2. Map columns to the selected content type; one content type and one design apply to each job.
3. Review row counts, validation failures, filenames, and a preview of a selected row.
4. Fix the CSV and reimport, or explicitly choose “Generate valid rows only.”
5. Generate with visible progress and cancellation.
6. Download a ZIP containing successful images and a result manifest. Review counts before closing.

### 7.5 Decode an existing code

1. Open Scan and select an image, paste an image where supported, or explicitly start the camera.
2. Display detected content as inert text and identify the apparent type.
3. Let the user copy the content, deliberately open a supported destination, or load it into the editor.
4. Stop camera access on Stop, navigation away, or page backgrounding.

### 7.6 Reuse a project

1. Explicitly save a named project on the device or download its JSON backup.
2. Reopen it from local history or import the backup.
3. Validate the schema and show the restored fields and design.
4. Change content and download a new code, with a reminder that previous exports are unchanged.

## 8. Functional requirements

### 8.1 Generation and content

| ID | Priority | Requirement and acceptance criteria |
| --- | --- | --- |
| GEN-01 | P0 | Generate standard QR Code Model 2 symbols with automatic version selection. Use the smallest version that fits the serialized payload and selected error correction. Never truncate content to make it fit. |
| GEN-02 | P0 | Support URL, text, Wi-Fi, and contact forms according to section 9. Every field has a visible label, validation, and an example that is not pre-submitted data. |
| GEN-03 | P1 | Add email, phone, SMS, location, and calendar event forms according to section 9. Unsupported scanner actions are documented without claiming universal compatibility. |
| GEN-04 | P0 | Update previews after a proposed 150 ms debounce. Each preview is associated with a generation revision; results from older revisions cannot overwrite newer input. |
| GEN-05 | P0 | Provide an inspectable serialized payload, UTF-8 byte count, QR version, and correction level. For Wi-Fi, both the raw payload and its textual preview remain hidden until Reveal is chosen. |
| GEN-06 | P0 | Disable export while fields are invalid, output is stale, or verification has failed. Explain the reason and provide an actionable correction. |
| GEN-07 | P0 | Preserve drafts when switching types during the session. Reset clears the current draft; clearing all types requires an explicit action. Replacing a nonempty draft through import or decode requires confirmation. |
| GEN-08 | P0 | Support Unicode text, emoji, non-Latin names, and multiline input without silent normalization. Use a documented UTF-8 encoding strategy and verify Unicode interoperability with the test matrix. |
| GEN-09 | P1 | Offer optional URL campaign parameters for source, medium, campaign, term, and content. Show the resulting URL; preserve unrelated query parameters and fragments, and ask before replacing existing campaign keys. |
| GEN-10 | P0 | Website, social profile, menu, and externally hosted document use cases use ordinary URL payloads. Clearly state that this product does not upload or host those destinations. |

### 8.2 Customization

| ID | Priority | Requirement and acceptance criteria |
| --- | --- | --- |
| DES-01 | P0 | Default to black modules on an opaque white background. Accept valid solid foreground/background colors with a reset action and visible swatches plus text values. |
| DES-02 | P0 | Preserve a quiet zone of at least four modules on every side. Users may increase it; no shipped control permits reducing it below four. Frames and captions must stay outside it. |
| DES-03 | P0 | Offer error correction L, M, Q, and H with M as the default. Explain the capacity tradeoff. Adding a logo selects H and reruns generation; do not describe correction percentages as safe logo coverage. |
| DES-04 | P0 | Accept local PNG, JPEG, and WebP logos within section 11 limits. Normalize orientation, preserve aspect ratio, remove metadata through local rasterization, and embed the resulting image in exports. Do not accept SVG logos in v1. |
| DES-05 | P0 | Center logos within a conservative initial maximum box of 15% of symbol width, including logo padding. Enforce a function-pattern mask: logo and padding cannot overwrite finder, separator, timing, alignment, format, version, or other reserved modules. Shrink or reject a logo that cannot satisfy this rule. |
| DES-06 | P0 | Apply structural checks, color checks, and an independent decode check after a visual change. Failed or unverified output cannot be exported; offer Remove logo, Reset colors, or Reset design as relevant. |
| DES-07 | P1 | Add square, rounded, and dot data-module presets only after each passes the compatibility matrix. Keep function patterns standards-shaped. Do not expose arbitrary freehand edits. |
| DES-08 | P1 | Supply at least six tested templates covering plain, business card, Wi-Fi sign, restaurant/menu, event, and classroom uses. Template content is empty or clearly marked example data; applying a template preserves existing content. |
| DES-09 | P1 | Offer optional frames with a short editable caption, initially limited to 80 Unicode characters. Never crop or intrude into the quiet zone. Show final composition dimensions separately from QR area dimensions. |
| DES-10 | P1 | Save reusable design-only templates without payloads. A template must not accidentally retain contact data, Wi-Fi credentials, or campaign URLs. |

### 8.3 Export and print

| ID | Priority | Requirement and acceptance criteria |
| --- | --- | --- |
| EXP-01 | P0 | Export PNG at requested QR-area sizes from 256 to 4096 pixels per side, subject to minimum module-size checks. Default to 1024 pixels. Include the quiet zone in the reported QR-area size. |
| EXP-02 | P0 | Export self-contained SVG with a viewBox, vector QR geometry, and any locally embedded raster logo. Include no scripts, external resources, event handlers, tracking references, or raw payload metadata. |
| EXP-03 | P1 | Export PDF using vector QR geometry where possible. Allow A4 and US Letter pages, an explicit physical QR size, and optional caption. Embed required fonts or use a documented safe fallback. |
| EXP-04 | P1 | Provide print layouts for one code and repeated labels. Configure rows, columns, page margins, spacing, and caption visibility. Reject layouts that clip codes or exceed the page. |
| EXP-05 | P0 | Verify the actual rendered export, not only an unstyled matrix. PNG is decoded directly; SVG/PDF are rasterized for checking. Repeat checks after changing size, frame, logo, or design. |
| EXP-06 | P0 | Use predictable, editable filenames and appropriate MIME types. Default to a generic name such as qr-code.png; never derive filenames from secrets or full payloads. Sanitize path separators and unsupported filename characters. |
| EXP-07 | P1 | Share generated files using native browser sharing where available, with download as the fallback. Clipboard actions are user initiated; a permissions failure does not lose the generated output. |
| EXP-08 | P0 | Keep downloads available without sign-in, a marketing modal, a survey, or an email step. A success message means file creation/download initiation, not a guarantee that the browser saved it. |
| EXP-09 | P0 | v1 exports use opaque backgrounds. Transparent output is deferred because its final placement background cannot be verified by this application. |

### 8.4 Bulk generation

| ID | Priority | Requirement and acceptance criteria |
| --- | --- | --- |
| BULK-01 | P1 | Parse UTF-8 CSV with an optional BOM, header row, quoted fields, escaped quotes, and embedded newlines. Accept up to 500 nonempty data rows and a 5 MiB input file. Do not send file contents to a server. |
| BULK-02 | P1 | Supply per-type sample files and column mapping for all v1 content types. Use one type and a common style per job, with optional filename and caption columns. Show unknown or unmapped columns without silently including them in payloads. |
| BULK-03 | P1 | Validate every row with the same rules as single generation. Identify errors by source row and field, with a fix description. Initially block generation if any row is invalid until the user explicitly elects to skip invalid rows. |
| BULK-04 | P1 | Generate in a worker or equivalent cancellable background process with progress, counts, and a Cancel action. Cancellation stops scheduling new work, preserves the input for retry, and does not report the job as complete. |
| BULK-05 | P1 | Export PNG or SVG files in a ZIP with unique, sanitized filenames; duplicate names receive stable numeric suffixes. A manifest contains source row, filename, status, and error code, without duplicating raw payloads. |
| BULK-06 | P1 | Independently verify every output. Report validation and rendering failures separately, and omit failed images from the archive. Never report 500 successes if only 499 files were produced. |
| BULK-07 | P1 | Keep input order stable. When a job is cancelled, the user may explicitly download completed results with an incomplete-job marker in the manifest. No archive downloads automatically. |
| BULK-08 | P1 | Restrict bulk PNG size to 1024 pixels per QR area and estimated archive content to 100 MiB. Stop safely at a resource limit and offer a smaller batch, size, or SVG format. Limits are operational safeguards, not paid upgrades. |
| BULK-09 | P1 | If a CSV result manifest is supplied, neutralize spreadsheet formula injection in user-controlled cells beginning with =, +, -, @, or control characters. JSON is the canonical lossless manifest. |

### 8.5 Decoder and camera

| ID | Priority | Requirement and acceptance criteria |
| --- | --- | --- |
| SCAN-01 | P0 | Decode QR codes from local PNG, JPEG, and WebP files within section 11 limits. Show a useful error when no supported QR code is detected. Clearly support one code per image in v1; request a crop if detection is ambiguous. |
| SCAN-02 | P0 | Treat decoded content as untrusted inert text. Show the complete destination before any external action and never open URLs, join networks, call numbers, send messages, or import contacts automatically. |
| SCAN-03 | P0 | Allow copying the decoded content or explicitly loading a recognized, supported type into the editor. Preserve exact raw content for unsupported types and fall back to the text editor. |
| SCAN-04 | P1 | Start camera scanning only after a user action and browser permission. Offer camera selection where supported, Stop, and a local image fallback. Stop every media track on exit or backgrounding; do not store frames. |
| SCAN-05 | P0 | Display “Decoded successfully” only after a successful check. Do not claim that a decoded destination is safe, trustworthy, reachable, or authenticated. |

### 8.6 Local projects, templates, and offline use

| ID | Priority | Requirement and acceptance criteria |
| --- | --- | --- |
| SAVE-01 | P1 | Keep content persistence off by default. Save payloads only when the user explicitly saves a project; an independent theme preference may persist automatically. |
| SAVE-02 | P1 | Provide a local project library with name, type, updated date, reopen, duplicate, and delete actions. Label it “Saved on this device”; explain that clearing browser storage removes it. |
| SAVE-03 | P1 | Before saving Wi-Fi or contact payloads, explicitly disclose that local projects and backups are readable data, not encrypted storage. Require acknowledgment for that save and never auto-save subsequent sensitive edits. |
| SAVE-04 | P1 | Export/import a versioned JSON project containing content, design, and an optional normalized logo. Reject unsupported schema versions, unknown executable content, unsafe dimensions, and oversized files. Import is never execution. |
| SAVE-05 | P1 | Provide Clear saved projects and Clear all local app data actions. The latter removes projects, templates, preferences, and offline caches with a clear explanation; downloaded files remain under user control. |
| SAVE-06 | P1 | After the app confirms offline readiness, reload offline and use all P0/P1 generation, customization, decoding, bulk, and export functions. Cache required application code and built-in assets, never user payloads or generated files. |
| SAVE-07 | P1 | Handle unavailable storage, quota errors, private browsing restrictions, and cache failures without breaking in-memory generation. Do not announce “Saved” or “Available offline” when an operation failed. |
| SAVE-08 | P1 | Surface an available app update and apply it at a safe point. Do not interrupt an active batch or replace application code in the middle of an export. |

## 9. Content contracts and validation

The serializer, preview, decoder, and exports must agree on one canonical payload per revision. Exact bytes must survive an encode/decode round trip; supported parsers must also reconstruct the intended fields.

| Type | Priority | Inputs and validation | Payload contract |
| --- | --- | --- | --- |
| Website/URL | P0 | Required absolute HTTP or HTTPS URL; reject embedded username/password, control characters, and unsafe schemes. Intranet hostnames and localhost are allowed with a reachability note. | Encode the displayed, user-confirmed URL; preserve path case, queries, and fragments. No hidden redirect or automatic shortening. |
| Plain text | P0 | Required nonempty input; preserve spaces, newlines, Unicode, and leading/trailing content. Display encoded byte length. | Encode the text exactly; do not interpret it as HTML. |
| Wi-Fi | P0 | Required SSID; security choices WPA/WPA2 Personal, WEP, and open network; password required where appropriate; hidden-network checkbox. Enterprise Wi-Fi and WPA3-only claims are outside v1. | Use the documented WIFI payload convention with escaping for reserved characters and explicit hidden status. Validate SSID byte length and credential rules for the selected mode. |
| Contact | P0 | Required display name; optional structured names, organization, title, one phone, one email, website, address, and note. Validate supplied URLs and contact fields. | Emit a documented vCard 3.0 compatibility profile, including required N and FN properties, escaping, and CRLF line endings. Do not embed contact photos or remote references. |
| Email | P1 | Required single recipient; optional subject/body. Reject header injection in recipient/subject and encode line breaks only in the body. | Emit mailto with correctly encoded query values; do not double-encode input. |
| Phone | P1 | Require an explicit country code and valid international number after removing display punctuation. No inferred country or extension support in v1. | Emit tel with a normalized international number; scanning must still leave the call to the receiving app/user. |
| SMS | P1 | Required international recipient; optional body; show that messaging-app behavior varies. | Use the RFC 5724 sms URI form with an encoded body query parameter; test body handling on target devices. |
| Location | P1 | Required finite latitude from -90 to 90 and longitude from -180 to 180. Manual entry is sufficient; no map/geocoding service is required. | Emit a geo URI using decimal coordinates; no automatic location permission prompt. |
| Calendar event | P1 | Required title and start/end; end after start. Require an explicit IANA time zone for timed input; support all-day dates, optional location, and description. Reject or disambiguate invalid/ambiguous daylight-saving times. | Emit a minimal iCalendar VCALENDAR/VEVENT with VERSION, PRODID, UID, DTSTAMP, DTSTART, DTEND, and SUMMARY. Serialize timed events in UTC; all-day DTEND is exclusive. No recurrence or attendees in v1. |

Interoperability references: [ZXing payload conventions](https://github.com/zxing/zxing/wiki/Barcode-Contents), [vCard 3.0](https://www.rfc-editor.org/rfc/rfc2426), [SMS URI](https://www.rfc-editor.org/rfc/rfc5724), [geo URI](https://www.rfc-editor.org/rfc/rfc5870), and [iCalendar](https://www.rfc-editor.org/rfc/rfc5545). vCard 3.0 is an intentional compatibility choice, not the latest vCard standard; [vCard 4.0](https://www.rfc-editor.org/rfc/rfc6350) supersedes it. Release testing must confirm the chosen profile on target scanners.

### 9.1 Capacity and validation rules

- QR capacity depends on data mode, version, and correction level. Check the serialized result with the actual encoder rather than using a universal character limit. Standard QR versions run from 1 through 40. See [DENSO WAVE's capacity explanation](https://www.qrcode.com/en/about/version.html).
- Apply a 16 KiB pre-encoding UTF-8 input ceiling to prevent wasteful processing; this is a protective input limit, not a promise that 16 KiB fits in one code. Reject smaller payloads too when the selected QR configuration cannot encode them.
- Show field-specific errors before encoding and a distinct capacity error after serialization. Offer shorter content, fewer optional fields, a lower correction level where appropriate, or an externally hosted URL the user controls.
- Never silently truncate text, omit supplied fields, lower correction, remove a logo, or alter a destination to make generation succeed.
- Switching to a more demanding correction level must rerun capacity checks. Preserve user input if the new configuration cannot fit.
- Structured text serializers must escape delimiters and prevent users from injecting additional properties through field values.
- URL validation is syntactic. Do not fetch a destination or claim reachability, ownership, malware detection, or content safety.

## 10. Scan quality and rendering policy

### 10.1 Required checks

1. Preserve all function patterns and a four-module minimum quiet zone, following [DENSO WAVE's margin guidance](https://www.qrcode.com/en/howto/code.html).
2. Default to a darker foreground and lighter opaque background. As a conservative product heuristic, block module/background relative-luminance contrast below 4.5:1 and inverted colors. This threshold is not a QR certification rule or proof of readability.
3. For PNG, allocate integer module cells and center the matrix within the requested dimensions; any remaining pixels extend the background. Use at least four pixels per module at export size, increasing the requested size when necessary only after user confirmation.
4. Do not blur, interpolate, or crop module geometry. Protect required patterns even when applying dot or rounded styles.
5. For a logo, select H correction and enforce the region rules in DES-05. A decoder passing a single image is insufficient evidence that a logo placement is generally safe.
6. Decode the final artifact using a decoder independent of the generation library. Compare the decoded payload with the canonical payload for the current revision.
7. Report three separate states: checking, decoded successfully, and failed/not verified. Print suitability warnings remain visible even when digital decoding succeeds.
8. Require successful verification before export. If the validator fails or is unsupported, offer retry/reset guidance rather than exporting an unchecked styled artifact.

Correction levels improve recovery of damaged codewords at a capacity cost; their percentages do not establish a safe fraction of the image to cover with a logo. See [DENSO WAVE's error correction explanation](https://www.qrcode.com/en/about/error_correction.html).

### 10.2 Print guidance

- Show selected physical QR size, module count, quiet zone, and effective module size.
- For raster output, calculate effective print resolution from actual pixels and physical size. Offer SVG/PDF when a requested print size would make raster modules too small or soft.
- Start with a proposed 0.4 mm per-module print warning threshold, then calibrate through the physical test matrix. This is a product heuristic, not a universal minimum.
- Do not provide one universal safe print size or scan-distance guarantee. Density, contrast, material, light, camera, and viewing distance all matter.
- Recommend testing a real printed sample at its final size and intended distance before a large print run.

## 11. Initial limits and resource handling

These are proposed v1 safety limits. Validate them on reference devices before release, publish the actual limits in help, and keep any changes consistent across the UI and validators. MiB means 1,048,576 bytes.

| Resource | Initial limit | Behavior at limit |
| --- | --- | --- |
| Pre-serialization input | 16 KiB UTF-8 per item | Reject excess input with byte count; the encoder may reject smaller payloads for capacity. |
| Single PNG QR area | 256–4096 pixels per side | Reject too-small module cells; do not silently change the requested size. |
| Logo upload | 5 MiB; 16 megapixels decoded | Reject before retaining expensive bitmap allocations; normalize to at most 1024 pixels on its longest side. |
| Image to decode | 10 MiB; 24 megapixels decoded | Reject over-limit input; offer a smaller/cropped image. |
| CSV import | 5 MiB; 500 nonempty data rows | Reject excess rows/file size and offer split-job guidance. |
| Bulk PNG | Maximum 1024 pixels per QR area | Offer SVG or a smaller batch for higher-detail workflows. |
| Bulk output | 100 MiB estimated uncompressed file content | Stop safely and retain completed results; estimation is not a guarantee of peak browser memory use. |
| JSON project import | 5 MiB including logo | Reject oversized, malformed, or unsupported-schema files. |
| Saved projects | 100 projects and 25 MiB total app-managed project/template data | Ask the user to delete or export items; do not silently evict projects. |

Decode image headers/dimensions before creating large canvases where feasible. Cap in-flight bitmaps and worker concurrency, release intermediate buffers promptly, and recover gracefully from allocation failure. For framed PNGs, apply a separate 16-megapixel cap to the complete composition.

## 12. User experience and information architecture

### 12.1 Primary areas

- **Generate:** content type, fields, customization, preview, verification, and downloads.
- **Bulk:** sample CSV, import/mapping, row results, progress, and ZIP download.
- **Scan:** image upload/paste, camera control, decoded content, and deliberate next actions.
- **Saved:** local projects, design templates, import/export, and storage controls.
- **Help and privacy:** static versus dynamic codes, supported formats, print guidance, limits, local processing, and data deletion.

On desktop, place content controls alongside a visible preview and export panel. On mobile, place content entry before preview and downloads; advanced customization may collapse into labeled sections. Keep the primary download action easy to find without obscuring focused controls.

### 12.2 Interaction rules

- Show the generator on first load without onboarding, registration, or sample content that could be mistaken for the user's code.
- Use progressive disclosure for advanced settings while keeping the selected type, destination, quality status, and primary export visible.
- Preview changes must not shift the layout or move keyboard focus.
- Errors identify the field, cause, and next action. Batch errors identify the row as well.
- Use explicit labels such as “Save on this device” and “Download new image.” Avoid “Edit printed QR.”
- Theme changes apply to the application interface; they must not silently invert an existing QR design.
- State that the visible QR itself can disclose credentials even when the password field is masked.

### 12.3 Required states

| State | Expected behavior |
| --- | --- |
| Empty | Explain what to enter; disable export and show an accessible placeholder. |
| Invalid input | Show inline errors; retain entered values; do not label an older preview as current. |
| Generating/checking | Show progress/state without blocking typing or navigation. |
| Valid and verified | Enable downloads and show decoded-success status plus any print warning. |
| Capacity exceeded | Preserve input; explain available ways to reduce density. |
| Scan verification failed | Block export and provide relevant design-reset actions. |
| Bulk partial failure/cancellation | Show exact completed/failed/skipped counts and explicit partial-download option. |
| Storage/camera/clipboard unavailable | Explain the limitation and keep the available generation/download flow working. |
| Offline | Indicate status; avoid network-dependent prompts and false errors about local generation. |
| App update available | Offer a safe update after active work completes. |

## 13. Accessibility and compatibility

Target [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) across every shipped journey. Relevant requirements include visible keyboard focus, programmatic labels and errors, adequate UI contrast, reflow, and accessible status updates. Normal UI text should meet 4.5:1 contrast; large text and applicable non-text controls use their respective criteria. See [W3C's contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Additional product acceptance criteria:

- Complete generation, customization, import, export, scanning, and local deletion using the keyboard alone.
- Use semantic HTML and native controls where possible; provide text alternatives to color-only indicators and drag-and-drop uploads.
- Announce validation/export results through restrained live regions; do not announce every preview repaint.
- Provide an accessible textual payload summary beside the visual code, with sensitive fields hidden until explicitly revealed.
- Support 200% text zoom and reflow at 320 CSS pixels without page-level horizontal scrolling; contain wide batch tables separately.
- Set a preferred 44 × 44 CSS pixel touch target for primary interactive controls and respect reduced-motion preferences.
- Verify with VoiceOver/Safari and NVDA/Firefox or NVDA/Chrome, plus automated checks. Automated scans alone do not establish conformance.

Support the latest two stable releases available at release time of Chrome, Edge, Firefox, and Safari; include iOS Safari and Android Chrome. Record actual tested versions in release notes. Camera, clipboard, native sharing, and offline caching are capability-detected; image upload and download remain available when a capability is missing.

The generation application requires JavaScript. A no-JavaScript page explains that requirement without displaying nonfunctional controls. Reading an exported QR code does not require this application to be running.

## 14. Privacy, security, and data lifecycle

### 14.1 Data handling

| Data | Default handling | Persistence and deletion |
| --- | --- | --- |
| Current content and generated matrix | Process in memory on the device | Clear on reset; do not intentionally persist across a reload. Browser memory behavior is not secure erasure. |
| Logos and scan images | Decode and normalize locally | Release original files/buffers when replaced or cleared; retain a normalized logo only with an explicitly saved project/template. |
| CSV and batch outputs | Process locally | Release on job clear/page exit; never cache through the service worker. |
| Saved projects/templates | Local browser database | Explicit save, per-item deletion, and clear-all; no cloud backup. |
| Downloaded images/backups | Hand files to the browser | The user controls subsequent storage and sharing. |
| Theme and non-content preferences | Local browser storage | Clear through app-data controls. |
| Offline assets | Versioned application cache | Store application resources only; remove through clear-all/update cleanup. |
| Operational logs | Hosting may receive ordinary requests for app assets | Exclude payloads and user filenames; configure redaction and a proposed maximum 7-day retention before public launch. |

### 14.2 Mandatory controls

- **SEC-01:** No payload, password, contact field, uploaded content, QR image, or batch row may be included in an outbound request, error report, event, log, app URL, query string, or fragment.
- **SEC-02:** No session replay, fingerprinting, third-party advertising scripts, remote fonts, remote logo fetching, or external destination previews in v1. Serve required assets from the application's origin.
- **SEC-03:** Render user input and decoded content as text. Validate uploaded file signatures and dimensions as well as extensions; treat imported JSON/CSV and generated captions as untrusted input.
- **SEC-04:** Generated SVG/PDF files must be self-contained and inert. Use safe serialization; never interpolate user-controlled text into executable markup.
- **SEC-05:** Only HTTP/HTTPS URLs can become browser navigation actions. Other supported schemes require an explicit, labeled action; unsafe schemes remain non-clickable inert text.
- **SEC-06:** External links opened by the app use an appropriate no-referrer policy and isolate the opener. Do not automatically contact destinations for validation.
- **SEC-07:** Deploy over HTTPS with a restrictive Content Security Policy, MIME sniffing protection, and a permissions policy that disables unnecessary capabilities. Camera access is limited to the scanning feature.
- **SEC-08:** Review dependency licenses, pin dependency versions through a lockfile, and address exploitable security issues before launch. Never embed provider keys or application secrets in browser code.
- **SEC-09:** Wi-Fi masking is a display control, not encryption. Saved projects and JSON backups must be described as readable, especially on shared devices.
- **SEC-10:** Verify local-only processing with network interception during normal, error, offline, and bulk workflows. The privacy statement must match observed behavior.

Offline use does not make linked websites available offline, encrypt codes, or guarantee that a scanner supports a payload action. The product must explain these boundaries plainly.

## 15. Nonfunctional requirements

All timing figures are proposed engineering targets. Record the hardware, browser version, test content, and cold/warm state with each measurement. The reference set should include a physical mid-range Android phone with at least 4 GB RAM and a laptop with at least 8 GB RAM; name the actual models during beta.

| ID | Area | Acceptance target |
| --- | --- | --- |
| NFR-01 | Initial experience | On a cold mobile load with a defined 1.6 Mbps downlink, 750 Kbps uplink, and 150 ms round-trip latency, target LCP ≤ 2.5 seconds and CLS ≤ 0.1. Target INP ≤ 200 ms in a scripted interaction run. |
| NFR-02 | Initial code budget | Target at most 300 KiB compressed initial JavaScript; lazy-load bulk, PDF, camera, and other heavy tools. Offline readiness requires all needed offline modules to finish caching. |
| NFR-03 | Preview | For valid single payloads up to 500 UTF-8 bytes at 1024 pixels, p95 matrix/render update ≤ 300 ms after debounce on the reference mobile device. Measure across at least 100 input/style changes. |
| NFR-04 | Verification/export | p95 ready-to-download ≤ 2 seconds for a 1024-pixel single export and ≤ 5 seconds for a 4096-pixel PNG on the reference devices. Show progress for longer work. |
| NFR-05 | Bulk throughput | Process 500 URL rows of at most 200 UTF-8 bytes each, default style, no logo, 512-pixel PNG, including decode checks and ZIP packaging, in ≤ 60 seconds on the reference laptop. Publish observed mobile expectations separately. |
| NFR-06 | Responsiveness | Bulk work must not freeze navigation; acknowledge cancellation within 500 ms and stop scheduling new items immediately. Bound each in-flight task so cancellation completes within 2 seconds under reference conditions. |
| NFR-07 | Reliability | No wrong-payload exports, stale-preview downloads, uncaught input-triggered crashes, silent row loss, or unreported partial jobs in the release acceptance suite. |
| NFR-08 | Resilience | Generation remains usable when analytics, camera, clipboard, persistent storage, installation prompts, or the network are unavailable. Verification failure may block export with a clear explanation. |
| NFR-09 | Hosting availability | Proposed static-site availability objective of 99.9% monthly, verified by an external uptime check if operated publicly. Downloaded static codes are independent of this objective. |
| NFR-10 | Maintainability | Separate content serialization, matrix generation, styling, verification, exports, storage, and UI. Use typed interfaces, schema versions, meaningful fixtures, and repeatable build/check commands. |
| NFR-11 | International content | English interface at launch; Unicode content throughout. Keep UI strings separable for later localization and do not assume names/addresses follow one country's conventions. |

## 16. Technical direction and data model

These are implementation constraints and a proposed architecture, not a mandate to use a particular framework or hosting vendor.

### 16.1 Architecture

- Use a statically deployable frontend with no required application server, database service, or paid generation API.
- Use a maintained QR encoder and a separate maintained decoder; validate their capacity, Unicode handling, browser support, and licenses before adoption.
- Create a canonical content serializer per type and one matrix representation shared by preview and all renderers.
- Run bulk processing and expensive decoding/rendering outside the main UI thread where supported. Use bounded sequential chunks as a fallback.
- Use vector geometry for SVG/PDF and local canvas/raster processing for PNG/logos. Apply the same layout rules to every output format.
- Use a browser database such as IndexedDB for explicitly saved projects; reserve small key/value storage for non-sensitive preferences.
- Add a versioned service worker/cache strategy for offline assets, with safe update handling and no payload caching.
- Serve help/privacy content with the application. Do not make an external content service a dependency of the create/export flow.

### 16.2 Logical records

| Record | Required fields or behavior |
| --- | --- |
| ContentDraft | Type discriminator, schema version, type-specific fields; sensitive values never serialized into navigation state. |
| Design | Foreground/background, module preset, correction preference, quiet-zone modules, normalized logo and size, frame/caption settings. |
| QRProject | Schema version, local UUID, user-provided name, created/updated timestamps, ContentDraft, Design, export preferences. Save only by explicit action. |
| DesignTemplate | Schema version, name, Design, optional content-type hint; no content payload. |
| GenerationResult | Revision, canonical payload/bytes, matrix version, module count, effective correction, validation issues, verification status. In memory only. |
| BulkJob | In-memory job ID, type, mapping, common design, row states, counts, cancellation state, resource estimates. |
| ExportArtifact | Format, requested/effective dimensions, filename, source revision, verification result, file/blob. Release when no longer needed. |

Stable project identifiers are local identifiers, not analytics identifiers. Schema migrations must preserve content, be reversible through backups where practical, and reject unknown future versions safely.

## 17. Measurement and feedback

### 17.1 Measurement policy

Launch without product analytics collection. Evaluate the first release through automated checks, physical scanning, and voluntary moderated usability sessions. Core functionality never depends on telemetry.

An optional, default-off diagnostics mode may be considered later. It requires its own review and explicit opt-in before any event transmission. It may collect coarse event names, type categories, timings, and error codes, but never payloads, destination hosts, filenames, images, camera frames, exact contact details, or persistent identifiers. Do not introduce this mode as a v1 dependency.

### 17.2 Product measures

| Measure | Definition and collection | Initial target |
| --- | --- | --- |
| First-task success | Participants who independently create the requested URL PNG / all participants attempting it | ≥ 90%, with at least 10 participants spanning casual and advanced users |
| Time to first export | Time from loaded generator to download initiation in a moderated basic URL task | Median ≤ 30 seconds |
| Free-use comprehension | Participants who correctly explain static-code lifetime, local processing, and no account requirement | ≥ 90% after completing a task |
| Digital correctness | Supported fixtures that decode to the intended payload / all expected-valid fixtures | 100% |
| Physical scan success | Successful reads and correct destination/content in the controlled matrix | Meet section 18 launch gate |
| Bulk correctness | Expected successful rows represented by correct files and manifest entries | 100%; no duplicates or unreported omissions |
| Local-only processing | Payload-bearing outbound requests observed in acceptance workflows | 0 |
| Accessibility | Blocking keyboard/screen-reader issues in shipped journeys | 0; all applicable AA criteria assessed |

Do not claim to count scans of static QR codes; the application is not in the scan path. Downloads indicate creation intent, not scans, successful printing, or business conversion.

## 18. Validation and release acceptance

### 18.1 Test coverage

| Test area | Minimum coverage |
| --- | --- |
| Serialization | Every type; required/optional fields; delimiter escaping; newlines; Unicode; emoji; percent encoding; capacity boundaries. |
| Interoperability | Independent software decode plus native iOS/Android camera recognition where supported; test action semantics separately from raw decoding. |
| Styling | Every shipped preset; supported contrast extremes; logo at maximum allowed size; alignment-pattern collisions; quiet zone; frame/caption bounds. |
| Exports | PNG at supported boundaries; SVG in browser/design software; PDF and printed samples; matching payload and geometry across formats. |
| Bulk | 0, 1, 500, and 501 rows; BOM; quoted newlines; duplicates; invalid fields; formula-like filenames; cancellation; resource errors; manifest reconciliation. |
| Privacy/security | Network interception, injection strings, unsafe decoded schemes, malformed images/CSV/JSON, oversized dimensions, secret-free logs, camera lifecycle. |
| Local storage/offline | Save/reopen/delete; schema mismatch; quota failure; private browsing; clear-all; offline reload and all feature chunks; safe update during work. |
| UX/accessibility | Mobile/desktop, keyboard-only tasks, screen readers, zoom/reflow, error focus, no-color interpretation, reduced motion, permission denial. |
| Performance | Reproducible cold load, preview, single export, full batch, cancellation, and memory-failure recovery on named reference devices. |

### 18.2 Critical scenarios

1. **Correct URL:** Given a URL containing mixed-case paths, a query, Unicode, and a fragment, exporting and decoding preserves the user-confirmed destination without tracking or rewriting.
2. **Stale result prevention:** Given a download-ready preview, changing the payload immediately disables its export until the new revision passes verification.
3. **Wi-Fi escaping:** Given an SSID/password containing supported reserved characters, the decoded payload reconstructs the original credential; the password never appears in an outbound request or filename.
4. **Content exposure:** Given a Wi-Fi code, masking its password field does not imply that the QR image hides the credential; the relevant explanation remains visible.
5. **Unsafe design:** Given low contrast, a protected-pattern collision, or failed decoding, export is blocked and a safe reset action is available.
6. **Oversized payload:** Given input beyond encoding capacity, all user input remains available, no truncated QR is created, and an actionable capacity error appears.
7. **Partial batch:** Given 500 rows including three invalid rows, generation is initially blocked; after explicit skip approval, the archive contains exactly 497 successfully verified images or reports any additional processing failures precisely.
8. **Cancelled batch:** Given an active job, Cancel stops new work and presents exact completed/incomplete counts; partial results download only after an explicit action.
9. **Malicious decoded content:** Given a QR containing HTML or a javascript URI, content is displayed as inert text with no automatic execution or navigation.
10. **Sensitive persistence:** Given a new Wi-Fi draft, reloading does not restore it unless the user previously chose to save it and acknowledged the disclosure.
11. **Offline use:** Given confirmed offline readiness, disconnecting and reloading still permits generation, bulk import, local scanning, and PNG/SVG/PDF/ZIP export.
12. **Keyboard use:** Given keyboard-only input, a user can create a contact code, change its style, correct an error, export it, save a project, and delete that project without a pointer.
13. **Camera exit:** Given active camera scanning, stopping, leaving Scan, or backgrounding the page releases all tracks and stops frame processing.
14. **Static lifetime:** Given an exported code and an unavailable generator site, a separate device can decode the payload; opening a remote destination remains dependent on that destination.
15. **Saved edit:** Given a saved project whose image has already been distributed, editing it produces a new image and does not imply that the earlier image changed.

### 18.3 Physical scan launch gate

- Test at least one iPhone and two Android phones from different vendors, including a mid-range device. Record OS/scanner versions and actual device models.
- Cover every content type, each shipped visual preset, logos/no logos, the lowest permitted contrast, short/medium/near-capacity payloads, and at least 20 mm, 30 mm, and 50 mm print sizes where the module-size policy permits them.
- Use plain paper and coated stock under normal indoor lighting; include reasonable angled and lower-light checks. The plan must identify at least 100 distinct valid code/device/condition combinations, with three scan attempts per combination.
- Require at least 95% successful reads within two seconds across valid test combinations, 100% correct decoded content on successful reads, and no repeatable failure in the default black-on-white style at its recommended size under normal conditions.
- A structured action may be unsupported by a native camera even when the raw payload is correct. Publish the tested action compatibility; do not hide unsupported actions behind a general decode success rate.
- Remove a failing decorative preset or increase its limits before release. Do not weaken the core free-use or privacy promises to meet the date.

### 18.4 Definition of done

A release is done when its prioritized requirements have traceable checks, acceptance tests pass, supported-device results are recorded, accessibility and privacy reviews pass, production build/deployment checks succeed, and help text matches actual limits and behavior. No blocker/critical defects or unresolved wrong-payload, data-transmission, or secret-exposure defects may remain.

## 19. Delivery plan and dependencies

No calendar deadline is assumed. Estimate implementation after choosing dependencies and completing the encoder/decoder prototype.

| Milestone | Deliverable | Exit criteria |
| --- | --- | --- |
| M0: feasibility | Evaluate encoder/decoder, canonical serializers, export rendering, logo masking, and Unicode; define reference devices and fixtures. | Demonstrate byte-correct round trips, safe logo behavior, and an independent artifact check; record library/license decisions. |
| M1: public beta | All P0 content, customization, PNG/SVG, image decoding, responsive UI, accessibility foundation, privacy/help. | All P0 requirements and relevant acceptance gates pass; no sign-in or payment dependency. |
| M2: advanced workflows | P1 content types, styles/templates, PDF/print, CSV/ZIP, camera, and local projects. | Full batch reconciliation, storage/security behavior, and supported action compatibility verified. |
| M3: v1 launch | Offline readiness, safe updates, performance tuning, physical testing, usability study, final help/privacy text. | All P0/P1 requirements meet the definition of done. |
| M4: later evaluation | Research selected P2 opportunities from actual demand. | Separate requirements and operating-cost assessment before committing hosted features. |

Dependencies include suitable open-source encoder/decoder and export libraries, secure static hosting, physical scanner/print access, browser storage/media capabilities, and maintainer time for support and security updates. The create/export path must not require a third-party service account.

Before public launch, record expected static hosting and monitoring costs, a monthly budget, an accountable maintainer, and a rollback procedure. Prefer hosting and dependency choices that keep per-generation server cost at zero. Traffic, hosting, and maintenance still have costs even when usage is free.

## 20. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Styled codes pass software checks but scan poorly in print | Failed campaigns or reprints | Conservative defaults, protected regions, physical matrix, and removal of failing presets. |
| Large batches/images exhaust mobile memory | Crashes or lost work | Workers, bounded concurrency, limits, early dimension checks, partial-result handling, and smaller-job guidance. |
| Sensitive local content appears in logs or persistence | Loss of privacy/trust | No transmission by design, explicit saves, secret-free errors, network interception, and clear disclosures. |
| Local storage is cleared or unavailable | Lost saved projects | Device-only labeling, project export, explicit quota handling, and in-memory fallback. |
| QR action recognition varies by scanner | A valid code does not launch the intended app | Standards-based payloads, device action testing, documented compatibility, and raw-text fallback. |
| Offline caching omits a feature chunk or keeps stale code | Offline feature failures | Cache-completeness checks, versioned caches, offline end-to-end checks, safe updates. |
| “Free” is interpreted as unlimited hosted services | Unsustainable operating costs | Direct static payloads, explicit job limits, no backend dependency, separate hosted-feature requirements. |
| Users expect edits to change printed codes | Incorrect expectations and reprints | Explain static behavior beside save/edit flows and in help. |
| Unsafe QR destinations create misplaced trust | Users open malicious links | Inert decoding, full destination display, deliberate navigation, no safety certification claims. |
| Broad v1 scope delays a usable product | Delayed feedback | Release the clearly defined P0 beta first, while keeping P1 mandatory for advanced v1. |

## 21. Assumptions and decisions to confirm

The following defaults let implementation proceed without blocking on branding or future services. Changes should update scope, acceptance criteria, and any affected privacy promises.

| Decision | Working default | Owner/checkpoint |
| --- | --- | --- |
| Brand/domain | Use the descriptive product name until a brand is selected. | Maintainer before public launch |
| Product model | Free, no required account, browser processing, direct static payloads. | Maintainer at M0; foundational product constraint |
| Technology stack | Choose a maintainable static frontend after the feasibility prototype; do not require a backend. | Engineering at M0 |
| Code license | MIT, explicitly approved by the owner on 26 October 2026; dependency notices retain their respective licenses. | Confirmed; see LICENSE |
| vCard profile | Use tested vCard 3.0 for initial scanner compatibility; evaluate 4.0 separately. | Engineering during M0/M1 |
| Operational limits | Begin with section 11; adjust based on reference-device results and document changes. | Engineering before M2 exit |
| Analytics | None at launch; measure through voluntary research and test runs. | Maintainer before public launch |
| Interface languages | English initially, with international payload support. | Product before v1 |
| Dynamic QR and accounts | Deferred; no implied lifetime service commitment. | Product after v1 evidence |
| Timing/budget | Milestones without invented dates; estimate after M0 and set an explicit operations budget. | Maintainer after M0 |

## 22. Source notes

Technical references were checked on 26 October 2026. They inform interoperability and accessibility requirements; product limits, roadmap, privacy choices, and performance goals are proposed decisions rather than requirements imposed by those sources.

- [DENSO WAVE: QR information capacity and versions](https://www.qrcode.com/en/about/version.html)
- [DENSO WAVE: required margin/quiet zone](https://www.qrcode.com/en/howto/code.html)
- [DENSO WAVE: error correction](https://www.qrcode.com/en/about/error_correction.html)
- [ZXing: common QR payload conventions](https://github.com/zxing/zxing/wiki/Barcode-Contents)
- [RFC 2426: vCard 3.0](https://www.rfc-editor.org/rfc/rfc2426) and [RFC 6350: vCard 4.0](https://www.rfc-editor.org/rfc/rfc6350)
- [RFC 5724: SMS URI scheme](https://www.rfc-editor.org/rfc/rfc5724)
- [RFC 5870: geo URI scheme](https://www.rfc-editor.org/rfc/rfc5870)
- [RFC 5545: iCalendar](https://www.rfc-editor.org/rfc/rfc5545)
- [W3C: WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
