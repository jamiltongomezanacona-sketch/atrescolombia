"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
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
      <Button
        type="button"
        disabled={pending}
        onClick={() => run(status === "active" ? "hidden" : "active")}
        variant="secondary"
        size="sm"
        className="h-9 rounded-none px-2.5"
      >
        {status === "active" ? "Ocultar" : "Activar"}
      </Button>
      <Button
        type="button"
        disabled={pending}
        onClick={() => run("duplicate")}
        variant="secondary"
        size="sm"
        className="h-9 rounded-none px-2.5"
      >
        Duplicar
      </Button>
      <Button
        type="button"
        disabled={pending}
        onClick={() => run("archived")}
        variant="ghost"
        size="sm"
        className="h-9 rounded-none bg-red-50 px-2.5 text-red-700 hover:bg-red-100"
      >
        Archivar
      </Button>
    </div>
  );
}
