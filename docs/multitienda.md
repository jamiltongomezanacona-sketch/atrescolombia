# Multitienda ATRES — migraciones

Orden recomendado en el SQL Editor de Supabase (o CLI):

1. `0001_atres_admin_schema.sql` (si el proyecto es nuevo)
2. `0002_limit_product_image_upload_size.sql`
3. `0003_product_variants_admin.sql`
4. `0004_seed_category_subcategories.sql`
5. `0005_multitienda_shops.sql` — crea `shops`, `shop_members`, `products.shop_id`, RLS
6. `0006_atres_kinds_rename.sql` — renombra la tienda por defecto a **ATRES KINDS** (`atres-kinds`)

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # solo servidor; obligatorio para crear admins de tienda
```

## Roles

| Rol app | Valores en DB |
|---------|----------------|
| SUPER_ADMIN | `profiles.role` = `admin` o `superadmin` |
| SHOP_ADMIN | membresia activa en `shop_members` con `role = shop_admin` |

## Notas

- No ejecutes el rollback `supabase/rollback/0005_multitienda_shops_rollback.sql` en produccion (borra `shop_id`).
- Las imagenes nuevas usan `products/{shopId}/{productId}/...`; las existentes conservan su path.
- El catalogo publico sigue mostrando productos activos de todas las tiendas activas (sin cambios visuales).
