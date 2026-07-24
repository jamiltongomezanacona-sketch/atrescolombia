import { cn } from "@/lib/cn";

type AdminSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
};

const selectClass =
  "theme-field h-11 w-full rounded-[var(--radius-card)] px-3 text-sm font-normal md:h-11 md:px-3.5";

export function AdminSelect({ label, hint, className, id, children, ...props }: AdminSelectProps) {
  const selectId = id ?? props.name;

  if (!label) {
    return (
      <select id={selectId} className={cn(selectClass, className)} {...props}>
        {children}
      </select>
    );
  }

  return (
    <label className="grid gap-1.5 text-sm font-normal text-ink-muted">
      <span className="font-medium text-ink">{label}</span>
      <select id={selectId} className={cn(selectClass, className)} {...props}>
        {children}
      </select>
      {hint ? <span className="text-xs font-normal text-ink-muted">{hint}</span> : null}
    </label>
  );
}
