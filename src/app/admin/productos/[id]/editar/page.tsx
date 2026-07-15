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
      <div className="grid gap-4">
        <div>
          <p className="text-xs font-black uppercase text-zinc-500">Catalogo</p>
          <h1 className="text-3xl font-black">Editar producto</h1>
        </div>
        {query?.guardado ? <p className="bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Producto guardado.</p> : null}
        <section className="bg-white p-4 shadow-sm">
          <ProductForm product={product} categories={categories} />
        </section>
        <ImageManager productId={product.id} images={images} />
      </div>
    </AdminShell>
  );
}
