import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { performance } from "node:perf_hooks";
import { createClient } from "@supabase/supabase-js";

const projectRoot = process.cwd();
const curatedDataFile = path.join(projectRoot, "src", "lib", "curated-atres-assets.ts");
const publicDir = path.join(projectRoot, "public");
const bucketName = process.env.ATRES_SUPABASE_BUCKET || "product-images";
const publishStatus = process.env.ATRES_IMPORT_STATUS || "active";
const dryRun = process.argv.includes("--dry-run");

const ownerColumnCandidates = [
  "business_id",
  "shop_id",
  "workshop_id",
  "manufacturer_id",
  "store_id",
  "seller_id",
  "vendor_id",
];

const ownerTableCandidatesByColumn = {
  business_id: ["businesses"],
  shop_id: ["shops", "businesses"],
  workshop_id: ["workshops", "businesses"],
  manufacturer_id: ["manufacturers", "businesses"],
  store_id: ["stores", "businesses", "shops"],
  seller_id: ["sellers", "businesses"],
  vendor_id: ["vendors", "businesses"],
};

const requiredBaseProductColumns = ["name", "slug", "price"];

const stats = {
  business: null,
  category: null,
  bucket: bucketName,
  ownerColumn: null,
  ownerTable: null,
  productsCreated: 0,
  productsUpdated: 0,
  storageImagesCreated: 0,
  storageImagesReused: 0,
  imageRowsCreated: 0,
  imageRowsUpdated: 0,
  validations: [],
};

function optionalEnv(name) {
  return process.env[name] || "";
}

function isLocalDryRun() {
  return dryRun && (!optionalEnv("NEXT_PUBLIC_SUPABASE_URL") || !optionalEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

function logOk(message) {
  console.log(`[OK] ${message}`);
}

function logInfo(message) {
  console.log(`- ${message}`);
}

function sanitizeError(error) {
  if (!error) return "Error desconocido";
  if (typeof error === "string") return error;
  return [error.message, error.details, error.hint, error.code].filter(Boolean).join(" | ");
}

function fail(message, context = {}, error) {
  const detail = {
    tabla: context.table ?? "desconocida",
    columna: context.column ?? "desconocida",
    valor: context.value ?? "no disponible",
    registro: context.record ?? "no disponible",
    sugerencia: context.suggestion ?? "Revisa la estructura real de la tabla y los valores obligatorios.",
    error: sanitizeError(error),
  };

  throw new Error(`${message}\n${JSON.stringify(detail, null, 2)}`);
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
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === stringQuote) inString = false;
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
    fail("La imagen no es local del proyecto.", {
      table: "storage.objects",
      column: "name",
      value: publicUrl,
      suggestion: "Usa imagenes bajo /public para migrarlas a Supabase Storage.",
    });
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

function pickColumns(payload, metadata) {
  if (!metadata.columns.size) return payload;
  return Object.fromEntries(Object.entries(payload).filter(([key]) => metadata.columns.has(key)));
}

function localMetadata() {
  return {
    products: {
      exists: true,
      columns: new Set([
        "id",
        "business_id",
        "name",
        "slug",
        "short_description",
        "description",
        "category_id",
        "price",
        "previous_price",
        "discount_percent",
        "sku",
        "inventory_total",
        "status",
        "is_featured",
        "is_new",
        "is_promo",
        "tags",
        "collection",
        "display_order",
        "image_url",
        "main_image_url",
        "cover_image_url",
        "featured_image_url",
      ]),
      required: new Set(["business_id", "name", "slug", "price"]),
    },
    product_images: {
      exists: true,
      columns: new Set([
        "id",
        "product_id",
        "storage_path",
        "public_url",
        "image_url",
        "alt",
        "aspect_ratio",
        "display_order",
        "is_primary",
      ]),
      required: new Set(["product_id"]),
    },
    categories: {
      exists: true,
      columns: new Set(["id", "name", "slug", "description", "status", "display_order"]),
      required: new Set(["name", "slug"]),
    },
    businesses: {
      exists: true,
      columns: new Set(["id", "name", "slug", "status"]),
      required: new Set(["name", "slug"]),
    },
  };
}

async function fetchOpenApiSchema(supabaseUrl, serviceRoleKey) {
  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/openapi+json",
    },
  });

  if (!response.ok) return {};
  const spec = await response.json();
  return spec.definitions ?? spec.components?.schemas ?? {};
}

