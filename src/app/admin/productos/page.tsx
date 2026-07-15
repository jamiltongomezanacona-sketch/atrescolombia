import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductRowActions } from "@/components/admin/product-row-actions";
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
      <div className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-zinc-500">Catalogo</p>
            <h1 className="text-3xl font-black">Productos</h1>
          </div>
          <Link href="/admin/productos/nuevo" className="bg-black px-4 py-3 text-sm font-black text-white">
            Nuevo producto
          </Link>
        </div>
        <form className="grid gap-3 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_auto]">
          <input name="q" defaultValue={params?.q ?? ""} placeholder="Buscar producto o SKU" className="h-11 border border-zinc-300 px-3" />
          <select name="estado" defaultValue={estado} className="h-11 border border-zinc-300 px-3">
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="hidden">Ocultos</option>
            <option value="archived">Archivados</option>
          </select>
          <button className="h-11 bg-black px-4 text-sm font-black text-white">Filtrar</button>
        </form>
        <div className="overflow-x-auto bg-white shadow-sm">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="p-3">Producto</th>
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
                <tr key={product.id} className="border-t border-zinc-100">
                  <td className="p-3">
                    <Link href={`/admin/productos/${product.id}/editar`} className="font-black hover:underline">
                      {safeText(product.name) || "Producto sin nombre"}
                    </Link>
                    <p className="text-xs font-semibold text-zinc-500">{safeText(product.sku) || "Sin SKU"}</p>
                  </td>
                  <td className="p-3 font-bold">{safeText(product.status) || "hidden"}</td>
                  <td className="p-3">{product.category_id ? categoryById.get(product.category_id) : "Sin categoria"}</td>
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
