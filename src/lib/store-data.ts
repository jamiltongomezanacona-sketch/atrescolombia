export type Category = {
  slug: string;
  name: string;
  shortName: string;
  image: string;
  description: string;
  id?: string;
  parentId?: string | null;
  parentSlug?: string | null;
  displayOrder?: number;
};

export type Product = {
  id?: string;
  sku?: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  previousPrice?: number;
  badge?: string;
  isNew?: boolean;
  isTrending?: boolean;
  isPromo?: boolean;
  rating: number;
  stock: number;
  image: string;
  images: string[];
  colors: string[];
  sizes: string[];
  description: string;
  details: string[];
  collection: string;
  shopId?: string;
  shopSlug?: string;
  shopName?: string;
  shopCity?: string;
  shopLocality?: string;
  shopNeighborhood?: string;
};

export type Promo = {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  tone: string;
};

export const categories: Category[] = [
  {
    slug: "mujer",
    name: "Moda mujer",
    shortName: "Mujer",
    image:
      "/assets/atres-curated/banners/banner-campana_atres-004.webp",
    description: "Vestidos, blusas, sets y prendas tendencia para todos los dias.",
  },
  {
    slug: "hombre",
    name: "Moda hombre",
    shortName: "Hombre",
    image:
      "/assets/atres-curated/banners/banner-campana_atres-003.webp",
    description: "Prendas urbanas, camisas, denim y basicos versatiles.",
  },
  {
    slug: "ninos",
    name: "Ninos",
    shortName: "Ninos",
    image:
      "/assets/atres-curated/products/producto-moda_infantil-001.webp",
    description: "Ropa comoda, colorida y resistente para pequenos.",
  },
  {
    slug: "hogar",
    name: "Hogar",
    shortName: "Hogar",
    image:
      "/assets/atres-curated/banners/banner-campana_revision_marca-010.webp",
    description: "Sabanas, cobijas, textiles y accesorios para renovar tu hogar.",
  },
  {
    slug: "ninas",
    name: "Ninas",
    shortName: "Ninas",
    image:
      "/assets/atres-curated/products/producto-moda_infantil-008.webp",
    description: "Vestidos, sets y novedades infantiles con estilo.",
  },
  {
    slug: "pijamas",
    name: "Pijamas",
    shortName: "Pijamas",
    image:
      "/assets/atres-curated/banners/banner-campana_atres-009.webp",
    description: "Prendas suaves para descanso, casa y fines de semana.",
  },
  {
    slug: "jeans",
    name: "Jeans",
    shortName: "Jeans",
    image:
      "/assets/atres-curated/banners/banner-campana_atres-007.webp",
    description: "Denim, pantalones, shorts y fits esenciales.",
  },
  {
    slug: "deportivo",
    name: "Ropa deportiva",
    shortName: "Deportivo",
    image:
      "/assets/atres-curated/banners/banner-campana_atres-008.webp",
    description: "Leggings, tops, joggers y prendas para moverte.",
  },
  {
    slug: "uniformes",
    name: "Uniformes",
    shortName: "Uniformes",
    image:
      "/assets/atres-curated/banners/banner-campana_atres-005.webp",
    description: "Basicos funcionales para colegios, empresas y equipos.",
  },
  {
    slug: "calzado",
    name: "Calzado",
    shortName: "Calzado",
    image:
      "/assets/atres-curated/banners/banner-campana_revision_marca-012.webp",
    description: "Tenis, sandalias y zapatos para completar el look.",
  },
  {
    slug: "accesorios",
    name: "Accesorios",
    shortName: "Accesorios",
    image:
      "/assets/atres-curated/banners/banner-campana_revision_marca-011.webp",
    description: "Bolsos, gafas, complementos y detalles de temporada.",
  },
];