async function sampleTableColumns(supabase, table) {
  const { data, error } = await supabase.from(table).select("*").limit(1);
  if (error) return { exists: false, columns: new Set() };
  return { exists: true, columns: new Set(Object.keys(data?.[0] ?? {})) };
}

async function getTableMetadata({ supabase, openApiDefinitions, table }) {
  const definition = openApiDefinitions[table] ?? openApiDefinitions[`public.${table}`];
  const schemaColumns = new Set(Object.keys(definition?.properties ?? {}));
  const required = new Set(definition?.required ?? []);

  const sampled = await sampleTableColumns(supabase, table);
  const columns = new Set([...schemaColumns, ...sampled.columns]);

  return {
    exists: sampled.exists || columns.size > 0,
    columns,
    required,
  };
}

async function getAllMetadata(supabase, supabaseUrl, serviceRoleKey) {
  if (isLocalDryRun()) return localMetadata();

  const openApiDefinitions = await fetchOpenApiSchema(supabaseUrl, serviceRoleKey);
  const tables = [
    "products",
    "product_images",
    "categories",
    "businesses",
    "shops",
    "workshops",
    "manufacturers",
    "stores",
    "sellers",
    "vendors",
  ];

  const entries = await Promise.all(
    tables.map(async (table) => [table, await getTableMetadata({ supabase, openApiDefinitions, table })]),
  );

  return Object.fromEntries(entries);
}

function detectOwnerColumn(productsMetadata) {
  const requiredOwner = ownerColumnCandidates.find((column) => productsMetadata.required.has(column));
  if (requiredOwner) return requiredOwner;

  return ownerColumnCandidates.find((column) => productsMetadata.columns.has(column)) ?? null;
}

async function findById(supabase, table, metadata, id) {
  if (!id || !metadata.exists || !metadata.columns.has("id")) return null;
  const { data, error } = await supabase.from(table).select("*").eq("id", id).limit(1).maybeSingle();
  if (error) return null;
  return data ?? null;
}

async function findBySlug(supabase, table, metadata, slug) {
  if (!metadata.exists || !metadata.columns.has("slug")) return null;
  const { data, error } = await supabase.from(table).select("*").eq("slug", slug).limit(1).maybeSingle();
  if (error) return null;
  return data ?? null;
}

async function findByName(supabase, table, metadata, name) {
  const nameColumn = ["name", "business_name", "display_name", "title"].find((column) =>
    metadata.columns.has(column),
  );
  if (!metadata.exists || !nameColumn) return null;

  const exact = await supabase.from(table).select("*").eq(nameColumn, name).limit(1).maybeSingle();
  if (!exact.error && exact.data) return exact.data;

  const ilike = await supabase.from(table).select("*").ilike(nameColumn, name).limit(1).maybeSingle();
  if (!ilike.error && ilike.data) return ilike.data;
  return null;
}

async function findFirstActive(supabase, table, metadata) {
  if (!metadata.exists) return null;

  let query = supabase.from(table).select("*").limit(1);
  if (metadata.columns.has("status")) query = query.eq("status", "active");
  else if (metadata.columns.has("is_active")) query = query.eq("is_active", true);
  else if (metadata.columns.has("active")) query = query.eq("active", true);

  const { data, error } = await query.maybeSingle();
  if (error) return null;
  return data ?? null;
}

function ownerTablesForColumn(ownerColumn, metadata) {
  const preferred = ownerTableCandidatesByColumn[ownerColumn] ?? ["businesses"];
  const existingPreferred = preferred.filter((table) => metadata[table]?.exists);
  const allExisting = Object.keys(metadata).filter((table) =>
    ["businesses", "shops", "workshops", "manufacturers", "stores", "sellers", "vendors"].includes(table)
      && metadata[table]?.exists,
  );
  return [...new Set([...existingPreferred, ...allExisting])];
}

