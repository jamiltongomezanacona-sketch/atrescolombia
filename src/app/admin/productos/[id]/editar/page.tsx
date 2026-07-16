import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ImageManager } from "@/components/admin/image-manager";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminCategories, getAdminProduct, getAdminProductImages } from "@/lib/admin/data";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ guardado?: string }>;
};

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories, images, query] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
    getAdminProductImages(id),
    searchParams,
  ]);

  if (!product) notFound();

  return (
    <AdminShell>
      <div className="grid gap-5">
        <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#111827_0%,#3b0764_48%,#ff4d00_100%)] p-5 text-white shadow-sm md:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.2),transparent_30%)]" />
          <p className="relative text-xs font-black uppercase tracking-[0.18em] text-orange-200">Catalogo studio</p>
          <div className="relative mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">Editar producto</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/62">
                Ajusta informacion comercial, estado, precio, inventario e imagenes del producto.
              </p>
            </div>
            <a
              href={`/productos/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-4 py-2.5 text-sm font-black text-black transition hover:bg-zinc-100"
            >
              Ver en tienda
            </a>
          </div>
        </div>
        {query?.guardado ? (
          <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
            Producto guardado.
          </p>
        ) : null}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
          <div className="rounded-2xl bg-white/95 p-4 shadow-sm ring-1 ring-orange-100 md:p-5">
            <ProductForm product={product} categories={categories} />
          </div>
          <div className="xl:sticky xl:top-6">
            <ImageManager productId={product.id} images={images} />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
