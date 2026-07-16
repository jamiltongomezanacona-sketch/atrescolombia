const benefits = [
  {
    title: "Envios nacionales",
    description: "Despachos a Colombia con seguimiento claro del pedido.",
  },
  {
    title: "Compra segura",
    description: "Catalogo claro, precios visibles y asesoría por WhatsApp.",
  },
  {
    title: "Productos disponibles",
    description: "Inventario organizado para encontrar prendas listas para comprar.",
  },
  {
    title: "Fabricacion colombiana",
    description: "Una vitrina pensada para moda y comercio local.",
  },
];

export function StoreBenefits() {
  return (
    <section className="store-container py-5 md:py-6" aria-labelledby="beneficios-titulo">
      <div className="mb-3">
        <p className="text-xs font-black uppercase tracking-wide text-brand">Por que comprar en ATRES</p>
        <h2 id="beneficios-titulo" className="mt-1 text-xl font-black tracking-tight text-ink md:text-2xl">
          Confianza para comprar
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="rounded-lg bg-white/88 p-4 shadow-soft ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <h3 className="text-base font-black text-ink">{benefit.title}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
