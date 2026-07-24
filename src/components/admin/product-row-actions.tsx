"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteArchivedProduct, duplicateProduct, setProductStatus } from "@/lib/admin/actions";

type ProductRowActionsProps = {
  productId: string;
  status: string;
  productName?: string;
};

export function ProductRowActions({ productId, status, productName = "este producto" }: ProductRowActionsProps) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const isArchived = status === "archived";

  function run(action: "active" | "hidden" | "archived" | "duplicate") {
    if (action === "archived" && !window.confirm("Archivar este producto?")) {
      return;
    }

    startTransition(async () => {
      setMessage("");
      const result =
        action === "duplicate" ? await duplicateProduct(productId) : await setProductStatus(productId, action);

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      window.location.reload();
    });
  }

  function runDelete() {
    const confirmed = window.confirm(
      `Eliminar permanentemente "${productName}"?\n\nSe borrara de la base de datos junto con sus variantes e imagenes. Esta accion no se puede deshacer.`,
    );
    if (!confirmed) return;

    const doubleCheck = window.confirm("Confirmacion final: ¿borrar de verdad este producto archivado?");
    if (!doubleCheck) return;

    startTransition(async () => {
      setMessage("");
      const result = await deleteArchivedProduct(productId);
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
          variant="metal"
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
        {isArchived ? (
          <Button
            type="button"
            disabled={pending}
            onClick={runDelete}
            variant="brand"
            size="sm"
            className="theme-danger-button h-10 rounded-full px-3"
          >
            Eliminar
          </Button>
        ) : (
          <Button
            type="button"
            disabled={pending}
            onClick={() => run("archived")}
            variant="secondary"
            size="sm"
            className="theme-danger-button h-10 rounded-full px-3"
          >
            Archivar
          </Button>
        )}
      </div>
      {message ? <p className="text-xs font-bold text-red-300">{message}</p> : null}
    </div>
  );
}
