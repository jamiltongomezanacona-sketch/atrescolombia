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
    <form action={formAction} className="grid gap-4">
      {children}
      {state.message ? (
        <p
          role="status"
          aria-live="polite"
          className={`${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"} p-3 text-sm font-bold`}
        >
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="rounded-none">
        {pending ? "Guardando..." : submitLabel}
      </Button>
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
      className="rounded-none"
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
    <TextArea label={label} name={name} defaultValue={defaultValue ?? ""} rows={4} className="rounded-none" />
  );
}
