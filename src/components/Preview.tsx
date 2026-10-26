import { useState } from 'react';
import type { ContentDraft } from '../lib/content';
import { downloadBlob } from '../lib/artifacts';
import { sanitizeFilename, type Design } from '../lib/qr';
import { useObjectURL, type Generation } from '../hooks/useGeneration';
import { Icon } from './Icon';
import { Select } from './Select';

interface Props { draft: ContentDraft; design: Design; generation: Generation; onDesignChange: (design: Design) => void }
export function Preview({ draft, design, generation, onDesignChange }: Props) {
  const { content, status, artifacts, error } = generation;
  const imageUrl = useObjectURL(artifacts?.png);
  const [filename, setFilename] = useState('qr-code');
  const [downloadMessage, setDownloadMessage] = useState('');
  const [revealedDraft, setRevealedDraft] = useState<ContentDraft>();
  const showPayload = draft.type !== 'wifi' || revealedDraft === draft;
  const ready = status === 'ready' && !!artifacts;
  const layout = artifacts?.layout;
  function download(format: 'png' | 'svg') {
    if (!ready) return;
    downloadBlob(artifacts[format], `${sanitizeFilename(filename)}.${format}`);
    setDownloadMessage(`${format.toUpperCase()} download started. Scan a sample before printing.`);
  }
  const statusLabel = { empty: 'Add your content to get started', invalid: 'Check your content to continue', checking: 'Checking your code…', ready: 'Scan check passed', error: 'A small adjustment is needed' }[status];

  return <aside className="preview-card" aria-labelledby="preview-title">
    <div className="preview-content">
    <div className="preview-heading"><h2 id="preview-title">Your QR code</h2><span className={`status-badge ${ready ? 'is-ready' : ''}`}>{ready ? <Icon name="check" size={13} /> : <span className={status === 'checking' ? 'status-dot is-checking' : 'status-dot'} />}{ready ? 'Verified' : 'Live preview'}</span></div>
    <div className="preview-stage">
      <div className={`qr-paper ${imageUrl && ready ? 'has-code' : ''}`}>
        {imageUrl && ready ? <img src={imageUrl} width="1024" height="1024" alt="Your generated QR code. Encoded content and scan status are available below." /> : <div className="qr-placeholder" aria-hidden="true"><Icon name={status === 'checking' ? 'qr' : draft.type} size={40} /><strong>{status === 'checking' ? 'Coming together…' : 'A little space for your code'}</strong><span>{status === 'checking' ? 'Making sure every detail scans.' : 'It will appear here as you type.'}</span></div>}
      </div>
    </div>
    <p className={`scan-status ${ready ? 'success-text' : ''}`} role="status" aria-live="polite">{ready ? <Icon name="shield" size={15} /> : <Icon name="info" size={15} />}{statusLabel}</p>
    <div className="preview-details">
      {error ? <div className="error-notice" role="alert">{error}</div> : null}
      <Select id="export-size" label="Export size" className="export-size" value={String(design.size)} onValueChange={(size) => onDesignChange({ ...design, size: Number(size) })} options={[256, 512, 1024, 2048, 4096].map((size) => ({
        value: String(size), label: `${size} × ${size} px`, description: size === 1024 ? 'Recommended' : undefined,
      }))} />
      <div className="download-buttons"><button type="button" className="primary-button" disabled={!ready} onClick={() => download('png')}><Icon name="download" size={18} />Download PNG</button><button type="button" className="secondary-button" disabled={!ready} onClick={() => download('svg')}>SVG<Icon name="download" size={17} /></button></div>
      <p className="download-hint">High quality. No watermark. Always free.</p>
      <p className="sr-only" role="status">{downloadMessage}</p>
      <details className="payload-details disclosure"><summary>File name & encoded details<Icon name="chevron" size={16} /></summary><div className="field"><label htmlFor="filename">File name (without extension)</label><input id="filename" value={filename} maxLength={100} onChange={(event) => setFilename(event.target.value)} /></div>
        <dl className="code-stats"><div><dt>Type</dt><dd>Static QR</dd></div><div><dt>Content</dt><dd>{content.ok && status !== 'empty' ? `${content.bytes} bytes` : '—'}</dd></div><div><dt>Correction</dt><dd>{layout?.matrix.correction ?? (design.logo ? 'H' : design.correction)}</dd></div></dl>
        {layout ? <p className="field-hint">Version {layout.matrix.version} · {layout.matrix.width} × {layout.matrix.width} modules · {layout.cell} px/module · {layout.contrast.toFixed(1)}:1 contrast. QR area includes its quiet zone.</p> : null}
        {content.ok && status !== 'empty' ? <div className="payload-inspector"><strong>Encoded content</strong>{showPayload ? <pre>{content.payload}</pre> : <><p className="field-hint">Hidden because this contains a network credential.</p><button className="text-button" type="button" onClick={() => setRevealedDraft(draft)}>Reveal encoded Wi-Fi content</button></>}</div> : <p className="field-hint">Valid content will appear here.</p>}
      </details>
      <a className="text-button mobile-customize-action" href="#design-title">Customize colors & logo<Icon name="chevron" size={15} /></a>
      <div className="preview-footer"><Icon name="lock" size={14} /><span>Made privately on your device</span></div>
    </div>
    </div>
  </aside>;
}
