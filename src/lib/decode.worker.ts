import { decodePixels } from './decode';

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<{ id: number; data: Uint8ClampedArray; width: number; height: number }>) => void) | null;
  postMessage: (value: unknown) => void;
};
scope.onmessage = ({ data: { id, data, width, height } }) => {
  try { scope.postMessage({ id, result: decodePixels(data, width, height) }); }
  catch { scope.postMessage({ id, error: true }); }
};
