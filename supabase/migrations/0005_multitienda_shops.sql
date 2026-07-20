-- ATRES multitienda foundation.
-- Idempotent and compatible with the current single-store admin.
-- Existing admins remain valid as superadmins through public.is_superadmin().

create extension if not exists "pgcrypto";

do $$
begin
  if exists (select 1 from pg_type where typname = 'app_role') then
    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'app_role' and e.enumlabel = 'superadmin'
    ) then
      alter type public.app_role add value 'superadmin';
    end if;

    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'app_role' and e.enumlabel = 'shop_admin'
    ) then
      alter type public.app_role add value 'shop_admin';
    end if;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'shop_status') then
    create type public.shop_status as enum ('active', 'suspended', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'shop_member_role') then
    create type public.shop_member_role as enum ('superadmin', 'shop_admin');
  end if;
end $$;

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null default '',
  slug text not null,
  short_description text not null default '',
  description text not null default '',
  city text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  logo_url text,
  cover_url text,
  verified boolean not null default false,
  status public.shop_status not null default 'active',
  max_products integer not null default 200 check (max_products >= 0),
  max_images integer not null default 10 check (max_images >= 1),
  show_on_home boolean not null default true,
  allow_promotions boolean not null default false,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shops add column if not exists title text not null default '';
alter table public.shops add column if not exists short_description text not null default '';
alter table public.shops add column if not exists description text not null default '';
alter table public.shops add column if not exists city text not null default '';
alter table public.shops add column if not exists whatsapp text not null default '';
alter table public.shops add column if not exists email text not null default '';
alter table public.shops add column if not exists logo_url text;
alter table public.shops add column if not exists cover_url text;
alter table public.shops add column if not exists verified boolean not null default false;
alter table public.shops add column if not exists status public.shop_status not null default 'active';
alter table public.shops add column if not exists max_products integer not null default 200 check (max_products >= 0);
alter table public.shops add column if not exists max_images integer not null default 10 check (max_images >= 1);
alter table public.shops add column if not exists show_on_home boolean not null default true;
alter table public.shops add column if not exists allow_promotions boolean not null default false;
alter table public.shops add column if not exists created_by uuid references auth.users(id);
alter table public.shops add column if not exists updated_by uuid references auth.users(id);
alter table public.shops add column if not exists created_at timestamptz not null default now();
alter table public.shops add column if not exists updated_at timestamptz not null default now();

create table if not exists public.shop_members (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.shop_member_role not null default 'shop_admin',
  status public.content_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (shop_id, user_id)
);

alter table public.shop_members add column if not exists status public.content_status not null default 'active';
alter table public.shop_members add column if not exists created_at timestamptz not null default now();

create unique index if not exists shops_slug_unique_idx on public.shops(slug);
create index if not exists shops_status_order_idx on public.shops(status, created_at desc);
create index if not exists shop_members_user_idx on public.shop_members(user_id, status);
create index if not exists shop_members_shop_idx on public.shop_members(shop_id, status);

drop trigger if exists shops_touch_updated_at on public.shops;
create trigger shops_touch_updated_at before update on public.shops
  for each row execute function public.touch_updated_at();

alter table public.products add column if not exists shop_id uuid references public.shops(id) on delete restrict;
create index if not exists products_shop_status_order_idx on public.products(shop_id, status, display_order);

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
  'Productos actuales migrados desde el catalogo ATRES para iniciar la arquitectura multitienda.',
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
  verified = true,
  status = 'active',
  updated_at = now();

update public.products
set shop_id = (select id from public.shops where slug = 'atres-kinds' limit 1)
where shop_id is null;

alter table public.products alter column shop_id set not null;

create or replace function public.is_superadmin()
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

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_superadmin();
$$;

create or replace function public.is_shop_admin(target_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.shop_members
    join public.shops on shops.id = shop_members.shop_id
    where shop_members.user_id = auth.uid()
      and shop_members.shop_id = target_shop_id
      and shop_members.role = 'shop_admin'
      and shop_members.status = 'active'
      and shops.status = 'active'
  );
$$;

