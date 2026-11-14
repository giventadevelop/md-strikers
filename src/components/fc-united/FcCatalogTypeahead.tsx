'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

export const CATALOG_SUGGESTION_LIMIT = 20;

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
  bare?: boolean;
  inputClassName?: string;
  inputId?: string;
  className?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
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

  const input = (
    <input
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
        onDraftChange(event.target.value);
        setOpen(true);
      }}
      onFocus={() => {
        if (visible.length > 0 || totalCount > CATALOG_SUGGESTION_LIMIT) setOpen(true);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commit(draft);
        } else if (event.key === 'Escape') {
          setOpen(false);
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
      {bare ? input : (
        <label>
          {leading}
          {input}
        </label>
      )}
      {menu}
    </div>
  );
}
