"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getAdminSession, requireAdmin, requireSuperAdmin } from "@/lib/admin/auth";
import {
  createSupabaseServiceRoleClient,
  getSupabaseEnv,
  hasSupabaseEnv,
  hasSupabaseServiceRoleEnv,
} from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductVariantStatus } from "@/lib/admin/types";
import { isValidLatitude, isValidLongitude } from "@/lib/geo";

const DEFAULT_SHOP_SLUGS = ["atres-kinds", "atres-kids"] as const;

type ActionState = {
  ok: boolean;
  message: string;
};

type ImageUrlValueResult =
  | {
      ok: true;
      message: string;
      value: string | null;
    }
  | {
      ok: false;
      message: string;
    };

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const MAX_QUICK_PRODUCT_IMAGE_BYTES = 900 * 1024;
const MAX_IMAGE_URL_LENGTH = 1000;
const ALLOWED_QUICK_PRODUCT_IMAGE_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);
const BLOCKED_IMAGE_URL_PREFIXES = ["data:", "blob:", "file:", "javascript:", "vbscript:"];
const PRODUCT_VARIANT_STATUSES: ProductVariantStatus[] = ["available", "sold_out", "hidden", "coming_soon"];

export type QuickProductImageInput = {
  storage_path: string;
  public_url: string;
  alt: string;
  aspect_ratio: string;
  display_order: number;
  is_primary: boolean;
};

export type ProductVariantInput = {
  id?: string;
  sku: string;
  size: string;
  color: string;
  inventory: number;
  price: number | null;
  status: ProductVariantStatus;
};

export type QuickProductInput = {
  id: string;
  shop_id?: string | null;
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
  variants?: ProductVariantInput[];
};

