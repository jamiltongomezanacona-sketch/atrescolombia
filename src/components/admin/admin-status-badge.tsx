import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  hidden: "Oculto",
  suspended: "Suspendida",
  archived: "Archivado",
};

const STATUS_TONES = {
  active: "success",
  hidden: "danger",
  suspended: "danger",
  archived: "steel",
} as const;

export function AdminStatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status as keyof typeof STATUS_TONES] ?? "soft";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <Badge tone={tone} className="shadow-none">
      {label}
    </Badge>
  );
}
