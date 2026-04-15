-- Bookings for popup tasting slots (PII; no public table access)

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_start timestamptz not null,
  party_size int not null,
  coffee_choice text not null,
  name text not null,
  email text not null,
  phone text,
  notes text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  constraint bookings_party_size_chk check (party_size between 1 and 4),
  constraint bookings_status_chk check (status in ('confirmed', 'pending'))
);

create index if not exists bookings_slot_start_idx on public.bookings (slot_start);

alter table public.bookings enable row level security;

-- Aggregates only: slot_start + booked headcount (no PII)
create or replace function public.get_slot_booked_totals(
  p_range_start timestamptz,
  p_range_end timestamptz
)
returns table (slot_start timestamptz, booked integer)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.slot_start,
    coalesce(sum(b.party_size), 0)::integer as booked
  from public.bookings b
  where b.slot_start >= p_range_start
    and b.slot_start < p_range_end
    and b.status = 'confirmed'
  group by b.slot_start;
$$;

revoke all on function public.get_slot_booked_totals(timestamptz, timestamptz) from public;
grant execute on function public.get_slot_booked_totals(timestamptz, timestamptz) to anon;
grant execute on function public.get_slot_booked_totals(timestamptz, timestamptz) to authenticated;

-- Serialized insert with per-slot capacity (default 4; override from app)
create or replace function public.create_booking(
  p_slot_start timestamptz,
  p_party_size int,
  p_coffee_choice text,
  p_name text,
  p_email text,
  p_phone text,
  p_notes text,
  p_max_capacity int
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_sum int;
  v_cap int;
begin
  if p_party_size is null or p_party_size < 1 or p_party_size > 4 then
    raise exception 'invalid_party_size';
  end if;

  v_cap := coalesce(nullif(p_max_capacity, 0), 4);

  perform pg_advisory_xact_lock(hashtext(p_slot_start::text));

  select coalesce(sum(party_size), 0)
  into v_sum
  from public.bookings
  where slot_start = p_slot_start
    and status = 'confirmed';

  if v_sum + p_party_size > v_cap then
    raise exception 'slot_full';
  end if;

  insert into public.bookings (
    slot_start,
    party_size,
    coffee_choice,
    name,
    email,
    phone,
    notes,
    status
  )
  values (
    p_slot_start,
    p_party_size,
    p_coffee_choice,
    p_name,
    p_email,
    nullif(trim(p_phone), ''),
    nullif(trim(p_notes), ''),
    'confirmed'
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_booking(
  timestamptz,
  int,
  text,
  text,
  text,
  text,
  text,
  int
) from public;

grant execute on function public.create_booking(
  timestamptz,
  int,
  text,
  text,
  text,
  text,
  text,
  int
) to service_role;
