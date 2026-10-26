import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

// Local QA artifacts only. This does not add a print/export feature to the app.
const output = 'beta-results/physical-pack';
const vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' });
try {
  const { createLayout, renderSVG, DEFAULT_DESIGN } = await vite.ssrLoadModule('/src/lib/qr.ts');
  const { emptyDraft, serializeContent } = await vite.ssrLoadModule('/src/lib/content.ts');
  const serialize = (type, fields) => {
    const result = serializeContent({ ...emptyDraft(type), fields: { ...emptyDraft(type).fields, ...fields } });
    assert.equal(result.ok, true, `Invalid synthetic ${type} fixture`);
    return result.payload;
  };
  const logo = new PNG({ width: 32, height: 32 });
  for (let i = 0; i < logo.data.length; i += 4) logo.data.set([24, 54, 90, 255], i);
  const logoDesign = { dataUrl: `data:image/png;base64,${PNG.sync.write(logo).toString('base64')}`, width: 32, height: 32, name: 'synthetic-square' };
  const fixtures = [
    ['url-classic', 'url', 'short', 'https://example.com', { correction: 'L' }],
    ['url-forest', 'url', 'short', 'https://example.com/forest', { foreground: '#174d38' }],
    ['url-midnight', 'url', 'short', 'https://example.com/midnight', { foreground: '#18365a', correction: 'Q' }],
    ['url-plum', 'url', 'short', 'https://example.com/plum', { foreground: '#542b4a', background: '#fffaf5', correction: 'H' }],
    ['text-unicode', 'text', 'short', 'Hello, café — नमस्ते — こんにちは 🌍\nExact text; no destination.', {}],
    ['wifi-escaped', 'wifi', 'medium', serialize('wifi', { ssid: 'QR;Guest', password: 'Test:Only;2026', security: 'WPA', hidden: 'false' }), {}],
    ['contact-unicode', 'contact', 'medium', serialize('contact', { name: 'Zoë Test', firstName: 'Zoë', lastName: 'Test', organization: 'Synthetic QA', email: 'qa@example.com', note: 'Contact fixture — café' }), { correction: 'Q' }],
    ['text-medium', 'text', 'medium', 'local-test-'.repeat(45), {}],
    ['text-dense', 'text', 'near-capacity-H', 'a'.repeat(1250), { correction: 'H' }],
    ['text-lowest-contrast', 'text', 'short', 'Lowest permitted contrast sample', { foreground: '#767676' }],
    ['url-logo', 'url', 'short', 'https://example.com/brand', { logo: logoDesign }],
    ['text-logo', 'text', 'short', 'QR Studio', { logo: logoDesign }],
  ];
  await fs.mkdir(output, { recursive: true });
  const samples = [];
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const paint = (png, x, y, width, height, color) => {
    for (let row = y; row < y + height; row++) for (let col = x; col < x + width; col++) {
      png.data.set([...color, 255], (row * png.width + col) * 4);
    }
  };
  for (const [id, type, density, payload, changes] of fixtures) {
    const layout = createLayout(payload, { ...DEFAULT_DESIGN, ...changes });
    const { matrix, design, cell, origin, logoBox } = layout;
    const png = new PNG({ width: design.size, height: design.size });
    paint(png, 0, 0, design.size, design.size, rgb(design.background));
    for (let row = 0; row < matrix.width; row++) for (let col = 0; col < matrix.width; col++) {
      if (matrix.modules[row * matrix.width + col]) paint(png, origin + col * cell, origin + row * cell, cell, cell, rgb(design.foreground));
    }
    if (logoBox) {
      const x = origin + logoBox.x * cell, y = origin + logoBox.y * cell, side = logoBox.width * cell;
      paint(png, x, y, side, side, rgb(design.background));
      // Matches the solid square logo and half-cell border rendered by renderSVG.
      paint(png, Math.ceil(x + cell / 2), Math.ceil(y + cell / 2), side - cell, side - cell, [24, 54, 90]);
    }
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    assert.ok(decoded, `Independent decode failed: ${id}`);
    assert.deepEqual(decoded.binaryData, [...new TextEncoder().encode(payload)], `Payload mismatch: ${id}`);
    await fs.writeFile(`${output}/${id}.svg`, renderSVG(layout));
    await fs.writeFile(`${output}/${id}.png`, PNG.sync.write(png));
    // Physical size includes the full image and quiet zone, just as the app export does.
    const sizes = [20, 30, 50, 100].filter((mm) => cell * mm / design.size >= 0.4);
    assert.ok(sizes.length, `No eligible physical size: ${id}`);
    samples.push({ id, type, density, payload, bytes: new TextEncoder().encode(payload).length, design, version: matrix.version, moduleMmAt100: cell * 100 / design.size, sizes, softwareDecoded: true });
  }
  // Expected rejection is separate from valid physical-scan denominators.
  let rejected;
  for (let length = 1; length < 1200; length += 7) {
    try { createLayout('a'.repeat(length), { ...DEFAULT_DESIGN, logo: logoDesign }); }
    catch (error) {
      if (/protected patterns/.test(error.message)) { rejected = { payload: 'a'.repeat(length), expected: error.message }; break; }
      throw error;
    }
  }
  assert.ok(rejected, 'Missing protected-center rejection fixture');
  const csv = (rows) => rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n') + '\r\n';
  const trials = [['combination_id', 'sample', 'device_slot', 'stock', 'condition', 'size_mm', 'attempt', 'actual_model', 'os_version', 'scanner_version', 'distance_cm', 'elapsed_ms', 'read_success', 'content_exact', 'action_result', 'notes']];
  let combinations = 0;
  const usedSizes = new Set();
  for (const [index, sample] of samples.entries()) for (let device = 0; device < 3; device++) for (let condition = 0; condition < 3; condition++) {
    const id = `C${String(++combinations).padStart(3, '0')}`;
    const size = sample.sizes[(index + device + condition) % sample.sizes.length];
    usedSizes.add(size);
    for (let attempt = 1; attempt <= 3; attempt++) trials.push([id, sample.id, ['iphone', 'android-vendor-a', 'android-vendor-b'][device], (index + device + condition) % 2 ? 'coated' : 'plain', ['indoor-normal', 'indoor-angle-30deg', 'lower-light'][condition], size, attempt, '', '', '', '', '', '', '', '', '']);
  }
  assert.equal(combinations, 108);
  assert.equal(trials.length - 1, 324);
  for (const size of [20, 30, 50]) assert.ok(usedSizes.has(size));
  await fs.writeFile(`${output}/scan-trials.csv`, csv(trials));
  await fs.writeFile(`${output}/manifest.json`, JSON.stringify({ status: 'Prepared; physical trials not run', combinations, attempts: 324, samples, protectedCenterRejection: rejected }, null, 2));
  const pages = samples.flatMap((sample) => sample.sizes.map((mm) => `<section><h2>${sample.id} · ${mm} mm</h2><p>${sample.type} · ${sample.bytes} UTF-8 bytes · version ${sample.version} · module ${(sample.moduleMmAt100 * mm / 100).toFixed(3)} mm</p><img src="${sample.id}.svg" width="${mm * 96 / 25.4}" height="${mm * 96 / 25.4}" style="width:${mm}mm;height:${mm}mm" alt="${sample.id} test code"><p>Calibration: line below must measure exactly 50 mm.</p><div class="calibration"></div><p>Prepared fixture — no physical scan result recorded.</p></section>`)).join('\n');
  await fs.writeFile(`${output}/print.html`, `<!doctype html><html lang="en"><meta charset="utf-8"><title>QR Studio physical QA pack</title><style>@page{size:A4;margin:15mm}body{font:14px system-ui;color:#111}section{break-after:page;page-break-after:always}section:last-child{break-after:auto}img{display:block;max-width:none}.calibration{width:50mm;border-top:1px solid black;margin:8mm 0}h2{font-size:20px}@media screen{section{padding:24px;border-bottom:1px solid #ccc}}</style><h1>Physical scan QA — not yet executed</h1><p>Print at 100% / actual size; disable fit-to-page, headers and footers. Measure the calibration line before testing. Print on plain and coated stock. Use scan-trials.csv and the manual protocol to record results.</p>${pages}</html>`);
  console.log(`Prepared ${samples.length} software-decoded fixtures, ${combinations} combinations, 324 blank attempts: ${output}/print.html`);
  console.log('Physical scan, printer scaling, stock, native actions, and real devices are NOT verified by this command.');
} finally {
  await vite.close();
}
