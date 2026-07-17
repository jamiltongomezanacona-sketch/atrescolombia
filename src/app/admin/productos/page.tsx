import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSelect } from "@/components/admin/admin-select";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { SafeProductImage } from "@/components/safe-product-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminCategories, getAdminProductImagesByProductIds, getAdminProducts } from "@/lib/admin/data";
import type { AdminProductImage } from "@/lib/admin/types";

type AdminProductsPageProps = {
  searchParams?: Promise<{ q?: string; estado?: string }>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);
  const q = (params?.q ?? "").toLowerCase();
  const estado = params?.estado ?? "";
  const categoryById = new Map(categories.map((category) => [category.id, category.name]));
  const filtered = products.filter((product) => {
    const name = safeText(product.name);
    const sku = safeText(product.sku);
    const matchesQuery = !q || name.toLowerCase().includes(q) || sku.toLowerCase().includes(q);
    const matchesStatus = !estado || product.status === estado;
    return matchesQuery && matchesStatus;
  });
  const productImages = await getAdminProductImagesByProductIds(filtered.map((product) => product.id));
  const imageByProduct = createPrimaryImageMap(productImages);
  const statusSummary = getStatusSummary(products, filtered.length, estado);

  return (
    <AdminShell>
      <div className="grid gap-5">
        <div className="relative overflow-hidden rounded-2xl bg-[#0b1f3a] p-4 text-white shadow-sm ring-1 ring-[#284a68] md:p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[#6ea8d9]" />
          <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#9fd2ff]">Catalogo studio</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Productos</h1>
            <p className="mt-1 text-sm font-normal text-white/72">
              {statusSummary}. Usa Editar para cambiar precio, fotos, stock y contenido.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/72">
              <span className="rounded-full bg-white/8 px-3 py-1 ring-1 ring-white/10">
                {products.filter((product) => product.status === "active").length} activos
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 ring-1 ring-white/10">
                {products.filter((product) => product.status === "hidden").length} ocultos
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 ring-1 ring-white/10">
                {products.filter((product) => product.status === "archived").length} archivados
              </span>
            </div>
          </div>
          <Button href="/admin/productos/nuevo" variant="secondary" className="rounded-full px-5">
            Nuevo producto
          </Button>
          </div>
        </div>
        <form className="grid gap-3 rounded-2xl bg-white/95 p-3 shadow-sm ring-1 ring-[#d8e7f5] md:grid-cols-[1fr_180px_auto] md:p-4">
          <Input name="q" defaultValue={params?.q ?? ""} placeholder="Buscar producto o SKU" />
          <AdminSelect name="estado" defaultValue={estado} aria-label="Estado">
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="hidden">Ocultos</option>
            <option value="archived">Archivados</option>
          </AdminSelect>
          <Button type="submit" variant="metal" className="rounded-full">
            Filtrar
          </Button>
        </form>

        <div className="grid gap-3 lg:hidden">
          {filtered.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-2xl bg-white/92 p-4 shadow-sm ring-1 ring-black/5">
              <div className="mb-3 h-1 rounded-full bg-[#2f6f9f]" />
              <div className="flex items-start gap-3">
                <ProductThumb image={imageByProduct.get(product.id)} name={safeText(product.name) || "Producto"} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link href={`/admin/productos/${product.id}/editar`} className="text-base font-semibold hover:underline">
                      {safeText(product.name) || "Producto sin nombre"}
                    </Link>
                    <AdminStatusBadge status={safeText(product.status) || "hidden"} />
                  </div>
                  <p className="mt-1 text-xs font-normal text-zinc-500">{safeText(product.sku) || "Sin SKU"}</p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-zinc-500">Precio</dt>
                  <dd className="font-semibold">${safeNumber(product.price).toLocaleString("es-CO")}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-zinc-500">Inventario</dt>
                  <dd className="font-semibold">{safeNumber(product.inventory_total)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs font-semibold text-zinc-500">Categoria</dt>
                  <dd className="font-normal">
                    {product.category_id ? categoryById.get(product.category_id) : "Sin categoria"}
                    {product.subcategory_id && categoryById.get(product.subcategory_id)
                      ? ` / ${categoryById.get(product.subcategory_id)}`
                      : ""}
                  </dd>
                </div>
              </dl>
              <div className="mt-3">
                <ProductRowActions productId={product.id} status={safeText(product.status) || "hidden"} />
              </div>
            </article>
          ))}
          {!filtered.length ? <p className="rounded-2xl bg-white p-6 text-sm font-semibold text-zinc-500 shadow-sm">No hay productos para mostrar.</p> : null}
        </div>

        <div className="hidden overflow-hidden rounded-2xl bg-white/95 shadow-sm ring-1 ring-black/5 lg:block">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#0b1f3a] text-xs uppercase text-white/75">
              <tr>
                <th className="sticky left-0 bg-zinc-950 p-4">Producto</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Inventario</th>
                <th className="p-3">Creado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="group border-t border-zinc-100 transition hover:bg-[#eef6ff]">
                  <td className="sticky left-0 bg-white p-4 transition group-hover:bg-[#eef6ff]">
                    <div className="flex items-center gap-3">
                      <ProductThumb image={imageByProduct.get(product.id)} name={safeText(product.name) || "Producto"} />
                      <div className="min-w-0">
                        <Link href={`/admin/productos/${product.id}/editar`} className="font-semibold hover:underline">
                          {safeText(product.name) || "Producto sin nombre"}
                        </Link>
                        <p className="text-xs font-normal text-zinc-500">{safeText(product.sku) || "Sin SKU"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <AdminStatusBadge status={safeText(product.status) || "hidden"} />
                  </td>
                  <td className="p-3">
                    {product.category_id ? categoryById.get(product.category_id) : "Sin categoria"}
                    {product.subcategory_id && categoryById.get(product.subcategory_id)
                      ? ` / ${categoryById.get(product.subcategory_id)}`
                      : ""}
                  </td>
                  <td className="p-3 font-semibold">${safeNumber(product.price).toLocaleString("es-CO")}</td>
                  <td className="p-3">{safeNumber(product.inventory_total)}</td>
                  <td className="p-3">{formatDate(product.created_at)}</td>
                  <td className="p-3">
                    <ProductRowActions productId={product.id} status={safeText(product.status) || "hidden"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {!filtered.length ? <p className="p-6 text-sm font-semibold text-zinc-500">No hay productos para mostrar.</p> : null}
        </div>
      </div>
    </AdminShell>
  );
}

function safeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function safeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatDate(value: unknown) {
  if (!value || typeof value !== "string") return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-CO");
}

function createPrimaryImageMap(images: AdminProductImage[]) {
  const map = new Map<string, AdminProductImage>();

  for (const image of images) {
    const current = map.get(image.product_id);
    if (!current || image.is_primary || (!current.is_primary && image.display_order < current.display_order)) {
      map.set(image.product_id, image);
    }
  }

  return map;
}

function getStatusSummary(
  products: Array<{ status: string }>,
  filteredCount: number,
  estado: string,
) {
  const total = products.length;

  if (estado === "active") return `${filteredCount} activos de ${total} productos`;
  if (estado === "hidden") return `${filteredCount} ocultos de ${total} productos`;
  if (estado === "archived") return `${filteredCount} archivados de ${total} productos`;

  const activeCount = products.filter((product) => product.status === "active").length;
  return `${activeCount} visibles de ${total} productos`;
}

function ProductThumb({ image, name }: { image?: AdminProductImage; name: string }) {
  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-black/5">
      {image?.public_url ? (
        <SafeProductImage
          src={image.public_url}
          alt={image.alt || name}
          sizes="56px"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-[10px] font-semibold text-zinc-400">
          Sin foto
        </div>
      )}
    </div>
  );
}
