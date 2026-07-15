import { cn } from "@/lib/cn";

type GlassPanelProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "aside" | "article";
};

export function GlassPanel({ children, className, as: Tag = "div" }: GlassPanelProps) {
  return (
    <Tag className={cn("glass-surface rounded-lg ring-1 ring-white/65", className)}>{children}</Tag>
  );
}
