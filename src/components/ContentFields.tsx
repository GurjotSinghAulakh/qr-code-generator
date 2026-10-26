import { useState } from 'react';
import { contentInfo, isDraftEmpty, type ContentDraft } from '../lib/content';
import { Icon } from './Icon';
import { Select } from './Select';

interface Props { draft: ContentDraft; errors: Record<string, string>; onChange: (key: string, value: string) => void }
export function ContentFields({ draft, errors, onChange }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const fields = contentInfo[draft.type].fields;
  const visibleErrors = isDraftEmpty(draft) ? {} : errors;
  const missingScheme = draft.type === 'url' && !!draft.fields.url && !/^[a-z][a-z\d+.-]*:/i.test(draft.fields.url) && !/\s/.test(draft.fields.url);

  return <div className="content-fields">
    {draft.type === 'wifi' ? <div className="notice"><Icon name="lock" size={18} /><p>The QR image contains your network password. Share it only with people you want to connect.</p></div> : null}
    <div className={draft.type === 'contact' ? 'field-grid' : 'field-stack'}>
      {fields.filter((field) => !(draft.type === 'wifi' && field.key === 'password' && draft.fields.security === 'nopass')).map((field) => {
        const id = `field-${draft.type}-${field.key}`;
        const error = visibleErrors[field.key];
        const props = {
          id, value: draft.fields[field.key] ?? '', required: field.required,
          placeholder: field.placeholder, autoComplete: 'off', spellCheck: false,
          'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : undefined,
          onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field.key, event.target.value),
        };
        return <div className={`field ${field.input === 'textarea' || field.key === 'name' ? 'full-width' : ''}`} key={field.key}>
          <label htmlFor={id}>{field.label}{field.required ? <span className="required-label">Required</span> : null}</label>
          {field.input === 'textarea' ? <textarea {...props} rows={draft.type === 'text' ? 6 : 2} /> : <div className="input-wrap">
            {draft.type === 'url' ? <Icon name="url" size={18} /> : null}
            <input {...props} type={field.input === 'password' && showPassword ? 'text' : field.input ?? 'text'} />
          </div>}
          {error ? <p className="field-error" id={`${id}-error`}>{error}</p> : null}
          {field.input === 'password' ? <label className="checkbox-label"><input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />Show password</label> : null}
        </div>;
      })}
    </div>
    {missingScheme ? <button className="text-button" type="button" onClick={() => onChange('url', `https://${draft.fields.url}`)}>Use HTTPS for this URL <Icon name="arrow" size={16} /></button> : null}
    {draft.type === 'url' ? <p className="field-hint">A website, social profile, menu, or document you already host.</p> : null}
    {draft.type === 'wifi' ? <div className="wifi-options">
      <Select id="wifi-security" label="Network security" value={draft.fields.security} error={visibleErrors.security} onValueChange={(value) => onChange('security', value)} options={[
        { value: 'WPA', label: 'WPA / WPA2 Personal' },
        { value: 'WEP', label: 'WEP (legacy)' },
        { value: 'nopass', label: 'Open network (no password)' },
      ]} />
      <label className="checkbox-label"><input type="checkbox" checked={draft.fields.hidden === 'true'} onChange={(event) => onChange('hidden', String(event.target.checked))} />Hidden network</label>
      {visibleErrors.hidden ? <p className="field-error">{visibleErrors.hidden}</p> : null}
    </div> : null}
    {visibleErrors._form ? <p className="field-error" role="alert">{visibleErrors._form}</p> : null}
  </div>;
}
