"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ShopCard, type ShopCardModel } from "@/components/shops/shop-card";
import { haversineDistanceKm, type LatLng } from "@/lib/geo";

type DistanceFilter = "all" | "near" | "5" | "10" | "20";

type ShopsExplorerProps = {
  shops: ShopCardModel[];
};

type GeoStatus = "idle" | "loading" | "success" | "denied" | "unavailable" | "error";

const DISTANCE_FILTERS: Array<{ id: DistanceFilter; label: string }> = [
  { id: "all", label: "Toda Colombia" },
  { id: "near", label: "Cerca de mi" },
  { id: "5", label: "Hasta 5 km" },
  { id: "10", label: "Hasta 10 km" },
  { id: "20", label: "Hasta 20 km" },
];

export function ShopsExplorer({ shops }: ShopsExplorerProps) {
  const [visitor, setVisitor] = useState<LatLng | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>("all");
  const [cityFilter, setCityFilter] = useState("");
  const [localityFilter, setLocalityFilter] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");
  const [sortNear, setSortNear] = useState(false);

  const cities = useMemo(
    () => uniqueSorted(shops.map((shop) => shop.city).filter(Boolean)),
    [shops],
  );
  const localities = useMemo(() => {
    const source = cityFilter ? shops.filter((shop) => shop.city === cityFilter) : shops;
    return uniqueSorted(source.map((shop) => shop.locality).filter(Boolean));
  }, [shops, cityFilter]);
  const neighborhoods = useMemo(() => {
    const source = shops.filter((shop) => {
      if (cityFilter && shop.city !== cityFilter) return false;
      if (localityFilter && shop.locality !== localityFilter) return false;
      return true;
    });
    return uniqueSorted(source.map((shop) => shop.neighborhood).filter(Boolean));
  }, [shops, cityFilter, localityFilter]);

  const enriched = useMemo(() => {
    return shops.map((shop) => {
      const distanceKm =
        visitor && shop.latitude != null && shop.longitude != null
          ? haversineDistanceKm(visitor, { latitude: shop.latitude, longitude: shop.longitude })
          : null;
      return { ...shop, distanceKm };
    });
  }, [shops, visitor]);

  const filtered = useMemo(() => {
    let list = enriched.filter((shop) => {
      if (cityFilter && shop.city !== cityFilter) return false;
      if (localityFilter && shop.locality !== localityFilter) return false;
      if (neighborhoodFilter && shop.neighborhood !== neighborhoodFilter) return false;

      if (distanceFilter === "all" || !visitor) return true;

      // Radius filters need real coordinates; text-only shops stay via city/locality/barrio filters.
      if (shop.distanceKm == null) {
        return Boolean(cityFilter || localityFilter || neighborhoodFilter);
      }

      if (distanceFilter === "near") return shop.distanceKm <= 20;
      const maxKm = Number(distanceFilter);
      return shop.distanceKm <= maxKm;
    });

    if (sortNear && visitor) {
      list = [...list].sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return a.name.localeCompare(b.name);
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return list;
  }, [enriched, cityFilter, localityFilter, neighborhoodFilter, distanceFilter, sortNear, visitor]);

  const hasActiveFilters =
    Boolean(cityFilter || localityFilter || neighborhoodFilter) || distanceFilter !== "all" || sortNear;

  function requestLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("unavailable");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setVisitor({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoStatus("success");
        setSortNear(true);
        if (distanceFilter === "all") setDistanceFilter("near");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) setGeoStatus("denied");
        else if (error.code === error.POSITION_UNAVAILABLE) setGeoStatus("unavailable");
        else setGeoStatus("error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 },
    );
  }

  function resetFilters() {
    setDistanceFilter("all");
    setCityFilter("");
    setLocalityFilter("");
    setNeighborhoodFilter("");
    setSortNear(false);
  }

  return (
    <div className="grid gap-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={requestLocation}
          disabled={geoStatus === "loading"}
          className="inline-flex h-9 min-h-9 items-center rounded-full bg-ink px-3.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          {geoStatus === "loading" ? "Buscando ubicacion..." : "Usar mi ubicacion"}
        </button>
        {visitor ? (
          <button
            type="button"
            onClick={() => setSortNear((value) => !value)}
            className={`inline-flex h-9 min-h-9 items-center rounded-full px-3.5 text-xs font-semibold ring-1 ${
              sortNear ? "bg-ink text-white ring-ink" : "bg-surface text-ink ring-black/10"
            }`}
          >
            {sortNear ? "Orden: cercania" : "Ordenar por cercania"}
          </button>
        ) : null}
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-9 min-h-9 items-center rounded-full bg-surface px-3.5 text-xs font-semibold text-ink ring-1 ring-black/10"
          >
            Reiniciar
          </button>
        ) : null}
        <p className="min-w-0 flex-1 text-[11px] text-ink-muted sm:text-xs" role="status" aria-live="polite">
          {visitorStatusLabel(geoStatus)}
        </p>
      </div>

      <div className="atres-scroll -mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5">
        {DISTANCE_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setDistanceFilter(item.id)}
            className={`inline-flex h-8 min-h-8 shrink-0 items-center rounded-full px-3 text-[11px] font-semibold ring-1 sm:text-xs ${
              distanceFilter === item.id
                ? "bg-ink text-white ring-ink"
                : "bg-surface text-ink-muted ring-black/10 hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid w-full gap-2 sm:grid-cols-3 sm:gap-2.5">
        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
          Ciudad
          <select
            value={cityFilter}
            onChange={(event) => {
              setCityFilter(event.target.value);
              setLocalityFilter("");
              setNeighborhoodFilter("");
            }}
            className="h-9 w-full rounded-[var(--radius-card)] border border-black/10 bg-surface px-2.5 text-sm font-medium text-ink"
          >
            <option value="">Todas</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
          Localidad
          <select
            value={localityFilter}
            onChange={(event) => {
              setLocalityFilter(event.target.value);
              setNeighborhoodFilter("");
            }}
            className="h-9 w-full rounded-[var(--radius-card)] border border-black/10 bg-surface px-2.5 text-sm font-medium text-ink"
          >
            <option value="">Todas</option>
            {localities.map((locality) => (
              <option key={locality} value={locality}>
                {locality}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
          Barrio
          <select
            value={neighborhoodFilter}
            onChange={(event) => setNeighborhoodFilter(event.target.value)}
            className="h-9 w-full rounded-[var(--radius-card)] border border-black/10 bg-surface px-2.5 text-sm font-medium text-ink"
          >
            <option value="">Todos</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Sin tiendas en este filtro"
          description="Prueba otra ciudad, barrio o radio. Las tiendas sin GPS siguen apareciendo por texto."
          actionHref="/productos"
          actionLabel="Ver catalogo"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {filtered.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </ul>
      )}
    </div>
  );
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}

function visitorStatusLabel(status: GeoStatus) {
  switch (status) {
    case "loading":
      return "Buscando ubicacion...";
    case "success":
      return "Ubicacion activa. Distancia solo en tiendas con GPS.";
    case "denied":
      return "Permiso denegado. Puedes filtrar por ciudad o barrio.";
    case "unavailable":
      return "Ubicacion no disponible. El catalogo sigue abierto.";
    case "error":
      return "No se pudo obtener la ubicacion. Intenta de nuevo.";
    default:
      return "La ubicacion es opcional y no se guarda en el servidor.";
  }
}
