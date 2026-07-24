export type CategoryVisualTheme = {
  eyebrow: string;
  headline: string;
  description: string;
  trendTag: string;
  heroImage: string;
  washClass: string;
  panelClass: string;
  accentClass: string;
  textClass: string;
  mutedTextClass: string;
  chips: string[];
};

type CategoryVisualContent = Omit<
  CategoryVisualTheme,
  "washClass" | "panelClass" | "accentClass" | "textClass" | "mutedTextClass"
>;

const categoryVisualClasses = {
  washClass: "theme-gold-panel",
  panelClass: "bg-black-main/68 text-white ring-white/15 backdrop-blur",
  accentClass: "text-gold-light",
  textClass: "text-white",
  mutedTextClass: "text-white/75",
};

function makeTheme(theme: CategoryVisualContent): CategoryVisualTheme {
  return {
    ...theme,
    ...categoryVisualClasses,
  };
}

const defaultTheme: CategoryVisualTheme = makeTheme({
  eyebrow: "Coleccion ATRES",
  headline: "Moda colombiana directa",
  description: "Una seleccion curada del taller al cliente, con prendas nuevas, precios visibles y compra rapida.",
  trendTag: "#AtresNuevo",
  heroImage: "/assets/atres-curated/banners/banner-campana_atres-004.webp",
  chips: ["Novedad", "Oferta", "Top ventas", "Para ti"],
});

const themes: Record<string, CategoryVisualTheme> = {
  hombre: makeTheme({
    eyebrow: "Hombre ATRES",
    headline: "Prendas claras para el dia a dia.",
    description: "Looks funcionales, urbanos y listos para combinar.",
    trendTag: "#HombreAtres",
    heroImage: "/assets/atres-curated/banners/banner-campana_atres-003.webp",
    chips: ["Casual", "Denim", "Basicos", "Nuevo"],
  }),
  mujer: makeTheme({
    eyebrow: "Mujer ATRES",
    headline: "Siluetas frescas y piezas faciles de llevar.",
    description: "Desde diario hasta un look mas especial, con precios claros.",
    trendTag: "#MujerAtres",
    heroImage: "/assets/atres-curated/banners/banner-campana_atres-004.webp",
    chips: ["Vestidos", "Sets", "Tops", "Nuevo"],
  }),
  infantil: makeTheme({
    eyebrow: "Infantil ATRES",
    headline: "Color, comodidad y prendas para moverse libre.",
    description: "Looks suaves, faciles de combinar y pensados para uso diario.",
    trendTag: "#InfantilColor",
    heroImage: "/assets/atres-curated/products/producto-moda_infantil-001.webp",
    chips: ["Comodo", "Colegio", "Sets", "Nuevo"],
  }),
  ninos: makeTheme({
    eyebrow: "Infantil ATRES",
    headline: "Color, comodidad y prendas para moverse libre.",
    description: "Looks suaves, faciles de combinar y pensados para uso diario.",
    trendTag: "#InfantilColor",
    heroImage: "/assets/atres-curated/products/producto-moda_infantil-001.webp",
    chips: ["Comodo", "Colegio", "Sets", "Nuevo"],
  }),
  ninas: makeTheme({
    eyebrow: "Infantil ATRES",
    headline: "Piezas dulces, frescas y listas para jugar.",
    description: "Vestidos, sets y prendas pequenas con presencia visual limpia.",
    trendTag: "#MiniLooks",
    heroImage: "/assets/atres-curated/products/producto-moda_infantil-008.webp",
    chips: ["Vestidos", "Sets", "Suave", "Nuevo"],
  }),
  urbana: makeTheme({
    eyebrow: "Urbana ATRES",
    headline: "Streetwear con energia de ciudad.",
    description: "Contraste, capas, denim y prendas con actitud para todos los dias.",
    trendTag: "#UrbanoBogota",
    heroImage: "/assets/atres-curated/banners/banner-campana_atres-003.webp",
    chips: ["Drop", "Street", "Denim", "Top"],
  }),
  jeans: makeTheme({
    eyebrow: "Denim ATRES",
    headline: "Azules profundos, fits claros y textura real.",
    description: "Jeans, shorts y siluetas para construir looks de alto uso.",
    trendTag: "#DenimAzul",
    heroImage: "/assets/atres-curated/banners/banner-campana_atres-007.webp",
    chips: ["Wide leg", "Shorts", "Stretch", "Azul"],
  }),
  uniformes: makeTheme({
    eyebrow: "Uniformes ATRES",
    headline: "Orden, resistencia y confianza para comprar por volumen.",
    description: "Prendas funcionales para colegio, empresa y equipos.",
    trendTag: "#UniformeListo",
    heroImage: "/assets/atres-curated/banners/banner-campana_atres-005.webp",
    chips: ["Escolar", "Empresa", "Bordado", "Volumen"],
  }),
  deportivo: makeTheme({
    eyebrow: "Sport ATRES",
    headline: "Movimiento, ajuste y piezas con energia.",
    description: "Ropa para entrenar, caminar y vivir con comodidad activa.",
    trendTag: "#FlexActiva",
    heroImage: "/assets/atres-curated/banners/banner-campana_atres-008.webp",
    chips: ["Flex", "Training", "Ligero", "Respirable"],
  }),
  "textiles-hogar": makeTheme({
    eyebrow: "Hogar ATRES",
    headline: "Sabanas, cobijas y accesorios para casa.",
    description: "Textiles suaves, ropa de cama y detalles practicos para renovar el hogar.",
    trendTag: "#CasaSuave",
    heroImage: "/assets/atres-curated/banners/banner-campana_revision_marca-010.webp",
    chips: ["Sabanas", "Cobijas", "Textiles", "Accesorios"],
  }),
  elegante: makeTheme({
    eyebrow: "Elegante ATRES",
    headline: "Presencia limpia para eventos y noches especiales.",
    description: "Prendas sobrias, brillantes y listas para subir el nivel del look.",
    trendTag: "#NocheAtres",
    heroImage: "/assets/atres-curated/banners/banner-campana_atres-006.webp",
    chips: ["Evento", "Premium", "Satin", "Nuevo"],
  }),
  accesorios: makeTheme({
    eyebrow: "Accesorios ATRES",
    headline: "Detalles que terminan el look.",
    description: "Bolsos, complementos y piezas pequenas con impacto visual.",
    trendTag: "#DetalleFinal",
    heroImage: "/assets/atres-curated/banners/banner-campana_revision_marca-011.webp",
    chips: ["Bolsos", "Regalo", "Top", "Brillo"],
  }),
  calzado: makeTheme({
    eyebrow: "Calzado ATRES",
    headline: "Base fuerte para caminar el dia.",
    description: "Tenis, sandalias y siluetas faciles de combinar.",
    trendTag: "#PasoNuevo",
    heroImage: "/assets/atres-curated/banners/banner-campana_revision_marca-012.webp",
    chips: ["Tenis", "Comodo", "Blanco", "Nuevo"],
  }),
  pijamas: makeTheme({
    eyebrow: "Pijamas ATRES",
    headline: "Descanso con tacto suave y presencia bonita.",
    description: "Prendas relajadas para casa, noche y fines de semana.",
    trendTag: "#DescansoChic",
    heroImage: "/assets/atres-curated/banners/banner-campana_atres-006.webp",
    chips: ["Satin", "Casa", "Suave", "Set"],
  }),
};

