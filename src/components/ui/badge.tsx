import { cn } from "@/lib/cn";

const tones = {
  black: "bg-black/84 text-white",
  brand: "bg-brand/92 text-white",
  soft: "bg-stone-100/90 text-stone-700",
  amber: "bg-amber-100 text-amber-900",
  emerald: "bg-emerald-100 text-emerald-800",
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase shadow-sm",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
