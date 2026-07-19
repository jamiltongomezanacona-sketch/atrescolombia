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
    <nav className="border-t border-white/10 bg-white/[0.04]" aria-label="Categorias ATRES">
      <div className="atres-scroll catalog-container flex gap-1.5 overflow-x-auto py-2 text-sm font-normal">
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
                "atres-interactive shrink-0 rounded-full px-3.5 py-1.5",
                active ? "bg-white text-black shadow-sm" : "text-white/90 hover:bg-white/10 hover:text-white",
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
