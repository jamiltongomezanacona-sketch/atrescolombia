import { ProductRail } from "@/components/product-rail";
import type { Product } from "@/lib/store-data";

type HomeCategorySectionProps = {
  id: string;
  title: string;
  href: string;
  products: Product[];
  linkLabel?: string;
};

export function HomeCategorySection({
  id,
  title,
  href,
  products,
  linkLabel = "Ver mas",
}: HomeCategorySectionProps) {
  if (!products.length) return null;

  return (
    <div id={id} className="scroll-mt-32 md:scroll-mt-28">
      <ProductRail title={title} href={href} products={products} linkLabel={linkLabel} />
    </div>
  );
}
