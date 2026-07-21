import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { getCategoryVisualTheme } from "@/lib/category-visuals";
import { getPublicCategoriesForDisplay } from "@/lib/public-store";

export const metadata = {
  title: "Categorias",
  description: "Departamentos ATRES por categorias, hogar y colecciones.",
};

export default async function CategoriesIndexPage() {
  const categories = await getPublicCategoriesForDisplay();

  return (
    <main>
      <section className="store-container py-3 md:py-4">
        <PageHeader
          eyebrow="ATRES"
          title="Departamentos"
          description="Hombre, Mujer, Niños y Hogar. Entra a cada uno para ver sus subcategorias."
        />
        {categories.length === 0 ? (
          <p className="text-sm font-normal text-stone-500">No hay categorias con productos disponibles.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-4">
            {categories.map((category) => {
              const theme = getCategoryVisualTheme(category.slug, category.name);

              return (
                <Link
                  key={category.slug}
                  href={`/categoria/${category.slug}`}
                  className={`group relative isolate min-h-[156px] overflow-hidden rounded-lg p-3.5 shadow-soft ring-1 ring-white/60 transition hover:-translate-y-1 sm:min-h-[178px] ${theme.washClass}`}
                >
                  <div className="pointer-events-none absolute inset-0">
                    <Image
                      src={theme.heroImage}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover opacity-45 transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/58 via-black/28 to-black/48" />
                  <div className="relative flex h-full min-h-[128px] flex-col justify-between sm:min-h-[150px]">
                    <p className={`text-xs font-medium ${theme.accentClass}`}>{theme.eyebrow}</p>
                    <div>
                      <h2 className="text-[1.7rem] font-medium leading-none tracking-tight text-white sm:text-3xl">
                        {category.shortName}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm font-normal leading-5 text-white/82">
                        {category.description || theme.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
