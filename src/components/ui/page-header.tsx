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
          "atres-rise mb-5 overflow-hidden rounded-[var(--radius-card)] bg-[linear-gradient(145deg,#111111_0%,#1c1917_58%,#2a211c_100%)] p-5 text-white shadow-soft ring-1 ring-white/10 md:p-7",
          className,
        )}
      >
        <p className="text-xs font-medium tracking-wide text-white/65">{eyebrow}</p>
        <h1 className="mt-1.5 text-2xl font-medium tracking-tight text-white sm:text-3xl md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2.5 max-w-2xl text-sm font-normal leading-6 text-white/72">{description}</p>
        ) : null}
        {children}
      </div>
    );
  }

  if (variant === "promo") {
    return (
      <div
        className={cn(
          "atres-rise mb-5 overflow-hidden rounded-[var(--radius-card)] bg-[linear-gradient(135deg,var(--promo)_0%,#fff8d6_55%,#ffffff_100%)] p-5 text-ink shadow-soft ring-1 ring-black/5 md:p-7",
          className,
        )}
      >
        <p className="text-xs font-medium tracking-wide text-ink-muted">{eyebrow}</p>
        <h1 className="mt-1.5 text-2xl font-medium tracking-tight text-ink sm:text-3xl md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2.5 max-w-2xl text-sm font-normal leading-6 text-stone-700">{description}</p>
        ) : null}
        {children}
      </div>
    );
  }

  return (
    <GlassPanel className={cn("atres-rise mb-5 p-5 md:p-6", className)}>
      <p className="text-xs font-medium tracking-wide text-ink-muted">{eyebrow}</p>
      <h1 className="mt-1.5 text-2xl font-medium tracking-tight text-ink sm:text-3xl">{title}</h1>
      {description ? (
        <p className="mt-2.5 max-w-2xl text-sm font-normal leading-6 text-ink-muted">{description}</p>
      ) : null}
      {children}
    </GlassPanel>
  );
}
