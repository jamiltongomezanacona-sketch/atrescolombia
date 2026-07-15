"use client";

import { useActionState } from "react";

type State = {
  ok: boolean;
  message: string;
};

type ActionStateFormProps = {
  action: (state: State, formData: FormData) => Promise<State>;
  children: React.ReactNode;
  submitLabel: string;
};

const initialState = { ok: false, message: "" };

export function ActionStateForm({ action, children, submitLabel }: ActionStateFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      {children}
      {state.message ? (
        <p className={`${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"} p-3 text-sm font-bold`}>
          {state.message}
        </p>
      ) : null}
      <button disabled={pending} className="h-11 bg-black px-4 text-sm font-black text-white disabled:opacity-50">
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}

export function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="h-11 border border-zinc-300 px-3 outline-none focus:border-black"
      />
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={4}
        className="border border-zinc-300 px-3 py-2 outline-none focus:border-black"
      />
    </label>
  );
}
