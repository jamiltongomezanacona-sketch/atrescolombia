alter table public.product_variants
  add column if not exists price integer;

alter table public.product_variants
  add column if not exists status text not null default 'available';

alter table public.product_variants
  drop constraint if exists product_variants_price_check;

alter table public.product_variants
  add constraint product_variants_price_check
  check (price is null or price >= 0);

alter table public.product_variants
  drop constraint if exists product_variants_status_check;

alter table public.product_variants
  add constraint product_variants_status_check
  check (status in ('available', 'sold_out', 'hidden', 'coming_soon'));

create index if not exists product_variants_product_status_idx
  on public.product_variants(product_id, status);

create index if not exists product_variants_product_color_size_idx
  on public.product_variants(product_id, color, size);

drop policy if exists "public read active variants" on public.product_variants;

create policy "public read active variants" on public.product_variants
for select to anon, authenticated
using (
  status in ('available', 'sold_out', 'coming_soon')
  and exists (
    select 1
    from public.products p
    where p.id = product_id
      and p.status = 'active'
  )
);
