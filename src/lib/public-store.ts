import { cache } from "react";
import {
  buildPrimaryNavItems,
  categorySlugMatches,
  DEPARTMENT_SLUGS,
  getChildCategories,
  getDepartmentKeyForSlug,
  getDescendantCategorySlugs,
  getPrimaryDepartmentsForDisplay,
  normalizeNavSlug,
  PRIMARY_DEPARTMENT_KEYS,
  PRIMARY_NAV,
  type NavItem,
  type StoreCategory,
} from "@/lib/store-navigation";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import {
  categories as fallbackCategories,
  getNewProducts,
  getPromoProducts,
  getRelatedProducts as getFallbackRelatedProducts,
  getTrendingProducts,
  products as fallbackProducts,
  promos,
  type Category,
  type Product,
  type Promo,
} from "@/lib/store-data";
import { curatedAtresProducts, curatedAtresPromos } from "@/lib/curated-atres-assets";
import { resolveStoreImageUrl } from "@/lib/image-url";
import { ATRES_IMAGE_PLACEHOLDER } from "@/lib/local-media";

const ATRES_PLACEHOLDER_IMAGE = ATRES_IMAGE_PLACEHOLDER;
const PRODUCT_SELECT_BASE =
  "id,name,slug,short_description,description,price,previous_price,discount_percent,sku,inventory_total,is_featured,is_new,is_promo,tags,collection,category_id,shop_id,display_order,created_at";

type SupabaseCategoryRow = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  display_order?: number | null;
  parent_id?: string | null;
};

type SupabaseProductRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  previous_price: number | null;
  discount_percent: number | null;
  sku: string;
  inventory_total: number;
  is_featured: boolean;
  is_new: boolean;
  is_promo: boolean;
  tags: string[] | null;
  collection: string | null;
  category_id: string | null;
  shop_id: string | null;
};

export type PublicShop = {
  id: string;
  name: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  city: string;
  country: string;
  department: string;
  locality: string;
  neighborhood: string;
  address: string;
  addressReference: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string | null;
  deliveryRadiusKm: number | null;
  pickupEnabled: boolean;
  localDeliveryEnabled: boolean;
  locationVerified: boolean;
  verified: boolean;
  whatsapp: string;
  logoUrl: string | null;
  coverUrl: string | null;
  productCount?: number;
};

type SupabaseImageRow = {
  product_id: string;
  public_url?: string | null;
  storage_path?: string | null;
  alt?: string | null;
  display_order?: number | null;
  is_primary?: boolean | null;
};

type SupabaseVariantRow = {
  product_id: string;
  size: string;
  color: string;
  inventory: number;
  status?: string | null;
};

export const getPublicCategories = cache(async function getPublicCategories(): Promise<StoreCategory[]> {
  if (!hasSupabaseEnv()) {
    return fallbackCategories.map(mapFallbackCategory);
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id,slug,name,description,image_url,display_order,parent_id")
      .eq("status", "active")
      .order("display_order", { ascending: true });

    if (error || !data?.length) {
      return [];
    }

    const slugById = new Map(
      (data as SupabaseCategoryRow[]).map((category) => [category.id, category.slug]),
    );

    return (data as SupabaseCategoryRow[]).map((category) => mapCategoryRow(category, slugById));
  } catch {
    return [];
  }
});

export async function getStoreNavigation(): Promise<NavItem[]> {
  const [categories, products] = await Promise.all([getPublicCategories(), getPublicProducts()]);
  const productCategorySlugs = products.map((product) => product.categorySlug);
  return buildPrimaryNavItems(categories, productCategorySlugs);
}

export async function getPublicCategoriesForDisplay(): Promise<StoreCategory[]> {
  const categories = await getPublicCategories();
  const primary = getPrimaryDepartmentsForDisplay(categories);

  return primary.filter((category) => {
    if (!category.id) return true;
    const departmentKey = getDepartmentKeyForSlug(category.slug);
    return Boolean(
      departmentKey && (PRIMARY_DEPARTMENT_KEYS as readonly string[]).includes(departmentKey),
    );
  });
}

