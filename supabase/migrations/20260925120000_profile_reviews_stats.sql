-- =============================================================================
-- Cierre del ciclo: foto de perfil, especialidades y estadísticas.
-- Las calificaciones ya existen (tabla reviews + trigger refresh_profile_rating
-- + política de insert solo para participantes de servicios completados).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Foto de perfil (Storage)
--    Bucket público de lectura; cada usuario solo escribe en `<su uid>/`.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "avatars: el usuario lee su carpeta"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: el usuario sube a su carpeta"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: el usuario reemplaza en su carpeta"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: el usuario borra en su carpeta"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 2. Especialidades del profesional: reemplaza el conjunto en una transacción.
--    security invoker: aplican las políticas RLS de professional_categories.
-- -----------------------------------------------------------------------------
create or replace function public.set_my_categories(p_category_ids smallint[])
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not public.current_role_is('professional') then
    raise exception 'Solo los profesionales tienen especialidades';
  end if;

  delete from public.professional_categories
  where professional_id = auth.uid()
    and not (category_id = any (coalesce(p_category_ids, '{}')));

  insert into public.professional_categories (professional_id, category_id)
  select auth.uid(), c.id
  from public.categories c
  where c.id = any (coalesce(p_category_ids, '{}')) and c.is_active
  on conflict do nothing;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3. Estadísticas del usuario (cliente: gastado; profesional: ganado).
--    security invoker: solo cuenta lo que RLS le deja ver.
-- -----------------------------------------------------------------------------
create or replace function public.get_my_stats()
returns table (completed_count integer, total_amount numeric, month_amount numeric)
language sql
stable
set search_path = ''
as $$
  select
    count(*)::int,
    coalesce(sum(p.price), 0),
    coalesce(sum(p.price) filter (
      where date_trunc('month', r.completed_at at time zone 'America/Bogota')
          = date_trunc('month', now() at time zone 'America/Bogota')
    ), 0)
  from public.service_requests r
  left join public.proposals p on p.id = r.accepted_proposal_id
  where r.status = 'completado'
    and auth.uid() in (r.client_id, r.professional_id);
$$;

revoke execute on function public.set_my_categories(smallint[]) from public, anon;
revoke execute on function public.get_my_stats() from public, anon;
grant execute on function public.set_my_categories(smallint[]) to authenticated;
grant execute on function public.get_my_stats() to authenticated;
