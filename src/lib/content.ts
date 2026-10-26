export const CONTENT_TYPES = ['url', 'text', 'wifi', 'contact'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];
export interface ContentDraft { type: ContentType; fields: Record<string, string> }
export type Drafts = Record<ContentType, ContentDraft>;
export interface FieldDefinition {
  key: string;
  label: string;
  placeholder?: string;
  input?: 'text' | 'url' | 'email' | 'tel' | 'password' | 'textarea';
  required?: boolean;
}
export type ContentResult =
  | { ok: true; payload: string; bytes: number }
  | { ok: false; errors: Record<string, string> };

export const MAX_INPUT_BYTES = 16 * 1024;
export const byteLength = (text: string) => new TextEncoder().encode(text).length;

export const contentInfo: Record<ContentType, { label: string; description: string; fields: FieldDefinition[] }> = {
  url: {
    label: 'Website', description: 'Send someone straight to a website, menu, or document.',
    fields: [{ key: 'url', label: 'Website URL', placeholder: 'https://example.com', input: 'url', required: true }],
  },
  text: {
    label: 'Text', description: 'Share a message, instructions, or something worth keeping.',
    fields: [{ key: 'text', label: 'Your text', placeholder: 'What would you like to share?', input: 'textarea', required: true }],
  },
  wifi: {
    label: 'Wi-Fi', description: 'Make connecting to your network a little easier.',
    fields: [
      { key: 'ssid', label: 'Network name (SSID)', placeholder: 'Your network name', required: true },
      { key: 'password', label: 'Network password', input: 'password' },
    ],
  },
  contact: {
    label: 'Contact', description: 'Put the details that matter on a business card.',
    fields: [
      { key: 'name', label: 'Display name', placeholder: 'Alex Morgan', required: true },
      { key: 'firstName', label: 'First name' }, { key: 'lastName', label: 'Last name' },
      { key: 'organization', label: 'Organization' }, { key: 'title', label: 'Job title' },
      { key: 'phone', label: 'Phone number', placeholder: '+4712345678', input: 'tel' },
      { key: 'email', label: 'Email address', placeholder: 'alex@example.com', input: 'email' },
      { key: 'website', label: 'Website', placeholder: 'https://example.com', input: 'url' },
      { key: 'address', label: 'Address', input: 'textarea' },
      { key: 'note', label: 'Note', input: 'textarea' },
    ],
  },
};

export function emptyDraft(type: ContentType): ContentDraft {
  return {
    type,
    fields: Object.fromEntries([
      ...contentInfo[type].fields.map(({ key }) => [key, '']),
      ...(type === 'wifi' ? [['security', 'WPA'], ['hidden', 'false']] : []),
    ]),
  };
}

export function emptyDrafts(): Drafts {
  return Object.fromEntries(CONTENT_TYPES.map((type) => [type, emptyDraft(type)])) as Drafts;
}

export function isDraftEmpty(draft: ContentDraft): boolean {
  return contentInfo[draft.type].fields.every(({ key }) => !draft.fields[key]);
}