export async function getPublicCategoryBySlug(slug: string): Promise<StoreCategory | null> {
  const categories = await getPublicCategories();
  const normalized = normalizeCategorySlug(slug);
  const departmentKey = getDepartmentKeyForSlug(slug);
  const departmentLabel =
    departmentKey && (PRIMARY_DEPARTMENT_KEYS as readonly string[]).includes(departmentKey)
      ? PRIMARY_NAV.find((item) => item.key === departmentKey)?.label
      : undefined;

  const direct = categories.find(
    (category) => category.slug === slug || normalizeCategorySlug(category.slug) === normalized,
  );
  if (direct) {
    return departmentLabel
      ? { ...direct, name: departmentLabel, shortName: departmentLabel }
      : direct;
  }

  const aliases = getCategoryAliasGroup(normalized);
  const aliased = categories.find((category) =>
    aliases.includes(normalizeCategorySlug(category.slug)),
  );
  if (aliased) {
    return {
      ...aliased,
      slug: departmentKey ? (DEPARTMENT_SLUGS[departmentKey]?.[0] ?? slug) : aliased.slug,
      name: departmentLabel ?? aliased.name,
      shortName: departmentLabel ?? aliased.shortName,
    };
  }

  if (departmentKey && departmentLabel) {
    return {
      slug: DEPARTMENT_SLUGS[departmentKey]?.[0] ?? slug,
      name: departmentLabel,
      shortName: departmentLabel,
      description: `Explora ${departmentLabel} en ATRES. Subcategorias y productos del departamento.`,
      image:
        ATRES_PLACEHOLDER_IMAGE,
      parentId: null,
    };
  }

  return null;
}

export async function getPublicSubcategories(parentSlug: string) {
  const [categories, products] = await Promise.all([getPublicCategories(), getPublicProducts()]);
  const parent =
    categories.find(
      (category) =>
        category.slug === parentSlug ||
        normalizeCategorySlug(category.slug) === normalizeCategorySlug(parentSlug),
    ) ?? (await getPublicCategoryBySlug(parentSlug));

  if (!parent) return [];

  const children = parent.id
    ? getChildCategories(categories, parent)
    : categories.filter((category) => category.parentSlug === parent.slug);

  const bySlug = new Map<string, StoreCategory>();
  for (const child of children) {
    bySlug.set(normalizeNavSlug(child.slug), child);
  }

  // Subtitulos / peers: categorias del mismo departamento (Nina, Bebe, etc.).
  const departmentKey = getDepartmentKeyForSlug(parentSlug) ?? getDepartmentKeyForSlug(parent.slug);
  if (departmentKey) {
    const aliases = DEPARTMENT_SLUGS[departmentKey] ?? [];
    for (const category of categories) {
      if (!categorySlugMatches(category.slug, aliases)) continue;
      if (normalizeNavSlug(category.slug) === normalizeNavSlug(parent.slug)) continue;
      if (normalizeNavSlug(category.slug) === normalizeNavSlug(parentSlug)) continue;
      if (!bySlug.has(normalizeNavSlug(category.slug))) {
        bySlug.set(normalizeNavSlug(category.slug), category);
      }
    }
  }

  return Array.from(bySlug.values()).filter((child) =>
    categoryHasProducts(child, categories, products),
  );
}

export const getPublicProducts = cache(async function getPublicProducts(): Promise<Product[]> {
  if (!hasSupabaseEnv()) {
    return mergeProducts(curatedAtresProducts, fallbackProducts);
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data: productRows, error: productError } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_BASE)
      .eq("status", "active")
      .order("display_order", { ascending: true });

    if (productError || !productRows?.length) {
      if (productError) console.error("ATRES public products query failed:", productError.message);
      return [];
    }

    return hydrateProductRows(productRows as unknown as SupabaseProductRow[]);
  } catch (error) {
    console.error("ATRES public products unexpected failure:", error);
    return [];
  }
});

/** Loads only the requested active products (for cart/favorites). Caps at 40 slugs. */
export async function getPublicProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const normalized = Array.from(
    new Set(
      slugs
        .map((slug) => slug.trim())
        .filter(Boolean)
        .slice(0, 40),
    ),
  );

  if (!normalized.length) return [];

  if (!hasSupabaseEnv()) {
    const catalog = mergeProducts(curatedAtresProducts, fallbackProducts);
    const wanted = new Set(normalized);
    return catalog.filter((product) => wanted.has(product.slug));
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data: productRows, error: productError } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_BASE)
      .eq("status", "active")
      .in("slug", normalized);

    if (productError) {
      console.error("ATRES public products-by-slug query failed:", productError.message);
      return [];
    }

    if (!productRows?.length) return [];

    return hydrateProductRows(productRows as unknown as SupabaseProductRow[]);
  } catch (error) {
    console.error("ATRES public products-by-slug unexpected failure:", error);
    return [];
  }
}

