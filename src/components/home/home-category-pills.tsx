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
        eyebrow="Explorar"
        title="Categorias"
        href="/categorias"
        linkLabel="Ver todas"
      />

      <nav
        className="home-scroll-row atres-scroll -mx-0.5 flex gap-2.5 overflow-x-auto px-0.5 pb-1"
        aria-label="Categorias destacadas"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="atres-interactive home-scroll-item group flex w-[4.75rem] shrink-0 flex-col items-center gap-1.5 sm:w-[5.25rem]"
          >
            <span className="grid size-12 place-items-center rounded-full bg-surface text-gold-light ring-1 ring-white/12 transition duration-200 group-hover:bg-gold group-hover:text-black-main group-hover:ring-gold sm:size-14">
              <CategoryPillIcon kind={item.kind} className="size-5 sm:size-6" />
            </span>
            <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight text-ink sm:text-[11px]">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
