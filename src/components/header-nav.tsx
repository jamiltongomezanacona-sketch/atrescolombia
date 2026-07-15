"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
};

type HeaderNavProps = {
  categories: Array<{ slug: string; shortName: string }>;
};

export function HeaderNav({ categories }: HeaderNavProps) {
  const pathname = usePathname();
  const links: NavItem[] = [
    { href: "/productos", label: "Todo" },
    { href: "/categorias", label: "Categorias" },
    { href: "/novedades", label: "Novedades" },
    { href: "/ofertas", label: "Ofertas" },
    ...categories.map((category) => ({
      href: `/categoria/${category.slug}`,
      label: category.shortName,
    })),
  ];

  return (
    <nav className="border-t border-white/10 bg-white/[0.03]" aria-label="Categorias">
      <div className="store-container flex gap-1.5 overflow-x-auto py-2 text-sm font-bold [scrollbar-width:none]">
        {links.map((link) => {
          const active =
            link.href === "/productos"
              ? pathname === "/productos"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
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