export async function getPublicProduct(slug: string) {
  const [match] = await getPublicProductsBySlugs([slug]);
  return match;
}

export async function getPublicProductsByCategory(slug: string) {
  const [products, categories] = await Promise.all([getPublicProducts(), getPublicCategories()]);
  const slugs = getDescendantCategorySlugs(categories, slug);

  return products.filter((product) =>
    slugs.some((candidate) => categoryMatches(candidate, product.categorySlug, product.categoryName)),
  );
}

export async function getPublicNewProducts() {
  const products = await getPublicProducts();

  if (!hasSupabaseEnv()) {
    return getNewProducts();
  }

  return products.filter((product) => product.isNew);
}

export async function getPublicPromoProducts() {
  const products = await getPublicProducts();

  if (!hasSupabaseEnv()) {
    return getPromoProducts();
  }

  return products.filter((product) => product.isPromo);
}

export async function getPublicTrendingProducts() {
  const products = await getPublicProducts();

  if (!hasSupabaseEnv()) {
    return getTrendingProducts();
  }

  return products.filter((product) => product.isTrending || product.isNew || product.isPromo);
}

export async function getPublicRelatedProducts(product: Product) {
  if (!hasSupabaseEnv()) {
    return getFallbackRelatedProducts(product);
  }

  const products = await getPublicProductsByCategory(product.categorySlug);
  return products.filter((item) => item.slug !== product.slug).slice(0, 10);
}

export const getPublicShops = cache(async function getPublicShops(): Promise<PublicShop[]> {
  if (!hasSupabaseEnv()) return [];

  try {
    const supabase = createSupabasePublicClient();
    const selectWithLocation =
      "id,name,title,slug,short_description,description,city,country,department,locality,neighborhood,address,address_reference,postal_code,latitude,longitude,maps_url,delivery_radius_km,pickup_enabled,local_delivery_enabled,location_verified,verified,whatsapp,logo_url,cover_url,status,show_on_home";
    const selectLegacy =
      "id,name,title,slug,short_description,description,city,logo_url,cover_url,status,show_on_home";

    const [{ data: shops, error }, products] = await Promise.all([
      supabase.from("shops").select(selectWithLocation).eq("status", "active").order("name", { ascending: true }),
      getPublicProducts(),
    ]);

    let shopRows = shops as Array<Record<string, unknown>> | null;
    let shopError = error;

    if (shopError) {
      const legacy = await supabase
        .from("shops")
        .select(selectLegacy)
        .eq("status", "active")
        .order("name", { ascending: true });
      shopRows = (legacy.data as Array<Record<string, unknown>> | null) ?? null;
      shopError = legacy.error;
    }

    if (shopError || !shopRows?.length) {
      if (shopError) console.error("ATRES public shops query failed:", shopError.message);
      return [];
    }

    const counts = new Map<string, number>();
    for (const product of products) {
      if (!product.shopId) continue;
      counts.set(product.shopId, (counts.get(product.shopId) ?? 0) + 1);
    }

    return shopRows
      .map((shop) => mapPublicShopRow(shop, counts.get(String(shop.id)) ?? 0))
      .filter((shop) => shop.slug);
  } catch (error) {
    console.error("ATRES public shops unexpected failure:", error);
    return [];
  }
});

