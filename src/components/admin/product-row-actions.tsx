"use client";

import { useState } from "react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { duplicateProduct, setProductStatus } from "@/lib/admin/actions";

export function ProductRowActions({ productId, status }: { productId: string; status: string }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function run(action: "active" | "hidden" | "archived" | "duplicate") {
    if (action === "archived" && !window.confirm("Archivar este producto?")) {
      return;
    }

    startTransition(async () => {
      setMessage("");
      const result = action === "duplicate"
        ? await duplicateProduct(productId)
        : await setProductStatus(productId, action);

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      window.location.reload();
    });
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          href={`/admin/productos/${productId}/editar`}
          variant="brand"
          size="sm"
          className="h-10 rounded-full px-3 shadow-sm"
        >
          Editar
        </Button>
        <Button
          type="button"
          disabled={pending}
          onClick={() => run(status === "active" ? "hidden" : "active")}
          variant="secondary"
          size="sm"
          className="h-10 rounded-full px-3"
        >
          {status === "active" ? "Ocultar" : "Activar"}
        </Button>
        <Button
          type="button"
          disabled={pending}
          onClick={() => run("duplicate")}
          variant="secondary"
          size="sm"
          className="h-10 rounded-full px-3"
        >
          Duplicar
        </Button>
        <Button
          type="button"
          disabled={pending}
          onClick={() => run("archived")}
          variant="ghost"
          size="sm"
          className="h-10 rounded-full bg-red-50 px-3 text-red-700 hover:bg-red-100"
        >
          Archivar
        </Button>
      </div>
      {message ? <p className="text-xs font-bold text-red-700">{message}</p> : null}
    </div>
  );
}
