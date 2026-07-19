-- Idempotent seed for ATRES category hierarchy.
-- It only creates missing subcategories under existing parent categories.
-- It does not delete, rename or modify existing products.

do $$
declare
  child_count integer := 0;
begin
  insert into public.categories (id, parent_id, name, slug, description, status, display_order)
  select
    gen_random_uuid(),
    parent.id,
    seed.name,
    seed.slug,
    seed.description,
    'active',
    seed.display_order
  from (
    values
      ('moda-infantil', 'Moda infantil', 'vestidos-infantiles', 'Vestidos infantiles', 'Vestidos, prendas suaves y looks infantiles para ocasiones especiales.', 10),
      ('moda-infantil', 'Moda infantil', 'conjuntos-infantiles', 'Conjuntos infantiles', 'Sets coordinados para nina, nino y uso diario.', 20),
      ('moda-infantil', 'Moda infantil', 'camisetas-infantiles', 'Camisetas infantiles', 'Camisetas comodas con estampados y detalles infantiles.', 30),
      ('moda-infantil', 'Moda infantil', 'pijamas-infantiles', 'Pijamas infantiles', 'Pijamas y prendas de descanso para ninos.', 40),
      ('moda-infantil', 'Moda infantil', 'chaquetas-infantiles', 'Chaquetas infantiles', 'Chaquetas, buzos y capas para complementar looks infantiles.', 50),
      ('moda-infantil', 'Moda infantil', 'jeans-infantiles', 'Jeans infantiles', 'Denim infantil, pantalones y shorts para ninos.', 60),

      ('jeans-y-denim', 'Jeans y denim', 'jeans-skinny', 'Jeans skinny', 'Jeans ajustados y siluetas modernas en denim.', 10),
      ('jeans-y-denim', 'Jeans y denim', 'jeans-mom', 'Jeans mom', 'Jeans tiro alto y silueta relajada.', 20),
      ('jeans-y-denim', 'Jeans y denim', 'jeans-cargo', 'Jeans cargo', 'Denim con bolsillos y estilo utilitario.', 30),
      ('jeans-y-denim', 'Jeans y denim', 'jeans-rectos', 'Jeans rectos', 'Jeans clasicos de bota recta.', 40),
      ('jeans-y-denim', 'Jeans y denim', 'jeans-bota-ancha', 'Jeans bota ancha', 'Jeans amplios y siluetas wide leg.', 50),
      ('jeans-y-denim', 'Jeans y denim', 'shorts-denim', 'Shorts denim', 'Shorts, faldas y piezas cortas en denim.', 60),

      ('moda-urbana', 'Moda urbana', 'camisetas-urbanas', 'Camisetas urbanas', 'Camisetas, tops y prendas superiores urbanas.', 10),
      ('moda-urbana', 'Moda urbana', 'chaquetas-urbanas', 'Chaquetas urbanas', 'Chaquetas, busos y capas streetwear.', 20),
      ('moda-urbana', 'Moda urbana', 'pantalones-urbanos', 'Pantalones urbanos', 'Joggers, cargos y pantalones casuales.', 30),
      ('moda-urbana', 'Moda urbana', 'sets-urbanos', 'Sets urbanos', 'Conjuntos coordinados de estilo urbano.', 40),

      ('uniformes', 'Uniformes', 'uniformes-escolares', 'Uniformes escolares', 'Uniformes para colegio y uso academico.', 10),
      ('uniformes', 'Uniformes', 'uniformes-empresariales', 'Uniformes empresariales', 'Uniformes para equipos, marcas y empresas.', 20),
      ('uniformes', 'Uniformes', 'dotaciones', 'Dotaciones', 'Dotaciones textiles para trabajo y produccion.', 30),

      ('ropa-deportiva', 'Ropa deportiva', 'leggings', 'Leggings', 'Leggings, bikers y prendas elasticas.', 10),
      ('ropa-deportiva', 'Ropa deportiva', 'tops-deportivos', 'Tops deportivos', 'Tops, camisetas y prendas superiores deportivas.', 20),
      ('ropa-deportiva', 'Ropa deportiva', 'conjuntos-deportivos', 'Conjuntos deportivos', 'Sets deportivos para entrenamiento y uso diario.', 30),

      ('textiles-para-hogar', 'Textiles para hogar', 'ropa-de-cama', 'Ropa de cama', 'Sabanas, cubrecamas y textiles para dormitorio.', 10),
      ('textiles-para-hogar', 'Textiles para hogar', 'toallas', 'Toallas', 'Toallas y textiles de bano.', 20),
      ('textiles-para-hogar', 'Textiles para hogar', 'decoracion-textil', 'Decoracion textil', 'Cojines, mantas y detalles textiles para hogar.', 30),

      ('moda-elegante', 'Moda elegante', 'vestidos-elegantes', 'Vestidos elegantes', 'Vestidos y prendas para ocasiones especiales.', 10),
      ('moda-elegante', 'Moda elegante', 'blusas-elegantes', 'Blusas elegantes', 'Blusas, camisas y tops formales.', 20),
      ('moda-elegante', 'Moda elegante', 'pantalones-elegantes', 'Pantalones elegantes', 'Pantalones y conjuntos de vestir.', 30),

      ('accesorios', 'Accesorios', 'bolsos', 'Bolsos', 'Bolsos, carteras y maletas.', 10),
      ('accesorios', 'Accesorios', 'bisuteria', 'Bisuteria', 'Collares, aretes y accesorios de moda.', 20),
      ('accesorios', 'Accesorios', 'accesorios-cabello', 'Accesorios para cabello', 'Hebillas, moños y complementos para cabello.', 30)
  ) as seed(parent_slug, parent_name, slug, name, description, display_order)
  join public.categories parent
    on parent.parent_id is null
   and (
     lower(parent.slug) = seed.parent_slug
     or lower(parent.name) = lower(seed.parent_name)
     or lower(parent.slug) = replace(lower(seed.parent_name), ' ', '-')
   )
  where not exists (
    select 1
    from public.categories existing
    where lower(existing.slug) = seed.slug
  );

  get diagnostics child_count = row_count;
  raise notice 'ATRES subcategorias creadas: %', child_count;
end $$;
