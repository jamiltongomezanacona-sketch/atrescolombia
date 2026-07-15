"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/store-data";

type FavoritesViewProps = {
  products: Product[];
};

export function FavoritesView({ products }: FavoritesViewProps) {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);

  useEffect(() => {
    function syncFavorites() {
      try {
        queueMicrotask(() =>
          setFavoriteSlugs(JSON.parse(window.localStorage.getItem("atres:favorites") ?? "[]")),
        );
      } catch {
        queueMicrotask(() => setFavoriteSlugs([]));
      }
    }

    syncFavorites();
    window.addEventListener("atres:favorites-changed", syncFavorites);
    window.addEventListener("storage", syncFavorites);

    return () => {
      window.removeEventListener("atres:favorites-changed", syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  const favoriteProducts = useMemo(
    () => products.filter((product) => favoriteSlugs.includes(product.slug)),
    [favoriteSlugs, products],
  );

  if (favoriteProducts.length === 0) {
    return (
      <div className="bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-black">Aun no tienes favoritos</h2>
        <p className="mt-2 text-sm font-semibold text-stone-500">
          Marca productos como favoritos y apareceran aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {favoriteProducts.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
