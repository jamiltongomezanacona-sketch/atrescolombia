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

const defaultTheme: CategoryVisualTheme = {
  eyebrow: "Coleccion ATRES",
  headline: "Moda colombiana directa",
  description: "Una seleccion curada del taller al cliente, con prendas nuevas, precios visibles y compra rapida.",
  trendTag: "#AtresNuevo",
  heroImage: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80",
  washClass: "bg-[linear-gradient(135deg,#f7f3ec_0%,#fff7ed_42%,#dbeafe_100%)]",
  panelClass: "bg-white/[0.74] text-[#171717] ring-black/10",
  accentClass: "text-brand",
  textClass: "text-[#171717]",
  mutedTextClass: "text-stone-600",
  chips: ["Novedad", "Oferta", "Top ventas", "Para ti"],
};

const themes: Record<string, CategoryVisualTheme> = {
  hombre: {
    eyebrow: "Hombre ATRES",
    headline: "Prendas claras para el dia a dia.",
    description: "Looks funcionales, urbanos y listos para combinar.",
    trendTag: "#HombreAtres",
    heroImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#111827_0%,#334155_48%,#bbf7d0_100%)]",
    panelClass: "bg-black/50 text-white ring-white/15",
    accentClass: "text-lime-200",
    textClass: "text-white",
    mutedTextClass: "text-white/75",
    chips: ["Casual", "Denim", "Basicos", "Nuevo"],
  },
  mujer: {
    eyebrow: "Mujer ATRES",
    headline: "Siluetas frescas y piezas faciles de llevar.",
    description: "Desde diario hasta un look mas especial, con precios claros.",
    trendTag: "#MujerAtres",
    heroImage: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#fff1f2_0%,#fce7f3_44%,#e0f2fe_100%)]",
    panelClass: "bg-white/[0.78] text-[#2b1521] ring-pink-200/70",
    accentClass: "text-pink-700",
    textClass: "text-[#2b1521]",
    mutedTextClass: "text-stone-600",
    chips: ["Vestidos", "Sets", "Tops", "Nuevo"],
  },
  infantil: {
    eyebrow: "Infantil ATRES",
    headline: "Color, comodidad y prendas para moverse libre.",
    description: "Looks suaves, faciles de combinar y pensados para uso diario.",
    trendTag: "#InfantilColor",
    heroImage: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#eff6ff_0%,#fef3c7_46%,#ffe4e6_100%)]",
    panelClass: "bg-white/[0.78] text-[#132236] ring-sky-200/70",
    accentClass: "text-sky-700",
    textClass: "text-[#132236]",
    mutedTextClass: "text-slate-600",
    chips: ["Comodo", "Colegio", "Sets", "Nuevo"],
  },
  ninos: {
    eyebrow: "Infantil ATRES",
    headline: "Color, comodidad y prendas para moverse libre.",
    description: "Looks suaves, faciles de combinar y pensados para uso diario.",
    trendTag: "#InfantilColor",
    heroImage: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#eff6ff_0%,#fef3c7_46%,#ffe4e6_100%)]",
    panelClass: "bg-white/[0.78] text-[#132236] ring-sky-200/70",
    accentClass: "text-sky-700",
    textClass: "text-[#132236]",
    mutedTextClass: "text-slate-600",
    chips: ["Comodo", "Colegio", "Sets", "Nuevo"],
  },
  ninas: {
    eyebrow: "Infantil ATRES",
    headline: "Piezas dulces, frescas y listas para jugar.",
    description: "Vestidos, sets y prendas pequenas con presencia visual limpia.",
    trendTag: "#MiniLooks",
    heroImage: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#fff1f2_0%,#fce7f3_44%,#e0f2fe_100%)]",
    panelClass: "bg-white/[0.78] text-[#2b1521] ring-pink-200/70",
    accentClass: "text-pink-700",
    textClass: "text-[#2b1521]",
    mutedTextClass: "text-stone-600",
    chips: ["Vestidos", "Sets", "Suave", "Nuevo"],
  },
  urbana: {
    eyebrow: "Urbana ATRES",
    headline: "Streetwear con energia de ciudad.",
    description: "Contraste, capas, denim y prendas con actitud para todos los dias.",
    trendTag: "#UrbanoBogota",
    heroImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#111827_0%,#334155_48%,#bbf7d0_100%)]",
    panelClass: "bg-black/50 text-white ring-white/15",
    accentClass: "text-lime-200",
    textClass: "text-white",
    mutedTextClass: "text-white/75",
    chips: ["Drop", "Street", "Denim", "Top"],
  },
  jeans: {
    eyebrow: "Denim ATRES",
    headline: "Azules profundos, fits claros y textura real.",
    description: "Jeans, shorts y siluetas para construir looks de alto uso.",
    trendTag: "#DenimAzul",
    heroImage: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#dbeafe_0%,#1e3a8a_46%,#111827_100%)]",
    panelClass: "bg-white/[0.76] text-[#101827] ring-blue-200/70",
    accentClass: "text-blue-800",
    textClass: "text-[#101827]",
    mutedTextClass: "text-slate-600",
    chips: ["Wide leg", "Shorts", "Stretch", "Azul"],
  },
  uniformes: {
    eyebrow: "Uniformes ATRES",
    headline: "Orden, resistencia y confianza para comprar por volumen.",
    description: "Prendas funcionales para colegio, empresa y equipos.",
    trendTag: "#UniformeListo",
    heroImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#f8fafc_0%,#dbeafe_50%,#dcfce7_100%)]",
    panelClass: "bg-white/[0.82] text-[#14213d] ring-slate-200",
    accentClass: "text-emerald-800",
    textClass: "text-[#14213d]",
    mutedTextClass: "text-slate-600",
    chips: ["Escolar", "Empresa", "Bordado", "Volumen"],
  },
  deportivo: {
    eyebrow: "Sport ATRES",
    headline: "Movimiento, ajuste y piezas con energia.",
    description: "Ropa para entrenar, caminar y vivir con comodidad activa.",
    trendTag: "#FlexActiva",
    heroImage: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#ecfeff_0%,#a7f3d0_42%,#111827_100%)]",
    panelClass: "bg-black/50 text-white ring-white/15",
    accentClass: "text-emerald-200",
    textClass: "text-white",
    mutedTextClass: "text-white/75",
    chips: ["Flex", "Training", "Ligero", "Respirable"],
  },
  "textiles-hogar": {
    eyebrow: "Hogar ATRES",
    headline: "Texturas calmas para renovar espacios.",
    description: "Piezas suaves, limpias y faciles de combinar en casa.",
    trendTag: "#CasaSuave",
    heroImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#fafaf9_0%,#e7e5e4_45%,#d9f99d_100%)]",
    panelClass: "bg-white/80 text-[#262019] ring-stone-200",
    accentClass: "text-lime-800",
    textClass: "text-[#262019]",
    mutedTextClass: "text-stone-600",
    chips: ["Suave", "Set", "Hogar", "Premium"],
  },
  elegante: {
    eyebrow: "Elegante ATRES",
    headline: "Presencia limpia para eventos y noches especiales.",
    description: "Prendas sobrias, brillantes y listas para subir el nivel del look.",
    trendTag: "#NocheAtres",
    heroImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#0f0f10_0%,#3f2a38_50%,#fde68a_100%)]",
    panelClass: "bg-black/50 text-white ring-white/15",
    accentClass: "text-amber-200",
    textClass: "text-white",
    mutedTextClass: "text-white/75",
    chips: ["Evento", "Premium", "Satin", "Nuevo"],
  },
  accesorios: {
    eyebrow: "Accesorios ATRES",
    headline: "Detalles que terminan el look.",
    description: "Bolsos, complementos y piezas pequenas con impacto visual.",
    trendTag: "#DetalleFinal",
    heroImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#fff7ed_0%,#fce7f3_46%,#dbeafe_100%)]",
    panelClass: "bg-white/[0.78] text-[#24151c] ring-pink-200/70",
    accentClass: "text-rose-700",
    textClass: "text-[#24151c]",
    mutedTextClass: "text-stone-600",
    chips: ["Bolsos", "Regalo", "Top", "Brillo"],
  },
  calzado: {
    eyebrow: "Calzado ATRES",
    headline: "Base fuerte para caminar el dia.",
    description: "Tenis, sandalias y siluetas faciles de combinar.",
    trendTag: "#PasoNuevo",
    heroImage: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#f5f5f4_0%,#d6d3d1_42%,#bae6fd_100%)]",
    panelClass: "bg-white/[0.78] text-[#1c1917] ring-stone-200",
    accentClass: "text-sky-800",
    textClass: "text-[#1c1917]",
    mutedTextClass: "text-stone-600",
    chips: ["Tenis", "Comodo", "Blanco", "Nuevo"],
  },
  pijamas: {
    eyebrow: "Pijamas ATRES",
    headline: "Descanso con tacto suave y presencia bonita.",
    description: "Prendas relajadas para casa, noche y fines de semana.",
    trendTag: "#DescansoChic",
    heroImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    washClass: "bg-[linear-gradient(135deg,#eef2ff_0%,#fae8ff_44%,#fef3c7_100%)]",
    panelClass: "bg-white/[0.78] text-[#221a34] ring-violet-200/70",
    accentClass: "text-violet-700",
    textClass: "text-[#221a34]",
    mutedTextClass: "text-stone-600",
    chips: ["Satin", "Casa", "Suave", "Set"],
  },
};

