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
    <GlassPanel className={cn("atres-rise px-6 py-10 text-center sm:px-8 sm:py-12", className)}>
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-[var(--radius-card)] bg-surface-muted text-ink-muted">
        <EmptyIcon />
      </div>
      <h2 className="text-2xl font-medium tracking-tight text-ink md:text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-normal leading-6 text-ink-muted">{description}</p>
      <Button href={actionHref} className="mt-6" size="md">
        {actionLabel}
      </Button>
    </GlassPanel>
  );
}

function EmptyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 fill-none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16v12H4z" />
      <path d="M8 7V5h8v2" />
      <path d="M9 12h6" />
    </svg>
  );
}