async function resolveOwnerBusiness({ supabase, metadata, ownerColumn }) {
  if (isLocalDryRun()) {
    return {
      id: optionalEnv("ATRES_BUSINESS_ID") || "dry-run-business-id",
      table: "businesses",
      label: "ATRES dry-run",
    };
  }

  const tables = ownerTablesForColumn(ownerColumn, metadata);
  const explicitId = optionalEnv("ATRES_BUSINESS_ID");
  const attempts = [];

  for (const table of tables) {
    const tableMetadata = metadata[table];
    if (!tableMetadata?.exists) continue;

    const envMatch = await findById(supabase, table, tableMetadata, explicitId);
    attempts.push(`${table}.id=ATRES_BUSINESS_ID`);
    if (envMatch?.id) return { id: envMatch.id, table, label: envMatch.name ?? envMatch.slug ?? table };

    for (const slug of ["atres", "atrescolombia"]) {
      const match = await findBySlug(supabase, table, tableMetadata, slug);
      attempts.push(`${table}.slug=${slug}`);
      if (match?.id) return { id: match.id, table, label: match.name ?? match.slug ?? table };
    }

    for (const name of ["ATRES", "ATRES Colombia"]) {
      const match = await findByName(supabase, table, tableMetadata, name);
      attempts.push(`${table}.name=${name}`);
      if (match?.id) return { id: match.id, table, label: match.name ?? match.slug ?? table };
    }

    const active = await findFirstActive(supabase, table, tableMetadata);
    attempts.push(`${table}.primer_activo`);
    if (active?.id) return { id: active.id, table, label: active.name ?? active.slug ?? table };
  }

  fail("No se encontro un negocio valido para asociar los productos. La migracion se detuvo antes de subir imagenes.", {
    table: tables.join(", ") || "businesses",
    column: ownerColumn,
    value: explicitId ? "ATRES_BUSINESS_ID definido" : "sin ATRES_BUSINESS_ID",
    record: attempts.join(" -> "),
    suggestion: "Crea un negocio ATRES activo o define ATRES_BUSINESS_ID con el id correcto.",
  });
}

async function validateBucket(supabase) {
  if (isLocalDryRun()) {
    stats.validations.push("bucket product-images simulado");
    logOk(`bucket ${bucketName} validado en dry-run local`);
    return;
  }

  const { data, error } = await supabase.storage.getBucket(bucketName);
  if (error || !data) {
    fail("No se encontro el bucket requerido.", {
      table: "storage.buckets",
      column: "id",
      value: bucketName,
      suggestion: "Crea el bucket product-images o define ATRES_SUPABASE_BUCKET con el bucket correcto.",
    }, error);
  }

  stats.validations.push(`bucket ${bucketName}`);
  logOk(`bucket encontrado: ${bucketName}`);
}

async function ensureCategory(supabase, metadata) {
  if (isLocalDryRun()) {
    const category = { id: "dry-run-category-id", slug: "infantil", name: "Moda infantil" };
    stats.category = category;
    logOk("categoria infantil validada en dry-run local");
    return category.id;
  }

  const categoryMetadata = metadata.categories;
  if (!categoryMetadata?.exists) {
    fail("La tabla categories no existe o no esta disponible.", {
      table: "categories",
      column: "id",
      value: "infantil",
    });
  }

  let existing = null;
  for (const slug of ["infantil", "moda-infantil", "ninos", "kids"]) {
    existing = await findBySlug(supabase, "categories", categoryMetadata, slug);
    if (existing?.id) break;
  }
  if (!existing?.id) {
    for (const name of ["Moda infantil", "Infantil", "Ninos", "Niños", "Kids"]) {
      existing = await findByName(supabase, "categories", categoryMetadata, name);
      if (existing?.id) break;
    }
  }
  if (existing?.id) {
    stats.category = { id: existing.id, slug: existing.slug ?? "infantil", name: existing.name ?? "Moda infantil" };
    stats.validations.push("categoria infantil encontrada");
    logOk(`categoria encontrada: infantil (${existing.id})`);
    return existing.id;
  }

  if (dryRun) {
    fail("No se encontro la categoria infantil durante el dry-run.", {
      table: "categories",
      column: "slug",
      value: "infantil",
      suggestion: "Crea la categoria infantil antes de ejecutar la migracion real.",
    });
  }

  const payload = pickColumns(
    {
      name: "Moda infantil",
      slug: "infantil",
      description: "Ropa infantil ATRES: denim, conjuntos, camisetas y prendas seleccionadas.",
      status: "active",
      display_order: 30,
    },
    categoryMetadata,
  );

  const { data, error } = await supabase.from("categories").insert(payload).select("id,slug,name").single();
  if (error) {
    fail("No se pudo crear la categoria infantil.", {
      table: "categories",
      column: "slug",
      value: "infantil",
      record: payload,
      suggestion: "Verifica columnas obligatorias en categories.",
    }, error);
  }

  stats.category = { id: data.id, slug: data.slug ?? "infantil", name: data.name ?? "Moda infantil" };
  stats.validations.push("categoria infantil creada");
  logOk(`categoria creada: infantil (${data.id})`);
  return data.id;
}

