"use client";

import Link from "next/link";
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

  return (
    <div className={`relative ${className ?? ""}`}>
      <form
        action={action}
        onSubmit={submitSearch}
        className={
          compact
            ? "flex h-10 w-full items-center overflow-hidden rounded-full bg-white text-black shadow-[0_10px_26px_rgba(0,0,0,0.14)] ring-1 ring-white/35"
            : "flex h-11 w-full items-center overflow-hidden rounded-full bg-white text-black shadow-[0_12px_30px_rgba(0,0,0,0.14)] ring-1 ring-white/40"
        }
        role="search"
      >
        {hiddenInputs.map((input) => (
          <input key={`${input.name}:${input.value}`} type="hidden" name={input.name} value={input.value} />
        ))}
        <span className={compact ? "ml-3 text-stone-500" : "ml-3 grid size-7 shrink-0 place-items-center rounded-full bg-stone-100 text-stone-600"}>
          <SearchIcon />
        </span>
        <input
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={openPanel}
          onBlur={() => window.setTimeout(() => setOpen(false), 140)}
          aria-label="Buscar productos"
          aria-controls={listId}
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          role="combobox"
          className={compact ? "min-w-0 flex-1 bg-transparent px-2 text-sm font-normal outline-none placeholder:text-stone-400" : "min-w-0 flex-1 bg-transparent px-3 text-sm font-normal outline-none placeholder:text-stone-400"}
        />
        <Link
          href="/buscar"
          aria-label="Buscar por imagen"
          title="Buscar por imagen"
          className={compact ? "grid h-10 w-10 shrink-0 place-items-center text-stone-600" : "atres-interactive mr-1 grid size-9 shrink-0 place-items-center rounded-full text-stone-600 hover:bg-stone-100 hover:text-black"}
        >
          <CameraIcon />
        </Link>
        <button
          type="submit"
          aria-label="Buscar"
          className={compact ? "mr-1 inline-flex h-8 w-12 items-center justify-center rounded-full bg-black text-white" : "mr-1 inline-flex h-9 min-w-20 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white transition hover:bg-stone-800"}
        >
          {compact ? <SearchIcon /> : buttonLabel}
        </button>
      </form>

      {open && suggestions.length > 0 ? (
        <div
          id={listId}
          className="absolute inset-x-0 top-[calc(100%+0.45rem)] z-50 overflow-hidden rounded-lg bg-white p-2 text-black shadow-lift ring-1 ring-black/10"
        >
          <div className="mb-1 flex items-center justify-between px-2">
            <p className="text-[11px] font-medium text-stone-500">
              {history.length ? "Historial y sugerencias" : "Sugerencias"}
            </p>
            {history.length ? (
              <button
                type="button"
                className="text-[11px] font-medium text-stone-500 hover:text-black"
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
          <div className="grid gap-1">
            {suggestions.map((item) => (
              <Link
                key={item}
                href={`/buscar?q=${encodeURIComponent(item)}`}
                onMouseDown={() => persistSearch(item)}
                className="flex min-h-9 items-center gap-2 rounded-md px-2 text-sm text-stone-700 hover:bg-stone-100 hover:text-black"
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

function CameraIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 fill-none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </svg>
  );
}
