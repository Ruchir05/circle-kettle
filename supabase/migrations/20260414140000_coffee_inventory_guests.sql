-- Per-coffee cup caps (event totals), guest names for multi-person parties,
-- one confirmed booking per email, and inventory checks inside create_booking.

-- Caps for the three popup lots (slugs match `data/coffees.json`).
create table if not exists public.coffee_cup_caps (
  coffee_slug text primary key,
  max_cups int not null check (max_cups > 0)
);

insert into public.coffee_cup_caps (coffee_slug, max_cups) values
  ('wilder-lazo-7', 14),
  ('flower-touch-7', 6),
  ('el-chaferote-7', 20)
on conflict (coffee_slug) do update set max_cups = excluded.max_cups;

alter table public.coffee_cup_caps enable row level security;

-- No direct table API access; caps are read via security definer functions.

alter table public.bookings
  add column if not exists guest_name_2 text,
  add column if not exists guest_name_3 text,
  add column if not exists guest_name_4 text;

-- How many cups of each slug this booking consumes (for JSON multi-select or legacy slug).
create or replace function public.booking_coffee_line_items(
  p_party_size int,
  p_coffee_choice text
)
returns table (coffee_slug text, qty int)
language plpgsql
immutable
security invoker
set search_path = public
as $$
declare
  j jsonb;
  elem jsonb;
  t text;
begin
  t := nullif(trim(p_coffee_choice), '');
  if t is null then
    return;
  end if;

  if lower(t) = 'unsure' then
    return;
  end if;

  begin
    j := t::jsonb;
  exception when others then
    coffee_slug := t;
    qty := greatest(1, least(coalesce(p_party_size, 1), 4));
    return next;
    return;
  end;

  if coalesce(j->>'unsure', '') = 'true' then
    return;
  end if;

  if j ? 'items' and jsonb_typeof(j->'items') = 'array' then
    for elem in select * from jsonb_array_elements(j->'items')
    loop
      coffee_slug := nullif(trim(elem->>'slug'), '');
      qty := (elem->>'qty')::int;
      if coffee_slug is not null and qty is not null and qty > 0 then
        qty := least(qty, 4);
        return next;
      end if;
    end loop;
  end if;
end;
$$;

revoke all on function public.booking_coffee_line_items(int, text) from public;
grant execute on function public.booking_coffee_line_items(int, text) to anon;
grant execute on function public.booking_coffee_line_items(int, text) to authenticated;

-- Public aggregate for UI (no PII).
create or replace function public.get_coffee_cup_availability()
returns table (coffee_slug text, max_cups int, booked int, remaining int)
language sql
stable
security definer
set search_path = public
as $$
  with booked as (
    select
      li.coffee_slug,
      sum(li.qty)::int as n
    from public.bookings b
    cross join lateral public.booking_coffee_line_items(b.party_size, b.coffee_choice) li
    where b.status = 'confirmed'
    group by li.coffee_slug
  )
  select
    c.coffee_slug,
    c.max_cups,
    coalesce(b.n, 0)::int as booked,
    greatest(c.max_cups - coalesce(b.n, 0), 0)::int as remaining
  from public.coffee_cup_caps c
  left join booked b on b.coffee_slug = c.coffee_slug
  order by c.coffee_slug;
$$;

revoke all on function public.get_coffee_cup_availability() from public;
grant execute on function public.get_coffee_cup_availability() to anon;
grant execute on function public.get_coffee_cup_availability() to authenticated;

drop function if exists public.create_booking(
  timestamptz,
  int,
  text,
  text,
  text,
  text,
  text,
  int
);

create or replace function public.create_booking(
  p_slot_start timestamptz,
  p_party_size int,
  p_coffee_choice text,
  p_name text,
  p_email text,
  p_phone text,
  p_notes text,
  p_max_capacity int,
  p_guest_name_2 text default null,
  p_guest_name_3 text default null,
  p_guest_name_4 text default null
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
  v_email text := lower(trim(p_email));
  v_g2 text := nullif(trim(coalesce(p_guest_name_2, '')), '');
  v_g3 text := nullif(trim(coalesce(p_guest_name_3, '')), '');
  v_g4 text := nullif(trim(coalesce(p_guest_name_4, '')), '');
  v_line record;
  v_booked int;
  v_max_cups int;
begin
  if p_party_size is null or p_party_size < 1 or p_party_size > 4 then
    raise exception 'invalid_party_size';
  end if;

  if p_party_size = 2 and v_g2 is null then
    raise exception 'guest_names_required';
  elsif p_party_size = 3 and (v_g2 is null or v_g3 is null) then
    raise exception 'guest_names_required';
  elsif p_party_size = 4 and (v_g2 is null or v_g3 is null or v_g4 is null) then
    raise exception 'guest_names_required';
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

  if exists (
    select 1
    from public.bookings b
    where b.status = 'confirmed'
      and lower(trim(b.email)) = v_email
  ) then
    raise exception 'already_booked';
  end if;

  for v_line in
    select li.coffee_slug, li.qty
    from public.booking_coffee_line_items(p_party_size, p_coffee_choice) li
    order by li.coffee_slug
  loop
    perform pg_advisory_xact_lock(hashtext('coffee_inv:' || v_line.coffee_slug));

    select c.max_cups
    into v_max_cups
    from public.coffee_cup_caps c
    where c.coffee_slug = v_line.coffee_slug;

    if v_max_cups is null then
      raise exception 'unknown_coffee_slug';
    end if;

    select coalesce(sum(li.qty), 0)::int
    into v_booked
    from public.bookings b
    cross join lateral public.booking_coffee_line_items(b.party_size, b.coffee_choice) li
    where b.status = 'confirmed'
      and li.coffee_slug = v_line.coffee_slug;

    if v_booked + v_line.qty > v_max_cups then
      raise exception 'coffee_sold_out';
    end if;
  end loop;

  insert into public.bookings (
    slot_start,
    party_size,
    coffee_choice,
    name,
    email,
    phone,
    notes,
    status,
    guest_name_2,
    guest_name_3,
    guest_name_4
  )
  values (
    p_slot_start,
    p_party_size,
    p_coffee_choice,
    nullif(trim(p_name), ''),
    nullif(trim(p_email), ''),
    nullif(trim(coalesce(p_phone, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    'confirmed',
    case when p_party_size >= 2 then v_g2 else null end,
    case when p_party_size >= 3 then v_g3 else null end,
    case when p_party_size >= 4 then v_g4 else null end
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
  int,
  text,
  text,
  text
) from public;

grant execute on function public.create_booking(
  timestamptz,
  int,
  text,
  text,
  text,
  text,
  text,
  int,
  text,
  text,
  text
) to service_role;