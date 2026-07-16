# Migrar catalogo curado a Supabase

Este proceso sube las imagenes de `public/assets/atres-curated/products` al bucket `product-images` y crea/actualiza los productos en Supabase.

## Que migra

- 74 productos curados de `src/lib/curated-atres-assets.ts`.
- 1 imagen principal por producto.
- Categoria `infantil` si no existe.
- Filas en `products`.
- Filas en `product_images`.

## Seguridad

No guardes `SUPABASE_SERVICE_ROLE_KEY` en Git, codigo ni capturas. Usala solo como variable temporal en la terminal.

## Prueba local sin tocar Supabase

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://TU-PROYECTO.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY"
npm.cmd run migrate:curated:supabase -- --dry-run
```

## Migracion real

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://TU-PROYECTO.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY"
npm.cmd run migrate:curated:supabase
```

## Resultado esperado

Al terminar, Supabase tendra:

- imagenes en `Storage > product-images > curated/infantil/...`;
- productos activos en `products`;
- imagen principal en `product_images`;
- productos visibles en la tienda desde Supabase.

El script es idempotente: si un producto ya existe con el mismo `slug`, lo actualiza y reemplaza su imagen principal curada.
