-- =============================================================================
-- Trabajos cercanos: zona de trabajo del profesional y búsqueda por distancia.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Zona de trabajo del profesional (punto de referencia + radio).
--    Privada: suele ser la casa del profesional, así que solo él la ve.
-- -----------------------------------------------------------------------------
create table public.work_areas (
  professional_id uuid primary key references public.profiles (id) on delete cascade,
  latitude        double precision not null check (latitude between -90 and 90),
  longitude       double precision not null check (longitude between -180 and 180),
  radius_km       smallint not null default 10 check (radius_km between 1 and 100),
  updated_at      timestamptz not null default now()
);

create trigger work_areas_set_updated_at
  before update on public.work_areas
  for each row execute function public.set_updated_at();

alter table public.work_areas enable row level security;
revoke all on public.work_areas from anon;

create policy "work_areas: el profesional ve la suya"
  on public.work_areas for select to authenticated
  using (professional_id = auth.uid());

create policy "work_areas: el profesional crea la suya"
  on public.work_areas for insert to authenticated
  with check (professional_id = auth.uid() and public.current_role_is('professional'));

create policy "work_areas: el profesional edita la suya"
  on public.work_areas for update to authenticated
  using (professional_id = auth.uid())
  with check (professional_id = auth.uid());

create policy "work_areas: el profesional elimina la suya"
  on public.work_areas for delete to authenticated
  using (professional_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 2. Distancia en km entre dos puntos (fórmula de haversine).
--    Devuelve null si falta alguna coordenada.
-- -----------------------------------------------------------------------------
create or replace function public.distance_between_km(
  lat1 double precision, lon1 double precision,
  lat2 double precision, lon2 double precision
)
returns double precision
language sql
immutable
parallel safe
set search_path = ''
as $$
  select 2 * 6371 * asin(least(1, sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2)
    + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)
  )));
$$;

-- -----------------------------------------------------------------------------
-- 3. Campo calculado `distance_km` de service_requests: distancia desde la zona
--    de trabajo de quien consulta. Se pide como una columna más:
--    `.select("id, title, distance_km")`. Null sin zona o sin ubicación.
-- -----------------------------------------------------------------------------
create or replace function public.distance_km(public.service_requests)
returns double precision
language sql
stable
set search_path = ''
as $$
  select public.distance_between_km(a.latitude, a.longitude, $1.latitude, $1.longitude)
  from public.work_areas a
  where a.professional_id = auth.uid();
$$;

-- -----------------------------------------------------------------------------
-- 4. Solicitudes pendientes dentro del radio del profesional.
--    Incluye también las que no tienen ubicación (es opcional al publicar), para
--    que no queden invisibles; el cliente ordena por `distance_km` (nulls last).
--    security invoker: RLS de service_requests sigue aplicando.
-- -----------------------------------------------------------------------------
create or replace function public.get_nearby_requests(p_category_ids smallint[] default null)
returns setof public.service_requests
language sql
stable
set search_path = ''
as $$
  select r.*
  from public.service_requests r
  join public.work_areas a on a.professional_id = auth.uid()
  where r.status = 'pendiente'
    and r.client_id <> auth.uid()
    and (p_category_ids is null or r.category_id = any (p_category_ids))
    and (
      r.latitude is null
      or r.longitude is null
      or (
        -- Caja aproximada primero (usa service_requests_location_idx), luego distancia exacta.
        r.latitude between a.latitude - a.radius_km / 111.0 and a.latitude + a.radius_km / 111.0
        and r.longitude between a.longitude - a.radius_km / (111.32 * greatest(cos(radians(a.latitude)), 0.01))
                            and a.longitude + a.radius_km / (111.32 * greatest(cos(radians(a.latitude)), 0.01))
        and public.distance_between_km(a.latitude, a.longitude, r.latitude, r.longitude) <= a.radius_km
      )
    );
$$;

revoke execute on function public.distance_between_km(double precision, double precision, double precision, double precision) from public, anon;
revoke execute on function public.distance_km(public.service_requests) from public, anon;
revoke execute on function public.get_nearby_requests(smallint[]) from public, anon;
grant execute on function public.distance_between_km(double precision, double precision, double precision, double precision) to authenticated;
grant execute on function public.distance_km(public.service_requests) to authenticated;
grant execute on function public.get_nearby_requests(smallint[]) to authenticated;