function mapPublicShopRow(shop: Record<string, unknown>, productCount: number): PublicShop {
  const id = String(shop.id);
  const latitude = typeof shop.latitude === "number" ? shop.latitude : null;
  const longitude = typeof shop.longitude === "number" ? shop.longitude : null;
  const deliveryRadius =
    typeof shop.delivery_radius_km === "number"
      ? shop.delivery_radius_km
      : typeof shop.delivery_radius_km === "string" && shop.delivery_radius_km
        ? Number(shop.delivery_radius_km)
        : null;

  return {
    id,
    name: String(shop.name ?? ""),
    title: String(shop.title || shop.name || ""),
    slug: String(shop.slug ?? ""),
    shortDescription: String(shop.short_description ?? ""),
    description: String(shop.description ?? ""),
    city: String(shop.city ?? ""),
    country: String(shop.country ?? "Colombia"),
    department: String(shop.department ?? ""),
    locality: String(shop.locality ?? ""),
    neighborhood: String(shop.neighborhood ?? ""),
    address: String(shop.address ?? ""),
    addressReference: String(shop.address_reference ?? ""),
    postalCode: String(shop.postal_code ?? ""),
    latitude,
    longitude,
    mapsUrl: typeof shop.maps_url === "string" ? shop.maps_url : null,
    deliveryRadiusKm: Number.isFinite(deliveryRadius as number) ? (deliveryRadius as number) : null,
    pickupEnabled: Boolean(shop.pickup_enabled),
    localDeliveryEnabled: Boolean(shop.local_delivery_enabled),
    locationVerified: Boolean(shop.location_verified),
    verified: Boolean(shop.verified),
    whatsapp: String(shop.whatsapp ?? ""),
    logoUrl: typeof shop.logo_url === "string" ? shop.logo_url : null,
    coverUrl: typeof shop.cover_url === "string" ? shop.cover_url : null,
    productCount,
  };
}

export async function getPublicShopBySlug(slug: string) {
  const shops = await getPublicShops();
  const normalized = normalizeNavSlug(slug);
  return shops.find((shop) => normalizeNavSlug(shop.slug) === normalized) ?? null;
}

export const getPublicPromos = cache(async function getPublicPromos(): Promise<Promo[]> {
  if (!hasSupabaseEnv()) {
    return [...curatedAtresPromos, ...promos];
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("banners")
      .select("title,subtitle,link_url,desktop_image_url,display_order")
      .eq("status", "active")
      .order("display_order", { ascending: true })
      .limit(3);

    if (error || !data?.length) {
      return [];
    }

    const supabasePromos = data.map((banner, index) => ({
      title: banner.title,
      subtitle: banner.subtitle,
      href: banner.link_url || "/productos",
      image: resolveStoreImageUrl(banner.desktop_image_url, ATRES_PLACEHOLDER_IMAGE),
      tone: index === 0 ? "bg-promo text-black" : index === 1 ? "bg-black text-white" : "bg-white text-black",
    }));

    return supabasePromos;
  } catch {
    return [];
  }
});

function mergeProducts(primary: Product[], secondary: Product[]) {
  const bySlug = new Map<string, Product>();
  for (const product of [...primary, ...secondary]) {
    if (!bySlug.has(product.slug)) {
      bySlug.set(product.slug, product);
    }
  }
  return Array.from(bySlug.values());
}

async function hydrateProductRows(products: SupabaseProductRow[]): Promise<Product[]> {
  const productIds = products.map((product) => product.id);
  const categoryIds = Array.from(new Set(products.map((product) => product.category_id).filter(Boolean))) as string[];
  const shopIds = Array.from(new Set(products.map((product) => product.shop_id).filter(Boolean))) as string[];
  const [categoriesById, imagesByProductId, variantsByProductId, shopsById] = await Promise.all([
    getCategoriesById(categoryIds),
    getImagesByProductId(productIds),
    getVariantsByProductId(productIds),
    getShopsById(shopIds),
  ]);

  return products
    .filter((row) => isProductShopPubliclyVisible(row.shop_id, shopsById))
    .map((row) =>
      mapProductRow(
        row,
        row.category_id ? categoriesById.get(row.category_id) ?? null : null,
        imagesByProductId.get(row.id) ?? [],
        variantsByProductId.get(row.id) ?? [],
        row.shop_id ? shopsById.get(row.shop_id) ?? null : null,
      ),
    );
}

/** Products without shop stay visible; products with a shop only if that shop is active. */
type ShopLookup = {
  id: string;
  slug: string;
  name: string;
  status: string;
  city?: string;
  locality?: string;
  neighborhood?: string;
};

function isProductShopPubliclyVisible(
  shopId: string | null,
  shopsById: Map<string, ShopLookup>,
) {
  if (!shopId) return true;
  const shop = shopsById.get(shopId);
  return Boolean(shop && shop.status === "active");
}

