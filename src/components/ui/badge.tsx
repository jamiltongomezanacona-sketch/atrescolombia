import { cn } from "@/lib/cn";

const tones = {
  black: "bg-black/85 text-white ring-white/10",
  metal: "bg-[#0b1f3a] text-white ring-white/10",
  steel: "bg-[#dbeafe] text-[#0b1f3a] ring-[#9ec5fe]/35",
  brand: "bg-brand/95 text-white ring-orange-200/40",
  soft: "bg-white/90 text-stone-700 ring-black/10",
  amber: "bg-amber-100 text-amber-900 ring-amber-200/70",
  emerald: "bg-emerald-100 text-emerald-800 ring-emerald-200/70",
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium shadow-sm",
        "ring-1",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
