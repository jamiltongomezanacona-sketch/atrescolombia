-- ATRES multitienda follow-up: rename default shop to ATRES KINDS / atres-kinds.
-- Idempotent and non-destructive. Safe to run after 0005_multitienda_shops.sql.

-- Prefer renaming the existing default shop (atres-kids) when present.
update public.shops
set
  name = 'ATRES KINDS',
  title = 'ATRES KINDS',
  slug = 'atres-kinds',
  short_description = 'Tienda principal de ATRES Colombia.',
  description = 'Productos migrados desde el catalogo ATRES para la arquitectura multitienda.',
  updated_at = now()
where slug = 'atres-kids';

-- Ensure ATRES KINDS exists even if atres-kids was never created.
insert into public.shops (
  name,
  title,
  slug,
  short_description,
  description,
  city,
  whatsapp,
  verified,
  status,
  max_products,
  max_images,
  show_on_home,
  allow_promotions
)
values (
  'ATRES KINDS',
  'ATRES KINDS',
  'atres-kinds',
  'Tienda principal de ATRES Colombia.',
  'Productos migrados desde el catalogo ATRES para la arquitectura multitienda.',
  'Colombia',
  '',
  true,
  'active',
  10000,
  10,
  true,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  verified = true,
  status = 'active',
  updated_at = now();

-- Reassign any null shop_id (should be none after 0005) and any leftover kids slug products.
update public.products
set shop_id = (select id from public.shops where slug = 'atres-kinds' limit 1)
where shop_id is null
   or shop_id = (select id from public.shops where slug = 'atres-kids' limit 1);

-- Keep products.shop_id required when the column exists.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'shop_id'
  ) then
    alter table public.products alter column shop_id set not null;
  end if;
end $$;
