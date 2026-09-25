-- =============================================================================
-- ManosCerca — esquema inicial (Supabase / PostgreSQL)
-- Pensado para ejecutarse una vez sobre una base de datos limpia (SQL Editor o CLI).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tipos enumerados
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('client', 'professional', 'admin');

create type public.verification_status as enum ('unverified', 'pending', 'verified', 'rejected');

create type public.request_status as enum (
  'pendiente', 'aceptado', 'en_progreso', 'completado', 'cancelado'
);

create type public.proposal_status as enum ('pendiente', 'aceptada', 'rechazada', 'retirada');

-- -----------------------------------------------------------------------------
-- Utilidades
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles: un registro por usuario de auth.users (clientes y profesionales)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  role                public.user_role not null default 'client',
  full_name           text not null default '',
  phone               text,
  avatar_url          text,
  bio                 text,
  verification_status public.verification_status not null default 'unverified',
  rating_avg          numeric(3, 2) not null default 0,
  rating_count        integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea el perfil automáticamente al registrarse. El rol viene de
-- raw_user_meta_data.role y solo acepta 'client' | 'professional' (nunca admin).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
begin
  insert into public.profiles (id, role, full_name, phone, avatar_url)
  values (
    new.id,
    case when requested_role = 'professional' then 'professional'::public.user_role
         else 'client'::public.user_role end,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers para políticas RLS (security definer evita recursión entre políticas)
create or replace function public.current_role_is(target public.user_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = target
  );
$$;

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------
create table public.categories (
  id         smallint generated always as identity primary key,
  slug       text not null unique,
  name       text not null,
  icon       text,
  is_active  boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

insert into public.categories (slug, name, icon, sort_order) values
  ('plomeria',     'Plomería',     'wrench',       1),
  ('cerrajeria',   'Cerrajería',   'key-round',    2),
  ('carpinteria',  'Carpintería',  'hammer',       3),
  ('electricidad', 'Electricidad', 'zap',          4),
  ('pintura',      'Pintura',      'paint-roller', 5),
  ('albanileria',  'Albañilería',  'brick-wall',   6),
  ('gasfiteria',   'Gas',          'flame',        7),
  ('limpieza',     'Limpieza',     'sparkles',     8);

-- Especialidades de cada profesional (N:M)
create table public.professional_categories (
  professional_id uuid not null references public.profiles (id) on delete cascade,
  category_id     smallint not null references public.categories (id) on delete cascade,
  primary key (professional_id, category_id)
);

create index professional_categories_category_idx
  on public.professional_categories (category_id);

-- -----------------------------------------------------------------------------
-- service_requests
-- -----------------------------------------------------------------------------
create table public.service_requests (
  id                   uuid primary key default gen_random_uuid(),
  client_id            uuid not null references public.profiles (id) on delete cascade,
  category_id          smallint not null references public.categories (id),
  professional_id      uuid references public.profiles (id) on delete set null,
  accepted_proposal_id uuid,
  title                text not null check (char_length(title) between 3 and 120),
  description          text not null check (char_length(description) between 10 and 2000),
  address              text not null,
  latitude             double precision check (latitude between -90 and 90),
  longitude            double precision check (longitude between -180 and 180),
  budget_estimate      numeric(10, 2) check (budget_estimate is null or budget_estimate >= 0),
  status               public.request_status not null default 'pendiente',
  scheduled_at         timestamptz,
  started_at           timestamptz,
  completed_at         timestamptz,
  cancelled_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index service_requests_status_category_idx
  on public.service_requests (status, category_id, created_at desc);
create index service_requests_client_idx on public.service_requests (client_id, created_at desc);
create index service_requests_professional_idx
  on public.service_requests (professional_id, created_at desc)
  where professional_id is not null;
create index service_requests_location_idx
  on public.service_requests (latitude, longitude)
  where status = 'pendiente';

create trigger service_requests_set_updated_at
  before update on public.service_requests
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- proposals (cotizaciones de profesionales sobre una solicitud)
-- -----------------------------------------------------------------------------
create table public.proposals (
  id              uuid primary key default gen_random_uuid(),
  request_id      uuid not null references public.service_requests (id) on delete cascade,
  professional_id uuid not null references public.profiles (id) on delete cascade,
  price           numeric(10, 2) not null check (price >= 0),
  message         text check (message is null or char_length(message) <= 1000),
  eta_minutes     integer check (eta_minutes is null or eta_minutes > 0),
  status          public.proposal_status not null default 'pendiente',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (request_id, professional_id)
);

create index proposals_request_idx on public.proposals (request_id, created_at);
create index proposals_professional_idx on public.proposals (professional_id, created_at desc);

create trigger proposals_set_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

alter table public.service_requests
  add constraint service_requests_accepted_proposal_fk
  foreign key (accepted_proposal_id) references public.proposals (id) on delete set null;

-- -----------------------------------------------------------------------------
-- reviews (calificación mutua al completar el servicio)
-- -----------------------------------------------------------------------------
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.service_requests (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text check (comment is null or char_length(comment) <= 1000),
  created_at  timestamptz not null default now(),
  unique (request_id, reviewer_id),
  check (reviewer_id <> reviewee_id)
);

create index reviews_reviewee_idx on public.reviews (reviewee_id, created_at desc);

-- Mantiene rating_avg / rating_count del perfil calificado
create or replace function public.refresh_profile_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.reviewee_id, old.reviewee_id);
begin
  update public.profiles p
  set rating_avg   = coalesce(s.avg_rating, 0),
      rating_count = s.total
  from (
    select round(avg(r.rating)::numeric, 2) as avg_rating, count(*)::int as total
    from public.reviews r
    where r.reviewee_id = target
  ) s
  where p.id = target;
  return null;
end;
$$;

create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_profile_rating();

-- =============================================================================
-- RPC: transiciones de estado (única vía para cambiar estados)
-- =============================================================================

-- El cliente acepta una cotización: asigna profesional y rechaza las demás.
create or replace function public.accept_proposal(p_proposal_id uuid)
returns public.service_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_proposal public.proposals;
  v_request  public.service_requests;
begin
  select * into v_proposal from public.proposals where id = p_proposal_id for update;
  if not found or v_proposal.status <> 'pendiente' then
    raise exception 'La propuesta no existe o ya no está disponible';
  end if;

  select * into v_request from public.service_requests
  where id = v_proposal.request_id for update;
  if v_request.client_id <> auth.uid() then
    raise exception 'No autorizado';
  end if;
  if v_request.status <> 'pendiente' then
    raise exception 'La solicitud ya no admite propuestas';
  end if;

  update public.proposals set status = 'aceptada' where id = p_proposal_id;
  update public.proposals set status = 'rechazada'
  where request_id = v_request.id and id <> p_proposal_id and status = 'pendiente';

  update public.service_requests
  set status = 'aceptado',
      professional_id = v_proposal.professional_id,
      accepted_proposal_id = p_proposal_id
  where id = v_request.id
  returning * into v_request;

  return v_request;
end;
$$;

-- Transiciones permitidas:
--   profesional asignado: aceptado -> en_progreso -> completado
--   cliente:              pendiente | aceptado -> cancelado
create or replace function public.update_request_status(
  p_request_id uuid,
  p_status public.request_status
)
returns public.service_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.service_requests;
  v_uid uuid := auth.uid();
begin
  select * into v_request from public.service_requests where id = p_request_id for update;
  if not found then
    raise exception 'Solicitud no encontrada';
  end if;

  if p_status = 'en_progreso'
     and v_request.professional_id = v_uid and v_request.status = 'aceptado' then
    update public.service_requests set status = p_status, started_at = now()
    where id = p_request_id returning * into v_request;

  elsif p_status = 'completado'
     and v_request.professional_id = v_uid and v_request.status = 'en_progreso' then
    update public.service_requests set status = p_status, completed_at = now()
    where id = p_request_id returning * into v_request;

  elsif p_status = 'cancelado'
     and v_request.client_id = v_uid and v_request.status in ('pendiente', 'aceptado') then
    update public.service_requests set status = p_status, cancelled_at = now()
    where id = p_request_id returning * into v_request;
    update public.proposals set status = 'rechazada'
    where request_id = p_request_id and status = 'pendiente';

  else
    raise exception 'Transición de estado no permitida';
  end if;

  return v_request;
end;
$$;

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles                enable row level security;
alter table public.categories              enable row level security;
alter table public.professional_categories enable row level security;
alter table public.service_requests        enable row level security;
alter table public.proposals               enable row level security;
alter table public.reviews                 enable row level security;

-- Privilegios por columna: los campos sensibles (rol, verificación, rating,
-- estados) solo cambian vía triggers/RPC security definer.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone, avatar_url, bio) on public.profiles to authenticated;

revoke update on public.service_requests from anon, authenticated;
grant update (title, description, address, latitude, longitude, budget_estimate, scheduled_at)
  on public.service_requests to authenticated;

revoke update on public.proposals from anon, authenticated;
grant update (price, message, eta_minutes, status) on public.proposals to authenticated;

revoke update on public.reviews from anon, authenticated;

-- profiles
create policy "profiles: lectura para autenticados"
  on public.profiles for select to authenticated using (true);

create policy "profiles: el usuario edita su perfil"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- categories
create policy "categories: lectura pública"
  on public.categories for select to anon, authenticated using (is_active);

-- professional_categories
create policy "professional_categories: lectura para autenticados"
  on public.professional_categories for select to authenticated using (true);

create policy "professional_categories: el profesional gestiona las suyas"
  on public.professional_categories for insert to authenticated
  with check (professional_id = auth.uid() and public.current_role_is('professional'));

create policy "professional_categories: el profesional elimina las suyas"
  on public.professional_categories for delete to authenticated
  using (professional_id = auth.uid());

-- service_requests
create policy "service_requests: cliente, asignado o profesionales si está pendiente"
  on public.service_requests for select to authenticated
  using (
    client_id = auth.uid()
    or professional_id = auth.uid()
    or (status = 'pendiente' and public.current_role_is('professional'))
  );

create policy "service_requests: el cliente crea solicitudes"
  on public.service_requests for insert to authenticated
  with check (
    client_id = auth.uid()
    and status = 'pendiente'
    and professional_id is null
    and accepted_proposal_id is null
    and public.current_role_is('client')
  );

create policy "service_requests: el cliente edita mientras está pendiente"
  on public.service_requests for update to authenticated
  using (client_id = auth.uid() and status = 'pendiente')
  with check (client_id = auth.uid());

-- proposals
create policy "proposals: el profesional ve las suyas y el cliente las de su solicitud"
  on public.proposals for select to authenticated
  using (
    professional_id = auth.uid()
    or exists (
      select 1 from public.service_requests r
      where r.id = request_id and r.client_id = auth.uid()
    )
  );

create policy "proposals: el profesional cotiza solicitudes pendientes"
  on public.proposals for insert to authenticated
  with check (
    professional_id = auth.uid()
    and status = 'pendiente'
    and public.current_role_is('professional')
    and exists (
      select 1 from public.service_requests r
      where r.id = request_id and r.status = 'pendiente' and r.client_id <> auth.uid()
    )
  );

create policy "proposals: el profesional edita o retira su propuesta pendiente"
  on public.proposals for update to authenticated
  using (professional_id = auth.uid() and status = 'pendiente')
  with check (professional_id = auth.uid() and status in ('pendiente', 'retirada'));

-- reviews
create policy "reviews: lectura para autenticados"
  on public.reviews for select to authenticated using (true);

create policy "reviews: participantes califican servicios completados"
  on public.reviews for insert to authenticated
  with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from public.service_requests r
      where r.id = request_id
        and r.status = 'completado'
        and (
          (r.client_id = auth.uid() and reviewee_id = r.professional_id)
          or (r.professional_id = auth.uid() and reviewee_id = r.client_id)
        )
    )
  );

-- RPC solo para usuarios autenticados
revoke execute on function public.accept_proposal(uuid) from public, anon;
revoke execute on function public.update_request_status(uuid, public.request_status) from public, anon;
grant execute on function public.accept_proposal(uuid) to authenticated;
grant execute on function public.update_request_status(uuid, public.request_status) to authenticated;

-- =============================================================================
-- Realtime
-- =============================================================================
alter publication supabase_realtime add table public.service_requests;
alter publication supabase_realtime add table public.proposals;
