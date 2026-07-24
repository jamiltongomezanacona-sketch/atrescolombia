import { cn } from "@/lib/cn";

const tones = {
  black: "bg-ink/90 text-white ring-white/10",
  metal: "bg-[#161616] text-white ring-white/10",
  steel: "bg-stone-100 text-stone-800 ring-stone-200/80",
  brand: "bg-ink text-badge-gold ring-[#f0d48a]/28",
  soft: "bg-white/92 text-stone-700 ring-black/10",
  amber: "bg-[#fff3c4] text-[#7a5a00] ring-amber-200/80",
  emerald: "bg-emerald-50 text-emerald-900 ring-emerald-200/70",
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
