"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import { useId, useMemo, useState } from "react";

type SearchBoxProps = {
  placeholder?: string;
  compact?: boolean;
  className?: string;
  buttonLabel?: string;
  action?: string;
  initialQuery?: string;
  hiddenInputs?: Array<{ name: string; value: string }>;
};

const HISTORY_KEY = "atres:search-history";
const DEFAULT_SUGGESTIONS = [
  "Vestidos",
  "Jeans",
  "Pijamas",
  "Uniformes",
  "Conjuntos",
  "Ofertas",
  "Novedades",
  "Ropa deportiva",
];

function readHistory() {
  try {
    return JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function persistSearch(value: string) {
  const query = value.trim();
  if (!query) return;
  const next = [query, ...readHistory().filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(0, 6);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function SearchBox({
  placeholder = "Buscar vestidos, jeans, pijamas...",
  compact = false,
  className,
  buttonLabel = "Buscar",
  action = "/buscar",
  initialQuery = "",
  hiddenInputs = [],
}: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const listId = useId();

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const merged = [...history, ...DEFAULT_SUGGESTIONS];
    const unique = Array.from(new Set(merged));
    const filtered = normalized
      ? unique.filter((item) => item.toLowerCase().includes(normalized))
      : unique;
    return filtered.slice(0, compact ? 5 : 8);
  }, [compact, history, query]);

  function openPanel() {
    setHistory(readHistory());
    setOpen(true);
  }

  function submitSearch() {
    persistSearch(query);
  }

  function submitWithEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <form
        action={action}
        onSubmit={submitSearch}
        className={
          compact
            ? "store-search-form flex h-8 w-full items-center overflow-hidden rounded-[var(--radius-card)]"
            : "store-search-form flex h-9 w-full items-center overflow-hidden rounded-[var(--radius-card)]"
        }
        role="search"
      >
        {hiddenInputs.map((input) => (
          <input key={`${input.name}:${input.value}`} type="hidden" name={input.name} value={input.value} />
        ))}
        <input
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={submitWithEnter}
          onFocus={openPanel}
          onBlur={() => window.setTimeout(() => setOpen(false), 140)}
          aria-label="Buscar productos"
          aria-controls={listId}
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          role="combobox"
          className={
            compact
              ? "min-w-0 flex-1 bg-transparent px-3 text-sm font-normal outline-none"
              : "min-w-0 flex-1 bg-transparent px-3.5 text-sm font-normal outline-none"
          }
        />
        <button
          type="submit"
          aria-label={buttonLabel}
          className={
            compact
              ? "store-search-icon mr-1.5 grid size-6 shrink-0 place-items-center rounded-[var(--radius-card)]"
              : "store-search-icon mr-2 grid size-6 shrink-0 place-items-center rounded-[var(--radius-card)]"
          }
        >
          <SearchIcon />
        </button>
      </form>

      {open && suggestions.length > 0 ? (
        <div
          id={listId}
          className="theme-panel absolute inset-x-0 top-[calc(100%+0.45rem)] z-50 overflow-hidden rounded-[var(--radius-card)] p-2 text-ink shadow-lift"
        >
          <div className="mb-1 flex items-center justify-between px-2">
            <p className="text-[11px] font-medium text-ink-muted">
              {history.length ? "Historial y sugerencias" : "Sugerencias"}
            </p>
            {history.length ? (
              <button
                type="button"
                className="text-[11px] font-medium text-ink-muted hover:text-ink"
                onMouseDown={(event) => {
                  event.preventDefault();
                  window.localStorage.removeItem(HISTORY_KEY);
                  setHistory([]);
                }}
              >
                Limpiar
              </button>
            ) : null}
          </div>
          <div className="grid gap-0.5">
            {suggestions.map((item) => (
              <Link
                key={item}
                href={`/buscar?q=${encodeURIComponent(item)}`}
                onMouseDown={() => persistSearch(item)}
                className="flex min-h-10 items-center gap-2 rounded-[var(--radius-card)] px-2 text-sm text-ink-muted hover:bg-surface-muted hover:text-gold-light"
              >
                <SearchIcon />
                <span className="truncate">{item}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 fill-none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21 21-4.3-4.3" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}
