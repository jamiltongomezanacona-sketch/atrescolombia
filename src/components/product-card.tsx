import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { SafeProductImage } from "@/components/safe-product-image";
import { Badge } from "@/components/ui/badge";
import { ProductPrice } from "@/components/ui/product-price";
import { getDiscountPercent, type Product } from "@/lib/store-data";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

function meaningfulSizes(sizes: string[]) {
  return sizes.filter((size) => {
    const value = size.trim().toLowerCase();
    return value && value !== "unica" && value !== "única" && value !== "u";
  });
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const discount = getDiscountPercent(product);
  const previousPrice =
    product.previousPrice && product.previousPrice > product.price ? product.previousPrice : null;
  const sizes = meaningfulSizes(product.sizes).slice(0, 4);
  const inStock = product.stock > 0;
  const visualTag = getVisualTag(product, discount);
  const metaCopy = getMetaCopy(product);
  const sellingLine = getSellingLine(product, inStock);

  return (
    <article className="group flex h-full min-h-[292px] flex-col overflow-hidden rounded-lg bg-white shadow-[0_10px_28px_rgba(18,18,18,0.045)] ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-0.5 hover:shadow-soft sm:min-h-[342px]">
      <div className="relative bg-surface-muted">
        <Link href={`/productos/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-surface-muted">
            <SafeProductImage
              src={product.image}
              alt={product.name}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1700px) 17vw, 14vw"
              priority={priority}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/15 via-black/5 to-transparent opacity-0 transition group-hover:opacity-100" />
          </div>
        </Link>
        <div className="absolute right-2 top-2">
          <FavoriteButton productSlug={product.slug} compact />
        </div>
        {visualTag ? (
          <div className="absolute left-2 top-2">
            <Badge tone="black" className="bg-black/72 text-[10px] ring-1 ring-white/15">
              {visualTag}
            </Badge>
          </div>
        ) : null}
        {discount ? (
          <div className="absolute bottom-2 left-2">
            <Badge tone="brand" className="bg-brand/92 text-[10px] text-white ring-1 ring-black/10">
              -{discount}%
            </Badge>
          </div>
        ) : null}
        {!inStock ? (
          <div className="absolute inset-x-2.5 bottom-2.5">
            <Badge tone="black" className="text-[11px] ring-1 ring-black/25">
              Agotado
            </Badge>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <p className="hidden truncate text-[11px] font-black uppercase tracking-wide text-stone-400 sm:block">
          {product.categoryName}
        </p>
        <Link href={`/productos/${product.slug}`} className="block">
          <h3 className="mt-1 line-clamp-2 min-h-9 text-xs font-bold leading-4 text-ink transition group-hover:text-black sm:min-h-10 sm:leading-5 md:text-sm">
            {product.name}
          </h3>
        </Link>
        {sizes.length > 0 ? (
          <p className="mt-2 hidden truncate text-[11px] font-semibold text-stone-500/90 sm:block">
            Tallas: {sizes.join(" · ")}
            {meaningfulSizes(product.sizes).length > sizes.length ? " +" : ""}
          </p>
        ) : null}
        <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-stone-500">
          <span className="text-amber-500" aria-hidden="true">
            ★
          </span>
          <span>{product.rating.toFixed(1)}</span>
          <span className="text-stone-300">|</span>
          <span>{metaCopy}</span>
        </div>
        <div className="mt-auto flex min-h-11 items-end justify-between gap-2 pt-2 sm:min-h-12">
          <ProductPrice price={product.price} previousPrice={previousPrice} size="md" />
          <Link
            href={`/productos/${product.slug}`}
            className="hidden shrink-0 rounded-full bg-stone-100/80 px-2.5 py-1.5 text-[10px] font-black uppercase text-stone-600 transition hover:bg-black hover:text-white sm:inline-flex"
          >
            Ver
          </Link>
        </div>
        <p className={`mt-1 hidden text-[11px] font-bold sm:block ${inStock ? "text-emerald-700" : "text-stone-400"}`}>
          {sellingLine}
        </p>
      </div>
    </article>
  );
}

function getVisualTag(product: Product, discount: number | null) {
  if (discount && discount >= 25) return "Mega sale";
  if (product.isPromo || discount) return "Precio wow";
  if (product.isNew && product.isTrending) return "Nuevo trend";
  if (product.isNew) return "New in";
  if (product.isTrending) return "Top look";
  if (product.stock > 0 && product.stock <= 3) return "Ultimas piezas";
  if (product.badge === "Oferta") return "Sale";
  if (product.badge === "Nuevo") return "New in";
  if (product.badge === "Tendencia" || product.badge === "Top") return "Atres pick";
  return product.badge;
}

function getMetaCopy(product: Product) {
  if (product.isTrending) return "favorito ATRES";
  if (product.isNew) return "recien llegado";
  if (product.isPromo) return "precio especial";
  if (product.stock > 0 && product.stock <= 3) return "pocas piezas";
  return "en vitrina";
}

function getSellingLine(product: Product, inStock: boolean) {
  if (!inStock) return "Pide disponibilidad por WhatsApp";

  const key = `${product.categorySlug} ${product.categoryName} ${product.collection}`.toLowerCase();

  if (product.isPromo) return "Precio especial por tiempo limitado";
  if (product.isNew) return "Nuevo drop listo para estrenar";
  if (key.includes("hogar") || key.includes("textil") || key.includes("sabana") || key.includes("cobija")) {
    return "Texturas suaves para renovar casa";
  }
  if (key.includes("infantil") || key.includes("nino") || key.includes("nina") || key.includes("bebe")) {
    return "Looks comodos para todos los dias";
  }
  if (key.includes("mujer") || key.includes("femenin")) {
    return "Una pieza facil para elevar el look";
  }
  if (key.includes("hombre") || key.includes("masculin")) {
    return "Basico versatil con estilo limpio";
  }

  return "Seleccion ATRES lista para comprar";
}
