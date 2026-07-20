import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { SafeProductImage } from "@/components/safe-product-image";
import { getPublicShops } from "@/lib/public-store";

export const metadata = {
  title: "Tiendas",
  description: "Explora las tiendas de moda ATRES y sus catálogos.",
};

export const dynamic = "force-dynamic";

export default async function ShopsPage() {
  const shops = await getPublicShops();

  return (
    <main>
      <section className="catalog-container py-6 md:py-8">
        <div className="mb-5 md:mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">Multitienda</p>
          <h1 className="mt-1 text-2xl font-medium tracking-tight text-ink md:text-3xl">Tiendas</h1>
          <p className="mt-2 max-w-xl text-sm font-normal text-ink-muted">
            Elige una tienda para ver solo sus productos.
          </p>
        </div>

        {shops.length === 0 ? (
          <EmptyState
            title="Sin tiendas activas"
            description="Pronto veras aqui las tiendas disponibles en ATRES."
            actionHref="/productos"
            actionLabel="Ver catalogo"
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <li key={shop.id}>
                <Link
                  href={`/tiendas/${shop.slug}`}
                  className="atres-interactive group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface ring-1 ring-black/8 transition hover:ring-black/14"
                >
                  <div className="relative aspect-[16/9] bg-surface-muted">
                    <SafeProductImage
                      src={shop.coverUrl || shop.logoUrl || "/icono.png"}
                      alt=""
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <h2 className="text-base font-medium tracking-tight text-ink">{shop.title || shop.name}</h2>
                    {shop.city ? <p className="text-xs font-normal text-ink-muted">{shop.city}</p> : null}
                    {shop.shortDescription ? (
                      <p className="mt-1 line-clamp-2 text-sm font-normal text-ink-muted">{shop.shortDescription}</p>
                    ) : null}
                    <p className="mt-auto pt-3 text-xs font-medium text-ink">
                      {shop.productCount ?? 0} producto{(shop.productCount ?? 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
