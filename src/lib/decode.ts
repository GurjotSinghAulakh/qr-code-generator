import jsQR from 'jsqr';
import { UserError } from './errors';

export interface DecodedQR { text: string; bytes: number[]; version: number }
export function decodePixels(data: Uint8ClampedArray, width: number, height: number, requireSingle = false): DecodedQR | null {
  const result = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' });
  if (!result) return null;
  if (requireSingle) {
    const corners = [result.location.topLeftCorner, result.location.topRightCorner, result.location.bottomLeftCorner, result.location.bottomRightCorner];
    const left = Math.max(0, Math.floor(Math.min(...corners.map((point) => point.x))));
    const right = Math.min(width, Math.ceil(Math.max(...corners.map((point) => point.x))));
    const top = Math.max(0, Math.floor(Math.min(...corners.map((point) => point.y))));
    const bottom = Math.min(height, Math.ceil(Math.max(...corners.map((point) => point.y))));
    // Hide the first symbol and look for another; never silently choose one of two separate codes.
    for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
      const index = (y * width + x) * 4;
      data[index] = data[index + 1] = data[index + 2] = data[index + 3] = 255;
    }
    if (jsQR(data, width, height, { inversionAttempts: 'attemptBoth' })) throw new UserError('More than one QR code was detected. Crop to one code and try again.');
  }
  return { text: result.data, bytes: result.binaryData, version: result.version };
}

export function assertDecodedPayload(decoded: DecodedQR | null, expected: string): void {
  const bytes = new TextEncoder().encode(expected);
  if (!decoded || bytes.length !== decoded.bytes.length || bytes.some((value, i) => value !== decoded.bytes[i])) {
    throw new UserError('The rendered code could not be verified. Remove the logo, reset colors, or increase the size, then try again.');
  }
}
