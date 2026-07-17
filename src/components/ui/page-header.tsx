import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  variant?: "glass" | "dark" | "promo";
  className?: string;
  children?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  variant = "glass",
  className,
  children,
}: PageHeaderProps) {
  if (variant === "dark") {
    return (
      <div
        className={cn(
          "mb-5 overflow-hidden rounded-lg bg-black/88 p-5 text-white shadow-soft ring-1 ring-white/10 md:p-7",
          className,
        )}
      >
        <p className="text-xs font-medium text-amber-200">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-medium tracking-tight sm:text-3xl md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm font-normal text-white/75">{description}</p> : null}
        {children}
      </div>
    );
  }

  if (variant === "promo") {
    return (
      <div
        className={cn(
          "mb-5 overflow-hidden rounded-lg bg-[linear-gradient(135deg,var(--promo)_0%,#fff7cc_54%,#ffffff_100%)] p-5 text-ink shadow-[0_18px_45px_rgba(164,117,0,0.12)] ring-1 ring-black/5 md:p-7",
          className,
        )}
      >
        <p className="text-xs font-medium text-stone-700">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-medium tracking-tight sm:text-3xl md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm font-normal text-stone-700">{description}</p> : null}
        {children}
      </div>
    );
  }

  return (
    <GlassPanel className={cn("mb-5 p-5 md:p-6", className)}>
      <p className="text-xs font-medium text-stone-500">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-medium tracking-tight text-ink sm:text-3xl">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm font-normal text-stone-500">{description}</p> : null}
      {children}
    </GlassPanel>
  );
}
