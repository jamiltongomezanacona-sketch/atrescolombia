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
    <nav aria-label="Filtros rapidos" className={cn("store-container", className)}>
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
                "inline-flex min-h-9 shrink-0 items-center rounded-[var(--radius-card)] px-3 text-xs font-medium transition sm:min-h-10 sm:px-3.5 sm:text-sm",
                active
                  ? "bg-gold text-black-main"
                  : "bg-surface text-ink-muted ring-1 ring-white/10 hover:bg-surface-muted hover:text-gold-light",
              )}
            >
              <span className="text-current">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
