"use client";

import { useActionState } from "react";
import { signInAdmin } from "@/lib/admin/actions";

const initialState = { ok: false, message: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAdmin, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-2 text-sm font-bold">
        Correo
        <input
          name="email"
          type="email"
          required
          className="h-11 border border-zinc-300 px-3 outline-none focus:border-black"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Contrasena
        <input
          name="password"
          type="password"
          required
          className="h-11 border border-zinc-300 px-3 outline-none focus:border-black"
        />
      </label>
      {state.message ? (
        <p className="bg-red-50 p-3 text-sm font-bold text-red-700">{state.message}</p>
      ) : null}
      <button disabled={pending} className="h-12 bg-black text-sm font-black text-white disabled:opacity-50">
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
