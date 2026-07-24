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
      <Input label="Correo" name="email" type="email" required />
      <Input label="Contrasena" name="password" type="password" required />
      {state.message ? (
        <p
          role="status"
          aria-live="polite"
          className="theme-error rounded-[var(--radius-card)] p-3 text-sm font-medium"
        >
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} variant="primary" size="lg">
        {pending ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
