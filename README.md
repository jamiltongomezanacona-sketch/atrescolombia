# ATRES

Tienda oficial de moda ATRES construida con Next.js, TypeScript y Tailwind CSS.

## Estado actual

La aplicacion funciona como una sola tienda de moda:

- Home comercial mobile-first.
- Catalogo completo.
- Categorias visuales.
- Busqueda.
- Promociones.
- Novedades.
- Favoritos demo con `localStorage`.
- Carrito demo con `localStorage`.
- Detalle de producto con tallas, colores, cantidad y acciones de compra demo.

## Comandos

```bash
npm run dev
npm run build
npm run lint
```

## Rutas principales

- `/`
- `/productos`
- `/productos/vestido-lino-brisa`
- `/categorias/mujer`
- `/buscar?q=jean`
- `/promociones`
- `/novedades`
- `/favoritos`
- `/carrito`

## Datos

Los productos y categorias demo viven en `src/lib/store-data.ts`.

La autenticacion del panel admin queda preparada con Supabase Auth. No hay pagos reales en esta fase.

## Panel administrativo

Rutas:

- `/admin/login`
- `/admin`
- `/admin/productos`
- `/admin/productos/nuevo`
- `/admin/categorias`
- `/admin/banners`
- `/admin/promociones`
- `/admin/configuracion`

Para habilitar Supabase:

1. Copia `.env.example` a `.env.local`.
2. Define `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Ejecuta `supabase/migrations/0001_atres_admin_schema.sql` en Supabase.
4. Crea el usuario admin en Supabase Auth.
5. Inserta ese usuario en `public.profiles` con `role = 'admin'`.

La migracion esta preparada para un proyecto Supabase existente. Si ya hay tablas anteriores como `businesses` o `business_members`, no las borra ni las modifica: quedan como legado del modelo anterior y la tienda oficial ATRES trabaja sobre `products`, `categories`, `product_images`, `banners`, `promotions` y `store_settings`. No uses reset de base de datos para esta fase.

La tienda publica usa Supabase cuando esta configurado y mantiene fallback local para desarrollo.
