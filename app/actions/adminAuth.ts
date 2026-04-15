"use server";

import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SEC,
  getAdminTokenSecret,
  signAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AdminLoginState = { ok: boolean; message: string };

const DEFAULT_ADMIN_USER = "coffee";
const DEFAULT_ADMIN_PASS = "coffee";

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();

  const expectedUser =
    process.env.ADMIN_DASHBOARD_USERNAME?.trim() || DEFAULT_ADMIN_USER;
  const expectedPass =
    process.env.ADMIN_DASHBOARD_PASSWORD?.trim() || DEFAULT_ADMIN_PASS;

  if (
    !verifyAdminPassword(username, expectedUser) ||
    !verifyAdminPassword(password, expectedPass)
  ) {
    return { ok: false, message: "Invalid username or password." };
  }

  const secret = getAdminTokenSecret();

  const token = await signAdminSessionToken(secret);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  });

  const dest = next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";
  redirect(dest);
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}
