'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface AdminListSearchComboboxProps<T> {
  items: T[];
  committedValue: string;
  onCommit: (value: string) => void;
  inputId?: string;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  getSearchFields: (item: T) => Array<string | number | null | undefined>;
  getCommitValue: (item: T) => string;
  formatPrimary: (item: T) => string;
  formatSecondary?: (item: T) => string;
  maxSuggestions?: number;
}

export default function AdminListSearchCombobox<T>({
  items,
  committedValue,
  onCommit,
  inputId,
  ariaLabel,
  placeholder,
  className,
  inputClassName,
  getSearchFields,
  getCommitValue,
  formatPrimary,
  formatSecondary,
  maxSuggestions = 8,
}: AdminListSearchComboboxProps<T>) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(committedValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setDraft(committedValue);
  }, [committedValue]);

  const suggestions = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return [];
    return items
      .filter((item) =>
        getSearchFields(item).some((field) => String(field ?? '').toLowerCase().includes(q)),
      )
      .slice(0, maxSuggestions);
  }, [draft, getSearchFields, items, maxSuggestions]);

  useEffect(() => {
    setActiveIndex(0);
  }, [draft]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const commitText = (value: string) => {
    setDraft(value);
    onCommit(value);
  };

  const selectItem = (item: T) => {
    commitText(getCommitValue(item));
    setOpen(false);
  };

  const clear = () => {
    commitText('');
    setOpen(false);
  };

  return (
    <div className={className?.includes('relative') ? className : `relative ${className ?? ''}`} ref={rootRef}>
      <div className="relative">
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && suggestions[activeIndex] != null ? `${listboxId}-opt-${activeIndex}` : undefined
        }
        placeholder={placeholder}
        value={draft}
        autoComplete="off"
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          onCommit(next);
          setOpen(true);
        }}
        onFocus={() => {
          if (draft.trim()) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!open) setOpen(true);
            setActiveIndex((i) => (suggestions.length === 0 ? 0 : (i + 1) % suggestions.length));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) =>
              suggestions.length === 0 ? 0 : (i - 1 + suggestions.length) % suggestions.length,
            );
          } else if (e.key === 'Enter') {
            if (open && suggestions[activeIndex] != null) {
              e.preventDefault();
              selectItem(suggestions[activeIndex]);
            } else {
              setOpen(false);
            }
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        className={inputClassName}
      />
      {draft.trim() && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg leading-none"
          title="Clear search"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
      </div>
      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg"
        >
          {suggestions.map((item, index) => {
            const secondary = formatSecondary?.(item);
            return (
              <li key={`${listboxId}-opt-${index}`} id={`${listboxId}-opt-${index}`} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectItem(item)}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    index === activeIndex
                      ? 'bg-blue-50 dark:bg-gray-700'
                      : 'hover:bg-blue-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrimary(item)}</span>
                  {secondary ? (
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{secondary}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
