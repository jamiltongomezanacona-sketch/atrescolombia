import type { AdminCategory } from "@/lib/admin/types";

export type CategoryOption = {
  id: string;
  name: string;
  label: string;
  depth: number;
  parentId: string | null;
};

export function getCategoryChildren(categories: AdminCategory[], parentId: string) {
  return categories
    .filter((category) => category.parent_id === parentId)
    .sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name, "es"));
}

function collectDescendantIds(categories: AdminCategory[], rootId: string) {
  const childrenByParent = new Map<string | null, string[]>();
  for (const category of categories) {
    const list = childrenByParent.get(category.parent_id) ?? [];
    list.push(category.id);
    childrenByParent.set(category.parent_id, list);
  }

  const excluded = new Set<string>([rootId]);
  const stack = [rootId];

  while (stack.length) {
    const current = stack.pop()!;
    for (const childId of childrenByParent.get(current) ?? []) {
      if (excluded.has(childId)) continue;
      excluded.add(childId);
      stack.push(childId);
    }
  }

  return excluded;
}

export function buildIndentedCategoryOptions(
  categories: AdminCategory[],
  options?: { excludeId?: string },
): CategoryOption[] {
  const excluded = options?.excludeId
    ? collectDescendantIds(categories, options.excludeId)
    : new Set<string>();

  const byParent = new Map<string | null, AdminCategory[]>();

  for (const category of categories) {
    if (excluded.has(category.id)) continue;
    const key = category.parent_id;
    const list = byParent.get(key) ?? [];
    list.push(category);
    byParent.set(key, list);
  }

  for (const list of byParent.values()) {
    list.sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name, "es"));
  }

  const result: CategoryOption[] = [];

  function walk(parentId: string | null, depth: number) {
    const children = byParent.get(parentId) ?? [];
    for (const category of children) {
      const prefix = depth > 0 ? `${"— ".repeat(depth)}` : "";
      result.push({
        id: category.id,
        name: category.name,
        label: `${prefix}${category.name}`,
        depth,
        parentId: category.parent_id,
      });
      walk(category.id, depth + 1);
    }
  }

  walk(null, 0);

  const listed = new Set(result.map((item) => item.id));
  for (const category of categories) {
    if (excluded.has(category.id) || listed.has(category.id)) continue;
    result.push({
      id: category.id,
      name: category.name,
      label: category.name,
      depth: 0,
      parentId: category.parent_id,
    });
  }

  return result;
}

export function sortCategoriesAsTree(categories: AdminCategory[]) {
  return buildIndentedCategoryOptions(categories).map((option) => {
    const category = categories.find((item) => item.id === option.id)!;
    return { ...category, depth: option.depth };
  });
}
