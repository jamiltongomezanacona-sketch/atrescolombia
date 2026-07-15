import Link from "next/link";
import { HeaderActions } from "@/components/header-actions";
import { getPublicCategories } from "@/lib/public-store";

export async function SiteHeader() {
  const categories = await getPublicCategories();

  return (
    <header className="sticky top-0 z-40 bg-black text-white shadow-sm">
      <div className="mx-auto grid max-w-[1500px] items-center gap-3 px-3 py-3 md:grid-cols-[210px_1fr_260px]">
        <Link href="/" className="text-3xl font-black tracking-[0.18em]">
          ATRES
        </Link>
        <form action="/buscar" className="mx-auto flex h-10 w-full max-w-2xl overflow-hidden bg-white text-black ring-1 ring-white/20">
          <input
            name="q"
            aria-label="Buscar productos"
            placeholder="Buscar vestidos, jeans, pijamas..."
            className="min-w-0 flex-1 px-4 text-sm font-semibold outline-none"
          />
          <button className="w-16 bg-black text-sm font-black text-white ring-2 ring-white" type="submit">
            Buscar
          </button>
        </form>
        <HeaderActions />
      </div>
      <nav className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1500px] gap-7 overflow-x-auto px-3 py-3 text-sm font-bold [scrollbar-width:none]">
          <Link href="/productos" className="shrink-0 text-white/95 hover:text-amber-200">
            Todo
          </Link>
          <Link href="/novedades" className="shrink-0 text-white/95 hover:text-amber-200">
            Novedades
          </Link>
          <Link href="/ofertas" className="shrink-0 text-white/95 hover:text-amber-200">
            Ofertas
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categoria/${category.slug}`}
              className="shrink-0 text-white/95 hover:text-amber-200"
            >
              {category.shortName}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
