import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { normalizeLogo } from '../lib/images';
import { userMessage } from '../lib/errors';
import { DEFAULT_DESIGN, type Correction, type Design } from '../lib/qr';
import { Icon } from './Icon';

const palettes = [
  { label: 'Classic black', foreground: '#000000', background: '#ffffff' },
  { label: 'Forest green', foreground: '#174d38', background: '#ffffff' },
  { label: 'Midnight blue', foreground: '#18365a', background: '#ffffff' },
  { label: 'Warm plum', foreground: '#542b4a', background: '#fffaf5' },
];
export function DesignControls({ design, onChange }: { design: Design; onChange: Dispatch<SetStateAction<Design>> }) {
  const [uploadState, setUploadState] = useState('');
  const uploadId = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  async function upload(file?: File) {
    if (!file) return;
    const id = ++uploadId.current;
    setUploadState('Preparing logo on your device…');
    try {
      const logo = await normalizeLogo(file);
      if (id === uploadId.current) { onChange((current) => ({ ...current, logo, correction: 'H' })); setUploadState(''); }
    } catch (error) { if (id === uploadId.current) setUploadState(userMessage(error)); }
    if (fileRef.current) fileRef.current.value = '';
  }
  function reset() {
    uploadId.current++;
    setUploadState('');
    onChange({ ...DEFAULT_DESIGN, size: design.size });
  }
  return <section className="design-section" aria-labelledby="design-title">
    <div className="section-heading"><div className="step-number">02</div><div><h2 id="design-title">Make it your own</h2><p>A little personality. The same clear connection.</p></div><button type="button" className="icon-button" aria-label="Reset design" title="Reset design" onClick={reset}><Icon name="reset" size={17} /></button></div>
    <div className="palette-row" aria-label="Color presets">{palettes.map((palette) => <button key={palette.label} type="button" className={`palette ${design.foreground === palette.foreground && design.background === palette.background ? 'selected' : ''}`} style={{ backgroundColor: palette.foreground }} aria-label={palette.label} aria-pressed={design.foreground === palette.foreground && design.background === palette.background} onClick={() => onChange({ ...design, foreground: palette.foreground, background: palette.background })}>{design.foreground === palette.foreground && design.background === palette.background ? <Icon name="check" size={16} /> : null}</button>)}<span className="palette-caption">Start with a color</span></div>
    <div className="color-grid">{(['foreground', 'background'] as const).map((key) => <div className="field" key={key}>
      <label htmlFor={`color-${key}`}>{key === 'foreground' ? 'Code color' : 'Background'}</label>
      <div className="color-input"><input type="color" aria-label={`Choose ${key} color`} value={/^#[\da-f]{6}$/i.test(design[key]) ? design[key] : '#000000'} onChange={(event) => onChange({ ...design, [key]: event.target.value })} /><input id={`color-${key}`} value={design[key]} spellCheck={false} maxLength={7} onChange={(event) => onChange({ ...design, [key]: event.target.value })} /></div>
    </div>)}</div>
    <div className="logo-upload">
      <div className="logo-copy"><span className="upload-symbol"><Icon name="spark" /></span><div><strong>{design.logo ? 'Your logo is added' : 'Add a personal touch'}</strong><p>{design.logo ? 'Protected patterns stay visible.' : 'Optional logo · PNG, JPEG, WebP · up to 5 MiB'}</p></div></div>
      {design.logo ? <button type="button" className="secondary-button compact" onClick={() => { uploadId.current++; setUploadState(''); onChange({ ...design, logo: undefined }); }}>Remove logo</button> : <label className="secondary-button compact upload-label">Upload logo<input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void upload(event.target.files?.[0])} /></label>}
    </div>
    {uploadState ? <p className="field-hint" role="status">{uploadState}</p> : null}
    <details className="advanced-settings"><summary>Advanced settings</summary><div className="color-grid">
      <div className="field"><label htmlFor="correction">Error correction</label><select id="correction" value={design.logo ? 'H' : design.correction} disabled={!!design.logo} onChange={(event) => onChange({ ...design, correction: event.target.value as Correction })}><option value="L">L · Low</option><option value="M">M · Standard</option><option value="Q">Q · High</option><option value="H">H · Highest</option></select></div>
      <div className="field"><label htmlFor="quiet-zone">Quiet zone (modules)</label><input id="quiet-zone" type="number" min="4" max="32" step="1" value={design.quietZone} onChange={(event) => onChange({ ...design, quietZone: event.target.value === '' ? 0 : Number(event.target.value) })} /></div>
    </div><p className="field-hint">Higher correction uses more space. Logos use H. A clear margin of at least four modules is always required.</p></details>
  </section>;
}
