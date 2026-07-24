"use client";

import { useState } from "react";

export type ShopLocationValues = {
  country: string;
  department: string;
  city: string;
  locality: string;
  neighborhood: string;
  address: string;
  address_reference: string;
  latitude: string;
  longitude: string;
  maps_url: string;
  postal_code: string;
  delivery_radius_km: string;
  pickup_enabled: boolean;
  local_delivery_enabled: boolean;
  location_verified: boolean;
};

type ShopLocationFieldsProps = {
  values: ShopLocationValues;
  onChange: (patch: Partial<ShopLocationValues>) => void;
  showAdvancedCoords?: boolean;
  inputClass: string;
  textareaClass: string;
};

type GeoStatus = "idle" | "loading" | "success" | "denied" | "unavailable" | "error";

export function ShopLocationFields({
  values,
  onChange,
  showAdvancedCoords = true,
  inputClass,
  textareaClass,
}: ShopLocationFieldsProps) {
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [showCoords, setShowCoords] = useState(showAdvancedCoords);

  function useCurrentLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("unavailable");
      return;
    }

    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          latitude: String(Number(position.coords.latitude.toFixed(6))),
          longitude: String(Number(position.coords.longitude.toFixed(6))),
        });
        setShowCoords(true);
        setGeoStatus("success");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) setGeoStatus("denied");
        else if (error.code === error.POSITION_UNAVAILABLE) setGeoStatus("unavailable");
        else setGeoStatus("error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  return (
    <section className="theme-panel grid min-w-0 max-w-full gap-3 rounded-xl p-3 md:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="theme-kicker">Ubicacion</p>
          <h2 className="mt-1 text-base font-black tracking-normal text-ink md:text-lg">
            Ubicacion de la tienda
          </h2>
        </div>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={geoStatus === "loading"}
          className="theme-primary-button inline-flex min-h-11 items-center rounded-full px-4 text-xs font-black disabled:opacity-60"
        >
          {geoStatus === "loading" ? "Buscando ubicacion..." : "Usar mi ubicacion"}
        </button>
      </div>

      <p className="text-xs font-medium leading-5 text-ink-muted" role="status" aria-live="polite">
        {geoStatusLabel(geoStatus)}
      </p>

      <div className="grid min-w-0 gap-3 md:grid-cols-2">
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Pais
          <input
            name="country"
            value={values.country || "Colombia"}
            onChange={(event) => onChange({ country: event.target.value.slice(0, 80) })}
            className={inputClass}
            maxLength={80}
          />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Departamento
          <input
            name="department"
            value={values.department}
            onChange={(event) => onChange({ department: event.target.value.slice(0, 80) })}
            className={inputClass}
            maxLength={80}
          />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Ciudad
          <input
            name="city"
            value={values.city}
            onChange={(event) => onChange({ city: event.target.value.slice(0, 80) })}
            className={inputClass}
            maxLength={80}
          />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Localidad
          <input
            name="locality"
            value={values.locality}
            onChange={(event) => onChange({ locality: event.target.value.slice(0, 80) })}
            className={inputClass}
            maxLength={80}
          />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Barrio
          <input
            name="neighborhood"
            value={values.neighborhood}
            onChange={(event) => onChange({ neighborhood: event.target.value.slice(0, 80) })}
            className={inputClass}
            maxLength={80}
          />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Codigo postal
          <input
            name="postal_code"
            value={values.postal_code}
            onChange={(event) => onChange({ postal_code: event.target.value.slice(0, 20) })}
            className={inputClass}
            maxLength={20}
          />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold md:col-span-2">
          Direccion
          <input
            name="address"
            value={values.address}
            onChange={(event) => onChange({ address: event.target.value.slice(0, 240) })}
            className={inputClass}
            placeholder="Calle, carrera, numero"
            maxLength={240}
          />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold md:col-span-2">
          Referencia adicional
          <textarea
            name="address_reference"
            value={values.address_reference}
            onChange={(event) => onChange({ address_reference: event.target.value.slice(0, 180) })}
            rows={2}
            className={textareaClass}
            maxLength={180}
            placeholder="Ej: frente al parque, segundo piso"
          />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold md:col-span-2">
          Maps URL
          <input
            name="maps_url"
            type="url"
            value={values.maps_url}
            onChange={(event) => onChange({ maps_url: event.target.value.slice(0, 500) })}
            className={inputClass}
            maxLength={500}
            placeholder="https://maps.google.com/..."
          />
        </label>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-black-main/40 px-3 text-sm font-bold">
          <input
            name="pickup_enabled"
            type="checkbox"
            checked={values.pickup_enabled}
            onChange={(event) => onChange({ pickup_enabled: event.target.checked })}
            className="size-4 accent-gold"
          />
          Permitir recogida en tienda
        </label>
        <label className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-black-main/40 px-3 text-sm font-bold">
          <input
            name="local_delivery_enabled"
            type="checkbox"
            checked={values.local_delivery_enabled}
            onChange={(event) => onChange({ local_delivery_enabled: event.target.checked })}
            className="size-4 accent-gold"
          />
          Realiza entregas locales
        </label>
      </div>

      {values.local_delivery_enabled ? (
        <label className="grid max-w-xs gap-2 text-sm font-bold">
          Radio de entrega (km)
          <input
            name="delivery_radius_km"
            type="number"
            min={0}
            step={0.5}
            value={values.delivery_radius_km}
            onChange={(event) => onChange({ delivery_radius_km: event.target.value })}
            className={inputClass}
            placeholder="5"
          />
        </label>
      ) : (
        <input type="hidden" name="delivery_radius_km" value="" />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowCoords((value) => !value)}
          className="text-xs font-black text-gold-light underline-offset-2 hover:underline"
        >
          {showCoords ? "Ocultar coordenadas" : "Mostrar coordenadas (avanzado)"}
        </button>
        <label className="flex items-center gap-2 text-xs font-bold text-ink-muted">
          <input
            name="location_verified"
            type="checkbox"
            checked={values.location_verified}
            onChange={(event) => onChange({ location_verified: event.target.checked })}
            className="size-4 accent-gold"
          />
          Ubicacion verificada
        </label>
      </div>

      {showCoords ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Latitud
            <input
              name="latitude"
              value={values.latitude}
              onChange={(event) => onChange({ latitude: event.target.value })}
              className={inputClass}
              inputMode="decimal"
              placeholder="4.7110"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Longitud
            <input
              name="longitude"
              value={values.longitude}
              onChange={(event) => onChange({ longitude: event.target.value })}
              className={inputClass}
              inputMode="decimal"
              placeholder="-74.0721"
            />
          </label>
        </div>
      ) : (
        <>
          <input type="hidden" name="latitude" value={values.latitude} />
          <input type="hidden" name="longitude" value={values.longitude} />
        </>
      )}
    </section>
  );
}

function geoStatusLabel(status: GeoStatus) {
  switch (status) {
    case "loading":
      return "Buscando ubicacion...";
    case "success":
      return "Ubicacion obtenida. Puedes ajustar la direccion escrita si hace falta.";
    case "denied":
      return "Permiso denegado. Puedes seguir con la direccion manual.";
    case "unavailable":
      return "Ubicacion no disponible en este dispositivo. Usa la direccion manual.";
    case "error":
      return "Error al obtener la ubicacion. Intenta de nuevo o escribe la direccion.";
    default:
      return "La direccion manual funciona aunque no actives el GPS.";
  }
}
