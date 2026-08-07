-- ============================================================================
--  Marketplace di appunti universitari — schema Supabase
--  Esegui questo file in: Supabase Dashboard > SQL Editor > New query > Run
--  È idempotente: puoi rieseguirlo senza rompere nulla.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tipi
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('buyer', 'seller', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'note_status') then
    create type public.note_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Tabelle
-- ---------------------------------------------------------------------------

-- Profilo utente: 1-a-1 con auth.users. Il ruolo viene scelto in registrazione.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  university  text,
  role        public.user_role not null default 'buyer',
  created_at  timestamptz not null default now()
);

-- Appunti in vendita.
create table if not exists public.notes (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references public.profiles (id) on delete cascade,
  title        text not null check (char_length(title) between 3 and 140),
  description  text,
  university   text,
  course       text,
  pages        int check (pages is null or pages > 0),
  price_cents  int not null default 0 check (price_cents >= 0 and price_cents <= 100000),
  file_path    text not null,          -- path dentro il bucket privato "notes"
  status       public.note_status not null default 'pending',
  reject_reason text,
  created_at   timestamptz not null default now()
);

create index if not exists notes_seller_id_idx on public.notes (seller_id);
create index if not exists notes_status_idx on public.notes (status);

-- Acquisti. Un utente può comprare lo stesso appunto una sola volta.
create table if not exists public.purchases (
  id           uuid primary key default gen_random_uuid(),
  note_id      uuid not null references public.notes (id) on delete cascade,
  buyer_id     uuid not null references public.profiles (id) on delete cascade,
  amount_cents int not null default 0 check (amount_cents >= 0),
  created_at   timestamptz not null default now(),
  unique (note_id, buyer_id)
);

create index if not exists purchases_buyer_id_idx on public.purchases (buyer_id);
create index if not exists purchases_note_id_idx on public.purchases (note_id);

-- ---------------------------------------------------------------------------
-- 3. Funzioni di supporto
-- ---------------------------------------------------------------------------

-- Ruolo dell'utente corrente. SECURITY DEFINER per evitare ricorsione nelle policy.
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- Crea il profilo alla registrazione leggendo i metadati passati da signUp().
-- Il ruolo 'admin' NON è mai auto-assegnabile: chi prova a registrarsi come
-- admin diventa semplicemente 'buyer'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested text := coalesce(new.raw_user_meta_data ->> 'role', 'buyer');
begin
  insert into public.profiles (id, email, full_name, university, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'university', ''),
    case when requested in ('buyer', 'seller') then requested::public.user_role
         else 'buyer'::public.user_role end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Blocca l'escalation di privilegi: solo un admin può cambiare il campo role.
create or replace function public.guard_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_role_change();

-- L'acquisto deve costare esattamente il prezzo dell'appunto, l'appunto deve
-- essere approvato e non si compra da sé stessi.
create or replace function public.validate_purchase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  n public.notes;
begin
  select * into n from public.notes where id = new.note_id;
  if n is null then
    raise exception 'Appunto inesistente';
  end if;
  if n.status <> 'approved' then
    raise exception 'Appunto non disponibile all''acquisto';
  end if;
  if n.seller_id = new.buyer_id then
    raise exception 'Non puoi acquistare i tuoi stessi appunti';
  end if;
  new.amount_cents := n.price_cents;
  return new;
end;
$$;

drop trigger if exists purchases_validate on public.purchases;
create trigger purchases_validate
  before insert on public.purchases
  for each row execute function public.validate_purchase();

-- Promuove un utente esistente ad admin (da eseguire nel SQL Editor).
create or replace function public.promote_to_admin(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set role = 'admin'
  where lower(email) = lower(target_email);
  if not found then
    raise exception 'Nessun utente con email %', target_email;
  end if;
end;
$$;
revoke all on function public.promote_to_admin(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.notes     enable row level security;
alter table public.purchases enable row level security;

-- profiles -------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete using (public.is_admin());

-- notes ----------------------------------------------------------------------
-- Il catalogo pubblico mostra solo gli appunti approvati.
drop policy if exists notes_select_public on public.notes;
create policy notes_select_public on public.notes
  for select using (
    status = 'approved'
    or seller_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists notes_insert_seller on public.notes;
create policy notes_insert_seller on public.notes
  for insert with check (
    seller_id = auth.uid()
    and public.current_role() in ('seller', 'admin')
  );

drop policy if exists notes_update_owner on public.notes;
create policy notes_update_owner on public.notes
  for update using (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid() or public.is_admin());

drop policy if exists notes_delete_owner on public.notes;
create policy notes_delete_owner on public.notes
  for delete using (seller_id = auth.uid() or public.is_admin());

-- purchases ------------------------------------------------------------------
drop policy if exists purchases_select on public.purchases;
create policy purchases_select on public.purchases
  for select using (
    buyer_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.notes n
      where n.id = purchases.note_id and n.seller_id = auth.uid()
    )
  );

drop policy if exists purchases_insert on public.purchases;
create policy purchases_insert on public.purchases
  for insert with check (
    buyer_id = auth.uid()
    and public.current_role() in ('buyer', 'admin')
  );

drop policy if exists purchases_delete on public.purchases;
create policy purchases_delete on public.purchases
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4-bis. Vista pubblica dei venditori
-- Le policy su `profiles` sono chiuse (ognuno vede solo sé stesso), ma nel
-- catalogo serve mostrare nome e ateneo di chi vende. Questa vista espone
-- solo quei campi — mai l'email — ed è leggibile da tutti.
-- ---------------------------------------------------------------------------
create or replace view public.sellers_public
with (security_invoker = off) as
  select p.id, p.full_name, p.university
  from public.profiles p
  where p.role in ('seller', 'admin');

grant select on public.sellers_public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Storage: bucket privato "notes"
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('notes', 'notes', false)
on conflict (id) do nothing;

-- Il venditore carica solo dentro la cartella con il proprio uid: <uid>/file.pdf
drop policy if exists notes_upload on storage.objects;
create policy notes_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'notes'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.current_role() in ('seller', 'admin')
  );

drop policy if exists notes_owner_manage on storage.objects;
create policy notes_owner_manage on storage.objects
  for update to authenticated
  using (bucket_id = 'notes' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

drop policy if exists notes_owner_delete on storage.objects;
create policy notes_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'notes' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- Scarica chi ha comprato l'appunto, chi lo ha caricato, o un admin.
drop policy if exists notes_download on storage.objects;
create policy notes_download on storage.objects
  for select to authenticated
  using (
    bucket_id = 'notes'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or exists (
        select 1
        from public.purchases p
        join public.notes n on n.id = p.note_id
        where p.buyer_id = auth.uid()
          and n.file_path = storage.objects.name
      )
    )
  );
