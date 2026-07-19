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
    <footer className="mt-12 border-t border-black/5 bg-ink pb-24 text-white md:pb-0">
      <div className="store-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-medium tracking-[0.14em]">ATRES</p>
          <p className="mt-3 max-w-sm text-sm font-normal leading-6 text-white/70">
            Moda 100% colombiana. Del taller al cliente, con fabricantes grandes y pequenos en una vitrina directa.
          </p>
          <p className="mt-3 max-w-sm text-xs font-normal leading-5 text-white/45">
            Personaliza, compra por prenda o contacta al por mayor.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-wide text-white/45">Comprar</p>
          <ul className="mt-4 grid gap-2.5">
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
          <p className="text-[11px] font-medium tracking-wide text-white/45">Ayuda</p>
          <ul className="mt-4 grid gap-2.5">
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
        <div className="store-container flex flex-wrap items-center justify-between gap-2 py-4 text-xs font-normal text-white/50">
          <p>&copy; {new Date().getFullYear()} ATRES Colombia</p>
          <p>Producto colombiano directo</p>
        </div>
      </div>
    </footer>
  );
}
