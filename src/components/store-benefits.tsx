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
      <div className="mb-3 md:mb-4">
        <p className="text-[11px] font-medium tracking-wide text-brand">Vision ATRES</p>
        <h2 id="beneficios-titulo" className="mt-0.5 text-xl font-medium tracking-tight text-ink md:text-2xl">
          Moda colombiana directa
        </h2>
      </div>
      <div className="grid gap-4 border-t border-black/[0.06] pt-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="min-w-0">
            <h3 className="text-sm font-medium text-ink sm:text-base">{benefit.title}</h3>
            <p className="mt-1.5 text-sm font-normal leading-5 text-ink-muted sm:leading-6">{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
