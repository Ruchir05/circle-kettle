export type AdminBookingRow = {
  id: string;
  slot_start: string;
  party_size: number;
  coffee_choice: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  guest_name_2?: string | null;
  guest_name_3?: string | null;
  guest_name_4?: string | null;
};

export type AdminSlotOption = { value: string; label: string };

export type AdminCoffeeOption = { slug: string; label: string };
