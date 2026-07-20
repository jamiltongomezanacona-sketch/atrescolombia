-- Rollback for 0005_multitienda_shops.sql.
-- Use only if you need to return to the single-store ATRES model.
-- This does not delete product rows or images.

drop policy if exists "public read active shops" on public.shops;
drop policy if exists "superadmin manage shops" on public.shops;
drop policy if exists "shop admin read own shop" on public.shops;
drop policy if exists "shop admin update own shop" on public.shops;
drop policy if exists "superadmin manage shop members" on public.shop_members;
drop policy if exists "shop admin read own membership" on public.shop_members;

drop policy if exists "admin manage products" on public.products;
drop policy if exists "admin manage product images" on public.product_images;
drop policy if exists "admin manage product categories" on public.product_categories;
drop policy if exists "admin manage variants" on public.product_variants;
drop policy if exists "admin manage inventory" on public.inventory;
drop policy if exists "admin upload product images bucket" on storage.objects;
drop policy if exists "admin update product images bucket" on storage.objects;
drop policy if exists "admin delete product images bucket" on storage.objects;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role::text in ('admin', 'superadmin')
  );
$$;

create policy "admin manage products" on public.products
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin manage product images" on public.product_images
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin manage product categories" on public.product_categories
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin manage variants" on public.product_variants
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin manage inventory" on public.inventory
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin upload product images bucket" on storage.objects
for insert to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

create policy "admin update product images bucket" on storage.objects
for update to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

create policy "admin delete product images bucket" on storage.objects
for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());

alter table public.products alter column shop_id drop not null;
alter table public.products drop column if exists shop_id;

drop trigger if exists shops_touch_updated_at on public.shops;
drop function if exists public.can_manage_shop(uuid);
drop function if exists public.is_shop_admin(uuid);
drop function if exists public.is_superadmin();
drop function if exists public.uuid_or_null(text);

drop table if exists public.shop_members;
drop table if exists public.shops;

drop type if exists public.shop_member_role;
drop type if exists public.shop_status;
