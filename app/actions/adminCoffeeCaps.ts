"use server";

import {
  ADMIN_COOKIE_NAME,
  getAdminTokenSecret,
  verifyAdminSessionToken,
} from "@/lib/admin/token";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const SLUG_RE = /^[a-z0-9-]{1,80}$/;

async function assertAdminSession(): Promise<{ ok: false; error: string } | { ok: true }> {
  const secret = getAdminTokenSecret();
  if (!secret) return { ok: false, error: "Admin session is not configured." };
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !(await verifyAdminSessionToken(token, secret))) {
    return { ok: false, error: "Unauthorized." };
  }
  return { ok: true };
}

export type UpdateCoffeeCapResult = { ok: true } | { ok: false; error: string };

/** Updates `coffee_cup_caps.max_cups` (0 = no new bookings for that lot). Admin session required. */
export async function updateCoffeeCupMax(
  coffeeSlug: string,
  maxCupsRaw: number | string,
): Promise<UpdateCoffeeCapResult> {
  const auth = await assertAdminSession();
  if (!auth.ok) return { ok: false, error: auth.error };

  const slug = coffeeSlug.trim();
  if (!SLUG_RE.test(slug)) return { ok: false, error: "Invalid coffee slug." };

  const maxCups =
    typeof maxCupsRaw === "number" ? maxCupsRaw : Number.parseInt(String(maxCupsRaw).trim(), 10);
  if (!Number.isInteger(maxCups) || maxCups < 0 || maxCups > 99_999) {
    return { ok: false, error: "Max cups must be an integer between 0 and 99999." };
  }

  const client = createServiceClient();
  if (!client) return { ok: false, error: "Supabase is not configured on the server." };

  const { data, error } = await client
    .from("coffee_cup_caps")
    .update({ max_cups: maxCups })
    .eq("coffee_slug", slug)
    .select("coffee_slug");

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "That coffee is not in the cup caps table." };

  revalidatePath("/admin");
  revalidatePath("/book");
  revalidatePath("/");

  return { ok: true };
}
