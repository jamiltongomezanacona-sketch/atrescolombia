import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { ProductActions } from "@/components/product-actions";
import { ProductCard } from "@/components/product-card";
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
    <main className="min-h-screen overflow-x-hidden bg-[#f3f3f3] pb-24 text-stone-950">
      <SiteHeader />

      <section className="mx-auto grid max-w-[1350px] gap-5 px-3 py-5 sm:px-4 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-3 sm:grid-cols-[1fr_116px]">
          <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 shadow-sm">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-1">
            {product.images.slice(1).map((image) => (
              <div key={image} className="relative aspect-square overflow-hidden bg-stone-100 shadow-sm">
                <Image src={image} alt={product.name} fill sizes="116px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="self-start bg-white p-5 shadow-sm lg:sticky lg:top-28">
          <div className="flex flex-wrap gap-2">
            {product.badge ? (
              <span className="bg-black px-2 py-1 text-[11px] font-black text-white">
                {product.badge}
              </span>
            ) : null}
            {discount ? (
              <span className="bg-amber-100 px-2 py-1 text-[11px] font-black text-amber-900">
                -{discount}%
              </span>
            ) : null}
            <span className="bg-emerald-100 px-2 py-1 text-[11px] font-black text-emerald-900">
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

          <div className="mt-5 grid gap-2 bg-[#f3f3f3] p-4 text-sm font-semibold text-stone-700">
            <p className="font-black text-black">Guia rapida</p>
            <p>Disponibilidad: {product.stock} unidades</p>
            <p>Guia de tallas: elige tu talla habitual; fit regular salvo indicacion.</p>
            <p>Compartir: copia el enlace de esta pagina desde tu navegador.</p>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-black uppercase text-stone-500">Detalles</p>
            <ul className="grid gap-2 text-sm font-semibold text-stone-700">
              {product.details.map((detail) => (
                <li key={detail} className="bg-stone-50 px-3 py-2">
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
    <section className="mx-auto max-w-[1350px] px-3 py-6 sm:px-4">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight text-black">{title}</h2>
        <Link href={href} className="text-sm font-black text-black underline-offset-4 hover:underline">
          Ver mas
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={`${title}-${item.slug}`} product={item} />
        ))}
      </div>
    </section>
  );
}
