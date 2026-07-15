# Modelo de Datos Objetivo ATRES

Esta fase usa datos locales. Este documento describe un modelo futuro para una tienda unica.

La base Supabase actual puede contener tablas heredadas del enfoque anterior, por ejemplo `businesses`, `business_members`, `cities` o `favorites`. Esas tablas no se eliminan en la migracion V1. ATRES tienda oficial usa como nucleo `products`, `categories`, `product_images`, `banners`, `promotions` y `store_settings`.

## Entidades

- `profiles`
- `products`
- `product_images`
- `categories`
- `product_categories`
- `product_variants`
- `inventory`
- `collections`
- `promotions`
- `promotion_products`
- `banners`
- `store_settings`
- `users`
- `favorites`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`

## Indices sugeridos

- `products(slug)`
- `products(category_id, status)`
- `products(is_new, status)`
- `products(is_promo, status)`
- `orders(user_id, created_at)`
- `cart_items(cart_id)`

## Seguridad

RLS debe permitir lectura publica de productos, categorias, banners y promociones activos. Las operaciones de escritura quedan restringidas al administrador autenticado definido en `profiles.role = 'admin'`.
