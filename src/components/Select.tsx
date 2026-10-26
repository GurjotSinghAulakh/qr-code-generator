import * as SelectPrimitive from '@radix-ui/react-select';
import { useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

export interface SelectOption<Value extends string = string> {
  value: Value;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectProps<Value extends string> {
  id: string;
  label: string;
  value: Value;
  options: readonly SelectOption<Value>[];
  onValueChange: (value: Value) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

/** A labeled, controlled select shared by every dropdown in the workspace. */
export function Select<Value extends string>({
  id, label, value, options, onValueChange, disabled = false, error, className = '',
}: SelectProps<Value>) {
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const [popup, setPopup] = useState<HTMLDivElement | null>(null);
  const restoreBackground = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    if (!popup) return;
    // Radix traps focus and hides the background from assistive technology.
    // Also make that background inert so its controls cannot remain focusable.
    const background: HTMLElement[] = [];
    let branch: HTMLElement = popup;
    while (branch.parentElement) {
      const parent = branch.parentElement;
      for (const sibling of parent.children) {
        if (sibling !== branch && sibling instanceof HTMLElement && !sibling.inert) {
          sibling.inert = true;
          background.push(sibling);
        }
      }
      if (parent === document.body) break;
      branch = parent;
    }
    const restore = () => { for (const element of background) element.inert = false; };
    restoreBackground.current = restore;
    return () => {
      restore();
      if (restoreBackground.current === restore) restoreBackground.current = () => {};
    };
  }, [popup]);

  return (
    <div className={`field select-field ${className}`}>
      <label id={labelId} htmlFor={id}>{label}</label>
      <SelectPrimitive.Root value={value} disabled={disabled} onValueChange={(next) => {
        if (disabled) return;
        const option = options.find((option) => option.value === next && !option.disabled);
        if (option) onValueChange(option.value);
      }}>
        <SelectPrimitive.Trigger
          id={id}
          className="select-trigger"
          aria-labelledby={labelId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        >
          <span className="select-value"><SelectPrimitive.Value /></span>
          <SelectPrimitive.Icon className="select-chevron"><Icon name="chevron" size={16} /></SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content ref={setPopup} className="select-content" position="popper" sideOffset={6} collisionPadding={12} aria-label={label} onCloseAutoFocus={() => restoreBackground.current()}>
            <SelectPrimitive.ScrollUpButton className="select-scroll-button select-scroll-up"><Icon name="chevron" size={14} /></SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="select-viewport">
              {options.map((option, index) => (
                <SelectPrimitive.Item className="select-item" key={option.value} value={option.value} textValue={option.label} disabled={option.disabled} aria-describedby={option.description ? `${id}-option-${index}-description` : undefined}>
                  <div className="select-item-copy">
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    {option.description ? <span className="select-description" id={`${id}-option-${index}-description`}>{option.description}</span> : null}
                  </div>
                  <SelectPrimitive.ItemIndicator className="select-check"><Icon name="check" size={16} /></SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="select-scroll-button"><Icon name="chevron" size={14} /></SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error ? <p className="field-error" id={errorId}>{error}</p> : null}
    </div>
  );
}
