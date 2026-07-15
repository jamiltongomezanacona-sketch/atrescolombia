import { BottomNav } from "@/components/bottom-nav";
import { FavoritesView } from "@/components/favorites-view";
import { SiteHeader } from "@/components/site-header";
import { getPublicProducts } from "@/lib/public-store";

export const metadata = {
  title: "Favoritos | ATRES",
};

export default async function FavoritesPage() {
  const products = await getPublicProducts();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f3f3] pb-24 text-[#111]">
      <SiteHeader />
      <section className="mx-auto max-w-[1350px] px-3 py-5 sm:px-4">
        <div className="mb-5 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-stone-500">Tu seleccion</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">Favoritos</h1>
        </div>
        <FavoritesView products={products} />
      </section>
      <BottomNav />
    </main>
  );
}
