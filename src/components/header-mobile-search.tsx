"use client";

import { usePathname } from "next/navigation";
import { SearchBox } from "@/components/search-box";

export function HeaderMobileSearch() {
  const pathname = usePathname();

  if (pathname === "/productos" || pathname.startsWith("/productos?")) {
    return null;
  }

  return (
    <SearchBox
      compact
      className="mt-1.5 lg:hidden"
      placeholder="Buscar ropa ATRES..."
    />
  );
}