export const products: Product[] = [
  {
    slug: "vestido-lino-brisa",
    name: "Vestido lino Brisa",
    categorySlug: "mujer",
    categoryName: "Moda mujer",
    price: 119900,
    previousPrice: 159900,
    badge: "Oferta",
    isTrending: true,
    isPromo: true,
    rating: 4.8,
    stock: 18,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-008.webp",
    images: [
      "/assets/atres-curated/products/producto-moda_infantil-040.webp",
      "/assets/atres-curated/products/producto-moda_infantil-060.webp",
      "/assets/atres-curated/banners/banner-campana_atres-004.webp",
    ],
    colors: ["Arena", "Oliva", "Negro"],
    sizes: ["S", "M", "L"],
    description:
      "Vestido fresco de silueta limpia para dias calidos, salidas casuales y looks de temporada.",
    details: ["Tela liviana", "Corte regular", "Forro suave", "Hecho para uso diario"],
    collection: "Old Money Tropical",
  },
  {
    slug: "camisa-rayas-costa",
    name: "Camisa rayas Costa",
    categorySlug: "hombre",
    categoryName: "Moda hombre",
    price: 89900,
    previousPrice: 119900,
    badge: "-25%",
    isPromo: true,
    rating: 4.7,
    stock: 24,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-040.webp",
    images: [
      "/assets/atres-curated/products/producto-moda_infantil-008.webp",
      "/assets/atres-curated/products/producto-moda_infantil-040.webp",
    ],
    colors: ["Azul", "Blanco", "Verde"],
    sizes: ["S", "M", "L", "XL"],
    description: "Camisa ligera con rayas verticales, ideal para clima calido y estilo casual.",
    details: ["Manga corta", "Cuello clasico", "Fit relajado", "Textura fresca"],
    collection: "Costa Urbana",
  },
  {
    slug: "set-infantil-sol",
    name: "Set infantil Sol",
    categorySlug: "ninos",
    categoryName: "Ninos",
    price: 74900,
    previousPrice: 94900,
    badge: "Nuevo",
    isNew: true,
    rating: 4.9,
    stock: 30,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-030.webp",
    images: [
      "/assets/atres-curated/products/producto-moda_infantil-001.webp",
      "/assets/atres-curated/products/producto-moda_infantil-008.webp",
    ],
    colors: ["Mostaza", "Azul cielo", "Coral"],
    sizes: ["2", "4", "6", "8", "10"],
    description: "Set infantil comodo y colorido para juego, colegio y fines de semana.",
    details: ["Algodon suave", "Elastico comodo", "Costuras reforzadas", "Secado rapido"],
    collection: "Mini Color",
  },
  {
    slug: "set-sabanas-brisa",
    name: "Set sabanas Brisa",
    categorySlug: "hogar",
    categoryName: "Hogar",
    price: 89900,
    previousPrice: 119900,
    badge: "Nuevo",
    isNew: true,
    rating: 4.7,
    stock: 18,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-060.webp",
    images: [
      "/assets/atres-curated/products/producto-moda_infantil-060.webp",
      "/assets/atres-curated/banners/banner-campana_revision_marca-010.webp",
    ],
    colors: ["Blanco", "Arena", "Gris"],
    sizes: ["Sencilla", "Doble", "Queen"],
    description: "Set de sabanas suaves para renovar la cama con textura limpia y fresca.",
    details: ["Ropa de cama", "Tacto suave", "Lavado facil", "Disponible para entrega"],
    collection: "Casa Suave",
  },
  {
    slug: "enterizo-flor-luna",
    name: "Enterizo flor Luna",
    categorySlug: "ninas",
    categoryName: "Ninas",
    price: 82900,
    badge: "Nuevo",
    isNew: true,
    rating: 4.6,
    stock: 16,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-008.webp",
    images: [
      "/assets/atres-curated/products/producto-moda_infantil-008.webp",
      "/assets/atres-curated/products/producto-moda_infantil-012.webp",
    ],
    colors: ["Rosa", "Crema"],
    sizes: ["2", "4", "6", "8"],
    description: "Enterizo suave con estampado floral para una silueta fresca y comoda.",
    details: ["Tacto suave", "Broches practicos", "Estampado delicado", "Fit comodo"],
    collection: "Mini Color",
  },
  {
    slug: "pijama-satin-noche",
    name: "Pijama satin Noche",
    categorySlug: "pijamas",
    categoryName: "Pijamas",
    price: 99900,
    previousPrice: 129900,
    badge: "Especial",
    isPromo: true,
    rating: 4.8,
    stock: 22,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-040.webp",
    images: [
      "/assets/atres-curated/banners/banner-campana_atres-006.webp",
      "/assets/atres-curated/products/producto-moda_infantil-060.webp",
    ],
    colors: ["Champana", "Negro", "Rosa"],
    sizes: ["S", "M", "L"],
    description: "Pijama satinada con caida suave para descanso elegante y comodo.",
    details: ["Satin suave", "Pretina comoda", "Set dos piezas", "Brillo sutil"],
    collection: "Night Edit",
  },
  {
    slug: "jean-wide-azul",
    name: "Jean wide Azul",
    categorySlug: "jeans",
    categoryName: "Jeans",
    price: 139900,
    previousPrice: 169900,
    badge: "Top",
    isTrending: true,
    rating: 4.7,
    stock: 20,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-012.webp",
    images: [
      "/assets/atres-curated/banners/banner-campana_atres-007.webp",
      "/assets/atres-curated/products/producto-moda_infantil-050.webp",
    ],
    colors: ["Azul medio", "Azul oscuro"],
    sizes: ["6", "8", "10", "12", "14"],
    description: "Jean wide leg de tiro alto con lavado azul clasico y estructura favorecedora.",
    details: ["Tiro alto", "Bota amplia", "Denim medio", "Cinco bolsillos"],
    collection: "Denim Club",
  },
  {
    slug: "legging-flex-pro",
    name: "Legging Flex Pro",
    categorySlug: "deportivo",
    categoryName: "Ropa deportiva",
    price: 69900,
    previousPrice: 89900,
    badge: "2x",
    isTrending: true,
    isPromo: true,
    rating: 4.6,
    stock: 40,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-001.webp",
    images: [
      "/assets/atres-curated/products/producto-moda_infantil-050.webp",
      "/assets/atres-curated/banners/banner-campana_atres-008.webp",
    ],
    colors: ["Negro", "Verde", "Vino"],
    sizes: ["S", "M", "L", "XL"],
    description: "Legging deportivo con compresion media, ideal para entrenar o usar a diario.",
    details: ["Pretina alta", "Secado rapido", "Elasticidad 4D", "No transparente"],
    collection: "Active Daily",
  },
  {
    slug: "chaqueta-varsity-atres",
    name: "Chaqueta varsity ATRES",
    categorySlug: "uniformes",
    categoryName: "Uniformes",
    price: 179900,
    badge: "Tendencia",
    isTrending: true,
    rating: 4.5,
    stock: 12,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-060.webp",
    images: [
      "/assets/atres-curated/products/producto-moda_infantil-060.webp",
      "/assets/atres-curated/banners/banner-campana_atres-005.webp",
    ],
    colors: ["Negro", "Azul", "Verde"],
    sizes: ["S", "M", "L", "XL"],
    description: "Chaqueta estilo varsity con presencia urbana y acabados resistentes.",
    details: ["Cuello bomber", "Broches frontales", "Rib en punos", "Forro interno"],
    collection: "Campus Drop",
  },
  {
    slug: "tenis-nomada-blanco",
    name: "Tenis Nomada blanco",
    categorySlug: "calzado",
    categoryName: "Calzado",
    price: 189900,
    previousPrice: 229900,
    badge: "-17%",
    isPromo: true,
    rating: 4.8,
    stock: 14,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-020.webp",
    images: [
      "/assets/atres-curated/banners/banner-campana_revision_marca-012.webp",
      "/assets/atres-curated/products/producto-moda_infantil-012.webp",
    ],
    colors: ["Blanco", "Miel", "Grafito"],
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    description: "Tenis blanco versatil con horma comoda para combinar con looks casuales.",
    details: ["Suela liviana", "Plantilla acolchada", "Exterior resistente", "Horma regular"],
    collection: "Street Basic",
  },
  {
    slug: "bolso-mini-brillo",
    name: "Bolso mini Brillo",
    categorySlug: "accesorios",
    categoryName: "Accesorios",
    price: 59900,
    previousPrice: 79900,
    badge: "Hot",
    isTrending: true,
    rating: 4.4,
    stock: 26,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-001.webp",
    images: [
      "/assets/atres-curated/banners/banner-campana_revision_marca-011.webp",
      "/assets/atres-curated/products/producto-moda_infantil-008.webp",
    ],
    colors: ["Dorado", "Negro", "Plateado"],
    sizes: ["Unica"],
    description: "Bolso mini de acabado brillante para elevar looks de noche o eventos.",
    details: ["Correa removible", "Cierre seguro", "Interior compacto", "Acabado brillante"],
    collection: "Party Icons",
  },
  {
    slug: "top-crop-aurora",
    name: "Top crop Aurora",
    categorySlug: "mujer",
    categoryName: "Moda mujer",
    price: 49900,
    previousPrice: 69900,
    badge: "Flash",
    isNew: true,
    isPromo: true,
    rating: 4.5,
    stock: 35,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-012.webp",
    images: [
      "/assets/atres-curated/products/producto-moda_infantil-030.webp",
      "/assets/atres-curated/products/producto-moda_infantil-060.webp",
    ],
    colors: ["Blanco", "Lila", "Negro"],
    sizes: ["XS", "S", "M", "L"],
    description: "Top crop ajustado con escote limpio para combinar con denim, faldas o sets.",
    details: ["Tejido elastico", "Fit ajustado", "Tacto suave", "Basico tendencia"],
    collection: "Daily Trend",
  },
  {
    slug: "short-denim-claro",
    name: "Short denim claro",
    categorySlug: "jeans",
    categoryName: "Jeans",
    price: 79900,
    previousPrice: 99900,
    badge: "Oferta",
    isPromo: true,
    rating: 4.3,
    stock: 28,
    image:
      "/assets/atres-curated/products/producto-moda_infantil-020.webp",
    images: [
      "/assets/atres-curated/products/producto-moda_infantil-020.webp",
      "/assets/atres-curated/banners/banner-campana_atres-007.webp",
    ],
    colors: ["Azul claro", "Negro"],
    sizes: ["6", "8", "10", "12"],
    description: "Short denim con lavado claro y fit casual para looks de clima calido.",
    details: ["Tiro medio", "Dobladillo limpio", "Denim suave", "Bolsillos funcionales"],
    collection: "Denim Club",
  },
];

