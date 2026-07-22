import { TrustIcon } from "@/components/home/home-icons";

const IDENTITY_ITEMS = [
  { label: "Producto colombiano", icon: "flag" as const },
  { label: "Atencion directa", icon: "direct" as const },
  { label: "Exploracion sencilla", icon: "store" as const },
  { label: "Contacto por WhatsApp", icon: "chat" as const },
];

export function HomeIdentityStrip() {
  return (
    <section className="home-section catalog-container" aria-labelledby="home-identity-title">
      <div className="rounded-[var(--radius-card)] bg-surface px-3 py-3 ring-1 ring-black/[0.05] sm:px-4 sm:py-3.5">
        <h2 id="home-identity-title" className="text-base font-medium tracking-tight text-ink sm:text-lg">
          Moda y productos colombianos en un solo lugar.
        </h2>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-ink-muted sm:text-sm sm:leading-6">
          Explora catalogos, descubre nuevas propuestas y contacta directamente desde cada producto.
        </p>
        <ul className="home-scroll-row atres-scroll mt-2.5 flex gap-2 overflow-x-auto pb-0.5 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          {IDENTITY_ITEMS.map((item) => (
            <li
              key={item.label}
              className="home-scroll-item flex min-w-[9.5rem] shrink-0 items-center gap-2 rounded-full bg-surface-muted/70 px-3 py-1.5 sm:min-w-0"
            >
              <TrustIcon type={item.icon} className="size-3.5 text-brand" />
              <span className="text-[11px] font-medium text-ink sm:text-xs">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
