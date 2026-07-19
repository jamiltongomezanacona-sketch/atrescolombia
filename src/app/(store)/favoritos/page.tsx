import { FavoritesView } from "@/components/favorites-view";
import { PageHeader } from "@/components/ui/page-header";
import { getPublicProducts } from "@/lib/public-store";

export const metadata = {
  title: "Favoritos",
  robots: { index: false, follow: false },
};

export default async function FavoritesPage() {
  const products = await getPublicProducts();

  return (
    <main>
      <section className="store-container py-6 md:py-8">
        <PageHeader eyebrow="Tu seleccion" title="Favoritos" />
        <FavoritesView products={products} />
      </section>
    </main>
  );
}
