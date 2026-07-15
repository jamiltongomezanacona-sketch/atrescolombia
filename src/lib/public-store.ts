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

type SupabaseProductRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  previous_price: number | null;
  discount_percent: number | null;
  sku: string;
  inventory_total: number;
  is_featured: boolean;
  is_new: boolean;
  is_promo: boolean;
  tags: string[];
  collection: string;
  categories: {
    slug: string;
    name: string;
  } | null;
  product_images: Array<{
    public_url: string;
    alt: string;
    display_order: number;
    is_primary: boolean;
  }>;
  product_variants: Array<{
    size: string;
    color: string;
    inventory: number;
  }>;
};

export async function getPublicCategories(): Promise<Category[]> {
  if (!hasSupabaseEnv()) {
    return fallbackCategories;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("slug,name,description,image_url,display_order")
      .eq("status", "active")
      .order("display_order", { ascending: true });

    if (error || !data?.length) {
      return fallbackCategories;
    }

    return data.map((category) => ({
      slug: category.slug,
      name: category.name,
      shortName: category.name.replace("Moda ", ""),
      image: category.image_url ?? fallbackCategories[0].image,
      description: category.description ?? "",
    }));
  } catch {
    return fallbackCategories;
  }
}

export async function getPublicProducts(): Promise<Product[]> {
  if (!hasSupabaseEnv()) {
    return fallbackProducts;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,slug,short_description,description,price,previous_price,discount_percent,sku,inventory_total,is_featured,is_new,is_promo,tags,collection,categories(slug,name),product_images(public_url,alt,display_order,is_primary),product_variants(size,color,inventory)",
      )
      .eq("status", "active")
      .order("display_order", { ascending: true });

    if (error || !data?.length) {
      return fallbackProducts;
    }

    return (data as unknown as SupabaseProductRow[]).map(mapProductRow);
  } catch {
    return fallbackProducts;
  }
}

export async function getPublicProduct(slug: string) {
  const products = await getPublicProducts();
  return products.find((product) => product.slug === slug);
}

export async function getPublicProductsByCategory(slug: string) {
  const products = await getPublicProducts();
  return products.filter((product) => product.categorySlug === slug);
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
      tone: index === 0 ? "bg-[#ffea61] text-black" : index === 1 ? "bg-black text-white" : "bg-white text-black",
    }));
  } catch {
    return promos;
  }
}

function mapProductRow(row: SupabaseProductRow): Product {
  const sortedImages = [...(row.product_images ?? [])].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.display_order - b.display_order;
  });
  const imageUrls = sortedImages.map((image) => image.public_url);
  const variants = row.product_variants ?? [];
  const colors = Array.from(new Set(variants.map((variant) => variant.color).filter(Boolean)));
  const sizes = Array.from(new Set(variants.map((variant) => variant.size).filter(Boolean)));

  return {
    slug: row.slug,
    name: row.name,
    categorySlug: row.categories?.slug ?? "productos",
    categoryName: row.categories?.name ?? "Productos",
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
    description: row.description || row.short_description,
    details: row.tags?.length ? row.tags : ["Producto ATRES", "Disponible en tienda"],
    collection: row.collection || "ATRES",
  };
}