export async function saveShop(_: ActionState, formData: FormData): Promise<ActionState> {
  const guard = ensureSupabase();
  if (guard) return guard;

  const session = await getAdminSession();
  if (!session.isAdmin) return { ok: false, message: "No tienes permisos para administrar tiendas." };

  const id = stringValue(formData, "id");
  if (!session.isSuperAdmin && id !== session.primaryShopId) {
    return { ok: false, message: "Solo puedes editar los datos de tu tienda." };
  }

  if (!id && !session.isSuperAdmin) {
    return { ok: false, message: "Solo el superadmin puede crear tiendas." };
  }

  const name = stringValue(formData, "name");
  const slug = slugify(stringValue(formData, "slug") || name);
  if (!name || !slug) {
    return { ok: false, message: "Nombre y slug son obligatorios." };
  }

  const whatsapp = stringValue(formData, "whatsapp");
  if (whatsapp && !isValidWhatsapp(whatsapp)) {
    return { ok: false, message: "WhatsApp invalido. Usa solo digitos (minimo 10)." };
  }

  const location = parseShopLocationFromForm(formData);
  if (!location.ok || !location.data) {
    return { ok: false, message: location.message || "Error al validar la ubicacion." };
  }
  const locationData = location.data;

  const adminEmail = stringValue(formData, "admin_email").toLowerCase();
  const adminPassword = stringValue(formData, "admin_password");
  const adminName = stringValue(formData, "admin_name") || name;

  if (!id) {
    if (!adminEmail || !adminPassword) {
      return { ok: false, message: "Correo y contrasena del administrador son obligatorios al crear una tienda." };
    }
    if (!isValidEmail(adminEmail)) {
      return { ok: false, message: "Correo del administrador invalido." };
    }
    if (adminPassword.length < 8) {
      return { ok: false, message: "La contrasena del administrador debe tener al menos 8 caracteres." };
    }
    if (!hasSupabaseServiceRoleEnv()) {
      return {
        ok: false,
        message: "Configura SUPABASE_SERVICE_ROLE_KEY en el servidor para crear administradores de tienda.",
      };
    }
  }

  const supabase = await createSupabaseServerClient();

  const { data: slugOwner } = await supabase.from("shops").select("id").eq("slug", slug).maybeSingle();
  if (slugOwner?.id && slugOwner.id !== id) {
    return { ok: false, message: "El slug ya esta en uso por otra tienda." };
  }

  const basePayload = {
    name,
    title: stringValue(formData, "title") || name,
    slug,
    short_description: stringValue(formData, "short_description"),
    description: stringValue(formData, "description"),
    city: locationData.city,
    country: locationData.country,
    department: locationData.department,
    locality: locationData.locality,
    neighborhood: locationData.neighborhood,
    address: locationData.address,
    address_reference: locationData.address_reference,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    maps_url: locationData.maps_url,
    postal_code: locationData.postal_code,
    delivery_radius_km: locationData.delivery_radius_km,
    pickup_enabled: locationData.pickup_enabled,
    local_delivery_enabled: locationData.local_delivery_enabled,
    location_verified: locationData.location_verified,
    whatsapp,
    email: stringValue(formData, "email") || adminEmail,
    logo_url: nullableStringValue(formData, "logo_url"),
    cover_url: nullableStringValue(formData, "cover_url"),
    show_on_home: checkboxValue(formData, "show_on_home"),
    allow_promotions: checkboxValue(formData, "allow_promotions"),
    updated_by: session.user?.id ?? null,
  };

  const payload = session.isSuperAdmin
    ? {
        ...basePayload,
        verified: checkboxValue(formData, "verified"),
        status: stringValue(formData, "status") || "active",
        max_products: Math.max(0, numberValue(formData, "max_products") || 200),
        max_images: Math.max(1, numberValue(formData, "max_images") || 10),
      }
    : basePayload;

  const result = id
    ? await supabase.from("shops").update(payload).eq("id", id).select("id").single()
    : await supabase.from("shops").insert({ ...payload, created_by: session.user?.id ?? null }).select("id").single();

  if (result.error || !result.data?.id) {
    return { ok: false, message: result.error?.message ?? "No se pudo guardar la tienda." };
  }

  const shopId = result.data.id as string;

  if (!id) {
    const adminResult = await createShopAdmin(shopId, adminEmail, adminPassword, adminName);
    if (!adminResult.ok) {
      await supabase.from("shops").delete().eq("id", shopId);
      return {
        ok: false,
        message: `No se creo la tienda: fallo al crear el administrador. ${adminResult.message}`,
      };
    }
  }

  const brandUpdates: { logo_url?: string; cover_url?: string } = {};
  const logoUpload = await uploadShopBrandFileFromForm(formData, "logo_file", shopId, "logo");
  if (!logoUpload.ok) {
    return { ok: false, message: logoUpload.message };
  }
  if (logoUpload.publicUrl) brandUpdates.logo_url = logoUpload.publicUrl;

  const coverUpload = await uploadShopBrandFileFromForm(formData, "cover_file", shopId, "cover");
  if (!coverUpload.ok) {
    return { ok: false, message: coverUpload.message };
  }
  if (coverUpload.publicUrl) brandUpdates.cover_url = coverUpload.publicUrl;

  if (Object.keys(brandUpdates).length) {
    const { error: brandError } = await supabase.from("shops").update(brandUpdates).eq("id", shopId);
    if (brandError) {
      return {
        ok: false,
        message: `Tienda guardada, pero fallaron las imagenes: ${brandError.message}`,
      };
    }
  }

  revalidatePath("/admin/tiendas");
  revalidatePath(`/admin/tiendas/${shopId}/editar`);
  revalidatePath("/tiendas");
  revalidatePath(`/tiendas/[slug]`, "page");
  if (session.isSuperAdmin && !id) {
    redirect(`/admin/tiendas/${shopId}/editar?guardado=1`);
  }

  return { ok: true, message: id ? "Tienda actualizada." : "Tienda y administrador creados correctamente." };
}

export async function setShopStatus(shopId: string, status: "active" | "suspended" | "archived") {
  const guard = ensureSupabase();
  if (guard) return guard;
  const session = await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("shops")
    .update({ status, updated_by: session.user?.id ?? null })
    .eq("id", shopId);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/tiendas");
  revalidateStore();
  return { ok: true, message: "Estado de tienda actualizado." };
}

