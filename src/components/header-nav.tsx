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
    <nav className="store-header-nav" aria-label="Categorias ATRES">
      <div className="atres-scroll flex w-full items-center justify-center gap-1 overflow-x-auto px-2 py-1 text-xs font-normal sm:px-3 sm:text-sm lg:gap-4 lg:overflow-visible xl:gap-6">
        {links.map((link) => {
          const active = isStoreNavActive(link, navContext);

          return (
            <Link
              key={link.key}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "atres-interactive shrink-0 px-1 py-0.5 leading-none tracking-wide transition",
                active
                  ? "font-medium text-gold-light underline decoration-brand decoration-2 underline-offset-[6px]"
                  : "text-white/72 hover:text-gold-light",
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
