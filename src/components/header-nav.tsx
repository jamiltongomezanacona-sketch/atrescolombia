"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/store-navigation";
import { cn } from "@/lib/cn";

type HeaderNavProps = {
  items: NavItem[];
};

export function HeaderNav({ items }: HeaderNavProps) {
  const pathname = usePathname();
  const links: NavItem[] = [{ key: "todo", label: "Todo", href: "/productos", kind: "category" }, ...items];

  return (
    <nav className="border-t border-white/10 bg-white/[0.03]" aria-label="Categorias ATRES">
      <div className="catalog-container flex gap-1.5 overflow-x-auto py-2 text-sm font-bold [scrollbar-width:none]">
        {links.map((link) => {
          const active =
            link.href === "/productos"
              ? pathname === "/productos"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.key}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3 py-2 transition",
                active ? "bg-white text-black" : "text-white/90 hover:bg-white/10 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
