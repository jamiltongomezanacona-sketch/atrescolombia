import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/product-actions";
import { ProductGallery } from "@/components/product-gallery";
import { ProductRail } from "@/components/product-rail";
import { ProductSelectionProvider } from "@/components/product-selection-context";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ProductPrice } from "@/components/ui/product-price";
import {
  getCommercialBadge,
  getCommercialLine,
  getCommercialTone,
  getToneClass,
  getVisibleProductDetails,
} from "@/lib/product-merchandising";
import { getPublicStoreSettings } from "@/lib/public-settings";
import { products, getDiscountPercent } from "@/lib/store-data";
import { getPublicProduct, getPublicProducts, getPublicRelatedProducts } from "@/lib/public-store";
import { resolveStoreWhatsapp } from "@/lib/whatsapp";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProduct(slug);

  if (!product) {
    return {};
  }

  const productUrl = `/productos/${product.slug}`;
  const productImage = product.images[0] ?? product.image;

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      url: productUrl,
      siteName: "ATRES Colombia",
      images: [
        {
          url: productImage,
          alt: product.name,
        },
      ],
      locale: "es_CO",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [
        {
          url: productImage,
          alt: product.name,
        },
      ],
    },
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
  const recentlyViewed = publicProducts.filter((item) => item.slug !== product.slug).slice(0, 10);
  const inStock = product.stock > 0;
  const commercialBadge = getCommercialBadge(product);
  const commercialTone = getCommercialTone(product);
  const commercialLine = getCommercialLine(product, inStock);
  const visibleDetails = getVisibleProductDetails(product);
  const sizes = product.sizes.filter((size) => {
    const value = size.trim().toLowerCase();
    return value && value !== "unica" && value !== "unico";
  });

  return (
    <main
      data-whatsapp-product-name={product.name}
      data-whatsapp-product-price={new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(product.price)}
      data-whatsapp-product-color={product.colors[0] ?? ""}
      data-whatsapp-product-size={product.sizes[0] ?? ""}
      data-whatsapp-product-image={product.images[0] ?? product.image}
      data-whatsapp-product-reference={product.sku?.trim() || product.id || ""}
    >
      <ProductSelectionProvider
        productName={product.name}
        images={product.images}
        colors={product.colors}
        sizes={product.sizes}
      >
        <section className="catalog-container products-catalog-container grid gap-3 py-2 md:gap-5 md:py-3 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-6">
          <ProductGallery productName={product.name} images={product.images} />

          <GlassPanel className="self-start p-3 sm:p-4 lg:sticky lg:top-28 lg:p-4">
            <div className="flex flex-wrap gap-1">
              {commercialBadge ? (
                <Badge tone="black" className={getToneClass(commercialTone)}>
                  {commercialBadge}
                </Badge>
              ) : null}
              {discount ? <Badge tone="brand">-{discount}%</Badge> : null}
              <Badge tone={inStock ? "metal" : "soft"}>{inStock ? "Disponible" : "Agotado"}</Badge>
            </div>

            <p className="mt-2.5 text-[10px] font-medium tracking-wide text-ink-muted sm:text-[11px]">
              <Link href={`/categoria/${product.categorySlug}`} className="transition hover:text-brand">
                {product.categoryName}
              </Link>
              {product.collection ? ` / ${product.collection}` : ""}
            </p>

            <h1 className="mt-1 text-2xl font-medium tracking-tight text-ink sm:text-3xl lg:text-[2.15rem] lg:leading-[1.12]">
              {product.name}
            </h1>

            <ProductPrice
              price={product.price}
              previousPrice={product.previousPrice}
              size="lg"
              className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0"
            />

            <p className="mt-2.5 text-sm font-normal leading-5 text-ink-muted sm:leading-6">
              {product.description}
            </p>
            <p className="mt-1 text-xs font-medium text-brand sm:text-sm">{commercialLine}</p>

            {sizes.length > 0 ? (
              <p className="mt-1.5 text-xs font-normal text-ink-muted sm:text-sm">
                Tallas: {product.sizes.join(" · ")}
              </p>
            ) : null}

            <ProductActions product={product} whatsapp={resolveStoreWhatsapp(settings?.whatsapp)} />

            <div className="mt-4 border-t border-black/[0.06] pt-3">
              <p className="text-[10px] font-medium tracking-wide text-ink sm:text-[11px]">Guia rapida</p>
              <ul className="mt-1.5 grid gap-1 text-xs font-normal leading-5 text-ink-muted sm:text-sm">
                <li>Disponibilidad: {product.stock} unidades</li>
                {settings?.shippingText ? (
                  <li>{settings.shippingText}</li>
                ) : (
                  <li>Guia de tallas: elige tu talla habitual; fit regular salvo indicacion.</li>
                )}
                {settings?.promoMessage ? (
                  <li className="font-medium text-brand">{settings.promoMessage}</li>
                ) : null}
              </ul>
            </div>

            <div className="mt-3 border-t border-black/[0.06] pt-3">
              <p className="mb-1.5 text-[10px] font-medium tracking-wide text-ink-muted sm:text-[11px]">
                Cualidades
              </p>
              <ul className="grid gap-0 text-xs font-normal text-ink-muted sm:text-sm">
                {visibleDetails.map((detail) => (
                  <li
                    key={detail}
                    className="border-b border-black/[0.04] py-1.5 leading-5 last:border-b-0"
                  >
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </GlassPanel>
        </section>
      </ProductSelectionProvider>

      <ProductRail title="Productos similares" href={`/categoria/${product.categorySlug}`} products={related} />
      <ProductRail title="Vistos recientemente" href="/productos" products={recentlyViewed} />
    </main>
  );
}
