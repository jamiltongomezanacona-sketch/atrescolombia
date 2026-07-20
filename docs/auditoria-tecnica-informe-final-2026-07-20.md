# Auditoría técnica ATRES Colombia — Informe final

**Fecha:** 2026-07-20  
**Rama de trabajo:** `chore/audit-perf-security`  
**Commit de restauración:** `b954001`  
**Base previa:** `be0a42e`

---

## 1. Estado inicial

| Métrica | Antes |
|---------|--------|
| Next.js | 16.2.10 |
| React | 19.2.4 |
| `"use client"` | 28 |
| Rutas store con `force-dynamic` | 12 |
| lint / typecheck / build | OK |
| Scripts de test | no existen |
| Loaders públicos con `React.cache()` | no |

**Causa raíz de dinamismo masivo:** `createSupabaseServerClient()` usa `cookies()`. Lo consumen `public-store`, `public-settings` y el layout `(store)` → lecturas públicas del catálogo fuerzan render dinámico.

---

## 2. Errores / hallazgos reales corregidos

### C1 — Consultas duplicadas del catálogo (crítico, bajo riesgo) — CORREGIDO
- **Archivos:** `src/lib/public-store.ts`, `src/lib/public-settings.ts`
- **Problema:** `getPublicProducts()` / categorías / shops / settings se ejecutaban varias veces por request (home ~4×, PDP ~3–4×).
- **Solución:** `React.cache()` en `getPublicProducts`, `getPublicCategories`, `getPublicShops`, `getPublicStoreSettings`.
- **Commit:** `761075b`

### A1/A2 — Auth de servidor inconsistente en actions (alto, bajo riesgo) — CORREGIDO
- **Archivo:** `src/lib/admin/actions.ts`
- **Problema:** Varias mutations confiaban en UI + RLS sin `requireAdmin` / `requireSuperAdmin` / `assertCanManageProduct`.
- **Solución:**
  - `saveProduct`, `saveProductVariants`, `createQuickProduct`, uploads/cleanup/revalidate → `requireAdmin` (+ ownership en save/variants).
  - `saveCategory`, `archiveCategory`, `saveBanner`, `savePromotion`, `saveSettings` → `requireSuperAdmin`.
- **Commit:** `7696ad7`

---

## 3. Causas raíz

1. Loaders públicos sin memoización por request → N consultas idénticas a Supabase.
2. Cliente de Supabase con cookies en rutas públicas → bloquea ISR/SSG.
3. Defensa en profundidad incompleta en server actions (RLS mitiga, app layer no).

---

## 4. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/lib/public-store.ts` | `cache()` en categories, products, shops |
| `src/lib/public-settings.ts` | `cache()` en settings |
| `src/lib/admin/actions.ts` | checks de auth en mutations |
| `docs/auditoria-tecnica-2026-07-20.md` | diagnóstico (en restore commit) |

---

## 5. Optimizaciones aplicadas

- Deduplicación de lecturas públicas dentro del mismo request (React.cache).
- Sin cambios visuales, rutas, ni lógica comercial.

## 6. Consultas consolidadas

- Por request de home/PDP/nav: catálogo completo pasa de ~3–4 cargas a **1**.
- Categorías/settings/shops: 1 carga efectiva por request cuando se piden en paralelo.

## 7. Client Components

- **Antes:** 28 `"use client"`  
- **Después:** 28 (sin conversión; no tocado en esta fase de bajo riesgo)

## 8. Caché

- Solo memoización por request (`React.cache`).
- **No** se eliminó `force-dynamic` ni se añadió ISR (requiere cliente público sin cookies → autorización).

## 9. Imágenes

- Sin cambios (fuera del alcance de correcciones de bajo riesgo).

---

## 10. Riesgos pendientes (requieren autorización)

| ID | Propuesta | Riesgo |
|----|-----------|--------|
| P1 | Cliente Supabase anon **sin cookies** para lecturas públicas | Medio — habilita ISR; hay que revalidar tras CRUD |
| P2 | Quitar `force-dynamic` de rutas públicas + `revalidate` 60–300s | Medio — depende de P1 |
| P3 | Carrito/favoritos: fetch por slug en vez de catálogo completo | Bajo–Medio |
| P4 | `primaryShopId = shopIds[0]` incompleto multi-tienda | Medio — lógica admin |
| P5 | Revisar RLS Storage en uploads | Solo documentar SQL |
| P6 | Narrow `select("*")` en admin | Bajo |

## 11. Recomendaciones que requieren autorización

1. Cliente público cookie-free + ISR/revalidate tags.  
2. Cualquier cambio de RLS o migraciones.  
3. Refactor de nav client → server.  
4. Push / merge a `main` / producción.

---

## 12. Validación

| Check | Resultado |
|-------|-----------|
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm run build` | OK (~28s total pipeline) |
| Pruebas automatizadas | N/A (no hay script) |

**Build routes (post-fix):**  
- Dinámicas (ƒ): `/`, productos, categorías, buscar, novedades, ofertas, promociones, tiendas, admin editar…  
- Estáticas (○): `/carrito`, `/favoritos`, admin listados, robots, sitemap, manifest  

(Nota: carrito/favoritos ya eran shells cliente; el layout con cookies sigue afectando otras rutas con `force-dynamic` explícito.)

---

## 13–14. Commits

| Hash | Mensaje |
|------|---------|
| `b954001` | chore: punto de restauracion antes de auditoria perf/seguridad |
| `761075b` | perf(products): dedupe public catalog queries with React.cache |
| *(auth)* | fix(auth): enforce server-side checks on admin product and catalog actions |

## 15. Comparación antes / después

| Métrica | Antes | Después |
|---------|-------|---------|
| Cargas catálogo/request (home/PDP) | ~3–4 | 1 (mismo request) |
| `"use client"` | 28 | 28 |
| Auth checks en actions críticas | incompleto | endurecido |
| force-dynamic store | 12 | 12 (sin cambio) |
| lint/build | OK | OK |

**No se hizo push.** Rama lista: `chore/audit-perf-security`.
