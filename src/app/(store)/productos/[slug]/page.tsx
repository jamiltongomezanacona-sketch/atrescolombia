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
  const recentlyViewed = publicProducts.filter((item) => item.slug !== product.slug).slice(0, 4);
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
        <section className="store-container grid gap-4 py-3 md:gap-6 md:py-4 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:gap-8">
          <ProductGallery productName={product.name} images={product.images} />

          <GlassPanel className="self-start p-4 sm:p-5 lg:sticky lg:top-28 lg:p-6">
            <div className="flex flex-wrap gap-1.5">
              {commercialBadge ? (
                <Badge tone="black" className={getToneClass(commercialTone)}>
                  {commercialBadge}
                </Badge>
              ) : null}
              {discount ? <Badge tone="brand">-{discount}%</Badge> : null}
              <Badge tone={inStock ? "metal" : "soft"}>{inStock ? "Disponible" : "Agotado"}</Badge>
            </div>

            <p className="mt-4 text-[11px] font-medium tracking-wide text-ink-muted">
              <Link href={`/categoria/${product.categorySlug}`} className="transition hover:text-brand">
                {product.categoryName}
              </Link>
              {product.collection ? ` / ${product.collection}` : ""}
            </p>

            <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              {product.name}
            </h1>

            <ProductPrice
              price={product.price}
              previousPrice={product.previousPrice}
              size="lg"
              className="mt-4 flex items-end gap-3"
            />

            <p className="mt-5 text-sm font-normal leading-7 text-ink-muted sm:text-base sm:leading-7">
              {product.description}
            </p>
            <p className="mt-2 text-sm font-medium text-brand">{commercialLine}</p>

            {sizes.length > 0 ? (
              <p className="mt-3 text-sm font-normal text-ink-muted">
                Tallas disponibles: {product.sizes.join(" · ")}
              </p>
            ) : null}

            <ProductActions product={product} whatsapp={resolveStoreWhatsapp(settings?.whatsapp)} />

            <div className="mt-6 border-t border-black/[0.06] pt-5 text-sm font-normal text-ink-muted">
              <p className="text-[11px] font-medium tracking-wide text-ink">Guia rapida</p>
              <div className="mt-2.5 grid gap-1.5">
                <p>Disponibilidad: {product.stock} unidades</p>
                {settings?.shippingText ? (
                  <p>{settings.shippingText}</p>
                ) : (
                  <p>Guia de tallas: elige tu talla habitual; fit regular salvo indicacion.</p>
                )}
                {settings?.promoMessage ? <p className="font-medium text-brand">{settings.promoMessage}</p> : null}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2.5 text-[11px] font-medium tracking-wide text-ink-muted">Detalles</p>
              <ul className="grid gap-1.5 text-sm font-normal text-ink-muted">
                {visibleDetails.map((detail) => (
                  <li key={detail} className="border-b border-black/[0.05] py-2 last:border-b-0">
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
