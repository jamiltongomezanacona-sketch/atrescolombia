import { cn } from "@/lib/cn";

type AdminSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
};

const selectClass =
  "h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 text-sm font-semibold transition focus:border-black focus:bg-white md:h-12 md:px-4";

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
    <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
      <span>{label}</span>
      <select id={selectId} className={cn(selectClass, className)} {...props}>
        {children}
      </select>
      {hint ? <span className="text-xs font-semibold text-zinc-500">{hint}</span> : null}
    </label>
  );
}
