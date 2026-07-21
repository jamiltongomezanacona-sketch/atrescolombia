"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { loadPublicProductsBySlugs } from "@/lib/public-product-actions";
import type { Product } from "@/lib/store-data";

export function FavoritesView() {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);

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

  const slugKey = useMemo(() => [...favoriteSlugs].sort().join("\0"), [favoriteSlugs]);

  useEffect(() => {
    const slugs = slugKey ? slugKey.split("\0") : [];
    let cancelled = false;

    if (!slugs.length) {
      queueMicrotask(() => {
        if (!cancelled) {
          setProducts([]);
          setReady(true);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      if (!cancelled) setReady(false);
    });

    void loadPublicProductsBySlugs(slugs).then((nextProducts) => {
      if (cancelled) return;
      setProducts(nextProducts);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [slugKey]);

  const favoriteProducts = useMemo(() => {
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    return favoriteSlugs.map((slug) => bySlug.get(slug)).filter(Boolean) as Product[];
  }, [favoriteSlugs, products]);

  if (!ready) {
    return (
      <p className="text-sm font-normal text-stone-500" role="status" aria-live="polite">
        Cargando favoritos…
      </p>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <EmptyState
        title="Aun no tienes favoritos"
        description="Marca productos como favoritos y apareceran aqui."
        actionHref="/productos"
        actionLabel="Explorar productos"
      />
    );
  }

  return (
    <div className="catalog-grid" aria-live="polite">
      {favoriteProducts.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
