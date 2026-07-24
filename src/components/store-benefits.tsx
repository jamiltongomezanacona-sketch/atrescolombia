const benefits = [
  {
    title: "Productos colombianos",
    description: "Marcas, talleres y emprendimientos en una sola vitrina.",
  },
  {
    title: "Atencion directa",
    description: "Contacta por WhatsApp desde cada producto.",
  },
  {
    title: "Exploracion rapida",
    description: "Categorias, novedades y ofertas al alcance.",
  },
];

export function StoreBenefits() {
  return (
    <section className="home-section catalog-container pb-6 md:pb-8" aria-labelledby="beneficios-titulo">
      <div className="overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-black-main via-[#1a1a1a] to-[#2a2418] p-4 text-white ring-1 ring-gold/25 sm:p-5 lg:p-6">
        <div className="lg:grid lg:grid-cols-[1fr_1.35fr] lg:items-end lg:gap-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-gold-light">ATRES</p>
            <h2
              id="beneficios-titulo"
              className="mt-1.5 text-xl font-medium tracking-tight !text-white sm:text-2xl md:text-3xl"
            >
              Compra moda colombiana con claridad.
            </h2>
            <p className="mt-2 max-w-xl text-sm font-normal leading-6 text-white/70">
              Marketplace negro y oro para descubrir, comparar y contactar tiendas.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-0">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="min-w-0 border-t border-white/10 pt-3 sm:border-t-0 sm:border-l sm:pl-3 sm:pt-0">
                <h3 className="text-sm font-semibold !text-gold-light">{benefit.title}</h3>
                <p className="mt-1 text-xs font-normal leading-5 text-white/68 sm:text-sm">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
