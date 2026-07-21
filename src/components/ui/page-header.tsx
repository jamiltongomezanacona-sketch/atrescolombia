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
          "atres-rise mb-3 overflow-hidden rounded-[var(--radius-card)] bg-[linear-gradient(145deg,#111111_0%,#1c1917_58%,#2a211c_100%)] px-3.5 py-3 text-white shadow-soft ring-1 ring-white/10 sm:px-4 sm:py-3.5 md:mb-3.5",
          className,
        )}
      >
        <p className="text-[11px] font-medium tracking-wide text-white/65 sm:text-xs">{eyebrow}</p>
        <h1 className="mt-0.5 text-xl font-medium tracking-tight text-white sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-xl text-xs font-normal leading-5 text-white/72 sm:text-sm sm:leading-5">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    );
  }

  if (variant === "promo") {
    return (
      <div
        className={cn(
          "atres-rise mb-3 overflow-hidden rounded-[var(--radius-card)] bg-[linear-gradient(135deg,var(--promo)_0%,#fff8d6_55%,#ffffff_100%)] px-3.5 py-3 text-ink shadow-soft ring-1 ring-black/5 sm:px-4 sm:py-3.5 md:mb-3.5",
          className,
        )}
      >
        <p className="text-[11px] font-medium tracking-wide text-ink-muted sm:text-xs">{eyebrow}</p>
        <h1 className="mt-0.5 text-xl font-medium tracking-tight text-ink sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-xl text-xs font-normal leading-5 text-stone-700 sm:text-sm sm:leading-5">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    );
  }

  return (
    <GlassPanel className={cn("atres-rise mb-3 px-3.5 py-3 sm:px-4 sm:py-3.5 md:mb-3.5", className)}>
      <p className="text-[11px] font-medium tracking-wide text-ink-muted sm:text-xs">{eyebrow}</p>
      <h1 className="mt-0.5 text-xl font-medium tracking-tight text-ink sm:text-2xl">{title}</h1>
      {description ? (
        <p className="mt-1 max-w-xl text-xs font-normal leading-5 text-ink-muted sm:text-sm sm:leading-5">
          {description}
        </p>
      ) : null}
      {children}
    </GlassPanel>
  );
}
