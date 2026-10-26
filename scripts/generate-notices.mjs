import fs from 'node:fs';
import path from 'node:path';

// Include the full installed production dependency license set, even for CLI-only code not bundled by Vite.
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const sections = ['QR Studio — third-party notices\n\nDependency licenses do not grant a license to the application source.\n'];
for (const [location, metadata] of Object.entries(lock.packages).sort(([a], [b]) => a.localeCompare(b))) {
  if (!location || metadata.dev || !location.includes('node_modules/')) continue;
  const manifestPath = path.join(location, 'package.json');
  if (!fs.existsSync(manifestPath)) {
    if (metadata.optional) continue;
    throw new Error(`Install dependencies before building: ${location}`);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const licenses = fs.readdirSync(location).filter((file) => /^(?:licen[cs]e(?:[.-].*)?|notice(?:\..*)?)$/i.test(file) && fs.statSync(path.join(location, file)).isFile());
  if (!licenses.length) throw new Error(`Missing dependency license: ${manifest.name}`);
  sections.push(`\n${'='.repeat(72)}\n${manifest.name} ${manifest.version} — ${manifest.license ?? metadata.license ?? 'see license'}\n${licenses.map((file) => fs.readFileSync(path.join(location, file), 'utf8')).join('\n')}`);
}
fs.writeFileSync('public/third-party-notices.txt', sections.join('\n'));
