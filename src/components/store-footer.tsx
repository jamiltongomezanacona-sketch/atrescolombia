import Link from "next/link";
import { PRIMARY_NAV } from "@/lib/store-navigation";

const helpLinks = [
  { href: "/buscar", label: "Buscar" },
  { href: "/favoritos", label: "Favoritos" },
  { href: "/carrito", label: "Carrito" },
];

export function StoreFooter() {
  const categoryLinks = PRIMARY_NAV.filter((item) => item.kind === "route" || item.kind === "category");

  return (
    <footer className="mt-8 border-t border-black/5 bg-ink pb-24 text-white md:pb-0">
      <div className="store-container grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-8">
        <div>
          <p className="text-xl font-medium tracking-[0.14em]">ATRES</p>
          <p className="mt-2 max-w-sm text-sm font-normal leading-5 text-white/70 sm:leading-6">
            Moda 100% colombiana. Del taller al cliente, con fabricantes grandes y pequenos en una vitrina directa.
          </p>
          <p className="mt-2 max-w-sm text-xs font-normal leading-5 text-white/60">
            Personaliza, compra por prenda o contacta al por mayor.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-wide text-white/60">Comprar</p>
          <ul className="mt-3 grid gap-2">
            <li>
              <Link href="/productos" className="text-sm font-normal text-white/85 transition hover:text-white">
                Catalogo completo
              </Link>
            </li>
            {categoryLinks.map((link) => (
              <li key={link.key}>
                <Link href={link.href} className="text-sm font-normal text-white/85 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-wide text-white/60">Ayuda</p>
          <ul className="mt-3 grid gap-2">
            {helpLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm font-normal text-white/85 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="store-container flex flex-wrap items-center justify-between gap-2 py-3 text-xs font-normal text-white/60">
          <p>&copy; {new Date().getFullYear()} ATRES Colombia</p>
          <p>Producto colombiano directo</p>
        </div>
      </div>
    </footer>
  );
}
