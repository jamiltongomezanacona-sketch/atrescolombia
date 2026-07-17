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
    <GlassPanel className={cn("p-8 text-center", className)}>
      <h2 className="text-2xl font-medium tracking-tight text-ink md:text-3xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-normal text-stone-500">{description}</p>
      <Button href={actionHref} className="mt-5" size="md">
        {actionLabel}
      </Button>
    </GlassPanel>
  );
}
