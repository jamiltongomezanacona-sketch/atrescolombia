import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { ProductActions } from "@/components/product-actions";
import { ProductCard } from "@/components/product-card";
import { SafeProductImage } from "@/components/safe-product-image";
import { SiteHeader } from "@/components/site-header";
import {
  formatCOP,
  getDiscountPercent,
  type Product,
  products,
} from "@/lib/store-data";
import { getPublicProduct, getPublicProducts, getPublicRelatedProducts } from "@/lib/public-store";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

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

  const related = await getPublicRelatedProducts(product);
  const discount = getDiscountPercent(product);
  const publicProducts = await getPublicProducts();
  const recentlyViewed = publicProducts.filter((item) => item.slug !== product.slug).slice(0, 4);

  return (
    <main className="store-surface min-h-screen overflow-x-hidden pb-24 text-stone-950">
      <SiteHeader />

      <section className="mx-auto grid max-w-[1350px] gap-5 px-3 py-6 sm:px-4 md:py-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-3 sm:grid-cols-[1fr_116px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-stone-100 shadow-[0_24px_70px_rgba(18,18,18,0.10)] ring-1 ring-white/60">
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
              <div key={image} className="relative aspect-square overflow-hidden rounded-lg bg-stone-100 shadow-[0_12px_32px_rgba(18,18,18,0.08)] ring-1 ring-white/60">
                <SafeProductImage src={image} alt={product.name} sizes="116px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-surface self-start rounded-lg p-5 ring-1 ring-white/65 lg:sticky lg:top-28">
          <div className="flex flex-wrap gap-2">
            {product.badge ? (
              <span className="rounded-full bg-black/86 px-2.5 py-1 text-[11px] font-black text-white">
                {product.badge}
              </span>
            ) : null}
            {discount ? (
              <span className="rounded-full bg-amber-100/86 px-2.5 py-1 text-[11px] font-black text-amber-900">
                -{discount}%
              </span>
            ) : null}
            <span className="rounded-full bg-emerald-100/86 px-2.5 py-1 text-[11px] font-black text-emerald-900">
              Disponible
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-2 text-sm font-bold text-stone-500">
            {product.categoryName} / {product.collection}
          </p>

          <div className="mt-5 flex items-end gap-3">
            <p className="text-3xl font-black text-orange-600">{formatCOP(product.price)}</p>
            {product.previousPrice ? (
              <p className="pb-1 text-sm font-bold text-stone-400 line-through">
                {formatCOP(product.previousPrice)}
              </p>
            ) : null}
          </div>

          <p className="mt-5 text-base font-semibold leading-7 text-stone-700">
            {product.description}
          </p>

          <ProductActions product={product} />

          <div className="mt-5 grid gap-2 rounded-lg bg-white/55 p-4 text-sm font-semibold text-stone-700 ring-1 ring-black/5 backdrop-blur">
            <p className="font-black text-black">Guia rapida</p>
            <p>Disponibilidad: {product.stock} unidades</p>
            <p>Guia de tallas: elige tu talla habitual; fit regular salvo indicacion.</p>
            <p>Compartir: copia el enlace de esta pagina desde tu navegador.</p>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-black uppercase text-stone-500">Detalles</p>
            <ul className="grid gap-2 text-sm font-semibold text-stone-700">
              {product.details.map((detail) => (
                <li key={detail} className="rounded-lg bg-white/58 px-3 py-2 ring-1 ring-black/5">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ProductRail title="Productos similares" href={`/categoria/${product.categorySlug}`} products={related} />
      <ProductRail title="Vistos recientemente" href="/productos" products={recentlyViewed} />

      <BottomNav />
    </main>
  );
}

function ProductRail({ title, href, products }: { title: string; href: string; products: Product[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1350px] px-3 py-7 sm:px-4 md:py-9">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight text-black">{title}</h2>
        <Link href={href} className="text-sm font-black text-black underline-offset-4 hover:underline">
          Ver mas
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={`${title}-${item.slug}`} product={item} />
        ))}
      </div>
    </section>
  );
}
