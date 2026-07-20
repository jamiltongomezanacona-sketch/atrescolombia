import { FavoritesView } from "@/components/favorites-view";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "Favoritos",
  robots: { index: false, follow: false },
};

export default function FavoritesPage() {
  return (
    <main>
      <section className="store-container py-6 md:py-8">
        <PageHeader eyebrow="Tu seleccion" title="Favoritos" />
        <FavoritesView />
      </section>
    </main>
  );
}
