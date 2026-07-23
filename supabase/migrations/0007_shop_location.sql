-- 0007_shop_location.sql
-- Safe, reversible location fields for public.shops.
-- Reuses existing city column. Does NOT enable PostGIS.
-- Recommendation: add geography(Point,4326) later only if volume justifies it.

alter table public.shops
  add column if not exists country text not null default 'Colombia',
  add column if not exists department text not null default '',
  add column if not exists locality text not null default '',
  add column if not exists neighborhood text not null default '',
  add column if not exists address text not null default '',
  add column if not exists address_reference text not null default '',
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists maps_url text,
  add column if not exists postal_code text not null default '',
  add column if not exists delivery_radius_km numeric(8,2),
  add column if not exists pickup_enabled boolean not null default false,
  add column if not exists local_delivery_enabled boolean not null default false,
  add column if not exists location_verified boolean not null default false;

-- Coordinate range checks (nullable coords remain valid).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'shops_latitude_range'
  ) then
    alter table public.shops
      add constraint shops_latitude_range
      check (latitude is null or (latitude >= -90 and latitude <= 90));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'shops_longitude_range'
  ) then
    alter table public.shops
      add constraint shops_longitude_range
      check (longitude is null or (longitude >= -180 and longitude <= 180));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'shops_delivery_radius_nonnegative'
  ) then
    alter table public.shops
      add constraint shops_delivery_radius_nonnegative
      check (delivery_radius_km is null or delivery_radius_km >= 0);
  end if;
end $$;

-- Useful filters (city already widely used; geo pair for future nearby queries).
create index if not exists shops_city_idx on public.shops (city);
create index if not exists shops_department_city_idx on public.shops (department, city);
create index if not exists shops_locality_idx on public.shops (locality);
create index if not exists shops_neighborhood_idx on public.shops (neighborhood);
create index if not exists shops_lat_lng_idx on public.shops (latitude, longitude)
  where latitude is not null and longitude is not null;

-- RLS unchanged: shop admin can update own shop; superadmin manages all.
-- New columns inherit existing shops policies.

comment on column public.shops.country is 'Country label for sectorization (default Colombia).';
comment on column public.shops.department is 'Departamento.';
comment on column public.shops.locality is 'Localidad or municipio.';
comment on column public.shops.neighborhood is 'Barrio or sector.';
comment on column public.shops.address is 'Street address for pickup / directions.';
comment on column public.shops.address_reference is 'Optional landmark / reference.';
comment on column public.shops.latitude is 'WGS84 latitude. Null when GPS not set.';
comment on column public.shops.longitude is 'WGS84 longitude. Null when GPS not set.';
comment on column public.shops.maps_url is 'Optional external maps URL override.';
comment on column public.shops.delivery_radius_km is 'Local delivery radius in km when enabled.';
comment on column public.shops.pickup_enabled is 'Store pickup available.';
comment on column public.shops.local_delivery_enabled is 'Local delivery available.';
comment on column public.shops.location_verified is 'Admin-confirmed location accuracy.';
