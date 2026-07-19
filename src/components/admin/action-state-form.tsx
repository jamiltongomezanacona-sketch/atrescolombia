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
          className={`${state.ok ? "bg-[#eef6ff] text-[#0b1f3a] ring-[#d8e7f5]" : "bg-red-50 text-red-700 ring-red-100"} rounded-xl p-3 text-sm font-bold ring-1`}
        >
          {state.message}
        </p>
      ) : null}
      <div className="sticky bottom-3 z-10 rounded-2xl border border-zinc-200/80 bg-white/92 p-2 shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur md:bottom-4">
        <Button type="submit" disabled={pending} variant="metal" className="h-11 w-full rounded-xl md:h-12">
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
      className="h-11 rounded-xl border-zinc-200 bg-zinc-50/70 px-3 text-sm focus:bg-white md:h-12 md:px-4"
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
    <TextArea label={label} name={name} defaultValue={defaultValue ?? ""} rows={3} className="rounded-xl border-zinc-200 bg-zinc-50/70 px-3 text-sm focus:bg-white md:px-4" />
  );
}
