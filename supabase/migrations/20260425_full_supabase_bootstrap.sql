begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('ADMIN', 'CLIENT');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.plan_tier as enum ('STARTER', 'SIGNATURE', 'STUDIO');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.subscription_status as enum ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.send_channel as enum ('MANUAL', 'WHATSAPP', 'EMAIL');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.send_log_status as enum ('QUEUED', 'SENT', 'FAILED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.invitation_template as enum ('ELEGANT_LUXURY', 'KOREAN_SOFT', 'MODERN_MINIMAL');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.invitation_status as enum ('DRAFT', 'PUBLISHED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.guest_source as enum ('MANUAL', 'CSV');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.rsvp_status as enum ('ATTENDING', 'MAYBE', 'DECLINED');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text not null unique,
  role public.user_role not null default 'CLIENT',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invitations (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid not null unique references public.users (id) on delete cascade,
  template public.invitation_template not null default 'KOREAN_SOFT',
  status public.invitation_status not null default 'DRAFT',
  couple_slug text not null unique,
  partner_one_name text not null,
  partner_two_name text not null,
  headline text not null,
  subheadline text not null,
  story text not null,
  closing_note text not null,
  template_config jsonb,
  cover_image_url text,
  cover_image_alt text,
  cover_image_storage_path text,
  music_url text,
  music_original_name text,
  music_mime_type text,
  music_size integer,
  music_storage_path text,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.event_slots (
  id text primary key default gen_random_uuid()::text,
  invitation_id text not null references public.invitations (id) on delete cascade,
  label text not null,
  starts_at timestamptz not null,
  venue_name text not null,
  address text not null,
  maps_url text,
  latitude double precision,
  longitude double precision,
  place_name text,
  formatted_address text,
  google_maps_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.gallery_images (
  id text primary key default gen_random_uuid()::text,
  invitation_id text not null references public.invitations (id) on delete cascade,
  image_url text not null,
  storage_path text,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.guests (
  id text primary key default gen_random_uuid()::text,
  invitation_id text not null references public.invitations (id) on delete cascade,
  name text not null,
  guest_slug text not null,
  phone text,
  email text,
  source public.guest_source not null default 'MANUAL',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (invitation_id, guest_slug)
);

create table if not exists public.rsvps (
  id text primary key default gen_random_uuid()::text,
  guest_id text not null unique references public.guests (id) on delete cascade,
  respondent_name text,
  status public.rsvp_status not null,
  attendees integer not null default 1,
  note text,
  responded_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.wishes (
  id text primary key default gen_random_uuid()::text,
  invitation_id text not null references public.invitations (id) on delete cascade,
  guest_id text not null unique references public.guests (id) on delete cascade,
  message text not null,
  is_approved boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invitation_view_logs (
  id text primary key default gen_random_uuid()::text,
  invitation_id text not null references public.invitations (id) on delete cascade,
  guest_id text not null references public.guests (id) on delete cascade,
  path text,
  opened_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invitation_settings (
  id text primary key default gen_random_uuid()::text,
  invitation_id text not null unique references public.invitations (id) on delete cascade,
  locale text not null default 'id-ID',
  timezone text not null default 'Asia/Jakarta',
  is_rsvp_enabled boolean not null default true,
  is_wish_enabled boolean not null default true,
  auto_play_music boolean not null default true,
  preferred_send_channel public.send_channel not null default 'MANUAL',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.plans (
  id text primary key default gen_random_uuid()::text,
  tier public.plan_tier not null unique,
  name text not null,
  description text not null,
  price_in_idr integer not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_subscriptions (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references public.users (id) on delete cascade,
  plan_id text not null references public.plans (id) on delete restrict,
  status public.subscription_status not null default 'TRIAL',
  starts_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  auto_renew boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_orders (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references public.users (id) on delete cascade,
  invitation_id text references public.invitations (id) on delete set null,
  plan_id text references public.plans (id) on delete set null,
  status public.payment_status not null default 'PENDING',
  amount_in_idr integer not null,
  currency text not null default 'IDR',
  provider text,
  external_reference text unique,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.send_logs (
  id text primary key default gen_random_uuid()::text,
  invitation_id text not null references public.invitations (id) on delete cascade,
  guest_id text references public.guests (id) on delete set null,
  channel public.send_channel not null default 'MANUAL',
  status public.send_log_status not null default 'QUEUED',
  recipient text not null,
  provider text,
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'ADMIN'
  );
$$;

create or replace function public.owns_invitation(target_invitation_id text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.invitations
    where id = target_invitation_id
      and owner_id = auth.uid()
  );
$$;

create or replace function public.owns_guest(target_guest_id text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.guests
    join public.invitations on invitations.id = guests.invitation_id
    where guests.id = target_guest_id
      and invitations.owner_id = auth.uid()
  );
$$;

create index if not exists event_slots_invitation_id_sort_order_idx
  on public.event_slots (invitation_id, sort_order);

create index if not exists gallery_images_invitation_id_sort_order_idx
  on public.gallery_images (invitation_id, sort_order);

create index if not exists guests_invitation_id_name_idx
  on public.guests (invitation_id, name);

create index if not exists wishes_invitation_id_created_at_idx
  on public.wishes (invitation_id, created_at desc);

create index if not exists invitation_view_logs_invitation_id_opened_at_idx
  on public.invitation_view_logs (invitation_id, opened_at desc);

create index if not exists invitation_view_logs_invitation_id_guest_id_opened_at_idx
  on public.invitation_view_logs (invitation_id, guest_id, opened_at desc);

create index if not exists user_subscriptions_user_id_status_idx
  on public.user_subscriptions (user_id, status);

create index if not exists user_subscriptions_plan_id_status_idx
  on public.user_subscriptions (plan_id, status);

create index if not exists payment_orders_user_id_status_created_at_idx
  on public.payment_orders (user_id, status, created_at desc);

create index if not exists payment_orders_invitation_id_status_idx
  on public.payment_orders (invitation_id, status);

create index if not exists send_logs_invitation_id_created_at_idx
  on public.send_logs (invitation_id, created_at desc);

create index if not exists send_logs_guest_id_created_at_idx
  on public.send_logs (guest_id, created_at desc);

create index if not exists send_logs_status_created_at_idx
  on public.send_logs (status, created_at desc);

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists invitations_set_updated_at on public.invitations;
create trigger invitations_set_updated_at
before update on public.invitations
for each row execute function public.set_updated_at();

drop trigger if exists event_slots_set_updated_at on public.event_slots;
create trigger event_slots_set_updated_at
before update on public.event_slots
for each row execute function public.set_updated_at();

drop trigger if exists guests_set_updated_at on public.guests;
create trigger guests_set_updated_at
before update on public.guests
for each row execute function public.set_updated_at();

drop trigger if exists rsvps_set_updated_at on public.rsvps;
create trigger rsvps_set_updated_at
before update on public.rsvps
for each row execute function public.set_updated_at();

drop trigger if exists wishes_set_updated_at on public.wishes;
create trigger wishes_set_updated_at
before update on public.wishes
for each row execute function public.set_updated_at();

drop trigger if exists invitation_settings_set_updated_at on public.invitation_settings;
create trigger invitation_settings_set_updated_at
before update on public.invitation_settings
for each row execute function public.set_updated_at();

drop trigger if exists plans_set_updated_at on public.plans;
create trigger plans_set_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

drop trigger if exists user_subscriptions_set_updated_at on public.user_subscriptions;
create trigger user_subscriptions_set_updated_at
before update on public.user_subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists payment_orders_set_updated_at on public.payment_orders;
create trigger payment_orders_set_updated_at
before update on public.payment_orders
for each row execute function public.set_updated_at();

drop trigger if exists send_logs_set_updated_at on public.send_logs;
create trigger send_logs_set_updated_at
before update on public.send_logs
for each row execute function public.set_updated_at();

grant usage on schema public to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.owns_invitation(text) to authenticated;
grant execute on function public.owns_guest(text) to authenticated;

grant select on public.plans to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

alter table public.users enable row level security;
alter table public.invitations enable row level security;
alter table public.event_slots enable row level security;
alter table public.gallery_images enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.wishes enable row level security;
alter table public.invitation_view_logs enable row level security;
alter table public.invitation_settings enable row level security;
alter table public.plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.payment_orders enable row level security;
alter table public.send_logs enable row level security;

drop policy if exists "users_select_own_or_admin" on public.users;
create policy "users_select_own_or_admin"
on public.users
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "users_insert_self_or_admin" on public.users;
create policy "users_insert_self_or_admin"
on public.users
for insert
to authenticated
with check (id = auth.uid() or public.is_admin());

drop policy if exists "users_update_self_or_admin" on public.users;
create policy "users_update_self_or_admin"
on public.users
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "invitations_owner_or_admin_select" on public.invitations;
create policy "invitations_owner_or_admin_select"
on public.invitations
for select
to authenticated
using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "invitations_owner_or_admin_insert" on public.invitations;
create policy "invitations_owner_or_admin_insert"
on public.invitations
for insert
to authenticated
with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "invitations_owner_or_admin_update" on public.invitations;
create policy "invitations_owner_or_admin_update"
on public.invitations
for update
to authenticated
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "invitations_owner_or_admin_delete" on public.invitations;
create policy "invitations_owner_or_admin_delete"
on public.invitations
for delete
to authenticated
using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "event_slots_owner_or_admin_all" on public.event_slots;
create policy "event_slots_owner_or_admin_all"
on public.event_slots
for all
to authenticated
using (public.owns_invitation(invitation_id) or public.is_admin())
with check (public.owns_invitation(invitation_id) or public.is_admin());

drop policy if exists "gallery_images_owner_or_admin_all" on public.gallery_images;
create policy "gallery_images_owner_or_admin_all"
on public.gallery_images
for all
to authenticated
using (public.owns_invitation(invitation_id) or public.is_admin())
with check (public.owns_invitation(invitation_id) or public.is_admin());

drop policy if exists "guests_owner_or_admin_all" on public.guests;
create policy "guests_owner_or_admin_all"
on public.guests
for all
to authenticated
using (public.owns_invitation(invitation_id) or public.is_admin())
with check (public.owns_invitation(invitation_id) or public.is_admin());

drop policy if exists "rsvps_owner_or_admin_all" on public.rsvps;
create policy "rsvps_owner_or_admin_all"
on public.rsvps
for all
to authenticated
using (public.owns_guest(guest_id) or public.is_admin())
with check (public.owns_guest(guest_id) or public.is_admin());

drop policy if exists "wishes_owner_or_admin_all" on public.wishes;
create policy "wishes_owner_or_admin_all"
on public.wishes
for all
to authenticated
using (public.owns_invitation(invitation_id) or public.owns_guest(guest_id) or public.is_admin())
with check (public.owns_invitation(invitation_id) or public.owns_guest(guest_id) or public.is_admin());

drop policy if exists "invitation_view_logs_owner_or_admin_all" on public.invitation_view_logs;
create policy "invitation_view_logs_owner_or_admin_all"
on public.invitation_view_logs
for all
to authenticated
using (public.owns_invitation(invitation_id) or public.is_admin())
with check (public.owns_invitation(invitation_id) or public.is_admin());

drop policy if exists "invitation_settings_owner_or_admin_all" on public.invitation_settings;
create policy "invitation_settings_owner_or_admin_all"
on public.invitation_settings
for all
to authenticated
using (public.owns_invitation(invitation_id) or public.is_admin())
with check (public.owns_invitation(invitation_id) or public.is_admin());

drop policy if exists "plans_public_read" on public.plans;
create policy "plans_public_read"
on public.plans
for select
to anon, authenticated
using (is_active or public.is_admin());

drop policy if exists "plans_admin_write" on public.plans;
create policy "plans_admin_write"
on public.plans
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "user_subscriptions_owner_or_admin_all" on public.user_subscriptions;
create policy "user_subscriptions_owner_or_admin_all"
on public.user_subscriptions
for all
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "payment_orders_owner_or_admin_all" on public.payment_orders;
create policy "payment_orders_owner_or_admin_all"
on public.payment_orders
for all
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "send_logs_owner_or_admin_all" on public.send_logs;
create policy "send_logs_owner_or_admin_all"
on public.send_logs
for all
to authenticated
using (public.owns_invitation(invitation_id) or public.is_admin())
with check (public.owns_invitation(invitation_id) or public.is_admin());

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'invitation-media',
  'invitation-media',
  true,
  20971520,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/mp4'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "invitation_media_public_read" on storage.objects;
create policy "invitation_media_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'invitation-media');

drop policy if exists "invitation_media_authenticated_insert" on storage.objects;
create policy "invitation_media_authenticated_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'invitation-media'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);

drop policy if exists "invitation_media_authenticated_update" on storage.objects;
create policy "invitation_media_authenticated_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'invitation-media'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
)
with check (
  bucket_id = 'invitation-media'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);

drop policy if exists "invitation_media_authenticated_delete" on storage.objects;
create policy "invitation_media_authenticated_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'invitation-media'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);

commit;

-- Optional cleanup after verification:
-- drop table if exists public."Account" cascade;
-- drop table if exists public."Session" cascade;
-- drop table if exists public."VerificationToken" cascade;
-- alter table if exists public."User" drop column if exists "passwordHash";
