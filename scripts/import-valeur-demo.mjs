/**
 * Import demo products for the existing VALEUR shop.
 *
 * Usage (PowerShell):
 *   $env:NEXT_PUBLIC_SUPABASE_URL="https://....supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="...."
 *   node scripts/import-valeur-demo.mjs --dry-run
 *   node scripts/import-valeur-demo.mjs
 *
 * Optional: reads .env.local from project root (does not print secrets).
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const projectRoot = process.cwd();
const dataDir = path.join(projectRoot, "scripts", "data", "valeur-demo");
const catalogPath = path.join(dataDir, "catalog.json");
const bucketName = process.env.ATRES_SUPABASE_BUCKET || "product-images";
const dryRun = process.argv.includes("--dry-run");
const shopLookup = (process.env.ATRES_VALEUR_SHOP_SLUG || "bogota").toLowerCase();

async function loadDotEnvLocal() {
  const envPath = path.join(projectRoot, ".env.local");
  try {
    const raw = await fs.readFile(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta ${name}. Crea .env.local o exporta la variable en la terminal (no la pegues en el chat).`,
    );
  }
  return value;
}

function skuFromSlug(slug) {
  return `VAL-${slug.replace(/^valeur-/, "").slice(0, 28).toUpperCase()}`;
}

function discountPercent(price, previous) {
  if (!previous || previous <= price) return null;
  return Math.round(((previous - price) / previous) * 100);
}

function buildVariants(productSku, sizes, colors) {
  const variants = [];
  for (const size of sizes) {
    for (const color of colors) {
      const suffix = `${size}-${color}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toUpperCase()
        .slice(0, 40);
      variants.push({
        sku: `${productSku}-${suffix}`.slice(0, 64),
        size,
        color,
        inventory: 8,
        status: "available",
      });
    }
  }
  return variants;
}

async function main() {
  await loadDotEnvLocal();

  const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
  console.log(`[INFO] Catalogo: ${catalog.length} productos demo VALEUR`);
  console.log(`[INFO] Modo: ${dryRun ? "dry-run (sin escribir)" : "escritura real"}`);

  if (dryRun && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    for (const [index, item] of catalog.entries()) {
      console.log(`  ${index + 1}. ${item.slug} | $${item.price} | ${item.image}`);
    }
    console.log("[OK] Dry-run local sin Supabase. Revisa el catalogo arriba.");
    return;
  }

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: shops, error: shopError } = await supabase
    .from("shops")
    .select("id,name,slug,status")
    .or(`slug.ilike.%${shopLookup}%,name.ilike.%${shopLookup}%`)
    .limit(10);

  if (shopError) throw new Error(`No se pudo buscar tiendas: ${shopError.message}`);
  if (!shops?.length) {
    throw new Error(
      `No encontre la tienda VALEUR (busqueda: ${shopLookup}). Verifica slug/nombre en /admin/tiendas.`,
    );
  }

  const shop =
    shops.find((row) => row.slug?.toLowerCase() === shopLookup) ||
    shops.find((row) => row.name?.toLowerCase().includes("valeur")) ||
    shops[0];

  console.log(`[OK] Tienda: ${shop.name} (${shop.slug}) id=${shop.id}`);

  let businessId = process.env.ATRES_BUSINESS_ID || "";
  if (!businessId) {
    const { data: existingProduct } = await supabase
      .from("products")
      .select("business_id")
      .not("business_id", "is", null)
      .limit(1)
      .maybeSingle();
    businessId = existingProduct?.business_id || "";
  }
  if (!businessId) {
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .in("slug", ["confecciones-bogota", "atres-kids", "atres-kinds"])
      .limit(1)
      .maybeSingle();
    businessId = business?.id || "";
  }
  if (!businessId) {
    throw new Error("No se pudo resolver business_id legado. Define ATRES_BUSINESS_ID en .env.local.");
  }
  console.log(`[OK] business_id legado resuelto`);

  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("id,slug,name,status")
    .eq("status", "active");

  if (categoryError) throw new Error(`Categorias: ${categoryError.message}`);
  const categoryBySlug = new Map((categories ?? []).map((row) => [row.slug, row]));

  let created = 0;
  let updated = 0;
  let imagesUploaded = 0;
  let variantsWritten = 0;

  for (const [index, item] of catalog.entries()) {
    const category = categoryBySlug.get(item.categorySlug);
    if (!category) {
      throw new Error(`Categoria no encontrada: ${item.categorySlug}`);
    }

    const imagePath = path.join(dataDir, item.image);
    await fs.access(imagePath);

    const inventoryTotal = item.sizes.length * item.colors.length * 8;
    const payload = {
      name: item.name,
      slug: item.slug,
      short_description: item.short_description,
      description: item.description,
      category_id: category.id,
      price: item.price,
      previous_price: item.previous_price,
      discount_percent: discountPercent(item.price, item.previous_price),
      sku: skuFromSlug(item.slug),
      inventory_total: inventoryTotal,
      status: "active",
      is_featured: Boolean(item.is_featured),
      is_new: Boolean(item.is_new),
      is_promo: Boolean(item.is_promo),
      tags: item.tags,
      collection: item.collection,
      display_order: index + 1,
      shop_id: shop.id,
      business_id: businessId,
    };

    const { data: existing, error: existingError } = await supabase
      .from("products")
      .select("id,slug")
      .eq("slug", item.slug)
      .maybeSingle();

    if (existingError) throw new Error(`Lookup ${item.slug}: ${existingError.message}`);

    let productId = existing?.id;
    if (dryRun) {
      console.log(`[DRY] ${existing ? "update" : "create"} ${item.slug}`);
      continue;
    }

    if (productId) {
      const { error } = await supabase.from("products").update(payload).eq("id", productId);
      if (error) throw new Error(`Update ${item.slug}: ${error.message}`);
      updated += 1;
    } else {
      productId = randomUUID();
      const { error } = await supabase.from("products").insert({ id: productId, ...payload });
      if (error) throw new Error(`Insert ${item.slug}: ${error.message}`);
      created += 1;
    }

    const storagePath = `products/${shop.id}/${productId}/primary.jpg`;
    const fileBuffer = await fs.readFile(imagePath);
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, { contentType: "image/jpeg", upsert: true });

    if (uploadError) {
      throw new Error(`Storage ${item.slug}: ${uploadError.message}`);
    }
    imagesUploaded += 1;

    const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
    const publicUrl = publicData.publicUrl;

    await supabase.from("product_images").delete().eq("product_id", productId).eq("is_primary", true);

    const { error: imageRowError } = await supabase.from("product_images").insert({
      product_id: productId,
      storage_path: storagePath,
      public_url: publicUrl,
      alt: item.name,
      aspect_ratio: "3:4",
      display_order: 1,
      is_primary: true,
    });
    if (imageRowError) throw new Error(`product_images ${item.slug}: ${imageRowError.message}`);

    await supabase.from("product_variants").delete().eq("product_id", productId);
    const variants = buildVariants(payload.sku, item.sizes, item.colors).map((variant) => ({
      product_id: productId,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      inventory: variant.inventory,
      status: "available",
    }));

    if (variants.length) {
      const { error: variantError } = await supabase.from("product_variants").insert(variants);
      if (variantError) throw new Error(`variants ${item.slug}: ${variantError.message}`);
      variantsWritten += variants.length;
    }

    console.log(`[OK] ${item.slug}`);
  }

  console.log("---");
  console.log(`[DONE] created=${created} updated=${updated} images=${imagesUploaded} variants=${variantsWritten}`);
  console.log(`[DONE] Ver en /productos?tienda=${shop.slug} o /tiendas/${shop.slug}`);
}

main().catch((error) => {
  console.error(`[ERROR] ${error.message}`);
  process.exitCode = 1;
});
