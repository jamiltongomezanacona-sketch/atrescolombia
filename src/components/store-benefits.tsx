const benefits = [
  {
    title: "Productos colombianos",
    description: "Explora propuestas de marcas, talleres y emprendimientos colombianos.",
  },
  {
    title: "Atencion directa",
    description: "Contacta por WhatsApp desde cada producto cuando lo necesites.",
  },
  {
    title: "Catalogos faciles",
    description: "Encuentra categorias, novedades y ofertas en una vitrina pensada para explorar rapido.",
  },
];

export function StoreBenefits() {
  return (
    <section className="home-section catalog-container pb-5 md:pb-6" aria-labelledby="beneficios-titulo">
      <div className="grid gap-3 rounded-[var(--radius-card)] bg-ink p-3.5 text-white ring-1 ring-black/[0.08] sm:gap-4 sm:p-4 lg:grid-cols-[1.05fr_1.45fr] lg:items-end">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-white/60">ATRES Colombia</p>
          <h2 id="beneficios-titulo" className="mt-1 text-xl font-medium tracking-tight !text-white sm:text-2xl md:text-3xl">
            Moda y productos colombianos en un solo lugar.
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-normal leading-6 text-white/72">
            Explora catalogos, descubre nuevas propuestas y contacta directamente desde cada producto.
          </p>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="min-w-0 border-t border-white/10 pt-2.5 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0"
            >
              <h3 className="text-sm font-medium !text-white">{benefit.title}</h3>
              <p className="mt-1 text-xs font-normal leading-5 text-white/68 sm:text-sm">{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
