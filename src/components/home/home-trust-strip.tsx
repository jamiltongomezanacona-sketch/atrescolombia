import { TrustIcon } from "@/components/home/home-icons";

const HOME_TRUST_ITEMS = [
  { label: "Productos colombianos", icon: "flag" as const },
  { label: "Atencion por WhatsApp", icon: "chat" as const },
  { label: "Compra directa", icon: "direct" as const },
  { label: "Envios segun cada tienda", icon: "store" as const },
];

export function HomeTrustStrip() {
  return (
    <section className="home-trust-strip border-y border-[var(--border-gold-soft)] bg-black-main/80" aria-label="Confianza ATRES">
      <ul className="home-scroll-row atres-scroll catalog-container flex gap-2 overflow-x-auto py-2 sm:grid sm:grid-cols-2 sm:gap-2.5 sm:overflow-visible sm:py-2.5 lg:grid-cols-4">
        {HOME_TRUST_ITEMS.map((item) => (
          <li
            key={item.label}
            className="home-scroll-item flex min-h-9 min-w-[10.5rem] shrink-0 items-center gap-2 rounded-[var(--radius-card)] bg-surface px-3 py-1.5 text-ink ring-1 ring-white/10 sm:min-h-10 sm:min-w-0 sm:bg-transparent sm:px-2 sm:ring-0"
          >
            <TrustIcon type={item.icon} className="size-4 text-brand" />
            <span className="text-[11px] font-medium leading-4 sm:text-xs">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
