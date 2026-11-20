'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

export const CATALOG_SUGGESTION_LIMIT = 20;

function valueAfterDelete(el: HTMLInputElement, key: 'Backspace' | 'Delete'): string | null {
  const value = el.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  if (start == null || end == null) return null;
  if (start !== end) return value.slice(0, start) + value.slice(end);
  if (key === 'Backspace') {
    if (start === 0) return value;
    return value.slice(0, start - 1) + value.slice(end);
  }
  if (end >= value.length) return value;
  return value.slice(0, start) + value.slice(end + 1);
}

export type CatalogSuggestion = {
  key: string;
  label: string;
  hint?: string;
  commitValue: string;
};

/**
 * Same search as the sponsors catalog: the menu follows the draft,
 * and the list changes only when the query is committed.
 */
export function FcCatalogTypeahead({
  draft,
  onDraftChange,
  onCommit,
  suggestions,
  totalCount,
  placeholder,
  ariaLabel,
  leading,
  trailing,
  bare = false,
  inputClassName,
  inputId,
  className,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  onCommit: (value: string) => void;
  suggestions: CatalogSuggestion[];
  totalCount: number;
  placeholder: string;
  ariaLabel: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  bare?: boolean;
  inputClassName?: string;
  inputId?: string;
  className?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const commitRef = useRef<(value: string) => void>(() => {});
  const [open, setOpen] = useState(false);
  const visible = suggestions.slice(0, CATALOG_SUGGESTION_LIMIT);
  const showMenu = open && draft.trim().length > 0 && (visible.length > 0 || totalCount > CATALOG_SUGGESTION_LIMIT);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (!draft.trim()) setOpen(false);
  }, [draft]);

  const commit = (value: string) => {
    onCommit(value);
    setOpen(false);
  };
  commitRef.current = commit;

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onNativeSearch = () => {
      if (!el.value.trim()) commitRef.current('');
    };
    el.addEventListener('search', onNativeSearch);
    return () => el.removeEventListener('search', onNativeSearch);
  }, []);

  const input = (
    <input
      ref={inputRef}
      type="search"
      id={inputId}
      role="combobox"
      className={inputClassName}
      aria-label={ariaLabel}
      aria-autocomplete="list"
      aria-expanded={showMenu}
      aria-controls={listId}
      placeholder={placeholder}
      value={draft}
      onChange={(event) => {
        const next = event.target.value;
        onDraftChange(next);
        // Backspace, Delete, or the native search clear that empties the field
        // reinstates the list the same way the Clear button does.
        if (!next.trim()) {
          commit('');
          return;
        }
        setOpen(true);
      }}
      onFocus={() => {
        if (draft.trim()) setOpen(true);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commit(event.currentTarget.value);
          return;
        }
        if (event.key === 'Escape') {
          setOpen(false);
          return;
        }
        if (
          (event.key !== 'Backspace' && event.key !== 'Delete')
          || event.metaKey
          || event.ctrlKey
          || event.altKey
        ) {
          return;
        }
        const next = valueAfterDelete(event.currentTarget, event.key);
        if (next != null && event.currentTarget.value.trim() && !next.trim()) {
          event.preventDefault();
          commit('');
        }
      }}
    />
  );

  const menu = showMenu ? (
    <ul id={listId} role="listbox" aria-label={ariaLabel}>
      {visible.map((item) => (
        <li key={item.key} role="presentation">
          <button
            type="button"
            role="option"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => commit(item.commitValue)}
          >
            <strong>{item.label}</strong>
            {item.hint ? <span>{item.hint}</span> : null}
          </button>
        </li>
      ))}
      {totalCount > CATALOG_SUGGESTION_LIMIT ? (
        <li role="presentation">
          <button
            type="button"
            className="md-typeahead__more"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => commit(draft)}
          >
            Click Enter for more
          </button>
        </li>
      ) : null}
    </ul>
  ) : null;

  return (
    <div className={className ? `md-typeahead ${className}` : 'md-typeahead'} ref={rootRef}>
      {bare ? (
        <>
          {input}
          {trailing}
        </>
      ) : (
        <label>
          {leading}
          {input}
          {trailing}
        </label>
      )}
      {menu}
    </div>
  );
}
