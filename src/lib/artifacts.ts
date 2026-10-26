import { createLayout, renderSVG, type Design, type QRLayout } from './qr';
import { decodeInWorker } from './decoder-client';
import { canvasBlob, canvasContext, loadLocalImage, makeCanvas, pixelsFromImage } from './images';
import { UserError } from './errors';

export interface VerifiedArtifacts { layout: QRLayout; svg: Blob; png: Blob; payload: string }

function assertBytes(bytes: number[] | undefined, payload: string) {
  const expected = new TextEncoder().encode(payload);
  if (!bytes || bytes.length !== expected.length || expected.some((value, index) => value !== bytes[index])) {
    throw new UserError('The exported image did not pass its scan check. Remove the logo, reset colors, or increase the size.');
  }
}

export async function createArtifacts(payload: string, design: Design, signal?: AbortSignal): Promise<VerifiedArtifacts> {
  const layout = createLayout(payload, design);
  const svg = new Blob([renderSVG(layout)], { type: 'image/svg+xml' });
  const image = await loadLocalImage(svg, signal);
  const canvas = makeCanvas(design.size, design.size);
  try {
    const context = canvasContext(canvas);
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0);
    const png = await canvasBlob(canvas);
    const svgDecoded = await decodeInWorker(context.getImageData(0, 0, design.size, design.size), signal);
    assertBytes(svgDecoded?.bytes, payload);
    const pngDecoded = await decodeInWorker(await pixelsFromImage(png, signal), signal);
    assertBytes(pngDecoded?.bytes, payload);
    return { layout, svg, png, payload };
  } finally { canvas.width = canvas.height = 1; }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.rel = 'noopener';
  document.body.append(link); link.click(); link.remove();
  // Leave time for browsers that defer reading download URLs until after the click handler.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
