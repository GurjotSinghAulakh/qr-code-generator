import { Icon, type IconName } from './Icon';

const topics: { title: string; icon: IconName; paragraphs: string[] }[] = [
  {
    title: 'Is it really free?', icon: 'spark',
    paragraphs: [
      'Yes. Create and download as many codes as you need, with no account, watermark, or scan limit. PNG and SVG exports are both free.',
      'Your code contains your content directly. There is no redirect service, subscription, or hidden trial between a scan and your destination.',
    ],
  },
  {
    title: 'Will my code expire?', icon: 'qr',
    paragraphs: [
      'Static QR codes have no generator-imposed expiry and work independently of this website. A linked destination can still move, disappear, or require a login.',
      'Editing your content here creates a new image. It cannot change a code you have already printed or shared.',
    ],
  },
  {
    title: 'Does my content leave this device?', icon: 'lock',
    paragraphs: [
      'Your content, logos, and scan images are processed locally. There is no analytics, remote image fetching, or automatic destination check. Drafts stay in memory and are not restored after a reload.',
      'QR codes are readable data, not encryption. A Wi-Fi code contains its password, even when the password field is masked. Share it only with people you want to connect. Downloaded files remain under your control.',
    ],
  },
  {
    title: 'How do I get a code that scans reliably?', icon: 'shield',
    paragraphs: [
      'We independently decode the rendered PNG and SVG before enabling downloads. That checks the encoded bytes; it does not certify a destination as safe or guarantee every camera will read every print.',
      'Keep dark modules on a light background and preserve the clear margin. The tool requires at least 4.5:1 contrast, four clear modules, and four pixels per module. Logos use H correction and must avoid protected patterns; some dense codes cannot safely fit a logo.',
      'For print, SVG scales crisply. Always scan a real sample at its final size, lighting, material, and viewing distance before a large print run.',
    ],
  },
  {
    title: 'Which files and sizes are supported?', icon: 'upload',
    paragraphs: [
      'Download PNG or self-contained SVG at 256–4096 pixels, subject to density checks. Exports have opaque backgrounds. SVG logos and transparent exports are not supported.',
      'Upload PNG, JPEG, or WebP logos up to 5 MiB and 16 megapixels. Scan images can be up to 10 MiB and 24 megapixels. Use still images; animated WebP is not supported.',
      'Input is limited to 16 KiB, but the amount that fits in a QR code is lower and depends on its content and correction level. If a code is too dense, shorten the content or remove optional fields.',
    ],
  },
  {
    title: 'What is included in this beta?', icon: 'info',
    paragraphs: [
      'Create website, text, Wi-Fi, and vCard 3.0 contact codes, or read a QR image. Wi-Fi actions vary by scanner; enterprise and WPA3-only networks are outside this beta.',
      'The production app can generate without the network while the page remains loaded. Offline reload, bulk tools, PDF, saved projects, and camera scanning are still planned.',
      'Physical-device scanning, screen-reader testing, other browser engines, and reference-device performance checks remain release gates. A development beta is not a claim that those checks are complete.',
    ],
  },
];

export function Help() {
  return (
    <section className="help-page" aria-labelledby="help-title">
      <div className="page-intro">
        <p className="eyebrow">GOOD TO KNOW</p>
        <h1 id="help-title">Simple tool. <span>Clear answers.</span></h1>
        <p>A few helpful details before you share.</p>
      </div>
      <div className="help-grid">
        {topics.map(({ title, icon, paragraphs }) => (
          <details className="help-item" key={title}>
            <summary><Icon name={icon} size={19} /><h2>{title}</h2><Icon name="chevron" size={17} /></summary>
            <div className="help-answer">{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
