import { buildMapsLocationUrl, formatDistanceKm } from "@/lib/geo";

export type ShopLocationRowProps = {
  city?: string | null;
  locality?: string | null;
  neighborhood?: string | null;
  distanceKm?: number | null;
  mapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  className?: string;
};

export function ShopLocationRow({
  city,
  locality,
  neighborhood,
  distanceKm,
  mapsUrl,
  latitude,
  longitude,
  address,
  className = "",
}: ShopLocationRowProps) {
  const place = buildPlaceLabel({ city, locality, neighborhood });
  const distanceLabel = formatDistanceKm(distanceKm);
  const locationHref = buildMapsLocationUrl({ mapsUrl, latitude, longitude, address });

  if (!place && !distanceLabel && !locationHref) return null;

  return (
    <div
      className={`flex min-w-0 items-center gap-2 text-[11px] leading-4 text-ink-muted sm:text-xs ${className}`}
    >
      <span className="inline-flex size-4 shrink-0 items-center justify-center text-ink/70" aria-hidden="true">
        <MapPinIcon className="size-3.5" />
      </span>
      <p className="min-w-0 flex-1 truncate font-medium text-ink/80">
        {place || "Colombia"}
      </p>
      {distanceLabel ? (
        <span className="shrink-0 whitespace-nowrap font-medium tabular-nums text-ink/70">
          A {distanceLabel}
        </span>
      ) : null}
    </div>
  );
}

export function ShopLocationButton({
  shopName,
  mapsUrl,
  latitude,
  longitude,
  address,
  className = "",
  fullWidth = false,
  showDisabled = false,
  label = "Ver ubicacion",
}: {
  shopName: string;
  mapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  className?: string;
  fullWidth?: boolean;
  showDisabled?: boolean;
  label?: string;
}) {
  const href = buildMapsLocationUrl({ mapsUrl, latitude, longitude, address });
  const buttonClass = `theme-secondary-button group/loc inline-flex h-11 min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-full px-3 text-[11px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:text-xs ${
    fullWidth ? "w-full" : "w-1/2"
  } ${className}`;

  if (!href) {
    if (!showDisabled) return null;

    return (
      <span
        aria-disabled="true"
        className={`${buttonClass} cursor-not-allowed opacity-45`}
      >
        <MapPinIcon className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver ubicacion de la tienda ${shopName}`}
      className={buttonClass}
    >
      <MapPinIcon className="size-3.5 shrink-0 transition-transform duration-200 ease-out group-hover/loc:translate-x-0.5" />
      <span className="truncate">{label}</span>
    </a>
  );
}

export function buildShopPlaceLabel({
  city,
  locality,
  neighborhood,
}: {
  city?: string | null;
  locality?: string | null;
  neighborhood?: string | null;
}) {
  return buildPlaceLabel({ city, locality, neighborhood });
}

function buildPlaceLabel({
  city,
  locality,
  neighborhood,
}: {
  city?: string | null;
  locality?: string | null;
  neighborhood?: string | null;
}) {
  const cityLabel = city?.trim() || "";
  const sector = (neighborhood || locality || "").trim();
  if (cityLabel && sector) return `${cityLabel} · ${sector}`;
  return cityLabel || sector || "";
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
