import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  hidden: "Oculto",
  archived: "Archivado",
};

const STATUS_TONES = {
  active: "emerald",
  hidden: "soft",
  archived: "amber",
} as const;

export function AdminStatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status as keyof typeof STATUS_TONES] ?? "soft";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <Badge tone={tone} className="rounded-none shadow-none">
      {label}
    </Badge>
  );
}
