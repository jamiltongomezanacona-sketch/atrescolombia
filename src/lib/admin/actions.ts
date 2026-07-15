"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  ok: boolean;
  message: string;
};

export type QuickProductImageInput = {
  storage_path: string;
  public_url: string;
  alt: string;
  aspect_ratio: string;
  display_order: number;
  is_primary: boolean;
};

export type QuickProductInput = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string;
  subcategory_id: string | null;
  price: number;
  previous_price: number | null;
  discount_percent: number | null;
  sku: string;
  inventory_total: number;
  status: "active" | "hidden";
  is_featured: boolean;
  is_new: boolean;
  is_promo: boolean;
  tags: string[];
  collection: string;
  display_order: number;
  primary_image_url: string;
  images: QuickProductImageInput[];
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

export async function createQuickProduct(input: QuickProductInput): Promise<ActionState & { productId?: string }> {
  const guard = ensureSupabase();
  if (guard) return guard;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const businessId = await resolveLegacyBusinessId();
  const corePayload = {
    id: input.id,
    name: input.name,
    slug: input.slug,
    category_id: input.category_id,
    price: input.price,
    previous_price: input.previous_price,
    discount_percent: input.discount_percent,
    sku: input.sku,
    inventory_total: input.inventory_total,
    status: input.status,
  };
  const textPayload = {
    ...corePayload,
    short_description: input.short_description || input.name,
    description: input.description || input.short_description || input.name,
  };
  const fullPayload = {
    ...textPayload,
    subcategory_id: input.subcategory_id,
    is_featured: input.is_featured,
    is_new: input.is_new,
    is_promo: input.is_promo,
    tags: input.tags,
    collection: input.collection,
    display_order: input.display_order,
    created_by: user?.id ?? null,
    updated_by: user?.id ?? null,
  };
  const imageFieldVariants = [
    { image_url: input.primary_image_url },
    { main_image_url: input.primary_image_url },
    { cover_image_url: input.primary_image_url },
    { featured_image_url: input.primary_image_url },
    { image_url: input.primary_image_url, main_image_url: input.primary_image_url },
  ];

  const variants = [
    fullPayload,
    textPayload,
    corePayload,
    businessId ? { ...textPayload, business_id: businessId } : null,
    businessId ? { ...corePayload, business_id: businessId } : null,
    ...imageFieldVariants.map((fields) => ({ ...textPayload, ...fields })),
    ...imageFieldVariants.map((fields) => ({ ...corePayload, ...fields })),
    ...(businessId ? imageFieldVariants.map((fields) => ({ ...textPayload, business_id: businessId, ...fields })) : []),
    ...(businessId ? imageFieldVariants.map((fields) => ({ ...corePayload, business_id: businessId, ...fields })) : []),
  ].filter(Boolean) as Array<Record<string, unknown>>;

  const errors: string[] = [];

  for (const payload of variants) {
    const { error } = await supabase.from("products").insert(payload).select("id").single();

    if (!error) {
      const imageResult = await insertQuickProductImages(input.id, input.images, user?.id ?? null);
      if (!imageResult.ok) {
        await supabase.from("products").delete().eq("id", input.id);
        return imageResult;
      }
      revalidateStore();
      revalidatePath("/admin");
      revalidatePath("/admin/productos");
      return { ok: true, message: "Producto guardado correctamente.", productId: input.id };
    }

    errors.push(error.message);
  }

  return {
    ok: false,
    message: `No se pudo crear el producto. Detalle: ${Array.from(new Set(errors)).slice(0, 3).join(" | ")}`,
  };
}

async function insertQuickProductImages(productId: string, images: QuickProductImageInput[], userId: string | null): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();

  for (const image of images) {
    const fullPayload = {
      product_id: productId,
      storage_path: image.storage_path,
      public_url: image.public_url,
      alt: image.alt,
      aspect_ratio: image.aspect_ratio,
      display_order: image.display_order,
      is_primary: image.is_primary,
      created_by: userId,
    };
    const compatiblePayload = {
      product_id: productId,
      storage_path: image.storage_path,
      public_url: image.public_url,
      alt: image.alt,
      aspect_ratio: image.aspect_ratio,
      display_order: image.display_order,
      is_primary: image.is_primary,
    };
    const legacyImagePayload = {
      product_id: productId,
      image_url: image.public_url,
      public_url: image.public_url,
      storage_path: image.storage_path,
      alt: image.alt,
      display_order: image.display_order,
      is_primary: image.is_primary,
    };

    const attempts: Array<Record<string, unknown>> = [fullPayload, compatiblePayload, legacyImagePayload];
    const errors: string[] = [];
    let inserted = false;

    for (const payload of attempts) {
      const { error } = await supabase.from("product_images").insert(payload);
      if (!error) {
        inserted = true;
        break;
      }
      errors.push(error.message);
    }

    if (!inserted) {
      return {
        ok: false,
        message: `Producto creado, pero fallo una imagen. Detalle: ${Array.from(new Set(errors)).slice(0, 2).join(" | ")}`,
      };
    }
  }

  return { ok: true, message: "Imagenes guardadas." };
}

async function resolveLegacyBusinessId() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,slug")
    .or("slug.ilike.%atres%,name.ilike.%atres%")
    .limit(1)
    .maybeSingle();

  if (!error && data?.id) return data.id as string;

  const { data: fallbackData } = await supabase.from("businesses").select("id").limit(1).maybeSingle();
  return fallbackData?.id ? (fallbackData.id as string) : null;
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
