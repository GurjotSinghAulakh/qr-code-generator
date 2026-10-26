import { useEffect, useMemo, useState } from 'react';
import { serializeContent, isDraftEmpty, type ContentDraft } from '../lib/content';
import { createArtifacts, type VerifiedArtifacts } from '../lib/artifacts';
import type { Design } from '../lib/qr';
import { userMessage } from '../lib/errors';

interface Result { draft: ContentDraft; design: Design; artifacts?: VerifiedArtifacts; error?: string }

export function useGeneration(draft: ContentDraft, design: Design) {
  const content = useMemo(() => serializeContent(draft), [draft]);
  const [result, setResult] = useState<Result>();
  const empty = isDraftEmpty(draft);
  const matches = result?.draft === draft && result.design === design;
  // Identity checking is synchronous: stale downloads are disabled before effects run.
  const artifacts = matches ? result.artifacts : undefined;
  const error = matches ? result.error : undefined;
  const status = empty ? 'empty' : !content.ok ? 'invalid' : error ? 'error' : artifacts ? 'ready' : 'checking';

  useEffect(() => {
    if (!content.ok || empty) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      createArtifacts(content.payload, design, controller.signal).then((artifacts) => {
        if (!controller.signal.aborted) setResult({ draft, design, artifacts });
      }).catch((error: unknown) => {
        if (!controller.signal.aborted) setResult({ draft, design, error: userMessage(error, 'The code could not be checked. Reset the design or reload and try again.') });
      });
    }, 150);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [draft, design, content, empty]);

  return { content, status, artifacts, error };
}
export type Generation = ReturnType<typeof useGeneration>;

export function useObjectURL(blob?: Blob): string | undefined {
  const [current, setCurrent] = useState<{ blob: Blob; url: string }>();
  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setCurrent({ blob, url });
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  return current?.blob === blob ? current?.url : undefined;
}
