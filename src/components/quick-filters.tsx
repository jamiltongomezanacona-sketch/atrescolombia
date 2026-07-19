"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/store-navigation";
import { cn } from "@/lib/cn";

type QuickFiltersProps = {
  items: NavItem[];
  className?: string;
};

export function QuickFilters({ items, className }: QuickFiltersProps) {
  const pathname = usePathname();
  const filters: NavItem[] = [
    { key: "todos", label: "Todos", href: "/productos", kind: "route" },
    ...items,
  ];

  return (
    <nav
      aria-label="Filtros rapidos"
      className={cn("store-container", className)}
    >
      <div className="flex gap-1.5 overflow-x-auto py-1 [scrollbar-width:none] [-ms-overflow-style:none] sm:gap-2 [&::-webkit-scrollbar]:hidden">
        {filters.map((item) => {
          const active =
            item.href === "/productos"
              ? pathname === "/productos"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center rounded-full px-3 text-xs font-medium transition sm:min-h-11 sm:px-4 sm:text-sm",
                active
                  ? "bg-black text-white shadow-sm"
                  : "bg-white text-stone-800 ring-1 ring-black/5 hover:bg-stone-100",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
