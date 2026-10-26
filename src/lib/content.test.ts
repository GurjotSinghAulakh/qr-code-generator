import { describe, expect, it } from 'vitest';
import { byteLength, emptyDraft, escapeVCard, foldContentLine, serializeContent, urlError } from './content';

describe('canonical content contracts', () => {
  it('preserves URL paths, query, fragment, and Unicode exactly', () => {
    const draft = emptyDraft('url');
    draft.fields.url = 'https://example.com/Mixed/日本?x=%25&x=2#Part';
    expect(serializeContent(draft)).toEqual({ ok: true, payload: draft.fields.url, bytes: byteLength(draft.fields.url) });
  });

  it.each(['javascript:alert(1)', 'data:text/html,test', 'https://user:secret@example.com', 'https://example.com/a b', ' https://example.com', 'https://example.com/\nInjected', 'https://example.com\\path'])('rejects unsafe or ambiguous URL %s', (value) => {
    expect(urlError(value)).toBeTruthy();
  });

  it('accepts syntactically valid local destinations without contacting them', () => {
    expect(urlError('http://localhost:3000/Test')).toBeUndefined();
    expect(urlError('http://intranet/resource')).toBeUndefined();
  });

  it('preserves significant whitespace and emoji in plain text', () => {
    const draft = emptyDraft('text');
    draft.fields.text = '  Hello 🌍\n日本語\n  ';
    const result = serializeContent(draft);
    expect(result.ok && result.payload).toBe(draft.fields.text);
    expect(result.ok && result.bytes).toBeGreaterThan(draft.fields.text.length);
  });

  it('rejects empty text but preserves intentional space-only text', () => {
    expect(serializeContent(emptyDraft('text')).ok).toBe(false);
    expect(serializeContent({ type: 'text', fields: { text: ' ' } }).ok).toBe(true);
  });

  it('escapes Wi-Fi delimiters without corrupting the original values', () => {
    const draft = emptyDraft('wifi');
    draft.fields = { ssid: 'Café;:"\\,', password: 'key;:"\\,123', security: 'WPA', hidden: 'true' };
    expect(serializeContent(draft)).toEqual({ ok: true, payload: 'WIFI:T:WPA;S:Café\\;\\:\\"\\\\\\,;P:key\\;\\:\\"\\\\\\,123;H:true;;', bytes: byteLength('WIFI:T:WPA;S:Café\\;\\:\\"\\\\\\,;P:key\\;\\:\\"\\\\\\,123;H:true;;') });
  });

  it('does not serialize a stale password for an open network', () => {
    const draft = emptyDraft('wifi');
    draft.fields = { ssid: 'Guest', password: 'not-shared', security: 'nopass', hidden: 'false' };
    const result = serializeContent(draft);
    expect(result.ok && result.payload).toBe('WIFI:T:nopass;S:Guest;H:false;;');
  });

  it('enforces Wi-Fi SSID bytes and credential boundaries', () => {
    const draft = emptyDraft('wifi');
    draft.fields.ssid = '🌍'.repeat(9);
    draft.fields.password = 'short';
    const result = serializeContent(draft);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors)).toEqual(['ssid', 'password']);
    draft.fields.ssid = 'Guest';
    draft.fields.password = 'a'.repeat(64);
    expect(serializeContent(draft).ok).toBe(true);
    draft.fields.password = 'z'.repeat(64);
    expect(serializeContent(draft).ok).toBe(false);
    draft.fields.security = 'WEP';
    draft.fields.password = '12345';
    expect(serializeContent(draft).ok).toBe(true);
  });

  it('creates required vCard properties with safe CRLF and value escaping', () => {
    const draft = emptyDraft('contact');
    draft.fields.name = 'Alex\r\nURL:https://injected.example';
    draft.fields.note = 'Hello; friend,\nsecond line\\end';
    const result = serializeContent(draft);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload).toContain('VERSION:3.0\r\nN:');
    expect(result.payload).toContain('FN:Alex\\nURL:https://injected.example\r\n');
    expect(result.payload).not.toContain('\r\nURL:');
    expect(result.payload).toContain('NOTE:Hello\\; friend\\,\\nsecond line\\\\end\r\n');
    expect(result.payload.endsWith('END:VCARD\r\n')).toBe(true);
  });

  it('folds long Unicode vCard lines without splitting UTF-8 characters', () => {
    const value = `NOTE:${'日本🌍'.repeat(30)}`;
    const folded = foldContentLine(value);
    expect(folded.replace(/\r\n /g, '')).toBe(value);
    expect(folded.split('\r\n').every((line) => byteLength(line) <= 75)).toBe(true);
  });

  it('validates optional contact fields and normalizes phone display punctuation', () => {
    const draft = emptyDraft('contact');
    draft.fields = { ...draft.fields, name: 'Alex', phone: '+47 123 45 678', email: 'alex@example.com', website: 'https://example.com' };
    const valid = serializeContent(draft);
    expect(valid.ok && valid.payload).toContain('TEL:+4712345678\r\n');
    draft.fields.email = 'alex@example.com\r\nBCC:other@example.com';
    expect(serializeContent(draft).ok).toBe(false);
  });

  it('enforces pre-encoding UTF-8 byte limits without truncating', () => {
    const draft = { type: 'text' as const, fields: { text: '🌍'.repeat(4097) } };
    expect(serializeContent(draft).ok).toBe(false);
    expect(draft.fields.text.length).toBe(8194);
    expect(escapeVCard('a\r\nb;c,d\\e')).toBe('a\\nb\\;c\\,d\\\\e');
  });
});
