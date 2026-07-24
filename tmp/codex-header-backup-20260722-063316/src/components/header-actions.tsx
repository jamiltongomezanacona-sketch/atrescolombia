"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  quantity: number;
};

type HeaderActionsProps = {
  compact?: boolean;
  minimal?: boolean;
};

function readCount() {
  try {
    const items = JSON.parse(window.localStorage.getItem("atres:cart") ?? "[]") as CartItem[];
    return items.reduce((sum, item) => sum + item.quantity, 0);
  } catch {
    return 0;
  }
}

export function HeaderActions({ compact = false, minimal = false }: HeaderActionsProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function syncCount() {
      queueMicrotask(() => setCount(readCount()));
    }

    syncCount();
    window.addEventListener("atres:cart-changed", syncCount);
    window.addEventListener("storage", syncCount);

    return () => {
      window.removeEventListener("atres:cart-changed", syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, []);

  if (compact) {
    return (
      <nav className="flex items-center justify-end gap-0.5 lg:hidden" aria-label="Acciones rapidas">
        {minimal ? null : <ActionLink href="/promociones" label="Notificaciones" icon="bell" compact />}
        <ActionLink href="/favoritos" label="Favoritos" icon="heart" compact />
        <Link
          href="/carrito"
          aria-label={count > 0 ? `Carrito, ${count} productos` : "Carrito"}
          className="atres-interactive relative inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] text-white/90 hover:bg-white/10 hover:text-white"
        >
          <HeaderIcon type="bag" />
          {count > 0 ? (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-[var(--radius-card)] bg-brand px-1 text-[9px] font-medium text-white">
              {count}
            </span>
          ) : null}
        </Link>
      </nav>
    );
  }

  return (
    <nav className="hidden items-center justify-end gap-1 text-sm font-medium lg:flex" aria-label="Acciones">
      <ActionLink href="/promociones" label="Notificaciones" icon="bell" iconOnly />
      <ActionLink href="/favoritos" label="Favoritos" icon="heart" />
      <Link
        href="/carrito"
        className="atres-interactive relative inline-flex h-10 items-center gap-2 rounded-[var(--radius-card)] px-3 text-white/85 hover:bg-white/10 hover:text-white"
      >
        <HeaderIcon type="bag" />
        Carrito
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-[var(--radius-card)] bg-brand px-1 text-[10px] font-medium text-white">
            {count}
          </span>
        ) : null}
      </Link>
      <button
        type="button"
        aria-label="Perfil"
        title="Perfil"
        className="atres-interactive inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] text-white/85 hover:bg-white/10 hover:text-white"
      >
        <HeaderIcon type="user" />
      </button>
      <Link
        href="/ofertas"
        className="atres-interactive inline-flex h-10 items-center rounded-[var(--radius-card)] bg-white px-3.5 text-ink shadow-sm hover:bg-surface-muted"
      >
        Ofertas
      </Link>
    </nav>
  );
}

function ActionLink({
  href,
  label,
  icon,
  compact = false,
  iconOnly = false,
}: {
  href: string;
  label: string;
  icon: HeaderIconType;
  compact?: boolean;
  iconOnly?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={
        compact
          ? "atres-interactive inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] text-white/90 hover:bg-white/10 hover:text-white"
          : iconOnly
            ? "atres-interactive inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] text-white/85 hover:bg-white/10 hover:text-white"
            : "atres-interactive inline-flex h-10 items-center gap-2 rounded-[var(--radius-card)] px-3 text-white/85 hover:bg-white/10 hover:text-white"
      }
    >
      <HeaderIcon type={icon} />
      {compact || iconOnly ? null : label}
    </Link>
  );
}

type HeaderIconType = "heart" | "bag" | "bell" | "user";

function HeaderIcon({ type }: { type: HeaderIconType }) {
  if (type === "heart") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-[18px] fill-none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    );
  }

  if (type === "bag") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-[18px] fill-none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8h12l-1 13H7L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    );
  }

  if (type === "bell") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-[18px] fill-none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-[18px] fill-none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
