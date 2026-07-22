type IconProps = {
  className?: string;
};

export function TrustIcon({ type, className = "size-3.5 shrink-0" }: IconProps & { type: "flag" | "direct" | "chat" | "store" }) {
  const stroke = `${className} text-ink-muted`;

  if (type === "flag") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={stroke} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 4v16" />
        <path d="M5 5h10l-1.5 3.5L15 12H5" />
      </svg>
    );
  }

  if (type === "direct") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={stroke} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12h14" />
        <path d="m13 6 5 6-5 6" />
      </svg>
    );
  }

  if (type === "chat") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={stroke} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 6h14v9H9l-4 3V6Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={stroke} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 9h16l-1.2 11H5.2L4 9Z" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

export function CategoryPillIcon({ kind, className = "size-4 shrink-0" }: IconProps & { kind: string }) {
  const stroke = `${className} text-current`;

  if (kind === "todo") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={stroke} fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (kind === "hombre") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={stroke} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M8 3h8l-1 5H9L8 3Z" />
        <path d="M12 8v13" />
        <path d="M8 21h8" />
      </svg>
    );
  }

  if (kind === "mujer") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={stroke} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 3v5" />
        <circle cx="12" cy="14" r="5" />
        <path d="M9 21h6" />
      </svg>
    );
  }

  if (kind === "ninos") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={stroke} fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M6 21c.8-4 3-6 6-6s5.2 2 6 6" />
      </svg>
    );
  }

  if (kind === "hogar") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={stroke} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    );
  }

  if (kind === "novedades") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={stroke} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 3 14.5 9.5 21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
      </svg>
    );
  }

  if (kind === "ofertas") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={stroke} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20 12 9 20l-2-8-7-1 16-7Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={stroke} fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export function categoryIconKind(label: string, slug: string, href: string) {
  const key = `${label} ${slug} ${href}`.toLowerCase();
  if (href === "/productos" || key.includes("todo")) return "todo";
  if (key.includes("hombre")) return "hombre";
  if (key.includes("mujer")) return "mujer";
  if (key.includes("nino") || key.includes("infantil") || key.includes("bebe")) return "ninos";
  if (key.includes("hogar") || key.includes("textil")) return "hogar";
  if (key.includes("novedad")) return "novedades";
  if (key.includes("oferta") || key.includes("promo")) return "ofertas";
  return "default";
}
