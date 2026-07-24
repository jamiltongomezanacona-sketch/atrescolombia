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
    <form action={formAction} className="grid gap-4 md:gap-5">
      {children}
      {state.message ? (
        <p
          role="status"
          aria-live="polite"
          className={`${state.ok ? "theme-ok" : "theme-error"} rounded-[var(--radius-card)] p-3 text-sm font-medium`}
        >
          {state.message}
        </p>
      ) : null}
      <div className="theme-panel sticky bottom-3 z-10 rounded-[var(--radius-card)] p-2 backdrop-blur md:bottom-4">
        <Button type="submit" disabled={pending} variant="primary" className="h-11 w-full md:h-11">
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
  maxLength,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <Input
      label={label}
      name={name}
      type={type}
      required={required}
      maxLength={maxLength}
      placeholder={placeholder}
      defaultValue={defaultValue ?? ""}
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
  return <TextArea label={label} name={name} defaultValue={defaultValue ?? ""} rows={3} />;
}
