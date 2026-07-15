import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = "C:\\Users\\ASUS\\Desktop\\atres imag";
const outputDir = path.join(process.cwd(), "asset-workbench", "atres-imagenes-curadas");

const productFiles = new Set([
  "IMG-20260714-WA0066.jpg",
  "IMG-20260714-WA0067.jpg",
  "IMG-20260714-WA0068.jpg",
  "IMG-20260714-WA0069.jpg",
  "IMG-20260714-WA0070.jpg",
  "IMG-20260714-WA0071.jpg",
  "IMG-20260714-WA0072.jpg",
  "IMG-20260714-WA0073.jpg",
  "IMG-20260715-WA0016.jpg",
  "IMG-20260715-WA0017.jpg",
  "IMG-20260715-WA0018.jpg",
  "IMG-20260715-WA0019.jpg",
  "IMG-20260715-WA0020.jpg",
  "IMG-20260715-WA0021.jpg",
  "IMG-20260715-WA0022.jpg",
  "IMG-20260715-WA0023.jpg",
  "IMG-20260715-WA0024.jpg",
  "IMG-20260715-WA0025.jpg",
  "IMG-20260715-WA0026.jpg",
  "IMG-20260715-WA0027.jpg",
  "IMG-20260715-WA0028.jpg",
  "IMG-20260715-WA0029.jpg",
  "IMG-20260715-WA0030.jpg",
  "IMG-20260715-WA0031.jpg",
  "IMG-20260715-WA0032.jpg",
  "IMG-20260715-WA0033.jpg",
  "IMG-20260715-WA0034.jpg",
  "IMG-20260715-WA0035.jpg",
  "IMG-20260715-WA0036.jpg",
  "IMG-20260715-WA0037.jpg",
  "IMG-20260715-WA0038.jpg",
  "IMG-20260715-WA0039.jpg",
  "IMG-20260715-WA0040.jpg",
  "IMG-20260715-WA0041.jpg",
  "IMG-20260715-WA0042.jpg",
  "IMG-20260715-WA0043.jpg",
  "IMG-20260715-WA0044.jpg",
  "IMG-20260715-WA0045.jpg",
  "IMG-20260715-WA0046.jpg",
  "IMG-20260715-WA0047.jpg",
  "IMG-20260715-WA0048.jpg",
  "IMG-20260715-WA0049.jpg",
  "IMG-20260715-WA0050.jpg",
  "IMG-20260715-WA0051.jpg",
  "IMG-20260715-WA0052.jpg",
  "IMG-20260715-WA0053.jpg",
  "IMG-20260715-WA0054.jpg",
  "IMG-20260715-WA0055.jpg",
  "IMG-20260715-WA0056.jpg",
  "IMG-20260715-WA0057.jpg",
  "IMG-20260715-WA0058.jpg",
  "IMG-20260715-WA0059.jpg",
  "IMG-20260715-WA0060.jpg",
  "IMG-20260715-WA0061.jpg",
  "IMG-20260715-WA0062.jpg",
  "IMG-20260715-WA0063.jpg",
  "IMG-20260715-WA0064.jpg",
  "IMG-20260715-WA0065.jpg",
  "IMG-20260715-WA0066.jpg",
  "IMG-20260715-WA0067.jpg",
  "IMG-20260715-WA0068.jpg",
  "IMG-20260715-WA0069.jpg",
  "IMG-20260715-WA0070.jpg",
  "IMG-20260715-WA0071.jpg",
  "IMG-20260715-WA0072.jpg",
  "IMG-20260715-WA0073.jpg",
  "IMG-20260715-WA0075.jpg",
  "IMG-20260715-WA0076.jpg",
  "IMG-20260715-WA0077.jpg",
  "IMG-20260715-WA0078.jpg",
  "IMG-20260715-WA0173.jpg",
  "IMG-20260715-WA0174.jpg",
  "IMG-20260715-WA0175.jpg",
  "IMG-20260715-WA0176.jpg",
]);

const discardFiles = new Set([
  "IMG-20260714-WA0077.jpg",
  "IMG-20260715-WA0001.jpg",
  "IMG-20260715-WA0002.jpg",
  "IMG-20260715-WA0003.jpg",
  "IMG-20260715-WA0004.jpg",
  "IMG-20260715-WA0005.jpg",
  "IMG-20260715-WA0006.jpg",
  "IMG-20260715-WA0007.jpg",
  "IMG-20260715-WA0008.jpg",
  "IMG-20260715-WA0011.jpg",
  "IMG-20260715-WA0012.jpg",
  "IMG-20260715-WA0013.jpg",
  "IMG-20260715-WA0014.jpg",
  "IMG-20260715-WA0015.jpg",
]);

