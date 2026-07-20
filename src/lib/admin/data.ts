import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminBanner,
  AdminCategory,
  AdminProduct,
  AdminProductImage,
  AdminProductVariant,
  AdminPromotion,
  AdminShop,
  AdminShopMember,
  StoreSettings,
} from "@/lib/admin/types";
import type { AdminSession } from "@/lib/admin/auth";

export async function getAdminProducts(session?: AdminSession) {
  if (!hasSupabaseEnv()) return [] as AdminProduct[];
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (session && !session.isSuperAdmin && session.primaryShopId) {
    query = query.eq("shop_id", session.primaryShopId);
  }

  const { data } = await query;
  return (data ?? []) as AdminProduct[];
}

export async function getAdminProduct(id: string, session?: AdminSession) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("products").select("*").eq("id", id);
  if (session && !session.isSuperAdmin && session.primaryShopId) {
    query = query.eq("shop_id", session.primaryShopId);
  }
  const { data } = await query.single();
  return data as AdminProduct | null;
}

export async function getAdminProductImages(productId: string) {
  if (!hasSupabaseEnv()) return [] as AdminProductImage[];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });
  return (data ?? []) as AdminProductImage[];
}

export async function getAdminProductImagesByProductIds(productIds: string[]) {
  if (!hasSupabaseEnv() || !productIds.length) return [] as AdminProductImage[];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("product_images")
    .select("*")
    .in("product_id", productIds)
    .order("display_order", { ascending: true });
  return (data ?? []) as AdminProductImage[];
}

export async function getAdminProductVariants(productId: string) {
  if (!hasSupabaseEnv()) return [] as AdminProductVariant[];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("product_variants")
    .select("id,product_id,sku,size,color,inventory,price,status,created_at,updated_at")
    .eq("product_id", productId)
    .order("color", { ascending: true })
    .order("size", { ascending: true });
  return (data ?? []) as AdminProductVariant[];
}

export async function getAdminCategories() {
  if (!hasSupabaseEnv()) return [] as AdminCategory[];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });
  return (data ?? []) as AdminCategory[];
}

export async function getAdminBanners() {
  if (!hasSupabaseEnv()) return [] as AdminBanner[];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .order("display_order", { ascending: true });
  return (data ?? []) as AdminBanner[];
}

export async function getAdminPromotions() {
  if (!hasSupabaseEnv()) return [] as AdminPromotion[];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as AdminPromotion[];
}

export async function getStoreSettings() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("store_settings").select("*").eq("id", 1).single();
  return data as StoreSettings | null;
}

export async function getAdminShops() {
  if (!hasSupabaseEnv()) return [] as AdminShop[];
  const supabase = await createSupabaseServerClient();
  const [{ data: shops }, { data: products }] = await Promise.all([
    supabase.from("shops").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("shop_id"),
  ]);
  const counts = new Map<string, number>();
  for (const product of (products ?? []) as Array<{ shop_id: string | null }>) {
    if (!product.shop_id) continue;
    counts.set(product.shop_id, (counts.get(product.shop_id) ?? 0) + 1);
  }
  return ((shops ?? []) as AdminShop[]).map((shop) => ({
    ...shop,
    product_count: counts.get(shop.id) ?? 0,
  }));
}

export async function getAdminShop(id: string, session?: AdminSession) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("shops").select("*").eq("id", id);
  if (session && !session.isSuperAdmin && session.primaryShopId) {
    query = query.eq("id", session.primaryShopId);
  }
  const { data } = await query.maybeSingle();
  return data as AdminShop | null;
}

export async function getAdminShopMembers(shopId: string) {
  if (!hasSupabaseEnv()) return [] as AdminShopMember[];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("shop_members")
    .select("*")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: true });
  return (data ?? []) as AdminShopMember[];
}

export async function getPrimaryAdminShop(session: AdminSession) {
  if (!session.primaryShopId) return null;
  return getAdminShop(session.primaryShopId, session);
}
