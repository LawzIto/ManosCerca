-- =============================================================================
-- Notificaciones dentro de la app.
-- Solo las crean triggers de la BD (security definer); el usuario puede leer,
-- marcar como leídas y borrar las suyas. Llegan en tiempo real vía Realtime.
-- =============================================================================

create type public.notification_type as enum (
  'solicitud_cercana',     -- profesional: nueva solicitud en su zona
  'cotizacion_nueva',      -- cliente: le cotizaron
  'cotizacion_aceptada',   -- profesional: eligieron su cotización
  'cotizacion_rechazada',  -- profesional: eligieron a otro o se canceló
  'servicio_iniciado',     -- cliente
  'servicio_completado',   -- cliente
  'servicio_cancelado',    -- profesional asignado
  'resena_recibida'        -- ambos
);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       public.notification_type not null,
  title      text not null,
  body       text,
  link       text check (link like '/%'),
  request_id uuid references public.service_requests (id) on delete cascade,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

alter table public.notifications enable row level security;
revoke all on public.notifications from anon;
revoke insert, update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy "notifications: el usuario ve las suyas"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

create policy "notifications: el usuario marca las suyas como leídas"
  on public.notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications: el usuario borra las suyas"
  on public.notifications for delete to authenticated
  using (user_id = auth.uid());

alter publication supabase_realtime add table public.notifications;

-- -----------------------------------------------------------------------------
-- Utilidades internas (no expuestas por la API)
-- -----------------------------------------------------------------------------

-- "$ 85.000" (COP sin decimales, separador de miles con punto)
create or replace function public.format_cop(p_amount numeric)
returns text
language sql
immutable
set search_path = ''
as $$
  select '$ ' || replace(to_char(round(p_amount), 'FM999,999,999,990'), ',', '.');
$$;

-- -----------------------------------------------------------------------------
-- 1. Nueva solicitud -> profesionales cuya zona la cubre y con la especialidad
--    (si no eligieron especialidades, reciben todas). Las solicitudes sin
--    ubicación no notifican: no hay forma de saber quién está cerca.
-- -----------------------------------------------------------------------------
create or replace function public.notify_new_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_category text;
begin
  if new.latitude is null or new.longitude is null then
    return new;
  end if;

  select name into v_category from public.categories where id = new.category_id;

  insert into public.notifications (user_id, type, title, body, link, request_id)
  select
    a.professional_id,
    'solicitud_cercana',
    'Nueva solicitud cerca: ' || v_category,
    new.title || ' · a ' || replace(to_char(d.km, 'FM990.0'), '.', ',') || ' km',
    '/trabajos/' || new.id,
    new.id
  from public.work_areas a
  join public.profiles p on p.id = a.professional_id and p.role = 'professional'
  cross join lateral (
    select public.distance_between_km(a.latitude, a.longitude, new.latitude, new.longitude) as km
  ) d
  where a.professional_id <> new.client_id
    and d.km <= a.radius_km
    and (
      not exists (select 1 from public.professional_categories pc where pc.professional_id = a.professional_id)
      or exists (
        select 1 from public.professional_categories pc
        where pc.professional_id = a.professional_id and pc.category_id = new.category_id
      )
    )
  order by d.km
  limit 200;

  return new;
end;
$$;

create trigger service_requests_notify_new
  after insert on public.service_requests
  for each row execute function public.notify_new_request();

-- -----------------------------------------------------------------------------
-- 2. Cotización nueva (o reactivada tras retirarla) -> cliente
-- -----------------------------------------------------------------------------
create or replace function public.notify_new_proposal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.service_requests;
  v_professional text;
begin
  if tg_op = 'UPDATE' and not (old.status = 'retirada' and new.status = 'pendiente') then
    return new;
  end if;

  select * into v_request from public.service_requests where id = new.request_id;
  select coalesce(nullif(full_name, ''), 'Un profesional') into v_professional
  from public.profiles where id = new.professional_id;

  insert into public.notifications (user_id, type, title, body, link, request_id)
  values (
    v_request.client_id,
    'cotizacion_nueva',
    'Nueva cotización: ' || public.format_cop(new.price),
    v_professional || ' cotizó «' || v_request.title || '»',
    '/solicitudes/' || v_request.id,
    v_request.id
  );

  return new;
