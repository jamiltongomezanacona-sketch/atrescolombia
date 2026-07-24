import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ImageManager } from "@/components/admin/image-manager";
import { ProductForm } from "@/components/admin/product-form";
import { ProductVariantsEditor } from "@/components/admin/product-variants-editor";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminCategories, getAdminProduct, getAdminProductImages, getAdminProductVariants } from "@/lib/admin/data";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ guardado?: string }>;
};

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  const session = await requireAdmin();
  const { id } = await params;
  const [product, categories, images, variants, query] = await Promise.all([
    getAdminProduct(id, session),
    getAdminCategories(),
    getAdminProductImages(id),
    getAdminProductVariants(id),
    searchParams,
  ]);

  if (!product) notFound();

  return (
    <AdminShell isSuperAdmin={session.isSuperAdmin}>
      <div className="grid gap-4 md:gap-5">
        <div className="theme-gold-panel relative overflow-hidden rounded-2xl p-4 text-white md:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gold" />
          <p className="theme-kicker relative">Catalogo studio</p>
          <div className="relative mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight md:text-4xl">Editar producto</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
                Ajusta informacion comercial, estado, precio, inventario e imagenes del producto.
              </p>
            </div>
            <a
              href={`/productos/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-primary-button rounded-full px-4 py-2.5 text-sm font-black"
            >
              Ver en tienda
            </a>
          </div>
        </div>
        {query?.guardado ? (
          <p className="theme-ok rounded-xl p-3 text-sm font-bold">
            Producto guardado.
          </p>
        ) : null}
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
          <div className="grid gap-4">
            <div className="theme-panel rounded-2xl p-3 md:p-5">
              <ProductForm product={product} categories={categories} />
            </div>
            <ProductVariantsEditor
              productId={product.id}
              baseSku={product.sku}
              basePrice={product.price}
              initialVariants={variants}
            />
          </div>
          <div className="xl:sticky xl:top-6">
            <ImageManager productId={product.id} shopId={product.shop_id} images={images} />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
