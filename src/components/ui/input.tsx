import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

const fieldClass =
  "h-11 w-full rounded-[var(--radius-card)] border border-black/12 bg-surface px-3 text-sm font-normal text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-ink focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1";

const storeFieldClass =
  "h-11 w-full rounded-[var(--radius-card)] border border-black/10 bg-surface px-3.5 text-sm font-normal text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-brand focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1";

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="grid gap-1.5 text-sm font-normal text-ink-muted">
      {label ? <span className="text-ink">{label}</span> : null}
      <input id={inputId} className={cn(fieldClass, className)} {...props} />
    </label>
  );
}

export function StoreInput({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  if (!label) {
    return <input id={inputId} className={cn(storeFieldClass, className)} {...props} />;
  }

  return (
    <label className="grid gap-1.5 text-sm font-normal text-ink-muted">
      <span className="text-ink">{label}</span>
      <input id={inputId} className={cn(storeFieldClass, className)} {...props} />
    </label>
  );
}

export function TextArea({ label, className, id, ...props }: TextAreaProps) {
  const areaId = id ?? props.name;

  return (
    <label className="grid gap-1.5 text-sm font-normal text-ink-muted">
      {label ? <span className="text-ink">{label}</span> : null}
      <textarea
        id={areaId}
        className={cn(
          "w-full rounded-[var(--radius-card)] border border-black/12 bg-surface px-3 py-2.5 text-sm font-normal text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-ink focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1",
          className,
        )}
        {...props}
      />
    </label>
  );
}
