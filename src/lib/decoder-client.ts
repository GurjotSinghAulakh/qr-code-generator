import type { DecodedQR } from './decode';
import { UserError } from './errors';

// One worker per operation keeps stale/aborted decoding from delaying the latest revision.
export async function decodeInWorker(pixels: ImageData, signal?: AbortSignal, requireSingle = false): Promise<DecodedQR | null> {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
  if (typeof Worker === 'undefined') {
    const { decodePixels } = await import('./decode');
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    return decodePixels(pixels.data, pixels.width, pixels.height, requireSingle);
  }
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./decode.worker.ts', import.meta.url), { type: 'module' });
    const timer = setTimeout(() => finish(undefined, new UserError('Scanning took too long. Use a smaller or cropped image.')), 20_000);
    const abort = () => finish(undefined, new DOMException('Cancelled', 'AbortError'));
    function finish(result?: DecodedQR | null, error?: Error) {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      worker.terminate();
      if (error) reject(error); else resolve(result ?? null);
    }
    signal?.addEventListener('abort', abort, { once: true });
    worker.onmessage = ({ data }: MessageEvent<{ result?: DecodedQR | null; error?: string }>) => {
      finish(data.result, data.error ? new UserError(data.error) : undefined);
    };
    worker.onerror = () => finish(undefined, new UserError('The local decoder could not start. Reload and try again.'));
    worker.postMessage({ id: 1, data: pixels.data, width: pixels.width, height: pixels.height, requireSingle }, [pixels.data.buffer]);
  });
}
