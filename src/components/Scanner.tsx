import { useEffect, useRef, useState } from 'react';
import { contentInfo, type ContentDraft } from '../lib/content';
import { decodeInWorker } from '../lib/decoder-client';
import { checkedImage, pixelsFromImage } from '../lib/images';
import { UserError, userMessage } from '../lib/errors';
import { parseContent } from '../lib/parse';
import { Icon } from './Icon';

export function Scanner({ onLoad }: { onLoad: (draft: ContentDraft) => void }) {
  const [result, setResult] = useState<{ text: string; draft: ContentDraft }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const operation = useRef<AbortController | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => operation.current?.abort(), []);

  async function scan(file?: File) {
    if (!file) return;
    operation.current?.abort();
    const controller = new AbortController();
    operation.current = controller;
    setBusy(true); setResult(undefined); setError(''); setCopyMessage(''); setRevealed(false);
    try {
      await checkedImage(file, 'scan');
      const decoded = await decodeInWorker(await pixelsFromImage(file, controller.signal), controller.signal, true);
      if (!decoded) throw new UserError('No single QR code could be read. Crop to one sharp, complete code with its clear margin and try again.');
      let text: string;
      try { text = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(decoded.bytes)); }
      catch { throw new UserError('This code uses binary data or an unsupported text encoding. This beta supports UTF-8 text QR codes.'); }
      if (!controller.signal.aborted) setResult({ text, draft: parseContent(text) });
    } catch (error) { if (!controller.signal.aborted) setError(userMessage(error)); }
    finally {
      if (!controller.signal.aborted) setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }
  async function copy() {
    if (!result) return;
    try { await navigator.clipboard.writeText(result.text); setCopyMessage('Decoded content copied.'); }
    catch { setCopyMessage('Clipboard unavailable. Reveal, select, and copy the content manually.'); }
  }

  return <section className="scanner-page" aria-labelledby="scan-title" onPaste={(event) => {
    const image = Array.from(event.clipboardData.files).find((file) => file.type.startsWith('image/'));
    if (image) { event.preventDefault(); void scan(image); }
  }}>
    <div className="page-intro">
      <p className="eyebrow">A LITTLE CLARITY BEFORE YOU CONNECT</p>
      <h1 id="scan-title">See what’s <span>inside.</span></h1>
      <p>Read a QR image privately. You decide what happens next.</p>
    </div>
    <div className="scanner-grid">
      <div className={`scan-upload-card ${isDragging ? 'is-dragging' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={(event) => {
          if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault(); setIsDragging(false);
          if (event.dataTransfer.files.length !== 1) {
            operation.current?.abort(); setBusy(false); setResult(undefined);
            setCopyMessage(''); setRevealed(false); setError('Choose one QR image at a time.'); return;
          }
          void scan(event.dataTransfer.files[0]);
        }}>
        <div className="scan-upload-icon"><Icon name="upload" size={30} /></div>
        <h2>{isDragging ? 'Drop it here' : 'Drop in a QR image'}</h2>
        <p>Drag an image here, paste it, or choose a file below. PNG, JPEG or WebP, up to 10 MiB.</p>
        <label className="primary-button upload-label"><Icon name="plus" size={17} />{busy ? 'Choose another image' : 'Choose QR image'}<input ref={fileRef} aria-label="Choose QR image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void scan(event.target.files?.[0])} /></label>
        <p className="field-hint">One complete code per image · Up to 24 megapixels</p>
        <div className="notice"><Icon name="shield" size={17} /><p>Processed on your device. Links open only when you choose.</p></div>
      </div>
      <div className="scan-result-card"><div className="preview-heading"><h2>Decoded content</h2><Icon name="qr" size={19} /></div><div className="scan-result-body">
        <p className="scan-result-status" role="status">{busy ? 'Reading the image on your device…' : result ? `Decoded successfully · ${contentInfo[result.draft.type].label}` : 'Choose an image to see what it contains.'}</p>
        {error ? <p className="error-notice" role="alert">{error}</p> : null}
        {result ? <>
          {result.draft.type !== 'wifi' || revealed ? <textarea aria-label="Decoded QR content" readOnly value={result.text} rows={9} spellCheck={false} /> : <div className="notice"><Icon name="lock" /><div><p>This code contains a network credential.</p><button type="button" className="text-button" onClick={() => setRevealed(true)}>Reveal decoded Wi-Fi content</button></div></div>}
          <div className="scan-actions"><button type="button" className="secondary-button" onClick={() => void copy()}><Icon name="copy" size={17} />Copy content</button><button type="button" className="primary-button" onClick={() => onLoad(result.draft)}>Load into editor<Icon name="arrow" size={17} /></button></div>
          {result.draft.type === 'url' ? <a className="text-button decoded-link" href={result.text} target="_blank" rel="noopener noreferrer">Open the displayed website <Icon name="arrow" size={16} /></a> : null}
          <p className="field-hint">Decoding does not verify that a destination is safe, reachable, or trustworthy. Review the complete content before opening it.</p><p className="field-hint" role="status">{copyMessage}</p>
        </> : <div className="empty-scan"><Icon name="text" size={32} /><p>A little clarity before you connect.</p></div>}
      </div></div></div>
  </section>;
}
