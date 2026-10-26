import { decodePixels } from './decode';
import { userMessage } from './errors';

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<{ id: number; data: Uint8ClampedArray; width: number; height: number; requireSingle: boolean }>) => void) | null;
  postMessage: (value: unknown) => void;
};
scope.onmessage = ({ data: { id, data, width, height, requireSingle } }) => {
  try { scope.postMessage({ id, result: decodePixels(data, width, height, requireSingle) }); }
  catch (error) { scope.postMessage({ id, error: userMessage(error, 'This image could not be decoded. Try a clearer image.') }); }
};
