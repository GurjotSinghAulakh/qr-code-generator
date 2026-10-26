import { emptyDraft, serializeContent, urlError, type ContentDraft } from './content';

function splitEscaped(value: string, delimiter: string): string[] {
  const parts: string[] = [];
  let current = '';
  let escaped = false;
  for (const character of value) {
    if (!escaped && character === delimiter) { parts.push(current); current = ''; }
    else current += character;
    if (!escaped && character === '\\') escaped = true; else escaped = false;
  }
  parts.push(current);
  return parts;
}
const unescapeWifi = (value: string) => value.replace(/\\(.)/gs, '$1');
const unescapeVCard = (value: string) => value.replace(/\\([nN\\;,])/g, (_, character: string) => /n/i.test(character) ? '\n' : character);

function parseWifi(text: string): ContentDraft | undefined {
  if (!text.startsWith('WIFI:') || !text.endsWith(';;')) return;
  const values: Record<string, string> = {};
  for (const token of splitEscaped(text.slice(5), ';').filter(Boolean)) {
    const colon = token.indexOf(':');
    const key = token.slice(0, colon);
    if (colon < 0 || !['S', 'T', 'P', 'H'].includes(key) || key in values) return;
    values[key] = unescapeWifi(token.slice(colon + 1));
  }
  if (values.T === 'nopass' && values.P) return;
  const draft: ContentDraft = { type: 'wifi', fields: { ssid: values.S ?? '', password: values.P ?? '', security: values.T ?? 'nopass', hidden: values.H ?? 'false' } };
  return serializeContent(draft).ok ? draft : undefined;
}

function parseContact(text: string): ContentDraft | undefined {
  if (!text.startsWith('BEGIN:VCARD')) return;
  const lines = text.replace(/\r\n[ \t]/g, '').split(/\r\n|\n|\r/).filter(Boolean);
  const values: Record<string, string> = {};
  const allowed = ['BEGIN', 'VERSION', 'N', 'FN', 'ORG', 'TITLE', 'TEL', 'EMAIL', 'URL', 'ADR', 'NOTE', 'END'];
  for (const line of lines) {
    const colon = line.indexOf(':');
    const key = line.slice(0, colon).toUpperCase();
    // Unknown/repeated/parameterized fields fall back to raw text, avoiding silent data loss.
    if (colon < 0 || !allowed.includes(key) || key in values) return;
    values[key] = line.slice(colon + 1);
  }
  if (values.VERSION !== '3.0' || values.BEGIN !== 'VCARD' || values.END !== 'VCARD' || !values.FN || !values.N) return;
  const names = splitEscaped(values.N, ';');
  if (names.slice(2).some(Boolean)) return;
  const addresses = values.ADR ? splitEscaped(values.ADR, ';') : [];
  if (addresses.some((value, index) => index !== 2 && !!value)) return;
  const draft = emptyDraft('contact');
  draft.fields = {
    name: unescapeVCard(values.FN), firstName: unescapeVCard(names[1] ?? ''), lastName: unescapeVCard(names[0] ?? ''),
    organization: unescapeVCard(values.ORG ?? ''), title: unescapeVCard(values.TITLE ?? ''),
    phone: values.TEL ?? '', email: unescapeVCard(values.EMAIL ?? ''), website: unescapeVCard(values.URL ?? ''),
    address: unescapeVCard(addresses[2] ?? ''), note: unescapeVCard(values.NOTE ?? ''),
  };
  return serializeContent(draft).ok ? draft : undefined;
}

export function parseContent(text: string): ContentDraft {
  if (!urlError(text)) return { type: 'url', fields: { url: text } };
  return parseWifi(text) ?? parseContact(text) ?? { type: 'text', fields: { text } };
}
