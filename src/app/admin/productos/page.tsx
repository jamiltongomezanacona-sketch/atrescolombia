import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSelect } from "@/components/admin/admin-select";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminCategories, getAdminProducts } from "@/lib/admin/data";

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

  return (
    <AdminShell>
      <div className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-white/92 p-4 shadow-sm ring-1 ring-black/5 md:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Catalogo</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Productos</h1>
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              {filtered.length} visibles de {products.length} productos. Edita, duplica o publica sin salir del panel.
            </p>
          </div>
          <Button href="/admin/productos/nuevo" className="rounded-full px-5">
            Nuevo producto
          </Button>
        </div>
        <form className="grid gap-3 rounded-2xl bg-white/92 p-3 shadow-sm ring-1 ring-black/5 md:grid-cols-[1fr_180px_auto] md:p-4">
          <Input name="q" defaultValue={params?.q ?? ""} placeholder="Buscar producto o SKU" />
          <AdminSelect name="estado" defaultValue={estado} aria-label="Estado">
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="hidden">Ocultos</option>
            <option value="archived">Archivados</option>
          </AdminSelect>
          <Button type="submit" className="rounded-full">
            Filtrar
          </Button>
        </form>

        <div className="grid gap-3 lg:hidden">
          {filtered.map((product) => (
            <article key={product.id} className="rounded-2xl bg-white/92 p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <Link href={`/admin/productos/${product.id}/editar`} className="text-base font-black hover:underline">
                  {safeText(product.name) || "Producto sin nombre"}
                </Link>
                <AdminStatusBadge status={safeText(product.status) || "hidden"} />
              </div>
              <p className="mt-1 text-xs font-semibold text-zinc-500">{safeText(product.sku) || "Sin SKU"}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs font-black uppercase text-zinc-500">Precio</dt>
                  <dd className="font-black">${safeNumber(product.price).toLocaleString("es-CO")}</dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase text-zinc-500">Inventario</dt>
                  <dd className="font-bold">{safeNumber(product.inventory_total)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs font-black uppercase text-zinc-500">Categoria</dt>
                  <dd className="font-semibold">
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
            <thead className="bg-zinc-950 text-xs uppercase text-white/62">
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
                <tr key={product.id} className="border-t border-zinc-100 transition hover:bg-zinc-50">
                  <td className="sticky left-0 bg-white p-4">
                    <Link href={`/admin/productos/${product.id}/editar`} className="font-black hover:underline">
                      {safeText(product.name) || "Producto sin nombre"}
                    </Link>
                    <p className="text-xs font-semibold text-zinc-500">{safeText(product.sku) || "Sin SKU"}</p>
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
                  <td className="p-3 font-black">${safeNumber(product.price).toLocaleString("es-CO")}</td>
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
