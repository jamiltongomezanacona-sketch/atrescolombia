import { TrustIcon } from "@/components/home/home-icons";

const HOME_TRUST_ITEMS = [
  { label: "Productos publicados", icon: "store" as const },
  { label: "Tiendas verificadas", icon: "flag" as const },
  { label: "Compra directa", icon: "direct" as const },
  { label: "Atencion por WhatsApp", icon: "chat" as const },
];

export function HomeTrustStrip() {
  return (
    <section
      className="border-b border-[var(--border-gold-soft)] bg-black-main/90"
      aria-label="Confianza ATRES"
    >
      <ul className="catalog-container grid grid-cols-2 gap-x-3 gap-y-2 py-2.5 sm:grid-cols-4 sm:gap-4 sm:py-3">
        {HOME_TRUST_ITEMS.map((item) => (
          <li key={item.label} className="flex min-w-0 items-center gap-2 text-ink">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gold/12 ring-1 ring-gold/30">
              <TrustIcon type={item.icon} className="size-3.5 text-gold-light" />
            </span>
            <span className="text-[11px] font-medium leading-4 text-ink/90 sm:text-xs">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
