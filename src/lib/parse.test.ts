import { describe, expect, it } from 'vitest';
import { emptyDraft, serializeContent } from './content';
import { parseContent } from './parse';

describe('safe decoder handoff', () => {
  it('recognizes HTTP URLs but preserves unsafe schemes as inert text', () => {
    expect(parseContent('https://example.com/a?x=%25#part')).toEqual({ type: 'url', fields: { url: 'https://example.com/a?x=%25#part' } });
    expect(parseContent('javascript:alert(1)')).toEqual({ type: 'text', fields: { text: 'javascript:alert(1)' } });
    expect(parseContent('<img src=x onerror=alert(1)>').type).toBe('text');
  });
  it('round trips escaped Wi-Fi fields', () => {
    const draft = emptyDraft('wifi');
    draft.fields = { ssid: 'Café;:"\\,', password: 'key;:"\\,123', hidden: 'true', security: 'WPA' };
    const result = serializeContent(draft);
    if (!result.ok) throw new Error('Invalid fixture');
    expect(parseContent(result.payload)).toEqual(draft);
  });
  it('preserves unsupported or malformed Wi-Fi data as raw text', () => {
    for (const text of ['WIFI:T:WPA3;S:Guest;P:password123;;', 'WIFI:T:nopass;S:Guest;S:Other;;', 'WIFI:T:nopass;S:Guest;P:secret;;']) {
      expect(parseContent(text)).toEqual({ type: 'text', fields: { text } });
    }
  });
  it('round trips the supported vCard profile with folded Unicode and escaped delimiters', () => {
    const draft = emptyDraft('contact');
    draft.fields = { ...draft.fields, name: 'Alex 日本 🌍', firstName: 'Alex', lastName: 'Morgan', organization: 'Company; division', address: 'Street 1\nOslo', note: '日本🌍'.repeat(30) + ';,\\\n' };
    const result = serializeContent(draft);
    if (!result.ok) throw new Error('Invalid fixture');
    expect(parseContent(result.payload)).toEqual(draft);
  });
  it('does not silently drop unsupported contact properties or duplicate phones', () => {
    for (const extra of ['PHOTO:https://example.com/photo.jpg', 'TEL:+4712345678\r\nTEL:+4798765432']) {
      const text = `BEGIN:VCARD\r\nVERSION:3.0\r\nN:Morgan;Alex;;;\r\nFN:Alex Morgan\r\n${extra}\r\nEND:VCARD\r\n`;
      expect(parseContent(text)).toEqual({ type: 'text', fields: { text } });
    }
  });
});
