import Link from "next/link";

const columns = [
  {
    title: "Tienda",
    links: [
      { href: "/productos", label: "Catalogo" },
      { href: "/novedades", label: "Novedades" },
      { href: "/ofertas", label: "Ofertas" },
      { href: "/categorias", label: "Categorias" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { href: "/buscar", label: "Buscar" },
      { href: "/favoritos", label: "Favoritos" },
      { href: "/carrito", label: "Carrito" },
    ],
  },
];

export function StoreFooter() {
  return (
    <footer className="mt-10 border-t border-black/5 bg-black text-white">
      <div className="store-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-black tracking-tight">ATRES</p>
          <p className="mt-2 max-w-sm text-sm font-semibold text-white/70">
            Moda para Colombia: novedades, categorias y ofertas con compra rapida.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-black uppercase tracking-wide text-white/50">{column.title}</p>
            <ul className="mt-3 grid gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-bold text-white/85 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="store-container flex flex-wrap items-center justify-between gap-2 py-4 text-xs font-semibold text-white/55">
          <p>© {new Date().getFullYear()} ATRES Colombia</p>
          <p>Envios a toda Colombia</p>
        </div>
      </div>
    </footer>
  );
}
