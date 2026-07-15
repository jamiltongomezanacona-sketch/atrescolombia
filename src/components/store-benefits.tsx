const benefits = [
  {
    title: "Envios a Colombia",
    description: "Despachos a todo el pais con seguimiento claro del pedido.",
  },
  {
    title: "Precios directos",
    description: "Ropa ATRES sin intermediarios: precios visibles y transparentes.",
  },
  {
    title: "Novedades semanales",
    description: "Colecciones nuevas y renovacion constante de catalogo.",
  },
  {
    title: "Compra rapida",
    description: "Catalogo claro por categorias, tallas y ofertas activas.",
  },
];

export function StoreBenefits() {
  return (
    <section className="store-container py-8 md:py-10" aria-labelledby="beneficios-titulo">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-wide text-brand">Por que comprar en ATRES</p>
        <h2 id="beneficios-titulo" className="mt-1 text-2xl font-black tracking-tight text-ink md:text-3xl">
          Beneficios de compra
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="rounded-lg bg-white/85 p-4 shadow-soft ring-1 ring-black/5"
          >
            <h3 className="text-base font-black text-ink">{benefit.title}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
