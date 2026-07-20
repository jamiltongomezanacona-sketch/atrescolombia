"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { NavItem } from "@/lib/store-navigation";
import { isStoreNavActive } from "@/lib/store-navigation";
import { cn } from "@/lib/cn";

type HeaderNavProps = {
  items: NavItem[];
};

export function HeaderNav({ items }: HeaderNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const links: NavItem[] = [{ key: "todo", label: "Todo", href: "/productos", kind: "category" }, ...items];
  const navContext = {
    pathname,
    categoria: searchParams.get("categoria"),
    ofertas: searchParams.get("ofertas"),
    novedades: searchParams.get("novedades"),
    tienda: searchParams.get("tienda"),
  };

  return (
    <nav className="border-t border-white/10 bg-white/[0.03]" aria-label="Categorias ATRES">
      <div className="atres-scroll header-container flex gap-1 overflow-x-auto py-1.5 text-sm font-normal">
        {links.map((link) => {
          const active = isStoreNavActive(link, navContext);

          return (
            <Link
              key={link.key}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "atres-interactive shrink-0 rounded-[var(--radius-card)] px-3 py-1.5 transition",
                active
                  ? "bg-white text-ink"
                  : "text-white/75 hover:bg-white/8 hover:text-white",
              )}
            >
              <span className="text-current">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
