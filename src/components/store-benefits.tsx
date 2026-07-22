const benefits = [
  {
    title: "Productos colombianos",
    description: "Explora propuestas de marcas, talleres y emprendimientos colombianos.",
  },
  {
    title: "Contacto directo",
    description: "Comunicate desde cada producto para resolver dudas antes de comprar.",
  },
  {
    title: "Catalogos faciles",
    description: "Encuentra categorias, novedades y ofertas en una vitrina pensada para explorar rapido.",
  },
];

export function StoreBenefits() {
  return (
    <section className="catalog-container py-5 md:py-6" aria-labelledby="beneficios-titulo">
      <div className="grid gap-4 rounded-[var(--radius-card)] bg-ink p-4 text-white sm:p-5 lg:grid-cols-[1.1fr_1.4fr] lg:items-end">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-white/60">Valor ATRES</p>
          <h2 id="beneficios-titulo" className="mt-1 text-2xl font-medium tracking-tight !text-white md:text-3xl">
            ATRES conecta compradores con productos, marcas y emprendimientos colombianos.
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-normal leading-6 text-white/70">
            Descubre nuevas propuestas, explora sus catalogos y comunicate directamente desde cada producto.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="min-w-0 border-t border-white/10 pt-3 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
              <h3 className="text-sm font-medium !text-white sm:text-base">{benefit.title}</h3>
              <p className="mt-1.5 text-xs font-normal leading-5 text-white/70 sm:text-sm">{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
