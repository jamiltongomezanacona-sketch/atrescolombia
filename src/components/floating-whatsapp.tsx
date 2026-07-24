"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { buildProductWhatsAppMessage, buildWhatsAppUrl, resolveStoreWhatsapp } from "@/lib/whatsapp";

type ProductContext = {
  name: string;
  price: string;
  url: string;
  color: string;
  size: string;
  reference: string;
};

function readProductContext(): ProductContext | null {
  if (typeof document === "undefined" || typeof window === "undefined") return null;

  const element = document.querySelector<HTMLElement>("[data-whatsapp-product-name]");
  if (!element) return null;

  const name = element.dataset.whatsappProductName?.trim();
  if (!name) return null;

  return {
    name,
    price: element.dataset.whatsappProductPrice?.trim() ?? "",
    url: window.location.href,
    color: element.dataset.whatsappProductColor?.trim() ?? "",
    size: element.dataset.whatsappProductSize?.trim() ?? "",
    reference: element.dataset.whatsappProductReference?.trim() ?? "",
  };
}

function buildMessage(product: ProductContext | null) {
  if (product) {
    return buildProductWhatsAppMessage(
      {
        name: product.name,
        price: product.price,
      },
      product.size,
      product.color,
      {
        productUrl: product.url,
        reference: product.reference,
      },
    );
  }

  return [
    "Hola ATRES, quiero recibir asesoria para comprar.",
    typeof window !== "undefined" ? `Estoy viendo: ${window.location.href}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const [product, setProduct] = useState<ProductContext | null>(null);
  const compactCatalog =
    pathname === "/productos" ||
    pathname === "/buscar" ||
    pathname === "/ofertas" ||
    pathname === "/novedades" ||
    pathname.startsWith("/categoria/") ||
    pathname.startsWith("/categorias/");

  useEffect(() => {
    function syncProduct() {
      setProduct(readProductContext());
    }

    const timer = window.setTimeout(syncProduct, 80);
    window.addEventListener("atres:product-selection-changed", syncProduct);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("atres:product-selection-changed", syncProduct);
    };
  }, [pathname]);

  const whatsappUrl = useMemo(() => {
    const configured =
      typeof document !== "undefined"
        ? document.querySelector<HTMLElement>("[data-atres-whatsapp]")?.dataset.atresWhatsapp
        : undefined;
    return buildWhatsAppUrl(resolveStoreWhatsapp(configured), buildMessage(product)) ?? "#";
  }, [product]);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={product ? `Consultar ${product.name} por WhatsApp` : "Consultar por WhatsApp"}
      title={product ? `Consultar ${product.name}` : "WhatsApp"}
      className={`theme-primary-button atres-interactive fixed z-20 grid size-12 place-items-center rounded-full transition duration-200 ease-out hover:-translate-y-0.5 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:size-[3.25rem] ${
        compactCatalog
          ? "bottom-[calc(5.1rem+env(safe-area-inset-bottom))] right-3 md:bottom-6 md:right-6"
          : "bottom-[calc(5.9rem+env(safe-area-inset-bottom))] right-3 md:bottom-6 md:right-6"
      }`}
    >
      <WhatsAppIcon />
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-[1.35rem] md:size-6" fill="currentColor">
      <path d="M16.04 4C9.4 4 4 9.3 4 15.82c0 2.08.56 4.12 1.62 5.9L4 28l6.45-1.58a12.3 12.3 0 0 0 5.59 1.36C22.68 27.78 28 22.48 28 15.96 28 9.32 22.68 4 16.04 4Zm0 21.67c-1.78 0-3.52-.47-5.04-1.37l-.36-.21-3.82.94 1.02-3.66-.24-.38a9.65 9.65 0 0 1-1.5-5.17c0-5.35 4.45-9.7 9.94-9.7 5.47 0 9.84 4.4 9.84 9.84 0 5.35-4.42 9.71-9.84 9.71Zm5.43-7.25c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.29-.77.95-.94 1.14-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.47-.89-.78-1.49-1.75-1.66-2.05-.17-.29-.02-.45.13-.6.13-.13.3-.34.44-.51.15-.17.2-.29.3-.49.1-.19.05-.36-.03-.51-.07-.15-.67-1.58-.92-2.16-.24-.56-.49-.49-.67-.5h-.57c-.2 0-.51.08-.78.37-.27.3-1.03 1-1.03 2.43 0 1.44 1.06 2.83 1.2 3.03.15.19 2.08 3.14 5.05 4.4.7.3 1.25.48 1.68.61.71.22 1.35.19 1.86.12.57-.08 1.76-.7 2-1.38.25-.68.25-1.26.17-1.38-.07-.12-.27-.19-.57-.34Z" />
    </svg>
  );
}
