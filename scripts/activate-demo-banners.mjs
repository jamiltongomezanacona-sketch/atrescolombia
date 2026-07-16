import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const projectRoot = process.cwd();
const dryRun = process.argv.includes("--dry-run");

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.ATRES_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;

const demoBanners = [
  {
    title: "Nueva coleccion infantil",
    subtitle: "Prendas seleccionadas para estrenar cada semana.",
    button_text: "Comprar ahora",
    link_url: "/categoria/infantil",
    desktop_image_url: "/assets/atres-curated/banners/banner-campana_atres-001.webp",
    mobile_image_url: "/assets/atres-curated/banners/banner-campana_atres-001.webp",
    position: "home_hero",
    status: "active",
    display_order: 1,
  },
  {
    title: "Ofertas activas ATRES",
    subtitle: "Precios directos y prendas disponibles para entrega.",
    button_text: "Ver ofertas",
    link_url: "/ofertas",
    desktop_image_url: "/assets/atres-curated/banners/banner-campana_atres-002.webp",
    mobile_image_url: "/assets/atres-curated/banners/banner-campana_atres-002.webp",
    position: "home_promo",
    status: "active",
    display_order: 2,
  },
  {
    title: "Denim en tendencia",
    subtitle: "Looks faciles de combinar para todos los dias.",
    button_text: "Explorar productos",
    link_url: "/productos",
    desktop_image_url: "/assets/atres-curated/banners/banner-campana_atres-007.webp",
    mobile_image_url: "/assets/atres-curated/banners/banner-campana_atres-007.webp",
    position: "home_promo",
    status: "active",
    display_order: 3,
  },
];

function loadEnvFile(fileName) {
  const envPath = path.join(projectRoot, fileName);
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function assertLocalBannerImages() {
  for (const banner of demoBanners) {
    const localPath = path.join(projectRoot, "public", banner.desktop_image_url);
    if (!fs.existsSync(localPath)) {
      throw new Error(`No existe la imagen local del banner: ${banner.desktop_image_url}`);
    }
  }
}

function requireSupabaseEnv() {
  if (!supabaseUrl) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en el entorno.");
  }
  if (!serviceRoleKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY. Usa la service role key de Supabase solo en local, nunca la publiques.",
    );
  }
}

async function findExistingBanner(supabase, banner) {
  const { data: byImage, error: imageError } = await supabase
    .from("banners")
    .select("id,title,desktop_image_url,status")
    .eq("desktop_image_url", banner.desktop_image_url)
    .limit(1)
    .maybeSingle();

  if (imageError) throw imageError;
  if (byImage?.id) return byImage;

  const { data: byTitle, error: titleError } = await supabase
    .from("banners")
    .select("id,title,desktop_image_url,status")
    .eq("title", banner.title)
    .limit(1)
    .maybeSingle();

  if (titleError) throw titleError;
  return byTitle;
}

async function main() {
  assertLocalBannerImages();

  console.log(`[OK] ${demoBanners.length} banners demo listos.`);

  if (dryRun) {
    for (const banner of demoBanners) {
      console.log(`[DRY-RUN] ${banner.title} -> ${banner.status} (${banner.desktop_image_url})`);
    }
    return;
  }

  requireSupabaseEnv();

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error: tableError } = await supabase.from("banners").select("id").limit(1);
  if (tableError) throw tableError;

  let created = 0;
  let updated = 0;

  for (const banner of demoBanners) {
    const existing = await findExistingBanner(supabase, banner);

    if (existing?.id) {
      const { error } = await supabase.from("banners").update(banner).eq("id", existing.id);
      if (error) throw error;
      updated += 1;
      console.log(`[OK] banner actualizado: ${banner.title}`);
      continue;
    }

    const { error } = await supabase.from("banners").insert(banner);
    if (error) throw error;
    created += 1;
    console.log(`[OK] banner creado: ${banner.title}`);
  }

  console.log(`[OK] banners activos. Creados: ${created}. Actualizados: ${updated}.`);
}

main().catch((error) => {
  console.error("[ERROR] No se pudieron activar los banners demo.");
  console.error(error?.message ?? error);
  process.exit(1);
});
