import { cn } from "@/lib/cn";

type AdminSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
};

const selectClass =
  "h-11 w-full rounded-[var(--radius-card)] border border-black/12 bg-surface px-3 text-sm font-normal text-ink outline-none transition focus:border-ink focus-visible:ring-2 focus-visible:ring-ring/30 md:h-11 md:px-3.5";

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
