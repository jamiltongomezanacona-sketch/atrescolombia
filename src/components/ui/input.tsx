import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

const fieldClass =
  "theme-field h-11 w-full rounded-[var(--radius-card)] px-3 text-sm font-normal";

const storeFieldClass =
  "theme-field h-11 w-full rounded-[var(--radius-card)] px-3.5 text-sm font-normal";

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
          "theme-field w-full rounded-[var(--radius-card)] px-3 py-2.5 text-sm font-normal",
          className,
        )}
        {...props}
      />
    </label>
  );
}
