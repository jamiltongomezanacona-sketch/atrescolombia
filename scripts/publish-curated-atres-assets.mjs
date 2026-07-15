import fs from "node:fs/promises";
import path from "node:path";

const curatedRoot = path.join(process.cwd(), "asset-workbench", "atres-imagenes-curadas");
const publicRoot = path.join(process.cwd(), "public", "assets", "atres-curated");
const outputDataFile = path.join(process.cwd(), "src", "lib", "curated-atres-assets.ts");

const productSource = path.join(curatedRoot, "01-productos-listos");
const bannerSource = path.join(curatedRoot, "02-banners-campanas");
const productDest = path.join(publicRoot, "products");
const bannerDest = path.join(publicRoot, "banners");

const productNames = [
  "Conjunto denim flor",
  "Set infantil lila",
  "Camiseta cuello color",
  "Look infantil violeta",
  "Set falda mariposa",
  "Jean negro urbano",
  "Jean infantil street",
  "Pantalon flores rosa",
  "Overol denim flores",
  "Set basico tierno",
  "Short denim lazo",
  "Jean lazo azul",
  "Conjunto short denim",
  "Camiseta comic rosa",
  "Overol denim corazon",
  "Pantalon mariposa azul",
  "Overol denim clasico",
  "Set casual rosa",
  "Set denim pastel",
  "Jean lazo oscuro",
  "Set camiseta capibara",
  "Set estampado infantil",
  "Camiseta story rosa",
  "Short denim bordado",
  "Look denim vitrina",
  "Jean flores laterales",
  "Short corazon denim",
  "Set short multicolor",
  "Short love denim",
  "Conjunto oso beige",
  "Jean estrellas azul",
  "Camiseta varsity nina",
  "Set flores pastel",
  "Camisetas estampadas",
  "Pantalon parches color",
  "Set camisetas surtidas",
  "Jean lazo grande",
  "Shorts denim duo",
  "Falda denim corazon",
  "Look basico crema",
  "Jean mariposa bajo",
  "Pack camisetas pastel",
  "Jean corazon rojo",
  "Jean lazo blanco",
  "Set rosa flowers",
  "Set falda denim",
  "Short flores 3D",
  "Pantalon flores bordadas",
  "Set snoopy denim",
  "Jean clasico oscuro",
  "Short denim con lazo",
  "Jean lazo delicado",
  "Jean flores bajo",
  "Pantalon lazo blanco",
  "Blusa estampada rosa",
  "Overol flores pastel",
  "Jean aplique rosado",
  "Short denim corazones",
  "Pantalon lazo posterior",
  "Set jean camiseta",
  "Short lazo doble",
  "Short moño rosado",
  "Pantalon pañoleta color",
  "Pantalon pañoleta floral",
  "Jean corazon oscuro",
  "Conjunto denim claro",
  "Falda short denim",
  "Falda short corazon",
  "Vestido overol denim",
  "Set oso denim",
  "Overol largo flores",
  "Overol lavado claro",
  "Pantalon denim lazo",
  "Jean wide infantil",
];

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function priceFor(index) {
  const prices = [44900, 49900, 54900, 59900, 64900, 69900, 74900, 79900, 84900, 89900];
  return prices[index % prices.length];
}

async function copyFolder(source, dest) {
  await fs.mkdir(dest, { recursive: true });
  const files = (await fs.readdir(source)).filter((file) => file.endsWith(".webp")).sort();
  for (const file of files) {
    await fs.copyFile(path.join(source, file), path.join(dest, file));
  }
  return files;
}

function buildProducts(files) {
  return files.map((file, index) => {
    const baseName = productNames[index] ?? `Producto infantil ATRES ${String(index + 1).padStart(3, "0")}`;
    const price = priceFor(index);
    const previousPrice = index % 3 === 0 ? price + 20000 : index % 4 === 0 ? price + 15000 : undefined;
    const isPromo = Boolean(previousPrice);
    const isNew = index < 18;
    const isTrending = index % 5 === 0 || index < 10;

    return {
      slug: `atres-${slugify(baseName)}-${String(index + 1).padStart(3, "0")}`,
      name: baseName,
      categorySlug: "infantil",
      categoryName: "Moda infantil",
      price,
      previousPrice,
      badge: isPromo ? "Oferta" : isNew ? "Nuevo" : isTrending ? "Top" : undefined,
      isNew,
      isTrending,
      isPromo,
      rating: 4.8,
      stock: 12 + (index % 19),
      image: `/assets/atres-curated/products/${file}`,
      images: [`/assets/atres-curated/products/${file}`],
      colors: ["Azul denim", "Rosa", "Lila"],
      sizes: ["2", "4", "6", "8", "10", "12"],
      description:
        "Prenda infantil ATRES seleccionada para looks comodos, dulces y faciles de combinar.",
      details: ["Moda infantil", "Denim y tonos pastel", "Disponible para entrega", "Seleccion ATRES"],
      collection: "Infantil Denim ATRES",
    };
  });
}

function buildPromos(files) {
  return files.slice(0, 12).map((file, index) => ({
    title:
      index === 0
        ? "Campana ATRES"
        : index < 6
          ? "Coleccion destacada"
          : "Denim en tendencia",
    subtitle:
      index === 0
        ? "Nuevas prendas y vitrinas listas para descubrir."
        : "Seleccion visual publicada sin revision adicional de marca externa.",
    href: index < 6 ? "/categoria/infantil" : "/productos",
    image: `/assets/atres-curated/banners/${file}`,
    tone: index % 3 === 0 ? "bg-promo text-black" : index % 3 === 1 ? "bg-black text-white" : "bg-white text-black",
  }));
}

async function main() {
  const productFiles = await copyFolder(productSource, productDest);
  const bannerFiles = await copyFolder(bannerSource, bannerDest);
  const products = buildProducts(productFiles);
  const promos = buildPromos(bannerFiles);

  const source = `import type { Product, Promo } from "@/lib/store-data";

export const curatedAtresProducts: Product[] = ${JSON.stringify(products, null, 2)};

export const curatedAtresPromos: Promo[] = ${JSON.stringify(promos, null, 2)};
`;

  await fs.writeFile(outputDataFile, source, "utf8");

  console.log(
    JSON.stringify(
      {
        products: products.length,
        banners: bannerFiles.length,
        dataFile: outputDataFile,
        publicRoot,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
