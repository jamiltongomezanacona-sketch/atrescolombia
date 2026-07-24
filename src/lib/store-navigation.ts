import type { Category } from "@/lib/store-data";

export type StoreCategory = Category & {
  id?: string;
  parentId?: string | null;
  parentSlug?: string | null;
  displayOrder?: number;
  children?: StoreCategory[];
};

export type NavItem = {
  key: string;
  label: string;
  href: string;
  kind: "route" | "category";
};

/**
 * Estructura comercial ATRES:
 * principales = Hombre, Mujer, Niños, Hogar
 * el resto vive como subcategorias bajo esos departamentos.
 */
export const PRIMARY_NAV: NavItem[] = [
  { key: "novedades", label: "Novedades", href: "/productos?novedades=1", kind: "route" },
  { key: "hombre", label: "Hombre", href: "/productos?categoria=hombre", kind: "category" },
  { key: "mujer", label: "Mujer", href: "/productos?categoria=mujer", kind: "category" },
  { key: "ninos", label: "Niños", href: "/productos?categoria=ninos", kind: "category" },
  { key: "hogar", label: "Hogar", href: "/productos?categoria=hogar", kind: "category" },
  { key: "tiendas", label: "Tiendas", href: "/tiendas", kind: "route" },
  { key: "ofertas", label: "Ofertas", href: "/productos?ofertas=1", kind: "route" },
];

/** Slugs equivalentes por departamento (DB + alias legacy). */
export const DEPARTMENT_SLUGS: Record<string, string[]> = {
  hombre: ["hombre", "moda-hombre"],
  mujer: ["mujer", "moda-mujer"],
  ninos: [
    "ninos",
    "nino",
    "ninas",
    "nina",
    "bebes",
    "bebe",
    "infantil",
    "kids",
    "baby",
    "moda-ninos",
    "moda-ninas",
    "moda-infantil",
  ],
  hogar: [
    "hogar",
    "hogar-y-vida",
    "textiles",
    "textiles-para-hogar",
    "textiles-hogar",
    "sabanas",
    "cobijas",
    "ropa-de-cama",
    "lenceria-hogar",
    "accesorios-hogar",
    "decoracion-hogar",
  ],
};

export const PRIMARY_DEPARTMENT_KEYS = ["hombre", "mujer", "ninos", "hogar"] as const;

export function normalizeNavSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^moda-/, "")
    .replace(/^ropa-/, "");
}

export function categorySlugMatches(slug: string, targetSlugs: string[]) {
  const normalized = normalizeNavSlug(slug);
  return targetSlugs.some((item) => normalizeNavSlug(item) === normalized);
}

