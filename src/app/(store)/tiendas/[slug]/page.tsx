import { notFound, redirect } from "next/navigation";
import { getPublicShopBySlug } from "@/lib/public-store";

export const dynamic = "force-dynamic";

type ShopProductsPageProps = {
  params?: Promise<{ slug: string }>;
};

export default async function ShopCatalogRedirectPage({ params }: ShopProductsPageProps) {
  const { slug } = (await params) ?? { slug: "" };
  if (!slug) notFound();

  const shop = await getPublicShopBySlug(slug);
  if (!shop) notFound();

  redirect(`/productos?tienda=${encodeURIComponent(shop.slug)}`);
}
