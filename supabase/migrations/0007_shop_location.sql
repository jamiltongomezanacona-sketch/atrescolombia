-- 0007_shop_location.sql
-- Safe, reversible location fields for public.shops.
-- Reuses existing city column. RLS stays unchanged.

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