export function buildCategoryTree(categories: StoreCategory[]): StoreCategory[] {
  const byId = new Map<string, StoreCategory>();
  const roots: StoreCategory[] = [];

  for (const category of categories) {
    byId.set(category.id ?? category.slug, { ...category, children: [] });
  }

  for (const category of categories) {
    const node = byId.get(category.id ?? category.slug);
    if (!node) continue;

    if (category.parentId && byId.has(category.parentId)) {
      byId.get(category.parentId)?.children?.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function findCategoryBySlug(categories: StoreCategory[], slug: string) {
  const normalized = normalizeNavSlug(slug);
  return categories.find((category) => normalizeNavSlug(category.slug) === normalized);
}

export function getChildCategories(categories: StoreCategory[], parent: StoreCategory) {
  if (!parent.id) {
    return categories.filter((category) => category.parentSlug === parent.slug);
  }
  return categories.filter((category) => category.parentId === parent.id);
}

export function getDepartmentSlugsForCategory(slug: string): string[] {
  for (const slugs of Object.values(DEPARTMENT_SLUGS)) {
    if (slugs.some((item) => normalizeNavSlug(item) === normalizeNavSlug(slug))) {
      return slugs;
    }
  }
  return [slug];
}

export function getDepartmentKeyForSlug(slug: string): string | null {
  const normalized = normalizeNavSlug(slug);
  for (const [key, slugs] of Object.entries(DEPARTMENT_SLUGS)) {
    if (slugs.some((item) => normalizeNavSlug(item) === normalized)) {
      return key;
    }
  }
  return null;
}

/** Secciones del home: solo los 4 departamentos principales. */
export const HOME_DEPARTMENT_SECTIONS = [
  { key: "hombre", title: "Hombre", href: "/productos?categoria=hombre", id: "seccion-hombre" },
  { key: "mujer", title: "Mujer", href: "/productos?categoria=mujer", id: "seccion-mujer" },
  { key: "ninos", title: "Niños", href: "/productos?categoria=ninos", id: "seccion-ninos" },
  { key: "hogar", title: "Hogar", href: "/productos?categoria=hogar", id: "seccion-hogar" },
] as const;

export function filterProductsByDepartmentKeys<
  T extends { slug: string; categorySlug: string; categoryName: string },
>(products: T[], keys: string[]): T[] {
  const allowed = keys.flatMap((key) => DEPARTMENT_SLUGS[key] ?? [key]);
  const seen = new Set<string>();

  return products.filter((product) => {
    if (seen.has(product.slug)) return false;
    const match =
      categorySlugMatches(product.categorySlug, allowed) ||
      categorySlugMatches(product.categoryName, allowed);
    if (match) seen.add(product.slug);
    return match;
  });
}

export function countProductsForDepartment(
  departmentKey: string,
  productCategorySlugs: string[],
): number {
  const slugs = DEPARTMENT_SLUGS[departmentKey];
  if (!slugs) return 0;
  return productCategorySlugs.filter((slug) => categorySlugMatches(slug, slugs)).length;
}

export function buildPrimaryNavItems(
  categories: StoreCategory[],
  productCategorySlugs: string[],
): NavItem[] {
  const available = new Set(categories.map((category) => normalizeNavSlug(category.slug)));

  return PRIMARY_NAV.filter((item) => {
    if (item.kind === "route") return true;

    const departmentSlugs = DEPARTMENT_SLUGS[item.key] ?? [item.href.split("/").pop() ?? ""];
    const hasCategory = departmentSlugs.some((slug) => available.has(normalizeNavSlug(slug)));
    const hasProducts = countProductsForDepartment(item.key, productCategorySlugs) > 0;

    // Los 4 departamentos principales siempre visibles en navegacion.
    if ((PRIMARY_DEPARTMENT_KEYS as readonly string[]).includes(item.key)) {
      return true;
    }

    return hasCategory || hasProducts;
  });
}

export function getTopLevelCategories(categories: StoreCategory[]): StoreCategory[] {
  return categories.filter((category) => !category.parentId);
}

/**
 * Prioriza Hombre / Mujer / Ninos / Hogar.
 * Otras categorias raiz (legacy) van al final.
 */
export function sortCategoriesForDisplay(categories: StoreCategory[]): StoreCategory[] {
  const primaryOrder = PRIMARY_DEPARTMENT_KEYS.flatMap((key) => DEPARTMENT_SLUGS[key] ?? []);

  return [...categories].sort((a, b) => {
    const aIndex = primaryOrder.findIndex((slug) => categorySlugMatches(a.slug, [slug]));
    const bIndex = primaryOrder.findIndex((slug) => categorySlugMatches(b.slug, [slug]));

    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    }

    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name, "es");
  });
}

/** Solo departamentos principales para circulos/home (si existen en DB o hay alias). */
export function getPrimaryDepartmentsForDisplay(categories: StoreCategory[]): StoreCategory[] {
  const sorted = sortCategoriesForDisplay(getTopLevelCategories(categories));
  const primary: StoreCategory[] = [];
  const seenKeys = new Set<string>();

  for (const category of sorted) {
    const key = getDepartmentKeyForSlug(category.slug);
    if (!key || !(PRIMARY_DEPARTMENT_KEYS as readonly string[]).includes(key)) continue;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    primary.push({
      ...category,
      name: PRIMARY_NAV.find((item) => item.key === key)?.label ?? category.name,
      shortName: PRIMARY_NAV.find((item) => item.key === key)?.label ?? category.shortName,
      slug: DEPARTMENT_SLUGS[key]?.[0] ?? category.slug,
    });
  }

  // Placeholders tipograficos si aun no hay categoria en DB (enlace listo).
  for (const key of PRIMARY_DEPARTMENT_KEYS) {
    if (seenKeys.has(key)) continue;
    const nav = PRIMARY_NAV.find((item) => item.key === key);
    if (!nav) continue;
    primary.push({
      slug: DEPARTMENT_SLUGS[key]?.[0] ?? key,
      name: nav.label,
      shortName: nav.label,
      description:
        key === "hogar"
          ? "Sabanas, cobijas, textiles y accesorios para renovar tu hogar."
          : `Explora ${nav.label.toLowerCase()} en ATRES.`,
      image:
        key === "hogar"
          ? "/assets/atres-curated/banners/banner-campana_revision_marca-010.webp"
          : key === "ninos"
            ? "/assets/atres-curated/products/producto-moda_infantil-001.webp"
            : key === "mujer"
              ? "/assets/atres-curated/banners/banner-campana_atres-004.webp"
              : "/assets/atres-curated/banners/banner-campana_atres-003.webp",
      parentId: null,
    });
  }

  return primary;
}

export function getDescendantCategorySlugs(categories: StoreCategory[], rootSlug: string): string[] {
  const root = findCategoryBySlug(categories, rootSlug);
  if (!root) {
    return getDepartmentSlugsForCategory(rootSlug);
  }

  const slugs = new Set<string>([root.slug, ...getDepartmentSlugsForCategory(root.slug)]);

  function collect(parentId: string) {
    for (const category of categories) {
      if (category.parentId === parentId) {
        slugs.add(category.slug);
        if (category.id) collect(category.id);
      }
    }
  }

  if (root.id) collect(root.id);

  return Array.from(slugs);
}

/** Active state for header/drawer links, including /productos?categoria=… filters. */
export function isStoreNavActive(
  link: NavItem,
  context: {
    pathname: string;
    categoria?: string | null;
    ofertas?: string | null;
    novedades?: string | null;
    tienda?: string | null;
  },
) {
  const pathname = context.pathname;
  const categoria = context.categoria ?? null;
  const ofertas = context.ofertas ?? null;
  const novedades = context.novedades ?? null;
  const tienda = context.tienda ?? null;
  const hasCatalogFilter = Boolean(categoria || ofertas || novedades || tienda);

  if (link.href === "/productos" || link.key === "todo") {
    return pathname === "/productos" && !hasCatalogFilter;
  }

  if (link.key === "novedades" || link.href.includes("novedades=1") || link.href === "/novedades") {
    return pathname === "/novedades" || (pathname === "/productos" && Boolean(novedades));
  }

  if (link.key === "tiendas" || link.href === "/tiendas" || link.href.startsWith("/tiendas/")) {
    return pathname === "/tiendas" || pathname.startsWith("/tiendas/") || (pathname === "/productos" && Boolean(tienda));
  }

  if (
    link.key === "ofertas" ||
    link.href.includes("ofertas=1") ||
    link.href === "/ofertas" ||
    link.href === "/promociones"
  ) {
    return (
      pathname === "/ofertas" ||
      pathname === "/promociones" ||
      (pathname === "/productos" && Boolean(ofertas))
    );
  }

  if (pathname === link.href || pathname.startsWith(`${link.href}/`)) {
    return true;
  }

  if (pathname === "/productos" && categoria && link.kind === "category") {
    const linkSlug = catalogCategoriaFromHref(link.href) ?? link.href.replace(/^\/categoria\//, "");
    const departmentSlugs = DEPARTMENT_SLUGS[link.key] ?? [linkSlug];
    return (
      categorySlugMatches(categoria, departmentSlugs) ||
      normalizeNavSlug(categoria) === normalizeNavSlug(linkSlug)
    );
  }

  return false;
}

function catalogCategoriaFromHref(href: string) {
  if (!href.includes("categoria=")) return null;
  try {
    return new URL(href, "https://atres.local").searchParams.get("categoria");
  } catch {
    return null;
  }
}

