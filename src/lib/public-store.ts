import {
  buildPrimaryNavItems,
  getChildCategories,
  getDescendantCategorySlugs,
  getTopLevelCategories,
  sortCategoriesForDisplay,
  type NavItem,
  type StoreCategory,
} from "@/lib/store-navigation";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
};

type SupabaseImageRow = {
  product_id: string;
  public_url: string;
  alt: string;
  display_order: number;
  is_primary: boolean;
};

type SupabaseVariantRow = {
  product_id: string;
  size: string;
  color: string;
  inventory: number;
};

export async function getPublicCategories(): Promise<StoreCategory[]> {
  if (!hasSupabaseEnv()) {
    return fallbackCategories.map(mapFallbackCategory);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id,slug,name,description,image_url,display_order,parent_id")
      .eq("status", "active")
      .order("display_order", { ascending: true });

    if (error || !data?.length) {
      return fallbackCategories.map(mapFallbackCategory);
    }

    const slugById = new Map(
      (data as SupabaseCategoryRow[]).map((category) => [category.id, category.slug]),
    );

    return (data as SupabaseCategoryRow[]).map((category) => mapCategoryRow(category, slugById));
  } catch {
    return fallbackCategories.map(mapFallbackCategory);
  }
}

export async function getStoreNavigation(): Promise<NavItem[]> {
  const [categories, products] = await Promise.all([getPublicCategories(), getPublicProducts()]);
  const productCategorySlugs = products.map((product) => product.categorySlug);
  return buildPrimaryNavItems(categories, productCategorySlugs);
}

export async function getPublicCategoriesForDisplay(): Promise<StoreCategory[]> {
  const [categories, products] = await Promise.all([getPublicCategories(), getPublicProducts()]);
  const roots = sortCategoriesForDisplay(getTopLevelCategories(categories));

  return roots.filter((category) => categoryHasProducts(category, categories, products));
}

export async function getPublicCategoryBySlug(slug: string) {
  const categories = await getPublicCategories();
  return categories.find((category) => category.slug === slug || normalizeCategorySlug(category.slug) === normalizeCategorySlug(slug));
}

export async function getPublicSubcategories(parentSlug: string) {
  const [categories, products] = await Promise.all([getPublicCategories(), getPublicProducts()]);
  const parent = categories.find(
    (category) =>
      category.slug === parentSlug || normalizeCategorySlug(category.slug) === normalizeCategorySlug(parentSlug),
  );

  if (!parent) return [];

  const children = getChildCategories(categories, parent);
  return children.filter((child) => categoryHasProducts(child, categories, products));
}

export async function getPublicProducts(): Promise<Product[]> {
  if (!hasSupabaseEnv()) {
    return fallbackProducts;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: productRows, error: productError } = await supabase
      .from("products")
      .select(
        "id,name,slug,short_description,description,price,previous_price,discount_percent,sku,inventory_total,is_featured,is_new,is_promo,tags,collection,category_id,display_order,created_at",
      )
      .eq("status", "active")
      .order("display_order", { ascending: true });

    if (productError || !productRows?.length) {
      if (productError) console.error("ATRES public products query failed:", productError.message);
      return [];
    }

    const products = productRows as unknown as SupabaseProductRow[];
    const productIds = products.map((product) => product.id);
    const categoryIds = Array.from(new Set(products.map((product) => product.category_id).filter(Boolean))) as string[];
    const [categoriesById, imagesByProductId, variantsByProductId] = await Promise.all([
      getCategoriesById(categoryIds),
      getImagesByProductId(productIds),
      getVariantsByProductId(productIds),
    ]);

    return products.map((row) =>
      mapProductRow(
        row,
        row.category_id ? categoriesById.get(row.category_id) ?? null : null,
        imagesByProductId.get(row.id) ?? [],
        variantsByProductId.get(row.id) ?? [],
      ),
    );
  } catch (error) {
    console.error("ATRES public products unexpected failure:", error);
    return [];
  }
}

export async function getPublicProduct(slug: string) {
  const products = await getPublicProducts();
  return products.find((product) => product.slug === slug);
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
  return products.filter((item) => item.slug !== product.slug).slice(0, 4);
}

export async function getPublicPromos(): Promise<Promo[]> {
  if (!hasSupabaseEnv()) {
    return promos;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("banners")
      .select("title,subtitle,link_url,desktop_image_url,display_order")
      .eq("status", "active")
      .order("display_order", { ascending: true })
      .limit(3);

    if (error || !data?.length) {
      return promos;
    }

    return data.map((banner, index) => ({
      title: banner.title,
      subtitle: banner.subtitle,
      href: banner.link_url || "/productos",
      image: banner.desktop_image_url ?? promos[index % promos.length].image,
      tone: index === 0 ? "bg-promo text-black" : index === 1 ? "bg-black text-white" : "bg-white text-black",
    }));
  } catch {
    return promos;
  }
}

async function getCategoriesById(categoryIds: string[]) {
  const categoriesById = new Map<string, SupabaseCategoryRow>();
  if (!categoryIds.length) return categoriesById;

  try {
    const supabase = await createSupabaseServerClient();
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
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("product_images")
      .select("product_id,public_url,alt,display_order,is_primary")
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
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("product_variants")
      .select("product_id,size,color,inventory")
      .in("product_id", productIds);

    if (error) {
      console.error("ATRES public product variants query failed:", error.message);
      return variantsByProductId;
    }

    for (const variant of (data ?? []) as SupabaseVariantRow[]) {
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
    image: category.image_url ?? fallbackCategories[0].image,
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
): Product {
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.display_order - b.display_order;
  });
  const imageUrls = sortedImages.map((image) => image.public_url);
  const colors = Array.from(new Set(variants.map((variant) => variant.color).filter(Boolean)));
  const sizes = Array.from(new Set(variants.map((variant) => variant.size).filter(Boolean)));

  return {
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
    image: imageUrls[0] ?? fallbackProducts[0].image,
    images: imageUrls.length ? imageUrls : fallbackProducts[0].images,
    colors: colors.length ? colors : ["Unico"],
    sizes: sizes.length ? sizes : ["Unica"],
    description: row.description || row.short_description || row.name,
    details: row.tags?.length ? row.tags : ["Producto ATRES", "Disponible en tienda"],
    collection: row.collection || "ATRES",
  };
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
    ["infantil", "moda-infantil", "ninos", "ninas", "kids", "bebe", "bebes", "baby"],
    ["urbana", "moda-urbana", "streetwear", "casual"],
    ["jeans", "denim", "jeans-y-denim", "mezclilla"],
    ["deportiva", "deportivo", "ropa-deportiva", "sport", "sport-wear"],
    ["textiles-para-hogar", "textiles", "hogar", "hogar-y-vida"],
    ["elegante", "moda-elegante", "formal"],
    ["accesorios", "bisuteria-y-accesorios", "bolsos", "bolsas-y-maletas"],
    ["uniformes", "colegio", "escolar"],
  ].map((group) => group.map(normalizeCategorySlug));

  return groups.find((group) => group.includes(slug)) ?? [slug];
}
