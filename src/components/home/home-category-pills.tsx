import Link from "next/link";
import { CategoryPillIcon, categoryIconKind } from "@/components/home/home-icons";
import { HomeSectionHeader } from "@/components/home/section-header";
import type { StoreCategory } from "@/lib/store-navigation";

type CategoryPill = {
  label: string;
  href: string;
  kind: string;
};

type HomeCategoryPillsProps = {
  categories: StoreCategory[];
};

export function HomeCategoryPills({ categories }: HomeCategoryPillsProps) {
  if (!categories.length) return null;

  const items: CategoryPill[] = [
    { label: "Todo", href: "/productos", kind: "todo" },
    { label: "Novedades", href: "/novedades", kind: "novedades" },
    { label: "Ofertas", href: "/ofertas", kind: "ofertas" },
    ...categories.map((category) => ({
      label: category.shortName,
      href: `/categoria/${category.slug}`,
      kind: categoryIconKind(category.shortName, category.slug, `/categoria/${category.slug}`),
    })),
  ];

  return (
    <section className="home-section catalog-container" aria-labelledby="home-categories-title">
      <HomeSectionHeader
        id="home-categories-title"
        eyebrow="Categorias"
        title="Explora por estilo"
        href="/categorias"
        linkLabel="Ver todas"
      />

      <nav
        className="home-scroll-row atres-scroll -mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-0.5"
        aria-label="Categorias destacadas"
      >
        {items.map((item, index) => {
          const isPrimary = index === 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`atres-interactive home-scroll-item inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition sm:min-h-11 sm:px-4 sm:text-sm ${
                isPrimary
                  ? "bg-ink text-white shadow-soft ring-1 ring-ink"
                  : "bg-surface text-ink ring-1 ring-black/[0.08] hover:bg-surface-muted hover:shadow-soft"
              }`}
            >
              <CategoryPillIcon kind={item.kind} className="size-4" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
