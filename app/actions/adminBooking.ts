"use server";

import {
  ADMIN_COOKIE_NAME,
  getAdminTokenSecret,
  verifyAdminSessionToken,
} from "@/lib/admin/token";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function assertAdminSession(): Promise<{ ok: false; error: string } | { ok: true }> {
  const secret = getAdminTokenSecret();
  if (!secret) return { ok: false, error: "Admin session is not configured." };
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !(await verifyAdminSessionToken(token, secret))) {
    return { ok: false, error: "Unauthorized." };
  }
  return { ok: true };
}

export type DeleteBookingResult = { ok: true } | { ok: false; error: string };

/** Deletes a row from `bookings` (service role). Caller must be an authenticated admin. */
export async function deleteBookingById(bookingId: string): Promise<DeleteBookingResult> {
  const auth = await assertAdminSession();
  if (!auth.ok) return { ok: false, error: auth.error };

  const id = bookingId.trim();
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid booking id." };

  const client = createServiceClient();
  if (!client) return { ok: false, error: "Supabase is not configured on the server." };

  const { data, error } = await client.from("bookings").delete().eq("id", id).select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "No booking matched that id (it may already be deleted)." };

  revalidatePath("/admin");
  revalidatePath("/book");

  return { ok: true };
}