function validateRequiredColumns(metadata, table, requiredColumns) {
  const tableMetadata = metadata[table];
  if (!tableMetadata?.exists) {
    fail(`La tabla ${table} no existe o no esta disponible.`, { table, column: "id" });
  }

  for (const column of requiredColumns) {
    if (!tableMetadata.columns.has(column)) {
      fail("Falta una columna requerida para la migracion.", {
        table,
        column,
        value: "no existe",
        suggestion: `Agrega la columna ${column} o actualiza el migrador a la estructura real.`,
      });
    }
  }

  stats.validations.push(`columnas requeridas en ${table}`);
  logOk(`columnas requeridas validadas en ${table}`);
}

async function preflight({ supabase, metadata }) {
  validateRequiredColumns(metadata, "products", requiredBaseProductColumns);
  validateRequiredColumns(metadata, "product_images", ["product_id"]);

  const ownerColumn = detectOwnerColumn(metadata.products);
  if (!ownerColumn) {
    fail("No se detecto columna propietaria en products.", {
      table: "products",
      column: ownerColumnCandidates.join("|"),
      value: "ninguna encontrada",
      suggestion: "Verifica si la tabla usa business_id, shop_id, workshop_id, manufacturer_id u otra llave propietaria.",
    });
  }

  stats.ownerColumn = ownerColumn;
  logOk(`columna propietaria detectada: products.${ownerColumn}`);

  const business = await resolveOwnerBusiness({ supabase, metadata, ownerColumn });
  stats.business = business;
  stats.ownerTable = business.table;
  stats.validations.push("negocio encontrado");
  logOk(`negocio encontrado: ${business.label} (${business.id}) via ${business.table}`);

  await validateBucket(supabase);
  const categoryId = await ensureCategory(supabase, metadata);
  stats.validations.push(dryRun ? "dry-run sin escrituras" : "permisos de escritura por service role");
  stats.validations.push("preflight completado");
  logOk("preflight completado antes de subir imagenes");

  return { ownerColumn, businessId: business.id, categoryId };
}

async function storageObjectExists(supabase, storagePath) {
  if (isLocalDryRun()) return false;

  const directory = path.posix.dirname(storagePath);
  const fileName = path.posix.basename(storagePath);
  const { data, error } = await supabase.storage.from(bucketName).list(directory, {
    limit: 100,
    search: fileName,
  });

  if (error) return false;
  return (data ?? []).some((item) => item.name === fileName);
}