export function getCategoryVisualTheme(slug?: string, name?: string): CategoryVisualTheme {
  const key = normalizeThemeKey(slug, name);
  return themes[key] ?? defaultTheme;
}

function normalizeThemeKey(slug?: string, name?: string) {
  const value = `${slug ?? ""} ${name ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (value.includes("hombre") || value.includes("masculin")) return "hombre";
  if (value.includes("mujer") || value.includes("femenin")) return "mujer";
  if (
    value.includes("infantil") ||
    value.includes("nino") ||
    value.includes("nina") ||
    value.includes("bebe") ||
    value.includes("kids")
  ) {
    return "infantil";
  }
  if (value.includes("urbana") || value.includes("urbano") || value.includes("street")) return "urbana";
  if (value.includes("jean") || value.includes("denim") || value.includes("mezclilla")) return "jeans";
  if (value.includes("uniform")) return "uniformes";
  if (value.includes("deport")) return "deportivo";
  if (
    value.includes("textil") ||
    value.includes("hogar") ||
    value.includes("sabana") ||
    value.includes("cobija") ||
    value.includes("ropa de cama") ||
    value.includes("ropa-de-cama")
  ) {
    return "textiles-hogar";
  }
  if (value.includes("elegante") || value.includes("evento")) return "elegante";
  if (value.includes("accesorio") || value.includes("bolso")) return "accesorios";
  if (value.includes("calzado") || value.includes("zapato")) return "calzado";
  if (value.includes("pijama")) return "pijamas";

  return slug ?? "default";
}
