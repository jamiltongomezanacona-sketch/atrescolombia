import { cn } from "@/lib/cn";

type GlassPanelProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "aside" | "article";
};

export function GlassPanel({ children, className, as: Tag = "div" }: GlassPanelProps) {
  return (
    <Tag
      className={cn(
        "glass-surface rounded-[var(--radius-card)] ring-1 ring-white/10 transition duration-300",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
