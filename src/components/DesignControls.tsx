import { useRef, useState, type CSSProperties, type Dispatch, type SetStateAction } from 'react';
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
    <p className="section-kicker">02 / PERSONALIZE</p>
    <div className="section-heading"><div className="design-heading"><h2 id="design-title">Make it yours</h2><span className="optional-tag">Optional</span></div><button type="button" className="text-button clear-button" aria-label="Reset design" onClick={reset}><Icon name="reset" size={14} />Reset</button></div>
    <div className="theme-picker"><span className="control-label">Color theme</span><div className="palette-row" aria-label="Color presets">{palettes.map((palette) => <button key={palette.label} type="button" className={`palette ${design.foreground === palette.foreground && design.background === palette.background ? 'selected' : ''}`} style={{ '--swatch-color': palette.foreground } as CSSProperties} aria-label={palette.label} aria-pressed={design.foreground === palette.foreground && design.background === palette.background} onClick={() => onChange({ ...design, foreground: palette.foreground, background: palette.background })}><span>{design.foreground === palette.foreground && design.background === palette.background ? <Icon name="check" size={15} /> : null}</span></button>)}</div></div>
    <details className="custom-colors disclosure"><summary>Custom colors<Icon name="chevron" size={16} /></summary><div className="color-grid">{(['foreground', 'background'] as const).map((key) => <div className="field" key={key}>
      <label htmlFor={`color-${key}`}>{key === 'foreground' ? 'Code color' : 'Background'}</label>
      <div className="color-input"><input type="color" aria-label={`Choose ${key} color`} value={/^#[\da-f]{6}$/i.test(design[key]) ? design[key] : '#000000'} onChange={(event) => onChange({ ...design, [key]: event.target.value })} /><input id={`color-${key}`} value={design[key]} spellCheck={false} maxLength={7} onChange={(event) => onChange({ ...design, [key]: event.target.value })} /></div>
    </div>)}</div></details>
    <div className="logo-upload">
      <div className="logo-copy"><span className="upload-symbol"><Icon name="upload" size={19} /></span><div><strong>{design.logo ? 'Logo added' : 'Add your logo'}</strong><p>{design.logo ? 'Safely placed. Ready to share.' : 'PNG, JPEG or WebP · Up to 5 MiB'}</p></div></div>
      {design.logo ? <button type="button" className="secondary-button compact" onClick={() => { uploadId.current++; setUploadState(''); onChange({ ...design, logo: undefined }); }}>Remove logo</button> : <label className="secondary-button compact upload-label"><Icon name="plus" size={15} />Upload logo<input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void upload(event.target.files?.[0])} /></label>}
    </div>
    {uploadState ? <p className="field-hint" role="status">{uploadState}</p> : null}
    <details className="advanced-settings disclosure"><summary><span><Icon name="sliders" size={16} />Advanced settings</span><Icon name="chevron" size={16} /></summary><div className="color-grid">
      <div className="field"><label htmlFor="correction">Error correction</label><select id="correction" value={design.logo ? 'H' : design.correction} disabled={!!design.logo} onChange={(event) => onChange({ ...design, correction: event.target.value as Correction })}><option value="L">L · Low</option><option value="M">M · Standard</option><option value="Q">Q · High</option><option value="H">H · Highest</option></select></div>
      <div className="field"><label htmlFor="quiet-zone">Quiet zone (modules)</label><input id="quiet-zone" type="number" min="4" max="32" step="1" value={design.quietZone} onChange={(event) => onChange({ ...design, quietZone: event.target.value === '' ? 0 : Number(event.target.value) })} /></div>
    </div><p className="field-hint">Higher correction uses more space. Logos use H. A clear margin of at least four modules is always required.</p></details>
    <a className="text-button mobile-customize-action" href="#preview-title"><Icon name="qr" size={15} />Back to your QR code</a>
  </section>;
}