export async function sendShopAdminPasswordReset(shopId: string) {
  const guard = ensureSupabase();
  if (guard) return guard;
  await requireSuperAdmin();

  const supabase = await createSupabaseServerClient();
  const { data: members, error: membersError } = await supabase
    .from("shop_members")
    .select("user_id")
    .eq("shop_id", shopId)
    .eq("status", "active")
    .eq("role", "shop_admin");

  if (membersError) return { ok: false, message: membersError.message };

  const userIds = (members ?? []).map((member) => member.user_id).filter(Boolean);
  if (!userIds.length) {
    return { ok: false, message: "La tienda no tiene un administrador activo vinculado." };
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("email")
    .in("id", userIds);

  if (profilesError) return { ok: false, message: profilesError.message };

  const emails = Array.from(
    new Set(
      (profiles ?? [])
        .map((profile) => (typeof profile.email === "string" ? profile.email.trim().toLowerCase() : ""))
        .filter(Boolean),
    ),
  );

  if (!emails.length) {
    return { ok: false, message: "No se encontro correo del administrador de la tienda." };
  }

  const authClient = createIsolatedAuthClient();
  const errors: string[] = [];
  for (const email of emails) {
    const { error } = await authClient.auth.resetPasswordForEmail(email);
    if (error) errors.push(`${email}: ${error.message}`);
  }

  if (errors.length === emails.length) {
    return { ok: false, message: errors.join(" | ") };
  }

  return {
    ok: true,
    message: `Correo de restablecimiento enviado a ${emails.length} administrador(es).`,
  };
}

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

  const session = await getAdminSession();
  if (!session.isAdmin) {
    await supabase.auth.signOut();
    return { ok: false, message: "Tu cuenta no tiene permisos de administracion." };
  }

  redirect(session.isSuperAdmin ? "/admin" : "/admin/productos");
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

  const session = await requireAdmin();
  const id = stringValue(formData, "id");
  if (id) {
    const access = await assertCanManageProduct(id);
    if (!access.ok) return access;
  }

  const slug = slugify(stringValue(formData, "slug") || stringValue(formData, "name"));
  const name = stringValue(formData, "name");
  const sku = stringValue(formData, "sku");
  const price = numberValue(formData, "price");
  const categoryId = stringValue(formData, "category_id") || null;
  const subcategoryId = stringValue(formData, "subcategory_id") || null;

  if (!name || !slug || !sku || price < 0) {
    return { ok: false, message: "Nombre, slug, SKU y precio valido son obligatorios." };
  }

  const supabase = await createSupabaseServerClient();
  const user = session.user;
  const categoryError = await validateCategorySelection(supabase, categoryId, subcategoryId);
  if (categoryError) return categoryError;
  const shopId = await resolveAdminShopIdForWrite(null);
  if (!id && !shopId) {
    return {
      ok: false,
      message: "No se pudo asignar la tienda del producto. Verifica membresia o la tienda ATRES KINDS.",
    };
  }

  const payload = {
    name,
    slug,
    short_description: stringValue(formData, "short_description"),
    description: stringValue(formData, "description"),
    category_id: categoryId,
    subcategory_id: subcategoryId,
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
    ...(!id && shopId ? { shop_id: shopId } : {}),
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
  await requireAdmin();
  revalidateStore();
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
}

export async function uploadQuickProductImage(
  formData: FormData,
): Promise<ActionState & { image?: QuickProductImageInput }> {
  const guard = ensureSupabase();
  if (guard) return guard;
  await requireAdmin();

  const productId = stringValue(formData, "productId");
  const fileName = stringValue(formData, "fileName") || "producto.webp";
  const displayOrder = Math.max(1, numberValue(formData, "displayOrder"));
  const isPrimary = stringValue(formData, "isPrimary") === "true";
  const file = formData.get("file");

  if (!productId || !(file instanceof File)) {
    return { ok: false, message: "No se recibio la imagen para subir." };
  }

  if (!ALLOWED_QUICK_PRODUCT_IMAGE_TYPES.has(file.type)) {
    return { ok: false, message: "Solo se permiten imagenes WebP, JPG o PNG." };
  }

  if (file.size > MAX_QUICK_PRODUCT_IMAGE_BYTES) {
    return {
      ok: false,
      message: "La imagen optimizada supera 900KB. Reduce la foto antes de subirla para proteger el almacenamiento.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const shopId = await resolveAdminShopIdForWrite(null);
  const storagePath = shopId
    ? `products/${shopId}/${productId}/${crypto.randomUUID()}.webp`
    : `products/${productId}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(storagePath, file, { contentType: file.type || "image/webp", upsert: false });

  if (error) {
    return {
      ok: false,
      message: `No se pudo subir la imagen a Supabase Storage. Revisa que exista el bucket product-images y sus politicas. Detalle: ${error.message}`,
    };
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(storagePath);
  return {
    ok: true,
    message: "Imagen subida.",
    image: {
      storage_path: storagePath,
      public_url: data.publicUrl,
      alt: fileName,
      aspect_ratio: "3:4",
      display_order: displayOrder,
      is_primary: isPrimary,
    },
  };
}

export async function uploadShopBrandImage(
  formData: FormData,
): Promise<ActionState & { publicUrl?: string }> {
  const guard = ensureSupabase();
  if (guard) return guard;

  await requireAdmin();
  const shopId = stringValue(formData, "shopId");
  const kind = stringValue(formData, "kind");
  const file = formData.get("file");

  if (!shopId) {
    return { ok: false, message: "Guarda la tienda primero para subir imagenes." };
  }

  if (kind !== "logo" && kind !== "cover") {
    return { ok: false, message: "Tipo de imagen invalido." };
  }

  if (!(file instanceof File)) {
    return { ok: false, message: "No se recibio la imagen para subir." };
  }

  if (!ALLOWED_QUICK_PRODUCT_IMAGE_TYPES.has(file.type)) {
    return { ok: false, message: "Solo se permiten imagenes WebP, JPG o PNG." };
  }

  if (file.size > MAX_QUICK_PRODUCT_IMAGE_BYTES) {
    return {
      ok: false,
      message: "La imagen optimizada supera 900KB. Reduce la foto antes de subirla.",
    };
  }

  const access = await assertCanManageShop(shopId);
  if (!access.ok) return access;

  const supabase = await createSupabaseServerClient();
  const storagePath = `shops/${shopId}/${kind}-${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(storagePath, file, { contentType: file.type || "image/webp", upsert: false });

  if (error) {
    return {
      ok: false,
      message: `No se pudo subir la imagen. Detalle: ${error.message}`,
    };
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(storagePath);
  revalidatePath("/admin/tiendas");
  revalidatePath(`/admin/tiendas/${shopId}/editar`);
  revalidatePath("/tiendas");
  revalidatePath(`/tiendas/[slug]`, "page");

  return {
    ok: true,
    message: kind === "logo" ? "Logo subido." : "Portada subida.",
    publicUrl: data.publicUrl,
  };
}

async function uploadShopBrandFileFromForm(
  formData: FormData,
  fieldName: string,
  shopId: string,
  kind: "logo" | "cover",
): Promise<ActionState & { publicUrl?: string }> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size <= 0) {
    return { ok: true, message: "" };
  }

  if (!ALLOWED_QUICK_PRODUCT_IMAGE_TYPES.has(file.type)) {
    return { ok: false, message: `La imagen de ${kind} debe ser WebP, JPG o PNG.` };
  }

  if (file.size > MAX_QUICK_PRODUCT_IMAGE_BYTES) {
    return {
      ok: false,
      message: `La imagen de ${kind} supera 900KB. Reduce la foto antes de subirla.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const storagePath = `shops/${shopId}/${kind}-${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(storagePath, file, { contentType: file.type || "image/webp", upsert: false });

  if (error) {
    return { ok: false, message: `No se pudo subir ${kind}: ${error.message}` };
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(storagePath);
  return { ok: true, message: "", publicUrl: data.publicUrl };
}

export async function cleanupQuickProductUploads(paths: string[]): Promise<ActionState> {
  const guard = ensureSupabase();
  if (guard) return guard;
  await requireAdmin();
  if (!paths.length) return { ok: true, message: "Sin imagenes temporales." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage.from("product-images").remove(paths);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Imagenes temporales eliminadas." };
}

export async function createQuickProduct(input: QuickProductInput): Promise<ActionState & { productId?: string }> {
  const guard = ensureSupabase();
  if (guard) return guard;

  const session = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const user = session.user;
  const categoryError = await validateCategorySelection(supabase, input.category_id, input.subcategory_id);
  if (categoryError) return categoryError;

  const businessId = await resolveLegacyBusinessId();
  const shopId = await resolveAdminShopIdForWrite(input.shop_id ?? null);
  if (!shopId) {
    return {
      ok: false,
      message: "No se pudo asignar la tienda del producto. Verifica membresia o la tienda ATRES KINDS.",
    };
  }
  const normalizedVariants = normalizeProductVariants(input.variants ?? []);
  const inventoryTotal = normalizedVariants.length ? sumVariantInventory(normalizedVariants) : input.inventory_total;
  const corePayload = {
    id: input.id,
    name: input.name,
    slug: input.slug,
    category_id: input.category_id,
    price: input.price,
    previous_price: input.previous_price,
    discount_percent: input.discount_percent,
    sku: input.sku,
    inventory_total: inventoryTotal,
    status: input.status,
    shop_id: shopId,
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

  const payloadAttempts = [
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

  for (const payload of payloadAttempts) {
    const { error } = await supabase.from("products").insert(payload).select("id").single();

    if (!error) {
      const imageResult = await insertQuickProductImages(input.id, input.images, user?.id ?? null);
      if (!imageResult.ok) {
        await supabase.from("products").delete().eq("id", input.id);
        return imageResult;
      }
      if (normalizedVariants.length) {
        const variantsResult = await replaceProductVariants(input.id, normalizedVariants);
        if (!variantsResult.ok) {
          await supabase.from("products").delete().eq("id", input.id);
          return variantsResult;
        }
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
    const attempts: Array<Record<string, unknown>> = [fullPayload, compatiblePayload];
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

export async function saveProductVariants(productId: string, variants: ProductVariantInput[]): Promise<ActionState> {
  const guard = ensureSupabase();
  if (guard) return guard;

  if (!productId) {
    return { ok: false, message: "Producto no encontrado para guardar variantes." };
  }

  const access = await assertCanManageProduct(productId);
  if (!access.ok) return access;

  const normalizedVariants = normalizeProductVariants(variants);
  if (!normalizedVariants.length) {
    return { ok: false, message: "Activa variantes y genera al menos una combinacion antes de guardar." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const replaceResult = await replaceProductVariants(productId, normalizedVariants);
  if (!replaceResult.ok) return replaceResult;

  const { error } = await supabase
    .from("products")
    .update({ inventory_total: sumVariantInventory(normalizedVariants), updated_by: user?.id ?? null })
    .eq("id", productId);

  if (error) {
    return { ok: false, message: `Variantes guardadas, pero no se pudo actualizar inventario total. Detalle: ${error.message}` };
  }

  revalidateStore();
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/editar`);
  return { ok: true, message: "Variantes guardadas correctamente." };
}

async function replaceProductVariants(productId: string, variants: ProductVariantInput[]): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();
  const normalizedVariants = normalizeProductVariants(variants);
  const { error: deleteError } = await supabase.from("product_variants").delete().eq("product_id", productId);

  if (deleteError) {
    return { ok: false, message: `No se pudieron reemplazar variantes. Tabla: product_variants. Detalle: ${deleteError.message}` };
  }

  if (!normalizedVariants.length) {
    return { ok: true, message: "Sin variantes para guardar." };
  }

  const payload = normalizedVariants.map((variant) => ({
    product_id: productId,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    inventory: variant.inventory,
    price: variant.price,
    status: variant.status,
  }));
  const { error } = await supabase.from("product_variants").insert(payload);

  if (error) {
    const sample = payload[0];
    return {
      ok: false,
      message: `No se pudieron guardar variantes. Tabla: product_variants. Columnas: product_id, sku, size, color, inventory, price, status. Registro: ${sample.sku} ${sample.color}/${sample.size}. Detalle: ${error.message}. Sugerencia: ejecuta la migracion 0003_product_variants_admin.sql en Supabase.`,
    };
  }

  return { ok: true, message: "Variantes guardadas." };
}

function normalizeProductVariants(variants: ProductVariantInput[]) {
  const seen = new Set<string>();
  const normalized: ProductVariantInput[] = [];

  for (const variant of variants) {
    const color = variant.color.trim();
    const size = variant.size.trim();
    if (!color || !size) continue;

    const key = `${color.toLowerCase()}::${size.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const inventory = Number.isFinite(Number(variant.inventory)) ? Math.max(0, Math.round(Number(variant.inventory))) : 0;
    const price = variant.price === null || variant.price === undefined || Number(variant.price) <= 0
      ? null
      : Math.round(Number(variant.price));
    const status = PRODUCT_VARIANT_STATUSES.includes(variant.status) ? variant.status : "available";
    const sku = variant.sku.trim() || `ATRES-${color}-${size}`.replace(/\s+/g, "-").toUpperCase();

    normalized.push({ sku, size, color, inventory, price, status });
  }

  return normalized;
}

function sumVariantInventory(variants: ProductVariantInput[]) {
  return variants.reduce((total, variant) => total + Math.max(0, Math.round(Number(variant.inventory) || 0)), 0);
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

  const access = await assertCanManageProduct(productId);
  if (!access.ok) return access;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").update({ status }).eq("id", productId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateStore();
  return { ok: true, message: "Estado actualizado." };
}

/** Hard-delete only archived products (DB row + storage images). Cascades variants/images. */
export async function deleteArchivedProduct(productId: string): Promise<ActionState> {
  const guard = ensureSupabase();
  if (guard) return guard;

  const access = await assertCanManageProduct(productId);
  if (!access.ok) return access;

  const supabase = await createSupabaseServerClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, status, name")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    return { ok: false, message: productError.message };
  }
  if (!product) {
    return { ok: false, message: "Producto no encontrado." };
  }
  if (product.status !== "archived") {
    return {
      ok: false,
      message: "Solo se pueden eliminar productos archivados. Archivalo primero.",
    };
  }

  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId);

  if (imagesError) {
    return { ok: false, message: imagesError.message };
  }

  const storagePaths = (images ?? [])
    .map((image) => (typeof image.storage_path === "string" ? image.storage_path.trim() : ""))
    .filter((path) => path.length > 0 && !/^https?:\/\//i.test(path));

  if (storagePaths.length) {
    const { error: storageError } = await supabase.storage.from("product-images").remove(storagePaths);
    if (storageError) {
      return {
        ok: false,
        message: `No se pudieron borrar las imagenes del storage. Detalle: ${storageError.message}`,
      };
    }
  }

  const { error: deleteError } = await supabase.from("products").delete().eq("id", productId);
  if (deleteError) {
    return { ok: false, message: deleteError.message };
  }

  revalidateStore();
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  return {
    ok: true,
    message: `Producto eliminado de la base de datos${product.name ? `: ${product.name}` : "."}`,
  };
}

export async function duplicateProduct(productId: string) {
  const guard = ensureSupabase();
  if (guard) return guard;

  const access = await assertCanManageProduct(productId);
  if (!access.ok) return access;

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
  await requireSuperAdmin();

  const id = stringValue(formData, "id");
  const name = stringValue(formData, "name");
  const slug = slugify(stringValue(formData, "slug") || name);
  const imageUrl = imageUrlValue(formData, "image_url", "Imagen URL");
  if (!name || !slug) return { ok: false, message: "Nombre y slug son obligatorios." };
  if (!imageUrl.ok) return imageUrl;

  const supabase = await createSupabaseServerClient();
  const payload = {
    parent_id: stringValue(formData, "parent_id") || null,
    name,
    slug,
    description: stringValue(formData, "description"),
    image_url: imageUrl.value,
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
  await requireSuperAdmin();
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
  await requireSuperAdmin();
  const id = stringValue(formData, "id");
  const title = stringValue(formData, "title");
  const desktopImageUrl = imageUrlValue(formData, "desktop_image_url", "Imagen escritorio URL");
  const mobileImageUrl = imageUrlValue(formData, "mobile_image_url", "Imagen movil URL");
  if (!title) return { ok: false, message: "Titulo obligatorio." };
  if (!desktopImageUrl.ok) return desktopImageUrl;
  if (!mobileImageUrl.ok) return mobileImageUrl;
  const supabase = await createSupabaseServerClient();
  const payload = {
    title,
    subtitle: stringValue(formData, "subtitle"),
    button_text: stringValue(formData, "button_text"),
    link_url: stringValue(formData, "link_url") || "/productos",
    desktop_image_url: desktopImageUrl.value,
    mobile_image_url: mobileImageUrl.value,
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
  await requireSuperAdmin();
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
  await requireSuperAdmin();
  const logoUrl = imageUrlValue(formData, "logo_url", "Logo URL");
  const faviconUrl = imageUrlValue(formData, "favicon_url", "Favicon URL");
  const heroBannerUrl = imageUrlValue(formData, "hero_banner_url", "Banner principal URL");
  if (!logoUrl.ok) return logoUrl;
  if (!faviconUrl.ok) return faviconUrl;
  if (!heroBannerUrl.ok) return heroBannerUrl;
  const supabase = await createSupabaseServerClient();
  const payload = {
    store_name: stringValue(formData, "store_name") || "ATRES",
    logo_url: logoUrl.value,
    favicon_url: faviconUrl.value,
    hero_banner_url: heroBannerUrl.value,
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

async function createShopAdmin(shopId: string, email: string, password: string, name: string): Promise<ActionState> {
  try {
    if (!hasSupabaseServiceRoleEnv()) {
      return {
        ok: false,
        message: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.",
      };
    }

    const service = createSupabaseServiceRoleClient();
    const { data, error } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: "shop_admin",
      },
    });

    if (error || !data.user?.id) {
      return {
        ok: false,
        message:
          error?.message ??
          "No se pudo crear el usuario. Si el correo ya existe, usa otro o vincula la membresia manualmente.",
      };
    }

    const userId = data.user.id;
    const { error: profileError } = await service.from("profiles").upsert({
      id: userId,
      email,
      role: "shop_admin",
    });

    if (profileError) {
      await service.auth.admin.deleteUser(userId);
      return { ok: false, message: profileError.message };
    }

    const { error: memberError } = await service.from("shop_members").upsert(
      {
        shop_id: shopId,
        user_id: userId,
        role: "shop_admin",
        status: "active",
      },
      { onConflict: "shop_id,user_id" },
    );

    if (memberError) {
      await service.auth.admin.deleteUser(userId);
      return { ok: false, message: memberError.message };
    }

    return { ok: true, message: "Administrador creado." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo crear el administrador.",
    };
  }
}

function createIsolatedAuthClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function resolveAdminShopIdForWrite(requestedShopId: string | null) {
  const session = await getAdminSession();
  if (!session.isAdmin) return null;

  if (!session.isSuperAdmin) {
    return session.primaryShopId;
  }

  if (requestedShopId) {
    if (session.isSuperAdmin) return requestedShopId;
    return session.shopIds.includes(requestedShopId) ? requestedShopId : null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    for (const slug of DEFAULT_SHOP_SLUGS) {
      const { data } = await supabase.from("shops").select("id").eq("slug", slug).maybeSingle();
      if (typeof data?.id === "string") return data.id;
    }
    return null;
  } catch {
    return null;
  }
}

async function assertCanManageShop(shopId: string): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session.isAdmin) {
    return { ok: false, message: "No tienes permisos de administracion." };
  }
  if (session.isSuperAdmin) {
    return { ok: true, message: "ok" };
  }
  if (session.shopIds.includes(shopId) || session.primaryShopId === shopId) {
    return { ok: true, message: "ok" };
  }
  return { ok: false, message: "Solo puedes subir imagenes de tu tienda." };
}

async function assertCanManageProduct(productId: string): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session.isAdmin) {
    return { ok: false, message: "No tienes permisos de administracion." };
  }
  if (session.isSuperAdmin) {
    return { ok: true, message: "ok" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("products").select("shop_id").eq("id", productId).maybeSingle();
  if (error) return { ok: false, message: error.message };
  if (!data) return { ok: false, message: "Producto no encontrado." };
  if (!session.primaryShopId || data.shop_id !== session.primaryShopId) {
    return { ok: false, message: "No puedes administrar productos de otra tienda." };
  }
  return { ok: true, message: "ok" };
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

async function validateCategorySelection(
  supabase: SupabaseServerClient,
  categoryId: string | null,
  subcategoryId: string | null,
): Promise<ActionState | null> {
  if (!categoryId) {
    return { ok: false, message: "Selecciona una categoria principal." };
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id,parent_id")
    .eq("id", categoryId)
    .maybeSingle();

  if (categoryError) {
    return { ok: false, message: `No se pudo validar la categoria. Detalle: ${categoryError.message}` };
  }

  if (!category) {
    return { ok: false, message: "La categoria seleccionada no existe." };
  }

  if (category.parent_id !== null) {
    return { ok: false, message: "Selecciona una categoria principal, no una subcategoria." };
  }

  if (!subcategoryId) {
    return null;
  }

  const { data: subcategory, error: subcategoryError } = await supabase
    .from("categories")
    .select("id,parent_id")
    .eq("id", subcategoryId)
    .maybeSingle();

  if (subcategoryError) {
    return { ok: false, message: `No se pudo validar la subcategoria. Detalle: ${subcategoryError.message}` };
  }

  if (!subcategory) {
    return { ok: false, message: "La subcategoria seleccionada no existe." };
  }

  if (subcategory.parent_id !== categoryId) {
    return { ok: false, message: "La subcategoria no pertenece a la categoria seleccionada." };
  }

  return null;
}

function parseShopLocationFromForm(formData: FormData): ActionState & {
  data?: {
    country: string;
    department: string;
    city: string;
    locality: string;
    neighborhood: string;
    address: string;
    address_reference: string;
    latitude: number | null;
    longitude: number | null;
    maps_url: string | null;
    postal_code: string;
    delivery_radius_km: number | null;
    pickup_enabled: boolean;
    local_delivery_enabled: boolean;
    location_verified: boolean;
  };
} {
  const address = stringValue(formData, "address").slice(0, 240);
  const addressReference = stringValue(formData, "address_reference").slice(0, 180);
  const city = stringValue(formData, "city").slice(0, 80);
  const department = stringValue(formData, "department").slice(0, 80);
  const locality = stringValue(formData, "locality").slice(0, 80);
  const neighborhood = stringValue(formData, "neighborhood").slice(0, 80);
  const country = (stringValue(formData, "country") || "Colombia").slice(0, 80);
  const postalCode = stringValue(formData, "postal_code").slice(0, 20);
  const mapsUrl = nullableStringValue(formData, "maps_url");

  const latitudeRaw = stringValue(formData, "latitude");
  const longitudeRaw = stringValue(formData, "longitude");
  const latitude = latitudeRaw ? Number(latitudeRaw) : null;
  const longitude = longitudeRaw ? Number(longitudeRaw) : null;

  if (latitudeRaw && (latitude === null || !isValidLatitude(latitude))) {
    return { ok: false, message: "Latitud invalida. Debe estar entre -90 y 90." };
  }
  if (longitudeRaw && (longitude === null || !isValidLongitude(longitude))) {
    return { ok: false, message: "Longitud invalida. Debe estar entre -180 y 180." };
  }
  if ((latitude === null) !== (longitude === null)) {
    return { ok: false, message: "Debes indicar latitud y longitud juntas, o dejar ambas vacias." };
  }

  const pickupEnabled = checkboxValue(formData, "pickup_enabled");
  const localDeliveryEnabled = checkboxValue(formData, "local_delivery_enabled");
  const locationVerified = checkboxValue(formData, "location_verified");

  let deliveryRadiusKm: number | null = null;
  if (localDeliveryEnabled) {
    const radiusRaw = stringValue(formData, "delivery_radius_km");
    if (radiusRaw) {
      const radius = Number(radiusRaw);
      if (!Number.isFinite(radius) || radius < 0) {
        return { ok: false, message: "El radio de entrega no puede ser negativo." };
      }
      deliveryRadiusKm = Math.min(radius, 500);
    }
  }

  if (address.length > 240) {
    return { ok: false, message: "La direccion es demasiado larga." };
  }

  return {
    ok: true,
    message: "",
    data: {
      country,
      department,
      city,
      locality,
      neighborhood,
      address,
      address_reference: addressReference,
      latitude,
      longitude,
      maps_url: mapsUrl,
      postal_code: postalCode,
      delivery_radius_km: deliveryRadiusKm,
      pickup_enabled: pickupEnabled,
      local_delivery_enabled: localDeliveryEnabled,
      location_verified: locationVerified,
    },
  };
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableStringValue(formData: FormData, key: string) {
  return stringValue(formData, key) || null;
}

function imageUrlValue(formData: FormData, key: string, label: string): ImageUrlValueResult {
  const value = stringValue(formData, key);
  if (!value) return { ok: true, message: "", value: null };

  if (value.length > MAX_IMAGE_URL_LENGTH) {
    return {
      ok: false,
      message: `${label} es demasiado larga. Usa una URL corta o una ruta de Storage; no pegues imagenes en base64.`,
    };
  }

  const normalized = value.toLowerCase();
  if (BLOCKED_IMAGE_URL_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return {
      ok: false,
      message: `${label} debe ser una URL o ruta de imagen. No se permiten imagenes incrustadas en base64.`,
    };
  }

  if (/[\r\n\t]/.test(value) || (!value.startsWith("/") && !/^https?:\/\//i.test(value))) {
    return {
      ok: false,
      message: `${label} debe empezar por /, http:// o https://.`,
    };
  }

  return { ok: true, message: "", value };
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
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/productos/[slug]", "page");
  revalidatePath("/categoria/[slug]", "page");
  revalidatePath("/categorias");
  revalidatePath("/categorias/[slug]", "page");
  revalidatePath("/ofertas");
  revalidatePath("/novedades");
  revalidatePath("/promociones");
  revalidatePath("/tiendas");
  revalidatePath("/tiendas/[slug]", "page");
  revalidatePath("/buscar");
  revalidatePath("/carrito");
  revalidatePath("/favoritos");
}
