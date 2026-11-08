-- =============================================================================
-- Migración: imágenes adjuntas a solicitudes de servicio
-- =============================================================================

-- 1. Columna en service_requests
alter table public.service_requests
  add column if not exists image_urls text[] not null default '{}';

-- 2. Bucket de Storage para imágenes de solicitudes
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'request-images',
  'request-images',
  true,
  10485760,  -- 10 MB por archivo
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- 3. Políticas de Storage
--    El cliente autenticado puede subir solo a su propio "directorio" (prefijo = su UID)
create policy "request-images: cliente sube a su carpeta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'request-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

--    Lectura pública (el bucket es público, pero la policy lo hace explícito)
create policy "request-images: lectura pública"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'request-images');

--    El cliente puede borrar solo objetos suyos
create policy "request-images: cliente borra su carpeta"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'request-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Permitir que los clientes actualicen image_urls (columna nueva)
--    La policy de update ya cubre client_id = auth.uid() y status = 'pendiente'.
--    Solo agregamos el permiso de columna.
grant update (image_urls) on public.service_requests to authenticated;

