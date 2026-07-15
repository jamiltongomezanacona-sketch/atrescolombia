-- ATRES admin schema adapter.
-- Safe for an existing Supabase project that already has products, categories,
-- product_images and legacy business tables. This migration does not drop data.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'content_status') then
    create type public.content_status as enum ('active', 'hidden', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'banner_position') then
    create type public.banner_position as enum ('home_hero', 'home_promo', 'category_top');
  end if;
  if not exists (select 1 from pg_type where typname = 'discount_type') then
    create type public.discount_type as enum ('percent', 'fixed_price');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.app_role not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text not null default '';
alter table public.profiles add column if not exists role public.app_role not null default 'admin';
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories add column if not exists parent_id uuid references public.categories(id) on delete restrict;
alter table public.categories add column if not exists description text not null default '';
alter table public.categories add column if not exists image_url text;
alter table public.categories add column if not exists status public.content_status not null default 'active';
alter table public.categories add column if not exists display_order integer not null default 0;
alter table public.categories add column if not exists created_by uuid references auth.users(id);
alter table public.categories add column if not exists updated_by uuid references auth.users(id);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists short_description text not null default '';
alter table public.products add column if not exists description text not null default '';
alter table public.products add column if not exists category_id uuid references public.categories(id) on delete restrict;
alter table public.products add column if not exists subcategory_id uuid references public.categories(id) on delete set null;
alter table public.products add column if not exists price integer not null default 0 check (price >= 0);
alter table public.products add column if not exists previous_price integer check (previous_price is null or previous_price >= 0);
alter table public.products add column if not exists discount_percent integer check (discount_percent is null or discount_percent between 0 and 100);
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists inventory_total integer not null default 0 check (inventory_total >= 0);
alter table public.products add column if not exists status public.content_status not null default 'hidden';
alter table public.products add column if not exists is_featured boolean not null default false;
alter table public.products add column if not exists is_new boolean not null default false;
alter table public.products add column if not exists is_promo boolean not null default false;
alter table public.products add column if not exists tags text[] not null default '{}';
alter table public.products add column if not exists collection text not null default '';
alter table public.products add column if not exists display_order integer not null default 0;
alter table public.products add column if not exists created_by uuid references auth.users(id);
alter table public.products add column if not exists updated_by uuid references auth.users(id);

update public.products
set sku = coalesce(nullif(sku, ''), 'ATRES-' || substr(id::text, 1, 8))
where sku is null or sku = '';

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.product_images add column if not exists product_id uuid references public.products(id) on delete cascade;
alter table public.product_images add column if not exists storage_path text;
alter table public.product_images add column if not exists public_url text;
alter table public.product_images add column if not exists alt text not null default '';
alter table public.product_images add column if not exists aspect_ratio text not null default '3:4';
alter table public.product_images add column if not exists display_order integer not null default 0;
alter table public.product_images add column if not exists is_primary boolean not null default false;
alter table public.product_images add column if not exists created_by uuid references auth.users(id);

update public.product_images
set storage_path = coalesce(storage_path, public_url, id::text)
where storage_path is null;

update public.product_images
set public_url = coalesce(public_url, '')
where public_url is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_category_id_fkey'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'category_id'
      and udt_name = 'uuid'
  ) then
    alter table public.products
      add constraint products_category_id_fkey
      foreign key (category_id) references public.categories(id) on delete restrict not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'products_subcategory_id_fkey'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'subcategory_id'
      and udt_name = 'uuid'
  ) then
    alter table public.products
      add constraint products_subcategory_id_fkey
      foreign key (subcategory_id) references public.categories(id) on delete set null not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'product_images_product_id_fkey'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'product_images'
      and column_name = 'product_id'
      and udt_name = 'uuid'
  ) then
    alter table public.product_images
      add constraint product_images_product_id_fkey
      foreign key (product_id) references public.products(id) on delete cascade not valid;
  end if;
end $$;

create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null,
  size text not null,
  color text not null,
  inventory integer not null default 0 check (inventory >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  button_text text not null default '',
  link_url text not null default '/',
  desktop_image_url text,
  mobile_image_url text,
  start_at timestamptz,
  end_at timestamptz,
  status public.content_status not null default 'hidden',
  position public.banner_position not null default 'home_hero',
  display_order integer not null default 0,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text not null default '',
  discount_type public.discount_type not null default 'percent',
  discount_value integer not null default 0 check (discount_value >= 0),
  start_at timestamptz,
  end_at timestamptz,
  status public.content_status not null default 'hidden',
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promotion_products (
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  primary key (promotion_id, product_id)
);

create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'ATRES',
  logo_url text,
  favicon_url text,
  hero_banner_url text,
  whatsapp text not null default '',
  email text not null default '',
  instagram text not null default '',
  tiktok text not null default '',
  address text not null default '',
  shipping_text text not null default '',
  policies text not null default '',
  promo_message text not null default '',
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1)
on conflict (id) do nothing;

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
    and role = 'admin'
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_touch_updated_at on public.categories;
create trigger categories_touch_updated_at before update on public.categories
  for each row execute function public.touch_updated_at();

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists product_variants_touch_updated_at on public.product_variants;
create trigger product_variants_touch_updated_at before update on public.product_variants
  for each row execute function public.touch_updated_at();

