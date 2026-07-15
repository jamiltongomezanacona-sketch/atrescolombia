import Image from "next/image";
import Link from "next/link";
import { getCategoryVisualTheme } from "@/lib/category-visuals";
import { getPublicCategories } from "@/lib/public-store";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "Categorias | ATRES",
  description: "Explora todas las categorias de moda ATRES.",
};

export const dynamic = "force-dynamic";

export default async function CategoriesIndexPage() {
  const categories = await getPublicCategories();

  return (
    <main>
      <section className="store-container py-6 md:py-8">
        <PageHeader
          eyebrow="Departamentos ATRES"
          title="Categorias"
          description="Elige un departamento para ver prendas, novedades y ofertas."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {categories.map((category) => {
            const theme = getCategoryVisualTheme(category.slug, category.name);

            return (
              <Link
                key={category.slug}
                href={`/categoria/${category.slug}`}
                className={`group relative min-h-[180px] overflow-hidden rounded-lg p-4 shadow-soft ring-1 ring-white/60 transition hover:-translate-y-1 ${theme.washClass}`}
              >
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover opacity-25"
                />
                <div className="relative">
                  <p className={`text-xs font-black uppercase ${theme.accentClass}`}>{theme.eyebrow}</p>
                  <h2 className={`mt-2 text-2xl font-black tracking-tight ${theme.textClass}`}>
                    {category.name}
                  </h2>
                  <p className={`mt-2 line-clamp-2 text-sm font-semibold ${theme.mutedTextClass}`}>
                    {category.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