export function urlError(value: string): string | undefined {
  if (!value) return 'Enter a complete website URL.';
  if (/[\u0000-\u0020\u007f]/u.test(value)) return 'Remove spaces/control characters or encode them in the URL.';
  if (!/^https?:\/\//i.test(value)) return 'Use a complete URL beginning with https:// or http://.';
  try {
    const url = new URL(value);
    if (!url.hostname || url.username || url.password || value.includes('\\')) {
      return 'Use a URL with a hostname and no embedded username, password, or backslash.';
    }
  } catch { return 'Enter a valid website URL.'; }
}

export function normalizePhone(value: string): string | undefined {
  const normalized = value.replace(/[ ().-]/g, '');
  return /^\+[1-9]\d{6,14}$/.test(normalized) ? normalized : undefined;
}

export function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

export function escapeVCard(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

// RFC content-line folding: never split a UTF-8 sequence; continuation space counts toward 75 octets.
export function foldContentLine(value: string): string {
  const lines: string[] = [];
  let line = '';
  let bytes = 0;
  for (const character of value) {
    const width = byteLength(character);
    if (bytes + width > 75) { lines.push(line); line = ' '; bytes = 1; }
    line += character;
    bytes += width;
  }
  lines.push(line);
  return lines.join('\r\n');
}

export function serializeContent(draft: ContentDraft): ContentResult {
  const fields = draft.fields;
  const errors: Record<string, string> = {};
  const get = (key: string) => fields[key] ?? '';
  let payload = '';

  if (Object.values(fields).some((value) => byteLength(value) > MAX_INPUT_BYTES)
    || Object.values(fields).reduce((total, value) => total + byteLength(value), 0) > MAX_INPUT_BYTES) {
    return { ok: false, errors: { _form: 'Content exceeds the 16 KiB input limit. Shorten it before generating.' } };
  }

  if (draft.type === 'url') {
    const issue = urlError(get('url'));
    if (issue) errors.url = issue;
    payload = get('url');
  } else if (draft.type === 'text') {
    if (!get('text')) errors.text = 'Enter the text you want to share.';
    payload = get('text');
  } else if (draft.type === 'wifi') {
    const ssid = get('ssid');
    const password = get('password');
    const security = get('security');
    if (!ssid || byteLength(ssid) > 32 || /[\u0000-\u001f\u007f]/u.test(ssid)) errors.ssid = 'Use a network name of 1–32 UTF-8 bytes without control characters.';
    if (!['WPA', 'WEP', 'nopass'].includes(security)) errors.security = 'Choose a supported network security type.';
    if (security === 'WPA' && !((/^[\x20-\x7e]{8,63}$/).test(password) || (/^[\da-f]{64}$/i).test(password))) {
      errors.password = 'Use 8–63 printable ASCII characters, or a 64-digit hexadecimal WPA key.';
    }
    if (security === 'WEP' && !((/^(?:[\x20-\x7e]{5}|[\x20-\x7e]{13})$/).test(password) || (/^(?:[\da-f]{10}|[\da-f]{26})$/i).test(password))) {
      errors.password = 'Use a 5/13-character ASCII WEP key, or a 10/26-digit hexadecimal key.';
    }
    if (!['true', 'false'].includes(get('hidden'))) errors.hidden = 'Choose whether the network is hidden.';
    payload = `WIFI:T:${security};S:${escapeWifi(ssid)};${security === 'nopass' ? '' : `P:${escapeWifi(password)};`}H:${get('hidden')};;`;
  } else {
    if (!get('name').trim()) errors.name = 'Enter a display name for this contact.';
    if (get('phone') && !normalizePhone(get('phone'))) errors.phone = 'Use an international number with a country code, such as +4712345678.';
    if (get('email') && !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/u.test(get('email'))) errors.email = 'Enter one valid email address.';
    if (get('website')) {
      const issue = urlError(get('website'));
      if (issue) errors.website = issue;
    }
    // Every value is escaped before joining properties, including embedded CR/LF in names.
    const v = (key: string) => escapeVCard(get(key));
    const name = `N:${v('lastName') || (!get('firstName') ? v('name') : '')};${v('firstName')};;;`;
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', name, `FN:${v('name')}`];
    const optional: [string, string][] = [
      ['ORG', v('organization')], ['TITLE', v('title')],
      ['TEL', normalizePhone(get('phone')) ?? ''], ['EMAIL', v('email')],
      ['URL', v('website')], ['NOTE', v('note')],
    ];
    for (const [key, value] of optional) if (value) lines.push(`${key}:${value}`);
    if (get('address')) lines.push(`ADR:;;${v('address')};;;;`);
    lines.push('END:VCARD');
    payload = lines.map(foldContentLine).join('\r\n') + '\r\n';
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  if (byteLength(payload) > MAX_INPUT_BYTES) return { ok: false, errors: { _form: 'The serialized content exceeds the 16 KiB input limit.' } };
  return { ok: true, payload, bytes: byteLength(payload) };
}
