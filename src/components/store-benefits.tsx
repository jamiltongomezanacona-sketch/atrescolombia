const benefits = [
  {
    title: "100% colombiano",
    description: "Producto hecho en Colombia, impulsando fabricantes grandes, pequenos y talleres locales.",
  },
  {
    title: "Del taller al cliente",
    description: "Compra directa, precios visibles y contacto cercano dentro de una vitrina organizada.",
  },
  {
    title: "Personaliza tu prenda",
    description: "Consulta ajustes, disenos o variaciones posibles directamente por WhatsApp antes de comprar.",
  },
  {
    title: "Por prenda o al por mayor",
    description: "Atencion para clientes finales, boutiques y compradores que buscan contacto con fabricantes.",
  },
];

export function StoreBenefits() {
  return (
    <section className="store-container py-5 md:py-6" aria-labelledby="beneficios-titulo">
      <div className="mb-3">
        <p className="text-xs font-black uppercase tracking-wide text-brand">Vision ATRES</p>
        <h2 id="beneficios-titulo" className="mt-1 text-xl font-black tracking-tight text-ink md:text-2xl">
          Moda colombiana directa
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
