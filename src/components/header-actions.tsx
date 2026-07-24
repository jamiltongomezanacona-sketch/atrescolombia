"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

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
  const pathname = usePathname();

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
      <nav className="flex items-center justify-end gap-0 lg:hidden" aria-label="Acciones rapidas">
        <ActionLink href="/" label="Ir al inicio" icon="home" compact active={pathname === "/"} />
        {minimal ? null : (
          <>
            <ActionLink href="/promociones" label="Notificaciones" icon="bell" compact />
            <ActionLink href="/favoritos" label="Favoritos" icon="heart" compact />
            <Link
              href="/carrito"
              aria-label={count > 0 ? `Carrito, ${count} productos` : "Carrito"}
              className="atres-interactive relative inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-card)] text-white/90 hover:bg-white/10 hover:text-gold-light"
            >
              <HeaderIcon type="bag" />
              {count > 0 ? (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-[var(--radius-card)] bg-brand px-1 text-[9px] font-medium text-black-main">
                  {count}
                </span>
              ) : null}
            </Link>
          </>
        )}
      </nav>
    );
  }

  return (
    <nav className="hidden items-center justify-end gap-1 text-sm font-medium lg:flex" aria-label="Acciones">
      <ActionLink href="/favoritos" label="Favoritos" icon="heart" iconOnly />
      <Link
        href="/carrito"
        aria-label={count > 0 ? `Carrito, ${count} productos` : "Carrito"}
        className="atres-interactive relative inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] text-white/90 hover:bg-white/10 hover:text-gold-light"
      >
        <HeaderIcon type="bag" />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-medium text-black-main">
            {count}
          </span>
        ) : null}
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
  active = false,
}: {
  href: string;
  label: string;
  icon: HeaderIconType;
  compact?: boolean;
  iconOnly?: boolean;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        compact
          ? "atres-interactive inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] text-white/90 hover:bg-white/10 hover:text-gold-light"
          : iconOnly
            ? "atres-interactive inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] text-white/85 hover:bg-white/10 hover:text-gold-light"
            : "atres-interactive inline-flex h-9 items-center gap-2 rounded-[var(--radius-card)] px-2.5 text-white/85 hover:bg-white/10 hover:text-gold-light",
        active ? "bg-white/10 text-gold-light ring-1 ring-white/10" : null,
      )}
    >
      <HeaderIcon type={icon} />
      {compact || iconOnly ? null : label}
    </Link>
  );
}

type HeaderIconType = "home" | "heart" | "bag" | "bell";

function HeaderIcon({ type }: { type: HeaderIconType }) {
  if (type === "home") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5 fill-none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (type === "heart") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-[17px] fill-none"
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
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6.5 8.5h11l-.7 11.2a1.6 1.6 0 0 1-1.6 1.5H8.8a1.6 1.6 0 0 1-1.6-1.5L6.5 8.5Z" />
        <path d="M9.2 8.5V7.2a2.8 2.8 0 0 1 5.6 0v1.3" />
        <path d="M6.5 11.5h11" />
      </svg>
    );
  }

  if (type === "bell") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-[17px] fill-none"
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
  return null;
}
