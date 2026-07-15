import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminBanner,
  AdminCategory,
  AdminProduct,
  AdminProductImage,
  AdminPromotion,
  StoreSettings,
} from "@/lib/admin/types";

export async function getAdminProducts() {
  if (!hasSupabaseEnv()) return [] as AdminProduct[];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as AdminProduct[];
}

export async function getAdminProduct(id: string) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).single();
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
