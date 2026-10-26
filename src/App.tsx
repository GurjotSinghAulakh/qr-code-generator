import { useState } from 'react';
import { CONTENT_TYPES, contentInfo, emptyDraft, emptyDrafts, isDraftEmpty, type ContentDraft, type ContentType } from './lib/content';
import { DEFAULT_DESIGN, type Design } from './lib/qr';
import { useGeneration } from './hooks/useGeneration';
import { ContentFields } from './components/ContentFields';
import { DesignControls } from './components/DesignControls';
import { Preview } from './components/Preview';
import { Help } from './components/Help';
import { Icon } from './components/Icon';
import { Scanner } from './components/Scanner';

export function App() {
  const [view, setView] = useState<'generate' | 'scan' | 'help'>('generate');
  const [type, setType] = useState<ContentType>('url');
  const [drafts, setDrafts] = useState(emptyDrafts);
  const [design, setDesign] = useState<Design>({ ...DEFAULT_DESIGN });
  const draft = drafts[type];
  const generation = useGeneration(draft, design);
  function updateField(key: string, value: string) {
    setDrafts((previous) => ({ ...previous, [type]: { ...previous[type], fields: { ...previous[type].fields, [key]: value } } }));
  }
  function loadDraft(next: ContentDraft) {
    if (!isDraftEmpty(drafts[next.type]) && !window.confirm(`Replace the existing ${contentInfo[next.type].label.toLowerCase()} draft? Its current content will be lost.`)) return;
    setDrafts((previous) => ({ ...previous, [next.type]: next }));
    setType(next.type); setView('generate');
    document.getElementById('main')?.focus();
  }
  return <>
    <a href="#main" className="skip-link">Skip to main content</a>
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" type="button" onClick={() => setView('generate')} aria-label="QR Studio home">
          <span className="brand-mark"><Icon name="qr" size={23} /></span>
          <span>QR<span className="brand-light">studio</span><span className="brand-period">.</span></span>
        </button>
        <nav aria-label="Main navigation">
          <button type="button" aria-current={view === 'generate' ? 'page' : undefined} onClick={() => setView('generate')}><Icon name="qr" size={16} />Create a code</button>
          <button type="button" aria-current={view === 'scan' ? 'page' : undefined} onClick={() => setView('scan')}><Icon name="scan" size={16} />Scan an image</button>
          <button type="button" aria-current={view === 'help' ? 'page' : undefined} onClick={() => setView('help')}>Help & privacy</button>
        </nav>
        <span className="header-note"><span className="online-dot" />Free. No account needed.</span>
      </div>
    </header>
    <main id="main" className="main-shell" tabIndex={-1}>
      {view === 'generate' ? <>
        <div className="page-intro">
          <p className="eyebrow">THE EVERYDAY QR CODE STUDIO</p>
          <h1>Sharing, <span>made simple.</span></h1>
          <p>Your link, a little personality, and one code that connects it all.</p>
        </div>
        <div className="workspace">
          <section className="content-section" aria-labelledby="content-title">
            <p className="section-kicker">01 / CONTENT</p>
            <div className="section-heading">
              <h2 id="content-title">What would you like to share?</h2>
              <button type="button" className="text-button clear-button" aria-label="Clear content" onClick={() => setDrafts((previous) => ({ ...previous, [type]: emptyDraft(type) }))}><Icon name="reset" size={14} />Clear</button>
            </div>
            <div className="type-selector" role="group" aria-label="QR content type">{CONTENT_TYPES.map((item) => <button type="button" aria-pressed={type === item} className={type === item ? 'active' : ''} key={item} onClick={() => setType(item)}><Icon name={item} size={18} /><span>{contentInfo[item].label}</span></button>)}</div>
            <p className="content-description">{contentInfo[type].description}</p>
            <ContentFields key={type} draft={draft} errors={generation.content.ok ? {} : generation.content.errors} onChange={updateField} />
          </section>
          <Preview draft={draft} design={design} generation={generation} onDesignChange={setDesign} />
          <DesignControls design={design} onChange={setDesign} />
        </div>
        <div className="trust-strip" aria-label="Product benefits">
          <span><Icon name="shield" size={17} />Your content stays on your device</span>
          <span><Icon name="check" size={17} />No watermarks or scan limits</span>
          <span><Icon name="qr" size={17} />Static codes. No hidden expiry.</span>
        </div>
      </> : view === 'scan' ? <Scanner onLoad={loadDraft} /> : <Help />}
    </main>
    <footer className="site-footer"><span>Small code. Thoughtful connections.</span><span className="footer-meta">Development beta<span aria-hidden="true">·</span>Always free to create.</span></footer>
  </>;
}
