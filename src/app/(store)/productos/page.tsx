import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { TrendShowcase } from "@/components/trend-showcase";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getCategoryVisualTheme } from "@/lib/category-visuals";
import { getPublicCategories, getPublicProducts } from "@/lib/public-store";
import type { Product } from "@/lib/store-data";

export const metadata = {
  title: "Productos | ATRES",
  description: "Catalogo completo de moda ATRES.",
};

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams?: Promise<{ orden?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const order = params?.orden ?? "relevancia";
  const [categories, products] = await Promise.all([getPublicCategories(), getPublicProducts()]);
  const sortedProducts = sortProducts(products, order);
  const trendTheme = getCategoryVisualTheme("urbana", "Urbana");
  const trendProducts = products
    .filter((product) => product.isTrending || product.isNew || product.isPromo)
    .slice(0, 4);

  return (
    <main>
      <section className="border-b border-white/70 bg-white/70">
        <div className="store-container grid gap-2 py-3 text-xs font-black uppercase text-stone-600 sm:grid-cols-3">
          <p>Compra facil y segura</p>
          <p className="sm:text-center">Nuevas colecciones ATRES</p>
          <p className="sm:text-right">Precios directos de temporada</p>
        </div>
      </section>

      <TrendShowcase
        theme={trendTheme}
        products={trendProducts.length ? trendProducts : products.slice(0, 4)}
        compact
      />

      <section className="store-container py-6 md:py-8">
        <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase text-brand">Catalogo ATRES</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-ink md:text-4xl">Todos los productos</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-600">
              Explora prendas, ofertas y novedades de moda ATRES en una experiencia rapida para comprar desde Colombia.
            </p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
            <Link href="/productos" className="shrink-0 rounded-full bg-black px-4 py-2 text-xs font-black text-white">
              Todo
            </Link>
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.slug}
                href={`/categoria/${category.slug}`}
                className="shrink-0 rounded-full bg-white/80 px-4 py-2 text-xs font-black text-stone-800 shadow-sm ring-1 ring-black/5 transition hover:bg-black hover:text-white"
              >
                {category.shortName}
              </Link>
            ))}
          </div>
        </div>

        <GlassPanel className="mb-5 flex flex-wrap items-center justify-between gap-3 px-3 py-3">
          <p className="text-sm font-black text-stone-700">{sortedProducts.length} productos disponibles</p>
          <div className="flex flex-wrap gap-2">
            <OrderLink label="Relevancia" value="relevancia" active={order === "relevancia"} />
            <OrderLink label="Tendencias" value="tendencias" active={order === "tendencias"} />
            <OrderLink label="Nuevos" value="nuevos" active={order === "nuevos"} />
            <OrderLink label="Menor precio" value="precio-menor" active={order === "precio-menor"} />
            <OrderLink label="Mayor descuento" value="descuento" active={order === "descuento"} />
          </div>
        </GlassPanel>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {sortedProducts.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>
    </main>
  );
}

function OrderLink({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <Link
      href={value === "relevancia" ? "/productos" : `/productos?orden=${value}`}
      className={`rounded-full px-3 py-2 text-xs font-black transition ${
        active
          ? "bg-black text-white shadow-sm"
          : "bg-white/70 text-stone-700 ring-1 ring-black/5 hover:bg-white"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

function sortProducts(products: Product[], order: string) {
  const sorted = [...products];

  if (order === "nuevos") {
    return sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
  }

  if (order === "tendencias") {
    return sorted.sort((a, b) => trendScore(b) - trendScore(a));
  }

  if (order === "precio-menor") {
    return sorted.sort((a, b) => a.price - b.price);
  }

  if (order === "descuento") {
    return sorted.sort((a, b) => discountValue(b) - discountValue(a));
  }

  return sorted;
}

function discountValue(product: Product) {
  if (!product.previousPrice || product.previousPrice <= product.price) return 0;
  return product.previousPrice - product.price;
}

function trendScore(product: Product) {
  return Number(product.isTrending) * 3 + Number(product.isNew) * 2 + Number(product.isPromo);
}
