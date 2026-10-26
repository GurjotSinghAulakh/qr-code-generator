import { useState } from 'react';
import { CONTENT_TYPES, contentInfo, emptyDraft, emptyDrafts, type ContentType } from './lib/content';
import { DEFAULT_DESIGN, type Design } from './lib/qr';
import { useGeneration } from './hooks/useGeneration';
import { ContentFields } from './components/ContentFields';
import { DesignControls } from './components/DesignControls';
import { Preview } from './components/Preview';
import { Help } from './components/Help';
import { Icon } from './components/Icon';

export function App() {
  const [view, setView] = useState<'generate' | 'help'>('generate');
  const [type, setType] = useState<ContentType>('url');
  const [drafts, setDrafts] = useState(emptyDrafts);
  const [design, setDesign] = useState<Design>({ ...DEFAULT_DESIGN });
  const draft = drafts[type];
  const generation = useGeneration(draft, design);
  function updateField(key: string, value: string) {
    setDrafts((previous) => ({ ...previous, [type]: { ...previous[type], fields: { ...previous[type].fields, [key]: value } } }));
  }
  return <>
    <a href="#main" className="skip-link">Skip to main content</a>
    <header className="site-header"><div className="header-inner"><button className="brand" type="button" onClick={() => setView('generate')} aria-label="QR Studio home"><span className="brand-mark"><Icon name="qr" size={23} /></span><span>QR<span className="brand-light">studio</span><span className="beta-tag">BETA</span></span></button><nav aria-label="Main navigation"><button type="button" aria-current={view === 'generate' ? 'page' : undefined} onClick={() => setView('generate')}>Create a code</button><button type="button" aria-current={view === 'help' ? 'page' : undefined} onClick={() => setView('help')}>Help & privacy</button></nav><div className="header-note"><span className="online-dot" />Always free. Always yours.</div></div></header>
    <main id="main" className="main-shell" tabIndex={-1}>
      {view === 'generate' ? <>
        <div className="page-intro"><div><p className="eyebrow"><span />LESS FRICTION. MORE CONNECTION.</p><h1>Share something worth scanning<span>.</span></h1><p>From a favorite link to your Wi-Fi. Make it a QR code, make it yours.</p></div><span className="privacy-pill"><Icon name="shield" size={16} />Private by design</span></div>
        <div className="workspace"><section className="editor-card" aria-labelledby="content-title">
          <div className="content-section"><div className="section-heading"><div className="step-number">01</div><div><h2 id="content-title">What are you sharing?</h2><p>Choose a type, then add your content.</p></div></div>
            <div className="type-selector" role="group" aria-label="QR content type">{CONTENT_TYPES.map((item) => <button type="button" aria-pressed={type === item} className={type === item ? 'active' : ''} key={item} onClick={() => setType(item)}><Icon name={item} size={22} /><span>{contentInfo[item].label}</span></button>)}</div>
            <div className="content-caption"><p>{contentInfo[type].description}</p><button type="button" className="text-button small" onClick={() => setDrafts((previous) => ({ ...previous, [type]: emptyDraft(type) }))}>Clear content</button></div>
            <ContentFields key={type} draft={draft} errors={generation.content.ok ? {} : generation.content.errors} onChange={updateField} />
          </div>
          <DesignControls design={design} onChange={setDesign} />
          <div className="editor-footer"><Icon name="lock" size={15} /><span>No sign-up. No upload to a server. Just your code.</span></div>
        </section><Preview draft={draft} design={design} generation={generation} onDesignChange={setDesign} /></div>
        <div className="benefits"><div><span className="benefit-icon"><Icon name="qr" /></span><div><h3>Your code, for keeps</h3><p>No hidden expiry or scan limits.</p></div></div><div><span className="benefit-icon"><Icon name="shield" /></span><div><h3>A little more private</h3><p>Your content stays on your device.</p></div></div><div><span className="benefit-icon"><Icon name="download" /></span><div><h3>Ready for your next idea</h3><p>Crisp PNG and scalable SVG exports.</p></div></div></div>
      </> : <Help />}
    </main>
    <footer className="site-footer"><span><Icon name="qr" size={15} />Small code. Open possibilities.</span><span>Made to be useful. Free to use.</span></footer>
  </>;
}
