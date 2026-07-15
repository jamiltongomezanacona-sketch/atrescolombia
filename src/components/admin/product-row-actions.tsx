"use client";

import { useTransition } from "react";
import { duplicateProduct, setProductStatus } from "@/lib/admin/actions";

export function ProductRowActions({ productId, status }: { productId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  function run(action: "active" | "hidden" | "archived" | "duplicate") {
    if (action === "archived" && !window.confirm("Archivar este producto?")) {
      return;
    }

    startTransition(async () => {
      if (action === "duplicate") {
        await duplicateProduct(productId);
      } else {
        await setProductStatus(productId, action);
      }
      window.location.reload();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        disabled={pending}
        onClick={() => run(status === "active" ? "hidden" : "active")}
        className="bg-zinc-100 px-2 py-1 text-xs font-black"
      >
        {status === "active" ? "Ocultar" : "Activar"}
      </button>
      <button disabled={pending} onClick={() => run("duplicate")} className="bg-zinc-100 px-2 py-1 text-xs font-black">
        Duplicar
      </button>
      <button disabled={pending} onClick={() => run("archived")} className="bg-red-50 px-2 py-1 text-xs font-black text-red-700">
        Archivar
      </button>
    </div>
  );
}