async function getCategoriesById(categoryIds: string[]) {
  const categoriesById = new Map<string, SupabaseCategoryRow>();
  if (!categoryIds.length) return categoriesById;

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.from("categories").select("id,slug,name").in("id", categoryIds);
    if (error) {
      console.error("ATRES public product categories query failed:", error.message);
      return categoriesById;
    }
    for (const category of (data ?? []) as SupabaseCategoryRow[]) {
      categoriesById.set(category.id, category);
    }
  } catch (error) {
    console.error("ATRES public product categories unexpected failure:", error);
  }

  return categoriesById;
}

async function getImagesByProductId(productIds: string[]) {
  const imagesByProductId = new Map<string, SupabaseImageRow[]>();
  if (!productIds.length) return imagesByProductId;

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("product_images")
      .select("product_id,public_url,storage_path,alt,display_order,is_primary")
      .in("product_id", productIds)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("ATRES public product images query failed:", error.message);
      return imagesByProductId;
    }

    for (const image of (data ?? []) as SupabaseImageRow[]) {
      const current = imagesByProductId.get(image.product_id) ?? [];
      current.push(image);
      imagesByProductId.set(image.product_id, current);
    }
  } catch (error) {
    console.error("ATRES public product images unexpected failure:", error);
  }

  return imagesByProductId;
}

async function getVariantsByProductId(productIds: string[]) {
  const variantsByProductId = new Map<string, SupabaseVariantRow[]>();
  if (!productIds.length) return variantsByProductId;

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("product_variants")
      .select("product_id,size,color,inventory,status")
      .in("product_id", productIds);

    if (error) {
      console.error("ATRES public product variants query failed:", error.message);
      return variantsByProductId;
    }

    for (const variant of (data ?? []) as SupabaseVariantRow[]) {
      if (variant.status === "hidden") continue;
      const current = variantsByProductId.get(variant.product_id) ?? [];
      current.push(variant);
      variantsByProductId.set(variant.product_id, current);
    }
  } catch (error) {
    console.error("ATRES public product variants unexpected failure:", error);
  }

  return variantsByProductId;
}

function mapFallbackCategory(category: Category): StoreCategory {
  return {
    ...category,
    displayOrder: 0,
  };
}

function mapCategoryRow(category: SupabaseCategoryRow, slugById: Map<string, string>): StoreCategory {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    shortName: category.name.replace(/^Moda\s+/i, ""),
    image: resolveStoreImageUrl(category.image_url, ATRES_PLACEHOLDER_IMAGE),
    description: category.description ?? "",
    parentId: category.parent_id ?? null,
    parentSlug: category.parent_id ? slugById.get(category.parent_id) ?? null : null,
    displayOrder: category.display_order ?? 0,
  };
}

function categoryHasProducts(category: StoreCategory, allCategories: StoreCategory[], products: Product[]) {
  if (!products.length) return true;

  const slugs = getDescendantCategorySlugs(allCategories, category.slug);
  return products.some((product) =>
    slugs.some((candidate) => categoryMatches(candidate, product.categorySlug, product.categoryName)),
  );
}

function mapProductRow(
  row: SupabaseProductRow,
  category: SupabaseCategoryRow | null,
  images: SupabaseImageRow[],
  variants: SupabaseVariantRow[],
  shop: ShopLookup | null,
): Product {
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });
  const imageUrls = sortedImages.map(resolveProductImageUrl).filter((image): image is string => Boolean(image));
  const allImageUrls = Array.from(new Set(imageUrls));
  const colors = Array.from(new Set(variants.map((variant) => variant.color).filter(Boolean)));
  const sizes = Array.from(new Set(variants.map((variant) => variant.size).filter(Boolean)));

  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    categorySlug: category?.slug ?? "productos",
    categoryName: category?.name ?? "Productos",
    price: row.price,
    previousPrice: row.previous_price ?? undefined,
    badge: row.is_promo ? "Oferta" : row.is_new ? "Nuevo" : row.is_featured ? "Top" : undefined,
    isNew: row.is_new,
    isTrending: row.is_featured,
    isPromo: row.is_promo,
    rating: 4.7,
    stock: row.inventory_total,
    image: allImageUrls[0] ?? ATRES_PLACEHOLDER_IMAGE,
    images: allImageUrls.length ? allImageUrls : [ATRES_PLACEHOLDER_IMAGE],
    colors: colors.length ? colors : ["Unico"],
    sizes: sizes.length ? sizes : ["Unica"],
    description: row.description || row.short_description || row.name,
    details: row.tags?.length ? row.tags : ["Producto ATRES", "Disponible en tienda"],
    collection: row.collection || "ATRES",
    shopId: shop?.id ?? row.shop_id ?? undefined,
    shopSlug: shop?.slug,
    shopName: shop?.name,
    shopCity: shop?.city || undefined,
    shopLocality: shop?.locality || undefined,
    shopNeighborhood: shop?.neighborhood || undefined,
  };
}

