# Auditoría técnica ATRES Colombia — Diagnóstico inicial

**Fecha:** 2026-07-20  
**Commit base:** `be0a42e`  
**Rama:** `main`  
**Validación:** lint OK · typecheck OK · build OK (~40s)

---

## 1. Estado inicial

| Métrica | Valor |
|---------|--------|
| Next.js | 16.2.10 |
| React | 19.2.4 |
| `"use client"` | 28 archivos |
| `force-dynamic` en store | ~12 rutas |
| `cookies()` | solo `src/lib/supabase/server.ts` |
| Scripts test | no existen |
| Dependencias runtime | next, react, supabase (mínimas) |

---

## 2. Clasificación de renderizado (resumen)

| Ruta | Actual | Recomendado | Motivo |
|------|--------|-------------|--------|
| `/` | force-dynamic + cookies vía layout | ISR 60–300s + cliente público sin cookies | Catálogo público |
| `/productos` | force-dynamic + searchParams | Dinámico (filtros) | Correcto |
| `/productos/[slug]` | force-dynamic (+ generateStaticParams inútil) | ISR por slug | Precios/stock |
| `/carrito`, `/favoritos` | Dinámico por layout cookies | Shell estático + cliente (localStorage) | Cookies innecesarias |
| `/buscar` | Dinámico | Dinámico | searchParams |
| `/tiendas` | force-dynamic | ISR | Lista pública |
| `/admin/*` | Dinámico (auth) | Dinámico | Correcto |
| sitemap | Dinámico (cookies) | Estático/ISR sin cookies | Público |

**Causa raíz de dinamismo masivo:**  
`createSupabaseServerClient()` llama `cookies()`. Lo usan `public-store`, `public-settings` y el layout `(store)` → **todas** las rutas de tienda se vuelven dinámicas, aunque el catálogo sea público (RLS anon).

---

## 3. Hallazgos por prioridad

### CRÍTICO

| ID | Archivo | Problema | Impacto | Solución | Esfuerzo |
|----|---------|----------|---------|----------|----------|
| C1 | `public-store.ts` + home/PDP | `getPublicProducts()` sin `React.cache()` → home ~4×, PDP ~3–4× catálogo completo | Latencia, costo Supabase | Envolver loaders públicos en `cache()` | Bajo |
| C2 | `carrito`/`favoritos` pages | Descargan catálogo entero para filtrar localStorage | Latencia | cache() mitiga; ideal filtrar por slug (fase media) | Bajo→Medio |

### ALTO

| ID | Archivo | Problema | Impacto | Solución | Esfuerzo |
|----|---------|----------|---------|----------|----------|
| A1 | `actions.ts` saveProduct, variants, images | Sin `assertCanManageProduct` / `requireAdmin` | Defensa en profundidad; RLS mitiga | Añadir checks de servidor | Bajo |
| A2 | `actions.ts` category/banner/promo/settings | Sin `requireSuperAdmin` | Shop admin podría invocar action (RLS debería bloquear) | `requireSuperAdmin()` | Bajo |
| A3 | `server.ts` + public-* | Cliente con cookies para lecturas públicas | Impide ISR/caché | Cliente anon sin cookies (propuesta; aplicar con cuidado) | Medio |

### MEDIO

| ID | Problema | Notas |
|----|----------|-------|
| M1 | `force-dynamic` + `generateStaticParams` contradictorios | Quitar force-dynamic tras A3 |
| M2 | `primaryShopId = shopIds[0]` | Multi-tienda admin incompleto |
| M3 | Admin `select("*")` | Más payload; no bug |
| M4 | header-nav/quick-filters/bottom-nav client solo por pathname | Refactor opcional |

### BAJO

| ID | Problema |
|----|----------|
| B1 | Dependencias mínimas; sin libs pesadas |
| B2 | PWA/manifest/robots OK |
| B3 | Service role solo servidor (correcto) |

---

## 4. Separación

**Errores reales:** C1, C2 (perf), A1–A2 (auth app inconsistente).  
**Riesgos:** A3/M1 si se cambia caché sin revalidate.  
**Opcional:** M2–M4, conversión client→server de nav.

---

## 5. Plan de corrección inmediata (bajo riesgo)

1. Rama `chore/audit-perf-security` + commit de restauración.  
2. `React.cache()` en loaders públicos.  
3. Auth server en actions faltantes.  
4. **No** tocar RLS, migraciones, UI, push.  
5. Cliente público sin cookies + ISR → **requiere autorización** (propuesta aparte).