export const promos: Promo[] = [
  {
    title: "Especiales hasta 35%",
    subtitle: "Precios de temporada en prendas seleccionadas.",
    href: "/ofertas",
    image:
      "/assets/atres-curated/banners/banner-campana_atres-001.webp",
    tone: "bg-gold text-black-main",
  },
  {
    title: "Novedades de la semana",
    subtitle: "Drops frescos para renovar el closet.",
    href: "/novedades",
    image:
      "/assets/atres-curated/banners/banner-campana_atres-003.webp",
    tone: "bg-black-main text-white",
  },
  {
    title: "Denim Club",
    subtitle: "Jeans, shorts y siluetas esenciales.",
    href: "/categoria/jeans",
    image:
      "/assets/atres-curated/banners/banner-campana_atres-007.webp",
    tone: "bg-surface text-ink",
  },
];

export function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return products.filter((product) => product.categorySlug === slug);
}

export function getPromoProducts() {
  return products.filter((product) => product.isPromo);
}

export function getNewProducts() {
  return products.filter((product) => product.isNew);
}

export function getTrendingProducts() {
  return products.filter((product) => product.isTrending);
}

export function getRelatedProducts(product: Product) {
  return products
    .filter((item) => item.slug !== product.slug && item.categorySlug === product.categorySlug)
    .slice(0, 4);
}

export function getDiscountPercent(product: Product) {
  if (!product.previousPrice) {
    return null;
  }

  return Math.round(((product.previousPrice - product.price) / product.previousPrice) * 100);
}

export function searchProducts(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return products;
  }

  return products.filter((product) =>
    [product.name, product.categoryName, product.collection, product.description]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}