async function uploadImage(supabase, sourceUrl, storagePath, product) {
  const localPath = imagePathFromPublicUrl(sourceUrl);
  const file = await fs.readFile(localPath);

  if (dryRun) {
    logOk(`imagen validada en dry-run: ${storagePath}`);
    stats.storageImagesCreated += 1;
    return `https://dry-run.local/storage/v1/object/public/${bucketName}/${storagePath}`;
  }

  if (await storageObjectExists(supabase, storagePath)) {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
    stats.storageImagesReused += 1;
    logOk(`imagen reutilizada: ${storagePath}`);
    return data.publicUrl;
  }

  const { error } = await supabase.storage.from(bucketName).upload(storagePath, file, {
    contentType: "image/webp",
    upsert: false,
    cacheControl: "31536000",
  });

  if (error) {
    fail("No se pudo subir la imagen a Storage.", {
      table: "storage.objects",
      column: "name",
      value: storagePath,
      record: product.slug,
      suggestion: "Verifica permisos de escritura del bucket product-images y que el archivo local exista.",
    }, error);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
  stats.storageImagesCreated += 1;
  logOk(`imagen subida: ${storagePath}`);
  return data.publicUrl;
}

function buildProductPayload(
  product,
  categoryId,
  ownerColumn,
  businessId,
  displayOrder,
  imagePublicUrl,
  productsMetadata,
) {
  const payload = {
    [ownerColumn]: businessId,
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
    image_url: imagePublicUrl,
    main_image_url: imagePublicUrl,
    cover_image_url: imagePublicUrl,
    featured_image_url: imagePublicUrl,
  };

  return pickColumns(payload, productsMetadata);
}

async function upsertProduct({
  supabase,
  metadata,
  product,
  categoryId,
  ownerColumn,
  businessId,
  displayOrder,
  imagePublicUrl,
}) {
  const payload = buildProductPayload(
    product,
    categoryId,
    ownerColumn,
    businessId,
    displayOrder,
    imagePublicUrl,
    metadata.products,
  );

  for (const column of [...metadata.products.required]) {
    if (column in payload && (payload[column] === null || payload[column] === undefined || payload[column] === "")) {
      fail("Valor requerido invalido para products.", {
        table: "products",
        column,
        value: payload[column],
        record: product.slug,
        suggestion: "Corrige el valor antes de insertar el producto.",
      });
    }
  }

  if (dryRun) {
    const exists = product.slug.endsWith("-001") ? "created" : "updated";
    if (exists === "created") stats.productsCreated += 1;
    else stats.productsUpdated += 1;
    logOk(`producto ${exists === "created" ? "creado" : "actualizado"} en dry-run: ${product.slug}`);
    return { id: `dry-run-${product.slug}`, action: exists };
  }

  const { data: existing, error: findError } = await supabase
    .from("products")
    .select("id")
    .eq("slug", product.slug)
    .limit(1)
    .maybeSingle();

  if (findError) {
    fail("No se pudo consultar producto existente.", {
      table: "products",
      column: "slug",
      value: product.slug,
      record: product.slug,
    }, findError);
  }

  const result = existing?.id
    ? await supabase.from("products").update(payload).eq("id", existing.id).select("id").single()
    : await supabase.from("products").insert(payload).select("id").single();

  if (result.error) {
    fail("No se pudo crear/actualizar el producto.", {
      table: "products",
      column: ownerColumn,
      value: businessId,
      record: { slug: product.slug, name: product.name },
      suggestion: `Verifica que ${ownerColumn} apunte a un registro valido y que las columnas obligatorias existan.`,
    }, result.error);
  }

  if (existing?.id) {
    stats.productsUpdated += 1;
    logOk(`producto actualizado: ${product.slug}`);
    return { id: result.data.id, action: "updated" };
  }

  stats.productsCreated += 1;
  logOk(`producto creado: ${product.slug}`);
  return { id: result.data.id, action: "created" };
}

async function upsertProductImage({ supabase, metadata, productId, product, imagePublicUrl, storagePath }) {
  const imageIdentityColumn = ["storage_path", "public_url", "image_url"].find((column) =>
    metadata.product_images.columns.has(column),
  );
  const imageIdentityValue = imageIdentityColumn === "storage_path" ? storagePath : imagePublicUrl;
  const imagePayload = pickColumns(
    {
      product_id: productId,
      storage_path: storagePath,
      public_url: imagePublicUrl,
      image_url: imagePublicUrl,
      alt: product.name,
      aspect_ratio: "3:4",
      display_order: 1,
      is_primary: true,
    },
    metadata.product_images,
  );

  if (dryRun) {
    stats.imageRowsCreated += 1;
    logOk(`relacion product_images validada en dry-run: ${product.slug}`);
    return;
  }

  if (!imageIdentityColumn) {
    fail("No se detecto columna de URL/ruta en product_images.", {
      table: "product_images",
      column: "storage_path|public_url|image_url",
      value: "ninguna encontrada",
      record: product.slug,
      suggestion: "La tabla product_images necesita storage_path, public_url o image_url para evitar duplicados.",
    });
  }

  const { data: existing, error: findError } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .eq(imageIdentityColumn, imageIdentityValue)
    .limit(1)
    .maybeSingle();

  if (findError) {
    fail("No se pudo consultar product_images.", {
      table: "product_images",
      column: `product_id/${imageIdentityColumn}`,
      value: `${productId}/${imageIdentityValue}`,
      record: product.slug,
    }, findError);
  }

  if (metadata.product_images.columns.has("is_primary")) {
    const { error: primaryError } = await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);

    if (primaryError) {
      fail("No se pudo limpiar imagen primaria previa.", {
        table: "product_images",
        column: "is_primary",
        value: false,
        record: product.slug,
        suggestion: "Verifica permisos de update en product_images.",
      }, primaryError);
    }
  }

  const result = existing?.id
    ? await supabase.from("product_images").update(imagePayload).eq("id", existing.id)
    : await supabase.from("product_images").insert(imagePayload);

  if (result.error) {
    fail("No se pudo crear/actualizar product_images.", {
      table: "product_images",
      column: "product_id",
      value: productId,
      record: { slug: product.slug, storagePath },
      suggestion: "Verifica columnas obligatorias de product_images.",
    }, result.error);
  }

  if (existing?.id) {
    stats.imageRowsUpdated += 1;
    logOk(`imagen de producto actualizada: ${product.slug}`);
  } else {
    stats.imageRowsCreated += 1;
    logOk(`imagen de producto creada: ${product.slug}`);
  }
}

