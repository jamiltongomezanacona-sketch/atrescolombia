"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, TextArea } from "@/components/ui/input";

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
    <form action={formAction} className="grid gap-5">
      {children}
      {state.message ? (
        <p
          role="status"
          aria-live="polite"
          className={`${state.ok ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-red-50 text-red-700 ring-red-100"} rounded-xl p-3 text-sm font-bold ring-1`}
        >
          {state.message}
        </p>
      ) : null}
      <div className="sticky bottom-4 z-10 rounded-2xl border border-zinc-200/80 bg-white/90 p-2 shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur">
        <Button type="submit" disabled={pending} className="h-12 w-full rounded-xl">
        {pending ? "Guardando..." : submitLabel}
        </Button>
      </div>
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
    <Input
      label={label}
      name={name}
      type={type}
      required={required}
      defaultValue={defaultValue ?? ""}
      className="rounded-xl border-zinc-200 bg-zinc-50/70 focus:bg-white"
    />
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
    <TextArea label={label} name={name} defaultValue={defaultValue ?? ""} rows={4} className="rounded-xl border-zinc-200 bg-zinc-50/70 focus:bg-white" />
  );
}