async function getShopsById(shopIds: string[]) {
  if (!shopIds.length) return new Map<string, ShopLookup>();

  const supabase = createSupabasePublicClient();
  const selectWithLocation = "id,slug,name,status,city,locality,neighborhood";
  const selectLegacy = "id,slug,name,status";

  const { data, error } = await supabase.from("shops").select(selectWithLocation).in("id", shopIds);
  let rows = data as Array<Record<string, unknown>> | null;
  let queryError = error;

  if (queryError) {
    const legacy = await supabase.from("shops").select(selectLegacy).in("id", shopIds);
    rows = (legacy.data as Array<Record<string, unknown>> | null) ?? null;
    queryError = legacy.error;
  }

  if (queryError || !rows?.length) return new Map();

  return new Map(
    rows.map((shop) => {
      const id = String(shop.id);
      const mapped: ShopLookup = {
        id,
        slug: String(shop.slug ?? ""),
        name: String(shop.name ?? ""),
        status: String(shop.status ?? ""),
        city: typeof shop.city === "string" ? shop.city : undefined,
        locality: typeof shop.locality === "string" ? shop.locality : undefined,
        neighborhood: typeof shop.neighborhood === "string" ? shop.neighborhood : undefined,
      };
      return [id, mapped] as const;
    }),
  );
}

function resolveProductImageUrl(image: SupabaseImageRow) {
  const directUrl = image.public_url?.trim();
  if (directUrl) return resolveStoreImageUrl(directUrl, "") || null;

  const storagePath = image.storage_path?.trim();
  if (!storagePath) return null;
  if (/^https?:\/\//i.test(storagePath)) {
    return resolveStoreImageUrl(storagePath, "") || null;
  }

  const encodedPath = storagePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return resolveStoreImageUrl(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${encodedPath}`,
    "",
  ) || null;
}

function categoryMatches(requestedSlug: string, productSlug: string, productName: string) {
  const requested = normalizeCategorySlug(requestedSlug);
  const product = normalizeCategorySlug(productSlug);
  const productNameKey = normalizeCategorySlug(productName);

  if (requested === product || requested === productNameKey) {
    return true;
  }

  return getCategoryAliasGroup(requested).some((alias) => alias === product || alias === productNameKey);
}

function normalizeCategorySlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^moda-/, "")
    .replace(/^ropa-/, "");
}

function getCategoryAliasGroup(slug: string) {
  const groups = [
    ["hombre", "moda-hombre"],
    ["mujer", "moda-mujer"],
    ["infantil", "moda-infantil", "ninos", "ninas", "nino", "nina", "kids", "bebe", "bebes", "baby"],
    ["urbana", "moda-urbana", "streetwear", "casual"],
    ["jeans", "denim", "jeans-y-denim", "mezclilla"],
    ["deportiva", "deportivo", "ropa-deportiva", "sport", "sport-wear"],
    [
      "textiles-para-hogar",
      "textiles",
      "hogar",
      "hogar-y-vida",
      "textiles-hogar",
      "sabanas",
      "cobijas",
      "ropa-de-cama",
      "lenceria-hogar",
      "accesorios-hogar",
      "decoracion-hogar",
    ],
    ["elegante", "moda-elegante", "formal"],
    ["accesorios", "bisuteria-y-accesorios", "bolsos", "bolsas-y-maletas"],
    ["uniformes", "colegio", "escolar"],
    ["pijamas", "pijama"],
  ].map((group) => group.map(normalizeCategorySlug));

  return groups.find((group) => group.includes(slug)) ?? [slug];
}
