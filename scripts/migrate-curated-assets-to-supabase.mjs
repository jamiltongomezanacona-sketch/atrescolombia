import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const projectRoot = process.cwd();
const curatedDataFile = path.join(projectRoot, "src", "lib", "curated-atres-assets.ts");
const publicDir = path.join(projectRoot, "public");
const bucketName = process.env.ATRES_SUPABASE_BUCKET || "product-images";
const publishStatus = process.env.ATRES_IMPORT_STATUS || "active";
const dryRun = process.argv.includes("--dry-run");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable ${name}.`);
  }
  return value;
}

function extractExportedArray(source, exportName) {
  const marker = `export const ${exportName}`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) throw new Error(`No encontre ${exportName}.`);

  const equalsIndex = source.indexOf("=", markerIndex);
  const start = source.indexOf("[", equalsIndex);
  if (start === -1) throw new Error(`No encontre el inicio del array ${exportName}.`);

  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === stringQuote) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === "[") depth += 1;
    if (char === "]") depth -= 1;

    if (depth === 0) {
      return JSON.parse(source.slice(start, index + 1));
    }
  }

  throw new Error(`No encontre el final del array ${exportName}.`);
}

function imagePathFromPublicUrl(publicUrl) {
  if (!publicUrl.startsWith("/")) {
    throw new Error(`La imagen no es local del proyecto: ${publicUrl}`);
  }
  return path.join(publicDir, publicUrl);
}

function discountPercent(product) {
  if (!product.previousPrice || product.previousPrice <= product.price) return null;
  return Math.round(((product.previousPrice - product.price) / product.previousPrice) * 100);
}

function skuFromSlug(slug) {
  return `ATRES-${slug.replace(/^atres-/, "").slice(0, 36).toUpperCase()}`;
}

async function ensureCategory(supabase) {
  if (dryRun) return "dry-run-category-id";

  const { data: existing, error: existingError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "infantil")
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: "Moda infantil",
      slug: "infantil",
      description: "Ropa infantil ATRES: denim, conjuntos, camisetas y prendas seleccionadas.",
      status: "active",
      display_order: 30,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function uploadImage(supabase, sourceUrl, storagePath) {
  const localPath = imagePathFromPublicUrl(sourceUrl);
  const file = await fs.readFile(localPath);

  if (dryRun) {
    return `https://dry-run.local/storage/v1/object/public/${bucketName}/${storagePath}`;
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, file, {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "31536000",
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function upsertProduct(supabase, product, categoryId, imagePublicUrl, storagePath, displayOrder) {
  const payload = {
    name: product.name,
    slug: product.slug,
    short_description: product.description,
    description: product.description,
    category_id: categoryId,
    price: product.price,
    previous_price: product.previousPrice ?? null,
    discount_percent: discountPercent(product),
    sku: skuFromSlug(product.slug),
    inventory_total: product.stock,
    status: publishStatus,
    is_featured: Boolean(product.isTrending),
    is_new: Boolean(product.isNew),
    is_promo: Boolean(product.isPromo),
    tags: product.details ?? [],
    collection: product.collection ?? "ATRES",
    display_order: displayOrder,
  };

  if (dryRun) {
    return { id: `dry-run-${product.slug}` };
  }

  const { data: existing, error: findError } = await supabase
    .from("products")
    .select("id")
    .eq("slug", product.slug)
    .maybeSingle();

  if (findError) throw findError;

  const result = existing?.id
    ? await supabase.from("products").update(payload).eq("id", existing.id).select("id").single()
    : await supabase.from("products").insert(payload).select("id").single();

  if (result.error) throw result.error;

  const productId = result.data.id;
  await supabase.from("product_images").delete().eq("product_id", productId);

  const { error: imageError } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: storagePath,
    public_url: imagePublicUrl,
    alt: product.name,
    aspect_ratio: "3:4",
    display_order: 1,
    is_primary: true,
  });

  if (imageError) throw imageError;
  return result.data;
}

async function migrateProducts(supabase, products) {
  const categoryId = await ensureCategory(supabase);
  let migrated = 0;

  for (const [index, product] of products.entries()) {
    const image = product.images?.[0] ?? product.image;
    const fileName = path.basename(image);
    const storagePath = `curated/infantil/${product.slug}/${fileName}`;
    const imagePublicUrl = await uploadImage(supabase, image, storagePath);
    await upsertProduct(supabase, product, categoryId, imagePublicUrl, storagePath, index + 1);
    migrated += 1;
    console.log(`${dryRun ? "[dry-run] " : ""}${migrated}/${products.length} ${product.slug}`);
  }

  return migrated;
}

async function main() {
  const source = await fs.readFile(curatedDataFile, "utf8");
  const products = extractExportedArray(source, "curatedAtresProducts");

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(
    JSON.stringify(
      {
        dryRun,
        bucketName,
        publishStatus,
        products: products.length,
      },
      null,
      2,
    ),
  );

  const migratedProducts = await migrateProducts(supabase, products);
  console.log(`Listo: ${migratedProducts} productos migrados a Supabase.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