drop trigger if exists banners_touch_updated_at on public.banners;
create trigger banners_touch_updated_at before update on public.banners
  for each row execute function public.touch_updated_at();

drop trigger if exists promotions_touch_updated_at on public.promotions;
create trigger promotions_touch_updated_at before update on public.promotions
  for each row execute function public.touch_updated_at();

create index if not exists categories_status_order_idx on public.categories(status, display_order);
create index if not exists products_status_order_idx on public.products(status, display_order);
create index if not exists products_category_idx on public.products(category_id, status);
create index if not exists products_flags_idx on public.products(is_featured, is_new, is_promo);
create index if not exists product_images_product_order_idx on public.product_images(product_id, display_order);
create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists inventory_product_idx on public.inventory(product_id);
create index if not exists banners_active_idx on public.banners(status, position, display_order);
create index if not exists promotions_active_idx on public.promotions(status, start_at, end_at);

do $$
begin
  if not exists (
    select slug from public.categories where slug is not null group by slug having count(*) > 1
  ) then
    create unique index if not exists categories_slug_unique_idx on public.categories(slug);
  end if;

  if not exists (
    select slug from public.products where slug is not null group by slug having count(*) > 1
  ) then
    create unique index if not exists products_slug_unique_idx on public.products(slug);
  end if;

  if not exists (
    select sku from public.products where sku is not null group by sku having count(*) > 1
  ) then
    create unique index if not exists products_sku_unique_idx on public.products(sku);
  end if;

  if not exists (
    select slug from public.promotions where slug is not null group by slug having count(*) > 1
  ) then
    create unique index if not exists promotions_slug_unique_idx on public.promotions(slug);
  end if;
end $$;

do $$
begin
  if not exists (
    select product_id
    from public.product_images
    where is_primary
    group by product_id
    having count(*) > 1
  ) then
    create unique index if not exists product_images_one_primary_idx
      on public.product_images(product_id)
      where is_primary;
  end if;
end $$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.banners enable row level security;
alter table public.promotions enable row level security;
alter table public.promotion_products enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "admin read profiles" on public.profiles;
drop policy if exists "admin manage profiles" on public.profiles;
drop policy if exists "public read active categories" on public.categories;
drop policy if exists "admin manage categories" on public.categories;
drop policy if exists "public read active products" on public.products;
drop policy if exists "admin manage products" on public.products;
drop policy if exists "public read active product images" on public.product_images;
drop policy if exists "admin manage product images" on public.product_images;
drop policy if exists "public read active product categories" on public.product_categories;
drop policy if exists "admin manage product categories" on public.product_categories;
drop policy if exists "public read active variants" on public.product_variants;
drop policy if exists "admin manage variants" on public.product_variants;
drop policy if exists "admin manage inventory" on public.inventory;
drop policy if exists "public read active banners" on public.banners;
drop policy if exists "admin manage banners" on public.banners;
drop policy if exists "public read active promotions" on public.promotions;
drop policy if exists "admin manage promotions" on public.promotions;
drop policy if exists "public read promotion products" on public.promotion_products;
drop policy if exists "admin manage promotion products" on public.promotion_products;
drop policy if exists "public read settings" on public.store_settings;
drop policy if exists "admin manage settings" on public.store_settings;

create policy "admin read profiles" on public.profiles for select to authenticated using (public.is_admin());
create policy "admin manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read active categories" on public.categories for select to anon, authenticated using (status = 'active');
create policy "admin manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read active products" on public.products for select to anon, authenticated using (status = 'active');
create policy "admin manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read active product images" on public.product_images for select to anon, authenticated using (
  exists (select 1 from public.products where products.id = product_images.product_id and products.status = 'active')
);
create policy "admin manage product images" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read active product categories" on public.product_categories for select to anon, authenticated using (
  exists (select 1 from public.products where id = product_id and status = 'active')
);
create policy "admin manage product categories" on public.product_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read active variants" on public.product_variants for select to anon, authenticated using (
  exists (select 1 from public.products where id = product_id and status = 'active')
);
create policy "admin manage variants" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manage inventory" on public.inventory for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read active banners" on public.banners for select to anon, authenticated using (
  status = 'active' and (start_at is null or start_at <= now()) and (end_at is null or end_at >= now())
);
create policy "admin manage banners" on public.banners for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read active promotions" on public.promotions for select to anon, authenticated using (
  status = 'active' and (start_at is null or start_at <= now()) and (end_at is null or end_at >= now())
);
create policy "admin manage promotions" on public.promotions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read promotion products" on public.promotion_products for select to anon, authenticated using (
  exists (select 1 from public.promotions where id = promotion_id and status = 'active')
);
create policy "admin manage promotion products" on public.promotion_products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read settings" on public.store_settings for select to anon, authenticated using (true);
create policy "admin manage settings" on public.store_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read product images bucket" on storage.objects;
drop policy if exists "admin upload product images bucket" on storage.objects;
drop policy if exists "admin update product images bucket" on storage.objects;
drop policy if exists "admin delete product images bucket" on storage.objects;

create policy "public read product images bucket" on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.product_images
    join public.products on products.id = product_images.product_id
    where product_images.storage_path = storage.objects.name
    and products.status = 'active'
  )
);

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
