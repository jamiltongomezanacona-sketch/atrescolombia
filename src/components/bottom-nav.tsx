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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-2 pb-2 pt-1 shadow-[0_-10px_40px_rgba(20,34,30,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex min-h-12 items-center justify-center px-1 text-[11px] font-black text-stone-700 transition hover:bg-stone-100 hover:text-black"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
