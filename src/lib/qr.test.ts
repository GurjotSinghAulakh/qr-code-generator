import { describe, expect, it } from 'vitest';
import { createLayout, createMatrix, DEFAULT_DESIGN, renderSVG, safeLogoBox, sanitizeFilename, type Correction } from './qr';
import { assertDecodedPayload, decodePixels } from './decode';
import { emptyDraft, serializeContent } from './content';
import { readImageHeader } from './images';

function raster(payload: string, correction: Correction) {
  const layout = createLayout(payload, { ...DEFAULT_DESIGN, size: 512, correction });
  const { cell, origin, matrix } = layout;
  const pixels = new Uint8ClampedArray(512 * 512 * 4).fill(255);
  for (let row = 0; row < matrix.width; row++) for (let col = 0; col < matrix.width; col++) {
    if (!matrix.modules[row * matrix.width + col]) continue;
    for (let y = origin + row * cell; y < origin + (row + 1) * cell; y++) for (let x = origin + col * cell; x < origin + (col + 1) * cell; x++) {
      const index = (y * 512 + x) * 4;
      pixels[index] = pixels[index + 1] = pixels[index + 2] = 0;
    }
  }
  return decodePixels(pixels, 512, 512);
}

describe('independent matrix round trips', () => {
  const wifi = emptyDraft('wifi');
  wifi.fields.ssid = 'Café;Guest'; wifi.fields.password = 'password;123';
  const contact = emptyDraft('contact');
  contact.fields.name = '日本 🌍'; contact.fields.note = 'Line one\nLine two';
  const payloads = ['https://example.com/Case?q=%25#Hash', '  Hello 🌍 日本\nnext line  ', ...[wifi, contact].map((draft) => {
    const result = serializeContent(draft);
    if (!result.ok) throw new Error('Invalid fixture');
    return result.payload;
  })];
  for (const correction of ['L', 'M', 'Q', 'H'] as const) {
    for (const [index, payload] of payloads.entries()) it(`preserves bytes for fixture ${index} with ${correction}`, () => {
      expect(() => assertDecodedPayload(raster(payload, correction), payload)).not.toThrow();
    });
  }
});

describe('rendering safety', () => {
  it('keeps an opaque quiet zone and integer module cells at non-multiple sizes', () => {
    const layout = createLayout('https://example.com', { ...DEFAULT_DESIGN, size: 1001 });
    expect(Number.isInteger(layout.cell)).toBe(true);
    expect(layout.origin).toBeGreaterThanOrEqual(layout.cell * 4);
    expect(1001 - layout.origin - layout.matrix.width * layout.cell).toBeGreaterThanOrEqual(layout.cell * 4);
    expect(renderSVG(layout)).toContain('fill="#ffffff"');
  });

  it.each([
    { foreground: '#eeeeee' }, { foreground: '#ffffff', background: '#000000' },
    { foreground: 'red" onload="alert(1)' }, { quietZone: 3 }, { size: 255 }, { size: 4097 },
  ])('rejects unsafe design %j', (change) => {
    expect(() => createLayout('https://example.com', { ...DEFAULT_DESIGN, ...change })).toThrow();
  });

  it('rejects output with too few pixels per module', () => {
    expect(() => createLayout('🌍'.repeat(200), { ...DEFAULT_DESIGN, size: 256, correction: 'H' })).toThrow(/pixels/);
  });

  it('reports capacity errors without truncating or disclosing content', () => {
    expect(() => createMatrix('🌍'.repeat(1000), 'H')).toThrow(/does not fit/);
  });

  it('never places a logo over reserved modules across QR versions', () => {
    for (const length of [1, 30, 100, 200, 500, 900]) {
      const matrix = createMatrix('a'.repeat(length), 'H');
      const box = safeLogoBox(matrix);
      if (!box) continue;
      expect(box.width).toBeLessThanOrEqual(matrix.width * 0.15);
      for (let row = box.y; row < box.y + box.width; row++) for (let col = box.x; col < box.x + box.width; col++) {
        expect(matrix.reserved[row * matrix.width + col]).toBe(0);
      }
    }
  });

  it('rejects an injected logo source and omits payload metadata from SVG', () => {
    expect(() => createLayout('secret-payload', { ...DEFAULT_DESIGN, logo: { dataUrl: 'https://evil.example/logo', width: 10, height: 10, name: 'logo' } })).toThrow(/logo/);
    const svg = renderSVG(createLayout('<script>alert(1)</script>', DEFAULT_DESIGN));
    expect(svg).not.toContain('<script>');
    expect(svg).not.toContain('alert');
    expect(svg).not.toContain('http://evil');
  });

  it('rejects missing or mismatched independent decoding', () => {
    expect(() => assertDecodedPayload(null, 'hello')).toThrow();
    expect(() => assertDecodedPayload({ text: 'hello', bytes: [0], version: 1 }, 'hello')).toThrow();
  });

  it('sanitizes paths and reserved filenames without using payload content', () => {
    expect(sanitizeFilename('../my/code.svg')).toBe('-my-code');
    expect(sanitizeFilename('CON')).toBe('qr-code');
    expect(sanitizeFilename('')).toBe('qr-code');
    expect(sanitizeFilename('my campaign.png')).toBe('my campaign');
  });

  it('checks image signatures and dimensions before decoding', () => {
    const png = new Uint8Array(24);
    png.set([137, 80, 78, 71, 13, 10, 26, 10]);
    png.set([73, 72, 68, 82], 12);
    const view = new DataView(png.buffer);
    view.setUint32(16, 1024); view.setUint32(20, 512);
    expect(readImageHeader(png)).toEqual({ width: 1024, height: 512, type: 'image/png' });
    expect(() => readImageHeader(new TextEncoder().encode('<svg onload="alert(1)"/>'))).toThrow(/valid PNG/);
    expect(() => readImageHeader(new Uint8Array())).toThrow();
  });
});
