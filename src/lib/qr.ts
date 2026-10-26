import QRCode from 'qrcode';
import { byteLength, MAX_INPUT_BYTES } from './content';
import { UserError } from './errors';

export type Correction = 'L' | 'M' | 'Q' | 'H';
export interface Logo { dataUrl: string; width: number; height: number; name: string }
export interface Design {
  foreground: string;
  background: string;
  correction: Correction;
  quietZone: number;
  size: number;
  logo?: Logo;
}
export interface QRMatrix {
  modules: Uint8Array;
  reserved: Uint8Array;
  width: number;
  version: number;
  correction: Correction;
}
export interface LogoBox { x: number; y: number; width: number }
export interface QRLayout {
  matrix: QRMatrix;
  design: Design;
  cell: number;
  origin: number;
  contrast: number;
  minimumSize: number;
  logoBox?: LogoBox;
}
export const DEFAULT_DESIGN: Design = {
  foreground: '#000000', background: '#ffffff', correction: 'M', quietZone: 4, size: 1024,
};

export function luminance(color: string): number {
  if (!/^#[\da-f]{6}$/i.test(color)) throw new UserError('Use a six-digit hexadecimal color, such as #166b4b.');
  const channels = [1, 3, 5].map((index) => parseInt(color.slice(index, index + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function createMatrix(payload: string, correction: Correction): QRMatrix {
  if (!payload || byteLength(payload) > MAX_INPUT_BYTES) throw new UserError('Enter content within the 16 KiB input limit.');
  if (!['L', 'M', 'Q', 'H'].includes(correction)) throw new UserError('Choose a supported error correction level.');
  try {
    const code = QRCode.create(payload, { errorCorrectionLevel: correction });
    return {
      width: code.modules.size, version: code.version, correction,
      modules: new Uint8Array(code.modules.data), reserved: new Uint8Array(code.modules.reservedBit),
    };
  } catch {
    throw new UserError('This content does not fit in one QR code at this correction level. Shorten it, remove optional fields, or choose a lower correction level.');
  }
}

export function safeLogoBox(matrix: QRMatrix): LogoBox | undefined {
  for (let width = Math.floor(matrix.width * 0.15); width >= 3; width--) {
    const start = Math.floor((matrix.width - width) / 2);
    let clear = true;
    for (let row = start; row < start + width && clear; row++) {
      for (let col = start; col < start + width; col++) {
        if (matrix.reserved[row * matrix.width + col]) { clear = false; break; }
      }
    }
    if (clear) return { x: start, y: start, width };
  }
}

export function createLayout(payload: string, design: Design): QRLayout {
  const dark = luminance(design.foreground);
  const light = luminance(design.background);
  const contrast = (light + 0.05) / (dark + 0.05);
  if (dark >= light || contrast < 4.5) throw new UserError('Use darker modules on a lighter background with at least 4.5:1 contrast. Reset colors to restore a safe combination.');
  if (!Number.isInteger(design.quietZone) || design.quietZone < 4 || design.quietZone > 32) throw new UserError('Use a quiet zone between 4 and 32 modules.');
  if (!Number.isInteger(design.size) || design.size < 256 || design.size > 4096) throw new UserError('Choose a whole-pixel export size from 256 to 4096.');
  if (design.logo && (!/^data:image\/png;base64,[a-z\d+/=]+$/i.test(design.logo.dataUrl)
    || !Number.isFinite(design.logo.width) || !Number.isFinite(design.logo.height)
    || design.logo.width <= 0 || design.logo.height <= 0 || design.logo.width > 1024 || design.logo.height > 1024)) {
    throw new UserError('Remove the logo and upload a supported image again.');
  }
  const matrix = createMatrix(payload, design.logo ? 'H' : design.correction);
  const totalModules = matrix.width + design.quietZone * 2;
  const minimumSize = Math.max(256, totalModules * 4);
  const cell = Math.floor(design.size / totalModules);
  if (cell < 4) throw new UserError(`This code needs at least ${minimumSize} pixels for four pixels per module. Increase the export size or shorten the content.`);
  const origin = Math.floor((design.size - matrix.width * cell) / 2);
  const logoBox = design.logo ? safeLogoBox(matrix) : undefined;
  if (design.logo && !logoBox) throw new UserError('This QR version has protected patterns in its center. Remove the logo or shorten the content; those patterns cannot be covered.');
  return { matrix, design, cell, origin, contrast, minimumSize, logoBox };
}

export function renderSVG(layout: QRLayout): string {
  const { matrix, design, cell, origin, logoBox } = layout;
  const paths: string[] = [];
  for (let row = 0; row < matrix.width; row++) {
    for (let col = 0; col < matrix.width; col++) {
      if (matrix.modules[row * matrix.width + col]) paths.push(`M${origin + col * cell} ${origin + row * cell}h${cell}v${cell}h-${cell}z`);
    }
  }
  let logo = '';
  if (design.logo && logoBox) {
    const x = origin + logoBox.x * cell;
    const y = origin + logoBox.y * cell;
    const side = logoBox.width * cell;
    const available = side - cell;
    const scale = Math.min(available / design.logo.width, available / design.logo.height);
    const width = Math.round(design.logo.width * scale * 100) / 100;
    const height = Math.round(design.logo.height * scale * 100) / 100;
    logo = `<rect x="${x}" y="${y}" width="${side}" height="${side}" fill="${design.background}"/><image x="${x + (side - width) / 2}" y="${y + (side - height) / 2}" width="${width}" height="${height}" href="${design.logo.dataUrl}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${design.size}" height="${design.size}" viewBox="0 0 ${design.size} ${design.size}"><rect width="100%" height="100%" fill="${design.background}"/><path fill="${design.foreground}" d="${paths.join('')}"/>${logo}</svg>`;
}

export function sanitizeFilename(value: string): string {
  const cleaned = value.replace(/\.(png|svg)$/i, '').replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/gu, '-').trim().replace(/^[. ]+|[. ]+$/g, '').slice(0, 100);
  return !cleaned || /^(?:con|prn|aux|nul|com\d|lpt\d)(?:\.|$)/i.test(cleaned) ? 'qr-code' : cleaned;
}
