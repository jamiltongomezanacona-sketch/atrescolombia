import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/product-actions";
import { ProductRail } from "@/components/product-rail";
import { SafeProductImage } from "@/components/safe-product-image";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ProductPrice } from "@/components/ui/product-price";
import { getPublicStoreSettings } from "@/lib/public-settings";
import { products, getDiscountPercent } from "@/lib/store-data";
import { getPublicProduct, getPublicProducts, getPublicRelatedProducts } from "@/lib/public-store";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProduct(slug);

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} | ATRES`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProduct(slug);

  if (!product) {
    notFound();
  }

  const [related, publicProducts, settings] = await Promise.all([
    getPublicRelatedProducts(product),
    getPublicProducts(),
    getPublicStoreSettings(),
  ]);
  const discount = getDiscountPercent(product);
  const recentlyViewed = publicProducts.filter((item) => item.slug !== product.slug).slice(0, 4);
  const inStock = product.stock > 0;
  const sizes = product.sizes.filter((size) => {
    const value = size.trim().toLowerCase();
    return value && value !== "unica" && value !== "única";
  });

  return (
    <main>
      <section className="store-container grid gap-5 py-6 md:py-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-3 sm:grid-cols-[1fr_116px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-muted shadow-soft ring-1 ring-white/60">
            <SafeProductImage
              src={product.images[0]}
              alt={product.name}
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-1">
            {product.images.slice(1).map((image) => (
              <div
                key={image}
                className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted shadow-soft ring-1 ring-white/60"
              >
                <SafeProductImage src={image} alt={product.name} sizes="116px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <GlassPanel className="self-start p-5 lg:sticky lg:top-28">
          <div className="flex flex-wrap gap-2">
            {product.badge ? <Badge>{product.badge}</Badge> : null}
            {discount ? <Badge tone="amber">-{discount}%</Badge> : null}
            <Badge tone={inStock ? "emerald" : "soft"}>
              {inStock ? "Disponible" : "Agotado"}
            </Badge>
          </div>

          <p className="mt-4 text-xs font-black uppercase tracking-wide text-stone-500">
            <Link href={`/categoria/${product.categorySlug}`} className="hover:text-brand">
              {product.categoryName}
            </Link>
            {product.collection ? ` / ${product.collection}` : ""}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-5xl">{product.name}</h1>

          <ProductPrice
            price={product.price}
            previousPrice={product.previousPrice}
            size="lg"
            className="mt-5 flex items-end gap-3"
          />

          <p className="mt-5 text-base font-semibold leading-7 text-stone-700">{product.description}</p>

          {sizes.length > 0 ? (
            <p className="mt-3 text-sm font-semibold text-stone-500">
              Tallas: {product.sizes.join(" · ")}
            </p>
          ) : null}

          <ProductActions product={product} whatsapp={settings?.whatsapp} />

          <div className="mt-5 grid gap-2 rounded-lg bg-white/70 p-4 text-sm font-semibold text-stone-700 ring-1 ring-black/5">
            <p className="font-black text-ink">Guia rapida</p>
            <p>Disponibilidad: {product.stock} unidades</p>
            {settings?.shippingText ? <p>{settings.shippingText}</p> : (
              <p>Guia de tallas: elige tu talla habitual; fit regular salvo indicacion.</p>
            )}
            {settings?.promoMessage ? <p className="text-brand">{settings.promoMessage}</p> : null}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-black uppercase text-stone-500">Detalles</p>
            <ul className="grid gap-2 text-sm font-semibold text-stone-700">
              {product.details.map((detail) => (
                <li key={detail} className="rounded-lg bg-white/70 px-3 py-2 ring-1 ring-black/5">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </GlassPanel>
      </section>

      <ProductRail title="Productos similares" href={`/categoria/${product.categorySlug}`} products={related} />
      <ProductRail title="Vistos recientemente" href="/productos" products={recentlyViewed} />
    </main>
  );
}
