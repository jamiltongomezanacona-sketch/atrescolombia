"use client";

import { useActionState } from "react";
import { signInAdmin } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { ok: false, message: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAdmin, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <Input label="Correo" name="email" type="email" required className="rounded-xl border-[#c7ddf2] bg-[#f5f9ff]" />
      <Input label="Contrasena" name="password" type="password" required className="rounded-xl border-[#c7ddf2] bg-[#f5f9ff]" />
      {state.message ? (
        <p role="status" aria-live="polite" className="bg-red-50 p-3 text-sm font-bold text-red-700">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} variant="metal" size="lg" className="rounded-xl">
        {pending ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
