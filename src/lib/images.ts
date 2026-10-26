import { UserError } from './errors';
import type { Logo } from './qr';

export interface ImageHeader { width: number; height: number; type: 'image/png' | 'image/jpeg' | 'image/webp' }
export function readImageHeader(bytes: Uint8Array): ImageHeader {
  const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (offset: number, length: number) => String.fromCharCode(...bytes.slice(offset, offset + length));
  let header: ImageHeader | undefined;
  if (bytes.length >= 24 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v) && ascii(12, 4) === 'IHDR') {
    header = { width: data.getUint32(16), height: data.getUint32(20), type: 'image/png' };
  } else if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 4 < bytes.length) {
      if (bytes[offset] !== 0xff) break;
      let marker = bytes[++offset];
      while (marker === 0xff && offset + 1 < bytes.length) marker = bytes[++offset];
      offset++;
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > bytes.length) break;
      const length = data.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker) && length >= 7) {
        header = { width: data.getUint16(offset + 5), height: data.getUint16(offset + 3), type: 'image/jpeg' };
        break;
      }
      offset += length;
    }
  } else if (bytes.length >= 30 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') {
    const chunk = ascii(12, 4);
    const uint24 = (offset: number) => bytes[offset] + bytes[offset + 1] * 256 + bytes[offset + 2] * 65536;
    if (chunk === 'VP8X') {
      if (bytes[20] & 2) throw new UserError('Use a still image; animated WebP files are not supported.');
      header = { width: 1 + uint24(24), height: 1 + uint24(27), type: 'image/webp' };
    } else if (chunk === 'VP8 ' && bytes[23] === 0x9d && bytes[24] === 1 && bytes[25] === 0x2a) {
      header = { width: data.getUint16(26, true) & 0x3fff, height: data.getUint16(28, true) & 0x3fff, type: 'image/webp' };
    } else if (chunk === 'VP8L' && bytes[20] === 0x2f) {
      const bits = data.getUint32(21, true);
      header = { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff), type: 'image/webp' };
    }
  }
  if (!header || !header.width || !header.height) throw new UserError('Choose a valid PNG, JPEG, or WebP image. SVG and other formats are not accepted.');
  return header;
}

export async function checkedImage(file: File, purpose: 'logo' | 'scan'): Promise<ImageHeader> {
  const maxBytes = (purpose === 'logo' ? 5 : 10) * 1024 * 1024;
  if (file.size > maxBytes) throw new UserError(`Choose an image no larger than ${purpose === 'logo' ? 5 : 10} MiB.`);
  // JPEG metadata can precede dimensions, so inspect the bounded source before allocating a bitmap.
  const header = readImageHeader(new Uint8Array(await file.arrayBuffer()));
  if (header.width * header.height > (purpose === 'logo' ? 16 : 24) * 1_000_000) throw new UserError(`This image exceeds the ${purpose === 'logo' ? 16 : 24}-megapixel limit. Resize or crop it first.`);
  return header;
}

export async function loadLocalImage(blob: Blob, signal?: AbortSignal): Promise<HTMLImageElement> {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      const abort = () => { image.src = ''; reject(new DOMException('Cancelled', 'AbortError')); };
      const cleanup = () => signal?.removeEventListener('abort', abort);
      signal?.addEventListener('abort', abort, { once: true });
      image.onload = () => { cleanup(); resolve(image); };
      image.onerror = () => { cleanup(); reject(new UserError('This image is damaged or unsupported. Choose a different image.')); };
      image.src = url;
    });
  } finally { URL.revokeObjectURL(url); }
}

export function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  return canvas;
}

export function canvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new UserError('This browser could not create an image. Try reloading or use another browser.');
  return context;
}

export function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => {
    if (blob) resolve(blob); else reject(new UserError('The image could not be exported. Try a smaller export size.'));
  }, 'image/png'));
}

export async function normalizeLogo(file: File): Promise<Logo> {
  await checkedImage(file, 'logo');
  const image = await loadLocalImage(file);
  if (image.naturalWidth * image.naturalHeight > 16_000_000) throw new UserError('The decoded logo exceeds 16 megapixels. Resize it first.');
  const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = makeCanvas(Math.max(1, Math.round(image.naturalWidth * scale)), Math.max(1, Math.round(image.naturalHeight * scale)));
  try {
    canvasContext(canvas).drawImage(image, 0, 0, canvas.width, canvas.height);
    return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height, name: file.name.slice(0, 100) };
  } finally { canvas.width = canvas.height = 1; }
}

export async function pixelsFromImage(blob: Blob, signal?: AbortSignal): Promise<ImageData> {
  const image = await loadLocalImage(blob, signal);
  if (image.naturalWidth * image.naturalHeight > 24_000_000) throw new UserError('The decoded image exceeds 24 megapixels. Resize or crop it first.');
  const canvas = makeCanvas(image.naturalWidth, image.naturalHeight);
  try {
    const context = canvasContext(canvas);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, canvas.width, canvas.height);
  } finally { canvas.width = canvas.height = 1; }
}
