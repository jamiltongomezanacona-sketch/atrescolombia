"use client";

import { useState, useTransition } from "react";
import { sendShopAdminPasswordReset, setShopStatus } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";

type ShopRowActionsProps = {
  shopId: string;
  status: string;
};

export function ShopRowActions({ shopId, status }: ShopRowActionsProps) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function changeStatus(nextStatus: "active" | "suspended" | "archived") {
    startTransition(async () => {
      setMessage("");
      const result = await setShopStatus(shopId, nextStatus);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      window.location.reload();
    });
  }

  function resetPassword() {
    startTransition(async () => {
      setMessage("");
      const result = await sendShopAdminPasswordReset(shopId);
      setMessage(result.message);
    });
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <Button href={`/admin/tiendas/${shopId}/editar`} variant="metal" size="sm" className="h-10 rounded-full px-3">
          Editar
        </Button>
        {status === "active" ? (
          <Button type="button" disabled={pending} onClick={() => changeStatus("suspended")} variant="secondary" size="sm" className="h-10 rounded-full px-3">
            Suspender
          </Button>
        ) : (
          <Button type="button" disabled={pending} onClick={() => changeStatus("active")} variant="secondary" size="sm" className="h-10 rounded-full px-3">
            Activar
          </Button>
        )}
        <Button type="button" disabled={pending} onClick={resetPassword} variant="secondary" size="sm" className="h-10 rounded-full px-3">
          Restablecer clave
        </Button>
      </div>
      {message ? <p className="text-xs font-bold text-gold-light">{message}</p> : null}
    </div>
  );
}
