import Link from "next/link";

const items = [
  { label: "Inicio", href: "/" },
  { label: "Categorias", href: "/productos" },
  { label: "Buscar", href: "/buscar" },
  { label: "Favoritos", href: "/favoritos" },
  { label: "Carrito", href: "/carrito" },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 rounded-full border border-white/70 bg-white/86 px-2 py-1.5 shadow-[0_-14px_45px_rgba(20,34,30,0.13)] backdrop-blur-xl">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex min-h-11 items-center justify-center rounded-full px-1 text-[11px] font-black text-stone-700 transition hover:bg-stone-100/80 hover:text-black"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
