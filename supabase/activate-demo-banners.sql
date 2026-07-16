do $$
declare
  demo record;
  existing_id uuid;
begin
  for demo in
    select *
    from (
      values
        (
          'Nueva coleccion infantil',
          'Prendas seleccionadas para estrenar cada semana.',
          'Comprar ahora',
          '/categoria/infantil',
          '/assets/atres-curated/banners/banner-campana_atres-001.webp',
          '/assets/atres-curated/banners/banner-campana_atres-001.webp',
          'home_hero'::public.banner_position,
          'active'::public.content_status,
          1
        ),
        (
          'Ofertas activas ATRES',
          'Precios directos y prendas disponibles para entrega.',
          'Ver ofertas',
          '/ofertas',
          '/assets/atres-curated/banners/banner-campana_atres-002.webp',
          '/assets/atres-curated/banners/banner-campana_atres-002.webp',
          'home_promo'::public.banner_position,
          'active'::public.content_status,
          2
        ),
        (
          'Denim en tendencia',
          'Looks faciles de combinar para todos los dias.',
          'Explorar productos',
          '/productos',
          '/assets/atres-curated/banners/banner-campana_atres-007.webp',
          '/assets/atres-curated/banners/banner-campana_atres-007.webp',
          'home_promo'::public.banner_position,
          'active'::public.content_status,
          3
        )
    ) as banners(
      title,
      subtitle,
      button_text,
      link_url,
      desktop_image_url,
      mobile_image_url,
      position,
      status,
      display_order
    )
  loop
    select id
      into existing_id
      from public.banners
      where desktop_image_url = demo.desktop_image_url
         or title = demo.title
      order by created_at asc
      limit 1;

    if existing_id is null then
      insert into public.banners (
        title,
        subtitle,
        button_text,
        link_url,
        desktop_image_url,
        mobile_image_url,
        position,
        status,
        display_order
      )
      values (
        demo.title,
        demo.subtitle,
        demo.button_text,
        demo.link_url,
        demo.desktop_image_url,
        demo.mobile_image_url,
        demo.position,
        demo.status,
        demo.display_order
      );
    else
      update public.banners
      set
        title = demo.title,
        subtitle = demo.subtitle,
        button_text = demo.button_text,
        link_url = demo.link_url,
        desktop_image_url = demo.desktop_image_url,
        mobile_image_url = demo.mobile_image_url,
        position = demo.position,
        status = demo.status,
        display_order = demo.display_order,
        updated_at = now()
      where id = existing_id;
    end if;
  end loop;
end $$;
