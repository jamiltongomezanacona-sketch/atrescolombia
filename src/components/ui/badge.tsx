import { cn } from "@/lib/cn";

const tones = {
  black: "bg-black-main/92 text-white ring-white/10",
  metal: "bg-gray-dark text-white ring-white/10",
  steel: "bg-gray-dark text-ink-muted ring-white/10",
  brand: "bg-gold text-black-main ring-gold-light/30",
  soft: "bg-surface-muted text-ink-muted ring-white/10",
  amber: "bg-gold-light text-black-main ring-gold-light/40",
  emerald: "bg-gold/12 text-gold-light ring-gold/30",
  success: "bg-[rgba(34,197,94,0.16)] text-[var(--success-soft-text)] ring-[rgba(34,197,94,0.45)]",
  danger: "bg-[rgba(239,68,68,0.16)] text-[var(--danger-soft-text)] ring-[rgba(239,68,68,0.45)]",
} as const;

type BadgeProps = {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
};

export function Badge({ children, tone = "black", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-card)] px-2 py-0.5 text-[10px] font-medium tracking-wide transition duration-200",
        "ring-1",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
