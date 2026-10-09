-- TimeBank initial schema
-- Jalankan di Supabase SQL Editor atau melalui Supabase CLI.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text not null default 'Pemain',
  avatar_url text,
  created_at timestamptz not null default now(),
  constraint username_format check (username is null or username ~ '^[a-zA-Z0-9_]{3,24}$')
);

create table if not exists public.player_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  coin_balance bigint not null default 0 check (coin_balance >= 0),
  last_claim_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount bigint not null,
  reason text not null check (reason in ('offline_claim', 'purchase', 'achievement_reward', 'admin_adjustment')),
  reference_id text,
  created_at timestamptz not null default now()
);

create index if not exists coin_transactions_user_created_idx
  on public.coin_transactions(user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  chosen_username text;
begin
  chosen_username := lower(regexp_replace(split_part(coalesce(new.email, 'player'), '@', 1), '[^a-zA-Z0-9_]', '', 'g'));
  if length(chosen_username) < 3 then
    chosen_username := 'player_' || substr(new.id::text, 1, 8);
  end if;
  chosen_username := left(chosen_username, 15) || '_' || substr(new.id::text, 1, 6);

  insert into public.profiles (id, username, display_name)
  values (new.id, chosen_username, 'Pemain')
  on conflict (id) do nothing;

  insert into public.player_states (user_id, coin_balance, last_claim_at)
  values (new.id, 0, now())
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_timebank on auth.users;
create trigger on_auth_user_created_timebank
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Klaim atomik: mengunci state pemain, menghitung waktu dari jam database,
-- memperbarui saldo dan ledger dalam satu transaksi.
create or replace function public.claim_offline_coins()
returns table(coins_awarded bigint, new_balance bigint, next_claim_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  state_row public.player_states%rowtype;
  now_server timestamptz := clock_timestamp();
  elapsed_seconds bigint;
  minutes_to_award bigint;
  capped_seconds bigint;
  next_timestamp timestamptz;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
    into state_row
    from public.player_states
   where user_id = current_user_id
   for update;

  if not found then
    raise exception 'Player state not found';
  end if;

  elapsed_seconds := greatest(0, floor(extract(epoch from (now_server - state_row.last_claim_at)))::bigint);
  capped_seconds := least(elapsed_seconds, 43200);
  minutes_to_award := floor(capped_seconds / 60)::bigint;

  if minutes_to_award > 0 then
    update public.player_states
       set coin_balance = coin_balance + minutes_to_award,
           last_claim_at = case
             when elapsed_seconds >= 43200 then now_server
             else last_claim_at + make_interval(mins => minutes_to_award::int)
           end,
           updated_at = now_server
     where user_id = current_user_id
     returning coin_balance, last_claim_at into new_balance, next_timestamp;

    insert into public.coin_transactions(user_id, amount, reason)
    values (current_user_id, minutes_to_award, 'offline_claim');
  else
    new_balance := state_row.coin_balance;
    next_timestamp := state_row.last_claim_at;
  end if;

  coins_awarded := minutes_to_award;
  next_claim_at := next_timestamp;
  return next;
end;
$$;

revoke all on function public.claim_offline_coins() from public;
grant execute on function public.claim_offline_coins() to authenticated;

alter table public.profiles enable row level security;
alter table public.player_states enable row level security;
alter table public.coin_transactions enable row level security;

drop policy if exists "profiles readable by authenticated users" on public.profiles;
create policy "profiles readable by authenticated users"
  on public.profiles for select to authenticated using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "users read own player state" on public.player_states;
create policy "users read own player state"
  on public.player_states for select to authenticated using (auth.uid() = user_id);

drop policy if exists "users read own coin transactions" on public.coin_transactions;
create policy "users read own coin transactions"
  on public.coin_transactions for select to authenticated using (auth.uid() = user_id);

-- Tidak ada kebijakan INSERT/UPDATE langsung untuk player_states/coin_transactions.
-- Perubahan saldo hanya melalui fungsi server/database yang tervalidasi.
grant select on public.profiles, public.player_states, public.coin_transactions to authenticated;
grant update (username, display_name, avatar_url) on public.profiles to authenticated;
