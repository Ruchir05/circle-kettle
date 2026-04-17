-- Raise tasting cup caps to 15 for KUMBYA and NGUISSE NARE.

insert into public.coffee_cup_caps (coffee_slug, max_cups) values
  ('nguisse-nare-7', 15),
  ('kumbya-7', 15)
on conflict (coffee_slug) do update set max_cups = excluded.max_cups;