export function getCategoryVisualTheme(slug?: string, name?: string): CategoryVisualTheme {
  const key = normalizeThemeKey(slug, name);
  return themes[key] ?? defaultTheme;
}

function normalizeThemeKey(slug?: string, name?: string) {
  const value = `${slug ?? ""} ${name ?? ""}`.toLowerCase();

  if (value.includes("hombre") || value.includes("masculin")) return "hombre";
  if (value.includes("mujer") || value.includes("femenin")) return "mujer";
  if (
    value.includes("infantil") ||
    value.includes("niño") ||
    value.includes("nino") ||
    value.includes("niña") ||
    value.includes("nina") ||
    value.includes("bebe") ||
    value.includes("bebé") ||
    value.includes("kids")
  ) {
    return "infantil";
  }
  if (value.includes("urbana") || value.includes("urbano") || value.includes("street")) return "urbana";
  if (value.includes("jean") || value.includes("denim") || value.includes("mezclilla")) return "jeans";
  if (value.includes("uniform")) return "uniformes";
  if (value.includes("deport")) return "deportivo";
  if (value.includes("textil") || value.includes("hogar")) return "textiles-hogar";
  if (value.includes("elegante") || value.includes("evento")) return "elegante";
  if (value.includes("accesorio") || value.includes("bolso")) return "accesorios";
  if (value.includes("calzado") || value.includes("zapato")) return "calzado";
  if (value.includes("pijama")) return "pijamas";

  return slug ?? "default";
}