const externalBrandFiles = new Set([
  "IMG-20260715-WA0177.jpg",
  "IMG-20260715-WA0178.jpg",
  "IMG-20260715-WA0179.jpg",
  "IMG-20260715-WA0180.jpg",
  "IMG-20260715-WA0181.jpg",
  "IMG-20260715-WA0182.jpg",
  "IMG-20260715-WA0183.jpg",
  "IMG-20260715-WA0184.jpg",
  "IMG-20260715-WA0185.jpg",
  "IMG-20260715-WA0186.jpg",
  "IMG-20260715-WA0187.jpg",
  "IMG-20260715-WA0188.jpg",
  "IMG-20260715-WA0189.jpg",
  "IMG-20260715-WA0190.jpg",
  "IMG-20260715-WA0191.jpg",
  "IMG-20260715-WA0192.jpg",
  "IMG-20260715-WA0193.jpg",
  "IMG-20260715-WA0194.jpg",
  "IMG-20260715-WA0195.jpg",
]);

const bannerFiles = new Set([
  "IMG-20260714-WA0041.jpg",
  "IMG-20260714-WA0045.jpg",
  "IMG-20260714-WA0050.jpg",
  "IMG-20260714-WA0054.jpg",
  "IMG-20260714-WA0060.jpg",
  "IMG-20260714-WA0061.jpg",
  "IMG-20260714-WA0062.jpg",
  "IMG-20260714-WA0064.jpg",
  "IMG-20260714-WA0065.jpg",
  "IMG-20260715-WA0179.jpg",
  "IMG-20260715-WA0180.jpg",
  "IMG-20260715-WA0184.jpg",
  "IMG-20260715-WA0185.jpg",
  "IMG-20260715-WA0186.jpg",
  "IMG-20260715-WA0187.jpg",
  "IMG-20260715-WA0188.jpg",
  "IMG-20260715-WA0189.jpg",
  "IMG-20260715-WA0190.jpg",
  "IMG-20260715-WA0192.jpg",
  "IMG-20260715-WA0193.jpg",
  "IMG-20260715-WA0194.jpg",
  "IMG-20260715-WA0195.jpg",
]);

const categoryFolders = {
  producto: "01-productos-listos",
  banner: "02-banners-campanas",
  catalog: "03-catalogo-para-recortar",
  discard: "04-descartar-no-subir",
};

const counters = {
  producto: 0,
  banner: 0,
  catalog: 0,
  discard: 0,
};

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function classify(fileName, metadata) {
  if (discardFiles.has(fileName)) {
    return {
      group: "discard",
      category: "no_comercial",
      use: "No subir",
      note: "Captura, foto no comercial o material que rompe la estetica de tienda.",
    };
  }

  if (productFiles.has(fileName)) {
    return {
      group: "producto",
      category: "moda_infantil",
      use: "Producto individual",
      note: "Candidato para ficha de producto infantil; revisar nombre, precio y tallas.",
    };
  }

  if (bannerFiles.has(fileName)) {
    return {
      group: "banner",
      category: externalBrandFiles.has(fileName) ? "campana_revision_marca" : "campana_atres",
      use: "Banner o campana",
      note: externalBrandFiles.has(fileName)
        ? "Pieza visual fuerte, pero tiene marca externa visible; revisar antes de usar."
        : "Pieza util para home, categoria, trends o campana promocional.",
    };
  }

  if (externalBrandFiles.has(fileName)) {
    return {
      group: "catalog",
      category: "denim_revision_marca",
      use: "Revision manual",
      note: "Tiene marca externa visible; usar solo si se autoriza o se adapta visualmente.",
    };
  }

  const ratio = metadata.width / metadata.height;

  if (ratio > 1.25) {
    return {
      group: "banner",
      category: "campana",
      use: "Banner o campana",
      note: "Formato horizontal; util para campanas, no como producto individual.",
    };
  }

  return {
    group: "catalog",
    category: "catalogo_multi_producto",
    use: "Catalogo para recortar",
    note: "Imagen con varios productos/textos/precios; requiere recorte o curaduria.",
  };
}

function makeName(group, category) {
  counters[group] += 1;
  const prefix =
    group === "producto"
      ? "producto"
      : group === "banner"
        ? "banner"
        : group === "catalog"
          ? "catalogo"
          : "descartar";
  return `${prefix}-${category}-${String(counters[group]).padStart(3, "0")}`;
}

async function ensureDirs() {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all(
    Object.values(categoryFolders).map((folder) =>
      fs.mkdir(path.join(outputDir, folder), { recursive: true }),
    ),
  );
}

