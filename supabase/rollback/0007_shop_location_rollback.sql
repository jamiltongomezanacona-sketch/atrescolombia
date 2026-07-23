-- Rollback for 0007_shop_location.sql
-- Drops only columns added by that migration.
-- Does NOT drop city or other pre-existing shop columns.

alter table public.shops
  drop column if exists location_verified,
  drop column if exists local_delivery_enabled,
  drop column if exists pickup_enabled,
  drop column if exists delivery_radius_km,
  drop column if exists postal_code,
  drop column if exists maps_url,
  drop column if exists longitude,
  drop column if exists latitude,
  drop column if exists address_reference,
  drop column if exists address,
  drop column if exists neighborhood,
  drop column if exists locality,
  drop column if exists department,
  drop column if exists country;