create or replace function public.can_manage_shop(target_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_superadmin() or public.is_shop_admin(target_shop_id);
$$;

create or replace function public.uuid_or_null(value text)
returns uuid
language plpgsql
immutable
as $$
begin
  if value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return value::uuid;
  end if;
  return null;
end;
$$;

alter table public.shops enable row level security;
alter table public.shop_members enable row level security;

drop policy if exists "public read active shops" on public.shops;
drop policy if exists "superadmin manage shops" on public.shops;
drop policy if exists "shop admin read own shop" on public.shops;
drop policy if exists "shop admin update own shop" on public.shops;
drop policy if exists "superadmin manage shop members" on public.shop_members;
drop policy if exists "shop admin read own membership" on public.shop_members;

create policy "public read active shops" on public.shops
for select to anon, authenticated
using (status = 'active' and show_on_home = true);

create policy "superadmin manage shops" on public.shops
for all to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

create policy "shop admin read own shop" on public.shops
for select to authenticated
using (public.is_shop_admin(id));

create policy "shop admin update own shop" on public.shops
for update to authenticated
using (public.is_shop_admin(id))
with check (public.is_shop_admin(id));

create policy "superadmin manage shop members" on public.shop_members
for all to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

create policy "shop admin read own membership" on public.shop_members
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "admin manage products" on public.products;
drop policy if exists "admin manage product images" on public.product_images;
drop policy if exists "admin manage product categories" on public.product_categories;
drop policy if exists "admin manage variants" on public.product_variants;
drop policy if exists "admin manage inventory" on public.inventory;
drop policy if exists "admin upload product images bucket" on storage.objects;
drop policy if exists "admin update product images bucket" on storage.objects;
drop policy if exists "admin delete product images bucket" on storage.objects;

create policy "admin manage products" on public.products
for all to authenticated
using (public.can_manage_shop(shop_id))
with check (public.can_manage_shop(shop_id));

create policy "admin manage product images" on public.product_images
for all to authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and public.can_manage_shop(products.shop_id)
  )
)
with check (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and public.can_manage_shop(products.shop_id)
  )
);

create policy "admin manage product categories" on public.product_categories
for all to authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_categories.product_id
      and public.can_manage_shop(products.shop_id)
  )
)
with check (
  exists (
    select 1 from public.products
    where products.id = product_categories.product_id
      and public.can_manage_shop(products.shop_id)
  )
);

create policy "admin manage variants" on public.product_variants
for all to authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_variants.product_id
      and public.can_manage_shop(products.shop_id)
  )
)
with check (
  exists (
    select 1 from public.products
    where products.id = product_variants.product_id
      and public.can_manage_shop(products.shop_id)
  )
);

create policy "admin manage inventory" on public.inventory
for all to authenticated
using (
  exists (
    select 1 from public.products
    where products.id = inventory.product_id
      and public.can_manage_shop(products.shop_id)
  )
)
with check (
  exists (
    select 1 from public.products
    where products.id = inventory.product_id
      and public.can_manage_shop(products.shop_id)
  )
);

create policy "admin upload product images bucket" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'product-images'
  and (
    public.is_superadmin()
    or (
      (storage.foldername(name))[1] = 'products'
      and public.can_manage_shop(public.uuid_or_null((storage.foldername(name))[2]))
    )
  )
);

create policy "admin update product images bucket" on storage.objects
for update to authenticated
using (
  bucket_id = 'product-images'
  and (
    public.is_superadmin()
    or (
      (storage.foldername(name))[1] = 'products'
      and public.can_manage_shop(public.uuid_or_null((storage.foldername(name))[2]))
    )
  )
)
with check (
  bucket_id = 'product-images'
  and (
    public.is_superadmin()
    or (
      (storage.foldername(name))[1] = 'products'
      and public.can_manage_shop(public.uuid_or_null((storage.foldername(name))[2]))
    )
  )
);

create policy "admin delete product images bucket" on storage.objects
for delete to authenticated
using (
  bucket_id = 'product-images'
  and (
    public.is_superadmin()
    or (
      (storage.foldername(name))[1] = 'products'
      and public.can_manage_shop(public.uuid_or_null((storage.foldername(name))[2]))
    )
  )
);
