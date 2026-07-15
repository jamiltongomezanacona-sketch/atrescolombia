# ATRES - Arquitectura Frontend V1

## Enfoque

ATRES funciona como una tienda oficial de moda con una sola marca, un solo catalogo y experiencia comercial de alta densidad.

## Stack

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- Server Components para paginas publicas.
- Client Components solo para interacciones locales: favoritos, carrito y acciones de producto.

## Rutas

- `/`
- `/productos`
- `/productos/[slug]`
- `/categorias/[slug]`
- `/buscar`
- `/promociones`
- `/novedades`
- `/favoritos`
- `/carrito`

## Datos locales

La fase actual usa datos demo locales en `src/lib/store-data.ts`.

## Interacciones demo

- Favoritos: `localStorage`.
- Carrito: `localStorage`.
- Compra: flujo demo hacia `/carrito`.

## Siguiente fase

## Panel administrativo

Rutas privadas:

- `/admin`
- `/admin/login`
- `/admin/productos`
- `/admin/productos/nuevo`
- `/admin/productos/[id]/editar`
- `/admin/categorias`
- `/admin/banners`
- `/admin/promociones`
- `/admin/configuracion`

Supabase:

- Migracion: `supabase/migrations/0001_atres_admin_schema.sql`.
- Bucket: `product-images`.
- Auth: correo y contrasena.
- RLS: lectura publica solo para contenido activo; escritura solo para administrador autenticado.
- Proyecto existente: la migracion es adaptativa y no elimina tablas heredadas como `businesses` o `business_members`.

Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Primer administrador:

1. Crear el usuario en Supabase Auth.
2. Insertar o actualizar `public.profiles` con el `id` del usuario y `role = 'admin'`.
3. Iniciar sesion en `/admin/login`.

La tienda publica consume Supabase cuando las variables existen y usa datos locales como fallback de desarrollo.

Las tablas heredadas del modelo anterior no forman parte de la experiencia publica ni del panel administrativo actual. Se conservan para evitar perdida de datos mientras ATRES se consolida como tienda oficial unica.
