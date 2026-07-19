import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  className?: string;
};

export function EmptyState({ title, description, actionHref, actionLabel, className }: EmptyStateProps) {
  return (
    <GlassPanel className={cn("px-6 py-10 text-center sm:px-8 sm:py-12", className)}>
      <h2 className="text-2xl font-medium tracking-tight text-ink md:text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-normal leading-6 text-ink-muted">{description}</p>
      <Button href={actionHref} className="mt-6" size="md">
        {actionLabel}
      </Button>
    </GlassPanel>
  );
}
