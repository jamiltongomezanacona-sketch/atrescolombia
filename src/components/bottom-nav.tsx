"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { label: "Comprar", href: "/productos", icon: "home" as const },
  { label: "Categorias", href: "/categorias", icon: "grid" as const },
  { label: "Buscar", href: "/buscar", icon: "search" as const },
  { label: "Favoritos", href: "/favoritos", icon: "heart" as const },
  { label: "Carrito", href: "/carrito", icon: "bag" as const },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-2.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="Navegacion principal"
    >
      <div className="pointer-events-auto mx-auto grid max-w-[23rem] grid-cols-5 rounded-[var(--radius-card)] border border-black/8 bg-surface/95 px-1 py-1.5 shadow-soft backdrop-blur-xl">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-9 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-card)] px-1 text-[10px] font-medium leading-none transition duration-200 active:scale-95",
                active
                  ? "bg-ink text-white [&_svg]:text-white [&_span]:text-white"
                  : "text-ink-muted hover:bg-surface-muted hover:text-ink",
              )}
            >
              <NavIcon type={item.icon} active={active} />
              <span className="block">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavIcon({ type, active }: { type: "home" | "grid" | "search" | "heart" | "bag"; active: boolean }) {
  const className = cn("size-3.5", active ? "text-white" : "text-current");

  if (type === "home") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    );
  }

  if (type === "grid") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    );
  }

  if (type === "search") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    );
  }

  if (type === "heart") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8h12l-1 13H7L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}
