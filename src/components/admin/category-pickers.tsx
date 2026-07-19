"use client";

import { useMemo, useState } from "react";
import { AdminSelect } from "@/components/admin/admin-select";
import {
  getCategoryChildren,
  getPrimaryCategoryOptions,
} from "@/lib/admin/category-options";
import type { AdminCategory } from "@/lib/admin/types";

type CategoryPickersProps = {
  categories: AdminCategory[];
  initialCategoryId?: string | null;
  initialSubcategoryId?: string | null;
  requiredCategory?: boolean;
  /** When true, use native names for ActionStateForm. When false, use controlled handlers. */
  controlled?: boolean;
  categoryId?: string;
  subcategoryId?: string;
  onCategoryChange?: (value: string) => void;
  onSubcategoryChange?: (value: string) => void;
};

export function CategoryPickers({
  categories,
  initialCategoryId = "",
  initialSubcategoryId = "",
  requiredCategory = false,
  controlled = false,
  categoryId: controlledCategoryId,
  subcategoryId: controlledSubcategoryId,
  onCategoryChange,
  onSubcategoryChange,
}: CategoryPickersProps) {
  const [internalCategoryId, setInternalCategoryId] = useState(initialCategoryId ?? "");
  const [internalSubcategoryId, setInternalSubcategoryId] = useState(initialSubcategoryId ?? "");

  const categoryId = controlled ? (controlledCategoryId ?? "") : internalCategoryId;
  const subcategoryId = controlled ? (controlledSubcategoryId ?? "") : internalSubcategoryId;

  const parentOptions = useMemo(
    () => getPrimaryCategoryOptions(categories),
    [categories],
  );

  const childOptions = useMemo(
    () => (categoryId ? getCategoryChildren(categories, categoryId) : []),
    [categories, categoryId],
  );

  function handleCategoryChange(value: string) {
    if (controlled) {
      onCategoryChange?.(value);
      onSubcategoryChange?.("");
      return;
    }

    setInternalCategoryId(value);
    setInternalSubcategoryId("");
  }

  function handleSubcategoryChange(value: string) {
    if (controlled) {
      onSubcategoryChange?.(value);
      return;
    }

    setInternalSubcategoryId(value);
  }

  return (
    <>
      <AdminSelect
        label="Categoria"
        name={controlled ? undefined : "category_id"}
        value={categoryId}
        required={requiredCategory}
        onChange={(event) => handleCategoryChange(event.target.value)}
      >
        <option value="">{requiredCategory ? "Selecciona una categoria" : "Sin categoria"}</option>
        {parentOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </AdminSelect>

      <AdminSelect
        label="Subcategoria"
        name={controlled ? undefined : "subcategory_id"}
        value={childOptions.some((item) => item.id === subcategoryId) ? subcategoryId : ""}
        disabled={!categoryId || childOptions.length === 0}
        onChange={(event) => handleSubcategoryChange(event.target.value)}
        hint={
          !categoryId
            ? "Elige primero una categoria."
            : childOptions.length === 0
              ? "Esta categoria no tiene subcategorias."
              : "Opcional: hijas de la categoria seleccionada."
        }
      >
        <option value="">Sin subcategoria</option>
        {childOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </AdminSelect>
      {!controlled && (!categoryId || childOptions.length === 0) ? (
        <input type="hidden" name="subcategory_id" value="" />
      ) : null}
    </>
  );
}
