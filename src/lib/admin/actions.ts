"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  ok: boolean;
  message: string;
};

export async function signInAdmin(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY." };
  }

  const email = stringValue(formData, "email");
  const password = stringValue(formData, "password");

  if (!email || !password) {
    return { ok: false, message: "Correo y contrasena son obligatorios." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: error.message };
  }

  redirect("/admin");
}

export async function signOutAdmin() {
  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/admin/login");
}

export async function saveProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  const guard = ensureSupabase();
  if (guard) return guard;

  const id = stringValue(formData, "id");
  const slug = slugify(stringValue(formData, "slug") || stringValue(formData, "name"));
  const name = stringValue(formData, "name");
  const sku = stringValue(formData, "sku");
  const price = numberValue(formData, "price");
  const categoryId = stringValue(formData, "category_id") || null;

  if (!name || !slug || !sku || price < 0) {
    return { ok: false, message: "Nombre, slug, SKU y precio valido son obligatorios." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const payload = {
    name,
    slug,
    short_description: stringValue(formData, "short_description"),
    description: stringValue(formData, "description"),
    category_id: categoryId,
    subcategory_id: stringValue(formData, "subcategory_id") || null,
    price,
    previous_price: nullableNumberValue(formData, "previous_price"),
    discount_percent: nullableNumberValue(formData, "discount_percent"),
    sku,
    inventory_total: numberValue(formData, "inventory_total"),
    status: stringValue(formData, "status") || "hidden",
    is_featured: checkboxValue(formData, "is_featured"),
    is_new: checkboxValue(formData, "is_new"),
    is_promo: checkboxValue(formData, "is_promo"),
    tags: listValue(formData, "tags"),
    collection: stringValue(formData, "collection"),
    display_order: numberValue(formData, "display_order"),
    updated_by: user?.id ?? null,
  };

  const result = id
    ? await supabase.from("products").update(payload).eq("id", id).select("id").single()
    : await supabase.from("products").insert({ ...payload, created_by: user?.id ?? null }).select("id").single();

  if (result.error) {
    return { ok: false, message: result.error.message };
  }

  revalidateStore();
  redirect(`/admin/productos/${result.data.id}/editar?guardado=1`);
}

export async function revalidateProductAdminChanges() {
  revalidateStore();
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
}

export async function setProductStatus(productId: string, status: "active" | "hidden" | "archived") {
  const guard = ensureSupabase();
  if (guard) return guard;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").update({ status }).eq("id", productId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateStore();
  return { ok: true, message: "Estado actualizado." };
}

export async function duplicateProduct(productId: string) {
  const guard = ensureSupabase();
  if (guard) return guard;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();
  if (error || !data) return { ok: false, message: error?.message ?? "Producto no encontrado." };

  const copy = {
    ...data,
    id: undefined,
    name: `${data.name} copia`,
    slug: `${data.slug}-copia-${Date.now()}`,
    sku: `${data.sku}-COPY-${Date.now()}`,
    status: "hidden",
    created_at: undefined,
    updated_at: undefined,
  };
  const { error: insertError } = await supabase.from("products").insert(copy);
  if (insertError) return { ok: false, message: insertError.message };
  revalidateStore();
  return { ok: true, message: "Producto duplicado." };
}

export async function saveCategory(_: ActionState, formData: FormData): Promise<ActionState> {
  const guard = ensureSupabase();
  if (guard) return guard;

  const id = stringValue(formData, "id");
  const name = stringValue(formData, "name");
  const slug = slugify(stringValue(formData, "slug") || name);
  if (!name || !slug) return { ok: false, message: "Nombre y slug son obligatorios." };

  const supabase = await createSupabaseServerClient();
  const payload = {
    parent_id: stringValue(formData, "parent_id") || null,
    name,
    slug,
    description: stringValue(formData, "description"),
    image_url: stringValue(formData, "image_url") || null,
    status: stringValue(formData, "status") || "active",
    display_order: numberValue(formData, "display_order"),
  };
  const result = id
    ? await supabase.from("categories").update(payload).eq("id", id)
    : await supabase.from("categories").insert(payload);

  if (result.error) return { ok: false, message: result.error.message };
  revalidateStore();
  return { ok: true, message: "Categoria guardada." };
}

export async function archiveCategory(categoryId: string) {
  const guard = ensureSupabase();
  if (guard) return guard;
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", categoryId);
  if (count && count > 0) {
    return { ok: false, message: "No se puede ocultar sin revisar productos asociados." };
  }
  const { error } = await supabase.from("categories").update({ status: "archived" }).eq("id", categoryId);
  if (error) return { ok: false, message: error.message };
  revalidateStore();
  return { ok: true, message: "Categoria archivada." };
}

export async function saveBanner(_: ActionState, formData: FormData): Promise<ActionState> {
  const guard = ensureSupabase();
  if (guard) return guard;
  const id = stringValue(formData, "id");
  const title = stringValue(formData, "title");
  if (!title) return { ok: false, message: "Titulo obligatorio." };
  const supabase = await createSupabaseServerClient();
  const payload = {
    title,
    subtitle: stringValue(formData, "subtitle"),
    button_text: stringValue(formData, "button_text"),
    link_url: stringValue(formData, "link_url") || "/productos",
    desktop_image_url: stringValue(formData, "desktop_image_url") || null,
    mobile_image_url: stringValue(formData, "mobile_image_url") || null,
    start_at: stringValue(formData, "start_at") || null,
    end_at: stringValue(formData, "end_at") || null,
    status: stringValue(formData, "status") || "hidden",
    position: stringValue(formData, "position") || "home_hero",
    display_order: numberValue(formData, "display_order"),
  };
  const result = id
    ? await supabase.from("banners").update(payload).eq("id", id)
    : await supabase.from("banners").insert(payload);
  if (result.error) return { ok: false, message: result.error.message };
  revalidatePath("/");
  return { ok: true, message: "Banner guardado." };
}

export async function savePromotion(_: ActionState, formData: FormData): Promise<ActionState> {
  const guard = ensureSupabase();
  if (guard) return guard;
  const id = stringValue(formData, "id");
  const name = stringValue(formData, "name");
  const slug = slugify(stringValue(formData, "slug") || name);
  if (!name || !slug) return { ok: false, message: "Nombre y slug son obligatorios." };
  const supabase = await createSupabaseServerClient();
  const payload = {
    name,
    slug,
    description: stringValue(formData, "description"),
    discount_type: stringValue(formData, "discount_type") || "percent",
    discount_value: numberValue(formData, "discount_value"),
    start_at: stringValue(formData, "start_at") || null,
    end_at: stringValue(formData, "end_at") || null,
    status: stringValue(formData, "status") || "hidden",
  };
  const result = id
    ? await supabase.from("promotions").update(payload).eq("id", id)
    : await supabase.from("promotions").insert(payload);
  if (result.error) return { ok: false, message: result.error.message };
  revalidatePath("/ofertas");
  return { ok: true, message: "Promocion guardada." };
}

export async function saveSettings(_: ActionState, formData: FormData): Promise<ActionState> {
  const guard = ensureSupabase();
  if (guard) return guard;
  const supabase = await createSupabaseServerClient();
  const payload = {
    store_name: stringValue(formData, "store_name") || "ATRES",
    logo_url: stringValue(formData, "logo_url") || null,
    favicon_url: stringValue(formData, "favicon_url") || null,
    hero_banner_url: stringValue(formData, "hero_banner_url") || null,
    whatsapp: stringValue(formData, "whatsapp"),
    email: stringValue(formData, "email"),
    instagram: stringValue(formData, "instagram"),
    tiktok: stringValue(formData, "tiktok"),
    address: stringValue(formData, "address"),
    shipping_text: stringValue(formData, "shipping_text"),
    policies: stringValue(formData, "policies"),
    promo_message: stringValue(formData, "promo_message"),
  };
  const { error } = await supabase.from("store_settings").upsert({ id: 1, ...payload });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/");
  return { ok: true, message: "Configuracion guardada." };
}

function ensureSupabase() {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Supabase no esta configurado." };
  }
  return null;
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(formData: FormData, key: string) {
  const value = Number(stringValue(formData, key));
  return Number.isFinite(value) ? value : 0;
}

function nullableNumberValue(formData: FormData, key: string) {
  const raw = stringValue(formData, key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function checkboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function listValue(formData: FormData, key: string) {
  return stringValue(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function revalidateStore() {
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/ofertas");
  revalidatePath("/novedades");
}
