-- =============================================================================
-- Migración: tracking de ubicación del trabajador en tiempo real
-- =============================================================================

-- Tabla que guarda la última posición conocida del trabajador asignado a una solicitud.
-- Un registro por solicitud activa (upsert al actualizar).
create table if not exists public.tracking_locations (
  request_id      uuid primary key references public.service_requests(id) on delete cascade,
  worker_latitude  double precision not null check (worker_latitude  between -90  and 90),
  worker_longitude double precision not null check (worker_longitude between -180 and 180),
  updated_at      timestamptz not null default now()
);

-- Índice para Realtime (filtros por request_id)
create index if not exists tracking_locations_request_idx
  on public.tracking_locations (request_id);

-- RLS
alter table public.tracking_locations enable row level security;

-- El profesional asignado puede insertar/actualizar su propia posición
create policy "tracking: el profesional asignado escribe su posición"
  on public.tracking_locations for all to authenticated
  using (
    exists (
      select 1 from public.service_requests r
      where r.id = request_id
        and r.professional_id = auth.uid()
        and r.status in ('aceptado', 'en_progreso')
    )
  )
  with check (
    exists (
      select 1 from public.service_requests r
      where r.id = request_id
        and r.professional_id = auth.uid()
        and r.status in ('aceptado', 'en_progreso')
    )
  );

-- El cliente de la solicitud puede leer la posición
create policy "tracking: el cliente lee la posición"
  on public.tracking_locations for select to authenticated
  using (
    exists (
      select 1 from public.service_requests r
      where r.id = request_id and r.client_id = auth.uid()
    )
  );

-- Habilitar Realtime en esta tabla
alter publication supabase_realtime add table public.tracking_locations;