async function optimizeImage(inputPath, outputPath, group) {
  const image = sharp(inputPath).rotate();

  if (group === "producto") {
    await image
      .resize({ width: 1200, height: 1500, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(outputPath);
    return;
  }

  if (group === "banner") {
    await image
      .resize({ width: 1600, height: 900, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(outputPath);
    return;
  }

  if (group === "catalog") {
    await image
      .resize({ width: 1400, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toFile(outputPath);
    return;
  }

  await fs.copyFile(inputPath, outputPath);
}

async function createContactSheet(groupRows, folderName, sheetName) {
  const thumbWidth = 180;
  const thumbHeight = 220;
  const labelHeight = 38;
  const columns = 5;
  const rows = Math.ceil(groupRows.length / columns);
  const width = columns * thumbWidth;
  const height = rows * (thumbHeight + labelHeight);
  const background = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#f7f4ef",
    },
  });

  const composites = [];

  for (let index = 0; index < groupRows.length; index += 1) {
    const row = groupRows[index];
    const sourcePath = path.join(outputDir, folderName, row.generado);
    const left = (index % columns) * thumbWidth;
    const top = Math.floor(index / columns) * (thumbHeight + labelHeight);
    const imageBuffer = await sharp(sourcePath)
      .resize({ width: thumbWidth, height: thumbHeight, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82 })
      .toBuffer();
    const textSvg = Buffer.from(`
      <svg width="${thumbWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f7f4ef"/>
        <text x="8" y="15" font-size="11" font-family="Arial" fill="#101010">${row.generado}</text>
        <text x="8" y="30" font-size="10" font-family="Arial" fill="#555">${row.original}</text>
      </svg>
    `);

    composites.push({ input: imageBuffer, left, top });
    composites.push({ input: textSvg, left, top: top + thumbHeight });
  }

  await background
    .composite(composites)
    .jpeg({ quality: 86 })
    .toFile(path.join(outputDir, sheetName));
}

async function main() {
  await ensureDirs();

  const files = (await fs.readdir(sourceDir))
    .filter((file) => file.toLowerCase().endsWith(".jpg"))
    .sort((a, b) => a.localeCompare(b));

  const rows = [];

  for (const fileName of files) {
    const inputPath = path.join(sourceDir, fileName);
    const stat = await fs.stat(inputPath);
    const metadata = await sharp(inputPath).metadata();
    const classification = classify(fileName, metadata);
    const baseName = makeName(classification.group, classification.category);
    const extension = classification.group === "discard" ? ".jpg" : ".webp";
    const outputName = `${baseName}${extension}`;
    const outputPath = path.join(outputDir, categoryFolders[classification.group], outputName);

    await optimizeImage(inputPath, outputPath, classification.group);

    const outputStat = await fs.stat(outputPath);
    rows.push({
      original: fileName,
      generado: outputName,
      carpeta: categoryFolders[classification.group],
      tipo: classification.group,
      categoria_sugerida: classification.category,
      uso_recomendado: classification.use,
      ancho_original: metadata.width,
      alto_original: metadata.height,
      kb_original: Math.round((stat.size / 1024) * 10) / 10,
      kb_generado: Math.round((outputStat.size / 1024) * 10) / 10,
      observaciones: classification.note,
    });
  }

  const csvHeader = Object.keys(rows[0]);
  const csv = [
    csvHeader.map(csvCell).join(","),
    ...rows.map((row) => csvHeader.map((key) => csvCell(row[key])).join(",")),
  ].join("\n");

  await fs.writeFile(path.join(outputDir, "inventario-atres-imagenes.csv"), csv, "utf8");

  const totals = rows.reduce((acc, row) => {
    acc[row.tipo] = (acc[row.tipo] ?? 0) + 1;
    return acc;
  }, {});

  const summary = {
    sourceDir,
    outputDir,
    total: rows.length,
    totals,
    originalTotalMb: Math.round((rows.reduce((sum, row) => sum + row.kb_original, 0) / 1024) * 100) / 100,
    generatedTotalMb: Math.round((rows.reduce((sum, row) => sum + row.kb_generado, 0) / 1024) * 100) / 100,
  };

  await fs.writeFile(path.join(outputDir, "resumen-atres-imagenes.json"), JSON.stringify(summary, null, 2), "utf8");

  for (const [group, folderName] of Object.entries(categoryFolders)) {
    const groupRows = rows.filter((row) => row.tipo === group);
    if (groupRows.length > 0) {
      await createContactSheet(groupRows, folderName, `hoja-visual-${folderName}.jpg`);
    }
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
