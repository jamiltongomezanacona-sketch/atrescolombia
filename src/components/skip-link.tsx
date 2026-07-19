export function SkipLink() {
  return (
    <a
      href="#contenido-principal"
      className="skip-link sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-3 focus-visible:top-3 focus-visible:z-[60] focus-visible:rounded-[var(--radius-card)] focus-visible:bg-white focus-visible:px-4 focus-visible:py-2.5 focus-visible:text-sm focus-visible:font-medium focus-visible:text-ink focus-visible:shadow-lift focus-visible:ring-2 focus-visible:ring-brand"
    >
      Saltar al contenido principal
    </a>
  );
}
