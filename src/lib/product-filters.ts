import type { Product } from "@/lib/store-data";
import { getDescendantCategorySlugs, normalizeNavSlug, type StoreCategory } from "@/lib/store-navigation";

export type CatalogFilterState = {
  q?: string;
  categoria?: string;
  tienda?: string;
  ciudad?: string;
  talla?: string;
  color?: string;
  coleccion?: string;
  novedades?: boolean;
  ofertas?: boolean;
  disponible?: boolean;
  precioMin?: number;
  precioMax?: number;
  orden?: string;
};

export type CatalogFilterOptions = {
  categories: Array<{ slug: string; label: string }>;
  cities: string[];
  shops: Array<{ slug: string; label: string; city?: string }>;
  sizes: string[];
  colors: string[];
  collections: string[];
  priceMin: number;
  priceMax: number;
};

const GENERIC_SIZES = new Set(["unica", "unico", "u", "one-size", "onesize"]);
const GENERIC_COLORS = new Set(["unico", "unica", "unico/a", "n/a", "na"]);

export function parseCatalogFilters(
  params: Record<string, string | string[] | undefined> | undefined,
): CatalogFilterState {
  const value = (key: string) => {
    const raw = params?.[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };

  const precioMin = Number(value("precio_min"));
  const precioMax = Number(value("precio_max"));

  return {
    q: value("q")?.trim() || undefined,
    categoria: value("categoria")?.trim() || undefined,
    tienda: value("tienda")?.trim() || undefined,
    ciudad: value("ciudad")?.trim() || undefined,
    talla: value("talla")?.trim() || undefined,
    color: value("color")?.trim() || undefined,
    coleccion: value("coleccion")?.trim() || undefined,
    novedades: value("novedades") === "1",
    ofertas: value("ofertas") === "1",
    disponible: value("disponible") === "1",
    precioMin: Number.isFinite(precioMin) && precioMin > 0 ? precioMin : undefined,
    precioMax: Number.isFinite(precioMax) && precioMax > 0 ? precioMax : undefined,
    orden: value("orden")?.trim() || "relevancia",
  };
}

export function buildCatalogQuery(filters: CatalogFilterState, basePath = "/productos") {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.categoria) params.set("categoria", filters.categoria);
  if (filters.tienda) params.set("tienda", filters.tienda);
  if (filters.ciudad) params.set("ciudad", filters.ciudad);
  if (filters.talla) params.set("talla", filters.talla);
  if (filters.color) params.set("color", filters.color);
  if (filters.coleccion) params.set("coleccion", filters.coleccion);
  if (filters.novedades) params.set("novedades", "1");
  if (filters.ofertas) params.set("ofertas", "1");
  if (filters.disponible) params.set("disponible", "1");
  if (filters.precioMin) params.set("precio_min", String(filters.precioMin));
  if (filters.precioMax) params.set("precio_max", String(filters.precioMax));
  if (filters.orden && filters.orden !== "relevancia") params.set("orden", filters.orden);

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function collectFilterOptions(
  products: Product[],
  categories: StoreCategory[],
): CatalogFilterOptions {
  const sizes = new Set<string>();
  const colors = new Set<string>();
  const collections = new Set<string>();
  const cities = new Set<string>();
  const shops = new Map<string, { slug: string; label: string; city?: string }>();
  let priceMin = Number.POSITIVE_INFINITY;
  let priceMax = 0;

  for (const product of products) {
    priceMin = Math.min(priceMin, product.price);
    priceMax = Math.max(priceMax, product.price);

    for (const size of product.sizes) {
      if (isMeaningfulOption(size, GENERIC_SIZES)) sizes.add(size);
    }
    for (const color of product.colors) {
      if (isMeaningfulOption(color, GENERIC_COLORS)) colors.add(color);
    }
    if (product.collection?.trim() && product.collection.trim().toLowerCase() !== "atres") {
      collections.add(product.collection.trim());
    }
    if (product.shopCity?.trim()) {
      cities.add(product.shopCity.trim());
    }
    if (product.shopSlug?.trim() && product.shopName?.trim()) {
      shops.set(product.shopSlug.trim(), {
        slug: product.shopSlug.trim(),
        label: product.shopName.trim(),
        city: product.shopCity?.trim() || undefined,
      });
    }
  }

  const topCategories = categories
    .filter((category) => !category.parentId)
    .map((category) => ({ slug: category.slug, label: category.shortName || category.name }));

  return {
    categories: topCategories,
    cities: Array.from(cities).sort((a, b) => a.localeCompare(b, "es")),
    shops: Array.from(shops.values()).sort((a, b) => a.label.localeCompare(b.label, "es")),
    sizes: Array.from(sizes).sort((a, b) => a.localeCompare(b, "es")),
    colors: Array.from(colors).sort((a, b) => a.localeCompare(b, "es")),
    collections: Array.from(collections).sort((a, b) => a.localeCompare(b, "es")),
    priceMin: Number.isFinite(priceMin) ? priceMin : 0,
    priceMax: priceMax || 0,
  };
}

export function applyCatalogFilters(
  products: Product[],
  filters: CatalogFilterState,
  categories: StoreCategory[] = [],
): Product[] {
  let list = [...products];

  if (filters.q) {
    const query = filters.q.toLowerCase();
    list = list.filter((product) =>
      [product.name, product.categoryName, product.collection, product.description, ...product.details]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  if (filters.categoria) {
    const slugs = getDescendantCategorySlugs(categories, filters.categoria);
    list = list.filter((product) =>
      slugs.some(
        (slug) =>
          normalizeNavSlug(product.categorySlug) === normalizeNavSlug(slug) ||
          normalizeNavSlug(product.categoryName) === normalizeNavSlug(slug),
      ),
    );
  }

  if (filters.tienda) {
    const target = normalizeNavSlug(filters.tienda);
    list = list.filter((product) => normalizeNavSlug(product.shopSlug ?? "") === target);
  }

  if (filters.ciudad) {
    const target = normalizeNavSlug(filters.ciudad);
    list = list.filter((product) => normalizeNavSlug(product.shopCity ?? "") === target);
  }

  if (filters.talla) {
    const target = normalizeNavSlug(filters.talla);
    list = list.filter((product) => product.sizes.some((size) => normalizeNavSlug(size) === target));
  }

  if (filters.color) {
    const target = normalizeNavSlug(filters.color);
    list = list.filter((product) => product.colors.some((color) => normalizeNavSlug(color) === target));
  }

  if (filters.coleccion) {
    const target = normalizeNavSlug(filters.coleccion);
    list = list.filter((product) => normalizeNavSlug(product.collection) === target);
  }

  if (filters.novedades) {
    list = list.filter((product) => product.isNew);
  }

  if (filters.ofertas) {
    list = list.filter((product) => product.isPromo);
  }

  if (filters.disponible) {
    list = list.filter((product) => product.stock > 0);
  }

  if (filters.precioMin != null) {
    list = list.filter((product) => product.price >= filters.precioMin!);
  }

  if (filters.precioMax != null) {
    list = list.filter((product) => product.price <= filters.precioMax!);
  }

  return sortCatalogProducts(list, filters.orden ?? "relevancia");
}

export function sortCatalogProducts(products: Product[], order: string) {
  const sorted = [...products];

  if (order === "nuevos") {
    return sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
  }

  if (order === "tendencias" || order === "mas-vendidos") {
    return sorted.sort((a, b) => trendScore(b) - trendScore(a));
  }

  if (order === "precio-menor") {
    return sorted.sort((a, b) => a.price - b.price);
  }

  if (order === "precio-mayor") {
    return sorted.sort((a, b) => b.price - a.price);
  }

  if (order === "descuento") {
    return sorted.sort((a, b) => discountValue(b) - discountValue(a));
  }

  // "relevancia" / Para ti: orden aleatorio en cada visita al catalogo.
  return shuffleProducts(sorted);
}

function shuffleProducts(products: Product[]) {
  for (let index = products.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [products[index], products[swapIndex]] = [products[swapIndex], products[index]];
  }
  return products;
}

export function countActiveFilters(filters: CatalogFilterState) {
  let count = 0;
  if (filters.categoria) count += 1;
  if (filters.tienda) count += 1;
  if (filters.ciudad) count += 1;
  if (filters.talla) count += 1;
  if (filters.color) count += 1;
  if (filters.coleccion) count += 1;
  if (filters.novedades) count += 1;
  if (filters.ofertas) count += 1;
  if (filters.disponible) count += 1;
  if (filters.precioMin != null) count += 1;
  if (filters.precioMax != null) count += 1;
  return count;
}

function discountValue(product: Product) {
  if (!product.previousPrice || product.previousPrice <= product.price) return 0;
  return product.previousPrice - product.price;
}

function trendScore(product: Product) {
  return Number(product.isTrending) * 3 + Number(product.isNew) * 2 + Number(product.isPromo);
}

function isMeaningfulOption(value: string, generic: Set<string>) {
  const normalized = normalizeNavSlug(value);
  return Boolean(normalized) && !generic.has(normalized);
}