end;
$$;

create trigger proposals_notify_new
  after insert or update of status on public.proposals
  for each row execute function public.notify_new_proposal();

-- -----------------------------------------------------------------------------
-- 3. Cambios de estado de la solicitud -> la contraparte
--    (las transiciones las valida update_request_status / accept_proposal)
-- -----------------------------------------------------------------------------
create or replace function public.notify_request_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text := '«' || new.title || '»';
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'aceptado' then
    insert into public.notifications (user_id, type, title, body, link, request_id)
    values (new.professional_id, 'cotizacion_aceptada', '¡Aceptaron tu cotización!',
            v_title || '. Coordina con el cliente.', '/trabajos/' || new.id, new.id);

    -- accept_proposal ya marcó como rechazadas las demás cotizaciones.
    insert into public.notifications (user_id, type, title, body, link, request_id)
    select professional_id, 'cotizacion_rechazada', 'El cliente eligió otra cotización',
           v_title, '/trabajos/' || new.id, new.id
    from public.proposals
    where request_id = new.id and status = 'rechazada' and professional_id <> new.professional_id;

  elsif new.status = 'en_progreso' then
    insert into public.notifications (user_id, type, title, body, link, request_id)
    values (new.client_id, 'servicio_iniciado', 'El profesional inició el servicio',
            v_title, '/solicitudes/' || new.id, new.id);

  elsif new.status = 'completado' then
    insert into public.notifications (user_id, type, title, body, link, request_id)
    values (new.client_id, 'servicio_completado', 'Servicio completado',
            v_title || '. Califica al profesional.', '/solicitudes/' || new.id, new.id);

  elsif new.status = 'cancelado' then
    if new.professional_id is not null then
      insert into public.notifications (user_id, type, title, body, link, request_id)
      values (new.professional_id, 'servicio_cancelado', 'El cliente canceló el servicio',
              v_title, '/trabajos/' || new.id, new.id);
    else
      -- Cancelada mientras estaba pendiente: avisar a quienes habían cotizado.
      -- (El trigger corre antes de que update_request_status rechace las cotizaciones.)
      insert into public.notifications (user_id, type, title, body, link, request_id)
      select professional_id, 'cotizacion_rechazada', 'El cliente canceló la solicitud',
             v_title, '/trabajos/' || new.id, new.id
      from public.proposals
      where request_id = new.id and status = 'pendiente';
    end if;
  end if;

  return new;
end;
$$;

create trigger service_requests_notify_status
  after update of status on public.service_requests
  for each row execute function public.notify_request_status();

-- -----------------------------------------------------------------------------
-- 4. Reseña recibida -> calificado
-- -----------------------------------------------------------------------------
create or replace function public.notify_new_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reviewer text;
begin
  select coalesce(nullif(full_name, ''), 'Alguien') into v_reviewer
  from public.profiles where id = new.reviewer_id;

  insert into public.notifications (user_id, type, title, body, link, request_id)
  values (
    new.reviewee_id,
    'resena_recibida',
    v_reviewer || ' te calificó con ' || new.rating || ' ' ||
      case when new.rating = 1 then 'estrella' else 'estrellas' end,
    new.comment,
    '/perfil',
    new.request_id
  );

  return new;
end;
$$;

create trigger reviews_notify_new
  after insert on public.reviews
  for each row execute function public.notify_new_review();

-- Las funciones de trigger y utilidades no deben llamarse por la API.
revoke execute on function public.format_cop(numeric) from public, anon, authenticated;
revoke execute on function public.notify_new_request() from public, anon, authenticated;
revoke execute on function public.notify_new_proposal() from public, anon, authenticated;
revoke execute on function public.notify_request_status() from public, anon, authenticated;
revoke execute on function public.notify_new_review() from public, anon, authenticated;
