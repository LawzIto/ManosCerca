-- =============================================================================
-- Web Push: suscripciones por dispositivo y envío vía Edge Function `send-push`.
--
-- Flujo: insert en notifications -> trigger -> pg_net POST a la Edge Function
-- (asíncrono: no frena la transacción) -> web-push a cada dispositivo.
--
-- Requiere dos secretos en Vault (se crean a mano, no van en el repo):
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<mismo PUSH_WEBHOOK_SECRET de la función>', 'push_webhook_secret');
-- Sin ellos, el trigger no hace nada (las notificaciones en la app siguen funcionando).
-- =============================================================================

create extension if not exists pg_net with schema extensions;

-- -----------------------------------------------------------------------------
-- 1. Suscripciones (una por navegador/dispositivo)
-- -----------------------------------------------------------------------------
create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  endpoint   text not null unique check (endpoint like 'https://%'),
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon;
revoke insert, update on public.push_subscriptions from authenticated;

create policy "push_subscriptions: el usuario ve las suyas"
  on public.push_subscriptions for select to authenticated
  using (user_id = auth.uid());

create policy "push_subscriptions: el usuario borra las suyas"
  on public.push_subscriptions for delete to authenticated
  using (user_id = auth.uid());

-- Guarda (o reasigna) la suscripción del dispositivo al usuario actual. Si otra
-- cuenta inició sesión antes en el mismo navegador, el endpoint pasa a esta.
create or replace function public.save_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth, left(p_user_agent, 300))
  on conflict (endpoint) do update
    set user_id = excluded.user_id,
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        user_agent = excluded.user_agent,
        created_at = now();
$$;

revoke execute on function public.save_push_subscription(text, text, text, text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Envío: cada notificación nueva se manda a la Edge Function
-- -----------------------------------------------------------------------------
create or replace function public.dispatch_push_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url    text;
  v_secret text;
begin
  if not exists (select 1 from public.push_subscriptions where user_id = new.user_id) then
    return new;
  end if;

  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_webhook_secret';
  if v_url is null or v_secret is null then
    return new;
  end if;

  perform net.http_post(
    url := rtrim(v_url, '/') || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', v_secret
    ),
    body := jsonb_build_object(
      'notification_id', new.id,
      'user_id', new.user_id,
      'title', new.title,
      'body', new.body,
      'link', new.link
    ),
    timeout_milliseconds := 5000
  );

  return new;
end;
$$;

create trigger notifications_dispatch_push
  after insert on public.notifications
  for each row execute function public.dispatch_push_notification();

revoke execute on function public.dispatch_push_notification() from public, anon, authenticated;
