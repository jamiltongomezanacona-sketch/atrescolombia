-- ATRES catalog safe reset.
-- Purpose: remove catalog content while preserving admins, auth users,
-- business records, cities, store settings, RLS policies and schema.
--
-- How to use:
-- 1. Supabase Dashboard -> SQL Editor.
-- 2. Paste this full file.
-- 3. Run it only when you are sure you want to erase catalog content.
--
-- This script deletes from database:
-- - products and related product rows
-- - product images table rows
-- - banners and promotions
--
-- Important:
-- Supabase blocks direct SQL deletion from storage.objects.
-- After running this SQL, delete files from the product-images bucket using:
-- Storage -> product-images -> select folders/files -> Delete.
--
-- This script keeps:
-- - auth.users
-- - public.profiles
-- - public.businesses / business_members, if they exist
-- - public.cities, if it exists
-- - public.store_settings
-- - public.categories by default

begin;

-- Confirmation guard. Do not change this unless you understand the reset.
set local app.atres_reset_confirm = 'RESET_ATRES_CATALOG';

do $$
declare
  deleted_count bigint;
begin
  if current_setting('app.atres_reset_confirm', true) <> 'RESET_ATRES_CATALOG' then
    raise exception 'Reset cancelado: falta confirmacion app.atres_reset_confirm.';
  end if;

  raise notice 'ATRES reset: iniciando limpieza segura de catalogo.';

  if to_regclass('public.promotion_products') is not null then
    execute 'delete from public.promotion_products';
    get diagnostics deleted_count = row_count;
    raise notice 'promotion_products eliminados: %', deleted_count;
  end if;

  if to_regclass('public.favorites') is not null then
    execute 'delete from public.favorites';
    get diagnostics deleted_count = row_count;
    raise notice 'favorites eliminados: %', deleted_count;
  end if;

  if to_regclass('public.inventory') is not null then
    execute 'delete from public.inventory';
    get diagnostics deleted_count = row_count;
    raise notice 'inventory eliminado: %', deleted_count;
  end if;

  if to_regclass('public.product_variants') is not null then
    execute 'delete from public.product_variants';
    get diagnostics deleted_count = row_count;
    raise notice 'product_variants eliminados: %', deleted_count;
  end if;

  if to_regclass('public.product_categories') is not null then
    execute 'delete from public.product_categories';
    get diagnostics deleted_count = row_count;
    raise notice 'product_categories eliminados: %', deleted_count;
  end if;

  if to_regclass('public.product_images') is not null then
    execute 'delete from public.product_images';
    get diagnostics deleted_count = row_count;
    raise notice 'product_images eliminados: %', deleted_count;
  end if;

  if to_regclass('public.products') is not null then
    execute 'delete from public.products';
    get diagnostics deleted_count = row_count;
    raise notice 'products eliminados: %', deleted_count;
  end if;

  if to_regclass('public.promotions') is not null then
    execute 'delete from public.promotions';
    get diagnostics deleted_count = row_count;
    raise notice 'promotions eliminadas: %', deleted_count;
  end if;

  if to_regclass('public.banners') is not null then
    execute 'delete from public.banners';
    get diagnostics deleted_count = row_count;
    raise notice 'banners eliminados: %', deleted_count;
  end if;

  raise notice 'ATRES reset: catalogo limpio. Admins, negocio, configuracion y categorias se conservaron.';
  raise notice 'Storage no se borra por SQL. Borra archivos manualmente en Storage > product-images o usa la Storage API.';
end $$;

commit;

-- Optional full category reset:
-- Use this only if you also want to delete all category structure.
-- Run it separately after the reset above.
--
-- begin;
-- set local app.atres_reset_confirm = 'RESET_ATRES_CATEGORIES';
-- do $$
-- begin
--   if current_setting('app.atres_reset_confirm', true) <> 'RESET_ATRES_CATEGORIES' then
--     raise exception 'Reset de categorias cancelado.';
--   end if;
--
--   if to_regclass('public.categories') is not null then
--     delete from public.categories;
--     raise notice 'categories eliminadas.';
--   end if;
-- end $$;
-- commit;