async function migrateProducts({ supabase, metadata, products, preflightResult }) {
  const { ownerColumn, businessId, categoryId } = preflightResult;

  for (const [index, product] of products.entries()) {
    const image = product.images?.[0] ?? product.image;
    const fileName = path.basename(image);
    const storagePath = `curated/infantil/${product.slug}/${fileName}`;
    const imagePublicUrl = await uploadImage(supabase, image, storagePath, product);
    const savedProduct = await upsertProduct({
      supabase,
      metadata,
      product,
      categoryId,
      ownerColumn,
      businessId,
      displayOrder: index + 1,
      imagePublicUrl,
    });

    await upsertProductImage({
      supabase,
      metadata,
      productId: savedProduct.id,
      product,
      imagePublicUrl,
      storagePath,
    });

    logInfo(`${index + 1}/${products.length} procesado: ${product.slug}`);
  }

  return products.length;
}

function printFinalReport(total, elapsedMs) {
  console.log("\nINFORME FINAL");
  console.log(`[OK] negocio utilizado: ${stats.business?.label ?? "no disponible"}`);
  console.log(`[OK] id encontrado: ${stats.business?.id ?? "no disponible"}`);
  console.log(`[OK] tabla negocio: ${stats.ownerTable ?? "no disponible"}`);
  console.log(`[OK] columna propietaria: ${stats.ownerColumn ?? "no disponible"}`);
  console.log(`[OK] categoria utilizada: ${stats.category?.slug ?? "infantil"} (${stats.category?.id ?? "no disponible"})`);
  console.log(`[OK] bucket utilizado: ${stats.bucket}`);
  console.log(`[OK] productos nuevos: ${stats.productsCreated}`);
  console.log(`[OK] productos actualizados: ${stats.productsUpdated}`);
  console.log(`[OK] imagenes reutilizadas: ${stats.storageImagesReused}`);
  console.log(`[OK] imagenes nuevas: ${stats.storageImagesCreated}`);
  console.log(`[OK] filas product_images nuevas: ${stats.imageRowsCreated}`);
  console.log(`[OK] filas product_images actualizadas: ${stats.imageRowsUpdated}`);
  console.log(`[OK] tiempo aproximado: ${(elapsedMs / 1000).toFixed(1)}s`);
  console.log(`[OK] productos procesados: ${total}`);
  console.log(`[OK] validaciones realizadas: ${stats.validations.join(", ")}`);
}

async function main() {
  const started = performance.now();
  const source = await fs.readFile(curatedDataFile, "utf8");
  const products = extractExportedArray(source, "curatedAtresProducts");
  const supabaseUrl = optionalEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = optionalEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!dryRun && (!supabaseUrl || !serviceRoleKey)) {
    fail("Faltan variables de entorno para ejecutar la migracion real.", {
      table: "env",
      column: "NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY",
      value: "no definido",
      suggestion: "Define las variables en la terminal sin guardarlas en Git.",
    });
  }

  if (isLocalDryRun()) {
    logInfo("dry-run local sin conexion: se valida estructura del migrador sin tocar Supabase");
  }

  const supabase = supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  console.log(
    JSON.stringify(
      {
        dryRun,
        localDryRun: isLocalDryRun(),
        bucketName,
        publishStatus,
        products: products.length,
      },
      null,
      2,
    ),
  );

  const metadata = supabase
    ? await getAllMetadata(supabase, supabaseUrl, serviceRoleKey)
    : localMetadata();

  const preflightResult = await preflight({ supabase, metadata });
  const migratedProducts = await migrateProducts({
    supabase,
    metadata,
    products,
    preflightResult,
  });

  printFinalReport(migratedProducts, performance.now() - started);

  if (dryRun) {
    console.log("\nComando para migracion real:");
    console.log("npm run migrate:curated:supabase");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
