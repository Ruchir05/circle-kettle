-- Allow max_cups = 0 so a lot can be fully disabled (no bookings) while keeping the slug in the table.
-- EL CHAFEROTE is set to unavailable for the event until raised again from admin or SQL.

alter table public.coffee_cup_caps
  drop constraint if exists coffee_cup_caps_max_cups_check;

alter table public.coffee_cup_caps
  add constraint coffee_cup_caps_max_cups_check check (max_cups >= 0);

update public.coffee_cup_caps
set max_cups = 0
where coffee_slug = 'el-chaferote-7';
