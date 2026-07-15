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

/** Orden comercial ATRES — rutas especiales + slugs de categoría en DB. */
export const PRIMARY_NAV: NavItem[] = [
  { key: "novedades", label: "Novedades", href: "/novedades", kind: "route" },
  { key: "mujer", label: "Mujer", href: "/categoria/mujer", kind: "category" },
  { key: "hombre", label: "Hombre", href: "/categoria/hombre", kind: "category" },
  { key: "nina", label: "Niña", href: "/categoria/ninas", kind: "category" },
  { key: "nino", label: "Niño", href: "/categoria/ninos", kind: "category" },
  { key: "bebes", label: "Bebés", href: "/categoria/bebes", kind: "category" },
  { key: "pijamas", label: "Pijamas", href: "/categoria/pijamas", kind: "category" },
  { key: "deportivo", label: "Deportivo", href: "/categoria/deportivo", kind: "category" },
  { key: "uniformes", label: "Uniformes", href: "/categoria/uniformes", kind: "category" },
  { key: "ofertas", label: "Ofertas", href: "/ofertas", kind: "route" },
];

/** Slugs equivalentes por departamento (DB + alias legacy). */
export const DEPARTMENT_SLUGS: Record<string, string[]> = {
  mujer: ["mujer", "moda-mujer"],
  hombre: ["hombre", "moda-hombre"],
  nina: ["ninas", "nina", "moda-ninas"],
  nino: ["ninos", "nino", "moda-ninos"],
  bebes: ["bebes", "bebe", "infantil", "baby"],
  pijamas: ["pijamas"],
  deportivo: ["deportivo", "deportiva", "ropa-deportiva", "sport"],
  uniformes: ["uniformes", "escolar", "colegio"],
};

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

/** Secciones del home comercial (orden fijo; se ocultan si no hay productos). */
export const HOME_DEPARTMENT_SECTIONS = [
  { key: "mujer", title: "Mujer", href: "/categoria/mujer", id: "seccion-mujer" },
  { key: "hombre", title: "Hombre", href: "/categoria/hombre", id: "seccion-hombre" },
  {
    key: "kids",
    title: "Nina y Nino",
    href: "/categorias",
    id: "seccion-nina-nino",
    combineKeys: ["nina", "nino"] as const,
  },
  { key: "bebes", title: "Bebes", href: "/categoria/bebes", id: "seccion-bebes" },
  { key: "pijamas", title: "Pijamas", href: "/categoria/pijamas", id: "seccion-pijamas" },
  { key: "deportivo", title: "Deportivo", href: "/categoria/deportivo", id: "seccion-deportivo" },
  { key: "uniformes", title: "Uniformes", href: "/categoria/uniformes", id: "seccion-uniformes" },
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
    if (item.kind === "route") {
      if (item.key === "novedades") {
        return true;
      }
      if (item.key === "ofertas") {
        return true;
      }
      return true;
    }

    const departmentSlugs = DEPARTMENT_SLUGS[item.key] ?? [item.href.split("/").pop() ?? ""];
    const hasCategory = departmentSlugs.some((slug) => available.has(normalizeNavSlug(slug)));
    const hasProducts = countProductsForDepartment(item.key, productCategorySlugs) > 0;

    return hasCategory || hasProducts;
  });
}

export function getTopLevelCategories(categories: StoreCategory[]): StoreCategory[] {
  return categories.filter((category) => !category.parentId);
}

export function sortCategoriesForDisplay(categories: StoreCategory[]): StoreCategory[] {
  const primaryOrder = PRIMARY_NAV.filter((item) => item.kind === "category").flatMap(
    (item) => DEPARTMENT_SLUGS[item.key] ?? [],
  );

  return [...categories].sort((a, b) => {
    const aIndex = primaryOrder.findIndex((slug) => categorySlugMatches(a.slug, [slug]));
    const bIndex = primaryOrder.findIndex((slug) => categorySlugMatches(b.slug, [slug]));

    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    }

    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  });
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
