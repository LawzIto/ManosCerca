-- =============================================================================
-- 1. Privacidad del teléfono
--    Antes, cualquier usuario autenticado podía leer el teléfono de todos los
--    perfiles. Ahora la columna no se expone por la API: el propio usuario lo
--    obtiene con get_my_phone() y las partes de un servicio activo con
--    get_request_contact().
-- =============================================================================
revoke select on public.profiles from anon, authenticated;
grant select (
  id, role, full_name, avatar_url, bio, verification_status,
  rating_avg, rating_count, created_at, updated_at
) on public.profiles to authenticated;

create or replace function public.get_my_phone()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select phone from public.profiles where id = auth.uid();
$$;

-- Nombre y teléfono de la contraparte, solo mientras el servicio está activo.
create or replace function public.get_request_contact(p_request_id uuid)
returns table (full_name text, phone text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.full_name, p.phone
  from public.service_requests r
  join public.profiles p
    on p.id = case when r.client_id = auth.uid() then r.professional_id else r.client_id end
  where r.id = p_request_id
    and r.status in ('aceptado', 'en_progreso')
    and auth.uid() in (r.client_id, r.professional_id);
$$;

revoke execute on function public.get_my_phone() from public, anon;
revoke execute on function public.get_request_contact(uuid) from public, anon;
grant execute on function public.get_my_phone() to authenticated;
grant execute on function public.get_request_contact(uuid) to authenticated;

-- =============================================================================
-- 2. Volver a cotizar tras retirar una propuesta
--    La restricción unique (request_id, professional_id) impide insertar otra;
--    se permite reactivar la retirada mientras la solicitud siga pendiente.
-- =============================================================================
drop policy "proposals: el profesional edita o retira su propuesta pendiente" on public.proposals;

create policy "proposals: el profesional edita, retira o reactiva su propuesta"
  on public.proposals for update to authenticated
  using (professional_id = auth.uid() and status in ('pendiente', 'retirada'))
  with check (
    professional_id = auth.uid()
    and status in ('pendiente', 'retirada')
    and exists (
      select 1 from public.service_requests r
      where r.id = request_id and r.status = 'pendiente'
    )
  );
