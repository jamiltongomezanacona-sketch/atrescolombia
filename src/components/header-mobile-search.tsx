"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SearchBox } from "@/components/search-box";

const PRODUCT_FILTER_KEYS = [
  "categoria",
  "tienda",
  "talla",
  "color",
  "coleccion",
  "precio_min",
  "precio_max",
  "orden",
  "novedades",
  "ofertas",
  "disponible",
];

export function HeaderMobileSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const catalogMode = pathname === "/productos";
  const query = searchParams.get("q") ?? "";
  const hiddenInputs = catalogMode
    ? PRODUCT_FILTER_KEYS.flatMap((key) =>
        searchParams
          .getAll(key)
          .filter(Boolean)
          .map((value) => ({ name: key, value })),
      )
    : [];

  return (
    <SearchBox
      key={`${pathname}:${query}`}
      compact
      action={catalogMode ? "/productos" : "/buscar"}
      initialQuery={query}
      hiddenInputs={hiddenInputs}
      className="min-w-0 lg:hidden"
      placeholder={catalogMode ? "Buscar en el catalogo..." : "Buscar en ATRES..."}
    />
  );
}
