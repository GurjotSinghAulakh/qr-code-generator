import jsQR from 'jsqr';
import { UserError } from './errors';

export interface DecodedQR { text: string; bytes: number[]; version: number }
export function decodePixels(data: Uint8ClampedArray, width: number, height: number): DecodedQR | null {
  const result = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' });
  if (!result) return null;
  return { text: result.data, bytes: result.binaryData, version: result.version };
}

export function assertDecodedPayload(decoded: DecodedQR | null, expected: string): void {
  const bytes = new TextEncoder().encode(expected);
  if (!decoded || bytes.length !== decoded.bytes.length || bytes.some((value, i) => value !== decoded.bytes[i])) {
    throw new UserError('The rendered code could not be verified. Remove the logo, reset colors, or increase the size, then try again.');
  }
}
